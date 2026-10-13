import ttt from './ttt.js'
import connect4 from './connect4.js'
import checkers from './checkers.js'
import battleship from './battleship.js'
import rps from './rps.js'

// interface de cada jogo:
//   init(starter) -> estado | move(estado, 'X'|'O', jogada) -> novo estado ou null (inválida)
//   result(estado) -> null | { winner: 'X'|'O'|'draw', line? } | view?(estado, eu) -> o que eu posso ver
export const GAMES = Object.fromEntries([ttt, connect4, checkers, battleship, rps].map(g => [g.id, g]))
