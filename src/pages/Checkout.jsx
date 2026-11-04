/**
 * Checkout.jsx — Pasarela de pago /checkout
 * Recibe el pedido via location.state.pedido desde EventoDetalle
 * Stripe mock — reemplazar con Stripe.js real cuando backend esté listo
 *
 * TODO: POST /api/payments/create-intent → Stripe Payment Intent
 * TODO: POST /api/orders → guardar orden confirmada
 */

import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  CreditCard, Lock, CheckCircle, ChevronLeft,
  Calendar, MapPin, Ticket, AlertCircle, Eye, EyeOff,
} from 'lucide-react'
import logoHome from '../assets/logoHome.png'
import fondoMejorado from '../assets/fondoMejorado.jpg'
import { useAuth } from '../context/AuthContext'

// ─── Helper formato tarjeta ───────────────────────────────────────────────────
function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4)
  if (clean.length >= 3) return `${clean.slice(0,2)}/${clean.slice(2)}`
  return clean
}

// ─── Paso 1: Datos del comprador ──────────────────────────────────────────────
function PasoDatos({ form, onNext }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-display text-lg font-semibold">Confirma tus datos</h2>
        <p className="text-white/35 text-xs mt-0.5">Tu boleto en PDF será enviado al correo de tu cuenta</p>
      </div>

      <div className="space-y-3">
        {/* Nombre — solo lectura */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/50 to-pink-500/50 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {form.nombre?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">{form.nombre}</p>
            <p className="text-white/30 text-xs">Nombre de la cuenta</p>
          </div>
        </div>

        {/* Correo — solo lectura con candado */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
            <Lock size={14} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-medium truncate">{form.email}</p>
            <p className="text-white/30 text-xs">El PDF se enviará a este correo</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200/60 leading-relaxed">
          ¿Correo incorrecto? Puedes actualizarlo desde tu{' '}
          <span className="text-purple-300 font-medium">Configuración de cuenta</span> antes de continuar.
        </div>
      </div>

      <button onClick={onNext} className="btn-gold w-full py-3 text-sm mt-2">
        Continuar al pago →
      </button>
    </div>
  )
}

// ─── Paso 2: Datos de pago ────────────────────────────────────────────────────
function PasoPago({ form, setForm, errors, loading, paymentError, onPay, onBack }) {
  const [showCvv, setShowCvv] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-display text-lg font-semibold">Datos de pago</h2>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Lock size={11} className="text-emerald-400" />
          <p className="text-white/35 text-xs">Pago seguro con cifrado SSL · Procesado por Stripe</p>
        </div>
      </div>

      {/* Logos tarjetas */}
      <div className="flex items-center gap-2">
        {['VISA', 'MC', 'AMEX'].map(card => (
          <span key={card} className="px-2.5 py-1 rounded bg-white/[0.06] border border-white/[0.08] text-white/40 text-[10px] font-bold">{card}</span>
        ))}
      </div>

      <div className="space-y-3">
        {/* Número de tarjeta */}
        <div className="reg-field">
          <label className="reg-label">Número de tarjeta</label>
          <div className="login-input-wrap">
            <span className="login-icon"><CreditCard size={14} /></span>
            <input
              type="text"
              value={form.cardNumber}
              onChange={e => setForm({...form, cardNumber: formatCardNumber(e.target.value)})}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`login-input font-mono tracking-widest ${errors.cardNumber ? 'border-red-500/50' : ''}`}
            />
          </div>
          {errors.cardNumber && <span className="reg-error">{errors.cardNumber}</span>}
        </div>

        {/* Nombre en tarjeta */}
        <div className="reg-field">
          <label className="reg-label">Nombre en la tarjeta</label>
          <input
            type="text" value={form.cardName}
            onChange={e => setForm({...form, cardName: e.target.value.toUpperCase()})}
            placeholder="COMO APARECE EN LA TARJETA"
            className={`reg-input-no-icon font-mono tracking-wider ${errors.cardName ? 'error' : ''}`}
          />
          {errors.cardName && <span className="reg-error">{errors.cardName}</span>}
        </div>

        {/* Expiración y CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div className="reg-field">
            <label className="reg-label">Fecha de expiración</label>
            <input
              type="text" value={form.expiry}
              onChange={e => setForm({...form, expiry: formatExpiry(e.target.value)})}
              placeholder="MM/AA"
              maxLength={5}
              className={`reg-input-no-icon font-mono ${errors.expiry ? 'error' : ''}`}
            />
            {errors.expiry && <span className="reg-error">{errors.expiry}</span>}
          </div>
          <div className="reg-field">
            <label className="reg-label">CVV</label>
            <div className="login-input-wrap">
              <input
                type={showCvv ? 'text' : 'password'}
                value={form.cvv}
                onChange={e => setForm({...form, cvv: e.target.value.replace(/\D/g,'').slice(0,4)})}
                placeholder="•••"
                maxLength={4}
                className={`login-input font-mono ${errors.cvv ? 'border-red-500/50' : ''}`}
              />
              <button type="button" className="login-eye" onClick={() => setShowCvv(!showCvv)}>
                {showCvv ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {errors.cvv && <span className="reg-error">{errors.cvv}</span>}
          </div>
        </div>
      </div>

      {/* Aviso cargo no reembolsable */}
      <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
        <AlertCircle size={13} className="text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-yellow-300/70 text-xs leading-relaxed">
          El cargo por servicio (15%) <span className="font-semibold">no es reembolsable</span> en caso de cancelación. Solo se reembolsa el precio base del boleto.
        </p>
      </div>

      {/* Error de pago */}
      {paymentError && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-300 text-xs font-semibold mb-0.5">Pago rechazado</p>
            <p className="text-red-300/70 text-xs leading-relaxed">{paymentError.msg}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex-1 py-3 text-sm flex items-center justify-center gap-1">
          <ChevronLeft size={14} /> Volver
        </button>
        <button onClick={onPay} disabled={loading} className="btn-gold flex-1 py-3 text-sm flex items-center justify-center gap-2">
          {loading
            ? <><span className="reg-spinner" /> Procesando...</>
            : <><Lock size={13} /> Pagar ahora</>
          }
        </button>
      </div>
    </div>
  )
}

// ─── Paso 3: Confirmación ─────────────────────────────────────────────────────
function PasoConfirmacion({ pedido, email, onHome }) {
  const folio = `ELY-${Date.now().toString().slice(-8).toUpperCase()}`

  return (
    <div className="text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
        <CheckCircle size={40} className="text-emerald-400" />
      </div>

      <div>
        <h2 className="text-white font-display text-2xl font-bold mb-1">¡Compra exitosa!</h2>
        <p className="text-white/40 text-sm">Folio: <span className="text-purple-300 font-mono">{folio}</span></p>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-left space-y-2">
        <p className="text-white/70 text-sm font-semibold">{pedido.titulo}</p>
        <p className="text-white/40 text-xs flex items-center gap-1.5"><Calendar size={12} />{pedido.fecha}</p>
        <p className="text-white/40 text-xs flex items-center gap-1.5"><MapPin size={12} />{pedido.venue}</p>
        <div className="border-t border-white/[0.06] pt-2 mt-2">
          {pedido.items.map(item => (
            <div key={item.tipo} className="flex justify-between text-xs">
              <span className="text-white/50">{item.cantidad}x {item.tipo}</span>
              <span className="text-white/60">${(item.total * item.cantidad).toLocaleString()} MXN</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-white/[0.06]">
            <span className="text-white/70">Total pagado</span>
            <span className="text-purple-300">${pedido.subtotal.toLocaleString()} MXN</span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-emerald-300/80 text-xs leading-relaxed">
          Tu boleto en PDF fue enviado a <span className="font-semibold">{email}</span>. Preséntalo en la entrada del evento.
          {/* TODO: trigger email via backend POST /api/orders/:id/send-ticket */}
        </p>
      </div>

      <button onClick={onHome} className="btn-gold w-full py-3 text-sm">
        Volver al inicio
      </button>
    </div>
  )
}

// ─── Página Checkout ──────────────────────────────────────────────────────────
export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const pedido = location.state?.pedido
  // TODO: si no hay pedido en state, intentar recuperar de sessionStorage
  // para manejar recargas accidentales

  const [paso, setPaso] = useState(1) // 1: datos, 2: pago, 3: confirmación
  const [loading, setLoading] = useState(false)

  const [formDatos, setFormDatos] = useState({
    nombre:   user?.name  || '',
    email:    user?.email || '',
  })
  const [formPago, setFormPago] = useState({
    cardNumber: '',
    cardName:   '',
    expiry:     '',
    cvv:        '',
  })
  const [errors, setErrors] = useState({})

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center">
        <div className="text-center">
          <Ticket size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-4">No hay boletos seleccionados</p>
          <button onClick={() => navigate('/')} className="btn-gold px-6 py-2.5 text-sm">Explorar eventos</button>
        </div>
      </div>
    )
  }

  function validarDatos() {
    return true // datos son solo lectura, no requieren validación
  }

  function validarPago() {
    const e = {}
    const num = formPago.cardNumber.replace(/\s/g,'')
    if (num.length < 16) e.cardNumber = 'Número de tarjeta inválido'
    if (!formPago.cardName.trim()) e.cardName = 'Ingresa el nombre de la tarjeta'
    if (!formPago.expiry || formPago.expiry.length < 5) e.expiry = 'Fecha inválida'
    if (!formPago.cvv || formPago.cvv.length < 3) e.cvv = 'CVV inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNextDatos() {
    if (validarDatos()) { setErrors({}); setPaso(2) }
  }

  const [paymentError, setPaymentError] = useState(null)

  async function handlePagar() {
    if (!validarPago()) return
    setLoading(true)
    setPaymentError(null)
    // TODO: POST /api/payments/create-intent → { amount: pedido.subtotal, currency: 'mxn' }
    // TODO: Stripe.confirmCardPayment(clientSecret, { payment_method: { card } })
    await new Promise(r => setTimeout(r, 2000))

    // Simulación de respuestas de Stripe según número de tarjeta
    const num = formPago.cardNumber.replace(/\s/g, '')
    if (num === '4000000000000002') {
      setLoading(false)
      setPaymentError({ code: 'card_declined', msg: 'Tu tarjeta fue rechazada. Verifica los datos o usa otra tarjeta.' })
      return
    }
    if (num === '4000000000009995') {
      setLoading(false)
      setPaymentError({ code: 'insufficient_funds', msg: 'Fondos insuficientes. Verifica el saldo de tu tarjeta.' })
      return
    }
    if (num === '4000000000000069') {
      setLoading(false)
      setPaymentError({ code: 'expired_card', msg: 'Tu tarjeta está vencida. Usa una tarjeta vigente.' })
      return
    }
    if (num === '4000000000000127') {
      setLoading(false)
      setPaymentError({ code: 'incorrect_cvc', msg: 'El código de seguridad (CVV) es incorrecto.' })
      return
    }

    // Pago aprobado
    setLoading(false)
    // TODO: POST /api/orders → { pedidoId, eventoId, items, comprador, folio }
    setPaso(3)
  }

  return (
    <div className="min-h-screen bg-[#0d0a1a] font-body relative">

      {/* Fondo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={fondoMejorado} alt="bg" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[#0d0a1a]/80" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.07] bg-[#0d0a1a]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <img src={logoHome} alt="Elysium" className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]" />
          </Link>
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Lock size={12} className="text-emerald-400" />
            Pago seguro
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Formulario */}
          <div className="lg:col-span-3">

            {/* Stepper */}
            {paso < 3 && (
              <div className="flex items-center gap-2 mb-6">
                {[
                  { n: 1, label: 'Datos' },
                  { n: 2, label: 'Pago' },
                ].map(({ n, label }, i) => (
                  <div key={n} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      paso >= n
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-500/50 text-white'
                        : 'bg-white/[0.05] border-white/[0.1] text-white/30'
                    }`}>{n}</div>
                    <span className={`text-xs ${paso >= n ? 'text-white/60' : 'text-white/25'}`}>{label}</span>
                    {i < 1 && <div className={`h-px w-8 ${paso > n ? 'bg-purple-500/50' : 'bg-white/[0.08]'}`} />}
                  </div>
                ))}
              </div>
            )}

            {/* Card del formulario */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
              {paso === 1 && (
                <PasoDatos form={formDatos} onNext={handleNextDatos} />
              )}
              {paso === 2 && (
                <PasoPago
                  form={formPago} setForm={setFormPago}
                  errors={errors} loading={loading}
                  paymentError={paymentError}
                  onPay={handlePagar}
                  onBack={() => { setErrors({}); setPaso(1) }}
                />
              )}
              {paso === 3 && (
                <PasoConfirmacion
                  pedido={pedido}
                  email={formDatos.email}
                  onHome={() => navigate('/')}
                />
              )}
            </div>
          </div>

          {/* Resumen del pedido */}
          {paso < 3 && (
            <div className="lg:col-span-2">
              <div className="sticky top-6 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm space-y-4">
                <h3 className="text-white/70 text-sm font-semibold">Resumen del pedido</h3>

                {/* Evento */}
                <div className="flex gap-3">
                  <img src={pedido.image} alt={pedido.titulo} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm font-semibold leading-tight truncate">{pedido.titulo}</p>
                    <p className="text-white/35 text-xs mt-1 flex items-center gap-1"><Calendar size={11} />{pedido.fecha}</p>
                    <p className="text-white/35 text-xs flex items-center gap-1"><MapPin size={11} />{pedido.venue}</p>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-3 space-y-2">
                  {pedido.items.map(item => (
                    <div key={item.tipo} className="flex justify-between items-center">
                      <div>
                        <p className="text-white/60 text-xs">{item.cantidad}x Boleto {item.tipo}</p>
                        <p className="text-white/25 text-[10px]">Base: ${item.precioBase} + cargo: ${item.cargo.toFixed(0)}</p>
                      </div>
                      <p className="text-white/70 text-xs font-medium">${(item.total * item.cantidad).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center">
                  <span className="text-white/50 text-sm">Total</span>
                  <span className="text-purple-300 font-bold text-xl">${pedido.subtotal.toLocaleString()} <span className="text-white/25 text-xs font-normal">MXN</span></span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <Lock size={11} className="text-emerald-400 shrink-0" />
                  <p className="text-white/25 text-[10px]">Pago cifrado y seguro. No almacenamos datos de tu tarjeta.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
