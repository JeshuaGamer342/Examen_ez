import { Link } from 'react-router-dom'
import logoHome from '../assets/logoHome.png'

const footerLinks = {
  'Descubrir': [
    { label: 'Todos los eventos', href: '/eventos' },
    { label: 'Conciertos',        href: '/eventos?q=Conciertos' },
    { label: 'Festivales',        href: '/eventos?q=Festivales' },
    { label: 'Teatro',            href: '/eventos?q=Teatro' },
  ],
  'Ayuda': [
    { label: 'Política de reembolso',  href: '/reembolsos' },
    { label: 'Contáctanos',            href: '/contacto' },
    { label: 'Términos y Condiciones', href: '/terminos' },
    { label: 'Privacidad',             href: '/privacidad' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#080612] border-t border-white/[0.06] mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Grid: brand izquierda, links empujados a la derecha ── */}
        <div className="flex flex-col sm:flex-row justify-between gap-8">

          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logoHome}
                alt="Elysium"
                className="h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(192,132,252,0.45)]"
              />
            </Link>
            <p className="text-white/30 text-xs leading-relaxed">
              Elysium es la plataforma de boletería digital de E-Corp, diseñada para conectar organizadores con su audiencia de forma segura, rápida y eficiente. Compra tus boletos con total confianza y disfruta de los mejores eventos.
            </p>
          </div>

          {/* Link columns — centrados */}
          <div className="flex gap-16 sm:mr-24">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        to={href}
                        className="text-white/30 hover:text-purple-300 text-xs transition-colors duration-200"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="mt-8 pt-5 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/20 text-xs">
            © 2026 Elysium Events Platform · E-Corp · UTSLRC
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/15 text-xs">Pagos seguros con Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}