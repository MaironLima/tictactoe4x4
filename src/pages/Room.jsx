import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { api, playerId, socket } from '../lib'
import Match from '../Match'
import { GamePicker } from '../ui'

export default function Room() {
  const { code } = useParams({ from: '/room/$code' })
  // checa se a sala existe antes de abrir o socket
  const room = useQuery({ queryKey: ['room', code], queryFn: () => api(`/rooms/${code}`), retry: false })

  if (room.isPending) return <p className="muted">Carregando sala…</p>
  if (room.isError) return <p className="error">{room.error.message}. <Link to="/">Voltar</Link></p>
  return <OnlineGame code={code} />
}

function OnlineGame({ code }) {
  const [room, setRoom] = useState(null)
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
    socket.on('state', setRoom)
    if (socket.connected) join()
    else socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('state', setRoom)
      socket.disconnect()
    }
  }, [code])

  if (error) return <p className="error">{error}. <Link to="/">Voltar</Link></p>
  if (!room || !me) return <p className="muted">Conectando…</p>

  const oppSeat = room.players[me === 'X' ? 'O' : 'X']
  const waiting = !oppSeat
  const { turn } = room.state
  const canPlay = connected && !waiting && !room.result && (!turn || turn === me) // turn null = jogada simultânea
  const newMatch = game => socket.emit('newMatch', { game })

  return (
    <div className="stack">
      {!connected && <p className="banner">Conexão perdida, reconectando…</p>}
      {oppSeat && !oppSeat.online && <p className="banner">Oponente desconectado, aguardando reconexão…</p>}

      <p className="muted small">
        Sala <b className="code">{room.code}</b> · você é o jogador <span className={`mark ${me}`}>{me === 'X' ? 1 : 2}</span>
      </p>

      {waiting && (
        <div className="stack">
          <p>Aguardando oponente. Envie o código:</p>
          <button className="btn code big" onClick={() => navigator.clipboard?.writeText(room.code)} title="Copiar">
            {room.code}
          </button>
        </div>
      )}

      <Match
        game={room.game}
        state={room.state}
        result={room.result}
        moves={room.moves}
        scores={room.scores}
        starter={room.starter}
        me={me}
        play={payload => socket.emit('move', payload)}
        disabled={!canPlay}
        flip={me === 'O'}
        onNext={newMatch}
      />

      {!room.result && room.moves === 0 && <GamePicker current={room.game} onPick={newMatch} label="Ou escolha outro jogo" />}
    </div>
  )
}
