import { other } from './util.js'

export const N = 10
export const FLEET = [5, 4, 3, 3, 2]

export function randomFleet() {
  const ships = [], used = new Set()
  for (const len of FLEET)
    for (;;) {
      const horiz = Math.random() < 0.5
      const r = Math.floor(Math.random() * (horiz ? N : N - len + 1))
      const c = Math.floor(Math.random() * (horiz ? N - len + 1 : N))
      const cells = Array.from({ length: len }, (_, k) => (horiz ? r * N + c + k : (r + k) * N + c))
      if (cells.some(i => used.has(i))) continue
      cells.forEach(i => used.add(i))
      ships.push(cells)
      break
    }
  return ships
}

// frota vem do cliente: valida tamanhos, linha reta, dentro do mar e sem sobreposição
export function validFleet(ships) {
  if (!Array.isArray(ships) || ships.length !== FLEET.length) return false
  const lens = ships.map(s => (Array.isArray(s) ? s.length : 0)).sort()
  if (lens.join() !== [...FLEET].sort().join()) return false
  const used = new Set()
  for (const ship of ships) {
    const s = [...ship].sort((a, b) => a - b)
    if (!s.every(i => Number.isInteger(i) && i >= 0 && i < N * N && !used.has(i))) return false
    const horiz = s.every((v, k) => v === s[0] + k) && Math.floor(s[0] / N) === Math.floor(s.at(-1) / N)
    const vert = s.every((v, k) => v === s[0] + k * N)
    if (!horiz && !vert) return false
    s.forEach(i => used.add(i))
  }
  return true
}

const sunk = (ship, shots) => ship.every(i => shots[i])

export default {
  id: 'battleship',
  name: 'Batalha Naval',
  emoji: '🚢',
  rules: 'Posicione a frota e afunde todos os navios do oponente.',
  local: false, // informação escondida: não dá pra jogar no mesmo aparelho
  glyph: { X: '●', O: '●' },
  // shots[p] = { casa: acertou? } dos tiros que p deu
  init: starter => ({ phase: 'place', ships: { X: null, O: null }, shots: { X: {}, O: {} }, turn: null, starter }),
  move(s, p, m) {
    if (m?.type === 'place') {
      if (s.phase !== 'place' || s.ships[p] || !validFleet(m.ships)) return null
      const ships = { ...s.ships, [p]: m.ships.map(x => [...x]) }
      const ready = ships.X && ships.O
      return { ...s, ships, phase: ready ? 'play' : 'place', turn: ready ? s.starter : null }
    }
    if (m?.type === 'fire') {
      const { i } = m
      if (s.phase !== 'play' || s.turn !== p || !Number.isInteger(i) || i < 0 || i >= N * N || i in s.shots[p]) return null
      const hit = s.ships[other(p)].some(ship => ship.includes(i))
      return { ...s, shots: { ...s.shots, [p]: { ...s.shots[p], [i]: hit } }, turn: other(p) }
    }
    return null
  },
  result(s) {
    if (s.phase !== 'play') return null
    for (const p of ['X', 'O']) if (s.ships[other(p)].every(ship => sunk(ship, s.shots[p]))) return { winner: p }
    return null
  },
  // do oponente só aparecem os navios já afundados (null = ainda não posicionou)
  view(s, me) {
    const opp = other(me)
    return { ...s, ships: { [me]: s.ships[me], [opp]: s.ships[opp] && s.ships[opp].filter(ship => sunk(ship, s.shots[me])) } }
  },
}
