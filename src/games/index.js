import TTT from './TTT'
import Connect4 from './Connect4'
import Checkers from './Checkers'
import Battleship from './Battleship'
import RPS from './RPS'

// props de todos: { state, me, play(jogada), disabled, result, flip }
export const VIEWS = { ttt: TTT, c4: Connect4, checkers: Checkers, battleship: Battleship, rps: RPS }
