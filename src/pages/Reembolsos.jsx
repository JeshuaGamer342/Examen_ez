import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const sections = [
  {
    title: '1. Condiciones para el Reembolso',
    content: `Los reembolsos únicamente se procesarán cuando el Administrador de la plataforma cancele un evento de forma oficial. Los usuarios no podrán solicitar la cancelación de sus boletos de forma individual ni obtener reembolso por decisión propia.`,
  },
  {
    title: '2. Cargo por Servicio No Reembolsable',
    content: `El cargo por servicio del 15% aplicado sobre el precio base de cada boleto no será reembolsable bajo ninguna circunstancia, incluyendo la cancelación del evento por parte del Administrador. Únicamente se reembolsa el precio base del boleto definido por el organizador.`,
  },
  {
    title: '3. Proceso de Reembolso',
    content: `Una vez que el Administrador cancele un evento, el sistema iniciará automáticamente el proceso de reembolso del precio base a todos los compradores afectados. El reembolso se realiza al método de pago original utilizado en la compra, procesado a través de Stripe.`,
  },
  {
    title: '4. Tiempo de Procesamiento',
    content: `El tiempo estimado para que el reembolso se refleje en tu cuenta depende de tu banco o entidad financiera. Generalmente oscila entre 5 y 10 días hábiles a partir de la confirmación de cancelación del evento.`,
  },
  {
    title: '5. Notificaciones',
    content: `Cuando un evento sea cancelado y se genere un reembolso, recibirás una notificación por correo electrónico con los detalles del monto reembolsado y el plazo estimado. También podrás consultar el estado desde tu panel de usuario en la sección Mis Boletos.`,
  },
  {
    title: '6. Preguntas o Disputas',
    content: `Si pasado el plazo estimado no has recibido tu reembolso, o tienes alguna duda sobre el proceso, puedes contactarnos directamente a través de la sección de Contacto. Nuestro equipo revisará tu caso a la brevedad.`,
  },
]

export default function Reembolsos() {
  return (
    <div className="min-h-screen bg-[#0d0a1a]">
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-12">

        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Política de Reembolso
          </h1>
          <p className="text-white/30 text-sm">
            Última actualización: enero 2026 · Elysium Events Platform · E-Corp · UTSLRC
          </p>
        </div>

        {/* Resumen visual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3">
            <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-300 text-sm font-semibold mb-1">Sí se reembolsa</p>
              <p className="text-white/40 text-xs leading-relaxed">
                El precio base del boleto, cuando el Administrador cancela el evento oficialmente.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
            <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-semibold mb-1">No se reembolsa</p>
              <p className="text-white/40 text-xs leading-relaxed">
                El cargo por servicio del 15% bajo ninguna circunstancia, ni a solicitud individual del usuario.
              </p>
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3 mb-10">
          <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-200/70 text-sm leading-relaxed">
            Los usuarios no pueden cancelar boletos de forma individual. Los reembolsos solo aplican cuando el Administrador cancela el evento desde la plataforma.
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="border-b border-white/[0.05] pb-8 last:border-0">
              <h2 className="text-white font-semibold text-base mb-3">{s.title}</h2>
              <p className="text-white/40 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-2 transition-colors">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
          <Link to="/contacto" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ¿Dudas? Contáctanos →
          </Link>
        </div>
      </div>
    </div>
  )
}
