import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

const sections = [
  {
    title: '1. Aceptación de los Términos',
    content: `Al acceder y utilizar la plataforma Elysium Events Platform, desarrollada por E-Corp como proyecto académico de la Universidad Tecnológica de San Luis Río Colorado (UTSLRC), aceptas cumplir con los presentes Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices la plataforma.`,
  },
  {
    title: '2. Descripción del Servicio',
    content: `Elysium es una plataforma de boletería digital que permite a los usuarios explorar eventos, adquirir boletos de forma segura y gestionar sus compras. Los organizadores pueden publicar y administrar sus eventos a través del panel de control.`,
  },
  {
    title: '3. Registro y Cuenta de Usuario',
    content: `Para acceder a ciertas funciones de la plataforma, deberás registrarte con información veraz y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta. Notifica de inmediato cualquier uso no autorizado.`,
  },
  {
    title: '4. Compra de Boletos',
    content: `Al adquirir un boleto, el precio base es definido por el organizador del evento. La plataforma agrega un cargo por servicio visible en el proceso de pago. Los pagos son procesados de forma segura a través de Stripe. Una vez completada la compra, recibirás un boleto digital con código QR único para acceso al evento.`,
  },
  {
    title: '5. Política de Reembolsos',
    content: `Los reembolsos aplican únicamente cuando un evento es cancelado por el Administrador de la plataforma. En dicho caso, se reembolsa el precio base del boleto. El cargo por servicio no es reembolsable. Los usuarios no pueden solicitar cancelaciones individuales de boletos en la versión actual de la plataforma.`,
  },
  {
    title: '6. Responsabilidades del Organizador',
    content: `Los organizadores son responsables de la veracidad de la información de sus eventos, incluyendo fecha, lugar, descripción y precio. Elysium no se hace responsable por eventos cancelados, modificados o que no cumplan con las expectativas descritas por el organizador.`,
  },
  {
    title: '7. Conducta del Usuario',
    content: `El usuario se compromete a utilizar la plataforma de manera lícita y respetuosa. Queda prohibido el uso de la plataforma para actividades fraudulentas, reventa no autorizada de boletos, o cualquier actividad que pueda dañar a otros usuarios u organizadores.`,
  },
  {
    title: '8. Modificaciones',
    content: `Elysium se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor al momento de su publicación en la plataforma. El uso continuado del servicio implica la aceptación de los nuevos términos.`,
  },
  {
    title: '9. Contacto',
    content: `Para cualquier duda relacionada con estos términos, puedes contactarnos a través de la sección de Contacto de la plataforma o directamente con el equipo de E-Corp — UTSLRC.`,
  },
]

export default function Terminos() {
  return (
    <div className="min-h-screen bg-[#0d0a1a]">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-12">

        {/* Title */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Términos y Condiciones
          </h1>
          <p className="text-white/30 text-sm">
            Última actualización: enero 2026 · Elysium Events Platform · E-Corp · UTSLRC
          </p>
        </div>

        {/* Intro box */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-10">
          <p className="text-purple-200/70 text-sm leading-relaxed">
            Por favor lee detenidamente estos términos antes de utilizar la plataforma. Al registrarte o comprar boletos, confirmas que has leído y aceptado estas condiciones.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="border-b border-white/[0.05] pb-8 last:border-0">
              <h2 className="text-white font-semibold text-base mb-3">{s.title}</h2>
              <p className="text-white/40 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-2 transition-colors">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
          <Link to="/privacidad" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            Ver Política de Privacidad →
          </Link>
        </div>
      </div>
    </div>
  )
}
