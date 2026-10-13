export const other = p => (p === 'X' ? 'O' : 'X')

// todas as sequências de n casas (horizontal, vertical, 2 diagonais) num grid rows x cols
export function makeLines(rows, cols, n) {
  const lines = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const er = r + dr * (n - 1), ec = c + dc * (n - 1)
        if (er < 0 || er >= rows || ec < 0 || ec >= cols) continue
        lines.push(Array.from({ length: n }, (_, i) => (r + dr * i) * cols + c + dc * i))
      }
  return lines
}

export function findLine(board, lines) {
  for (const line of lines) {
    const v = board[line[0]]
    if (v && line.every(i => board[i] === v)) return { winner: v, line }
  }
  return null
}
