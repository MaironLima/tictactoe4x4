import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { GAMES } from '../../shared/games/index.js'
import { api } from '../lib'

export default function Home() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => api('/stats'), refetchInterval: 5000 })
  const create = useMutation({
    mutationFn: game => api(`/rooms?game=${game}`, { method: 'POST' }),
    onSuccess: ({ code }) => navigate({ to: '/room/$code', params: { code } }),
  })

  return (
    <div className="stack">
      <h1>Escolha um jogo</h1>
      <p className="muted small">Na sala online dá pra trocar de jogo ao fim de cada partida.</p>

      <div className="games">
        {Object.values(GAMES).map(g => (
          <div key={g.id} className="game-card">
            <span className="game-emoji">{g.emoji}</span>
            <div className="game-info">
              <b>{g.name}</b>
              <small className="muted">{g.rules}</small>
            </div>
            <div className="game-actions">
              {g.local && <Link to="/local/$game" params={{ game: g.id }} className="btn">Local</Link>}
              <button className="btn primary" onClick={() => create.mutate(g.id)} disabled={create.isPending}>
                Online
              </button>
            </div>
          </div>
        ))}
      </div>
      {create.isError && <p className="error">{create.error.message}</p>}

      <form
        className="row"
        onSubmit={e => {
          e.preventDefault()
          if (code.trim()) navigate({ to: '/room/$code', params: { code: code.trim() } })
        }}
      >
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Código da sala" maxLength={5} />
        <button className="btn">Entrar</button>
      </form>

      {stats.data && <p className="muted small">{stats.data.rooms} sala(s) · {stats.data.online} conectado(s)</p>}
    </div>
  )
}
