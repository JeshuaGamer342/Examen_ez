/**
 * AdminDashboard.jsx — Panel del Administrador
 * Casos de uso (según diagrama):
 *   Gestionar eventos (CRUD), gestionar categorías, administrar usuarios,
 *   supervisar ventas, generar reportes.
 *
 * Flujo de cancelación y reembolso:
 *   Admin cancela → usuario recibe SOLO precio base ($100)
 *   Plataforma retiene cargo por servicio ($15) - fee Stripe ($4.14) = $10.86
 *   Organizador no devuelve nada si ya se le transfirió
 *
 * TODO: reemplazar mock con API real
 */

import { useState } from 'react'
import {
  CalendarDays, Users, Tag,
  BarChart2, FileText, Plus, Edit, Trash2,
  CheckCircle, XCircle, TrendingUp, DollarSign, AlertTriangle,
  Eye, X, Calendar, MapPin, Ticket, UserPlus, EyeOff, KeyRound,
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { toTitleCase } from '../utils/inputHelpers'

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockEvents = [
  { id: 1, title: 'Coldplay: Music of the Spheres', organizer: 'Jorge Ramírez',  date: '30/MAY', status: 'publicado', sold: 320, capacity: 500,  precioBase: 1200, category: 'Conciertos', venue: 'Estadio Caliente, Tijuana',     image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',  desc: 'La gira Music of the Spheres llega a México con un espectáculo visual único.' },
  { id: 2, title: 'Festival de Jazz',                organizer: 'Ana Martínez',   date: '12/JUN', status: 'publicado', sold: 180, capacity: 300,  precioBase: 450,  category: 'Festivales', venue: 'Parque Metropolitano, Mexicali', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80', desc: 'Festival de jazz con artistas locales e internacionales.' },
  { id: 3, title: 'Gran Obra Musical',               organizer: 'Carlos López',   date: '15/JUN', status: 'pendiente', sold: 0,   capacity: 200,  precioBase: 950,  category: 'Teatro',     venue: 'Teatro Municipal, Mexicali',    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80', desc: 'Obra musical clásica con elenco profesional.' },
  { id: 4, title: 'Rock en Vivo',                    organizer: 'Jorge Ramírez',  date: '25/JUN', status: 'cancelado', sold: 45,  capacity: 400,  precioBase: 550,  category: 'Conciertos', venue: 'Foro Independencia, Tijuana',   image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80', desc: 'Noche de rock con bandas locales.' },
]

const mockUsers = [
  { id: 1, name: 'Blanca Isabel Sanchez', email: 'blanca@gmail.com', role: 'usuario',     status: 'activo',    tickets: 3 },
  { id: 2, name: 'Jorge Ramírez',         email: 'jorge@gmail.com',  role: 'organizador', status: 'activo',    tickets: 0 },
  { id: 3, name: 'Ana Martínez',          email: 'ana@gmail.com',    role: 'organizador', status: 'activo',    tickets: 0 },
  { id: 4, name: 'Carlos López',          email: 'carlos@gmail.com', role: 'usuario',     status: 'suspendido', tickets: 1 },
]

const mockCategories = [
  { id: 1, name: 'Conciertos', eventos: 12, color: 'text-purple-400' },
  { id: 2, name: 'Festivales', eventos: 5,  color: 'text-pink-400' },
  { id: 3, name: 'Teatro',     eventos: 3,  color: 'text-yellow-400' },
]

const statusStyle = {
  publicado:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pendiente:  'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
  cancelado:  'bg-red-500/15     text-red-400     border-red-500/30',
  activo:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  suspendido: 'bg-red-500/15     text-red-400     border-red-500/30',
}

const roleColor = {
  usuario:     'text-purple-300',
  organizador: 'text-blue-300',
  admin:       'text-pink-300',
  contador:    'text-emerald-300',
}

const navItems = [
  { id: 'eventos',    icon: CalendarDays, label: 'Eventos y Validaciones' },
  { id: 'categorias', icon: Tag,          label: 'Categorías' },
  { id: 'usuarios',   icon: Users,        label: 'Gestión de Usuarios' },
  { id: 'ventas',     icon: BarChart2,    label: 'Supervisar Ventas' },
  { id: 'reportes',   icon: FileText,     label: 'Reportes' },
]

// ─── Vistas ───────────────────────────────────────────────────────────────────
function GestionEventos({ query = '' }) {
  const [events, setEvents]             = useState([...mockEvents])
  const [toast, setToast]               = useState(null)
  const [cancelModal, setCancelModal]   = useState(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [detailModal, setDetailModal]   = useState(null)
  const [rejectModal, setRejectModal]   = useState(null) // rechazar pendiente

  // Solo NO pendientes en la lista principal
  const filteredEvents = (query.trim()
    ? events.filter(e =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.organizer.toLowerCase().includes(query.toLowerCase()) ||
        e.status.toLowerCase().includes(query.toLowerCase())
      )
    : events
  ).filter(e => e.status !== 'pendiente')

  function showToast(msg, color = 'emerald') {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3500)
  }

  function handleAprobar(id) {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'publicado' } : e))
    const event = events.find(e => e.id === id)
    showToast(`✓ Evento aprobado. Email enviado a ${event.organizer}`, 'emerald')
  }

  function confirmarCancelacion() {
    if (!cancelModal) return
    setEvents(prev => prev.map(e => e.id === cancelModal.id ? { ...e, status: 'cancelado' } : e))
    const reembolso = cancelModal.sold * cancelModal.precioBase
    showToast(
      `Evento cancelado. ${cancelModal.sold > 0 ? `Reembolso de $${reembolso.toLocaleString()} procesado.` : ''} Email enviado a ${cancelModal.organizer}`,
      'yellow'
    )
    setCancelModal(null)
    setConfirmInput('')
  }

  function handleRechazar() {
    if (!rejectModal) return
    setEvents(prev => prev.map(e => e.id === rejectModal.id ? { ...e, status: 'cancelado' } : e))
    // TODO: POST /api/admin/events/:id/reject → backend envía email al organizador
    showToast(`Evento rechazado. Se notificó a ${rejectModal.organizer} por correo.`, 'red')
    setRejectModal(null)
  }

  const toastColor = {
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    yellow:  'bg-yellow-500/20  border-yellow-500/30  text-yellow-300',
    red:     'bg-red-500/20     border-red-500/30     text-red-300',
  }

  const nombreConfirmado = confirmInput.trim().toLowerCase() === cancelModal?.title.toLowerCase()

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm backdrop-blur-sm max-w-sm ${toastColor[toast.color]}`}>
          {toast.msg}
        </div>
      )}

      {/* Modal rechazar evento pendiente */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-orange-500/20 rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center mx-auto mb-4">
              <XCircle size={22} className="text-orange-400" />
            </div>
            <h2 className="font-display text-white text-lg font-semibold mb-1">¿No aprobar este evento?</h2>
            <p className="text-white/60 text-sm mb-4 truncate">"{rejectModal.title}"</p>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-5 text-left space-y-1.5 text-xs">
              <p className="text-orange-300/80 font-semibold">ℹ Lo que ocurrirá:</p>
              <ul className="text-white/40 space-y-1 pl-2">
                <li>• El evento <span className="text-white/70 font-semibold">no será publicado</span> en la plataforma</li>
                <li>• Se enviará un correo automático a <span className="text-white/70">{rejectModal.organizer}</span> notificándole el rechazo</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                Volver
              </button>
              <button onClick={handleRechazar}
                className="flex-1 py-2.5 text-sm rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 font-semibold transition-all">
                Sí, no aprobar
              </button>
            </div>
          </div>
        </div>
      )}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetailModal(null)} />
          <div className="relative z-10 w-full max-w-lg bg-[#13092a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Flyer */}
            <div className="relative h-48">
              <img src={detailModal.image} alt={detailModal.title}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13092a] to-transparent" />
              <button onClick={() => setDetailModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <span className={`absolute bottom-3 left-4 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[detailModal.status]}`}>
                {detailModal.status}
              </span>
            </div>
            {/* Info */}
            <div className="p-5 space-y-3">
              <div>
                <h2 className="font-display text-white text-xl font-bold">{detailModal.title}</h2>
                <p className="text-white/40 text-xs mt-0.5">{detailModal.category}</p>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{detailModal.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { icon: Calendar,  label: 'Fecha',        value: detailModal.date },
                  { icon: MapPin,    label: 'Recinto',      value: detailModal.venue },
                  { icon: Users,     label: 'Organizador',  value: detailModal.organizer },
                  { icon: Ticket,    label: 'Capacidad',    value: `${detailModal.sold}/${detailModal.capacity} vendidos` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Icon size={13} className="text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white/30 text-[10px]">{label}</p>
                      <p className="text-white/70">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/[0.06]">
                <span className="text-white/30 text-xs">Precio base</span>
                <span className="text-white/80 font-semibold">${detailModal.precioBase.toLocaleString()} MXN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal cancelación */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setCancelModal(null); setConfirmInput('') }} />
          <div className="relative z-10 w-full max-w-md bg-[#13092a] border border-red-500/20 rounded-2xl shadow-2xl p-6">
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-red-400" />
            </div>
            <h2 className="font-display text-white text-lg font-semibold text-center mb-1">¿Cancelar este evento?</h2>
            <p className="text-white/60 text-sm text-center font-medium mb-4 truncate">"{cancelModal.title}"</p>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 space-y-2 text-xs">
              <p className="text-red-300/80 font-semibold">⚠ Repercusiones de esta acción:</p>
              <ul className="text-white/40 space-y-1 pl-2">
                <li>• El evento pasará a estado <span className="text-red-400 font-semibold">cancelado</span> de forma permanente</li>
                <li>• Se procesará reembolso del <span className="text-white/70 font-semibold">precio base</span> a {cancelModal.sold} comprador{cancelModal.sold !== 1 ? 'es' : ''}</li>
                <li>• El cargo por servicio (15%) <span className="text-white/70 font-semibold">NO se reembolsa</span></li>
                <li>• Se enviará un correo automático a <span className="text-white/70">{cancelModal.organizer}</span></li>
                {cancelModal.sold > 0 && (
                  <li>• Monto a reembolsar: <span className="text-yellow-400 font-semibold">${(cancelModal.sold * cancelModal.precioBase).toLocaleString()} MXN</span></li>
                )}
              </ul>
            </div>
            <div className="mb-4">
              <label className="text-white/50 text-xs mb-1.5 block">Escribe el nombre del evento para confirmar:</label>
              <input type="text" value={confirmInput} onChange={e => setConfirmInput(e.target.value)}
                placeholder={cancelModal.title}
                className={`w-full bg-white/[0.05] border rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none transition-colors ${
                  confirmInput && !nombreConfirmado ? 'border-red-500/40' : confirmInput && nombreConfirmado ? 'border-emerald-500/40' : 'border-white/[0.1]'
                }`} />
              {confirmInput && !nombreConfirmado && <p className="text-red-400/70 text-xs mt-1">El nombre no coincide</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCancelModal(null); setConfirmInput('') }}
                className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                Volver
              </button>
              <button onClick={confirmarCancelacion} disabled={!nombreConfirmado}
                className={`flex-1 py-2.5 text-sm rounded-full font-semibold transition-all border ${
                  nombreConfirmado
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30'
                    : 'bg-white/[0.03] text-white/20 border-white/[0.06] cursor-not-allowed'
                }`}>
                Sí, cancelar evento
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-white font-display text-xl font-semibold">Gestión de Eventos</h1>
        <p className="text-white/40 text-xs mt-0.5">Aprueba o cancela eventos enviados por organizadores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total eventos', value: events.length,                                   color: 'text-purple-400' },
          { label: 'Publicados',    value: events.filter(e=>e.status==='publicado').length,  color: 'text-emerald-400' },
          { label: 'Pendientes',    value: events.filter(e=>e.status==='pendiente').length,  color: 'text-yellow-400' },
          { label: 'Cancelados',    value: events.filter(e=>e.status==='cancelado').length,  color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm text-center">
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pendientes — requieren acción */}
      {events.filter(e => e.status === 'pendiente').length > 0 && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-yellow-500/15 flex items-center gap-2">
            <AlertTriangle size={14} className="text-yellow-400" />
            <h2 className="text-yellow-300 text-sm font-semibold">Eventos pendientes de aprobación</h2>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {events.filter(e => e.status === 'pendiente').map((event) => (
              <div key={event.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-medium truncate">{event.title}</p>
                  <p className="text-white/40 text-xs">{event.organizer} · {event.date} · Cap: {event.capacity} · Base: ${event.precioBase}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setDetailModal(event)}
                    className="p-1.5 rounded-lg bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/[0.08]">
                    <Eye size={12} />
                  </button>
                  <button onClick={() => handleAprobar(event.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-all border border-emerald-500/30">
                    <CheckCircle size={12} /> Aprobar
                  </button>
                  <button onClick={() => setRejectModal(event)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold transition-all border border-red-500/30">
                    <XCircle size={12} /> No aprobar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publicados y cancelados — NO pendientes */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-white/70 text-sm font-semibold">Eventos publicados y cancelados</h2>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {filteredEvents.length === 0
            ? <div className="px-5 py-8 text-center"><p className="text-white/30 text-sm">No se encontraron eventos</p></div>
            : filteredEvents.map((event) => {
              const totalPagado  = (event.precioBase * 1.15) * event.sold
              const isCancelado  = event.status === 'cancelado'
              const isPublished  = event.status === 'publicado'
              return (
                <div key={event.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCancelado ? 'text-white/40 line-through' : 'text-white/80'}`}>{event.title}</p>
                    <p className="text-white/30 text-xs">{event.organizer} · {event.date} · Base: ${event.precioBase}</p>
                  </div>
                  <div className="text-white/40 text-xs shrink-0">{event.sold}/{event.capacity}</div>
                  {/* Monto: tachado si cancelado */}
                  {event.sold > 0 && (
                    <div className={`text-xs shrink-0 ${isCancelado ? 'text-red-400/50 line-through' : 'text-emerald-400'}`}>
                      ${totalPagado.toLocaleString()}
                    </div>
                  )}
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[event.status]}`}>
                    {event.status}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setDetailModal(event)}
                      className="p-1.5 rounded-lg bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/[0.08]">
                      <Eye size={12} />
                    </button>
                    {isPublished && (
                      <button onClick={() => { setCancelModal(event); setConfirmInput('') }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 text-xs transition-all border border-red-500/20">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

function GestionCategorias({ query = '' }) {
  const [cats, setCats]               = useState([...mockCategories])
  const [editando, setEditando]       = useState(null)
  const [nueva, setNueva]             = useState('')
  const [showInput, setShowInput]     = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [toast, setToast]             = useState(null)

  function showSuccess(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = query.trim()
    ? cats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : cats

  function handleAgregar() {
    const nombre = nueva.trim()
    if (!nombre) return
    setCats(prev => [...prev, { id: Date.now(), name: nombre, eventos: 0, color: 'text-purple-400' }])
    setNueva('')
    setShowInput(false)
    showSuccess(`Se ha creado la categoría "${nombre}" exitosamente`)
  }

  function handleEditar(id) {
    if (!editando?.name?.trim()) return
    setCats(prev => prev.map(c => c.id === id ? { ...c, name: editando.name.trim() } : c))
    showSuccess(`La categoría ha sido actualizada`)
    setEditando(null)
  }

  function confirmarEliminar() {
    setCats(prev => prev.filter(c => c.id !== deleteModal.id))
    setDeleteModal(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Toast éxito */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm backdrop-blur-sm max-w-sm bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
          ✓ {toast}
        </div>
      )}

      {/* Modal eliminar */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-red-500/20 rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h2 className="font-display text-white text-lg font-semibold mb-1">¿Eliminar categoría?</h2>
            <p className="text-white/50 text-sm mb-1"><span className="text-white/80 font-medium">"{deleteModal.name}"</span></p>
            <p className="text-white/35 text-xs mb-6">Esta acción no se puede deshacer. Los eventos asignados quedarán sin clasificar.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                Cancelar
              </button>
              <button onClick={confirmarEliminar}
                className="flex-1 py-2.5 text-sm rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-semibold transition-all">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-display text-xl font-semibold">Gestión de Categorías</h1>
          <p className="text-white/40 text-xs mt-0.5">Crea y administra las categorías de eventos</p>
        </div>
        <button onClick={() => setShowInput(true)} className="btn-gold flex items-center gap-2 text-sm px-4 py-2">
          <Plus size={15} /> Nueva categoría
        </button>
      </div>

      {showInput && (
        <div className="flex gap-2 p-4 rounded-xl bg-white/[0.04] border border-purple-500/20">
          <input autoFocus type="text" value={nueva}
            onChange={e => setNueva(toTitleCase(e.target.value))}
            onKeyDown={e => e.key === 'Enter' && handleAgregar()}
            placeholder="Nombre de la categoría..."
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-purple-500/40" />
          <button onClick={handleAgregar} className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-sm border border-purple-500/30 transition-all">
            Agregar
          </button>
          <button onClick={() => { setShowInput(false); setNueva('') }} className="px-3 py-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/70 text-sm transition-all">
            ✕
          </button>
        </div>
      )}

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
        <div className="divide-y divide-white/[0.05]">
          {filtered.length === 0
            ? <p className="px-5 py-6 text-white/30 text-sm text-center">Sin resultados</p>
            : filtered.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className={`w-2 h-2 rounded-full bg-current ${cat.color} shrink-0`} />
              {editando?.id === cat.id ? (
                <input autoFocus value={editando.name}
                  onChange={e => setEditando({ ...editando, name: toTitleCase(e.target.value) })}
                  onKeyDown={e => { if (e.key === 'Enter') handleEditar(cat.id); if (e.key === 'Escape') setEditando(null) }}
                  className="flex-1 bg-white/[0.05] border border-purple-500/30 rounded-lg px-2 py-1 text-sm text-white/80 focus:outline-none" />
              ) : (
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-medium">{cat.name}</p>
                  <p className="text-white/30 text-xs">{cat.eventos} eventos</p>
                </div>
              )}
              <div className="flex gap-1.5">
                {editando?.id === cat.id ? (
                  <>
                    <button onClick={() => handleEditar(cat.id)} className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all border border-emerald-500/30"><CheckCircle size={12} /></button>
                    <button onClick={() => setEditando(null)} className="p-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/70 transition-all border border-white/[0.08]">✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditando({ id: cat.id, name: cat.name })} className="p-1.5 rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition-all border border-purple-500/20"><Edit size={12} /></button>
                    <button onClick={() => setDeleteModal(cat)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-all border border-red-500/20"><Trash2 size={12} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GestionUsuarios({ query = '' }) {
  const [users, setUsers]           = useState([...mockUsers])
  const [showForm, setShowForm]     = useState(false)
  const [newUser, setNewUser]       = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [toast, setToast]           = useState(null)
  const [changePassModal, setChangePassModal] = useState(null) // usuario contador

  // Solo organizadores y contadores
  const managed = users.filter(u => u.role === 'organizador' || u.role === 'contador')
  const filtered = query.trim()
    ? managed.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.role.toLowerCase().includes(query.toLowerCase()) ||
        u.status.toLowerCase().includes(query.toLowerCase())
      )
    : managed

  function toggleStatus(id) {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'activo' ? 'suspendido' : 'activo' } : u
    ))
    // TODO: PUT /api/admin/users/:id/status
  }

  function handleAddContador(e) {
    e.preventDefault()
    const errs = {}
    if (!newUser.name.trim() || newUser.name.trim().length < 3)  errs.name     = 'Mínimo 3 caracteres'
    if (!/\S+@\S+\.\S+/.test(newUser.email))                     errs.email    = 'Correo inválido'
    if (!newUser.password || newUser.password.length < 8)        errs.password = 'Mínimo 8 caracteres'
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setUsers(prev => [...prev, {
      id: Date.now(), name: newUser.name.trim(), email: newUser.email,
      role: 'contador', status: 'activo', tickets: 0,
    }])
    setNewUser({ name: '', email: '', password: '' })
    setShowForm(false)
    setToast(`Contador "${newUser.name.trim()}" agregado correctamente`)
    setTimeout(() => setToast(null), 3000)
    // TODO: POST /api/admin/users/contador → { name, email, password }
  }

  function handleChangePass(e) {
    e.preventDefault()
    const newPass = e.target.newPass.value
    if (!newPass || newPass.length < 8) return
    // TODO: PUT /api/admin/users/:id/password → { password: newPass }
    setToast(`Contraseña de "${changePassModal.name}" actualizada`)
    setTimeout(() => setToast(null), 3000)
    setChangePassModal(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
          ✓ {toast}
        </div>
      )}

      {/* Modal cambiar contraseña del contador */}
      {changePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setChangePassModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={22} className="text-purple-400" />
            </div>
            <h2 className="font-display text-white text-lg font-semibold text-center mb-1">Cambiar contraseña</h2>
            <p className="text-white/50 text-sm text-center mb-5 truncate">{changePassModal.name}</p>
            <form onSubmit={handleChangePass} className="space-y-3">
              <div>
                <label className="reg-label">Nueva contraseña</label>
                <input
                  type="password"
                  name="newPass"
                  placeholder="Mínimo 8 caracteres"
                  className="reg-input-no-icon"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setChangePassModal(null)}
                  className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 transition-all">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 text-sm rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 font-semibold transition-all">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-display text-xl font-semibold">Gestión de Usuarios</h1>
          <p className="text-white/40 text-xs mt-0.5">Organizadores y contadores de la plataforma</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn-gold flex items-center gap-2 text-sm px-4 py-2">
          <UserPlus size={15} /> Nuevo contador
        </button>
      </div>

      {/* Formulario nuevo contador */}
      {showForm && (
        <form onSubmit={handleAddContador}
          className="p-5 rounded-xl bg-white/[0.04] border border-emerald-500/20 space-y-3">
          <h3 className="text-emerald-300 text-sm font-semibold flex items-center gap-2">
            <UserPlus size={15} /> Agregar nuevo contador
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'name',  label: 'Nombre completo',    type: 'text',  ph: 'Nombre del contador' },
              { key: 'email', label: 'Correo electrónico', type: 'email', ph: 'correo@empresa.com' },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="reg-label">{label}</label>
                <input type={type} value={newUser[key]} placeholder={ph}
                  onChange={e => {
                    const val = key === 'name' ? toTitleCase(e.target.value) : e.target.value
                    setNewUser({...newUser, [key]: val})
                    setFormErrors({...formErrors, [key]: ''})
                  }}
                  className={`reg-input-no-icon ${formErrors[key] ? 'error' : ''}`} />
                {formErrors[key] && <span className="reg-error">{formErrors[key]}</span>}
              </div>
            ))}
            {/* Contraseña con ojo */}
            <div>
              <label className="reg-label">Contraseña temporal</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  placeholder="Mín. 8 caracteres"
                  onChange={e => { setNewUser({...newUser, password: e.target.value}); setFormErrors({...formErrors, password: ''}) }}
                  className={`reg-input-no-icon pr-9 ${formErrors.password ? 'error' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {formErrors.password && <span className="reg-error">{formErrors.password}</span>}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setFormErrors({}) }}
              className="px-4 py-2 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 transition-all">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2 text-sm rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-semibold transition-all">
              Crear contador
            </button>
          </div>
        </form>
      )}

      {query && <p className="text-white/30 text-xs">Mostrando {filtered.length} resultado(s) para "{query}"</p>}

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-white/70 text-sm font-semibold">Organizadores y Contadores</h2>
          <span className="text-white/30 text-xs">{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {filtered.length === 0
            ? <p className="px-5 py-6 text-white/30 text-sm text-center">Sin resultados</p>
            : filtered.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/50 to-pink-500/50 flex items-center justify-center text-white text-xs font-bold shrink-0">{u.name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-medium truncate">{u.name}</p>
                <p className="text-white/30 text-xs">{u.email}</p>
              </div>
              <span className={`text-xs font-medium shrink-0 ${roleColor[u.role]}`}>{u.role}</span>
              <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[u.status]}`}>{u.status}</span>
              <div className="flex gap-1.5 shrink-0">
                {u.role === 'contador' && (
                  <button onClick={() => setChangePassModal(u)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400/70 hover:bg-purple-500/20 hover:text-purple-400 text-xs transition-all border border-purple-500/20">
                    <KeyRound size={11} />  Restablecer Contraseña
                  </button>
                )}
                {u.status === 'activo'
                  ? <button onClick={() => toggleStatus(u.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 text-xs transition-all border border-red-500/20"><XCircle size={11} /> Suspender</button>
                  : <button onClick={() => toggleStatus(u.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs transition-all border border-emerald-500/30"><CheckCircle size={11} /> Activar</button>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminBoletos() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Administración de Boletos</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Boletos activos',          value: '500', color: 'text-purple-400', icon: Ticket },
          { label: 'Boletos usados',           value: '120', color: 'text-emerald-400', icon: CheckCircle },
          { label: 'Reembolsos pendientes',    value: '3',   color: 'text-yellow-400', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/40 text-xs">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Acción cancelar evento — con flujo de reembolso correcto */}
      <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
        <h2 className="text-red-300 text-sm font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> Cancelar evento y procesar reembolsos
        </h2>
        <p className="text-white/40 text-xs leading-relaxed mb-3">
          Al cancelar un evento, el sistema reembolsa al usuario <span className="text-white/60 font-semibold">únicamente el precio base</span> del boleto. El cargo por servicio (15%) <span className="text-white/60 font-semibold">no se reembolsa</span> y queda retenido por la plataforma. El organizador no está obligado a devolver nada.
        </p>
        <div className="p-3 rounded-lg bg-black/20 space-y-1 text-xs mb-3">
          <div className="flex justify-between"><span className="text-white/30">Usuario pagó</span><span className="text-white/50">$115.00</span></div>
          <div className="flex justify-between"><span className="text-white/30">Usuario recibe (reembolso)</span><span className="text-emerald-400">$100.00 (precio base)</span></div>
          <div className="flex justify-between"><span className="text-white/30">Plataforma retiene</span><span className="text-pink-300">$10.86 (cargo - fee Stripe)</span></div>
          <div className="flex justify-between"><span className="text-white/30">Stripe retiene (del reembolso)</span><span className="text-red-400/70">$4.14</span></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all border border-red-500/30">
          <XCircle size={14} /> Seleccionar evento y cancelar
        </button>
      </div>
    </div>
  )
}

function SupervisarVentas() {
  const totalBruto = mockEvents.reduce((a, e) => {
    const total = e.precioBase * 1.15
    return a + total * e.sold
  }, 0)
  const totalCargos  = mockEvents.reduce((a, e) => a + e.precioBase * 0.15 * e.sold, 0)
  const feeStripe    = totalBruto * 0.036
  const netoPlataf   = totalCargos - feeStripe

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Supervisar Ventas</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ingresos brutos',          value: `$${(totalBruto/1000).toFixed(1)}K`,   color: 'text-purple-400',  icon: DollarSign },
          { label: 'Cargos por servicio',       value: `$${(totalCargos/1000).toFixed(1)}K`,  color: 'text-pink-400',    icon: TrendingUp },
          { label: 'Fee Stripe (3.6%)',          value: `$${(feeStripe/1000).toFixed(1)}K`,   color: 'text-red-400',     icon: AlertTriangle },
          { label: 'Neto plataforma',           value: `$${(netoPlataf/1000).toFixed(1)}K`,   color: 'text-emerald-400', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2"><p className="text-white/40 text-xs">{label}</p><Icon size={14} className={color} /></div>
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-white/70 text-sm font-semibold">Ventas por evento</h2>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {mockEvents.filter(e => e.sold > 0).map((event) => {
            const totalUsuario  = event.precioBase * 1.15
            const bruto         = totalUsuario * event.sold
            const cargoServ     = event.precioBase * 0.15 * event.sold
            const feeStr        = bruto * 0.036
            const netoOrg       = event.precioBase * event.sold
            return (
              <div key={event.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/80 text-sm">{event.title}</p>
                  <p className="text-purple-300 text-sm font-semibold">${bruto.toLocaleString()} bruto</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-white/30">
                  <span>{event.sold} boletos</span>
                  <span>Cargo serv: <span className="text-pink-300">${cargoServ.toLocaleString()}</span></span>
                  <span>Fee Stripe: <span className="text-red-400/70">-${feeStr.toFixed(0)}</span></span>
                  <span>A organizador: <span className="text-emerald-400">${netoOrg.toLocaleString()}</span></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AdminReportes() {
  const [activeReport, setActiveReport] = useState(null)

  const totalBruto   = mockEvents.reduce((a, e) => a + e.precioBase * 1.15 * e.sold, 0)
  const totalCargos  = mockEvents.reduce((a, e) => a + e.precioBase * 0.15 * e.sold, 0)
  const feeStripe    = totalBruto * 0.036
  const netoPlataf   = totalCargos - feeStripe
  const cancelados   = mockEvents.filter(e => e.status === 'cancelado')

  if (activeReport === 'ventas') {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-blue-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte General de Ventas</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Ingresos brutos',    value: `$${(totalBruto/1000).toFixed(1)}K`,  color: 'text-purple-400' },
            { label: 'Cargo servicio',     value: `$${(totalCargos/1000).toFixed(1)}K`, color: 'text-pink-400' },
            { label: 'Fee Stripe',         value: `$${(feeStripe/1000).toFixed(1)}K`,   color: 'text-red-400' },
            { label: 'Neto plataforma',    value: `$${(netoPlataf/1000).toFixed(1)}K`,  color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
              <p className="text-white/35 text-xs mb-1">{label}</p>
              <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]"><h2 className="text-white/70 text-sm font-semibold">Por evento</h2></div>
          <div className="divide-y divide-white/[0.05]">
            {mockEvents.filter(e => e.sold > 0).map(e => {
              const bruto = e.precioBase * 1.15 * e.sold
              return (
                <div key={e.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{e.title}</p>
                    <p className="text-white/30 text-xs">{e.organizer} · {e.sold} boletos</p>
                  </div>
                  <span className="text-purple-300 font-semibold text-sm">${bruto.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (activeReport === 'usuarios') {
    const porRol = mockUsers.reduce((acc, u) => { acc[u.role] = (acc[u.role]||0)+1; return acc }, {})
    const activos = mockUsers.filter(u => u.status === 'activo').length
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-blue-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Usuarios</h1>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total usuarios', value: mockUsers.length,              color: 'text-purple-400' },
            { label: 'Activos',        value: activos,                       color: 'text-emerald-400' },
            { label: 'Suspendidos',    value: mockUsers.length - activos,    color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
              <p className="text-white/35 text-xs mb-1">{label}</p>
              <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]"><h2 className="text-white/70 text-sm font-semibold">Distribución por rol</h2></div>
          <div className="divide-y divide-white/[0.05]">
            {Object.entries(porRol).map(([rol, count]) => (
              <div key={rol} className="flex justify-between items-center px-5 py-3">
                <span className={`text-sm font-medium ${roleColor[rol] || 'text-white/70'} capitalize`}>{rol}</span>
                <span className="text-white/50 text-sm">{count} usuario{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (activeReport === 'financiero') {
    const margen = ((netoPlataf / totalBruto) * 100).toFixed(1)
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-blue-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte Financiero</h1>
        </div>
        <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] space-y-3">
          {[
            { label: 'Ingresos brutos totales',    value: `$${totalBruto.toLocaleString('es-MX',{maximumFractionDigits:0})}`, color: 'text-purple-300' },
            { label: 'Cargos por servicio (15%)',  value: `$${totalCargos.toLocaleString('es-MX',{maximumFractionDigits:0})}`, color: 'text-pink-300' },
            { label: 'Fee Stripe (3.6%)',          value: `-$${feeStripe.toLocaleString('es-MX',{maximumFractionDigits:0})}`, color: 'text-red-400' },
            { label: 'Neto plataforma',            value: `$${netoPlataf.toLocaleString('es-MX',{maximumFractionDigits:0})}`, color: 'text-emerald-400' },
            { label: 'Margen neto',                value: `${margen}%`,                                                        color: 'text-blue-300' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-1 border-b border-white/[0.05] last:border-0">
              <span className="text-white/50 text-sm">{label}</span>
              <span className={`font-semibold text-sm ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeReport === 'reembolsos') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-blue-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Reembolsos</h1>
        </div>
        {cancelados.length === 0
          ? <div className="p-8 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center"><p className="text-white/30 text-sm">No hay reembolsos registrados</p></div>
          : <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
              <div className="divide-y divide-white/[0.05]">
                {cancelados.map(e => (
                  <div key={e.id} className="px-5 py-3">
                    <p className="text-white/80 text-sm font-medium">{e.title}</p>
                    <div className="flex gap-4 text-xs text-white/30 mt-1">
                      <span>Boletos: {e.sold}</span>
                      <span>Reembolso: <span className="text-yellow-400">${(e.precioBase * e.sold).toLocaleString()}</span></span>
                      <span>Cargo retenido: <span className="text-pink-300">${(e.precioBase * 0.15 * e.sold * 0.964).toLocaleString('es-MX',{maximumFractionDigits:0})}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        }
      </div>
    )
  }

  if (activeReport === 'categorias') {
    const CATS = ['Conciertos', 'Festivales', 'Teatro']
    const porCat = CATS.map(cat => {
      const eventosDecat = mockEvents.filter(e => e.category === cat)
      const vendidos     = eventosDecat.reduce((a, e) => a + e.sold, 0)
      const ingresos     = eventosDecat.reduce((a, e) => a + e.precioBase * 1.15 * e.sold, 0)
      return { cat, eventos: eventosDecat.length, vendidos, ingresos }
    })
    const maxVendidos = Math.max(...porCat.map(c => c.vendidos), 1)
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-blue-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Categorías</h1>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {porCat.map(({ cat, eventos, vendidos }) => (
            <div key={cat} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
              <p className="text-white/35 text-xs mb-1">{cat}</p>
              <p className="font-display text-2xl font-bold text-pink-300">{vendidos}</p>
              <p className="text-white/25 text-[10px] mt-0.5">boletos vendidos</p>
              <p className="text-white/20 text-[10px]">{eventos} evento{eventos !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]"><h2 className="text-white/70 text-sm font-semibold">Ventas e ingresos por categoría</h2></div>
          <div className="divide-y divide-white/[0.05]">
            {porCat.map(({ cat, eventos, vendidos, ingresos }) => (
              <div key={cat} className="px-5 py-4">
                <div className="flex justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">{cat}</span>
                  <span className="text-emerald-400 text-sm font-semibold">${ingresos.toLocaleString('es-MX', {maximumFractionDigits:0})}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(vendidos / maxVendidos) * 100}%` }} />
                </div>
                <p className="text-white/30 text-xs">{vendidos} boletos · {eventos} evento{eventos !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Vista principal
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Reportes Generales</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {[
          { label: 'Eventos',         value: mockEvents.length,          color: 'text-blue-400' },
          { label: 'Usuarios',        value: mockUsers.length,           color: 'text-purple-400' },
          { label: 'Neto plataforma', value: `$${(netoPlataf/1000).toFixed(1)}K`, color: 'text-emerald-400' },
          { label: 'Cancelados',      value: cancelados.length,          color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
            <p className="text-white/35 text-[10px] mb-1">{label}</p>
            <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: 'ventas',      title: 'Reporte general de ventas',  desc: 'Todas las ventas con desglose por evento y organizador.',     icon: BarChart2,     color: 'text-blue-400' },
          { id: 'usuarios',    title: 'Reporte de usuarios',        desc: 'Usuarios registrados, roles, actividad y estado de cuentas.', icon: Users,         color: 'text-purple-400' },
          { id: 'financiero',  title: 'Reporte financiero',         desc: 'Ingresos, cargos por servicio, fee Stripe y neto.',           icon: DollarSign,    color: 'text-emerald-400' },
          { id: 'reembolsos',  title: 'Reporte de reembolsos',      desc: 'Cancelaciones y reembolsos procesados.',                      icon: AlertTriangle, color: 'text-yellow-400' },
          { id: 'categorias',  title: 'Reporte de categorías',      desc: 'Distribución de eventos y ventas por categoría.',             icon: Tag,           color: 'text-pink-400' },
        ].map(({ id, title, desc, icon: Icon, color }) => (
          <div key={id} onClick={() => setActiveReport(id)}
            className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-blue-500/25 backdrop-blur-sm transition-all cursor-pointer group">
            <Icon size={18} className={`${color} mb-3`} />
            <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
            <p className="text-white/35 text-xs leading-relaxed mb-4">{desc}</p>
            <span className={`${color} group-hover:opacity-80 text-xs transition-opacity`}>Ver reporte →</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const views = { eventos: GestionEventos, categorias: GestionCategorias, usuarios: GestionUsuarios, ventas: SupervisarVentas, reportes: AdminReportes }

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={navItems} accentColor="blue" blockBack={true} searchPlaceholder="Buscar eventos, usuarios...">
      {(activeNav, query) => { const View = views[activeNav] || GestionEventos; return <View query={query} /> }}
    </DashboardLayout>
  )
}
