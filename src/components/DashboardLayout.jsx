/**
 * DashboardLayout.jsx — Layout compartido para todos los dashboards
 * Usado por: OrganizerDashboard, AdminDashboard, ContadorDashboard, UserDashboard
 *
 * Props:
 *   navItems     — array de { id, icon, label }
 *   children     — función que recibe activeNav y devuelve JSX
 *   accentColor  — 'purple' | 'blue' | 'emerald'
 *   blockBack    — si true, bloquea el botón atrás del navegador (admin, contador)
 *   showHomeLink — si true, muestra "Volver al inicio" en el sidebar (usuario, organizador)
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Search, ChevronDown, Menu, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logoHome from '../assets/logoHome.png'
import fondoMejorado from '../assets/fondoMejorado.jpg'

export default function DashboardLayout({
  navItems,
  children,
  accentColor       = 'purple',
  blockBack         = false,
  showHomeLink      = false,
  searchPlaceholder = 'Buscar...',
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeNav,    setActiveNav] = useState(navItems[0]?.id || '')
  const [sidebarOpen,  setSidebar]   = useState(false)
  const [userMenuOpen, setUserMenu]  = useState(false)
  const [searchQuery,  setSearch]    = useState('')

  // ── Bloquear botón "atrás" del navegador para admin y contador ──────────────
  useEffect(() => {
    if (!blockBack) return
    // Empuja un estado extra al historial para que el "atrás" no salga del panel
    window.history.pushState(null, '', window.location.href)
    const handlePop = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [blockBack])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const accent = {
    purple:  { text: 'text-purple-400',  gradient: 'from-purple-500/20 to-pink-500/10',    border: 'border-purple-500/20' },
    blue:    { text: 'text-blue-400',    gradient: 'from-blue-500/20 to-cyan-500/10',       border: 'border-blue-500/20' },
    emerald: { text: 'text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/10',    border: 'border-emerald-500/20' },
  }[accentColor]

  // ── Fix del flash en sidebar: sin border cuando está inactivo ───────────────
  // El problema era que Tailwind aplicaba 'border' como clase base y al cambiar
  // de activo a inactivo había un frame con border blanco. Ahora el border
  // solo existe cuando el item está activo.
  function navClass(id) {
    const base = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150'
    if (id === activeNav) {
      return `${base} bg-gradient-to-r ${accent.gradient} text-white border ${accent.border}`
    }
    return `${base} text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent`
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#0d0a1a] font-body relative">

      {/* Fondo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={fondoMejorado} alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a1a]/95 via-[#0d0a1a]/85 to-[#0d0a1a]/95" />
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebar(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-56 flex flex-col flex-shrink-0 h-full
        bg-[#0d0a1a]/80 backdrop-blur-xl
        border-r border-white/[0.07]
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/[0.07] shrink-0">
          <Link to={showHomeLink ? '/' : '#'} tabIndex={showHomeLink ? 0 : -1}>
            <img
              src={logoHome}
              alt="Elysium"
              className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]"
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveNav(id); setSidebar(false); setSearch('') }}
              className={navClass(id)}
            >
              <Icon size={16} className={activeNav === id ? accent.text : 'text-current'} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-3 py-4 border-t border-white/[0.06] shrink-0 space-y-1">
          {/* Volver al inicio — solo para usuario y organizador */}
          {showHomeLink && (
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors duration-150 border border-transparent"
            >
              <Home size={16} /> Volver al inicio
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Header */}
        <header className="flex items-center gap-4 px-5 py-3.5 bg-[#0d0a1a]/80 backdrop-blur-xl border-b border-white/[0.07] shrink-0">
          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setSidebar(true)}>
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-purple-500/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs"
              >✕</button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">

            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${
                  accentColor === 'blue'    ? 'from-blue-400 to-cyan-500'    :
                  accentColor === 'emerald' ? 'from-emerald-400 to-teal-500' :
                  'from-purple-400 to-pink-500'
                } flex items-center justify-center text-white text-xs font-bold`}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-white/80 text-sm hidden sm:block">
                  {user?.name?.split(' ')[0] || 'Usuario'}
                </span>
                <ChevronDown size={14} className={`text-white/40 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-[#13092a] border border-white/10 rounded-xl py-1 shadow-xl z-50">
                  <div className="px-3 py-2">
                    <p className="text-white/80 text-xs font-medium truncate">{user?.name}</p>
                    <p className="text-white/30 text-xs capitalize">{user?.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children(activeNav, searchQuery)}
        </main>
      </div>
    </div>
  )
}
