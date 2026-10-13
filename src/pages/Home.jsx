import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { api } from '../lib'

export default function Home() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => api('/stats'), refetchInterval: 5000 })
  const create = useMutation({
    mutationFn: () => api('/rooms', { method: 'POST' }),
    onSuccess: ({ code }) => navigate({ to: '/room/$code', params: { code } }),
  })

  return (
    <div className="stack">
      <h1>Jogo da Velha 4x4</h1>
      <p className="muted">Alinhe 3 na horizontal, vertical ou diagonal.</p>

      <Link to="/local" className="btn">Jogar local</Link>

      <button className="btn" onClick={() => create.mutate()} disabled={create.isPending}>
        {create.isPending ? 'Criando…' : 'Criar sala online'}
      </button>
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
