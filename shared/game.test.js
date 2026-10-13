import assert from 'node:assert/strict'
import { LINES, getResult, emptyBoard } from './game.js'

assert.equal(LINES.length, 24)
const b = emptyBoard()
assert.equal(getResult(b), null)
b[1] = b[2] = b[3] = 'X'
assert.deepEqual(getResult(b), { winner: 'X', line: [1, 2, 3] })
const d = emptyBoard(); d[3] = d[6] = d[9] = 'O' // anti-diagonal
assert.equal(getResult(d).winner, 'O')
const v = emptyBoard(); v[4] = v[8] = v[12] = 'X' // vertical
assert.equal(getResult(v).winner, 'X')
const draw = 'XXOO OOXX XXOO OOXX'.replace(/ /g, '').split('')
assert.equal(getResult(draw).winner, 'draw')
console.log('ok')
