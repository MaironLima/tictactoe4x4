import { GAMES } from '../shared/games/index.js'

export const Mark = ({ s, game }) => <span className={`mark ${s}`}>{GAMES[game].glyph[s]}</span>

export function Scores({ game, scores, turn, starter, result, me }) {
  const card = s => (
    <div className={`player ${s} ${!result && turn === s ? 'active' : ''} ${result?.winner === s ? 'won' : ''}`}>
      {starter === s && <span className="tag"><span>começa</span></span>}
      <Mark s={s} game={game} />
      <small className="muted">{me ? (me === s ? 'você' : 'oponente') : `jogador ${s === 'X' ? 1 : 2}`}</small>
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

// me = undefined no modo local (mesmo aparelho)
export function Status({ game, result, turn, me, fresh }) {
  // na Velha o símbolo já diz quem é (X/O); nos outros jogos é só uma bolinha colorida
  const M = ({ s }) => (GAMES[game].glyph[s] === s ? <Mark s={s} game={game} /> : <>Jogador {s === 'X' ? 1 : 2} <Mark s={s} game={game} /></>)
  if (result?.winner === 'draw') return <p className="status big">Empate!</p>
  if (result)
    return (
      <p className={`status big ${result.winner}`}>
        {me ? (result.winner === me ? 'Você venceu! 🎉' : 'Você perdeu') : <><M s={result.winner} /> venceu! 🎉</>}
      </p>
    )
  if (!turn) return <p className="status" /> // jogos simultâneos: cada componente explica o que fazer
  if (fresh && me) return <p className="status big">{turn === me ? 'Você começa!' : 'Oponente começa!'}</p>
  if (fresh) return <p className="status big"><M s={turn} /> começa!</p>
  if (me) return <p className="status">{turn === me ? 'Sua vez' : 'Vez do oponente'} (<Mark s={turn} game={game} />)</p>
  return <p className="status">Vez: <M s={turn} /></p>
}

export function GamePicker({ current, onPick, onlyLocal, label = 'Trocar de jogo' }) {
  const games = Object.values(GAMES).filter(g => g.id !== current && (!onlyLocal || g.local))
  return (
    <div className="stack">
      <p className="muted small">{label}</p>
      <div className="picker">
        {games.map(g => (
          <button key={g.id} className="btn" onClick={() => onPick(g.id)}>
            <span>{g.emoji}</span> {g.name}
          </button>
        ))}
      </div>
    </div>
  )
}
