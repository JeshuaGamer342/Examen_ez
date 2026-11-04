/**
 * auth.js — Servicios de autenticación
 * 
 * Mientras el backend no esté listo, las funciones devuelven
 * datos simulados (mock). Cuando tu amigo termine, solo
 * cambia USE_MOCK a false y descomenta las llamadas reales.
 */

import client from './client'

// ⚠️ Cambiar a false cuando el backend esté listo
const USE_MOCK = true

// ─── MOCK DATA (temporal) ─────────────────────────────────────────────────────
const mockUsers = {
  'usuario@test.com': {
    id: 1,
    name: 'Blanca Isabel Sanchez',
    email: 'usuario@test.com',
    role: 'usuario',
    token: 'mock-jwt-usuario',
  },
  'organizador@test.com': {
    id: 2,
    name: 'Jorge Ramírez',
    email: 'organizador@test.com',
    role: 'organizador',
    token: 'mock-jwt-organizador',
  },
  'admin@test.com': {
    id: 3,
    name: 'Kassandra Cuadras',
    email: 'admin@test.com',
    role: 'admin',
    token: 'mock-jwt-admin',
  },
  'contador@test.com': {
    id: 4,
    name: 'Jeshua Pérez',
    email: 'contador@test.com',
    role: 'contador',
    token: 'mock-jwt-contador',
  },
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  if (USE_MOCK) {
    // Simula delay de red
    await new Promise((r) => setTimeout(r, 1000))
    
    const user = mockUsers[email]
    if (!user || password !== '123456') {
      throw new Error('Credenciales incorrectas')
    }
    return { user, token: user.token }
  }

  // ✅ Llamada real al backend (descomentar cuando esté listo)
  // const { data } = await client.post('/auth/login', { email, password })
  // return data // { user, token }
}

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
export async function register({ name, email, password, role = 'usuario' }) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200))
    
    // Simula registro exitoso
    const newUser = { id: Date.now(), name, email, role, token: 'mock-jwt-new-user' }
    return { user: newUser, token: newUser.token }
  }

  // ✅ Llamada real al backend (descomentar cuando esté listo)
  // const { data } = await client.post('/auth/register', { name, email, password, role })
  // return data
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export async function logout() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return
  }

  // ✅ Llamada real (algunos backends invalidan el token en servidor)
  // await client.post('/auth/logout')
}

// ─── OBTENER PERFIL ───────────────────────────────────────────────────────────
export async function getProfile() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    const user = JSON.parse(localStorage.getItem('elysium_user') || 'null')
    if (!user) throw new Error('No autenticado')
    return user
  }

  // ✅ Llamada real al backend
  // const { data } = await client.get('/auth/me')
  // return data
}
