import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { api, playerId, socket } from '../lib'
import Board, { Scores, Status } from '../Board'

export default function Room() {
  const { code } = useParams({ from: '/room/$code' })
  // checa se a sala existe antes de abrir o socket
  const room = useQuery({ queryKey: ['room', code], queryFn: () => api(`/rooms/${code}`), retry: false })

  if (room.isPending) return <p className="muted">Carregando sala…</p>
  if (room.isError) return <p className="error">{room.error.message}. <Link to="/">Voltar</Link></p>
  return <OnlineGame code={code} />
}

function OnlineGame({ code }) {
  const [state, setState] = useState(null)
  const [me, setMe] = useState(null)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(socket.connected)

  useEffect(() => {
    // a cada (re)conexão entra de novo na sala; o servidor devolve o mesmo lugar pelo playerId
    const join = () =>
      socket.emit('join', { code, playerId }, res => (res.error ? setError(res.error) : setMe(res.symbol)))
    const onConnect = () => { setConnected(true); join() }
    const onDisconnect = () => setConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('state', setState)
    if (socket.connected) join()
    else socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('state', setState)
      socket.disconnect()
    }
  }, [code])

  if (error) return <p className="error">{error}. <Link to="/">Voltar</Link></p>
  if (!state || !me) return <p className="muted">Conectando…</p>

  const opp = me === 'X' ? 'O' : 'X'
  const oppSeat = state.players[opp]
  const waiting = !oppSeat
  const canPlay = connected && !waiting && !state.result && state.turn === me

  return (
    <div className="stack">
      {!connected && <p className="banner">Conexão perdida, reconectando…</p>}
      {oppSeat && !oppSeat.online && <p className="banner">Oponente desconectado, aguardando reconexão…</p>}

      <p className="muted small">
        Sala <b className="code">{state.code}</b> · você é <span className={`mark ${me}`}>{me}</span>
      </p>

      {waiting ? (
        <div className="stack">
          <p>Aguardando oponente. Envie o código:</p>
          <button className="btn code big" onClick={() => navigator.clipboard?.writeText(state.code)} title="Copiar">
            {state.code}
          </button>
        </div>
      ) : (
        <>
          <Scores scores={state.scores} turn={state.turn} starter={state.starter} result={state.result} me={me} />
          <Status result={state.result} turn={state.turn} me={me} fresh={state.board.every(c => c === null)} />
        </>
      )}

      <Board board={state.board} onPlay={i => socket.emit('move', i)} disabled={!canPlay} line={state.result?.line} />

      {state.result && <button className="btn" onClick={() => socket.emit('rematch')}>Jogar de novo</button>}
    </div>
  )
}
