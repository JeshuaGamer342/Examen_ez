/**
 * AuthContext.jsx — Estado global de autenticación
 * 
 * Envuelve toda la app y provee:
 *   - user: datos del usuario logueado (o null)
 *   - isAuthenticated: true/false
 *   - isLoading: mientras verifica el token al inicio
 *   - login(), logout(), register()
 * 
 * USO en cualquier componente:
 *   import { useAuth } from '../context/AuthContext'
 *   const { user, login, logout } = useAuth()
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, logout as logoutApi, register as registerApi, getProfile } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isLoading, setIsLoading] = useState(true) // verifica token al cargar

  // Al iniciar la app, verifica si ya hay una sesión guardada
  useEffect(() => {
    const token = localStorage.getItem('elysium_token')
    if (token) {
      getProfile()
        .then((userData) => setUser(userData))
        .catch(() => {
          // Token inválido o expirado → limpiar
          localStorage.removeItem('elysium_token')
          localStorage.removeItem('elysium_user')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  async function login(email, password) {
    const { user: userData, token } = await loginApi(email, password)
    
    localStorage.setItem('elysium_token', token)
    localStorage.setItem('elysium_user', JSON.stringify(userData))
    setUser(userData)
    
    return userData // para saber el rol y redirigir
  }

  // ─── REGISTER ──────────────────────────────────────────────────────────────
  async function register(formData) {
    const { user: userData, token } = await registerApi(formData)
    
    localStorage.setItem('elysium_token', token)
    localStorage.setItem('elysium_user', JSON.stringify(userData))
    setUser(userData)
    
    return userData
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  async function logout() {
    await logoutApi()
    localStorage.removeItem('elysium_token')
    localStorage.removeItem('elysium_user')
    setUser(null)
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  const isAuthenticated = !!user
  const isAdmin         = user?.role === 'admin'
  const isOrganizer     = user?.role === 'organizador'
  const isContador      = user?.role === 'contador'

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      isOrganizer,
      isContador,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto fácilmente
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
