import { useState } from 'react'
import { N, randomFleet } from '../../shared/games/battleship.js'
import { other } from '../../shared/games/util.js'

export default function Battleship({ state, me, play, disabled }) {
  const opp = other(me)
  const [fleet, setFleet] = useState(randomFleet)
  const mine = state.ships[me]

  if (state.phase === 'place')
    return (
      <div className="stack">
        <p>{mine ? 'Frota pronta. Aguardando o oponente…' : 'Posicione sua frota'}</p>
        <Sea owner={me} ships={mine ?? fleet} shots={{}} />
        {!mine && (
          <div className="row">
            <button className="btn grow" onClick={() => setFleet(randomFleet())}>🔀 Sortear</button>
            <button className="btn grow primary" disabled={disabled} onClick={() => play({ type: 'place', ships: fleet })}>
              Pronto
            </button>
          </div>
        )}
      </div>
    )

  const myTurn = !disabled && state.turn === me
  return (
    <div className="stack">
      <p className="muted small">Mar do oponente {myTurn && '— toque para atirar'}</p>
      <Sea owner={opp} ships={state.ships[opp] ?? []} shots={state.shots[me]} onFire={myTurn ? i => play({ type: 'fire', i }) : null} />
      <p className="muted small">Sua frota</p>
      <Sea owner={me} ships={mine} shots={state.shots[opp]} small />
    </div>
  )
}

// shots = { casa: acertou? }; ships do oponente só chegam os afundados (ou todos no fim)
function Sea({ owner, ships, shots, onFire, small }) {
  const ship = new Set(ships.flat())
  return (
    <div className={`sea ${owner} ${small ? 'small' : ''}`}>
      {Array.from({ length: N * N }, (_, i) => (
        <button
          key={i}
          className={`wave ${ship.has(i) ? 'ship' : ''} ${shots[i] === true ? 'hit' : shots[i] === false ? 'miss' : ''}`}
          disabled={!onFire || i in shots}
          onClick={() => onFire(i)}
          aria-label={`Casa ${String.fromCharCode(65 + Math.floor(i / N))}${(i % N) + 1}`}
        />
      ))}
    </div>
  )
}
