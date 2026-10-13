import { findLine, makeLines, other } from './util.js'

export const SIZE = 4
const LINES = makeLines(SIZE, SIZE, 4)

export default {
  id: 'ttt',
  name: 'Velha 4x4',
  emoji: '#️⃣',
  rules: 'Alinhe 4 na horizontal, vertical ou diagonal.',
  local: true,
  glyph: { X: 'X', O: 'O' },
  init: starter => ({ board: Array(SIZE * SIZE).fill(null), turn: starter }),
  move(s, p, i) {
    if (s.turn !== p || !Number.isInteger(i) || s.board[i] !== null) return null
    return { board: s.board.with(i, p), turn: other(p) }
  },
  result: s => findLine(s.board, LINES) ?? (s.board.every(Boolean) ? { winner: 'draw' } : null),
}
