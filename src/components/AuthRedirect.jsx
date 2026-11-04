/**
 * AuthRedirect.jsx
 * Redirige automáticamente a los usuarios ya logueados a su panel
 * cuando intentan acceder al home o rutas públicas.
 *
 * Reglas:
 *   - admin     → /admin        (siempre, no puede ver home)
 *   - contador  → /contabilidad (siempre, no puede ver home)
 *   - organizador → home permitido (puede explorar)
 *   - usuario     → home permitido (puede comprar)
 */

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RESTRICTED_ROLES = ['admin', 'contador']

const ROLE_DASHBOARD = {
  admin:    '/admin',
  contador: '/contabilidad',
}

// Rutas públicas donde NO se debe redirigir (auth pages, static pages, etc.)
const PUBLIC_ONLY = ['/login', '/registro', '/forgot-password']

export default function AuthRedirect() {
  const { user, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const pathname  = location.pathname

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const role = user.role

    // Admin y Contador no deben estar en ninguna página pública
    if (RESTRICTED_ROLES.includes(role)) {
      const dashboard = ROLE_DASHBOARD[role]
      // Si no está ya en su dashboard, redirigir
      if (!pathname.startsWith(dashboard)) {
        navigate(dashboard, { replace: true })
      }
    }
  }, [isAuthenticated, user, pathname])

  return null
}
