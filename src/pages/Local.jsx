import { useState } from 'react'
import { emptyBoard, getResult } from '../../shared/game'
import Board, { Scores, Status } from '../Board'

export default function Local() {
  const [board, setBoard] = useState(emptyBoard)
  const [starter, setStarter] = useState('X')
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 })
  const result = getResult(board)
  const other = starter === 'X' ? 'O' : 'X'
  const turn = board.filter(Boolean).length % 2 === 0 ? starter : other

  function play(i) {
    const next = board.with(i, turn)
    const r = getResult(next)
    if (r) setScores(s => ({ ...s, [r.winner]: s[r.winner] + 1 }))
    setBoard(next)
  }

  function restart() {
    setStarter(other) // alterna quem começa
    setBoard(emptyBoard())
  }

  return (
    <div className="stack">
      <Scores scores={scores} turn={turn} starter={starter} result={result} />
      <Status result={result} turn={turn} fresh={board.every(c => c === null)} />
      <Board board={board} onPlay={play} disabled={!!result} line={result?.line} />
      {result && <button className="btn" onClick={restart}>Jogar de novo</button>}
    </div>
  )
}
