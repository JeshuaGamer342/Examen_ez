import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, User, ChevronDown, ChevronLeft } from 'lucide-react'
import { navLinks } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import logoHome from '../assets/logoHome.png'

const pageTitles = {
  '/reembolsos': 'Política de Reembolso',
  '/contacto':   'Contáctanos',
  '/terminos':   'Términos y Condiciones',
  '/privacidad': 'Privacidad',
}

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')

  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  const isHome        = pathname === '/'
  const isEventos     = pathname === '/eventos'
  const isStaticPage  = Object.keys(pageTitles).includes(pathname)
  const isEventDetail = pathname.startsWith('/evento/')
  const isCheckout    = pathname === '/checkout'
  const isAuth        = ['/login', '/registro', '/forgot-password'].includes(pathname)
  const isDashboard   = ['/dashboard', '/mis-eventos', '/admin', '/contabilidad', '/mis-boletos'].includes(pathname)
  const staticTitle   = pageTitles[pathname]

  // Páginas donde NO se muestra la lupa
  const hideSearchIcon = isEventos || isCheckout || isStaticPage

  function getDashboardByRole(role) {
    switch (role) {
      case 'admin':       return '/admin'
      case 'organizador': return '/mis-eventos'
      case 'contador':    return '/contabilidad'
      default:            return '/dashboard'
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (isAuth || isDashboard) return null

  const UserActions = ({ mobile = false }) => {
    if (isAuthenticated) {
      return (
        <div className="relative">
          <Button variant="outline" onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2">
            <User size={15} />
            <span>{user.name?.split(' ')[0]}</span>
            <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </Button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-dark rounded-xl border border-white/10 py-2 shadow-xl z-50">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-white/80 text-sm font-medium truncate">{user.name}</p>
                <p className="text-white/40 text-xs capitalize">{user.role}</p>
              </div>
              <Link to={getDashboardByRole(user.role)}
                className="block px-4 py-2 text-white/70 hover:text-purple-400 text-sm transition-colors"
                onClick={() => setUserMenuOpen(false)}>
                Mi panel
              </Link>
            </div>
          )}
        </div>
      )
    }
    return (
      <div className={`flex gap-3 ${mobile ? 'w-full' : ''}`}>
        <Link to="/login" className={mobile ? 'flex-1' : ''}>
          <Button variant="outline" className={mobile ? 'w-full' : ''}>Iniciar sesión</Button>
        </Link>
        <Link to="/registro" className={mobile ? 'flex-1' : ''}>
          <Button className={mobile ? 'w-full' : ''}>Registrarse</Button>
        </Link>
      </div>
    )
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-dark shadow-lg shadow-black/40' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logoHome} alt="Elysium logo"
            className="h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
        </Link>

        {/* ── Centro dinámico ── */}

        {/* HOME — categorías */}
        {isHome && (
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map(link => (
              <Link key={link.label} to={link.href} className="nav-link"
                onClick={() => window.scrollTo(0,0)}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* EVENTOS — buscador integrado en navbar, sin repetir abajo */}
        {isEventos && (
          <form className="hidden md:flex flex-1 max-w-md mx-auto relative"
            onSubmit={e => {
              e.preventDefault()
              navigate(searchQuery.trim() ? `/eventos?q=${encodeURIComponent(searchQuery.trim())}` : '/eventos')
            }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar eventos, artistas o recintos..."
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-purple-500/40 transition-colors" />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); navigate('/eventos') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={13} />
              </button>
            )}
          </form>
        )}

        {/* PÁGINAS ESTÁTICAS — solo título, sin buscador */}
        {isStaticPage && (
          <div className="hidden md:flex flex-1 items-center justify-center gap-3">
            <button onClick={() => navigate(-1)}
              className="text-white/30 hover:text-white/60 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-white/70 text-sm font-medium">{staticTitle}</span>
          </div>
        )}

        {/* EVENTO DETALLE — breadcrumb */}
        {isEventDetail && (
          <div className="hidden md:flex flex-1 items-center justify-center gap-2 text-white/40 text-sm">
            <Link to="/" className="hover:text-white/70 transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/eventos" className="hover:text-white/70 transition-colors">Eventos</Link>
            <span>/</span>
            <span className="text-white/60">Detalle del evento</span>
          </div>
        )}

        {/* CHECKOUT */}
        {isCheckout && (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <span className="text-white/50 text-sm">Proceso de compra seguro 🔒</span>
          </div>
        )}

        {/* ── Acciones derecha ── */}
        <div className="hidden md:flex items-center gap-3">
          {/* Lupa — oculta en eventos, checkout y páginas estáticas */}
          {!hideSearchIcon && (
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="text-white/60 hover:text-purple-400 transition-colors p-2">
              <Search size={18} />
            </button>
          )}
          <UserActions />
        </div>

        {/* Mobile */}
        <button className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Search expand — solo Home y páginas que no son eventos/checkout/estáticas */}
      {searchOpen && !hideSearchIcon && (
        <div className="glass-dark border-t border-white/5 px-6 py-3 animate-fade-in">
          <form className="max-w-2xl mx-auto relative"
            onSubmit={e => {
              e.preventDefault()
              if (searchQuery.trim()) {
                navigate(`/eventos?q=${encodeURIComponent(searchQuery.trim())}`)
                setSearchOpen(false)
                setSearchQuery('')
              }
            }}>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar eventos, artistas, lugares..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-12 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400" />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-dark border-t border-white/5 px-6 py-4 flex flex-col gap-4 animate-fade-in">
          {isHome && navLinks.map(link => (
            <Link key={link.label} to={link.href} className="nav-link text-base"
              onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {isStaticPage && (
            <span className="text-white/60 text-sm font-medium">{staticTitle}</span>
          )}
          <div className="pt-2 border-t border-white/10">
            <UserActions mobile />
          </div>
        </div>
      )}
    </header>
  )
}
