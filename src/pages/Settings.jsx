import { useState } from 'react'
import { DEFAULT_COLORS, loadColors, saveColors } from '../lib'

export default function Settings() {
  const [colors, setColors] = useState(loadColors)

  const update = next => {
    setColors(next)
    saveColors(next)
  }

  return (
    <div className="stack">
      <h1>Cores</h1>
      <p className="muted">Salvo neste navegador. Só muda o que você vê.</p>
      {['X', 'O'].map(s => (
        <label key={s} className="row color-row">
          <span className={`mark big ${s}`}>{s}</span>
          <input type="color" value={colors[s]} onChange={e => update({ ...colors, [s]: e.target.value })} />
        </label>
      ))}
      <button className="btn" onClick={() => update(DEFAULT_COLORS)}>Restaurar padrão</button>
    </div>
  )
}
