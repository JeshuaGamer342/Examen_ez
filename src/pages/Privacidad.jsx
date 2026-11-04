import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

const sections = [
  {
    title: '1. Información que Recopilamos',
    content: `Al registrarte en Elysium recopilamos tu nombre completo, correo electrónico y contraseña (cifrada). Durante la compra de boletos, procesamos información de pago a través de Stripe — Elysium no almacena datos de tarjetas de crédito directamente. También podemos registrar información sobre tu actividad en la plataforma como eventos visitados e historial de compras.`,
  },
  {
    title: '2. Uso de la Información',
    content: `Utilizamos tu información para gestionar tu cuenta y tus boletos, procesar pagos de forma segura, enviarte notificaciones relacionadas con tus eventos y compras, mejorar la experiencia de la plataforma, y cumplir con obligaciones legales cuando sea necesario.`,
  },
  {
    title: '3. Compartición de Datos',
    content: `No vendemos ni compartimos tu información personal con terceros con fines comerciales. Tu información puede ser compartida únicamente con Stripe para el procesamiento de pagos y con el organizador del evento para la gestión del acceso. En ningún caso se comparte con anunciantes u otras plataformas.`,
  },
  {
    title: '4. Seguridad de los Datos',
    content: `Implementamos medidas de seguridad estándar de la industria para proteger tu información, incluyendo cifrado SSL/TLS en todas las comunicaciones, contraseñas almacenadas con hash seguro, y tokens JWT para la autenticación de sesiones. Sin embargo, ningún sistema es completamente infalible.`,
  },
  {
    title: '5. Cookies',
    content: `Elysium puede utilizar cookies técnicas necesarias para el funcionamiento de la plataforma, como mantener tu sesión iniciada. No utilizamos cookies de rastreo publicitario. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.`,
  },
  {
    title: '6. Tus Derechos',
    content: `Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento desde la configuración de tu cuenta. También puedes solicitar la portabilidad de tus datos o la eliminación completa de tu cuenta contactando al equipo de soporte.`,
  },
  {
    title: '7. Retención de Datos',
    content: `Conservamos tu información mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos personales serán eliminados dentro de un plazo razonable, excepto aquellos que debamos conservar por obligaciones legales o para la resolución de disputas.`,
  },
  {
    title: '8. Cambios a esta Política',
    content: `Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos a través de la plataforma o por correo electrónico. El uso continuado de Elysium tras dichos cambios implica tu aceptación.`,
  },
]

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-[#0d0a1a]">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-12">

        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Política de Privacidad
          </h1>
          <p className="text-white/30 text-sm">
            Última actualización: enero 2026 · Elysium Events Platform · E-Corp · UTSLRC
          </p>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-10">
          <p className="text-purple-200/70 text-sm leading-relaxed">
            Tu privacidad es importante para nosotros. Esta política explica qué información recopilamos, cómo la usamos y cómo la protegemos.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="border-b border-white/[0.05] pb-8 last:border-0">
              <h2 className="text-white font-semibold text-base mb-3">{s.title}</h2>
              <p className="text-white/40 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-2 transition-colors">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
          <Link to="/terminos" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            Ver Términos y Condiciones →
          </Link>
        </div>
      </div>
    </div>
  )
}
