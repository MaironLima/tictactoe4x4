import { io } from 'socket.io-client'

// produção (Vercel): URL do backend na VM, ex. https://api.seudominio.com
// dev: vazio, o proxy do Vite manda /api e /socket.io pro localhost:3001
const API_URL = import.meta.env.VITE_API_URL || ''

export async function api(path, init) {
  const res = await fetch(API_URL + '/api' + path, init)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro')
  return data
}

// reconexão automática infinita é o padrão do socket.io; aqui só limitamos o backoff
export const socket = io(API_URL || undefined, { autoConnect: false, reconnectionDelayMax: 5000 })

// sessionStorage: sobrevive a reload (reconexão), mas cada aba é um jogador — dá pra testar em 2 abas
if (!sessionStorage.getItem('ttt-player'))
  sessionStorage.setItem('ttt-player', Math.random().toString(36).slice(2) + Date.now().toString(36))
export const playerId = sessionStorage.getItem('ttt-player')

const COLORS_KEY = 'ttt-colors'
export const DEFAULT_COLORS = { X: '#38bdf8', O: '#f472b6' }

export function loadColors() {
  try {
    return { ...DEFAULT_COLORS, ...JSON.parse(localStorage.getItem(COLORS_KEY)) }
  } catch {
    return DEFAULT_COLORS
  }
}

export function saveColors(colors) {
  localStorage.setItem(COLORS_KEY, JSON.stringify(colors))
  applyColors(colors)
}

// cores viram variáveis CSS; o tabuleiro só usa var(--x) / var(--o)
export function applyColors({ X, O }) {
  document.documentElement.style.setProperty('--x', X)
  document.documentElement.style.setProperty('--o', O)
}
