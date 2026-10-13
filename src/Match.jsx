import { GAMES } from '../shared/games/index.js'
import { VIEWS } from './games'
import { GamePicker, Scores, Status } from './ui'

// partida de qualquer jogo; usado pelo modo local (me = undefined) e pela sala online
export default function Match({ game, state, result, moves, scores, starter, me, play, disabled, flip, onNext, onlyLocal }) {
  const g = GAMES[game]
  const View = VIEWS[game]
  return (
    <div className="stack">
      <h2 className="game-title">{g.emoji} {g.name}</h2>
      <Scores game={game} scores={scores} turn={state.turn} starter={starter} result={result} me={me} />
      <Status game={game} result={result} turn={state.turn} me={me} fresh={moves === 0} />
      <View
        key={game}
        state={state}
        me={me ?? state.turn}
        play={play}
        disabled={disabled || !!result}
        result={result}
        flip={flip}
      />
      {result && (
        <>
          <button className="btn primary" onClick={() => onNext(game)}>Jogar de novo</button>
          <GamePicker current={game} onPick={onNext} onlyLocal={onlyLocal} />
        </>
      )}
    </div>
  )
}
