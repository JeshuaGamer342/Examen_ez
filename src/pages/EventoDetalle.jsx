/**
 * EventoDetalle.jsx — Vista detallada de un evento /evento/:id
 * Tabs: Descripción, Boletos, Ubicación
 * El botón Comprar lleva a /checkout con el estado del pedido
 *
 * TODO: reemplazar mockEvento con GET /api/events/:id
 */

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Calendar, MapPin, Clock, Users, Star, ChevronRight,
  Ticket, Shield, Info, ArrowLeft, Heart, Share2,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

// ─── Mock data — reemplazar con GET /api/events/:id ──────────────────────────
const mockEventos = [
  {
    id: 1,
    title: 'Coldplay: Music of the Spheres',
    categoria: 'Conciertos',
    organizer: 'Jorge Ramírez',
    date: '30 de Mayo, 2025',
    time: '21:00 hrs',
    venue: 'Estadio Caliente',
    municipio: 'Tijuana',
    estado: 'Baja California',
    status: 'publicado',
    rating: 4.9,
    description: 'Coldplay regresa a México con su espectacular gira "Music of the Spheres". Una experiencia visual y sonora única con pantallas LED de 360°, pirotecnia y los mejores éxitos de su carrera. No te pierdas uno de los shows más esperados del año.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=70',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=70',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70',
    ],
    boletos: [
      { tipo: 'General',  precioBase: 1200, capacidad: 300, disponibles: 180, imagen: null },
      { tipo: 'VIP',      precioBase: 2500, capacidad: 150, disponibles: 45,  imagen: null },
      { tipo: 'Premium',  precioBase: 4500, capacidad: 50,  disponibles: 12,  imagen: null },
    ],
    mapsUrl: 'https://maps.google.com/?q=Estadio+Caliente+Tijuana',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3365.0!2d-117.0382!3d32.5149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDMwJzUzLjYiTiAxMTfCsDAyJzE3LjYiVw!5e0!3m2!1ses!2smx!4v1234567890',
  },
  {
    id: 2,
    title: 'Festival de Jazz',
    categoria: 'Festivales',
    organizer: 'Ana Martínez',
    date: '12 de Junio, 2025',
    time: '18:00 hrs',
    venue: 'Parque Metropolitano',
    municipio: 'Mexicali',
    estado: 'Baja California',
    status: 'publicado',
    rating: 4.7,
    description: 'El Festival de Jazz más importante de Baja California regresa con una lineup increíble de artistas nacionales e internacionales. Disfruta de música en vivo, gastronomía y arte en un ambiente único al aire libre.',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&q=80',
    gallery: [],
    boletos: [
      { tipo: 'General',  precioBase: 450,  capacidad: 200, disponibles: 120, imagen: null },
      { tipo: 'VIP',      precioBase: 950,  capacidad: 80,  disponibles: 35,  imagen: null },
      { tipo: 'Premium',  precioBase: 1800, capacidad: 20,  disponibles: 8,   imagen: null },
    ],
    mapsUrl: 'https://maps.google.com/?q=Parque+Metropolitano+Mexicali',
    mapEmbed: '',
  },
]

// ─── Helper precio ────────────────────────────────────────────────────────────
function calcPrecio(precioBase) {
  const cargo = precioBase * 0.15
  return { cargo, total: precioBase + cargo }
}

// ─── Badge de disponibilidad ──────────────────────────────────────────────────
function DisponibilidadBadge({ disponibles, capacidad }) {
  const pct = (disponibles / capacidad) * 100
  if (disponibles === 0)  return <span className="text-xs text-red-400 font-semibold">Agotado</span>
  if (pct < 15)           return <span className="text-xs text-orange-400 font-semibold">¡Últimos lugares!</span>
  if (pct < 40)           return <span className="text-xs text-yellow-400 font-semibold">Pocos disponibles</span>
  return <span className="text-xs text-emerald-400 font-semibold">Disponible</span>
}

