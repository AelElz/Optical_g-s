import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Preloader from './components/Preloader'
import APropos from './pages/APropos'
import Boutique from './pages/Boutique'
import Contact from './pages/Contact'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Panier from './pages/Panier'
import RendezVous from './pages/RendezVous'
import { initHistoryNav, initSmoothScroll, resizeScroll } from './lib/motion'
import { useRouter } from './lib/router-context'

/*
 * Anything not listed here gets the "not found" page rather than being
 * redirected somewhere it was never asked to go. A dead link that silently
 * lands you on the home page lies about what happened.
 */
const ROUTES = {
  '/': Home,
  '/boutique': Boutique,
  '/boutique/panier': Panier,
  '/rendez-vous': RendezVous,
  '/a-propos': APropos,
  '/contact': Contact,
}

function App() {
  const { path } = useRouter()
  const Page = ROUTES[path] ?? NotFound

  // Lenis lives above the routes, so the smoothing survives navigation.
  useEffect(() => initSmoothScroll(), [])
  useEffect(() => initHistoryNav(), [])

  /*
   * Every page is a different height, and Lenis clamps scrolling to a cached
   * one. Re-measuring after the new page has painted is what keeps the lower
   * half of a tall page reachable after arriving from a short one.
   */
  useEffect(() => {
    const frame = requestAnimationFrame(resizeScroll)
    return () => cancelAnimationFrame(frame)
  }, [path])

  return (
    <>
      <Preloader />
      <Navbar />
      {/* Keyed on the path so a route change remounts the page. The reveal
          and panel-stack hooks both measure on mount, and reusing the tree
          across two entirely different layouts leaves both holding the
          previous page's geometry. */}
      <Page key={path} />
    </>
  )
}

export default App
