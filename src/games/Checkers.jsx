import { useState } from 'react'
import { N, legalMoves } from '../../shared/games/checkers.js'

const CELLS = [...Array(N * N).keys()]

export default function Checkers({ state, me, play, disabled, flip }) {
  const [selected, setSelected] = useState(null)
  const moves = disabled || state.turn !== me ? [] : legalMoves(state)
  const from = state.chain ?? selected
  const targets = moves.filter(m => m.from === from)
  const movable = new Set(moves.map(m => m.from))
  const mustCapture = moves.some(m => m.cap !== undefined)

  function click(i) {
    const mv = targets.find(m => m.to === i)
    if (mv) {
      play({ from: mv.from, to: mv.to })
      setSelected(null)
    } else setSelected(movable.has(i) ? i : null)
  }

  return (
    <div className="stack">
      {/* jogador O vê o tabuleiro girado, com as próprias peças embaixo */}
      <div className="checkers">
        {(flip ? [...CELLS].reverse() : CELLS).map(i => {
          const dark = (Math.floor(i / N) + (i % N)) % 2 === 1
          const p = state.board[i]
          const king = p === 'X' || p === 'O'
          return (
            <button
              key={i}
              className={`sq ${dark ? 'dark' : ''} ${from === i ? 'sel' : ''} ${targets.some(m => m.to === i) ? 'target' : ''} ${movable.has(i) ? 'movable' : ''}`}
              disabled={!dark || disabled}
              onClick={() => click(i)}
            >
              {p && <span className={`piece ${p.toUpperCase()} ${king ? 'king' : ''}`} />}
            </button>
          )
        })}
      </div>
      <p className="muted small hint">
        {state.chain !== null && moves.length ? 'Continue capturando com a mesma peça' : mustCapture ? 'Captura obrigatória' : ' '}
      </p>
    </div>
  )
}
