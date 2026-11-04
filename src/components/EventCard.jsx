import { Calendar, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Card from './ui/Card'
import { useAuth } from '../context/AuthContext'

const tagColors = {
  'AGOTÁNDOSE': 'bg-red-500/20 text-red-400 border-red-500/30',
  'DESTACADO':  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'NUEVO':      'bg-pink-500/20 text-pink-300 border-pink-500/30',
}

export default function EventCard({ event }) {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  // Admin y contador no navegan a detalle desde cards — acceden desde su panel
  const canView = !user || user.role !== 'admin' && user.role !== 'contador'

  // Clic en la card (no en el botón Comprar) → detalle del evento
  function handleCardClick(e) {
    // Si el clic fue sobre el botón Comprar, no navegamos doble
    if (e.target.closest('a[data-comprar]')) return
    navigate(`/evento/${event.id}`)
  }

  return (
    <Card className="group h-72 cursor-pointer" onClick={handleCardClick}>
      {/* Imagen */}
      <img
        src={event.image}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1a] via-[#0d0a1a]/50 to-transparent" />

      {/* Tag */}
      {event.tag && (
        <div className="absolute top-4 left-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tagColors[event.tag]}`}>
            {event.tag}
          </span>
        </div>
      )}

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-purple-300 text-xs font-medium mb-1 uppercase tracking-wider">
          {event.category}
        </p>

        <h3 className="font-display text-white text-lg font-semibold leading-tight mb-3 group-hover:text-purple-300 transition-colors">
          {event.title}
        </h3>

        <div className="flex items-center gap-4 text-white/50 text-xs">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{event.venue}</span>
          </span>
        </div>

        {event.price && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-white/40 text-xs">Desde</span>
            <div className="flex items-center gap-2">
              <span className="text-purple-300 font-semibold text-sm">
                ${event.price} MXN
              </span>
              {/* Visible para usuarios, organizadores y visitantes */}
              {canView && (
                <Link
                  data-comprar
                  to={`/evento/${event.id}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-medium transition-all"
                >
                  Ver evento
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}