import { SIZE } from '../../shared/games/ttt.js'

// centro da casa i no viewBox 0..SIZE
const center = i => [(i % SIZE) + 0.5, Math.floor(i / SIZE) + 0.5]

export default function TTT({ state, play, disabled, result }) {
  const line = result?.line ?? []
  const winner = line.length ? state.board[line[0]] : null
  const [x1, y1] = center(line[0] ?? 0)
  const [x2, y2] = center(line.at(-1) ?? 0)
  const dx = (x2 - x1) * 0.15, dy = (y2 - y1) * 0.15 // risco passa um pouco das pontas

  return (
    <div className={`board ${winner ? 'over' : ''}`}>
      {state.board.map((cell, i) => (
        <button
          key={i}
          className={`cell ${cell ?? ''} ${line.includes(i) ? 'win' : ''}`}
          disabled={disabled || cell !== null}
          onClick={() => play(i)}
          aria-label={`Casa ${i + 1}${cell ? `: ${cell}` : ''}`}
        >
          <span>{cell}</span>
        </button>
      ))}
      {winner && (
        <svg className={`strike ${winner}`} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
          <line x1={x1 - dx} y1={y1 - dy} x2={x2 + dx} y2={y2 + dy} pathLength="4" />
        </svg>
      )}
    </div>
  )
}
