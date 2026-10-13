import express from 'express'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Server } from 'socket.io'
import { emptyBoard, getResult } from '../shared/game.js'

const PORT = process.env.PORT || 3003
const ROOM_TTL = 10 * 60 * 1000 // sala sem ninguém online por 10min é apagada
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
// front em outro domínio (Vercel): CORS_ORIGIN=https://app.vercel.app,https://outro.com
const ORIGINS = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? []

const app = express()
const http = createServer(app)
const io = new Server(http, { cors: { origin: ORIGINS } })

// GET/POST sem headers customizados são "simple requests": não há preflight, só esse header basta
app.use((req, res, next) => {
  if (ORIGINS.includes(req.headers.origin)) res.set({ 'Access-Control-Allow-Origin': req.headers.origin, Vary: 'Origin' })
  next()
})
// ponytail: salas em memória, somem ao reiniciar o servidor; Redis se precisar persistir/escalar
const rooms = new Map()

const newCode = () => {
  let code
  do code = Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
  while (rooms.has(code))
  return code
}

const publicState = r => ({
  code: r.code,
  board: r.board,
  turn: r.turn,
  starter: r.starter,
  result: r.result,
  scores: r.scores,
  players: { X: r.seats.X && { online: r.seats.X.online }, O: r.seats.O && { online: r.seats.O.online } },
})
const broadcast = r => io.to(r.code).emit('state', publicState(r))

app.post('/api/rooms', (req, res) => {
  const code = newCode()
  rooms.set(code, {
    code, board: emptyBoard(), turn: 'X', starter: 'X', result: null,
    scores: { X: 0, O: 0, draw: 0 }, seats: { X: null, O: null }, touched: Date.now(),
  })
  res.status(201).json({ code })
})

app.get('/api/rooms/:code', (req, res) => {
  const r = rooms.get(req.params.code.toUpperCase())
  if (!r) return res.status(404).json({ error: 'Sala não encontrada' })
  res.json(publicState(r))
})

app.get('/api/stats', (req, res) => res.json({ rooms: rooms.size, online: io.engine.clientsCount }))

// produção: serve o build do Vite
const dist = fileURLToPath(new URL('../dist', import.meta.url))
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.use((req, res) => res.sendFile('index.html', { root: dist }))
}

io.on('connection', socket => {
  socket.on('join', ({ code, playerId } = {}, ack) => {
    if (typeof ack !== 'function') return
    if (typeof playerId !== 'string' || playerId.length > 64) return ack({ error: 'Jogador inválido' })
    const r = rooms.get(String(code).toUpperCase())
    if (!r) return ack({ error: 'Sala não encontrada' })
    // reconexão: mesmo playerId recupera o mesmo lugar
    const symbol = ['X', 'O'].find(s => r.seats[s]?.id === playerId) ?? ['X', 'O'].find(s => !r.seats[s])
    if (!symbol) return ack({ error: 'Sala cheia' })
    r.seats[symbol] = { id: playerId, online: true, socketId: socket.id }
    r.touched = Date.now()
    socket.data = { code: r.code, symbol }
    socket.join(r.code)
    ack({ symbol })
    broadcast(r)
  })

  socket.on('move', index => {
    const r = rooms.get(socket.data.code)
    const { symbol } = socket.data
    if (!r || r.result || r.turn !== symbol || !r.seats.X || !r.seats.O) return
    if (!Number.isInteger(index) || r.board[index] !== null) return
    r.board[index] = symbol
    r.result = getResult(r.board)
    if (r.result) r.scores[r.result.winner]++
    else r.turn = symbol === 'X' ? 'O' : 'X'
    r.touched = Date.now()
    broadcast(r)
  })

  socket.on('rematch', () => {
    const r = rooms.get(socket.data.code)
    if (!r?.result) return
    r.starter = r.starter === 'X' ? 'O' : 'X' // alterna quem começa
    Object.assign(r, { board: emptyBoard(), turn: r.starter, result: null, touched: Date.now() })
    broadcast(r)
  })

  socket.on('disconnect', () => {
    const r = rooms.get(socket.data.code)
    const seat = r?.seats[socket.data.symbol]
    // só marca offline se esse socket ainda é o dono do lugar (reconexão pode ter chegado antes)
    if (!seat || seat.socketId !== socket.id) return
    seat.online = false
    r.touched = Date.now()
    broadcast(r)
  })
})

setInterval(() => {
  for (const [code, r] of rooms)
    if (!r.seats.X?.online && !r.seats.O?.online && Date.now() - r.touched > ROOM_TTL) rooms.delete(code)
}, 60 * 1000)

http.on('error', err => {
  if (err.code !== 'EADDRINUSE') throw err
  console.error(`Porta ${PORT} já está em uso (outro servidor rodando?). Feche-o ou use PORT=3002 — e ajuste o proxy no vite.config.js.`)
  process.exit(1)
})
http.listen(PORT,() => console.log(`API em http://localhost:${PORT}`))