// ─── Tab: Descripción ─────────────────────────────────────────────────────────
function TabDescripcion({ evento }) {
  return (
    <div className="space-y-6">
      <div className="prose prose-invert max-w-none">
        <p className="text-white/70 leading-relaxed text-sm">{evento.description}</p>
      </div>

      {/* Info rápida */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: 'Fecha',     value: evento.date },
          { icon: Clock,    label: 'Hora',      value: evento.time },
          { icon: MapPin,   label: 'Venue',     value: evento.venue },
          { icon: Users,    label: 'Capacidad', value: evento.boletos.reduce((a,b) => a + b.capacidad, 0).toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
            <Icon size={14} className="text-purple-400 mb-2" />
            <p className="text-white/35 text-xs">{label}</p>
            <p className="text-white/80 text-sm font-medium mt-0.5 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Organizado por */}
      <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {evento.organizer[0]}
        </div>
        <div>
          <p className="text-white/35 text-xs">Organizado por</p>
          <p className="text-white/80 text-sm font-medium">{evento.organizer}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Boletos ─────────────────────────────────────────────────────────────
function TabBoletos({ evento, cantidades, setCantidades }) {
  const tipoColors = {
    General: 'border-white/[0.12]  bg-white/[0.03]',
    VIP:     'border-amber-500/25  bg-amber-500/5',
    Premium: 'border-yellow-500/25 bg-yellow-500/5',
  }
  const tipoTextColors = {
    General: 'text-white/70',
    VIP:     'text-amber-400',
    Premium: 'text-yellow-300',
  }

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2">
        <Shield size={14} className="text-purple-400 mt-0.5 shrink-0" />
        <p className="text-purple-200/70 text-xs leading-relaxed">
          El precio incluye un <span className="font-semibold">cargo por servicio del 15%</span>. Tu boleto en PDF llegará a tu correo al confirmar la compra.
        </p>
      </div>

      {evento.boletos.map((boleto) => {
        const { cargo, total } = calcPrecio(boleto.precioBase)
        const cantidad = cantidades[boleto.tipo] || 0
        const agotado  = boleto.disponibles === 0

        return (
          <div key={boleto.tipo} className={`p-5 rounded-xl border ${tipoColors[boleto.tipo]} backdrop-blur-sm`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Ticket size={14} className={tipoTextColors[boleto.tipo]} />
                  <h3 className={`font-semibold text-sm ${tipoTextColors[boleto.tipo]}`}>{boleto.tipo}</h3>
                  <DisponibilidadBadge disponibles={boleto.disponibles} capacidad={boleto.capacidad} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-white/35 text-xs">Precio base: <span className="text-white/55">${boleto.precioBase.toLocaleString()}</span></p>
                  <p className="text-white/35 text-xs">Cargo servicio: <span className="text-pink-300">+${cargo.toFixed(2)}</span></p>
                  <p className="text-white/80 text-sm font-bold mt-1">Total: <span className="text-purple-300">${total.toLocaleString()}</span> <span className="text-white/30 font-normal text-xs">MXN / boleto</span></p>
                </div>
              </div>

              {/* Selector de cantidad */}
              {!agotado ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setCantidades(p => ({ ...p, [boleto.tipo]: Math.max(0, (p[boleto.tipo] || 0) - 1) }))}
                    className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center text-lg font-light"
                  >−</button>
                  <span className="w-6 text-center text-white font-semibold text-sm">{cantidad}</span>
                  <button
                    onClick={() => setCantidades(p => ({ ...p, [boleto.tipo]: Math.min(10, (p[boleto.tipo] || 0) + 1) }))}
                    className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all flex items-center justify-center text-lg font-light"
                  >+</button>
                </div>
              ) : (
                <span className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/60 text-xs">Agotado</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab: Ubicación ───────────────────────────────────────────────────────────
function TabUbicacion({ evento }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
        <MapPin size={16} className="text-purple-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-white/80 font-semibold text-sm">{evento.venue}</p>
          <p className="text-white/40 text-xs mt-0.5">{evento.municipio}, {evento.estado}</p>
          <a
            href={evento.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 text-xs mt-2 transition-colors"
          >
            Ver en Google Maps <ChevronRight size={12} />
          </a>
        </div>
      </div>

      {/* Mapa embed */}
      <div className="rounded-xl overflow-hidden border border-white/[0.07] h-64 bg-white/[0.03] flex items-center justify-center">
        {evento.mapEmbed ? (
          <iframe
            src={evento.mapEmbed}
            width="100%" height="100%"
            style={{ border: 0 }}
            allowFullScreen loading="lazy"
            title="Ubicación del evento"
          />
        ) : (
          <div className="text-center">
            <MapPin size={28} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-sm">{evento.venue}</p>
            <p className="text-white/20 text-xs">{evento.municipio}, {evento.estado}</p>
            <a href={evento.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 text-xs mt-3 transition-colors">
              Abrir en Google Maps <ChevronRight size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EventoDetalle() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const evento = mockEventos.find(e => e.id === Number(id)) || mockEventos[0]
  // TODO: reemplazar con: const evento = await fetch(`/api/events/${id}`).then(r => r.json())

  const [activeTab,   setActiveTab]   = useState('descripcion')
  const [cantidades,  setCantidades]  = useState({ General: 0, VIP: 0, Premium: 0 })
  const [guardado,    setGuardado]    = useState(false)

  const tabs = [
    { id: 'descripcion', label: 'Descripción' },
    { id: 'boletos',     label: 'Boletos' },
    { id: 'ubicacion',   label: 'Ubicación' },
  ]

  // Calcula resumen del pedido
  const totalBoletos  = Object.values(cantidades).reduce((a, b) => a + b, 0)
  const subtotal      = evento.boletos.reduce((acc, b) => {
    const { total } = calcPrecio(b.precioBase)
    return acc + total * (cantidades[b.tipo] || 0)
  }, 0)

  function handleComprar() {
    if (!user) { navigate('/login', { state: { from: { pathname: `/evento/${id}` } } }); return }
    if (totalBoletos === 0) { setActiveTab('boletos'); return }

    // Arma el pedido para pasarle a /checkout
    const pedido = {
      eventoId:  evento.id,
      titulo:    evento.title,
      fecha:     evento.date,
      venue:     evento.venue,
      image:     evento.image,
      items:     evento.boletos
        .filter(b => cantidades[b.tipo] > 0)
        .map(b => ({
          tipo:       b.tipo,
          cantidad:   cantidades[b.tipo],
          precioBase: b.precioBase,
          ...calcPrecio(b.precioBase),
        })),
      subtotal,
    }

    navigate('/checkout', { state: { pedido } })
  }

  return (
    <div className="min-h-screen bg-[#0d0a1a] font-body">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={evento.image} alt={evento.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1a] via-[#0d0a1a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a1a]/80 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-20 left-6 flex items-center gap-1 text-white/40 text-xs">
          <Link to="/" className="hover:text-white/70 transition-colors">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-white/60">{evento.categoria}</span>
          <ChevronRight size={12} />
          <span className="text-white/40 truncate max-w-32">{evento.title}</span>
        </div>

        {/* Info sobre el hero */}
        <div className="absolute bottom-6 left-6 right-6">
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/30 border border-purple-500/40 text-purple-300 mb-3">
            {evento.categoria}
          </span>
          <h1 className="font-display text-white text-2xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
            {evento.title}
          </h1>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{evento.date}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} />{evento.venue}, {evento.municipio}</span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Star size={13} fill="currentColor" />{evento.rating}
            </span>
          </div>
        </div>

        {/* Acciones top right */}
        <div className="absolute top-20 right-6 flex gap-2">
          <button
            onClick={() => setGuardado(!guardado)}
            className={`p-2 rounded-xl backdrop-blur-sm border transition-all ${
              guardado ? 'bg-pink-500/20 border-pink-500/30 text-pink-400' : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Heart size={16} fill={guardado ? 'currentColor' : 'none'} />
          </button>
          <button className="p-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-all">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna izquierda — tabs */}
          <div className="lg:col-span-2">

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.07] mb-6 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/20 text-white border border-purple-500/30'
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido del tab */}
            {activeTab === 'descripcion' && <TabDescripcion evento={evento} />}
            {activeTab === 'boletos'     && <TabBoletos evento={evento} cantidades={cantidades} setCantidades={setCantidades} />}
            {activeTab === 'ubicacion'   && <TabUbicacion evento={evento} />}
          </div>

          {/* Columna derecha — resumen y compra */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Panel según rol */}
              {user?.role === 'organizador' ? (
                /* Vista organizador — precios informativos sin compra */
                <div className="p-5 rounded-2xl bg-white/[0.04] border border-purple-500/20 backdrop-blur-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-purple-400 shrink-0" />
                    <h2 className="text-purple-300 font-semibold text-sm">Vista de organizador</h2>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Estás viendo este evento como organizador. Los organizadores pueden explorar eventos pero no adquirir boletos desde esta plataforma.
                  </p>
                  <div className="space-y-2 text-xs border-t border-white/[0.06] pt-3">
                    {evento.boletos.map(b => {
                      const { total } = calcPrecio(b.precioBase)
                      return (
                        <div key={b.tipo} className="flex justify-between items-center">
                          <span className="text-white/40 capitalize">{b.tipo}</span>
                          <div className="text-right">
                            <span className="text-white/60">${total.toFixed(2)}</span>
                            <span className="text-white/25 ml-1">MXN</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* Vista usuario/visitante — panel de compra */
                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm space-y-4">
                  <h2 className="text-white font-semibold text-sm">Tu pedido</h2>

                  {totalBoletos === 0 ? (
                    <div className="text-center py-4">
                      <Ticket size={24} className="text-white/15 mx-auto mb-2" />
                      <p className="text-white/30 text-xs">Selecciona boletos en la pestaña "Boletos"</p>
                      <button
                        onClick={() => setActiveTab('boletos')}
                        className="text-purple-300 hover:text-purple-200 text-xs mt-2 transition-colors"
                      >
                        Ver tipos de boleto →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {evento.boletos.filter(b => cantidades[b.tipo] > 0).map(b => {
                          const { total } = calcPrecio(b.precioBase)
                          return (
                            <div key={b.tipo} className="flex justify-between items-center text-xs">
                              <span className="text-white/50">{cantidades[b.tipo]}x {b.tipo}</span>
                              <span className="text-white/70">${(total * cantidades[b.tipo]).toLocaleString()}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="border-t border-white/[0.07] pt-3 flex justify-between items-center">
                        <span className="text-white/50 text-xs">Total</span>
                        <span className="text-purple-300 font-bold text-lg">${subtotal.toLocaleString()} <span className="text-white/30 text-xs font-normal">MXN</span></span>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleComprar}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      totalBoletos > 0
                        ? 'btn-gold'
                        : 'bg-white/[0.06] text-white/30 border border-white/[0.08] cursor-not-allowed'
                    }`}
                  >
                    {!user
                      ? 'Inicia sesión para comprar'
                      : totalBoletos === 0
                        ? 'Selecciona boletos'
                        : `Comprar ${totalBoletos} boleto${totalBoletos > 1 ? 's' : ''}`
                    }
                  </button>

                  {totalBoletos > 0 && (
                    <p className="text-white/25 text-[10px] text-center leading-relaxed">
                      Al continuar aceptas los <Link to="/terminos" className="text-purple-400 hover:underline">Términos y Condiciones</Link>. Los cargos por servicio no son reembolsables.
                    </p>
                  )}
                </div>
              )}

              {/* Info del evento */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-white/40">
                  <Calendar size={13} className="text-purple-400 shrink-0" />
                  <span>{evento.date} · {evento.time}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <MapPin size={13} className="text-purple-400 shrink-0" />
                  <span>{evento.venue}, {evento.municipio}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <Info size={13} className="text-purple-400 shrink-0" />
                  <span>Organizado por {evento.organizer}</span>
                </div>
              </div>

              {/* Botón volver */}
              <button
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/40 hover:text-white/70 text-sm transition-colors border border-white/[0.06] hover:border-white/[0.12]"
              >
                <ArrowLeft size={14} /> Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
