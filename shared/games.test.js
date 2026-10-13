import assert from 'node:assert/strict'
import { GAMES } from './games/index.js'
import { legalMoves } from './games/checkers.js'
import { randomFleet, validFleet } from './games/battleship.js'

const play = (g, s, moves) => moves.reduce((st, [p, m]) => { const n = g.move(st, p, m); assert.ok(n, `jogada inválida ${p} ${JSON.stringify(m)}`); return n }, s)

// Velha 4x4: 3 não basta, precisa 4
{
  const g = GAMES.ttt
  let s = play(g, g.init('X'), [['X', 0], ['O', 4], ['X', 1], ['O', 5], ['X', 2]])
  assert.equal(g.result(s), null)
  assert.equal(g.move(s, 'X', 3), null, 'fora da vez')
  s = play(g, s, [['O', 6], ['X', 3]])
  assert.deepEqual(g.result(s), { winner: 'X', line: [0, 1, 2, 3] })
  const d = play(g, g.init('X'), [['X', 3], ['O', 0], ['X', 6], ['O', 1], ['X', 9], ['O', 2], ['X', 12]])
  assert.equal(g.result(d).winner, 'X', 'anti-diagonal')
}

// Ligue 4: peça cai, coluna cheia é recusada, vertical vence
{
  const g = GAMES.c4
  let s = play(g, g.init('X'), [['X', 3], ['O', 3]])
  assert.equal(s.board[35 + 3], 'X')
  assert.equal(s.board[28 + 3], 'O')
  s = play(g, g.init('X'), [['X', 0], ['O', 1], ['X', 0], ['O', 1], ['X', 0], ['O', 1], ['X', 0]])
  assert.equal(g.result(s).winner, 'X')
  let full = g.init('X')
  for (let k = 0; k < 6; k++) full = g.move(full, full.turn, 6)
  assert.equal(g.move(full, full.turn, 6), null)
}

// Damas
{
  const g = GAMES.checkers
  const s0 = g.init('X')
  assert.equal(legalMoves(s0).length, 7, '7 lances iniciais')
  assert.equal(s0.board.filter(c => c === 'x').length, 12)

  // captura obrigatória + sequência mantém a vez
  const board = Array(64).fill(null)
  board[42] = 'x' // (5,2)
  board[35] = 'o' // (4,3)
  board[19] = 'o' // (2,3) -> segunda captura saindo de (3,4)
  board[0 * 8 + 7] = 'o' // peça solta pro O não ficar sem peças
  const s = { board, turn: 'X', chain: null, quiet: 0 }
  assert.ok(legalMoves(s).every(m => m.cap !== undefined), 'só capturas')
  const s1 = g.move(s, 'X', { from: 42, to: 28 })
  assert.equal(s1.turn, 'X')
  assert.equal(s1.chain, 28)
  assert.equal(g.move(s1, 'X', { from: 7, to: 14 }), null, 'durante a sequência só a mesma peça')
  const s2 = g.move(s1, 'X', { from: 28, to: 10 })
  assert.equal(s2.turn, 'O')
  assert.equal(s2.board.filter(c => c?.toUpperCase() === 'O').length, 1)

  // promoção e dama voadora
  const b = Array(64).fill(null)
  b[10] = 'x' // (1,2)
  b[63] = 'o'
  const p = g.move({ board: b, turn: 'X', chain: null, quiet: 0 }, 'X', { from: 10, to: 1 })
  assert.equal(p.board[1], 'X')
  const k = g.move({ ...p, turn: 'X' }, 'X', { from: 1, to: 1 + 9 * 5 }) // (0,1) -> (5,6)
  assert.equal(k.board[46], 'X')

  // sem lances = derrota
  assert.deepEqual(g.result({ board: Array(64).fill(null).with(5, 'x'), turn: 'O', chain: null, quiet: 0 }), { winner: 'X' })
}

// Batalha naval
{
  const g = GAMES.battleship
  for (let k = 0; k < 50; k++) assert.ok(validFleet(randomFleet()))
  assert.equal(validFleet([[0, 1, 2, 3, 4], [10, 11, 12, 13], [20, 21, 22], [30, 31, 32], [0, 1]]), false, 'sobreposição')
  assert.equal(validFleet([[8, 9, 10, 11, 12], [20, 21, 22, 23], [30, 31, 32], [40, 41, 42], [50, 51]]), false, 'quebra de linha')
  const fx = [[0, 1, 2, 3, 4], [10, 11, 12, 13], [20, 21, 22], [30, 31, 32], [40, 41]]
  let s = play(g, g.init('O'), [['X', { type: 'place', ships: fx }], ['O', { type: 'place', ships: randomFleet() }]])
  assert.equal(s.phase, 'play')
  assert.equal(s.turn, 'O')
  assert.equal(g.view(s, 'O').ships.X.length, 0, 'navios do oponente escondidos')
  const cells = fx.flat()
  const free = [...Array(100).keys()].filter(i => !s.ships.X.flat().includes(i))
  for (const [n, i] of cells.entries()) {
    s = play(g, s, [['O', { type: 'fire', i }], ['X', { type: 'fire', i: free[n] }]])
    if (n === 4) assert.equal(g.view(s, 'O').ships.X.length, 1, 'navio afundado aparece')
  }
  assert.equal(g.result(s).winner, 'O')
}

// Pedra, papel e tesoura
{
  const g = GAMES.rps
  let s = play(g, g.init(), [['X', 'pedra']])
  assert.equal(g.view(s, 'O').picks.X, '?')
  assert.equal(g.move(s, 'X', 'papel'), null, 'não troca a escolha')
  assert.equal(g.move(s, 'O', 'toString'), null)
  s = play(g, s, [['O', 'tesoura'], ['X', 'papel'], ['O', 'papel']])
  assert.equal(s.rounds.at(-1).winner, 'draw')
  assert.equal(g.result(s), null)
  s = play(g, s, [['X', 'tesoura'], ['O', 'papel']])
  assert.deepEqual(g.result(s), { winner: 'X' })
}

console.log('ok')
