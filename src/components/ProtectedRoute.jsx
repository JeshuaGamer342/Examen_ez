/**
 * ProtectedRoute.jsx — Rutas protegidas por rol
 * 
 * Uso en App.jsx:
 * 
 *   // Solo usuarios autenticados:
 *   <Route path="/mis-boletos" element={
 *     <ProtectedRoute><MisBoletos /></ProtectedRoute>
 *   } />
 * 
 *   // Solo organizadores:
 *   <Route path="/crear-evento" element={
 *     <ProtectedRoute roles={['organizador', 'admin']}><CrearEvento /></ProtectedRoute>
 *   } />
 * 
 *   // Solo admin:
 *   <Route path="/admin" element={
 *     <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
 *   } />
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Mientras verifica el token, no hace nada (evita flash de redirect)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    )
  }

  // No autenticado → redirige al login, y guarda la ruta original
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Autenticado pero sin el rol requerido → redirige al inicio
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
