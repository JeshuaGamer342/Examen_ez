/**
 * UserDashboard.jsx — Panel principal del usuario
 * Datos mock → reemplazar con api/tickets.js cuando el backend esté listo
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Ticket, User, History, CreditCard, Settings,
  LogOut, Search, ChevronDown,
  QrCode, Download,
  Calendar, MapPin, ChevronRight, Menu, X, Home,
  Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toTitleCase, validators } from '../utils/inputHelpers'
import { mockUserTickets, mockUserStats, mockRecommended } from '../data/mockDashboard'
import logoHome from '../assets/logoHome.png'
import fondoMejorado from '../assets/fondoMejorado.jpg'

// ─── Vista: Mi Perfil ─────────────────────────────────────────────────────────
function MiPerfil({ user }) {
  const [form, setForm] = useState({
    name:     user?.name  || '',
    email:    user?.email || '',
  })
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [toast,   setToast]   = useState(null)
  const [loading, setLoading] = useState(false)

  function showToast(msg, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleInfoChange = (e) => {
    const { name, value } = e.target
    const cleaned = name === 'name' ? toTitleCase(value) : value
    setForm({ ...form, [name]: cleaned })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handlePassChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  async function handleSaveInfo(e) {
    e.preventDefault()
    const errs = {}
    const nameErr  = validators.name(form.name)
    if (nameErr)   errs.name  = nameErr
    const emailErr = validators.email(form.email)
    if (emailErr)  errs.email = emailErr
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    // TODO: PUT /api/auth/profile → { name, email }
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    showToast('Datos actualizados correctamente')
  }

  async function handleSavePassword(e) {
    e.preventDefault()
    const errs = {}
    if (!passwords.current)             errs.current = 'Ingresa tu contraseña actual'
    if (!passwords.newPass)             errs.newPass = 'Ingresa la nueva contraseña'
    else if (passwords.newPass.length < 8) errs.newPass = 'Mínimo 8 caracteres'
    if (passwords.newPass !== passwords.confirm) errs.confirm = 'Las contraseñas no coinciden'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    // TODO: PUT /api/auth/change-password → { currentPassword, newPassword }
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setPasswords({ current: '', newPass: '', confirm: '' })
    showToast('Contraseña actualizada correctamente')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm backdrop-blur-sm ${
          toast.ok
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        }`}>
          {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-white font-display text-xl font-semibold">Mi Perfil</h1>
        <p className="text-white/40 text-xs mt-0.5">Administra tu información personal</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-white font-semibold">{user?.name}</p>
          <p className="text-white/40 text-xs capitalize mt-0.5">{user?.role} · {user?.email}</p>
        </div>
      </div>

      {/* Datos personales */}
      <form onSubmit={handleSaveInfo} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm space-y-4">
        <h2 className="text-white/80 text-sm font-semibold flex items-center gap-2">
          <User size={15} className="text-purple-400" /> Información personal
        </h2>

        <div className="reg-field">
          <label className="reg-label">Nombre completo</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInfoChange}
            className={`reg-input-no-icon ${errors.name ? 'error' : ''}`}
            placeholder="Tu nombre completo"
          />
          {errors.name && <span className="reg-error">{errors.name}</span>}
        </div>

        <div className="reg-field">
          <label className="reg-label">Correo electrónico</label>
          <div className="login-input-wrap">
            <span className="login-icon"><Mail size={14} /></span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInfoChange}
              className={`login-input ${errors.email ? 'border-red-500/50' : ''}`}
              placeholder="tu@correo.com"
            />
          </div>
          {errors.email && <span className="reg-error">{errors.email}</span>}
        </div>

        <button type="submit" disabled={loading} className="btn-gold px-6 py-2 text-sm">
          {loading ? <span className="reg-spinner" /> : 'Guardar cambios'}
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handleSavePassword} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm space-y-4">
        <h2 className="text-white/80 text-sm font-semibold flex items-center gap-2">
          <Lock size={15} className="text-purple-400" /> Cambiar contraseña
        </h2>

        {/* Contraseña actual */}
        <div className="reg-field">
          <label className="reg-label">Contraseña actual</label>
          <div className="login-input-wrap">
            <span className="login-icon"><Lock size={14} /></span>
            <input
              type={showCurrent ? 'text' : 'password'}
              name="current"
              value={passwords.current}
              onChange={handlePassChange}
              className={`login-input ${errors.current ? 'border-red-500/50' : ''}`}
              placeholder="Tu contraseña actual"
            />
            <button type="button" className="login-eye" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.current && <span className="reg-error">{errors.current}</span>}
        </div>

        {/* Nueva contraseña */}
        <div className="reg-field">
          <label className="reg-label">Nueva contraseña</label>
          <div className="login-input-wrap">
            <span className="login-icon"><Lock size={14} /></span>
            <input
              type={showNew ? 'text' : 'password'}
              name="newPass"
              value={passwords.newPass}
              onChange={handlePassChange}
              className={`login-input ${errors.newPass ? 'border-red-500/50' : ''}`}
              placeholder="Mínimo 8 caracteres"
            />
            <button type="button" className="login-eye" onClick={() => setShowNew(!showNew)}>
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {/* Barra de fortaleza */}
          {passwords.newPass.length > 0 && (() => {
            const s = passwords.newPass.length < 6 ? 1 : passwords.newPass.length < 10 ? 2 : 3
            const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500']
            const labels = ['', 'Débil', 'Regular', 'Fuerte']
            return (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                  {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= s ? colors[s] : 'bg-white/10'}`} />)}
                </div>
                <span className="text-xs text-white/40">{labels[s]}</span>
              </div>
            )
          })()}
          {errors.newPass && <span className="reg-error">{errors.newPass}</span>}
        </div>

        {/* Confirmar nueva contraseña */}
        <div className="reg-field">
          <label className="reg-label">Confirmar nueva contraseña</label>
          <div className="login-input-wrap">
            <span className="login-icon"><Lock size={14} /></span>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirm"
              value={passwords.confirm}
              onChange={handlePassChange}
              className={`login-input ${errors.confirm ? 'border-red-500/50' : ''}`}
              placeholder="Repite la nueva contraseña"
            />
            <button type="button" className="login-eye" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.confirm && <span className="reg-error">{errors.confirm}</span>}
        </div>

        <button type="submit" disabled={loading} className="btn-gold px-6 py-2 text-sm">
          {loading ? <span className="reg-spinner" /> : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const statusStyle = {
  confirmado: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pendiente:  'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
  cancelado:  'bg-red-500/15     text-red-400     border-red-500/30',
}
const statusLabel = {
  confirmado: 'Confirmado',
  pendiente:  'Pendiente',
  cancelado:  'Cancelado',
}

// ─── Historial de compras ─────────────────────────────────────────────────────
function HistorialCompras() {
  const statusBadge = {
    confirmado: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pendiente:  'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
    cancelado:  'bg-red-500/15     text-red-400     border-red-500/30',
  }
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-white font-display text-xl font-semibold">Historial de compras</h2>
        <p className="text-white/40 text-xs mt-0.5">Todas tus transacciones realizadas</p>
      </div>
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
        <div className="divide-y divide-white/[0.05]">
          {mockUserTickets.length === 0
            ? <p className="px-5 py-8 text-white/30 text-sm text-center">Sin compras registradas</p>
            : mockUserTickets.map(t => {
              const total = t.price ? (t.price * 1.15).toFixed(2) : null
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <img src={t.image} alt={t.eventName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{t.eventName}</p>
                    <p className="text-white/30 text-xs">{t.venue}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {total
                      ? <><p className="text-purple-300 text-sm font-semibold">${total} MXN</p>
                          <p className="text-white/25 text-[10px]">incl. cargo serv.</p></>
                      : <p className="text-white/30 text-xs">Por confirmar</p>
                    }
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge[t.status] || statusBadge.pendiente}`}>
                    {t.status}
                  </span>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

// ─── Métodos de pago ──────────────────────────────────────────────────────────
function MetodosPago() {
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h2 className="text-white font-display text-xl font-semibold">Métodos de pago</h2>
        <p className="text-white/40 text-xs mt-0.5">Administra tus métodos de pago a través de Stripe</p>
      </div>
      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <CreditCard size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Gestión segura con Stripe</p>
            <p className="text-white/40 text-xs leading-relaxed">Tus datos bancarios se manejan directamente en Stripe. Elysium no almacena información de tarjetas.</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200/70 leading-relaxed">
          Al continuar serás redirigido al portal de Stripe donde podrás agregar, editar o eliminar tus métodos de pago de forma segura.
        </div>
        {/* TODO: Jeshua → reemplazar con URL real del portal de Stripe para este usuario */}
        <button
          onClick={() => alert('Jeshua: conectar con el Customer Portal de Stripe → stripe.billingPortal.sessions.create()')}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-sm"
        >
          <ExternalLink size={15} /> Administrar en Stripe
        </button>
      </div>
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/25 leading-relaxed">
        🔒 Tus datos de pago están protegidos con cifrado SSL. Elysium utiliza Stripe como procesador de pagos certificado PCI DSS.
      </div>
    </div>
  )
}

const navItems = [
  { id: 'boletos',  icon: Ticket,   label: 'Mis Boletos' },
  { id: 'historial',icon: History,  label: 'Historial' },
  { id: 'pagos',    icon: CreditCard, label: 'Métodos de pago' },
  { id: 'config',   icon: Settings, label: 'Configuración' },
]

// ─── TicketCard ───────────────────────────────────────────────────────────────
function TicketCard({ ticket, onQR }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-purple-500/30 transition-all duration-200">
      <img src={ticket.image} alt={ticket.eventName} className="w-16 h-16 rounded-lg object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-white text-sm font-semibold leading-tight truncate">{ticket.eventName}</p>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[ticket.status]}`}>
            {statusLabel[ticket.status]}
          </span>
        </div>
        <p className="text-white/40 text-xs flex items-center gap-1 mb-1"><MapPin size={10} />{ticket.venue}</p>
        <p className="text-white/40 text-xs flex items-center gap-1 mb-3"><Calendar size={10} />{ticket.date}{ticket.time && ` · ${ticket.time}`}</p>
        {ticket.status !== 'pendiente' && (
          <div className="flex gap-2 flex-wrap">
            {ticket.qrCode && (
              <button onClick={() => onQR(ticket)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20 transition-all">
                <QrCode size={11} /> Ver QR
              </button>
            )}
            <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all">
              <Download size={11} /> Descargar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── QR Modal ────────────────────────────────────────────────────────────────
function QRModal({ ticket, onClose }) {
  if (!ticket) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#13092a] border border-purple-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h3 className="font-display text-white text-center text-lg mb-1">{ticket.eventName}</h3>
        <p className="text-white/40 text-xs text-center mb-5">{ticket.seat}</p>
        <div className="flex justify-center mb-4">
          <img src={ticket.qrCode} alt="QR" className="w-44 h-44 rounded-xl bg-white p-1" />
        </div>
        <p className="text-white/30 text-xs text-center mb-4">Muestra este código en la entrada</p>
        <p className="text-white/20 text-[10px] text-center">Tu boleto en PDF llegará a tu correo electrónico</p>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeNav, setActiveNav] = useState('boletos')
  const [sidebarOpen, setSidebar] = useState(false)
  const [qrTicket, setQrTicket]   = useState(null)
  const [userMenuOpen, setUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [verTodos, setVerTodos]     = useState(false)

  const featured     = mockUserTickets.find((t) => t.isFeatured)
  const allOther     = mockUserTickets.filter((t) => !t.isFeatured)
  const otherTickets = searchQuery.trim()
    ? allOther.filter(t =>
        t.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allOther

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    // Contenedor raíz: altura de pantalla, sin scroll externo
    <div className="h-screen flex overflow-hidden bg-[#0d0a1a] font-body relative">

      {/* ── Fondo global (igual que Hero) ──────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={fondoMejorado} alt="bg" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a1a]/95 via-[#0d0a1a]/80 to-[#0d0a1a]/95" />
      </div>

      {/* ── Overlay mobile sidebar ─────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebar(false)} />
      )}

      {/* ── SIDEBAR — sticky, altura completa, no hace scroll ──── */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-56 flex flex-col flex-shrink-0
        h-full
        bg-[#0d0a1a]/80 backdrop-blur-xl
        border-r border-white/[0.07]
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Logo — imagen igual que Navbar */}
        <div className="px-4 py-4 border-b border-white/[0.07] shrink-0">
          <Link to="/" className="flex items-center">
            <img
              src={logoHome}
              alt="Elysium"
              className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]"
            />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveNav(id); setSidebar(false) }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
                ${activeNav === id
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white border border-purple-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'}
              `}
            >
              <Icon size={16} className={activeNav === id ? 'text-purple-400' : 'text-current'} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-white/[0.07] shrink-0 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors duration-150 border border-transparent"
          >
            <Home size={16} /> Volver al inicio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN — scroll interno solo aquí ───────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-full">

        {/* Header */}
        <header className="shrink-0 flex items-center gap-4 px-5 py-3.5 bg-[#0d0a1a]/60 backdrop-blur-md border-b border-white/[0.06]">
          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setSidebar(true)}>
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar mis boletos..."
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-purple-500/40 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">✕</button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* User info */}
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-white/80 text-sm hidden sm:block">
                  Hola, {user?.name?.split(' ')[0] || 'Usuario'}
                </span>
                <ChevronDown size={14} className={`text-white/40 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setUserMenu(false)} />
                  <div className="fixed top-16 right-4 w-52 bg-[#13092a] border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.08]">
                      <p className="text-white/80 text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-white/40 text-xs capitalize">{user?.role}</p>
                    </div>
                    <button
                      onClick={async () => { await logout(); navigate('/') }}
                      className="w-full text-left px-4 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.05] text-xs transition-colors flex items-center gap-2"
                    >
                      <LogOut size={12} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Contenido — scroll solo aquí */}
        <main className="flex-1 overflow-y-auto p-5">
          {activeNav === 'config' ? (
            <MiPerfil user={user} />
          ) : activeNav === 'historial' ? (
            <HistorialCompras />
          ) : activeNav === 'pagos' ? (
            <MetodosPago />
          ) : (
          <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Próximo evento destacado ── */}
            {featured && (
              <section>
                <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
                  Próximos Eventos: Tu Gran Noche
                </h2>
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#13092a]/80 backdrop-blur-sm">
                  <img src={featured.image} alt={featured.eventName} className="absolute inset-0 w-full h-full object-cover opacity-25" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#13092a] via-[#13092a]/80 to-transparent" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5 p-5 sm:p-6">
                    <div className="flex gap-4 flex-1">
                      <div className="shrink-0">
                        <img src={featured.qrCode} alt="QR" className="w-20 h-20 rounded-xl bg-white p-1" />
                        <p className="text-white/30 text-[10px] text-center mt-1">Escanear para Ingresar</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest mb-1">{featured.category}</p>
                        <h3 className="font-display text-white text-xl font-bold mb-1">{featured.eventName}</h3>
                        <p className="text-white/50 text-sm flex items-center gap-1.5 mb-1"><MapPin size={12} />{featured.venue}</p>
                        <p className="text-white/50 text-sm flex items-center gap-1.5"><Calendar size={12} />{featured.date}, {featured.time}</p>
                        <p className="text-white/30 text-xs mt-2">{featured.seat}</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button onClick={() => setQrTicket(featured)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-sm font-medium transition-all">
                        <QrCode size={14} /> Ver QR Completo
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Mis entradas + Actividad ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <section className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold text-base">
                    {searchQuery
                      ? `Resultados para "${searchQuery}"`
                      : verTodos ? 'Todos mis boletos' : 'Mis Entradas Activas'}
                  </h2>
                  {!searchQuery && (
                    <button
                      onClick={() => setVerTodos(!verTodos)}
                      className="text-purple-300 hover:text-purple-200 text-xs flex items-center gap-1 transition-colors"
                    >
                      {verTodos ? 'Ver menos' : 'Ver todas'} <ChevronRight size={13} className={`transition-transform ${verTodos ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {otherTickets.length === 0
                    ? <p className="text-white/30 text-sm text-center py-6">Sin boletos que coincidan con "{searchQuery}"</p>
                    : (verTodos ? otherTickets : otherTickets.slice(0, 2)).map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} onQR={setQrTicket} />
                      ))
                  }
                  {!searchQuery && !verTodos && otherTickets.length > 2 && (
                    <button
                      onClick={() => setVerTodos(true)}
                      className="w-full py-2 text-xs text-purple-300/60 hover:text-purple-300 transition-colors text-center"
                    >
                      +{otherTickets.length - 2} boletos más →
                    </button>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-3">Tu Actividad</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Entradas Activas',    value: mockUserStats.activeTickets,  sub: null },
                    { label: 'Próximo Evento',       value: `${mockUserStats.nextEventDays}`, sub: 'días' },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
                      <p className="text-white/50 text-xs mb-1">{label}</p>
                      <p className="font-display text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                        {value}{sub && <span className="text-2xl"> {sub}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── Recomendados ── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-white font-semibold text-base">Recomendados</h2>
                  <p className="text-white/30 text-xs">Para Ti · recomendación en tu historial</p>
                </div>
                <button onClick={() => navigate('/eventos')} className="text-purple-300 hover:text-purple-200 text-xs flex items-center gap-1 transition-colors">
                  Ver más <ChevronRight size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mockRecommended.map((item) => (
                  <div key={item.id} className="group rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.07] hover:border-purple-500/30 transition-all duration-200 cursor-pointer backdrop-blur-sm">
                    <div className="relative h-28 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1a] to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                        <p className="text-white/40 text-[10px] truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => navigate('/eventos')} className="w-full text-center text-xs text-purple-300 hover:text-purple-200 py-1 transition-colors">
                        Explorar más
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
          )}
        </main>
      </div>

      {/* Modal QR */}
      <QRModal ticket={qrTicket} onClose={() => setQrTicket(null)} />
    </div>
  )
}