import { COLS } from '../../shared/games/connect4.js'

export default function Connect4({ state, play, disabled, result }) {
  const line = result?.line ?? []
  return (
    <div className={`c4 ${line.length ? 'over' : ''}`}>
      {state.board.map((cell, i) => {
        const col = i % COLS
        return (
          <button
            key={i}
            className={`slot ${line.includes(i) ? 'win' : ''}`}
            disabled={disabled || state.board[col] !== null}
            onClick={() => play(col)}
            aria-label={`Coluna ${col + 1}`}
          >
            {cell && <span className={`disc ${cell}`} />}
          </button>
        )
      })}
    </div>
  )
}
