// Tabuleiro 4x4, vence quem alinhar 3 (horizontal, vertical ou diagonal).
export const SIZE = 4
export const WIN = 3

const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]]
export const LINES = []
for (let r = 0; r < SIZE; r++)
  for (let c = 0; c < SIZE; c++)
    for (const [dr, dc] of DIRS) {
      const er = r + dr * (WIN - 1), ec = c + dc * (WIN - 1)
      if (er < 0 || er >= SIZE || ec < 0 || ec >= SIZE) continue
      LINES.push(Array.from({ length: WIN }, (_, i) => (r + dr * i) * SIZE + c + dc * i))
    }

export const emptyBoard = () => Array(SIZE * SIZE).fill(null)

// -> { winner: 'X' | 'O' | 'draw', line: number[] } ou null se o jogo continua
export function getResult(board) {
  for (const line of LINES) {
    const v = board[line[0]]
    if (v && line.every(i => board[i] === v)) return { winner: v, line }
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null
}
