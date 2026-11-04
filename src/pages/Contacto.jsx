import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react'
import { toTitleCase, validators } from '../utils/inputHelpers'

const topics = [
  'Problema con mi boleto',
  'Reembolso o cancelación',
  'Problema con el pago',
  'Problema con mi cuenta',
  'Quiero ser organizador',
  'Otro',
]

export default function Contacto() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const cleaned = name === 'name' ? toTitleCase(value) : value
    setForm({ ...form, [name]: cleaned })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const e = {}
    const nameErr = validators.name(form.name)
    if (nameErr)   e.name  = nameErr
    const emailErr = validators.email(form.email)
    if (emailErr)  e.email = emailErr
    if (!form.topic)          e.topic   = 'Selecciona un tema'
    if (!form.message.trim()) e.message = 'El mensaje es requerido'
    else if (form.message.trim().length < 20) e.message = 'Mínimo 20 caracteres'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsLoading(true)
    // TODO: conectar con backend → POST /api/contact
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#0d0a1a]">
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="text-white/30 text-sm">
            Nuestro equipo responderá tu mensaje a la brevedad posible.
          </p>
        </div>

        {/* Success state */}
        {sent ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-white text-xl font-semibold mb-2">
              ¡Mensaje enviado!
            </h2>
            <p className="text-white/40 text-sm mb-8 max-w-xs">
              Hemos recibido tu mensaje. Te responderemos pronto al correo proporcionado.
            </p>
            <Link to="/" className="btn-gold px-6 py-2.5 text-sm">
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Info lateral */}
            <div className="space-y-5">
              {[
                { title: 'Tiempo de respuesta', desc: 'Respondemos en un plazo de 24 a 48 horas hábiles.' },
                { title: 'Soporte técnico', desc: 'Para problemas urgentes con boletos o pagos, indica el ID de tu orden.' },
                { title: 'Proyecto académico', desc: 'Elysium es un proyecto de UTSLRC desarrollado por E-Corp.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-white/70 text-xs font-semibold mb-1">{title}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4" noValidate>

              {/* Nombre */}
              <div className="reg-field">
                <label className="reg-label">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={handleChange}
                  className={`reg-input-no-icon ${errors.name ? 'error' : ''}`}
                />
                {errors.name && <span className="reg-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="reg-field">
                <label className="reg-label">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`reg-input-no-icon ${errors.email ? 'error' : ''}`}
                />
                {errors.email && <span className="reg-error">{errors.email}</span>}
              </div>

              {/* Tema */}
              <div className="reg-field">
                <label className="reg-label">Tema</label>
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  className={`reg-input-no-icon ${errors.topic ? 'error' : ''}`}
                  style={{ appearance: 'none' }}
                >
                  <option value="" disabled>Selecciona un tema</option>
                  {topics.map((t) => (
                    <option key={t} value={t} className="bg-[#13092a]">{t}</option>
                  ))}
                </select>
                {errors.topic && <span className="reg-error">{errors.topic}</span>}
              </div>

              {/* Mensaje */}
              <div className="reg-field">
                <label className="reg-label">Mensaje</label>
                <textarea
                  name="message"
                  placeholder="Describe tu problema o consulta con el mayor detalle posible..."
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className={`reg-input-no-icon resize-none ${errors.message ? 'error' : ''}`}
                />
                {errors.message && <span className="reg-error">{errors.message}</span>}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full flex items-center justify-center gap-2 mt-2"
              >
                {isLoading
                  ? <span className="reg-spinner" />
                  : <><Send size={14} /> Enviar mensaje</>
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
