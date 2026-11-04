/**
 * Eventos.jsx — Catálogo completo de eventos /eventos
 * Recibe ?q=query desde el buscador del Hero y las categorías
 * TODO: reemplazar mock con GET /api/events?q=&categoria=&page=
 */

import { Search } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import EventCard from '../components/EventCard'
import { featuredEvents, nearbyEvents } from '../data/mockData'

// Todos los eventos combinados (mock)
const todosLosEventos = [...featuredEvents, ...nearbyEvents].filter(
  (e, i, arr) => arr.findIndex(x => x.id === e.id) === i
)

const categorias = ['Todos', 'Conciertos', 'Festivales', 'Teatro']

export default function Eventos() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Toda la lógica vive en la URL — no en estado local
  const query     = searchParams.get('q') || ''
  const catParam  = searchParams.get('cat') || 'Todos'
  const categoria = categorias.includes(catParam) ? catParam : 'Todos'

  // Al presionar un chip → actualiza URL, limpia query de texto libre
  function handleCategoria(cat) {
    if (cat === 'Todos') {
      navigate('/eventos')
    } else {
      navigate(`/eventos?cat=${encodeURIComponent(cat)}`)
    }
  }

  // Título dinámico
  const titulo = categoria !== 'Todos'
    ? `Categoría: ${categoria}`
    : query
      ? `Resultados para "${query}"`
      : 'Todos los eventos'

  // Filtrar — query de texto libre + filtro de categoría son independientes
  const filtered = todosLosEventos.filter(e => {
    const matchQuery = !query ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.venue?.toLowerCase().includes(query.toLowerCase()) ||
      e.category?.toLowerCase().includes(query.toLowerCase())
    const matchCat = categoria === 'Todos' || e.category === categoria
    return matchQuery && matchCat
  })

  return (
    <div className="min-h-screen bg-[#0d0a1a] font-body">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-white text-3xl font-bold mb-1">{titulo}</h1>
          <p className="text-white/40 text-sm">
            {filtered.length} evento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoria(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                categoria === cat
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-white/[0.04] text-white/40 border-white/[0.07] hover:text-white/70 hover:border-white/[0.15]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de eventos */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-lg mb-2">No encontramos eventos</p>
            <p className="text-white/25 text-sm mb-6">Intenta con otro término o categoría</p>
            <button
              onClick={() => navigate('/eventos')}
              className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
            >
              Ver todos los eventos →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}