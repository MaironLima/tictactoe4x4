import { other } from './util.js'

export const BEATS = { pedra: 'tesoura', papel: 'pedra', tesoura: 'papel' }
export const WINS = 2 // melhor de 3 (empates não contam)

const wins = (s, p) => s.rounds.filter(r => r.winner === p).length

export default {
  id: 'rps',
  name: 'Pedra, Papel e Tesoura',
  emoji: '✊',
  rules: 'Os dois escolhem ao mesmo tempo. Melhor de 3.',
  local: false, // escolha simultânea e secreta
  glyph: { X: '●', O: '●' },
  init: () => ({ picks: { X: null, O: null }, rounds: [], turn: null }),
  move(s, p, pick) {
    if (!Object.hasOwn(BEATS, pick) || s.picks[p]) return null
    const picks = { ...s.picks, [p]: pick }
    if (!picks.X || !picks.O) return { ...s, picks }
    const winner = picks.X === picks.O ? 'draw' : BEATS[picks.X] === picks.O ? 'X' : 'O'
    return { ...s, picks: { X: null, O: null }, rounds: [...s.rounds, { ...picks, winner }] }
  },
  result(s) {
    for (const p of ['X', 'O']) if (wins(s, p) >= WINS) return { winner: p }
    return null
  },
  // esconde a escolha do oponente até os dois jogarem
  view: (s, me) => ({ ...s, picks: { [me]: s.picks[me], [other(me)]: s.picks[other(me)] && '?' } }),
}
