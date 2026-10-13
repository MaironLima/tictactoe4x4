import { SIZE } from '../shared/game'

// centro da casa i no viewBox 0..SIZE
const center = i => [(i % SIZE) + 0.5, Math.floor(i / SIZE) + 0.5]

export default function Board({ board, onPlay, disabled, line = [] }) {
  const winner = line.length ? board[line[0]] : null
  const [x1, y1] = center(line[0] ?? 0)
  const [x2, y2] = center(line.at(-1) ?? 0)

  return (
    <div className={`board ${winner ? 'over' : ''}`}>
      {board.map((cell, i) => (
        <button
          key={i}
          className={`cell ${cell ?? ''} ${line.includes(i) ? 'win' : ''}`}
          disabled={disabled || cell !== null}
          onClick={() => onPlay(i)}
          aria-label={`Casa ${i + 1}${cell ? `: ${cell}` : ''}`}
        >
          <span>{cell}</span>
        </button>
      ))}
      {winner && (
        <svg className={`strike ${winner}`} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
          {/* risco passa um pouco das casas das pontas */}
          <line x1={x1 - (x2 - x1) * 0.2} y1={y1 - (y2 - y1) * 0.2} x2={x2 + (x2 - x1) * 0.2} y2={y2 + (y2 - y1) * 0.2} pathLength="4" />
        </svg>
      )}
    </div>
  )
}

export const Mark = ({ s }) => <span className={`mark ${s}`}>{s}</span>

export function Scores({ scores, turn, starter, result, me }) {
  const card = s => (
    <div
      className={`player ${s} ${!result && turn === s ? 'active' : ''} ${result?.winner === s ? 'won' : ''}`}
    >
      {starter === s && <span className="tag"><span>começa</span></span>}
      <span className="mark">{s}</span>
      <small className="muted">{me ? (me === s ? 'você' : 'oponente') : `jogador ${s}`}</small>
      <b>{scores[s]}</b>
    </div>
  )
  return (
    <div className="scores">
      {card('X')}
      <span className="muted small">Empates<br /><b>{scores.draw}</b></span>
      {card('O')}
    </div>
  )
}

export function Status({ result, turn, me, fresh }) {
  if (result?.winner === 'draw') return <p className="status big">Empate!</p>
  if (result)
    return (
      <p className={`status big ${result.winner}`}>
        {me ? (result.winner === me ? 'Você venceu! 🎉' : 'Você perdeu') : `${result.winner} venceu! 🎉`}
      </p>
    )
  if (fresh) return <p className="status big"><Mark s={turn} /> começa!{me && turn === me ? ' (você)' : ''}</p>
  if (me) return <p className="status">{turn === me ? 'Sua vez' : 'Vez do oponente'} (<Mark s={turn} />)</p>
  return <p className="status">Vez de <Mark s={turn} /></p>
}
