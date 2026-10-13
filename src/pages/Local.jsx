import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { GAMES } from '../../shared/games/index.js'
import { other } from '../../shared/games/util.js'
import Match from '../Match'

// dois jogadores no mesmo aparelho, um de cada vez
export default function Local() {
  const { game } = useParams({ from: '/local/$game' })
  const navigate = useNavigate()
  const [match, setMatch] = useState(() => GAMES[game]?.local && { game, state: GAMES[game].init('X'), starter: 'X', moves: 0 })
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 })

  if (!match) return <p>Esse jogo não tem modo local. <Link to="/">Voltar</Link></p>

  const g = GAMES[match.game]
  const result = g.result(match.state)

  function play(payload) {
    const next = g.move(match.state, match.state.turn, payload)
    if (!next) return
    const r = g.result(next)
    if (r) setScores(s => ({ ...s, [r.winner]: s[r.winner] + 1 }))
    setMatch({ ...match, state: next, moves: match.moves + 1 })
  }

  function next(id) {
    const starter = other(match.starter) // alterna quem começa
    setMatch({ game: id, state: GAMES[id].init(starter), starter, moves: 0 })
    if (id !== match.game) navigate({ to: '/local/$game', params: { game: id }, replace: true })
  }

  return (
    <Match
      game={match.game}
      state={match.state}
      result={result}
      moves={match.moves}
      scores={scores}
      starter={match.starter}
      play={play}
      onNext={next}
      onlyLocal
    />
  )
}
