import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, Link } from '@tanstack/react-router'
import { applyColors, loadColors } from './lib'
import Home from './pages/Home'
import Local from './pages/Local'
import Room from './pages/Room'
import Settings from './pages/Settings'
import './styles.css'

applyColors(loadColors())

const rootRoute = createRootRoute({
  component: () => (
    <>
      <header>
        <Link to="/" className="logo">#4x4</Link>
        <nav>
          <Link to="/local">Local</Link>
          <Link to="/settings">Cores</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  ),
  notFoundComponent: () => <p>Página não encontrada. <Link to="/">Voltar</Link></p>,
})

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home }),
  createRoute({ getParentRoute: () => rootRoute, path: '/local', component: Local }),
  createRoute({ getParentRoute: () => rootRoute, path: '/room/$code', component: Room }),
  createRoute({ getParentRoute: () => rootRoute, path: '/settings', component: Settings }),
])

const router = createRouter({ routeTree })
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
