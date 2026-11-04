/**
 * ScrollToTop.jsx
 * Hace scroll al inicio de la página en cada cambio de ruta.
 * Úsalo dentro de <BrowserRouter> en App.jsx
 */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, search])

  return null
}
