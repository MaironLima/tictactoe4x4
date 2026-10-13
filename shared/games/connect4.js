import { findLine, makeLines, other } from './util.js'

export const COLS = 7
export const ROWS = 6
const LINES = makeLines(ROWS, COLS, 4)

export default {
  id: 'c4',
  name: 'Ligue 4',
  emoji: '🔴',
  rules: 'Solte as peças nas colunas e ligue 4 em linha.',
  local: true,
  glyph: { X: '●', O: '●' },
  init: starter => ({ board: Array(ROWS * COLS).fill(null), turn: starter }),
  // jogada = coluna; a peça cai na casa vazia mais baixa
  move(s, p, col) {
    if (s.turn !== p || !Number.isInteger(col) || col < 0 || col >= COLS) return null
    let i = (ROWS - 1) * COLS + col
    while (i >= 0 && s.board[i] !== null) i -= COLS
    if (i < 0) return null
    return { board: s.board.with(i, p), turn: other(p) }
  },
  result: s => findLine(s.board, LINES) ?? (s.board.every(Boolean) ? { winner: 'draw' } : null),
}
