import { WINS } from '../../shared/games/rps.js'
import { other } from '../../shared/games/util.js'

const EMOJI = { pedra: '✊', papel: '✋', tesoura: '✌️' }

export default function RPS({ state, me, play, disabled, result }) {
  const opp = other(me)
  const wins = p => state.rounds.filter(r => r.winner === p).length
  const last = state.rounds.at(-1)
  const mine = state.picks[me]

  return (
    <div className="stack">
      <p className="muted small">Melhor de 3 · você <b>{wins(me)}</b> × <b>{wins(opp)}</b> oponente (vence quem fizer {WINS})</p>

      {last && (
        <div className="rps-last" key={state.rounds.length}>
          <span className={me}>{EMOJI[last[me]]}</span>
          <span className="muted">×</span>
          <span className={opp}>{EMOJI[last[opp]]}</span>
          <small className="muted">
            {last.winner === 'draw' ? 'Empate na rodada' : last.winner === me ? 'Você ganhou a rodada' : 'Oponente ganhou a rodada'}
          </small>
        </div>
      )}

      {!result &&
        (mine ? (
          <p>Você escolheu {EMOJI[mine]}. Aguardando oponente…</p>
        ) : (
          <>
            <p>{state.picks[opp] ? 'Oponente já escolheu. Sua vez!' : 'Escolha:'}</p>
            <div className="rps">
              {Object.entries(EMOJI).map(([k, e]) => (
                <button key={k} className="btn rps-btn" disabled={disabled} onClick={() => play(k)}>
                  <span>{e}</span>
                  <small>{k}</small>
                </button>
              ))}
            </div>
          </>
        ))}
    </div>
  )
}
