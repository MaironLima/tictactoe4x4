import { other } from './util.js'

// Damas brasileiras: 8x8, captura obrigatória, peça simples captura pra trás, dama voa.
// Peças: 'x'/'o' simples, 'X'/'O' damas. X começa embaixo e sobe.
export const N = 8
const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const DRAW_AFTER = 40 // lances seguidos só de damas, sem captura

const owner = c => c?.toUpperCase()
const isKing = c => c === 'X' || c === 'O'
const forward = p => (p === 'X' ? -1 : 1)
const at = (r, c) => (r >= 0 && r < N && c >= 0 && c < N ? r * N + c : -1)

function captures(board, i) {
  const piece = board[i], out = []
  for (const [dr, dc] of DIRS) {
    let r = Math.floor(i / N) + dr, c = (i % N) + dc
    if (isKing(piece)) while (board[at(r, c)] === null) (r += dr), (c += dc)
    const cap = at(r, c)
    if (cap < 0 || !board[cap] || owner(board[cap]) === owner(piece)) continue
    r += dr, c += dc
    while (board[at(r, c)] === null) {
      out.push({ from: i, to: at(r, c), cap })
      if (!isKing(piece)) break
      r += dr, c += dc
    }
  }
  return out
}

function steps(board, i) {
  const piece = board[i], out = []
  for (const [dr, dc] of DIRS) {
    if (!isKing(piece) && dr !== forward(owner(piece))) continue
    let r = Math.floor(i / N) + dr, c = (i % N) + dc
    while (board[at(r, c)] === null) {
      out.push({ from: i, to: at(r, c) })
      if (!isKing(piece)) break
      r += dr, c += dc
    }
  }
  return out
}

// ponytail: captura obrigatória, mas sem a "lei da maioria" (pegar o máximo de peças) e
// a peça capturada sai na hora (não no fim da sequência); implementar se jogadores reclamarem
export function legalMoves(s) {
  if (s.chain !== null) return captures(s.board, s.chain)
  const mine = s.board.flatMap((c, i) => (owner(c) === s.turn ? [i] : []))
  const caps = mine.flatMap(i => captures(s.board, i))
  return caps.length ? caps : mine.flatMap(i => steps(s.board, i))
}

export default {
  id: 'checkers',
  name: 'Damas',
  emoji: '⚪',
  rules: 'Captura obrigatória, simples captura pra trás, dama anda longe.',
  local: true,
  glyph: { X: '●', O: '●' },
  init(starter) {
    const board = Array.from({ length: N * N }, (_, i) => {
      const r = Math.floor(i / N)
      if ((r + (i % N)) % 2 === 0) return null
      return r < 3 ? 'o' : r > 4 ? 'x' : null
    })
    return { board, turn: starter, chain: null, quiet: 0 }
  },
  move(s, p, m) {
    if (s.turn !== p) return null
    const mv = legalMoves(s).find(x => x.from === m?.from && x.to === m?.to)
    if (!mv) return null
    const board = [...s.board]
    const piece = board[mv.from]
    board[mv.to] = piece
    board[mv.from] = null
    if (mv.cap !== undefined) {
      board[mv.cap] = null
      // sequência de capturas: mesma peça continua, sem passar a vez
      if (captures(board, mv.to).length) return { ...s, board, chain: mv.to, quiet: 0 }
    }
    if (!isKing(piece) && Math.floor(mv.to / N) === (p === 'X' ? 0 : N - 1)) board[mv.to] = p
    const quiet = mv.cap !== undefined || !isKing(piece) ? 0 : s.quiet + 1
    return { board, turn: other(p), chain: null, quiet }
  },
  result(s) {
    if (!legalMoves(s).length) return { winner: other(s.turn) } // sem peças ou travado
    if (s.quiet >= DRAW_AFTER) return { winner: 'draw' }
    return null
  },
}
