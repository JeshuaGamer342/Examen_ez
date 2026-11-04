/**
 * events.js — Servicios de eventos
 * 
 * Mientras el backend no esté listo, usa los datos de mockData.js.
 * Cuando tu amigo termine el backend, cambia USE_MOCK a false.
 */

import client from './client'
import { featuredEvents, nearbyEvents, categories } from '../data/mockData'

// ⚠️ Cambiar a false cuando el backend esté listo
const USE_MOCK = true

// ─── OBTENER EVENTOS DESTACADOS ───────────────────────────────────────────────
export async function getFeaturedEvents() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return featuredEvents
  }

  // const { data } = await client.get('/events/featured')
  // return data
}

// ─── OBTENER EVENTOS CERCANOS ─────────────────────────────────────────────────
export async function getNearbyEvents(city = 'Mexicali') {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return nearbyEvents
  }

  // const { data } = await client.get('/events/nearby', { params: { city } })
  // return data
}

// ─── OBTENER CATEGORÍAS ───────────────────────────────────────────────────────
export async function getCategories() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return categories
  }

  // const { data } = await client.get('/categories')
  // return data
}

// ─── OBTENER UN EVENTO POR ID ─────────────────────────────────────────────────
export async function getEventById(id) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    const all = [...featuredEvents, ...nearbyEvents]
    const event = all.find((e) => e.id === Number(id))
    if (!event) throw new Error('Evento no encontrado')
    return event
  }

  // const { data } = await client.get(`/events/${id}`)
  // return data
}

// ─── BUSCAR EVENTOS ───────────────────────────────────────────────────────────
export async function searchEvents(query) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700))
    const all = [...featuredEvents, ...nearbyEvents]
    return all.filter(
      (e) =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.category.toLowerCase().includes(query.toLowerCase())
    )
  }

  // const { data } = await client.get('/events/search', { params: { q: query } })
  // return data
}

// ─── CREAR EVENTO (solo organizadores) ───────────────────────────────────────
export async function createEvent(eventData) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000))
    return { ...eventData, id: Date.now(), status: 'borrador' }
  }

  // const { data } = await client.post('/events', eventData)
  // return data
}

// ─── OBTENER EVENTOS DEL ORGANIZADOR ACTUAL ───────────────────────────────────
export async function getMyEvents() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return featuredEvents // mock: devuelve todos como si fueran del organizador
  }

  // const { data } = await client.get('/events/my-events')
  // return data
}
