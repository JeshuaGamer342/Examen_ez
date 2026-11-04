import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center px-6">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">

        {/* 404 */}
        <p className="font-display text-[9rem] font-bold leading-none bg-gradient-to-b from-purple-400/40 to-transparent bg-clip-text text-transparent select-none mb-2">
          404
        </p>

        <h1 className="font-display text-2xl font-semibold text-white mb-3">
          Página no encontrada
        </h1>

        <p className="text-white/35 text-sm leading-relaxed mb-8">
          La página que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2">
            <ArrowLeft size={14} /> Ir al inicio
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn-outline px-6 py-2.5 text-sm"
          >
            Volver atrás
          </button>
        </div>

        {/* Links útiles */}
        <div className="mt-10 pt-8 border-t border-white/[0.05]">
          <p className="text-white/20 text-xs mb-4">Quizás buscabas:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Eventos',   href: '/' },
              { label: 'Login',     href: '/login' },
              { label: 'Registro',  href: '/registro' },
              { label: 'Mis boletos', href: '/mis-boletos' },
              { label: 'Contacto', href: '/contacto' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-purple-300 hover:border-purple-500/30 text-xs transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
