/**
 * client.js — Configuración base de Axios
 * 
 * Cuando tu amigo termine el backend, solo cambia VITE_API_URL
 * en el archivo .env y todo funcionará automáticamente.
 * 
 * En tu .env:
 *   VITE_API_URL=http://localhost:3000/api
 */

import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
// Adjunta el token JWT automáticamente en cada petición si el usuario está logueado
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('elysium_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
// Maneja errores globales: si el token expiró (401), cierra sesión automáticamente
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido → limpiar sesión
      localStorage.removeItem('elysium_token')
      localStorage.removeItem('elysium_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
