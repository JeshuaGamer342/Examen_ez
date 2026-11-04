/**
 * ForgotPassword.jsx — Recuperación de contraseña
 *
 * Flujo en 3 pasos:
 *   1. Ingresa tu correo → el backend envía un código
 *   2. Ingresa el código de 6 dígitos recibido por email
 *   3. Crea tu nueva contraseña
 *
 * TODO: conectar con backend:
 *   POST /api/auth/forgot-password   → envía código al correo
 *   POST /api/auth/verify-code       → valida el código
 *   POST /api/auth/reset-password    → actualiza la contraseña
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import logoLogin from '../assets/logoLogin.png'
import fondoMejorado from '../assets/fondoMejorado.jpg'

const STEPS = { EMAIL: 1, CODE: 2, PASSWORD: 3, DONE: 4 }

// ─── Step 1: Ingresa correo ───────────────────────────────────────────────────
function StepEmail({ onNext }) {
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [isLoading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Ingresa un correo válido'); return
    }
    setLoading(true)
    // TODO: POST /api/auth/forgot-password → { email }
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    onNext(email)
  }

  return (
    <>
      <div className="flex justify-center mb-2">
        <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
          <Mail size={22} className="text-purple-400" />
        </div>
      </div>

      <h1 className="login-title mb-1">¿Olvidaste tu contraseña?</h1>
      <p className="login-subtitle">
        Ingresa tu correo y te enviaremos un código de verificación.
      </p>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-field">
          <label className="login-label">Correo electrónico</label>
          <div className="login-input-wrap">
            <span className="login-icon">
              <Mail size={15} />
            </span>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className="login-input"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <button type="submit" className="btn-gold w-full mt-2" disabled={isLoading}>
          {isLoading ? <span className="login-spinner" /> : 'Enviar código'}
        </button>
      </form>
    </>
  )
}

// ─── Step 2: Ingresa el código ────────────────────────────────────────────────
function StepCode({ email, onNext, onBack }) {
  const [code, setCode]         = useState(['', '', '', '', '', ''])
  const [error, setError]       = useState('')
  const [isLoading, setLoading] = useState(false)
  const [resent, setResent]     = useState(false)

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[idx] = val
    setCode(next)
    // Auto-focus siguiente
    if (val && idx < 5) {
      document.getElementById(`code-${idx + 1}`)?.focus()
    }
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      document.getElementById(`code-${idx - 1}`)?.focus()
    }
  }

  const handleResend = async () => {
    // TODO: POST /api/auth/forgot-password → { email }
    await new Promise((r) => setTimeout(r, 800))
    setResent(true)
    setTimeout(() => setResent(false), 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const full = code.join('')
    if (full.length < 6) { setError('Ingresa los 6 dígitos del código'); return }
    setLoading(true)
    // TODO: POST /api/auth/verify-code → { email, code: full }
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    onNext(full)
  }

  return (
    <>
      <div className="flex justify-center mb-2">
        <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
          <KeyRound size={22} className="text-purple-400" />
        </div>
      </div>

      <h1 className="login-title mb-1">Revisa tu correo</h1>
      <p className="login-subtitle">
        Enviamos un código de 6 dígitos a <span className="text-purple-300">{email}</span>
      </p>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        {/* Inputs de código */}
        <div className="flex justify-center gap-2 my-2">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`code-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-11 h-12 text-center text-lg font-bold text-white rounded-xl
                         bg-white/[0.06] border border-purple-500/25
                         focus:outline-none focus:border-purple-400 focus:bg-white/10
                         transition-all duration-200 caret-purple-400"
            />
          ))}
        </div>

        <button type="submit" className="btn-gold w-full mt-2" disabled={isLoading}>
          {isLoading ? <span className="login-spinner" /> : 'Verificar código'}
        </button>
      </form>

      {/* Reenviar */}
      <div className="mt-4 text-center">
        {resent ? (
          <p className="text-emerald-400 text-xs">✓ Código reenviado a tu correo</p>
        ) : (
          <p className="text-white/30 text-xs">
            ¿No recibiste el código?{' '}
            <button onClick={handleResend} className="text-purple-300 hover:text-purple-200 transition-colors">
              Reenviar
            </button>
          </p>
        )}
      </div>

      <button onClick={onBack} className="mt-3 w-full text-white/30 hover:text-white/60 text-xs transition-colors flex items-center justify-center gap-1">
        <ArrowLeft size={12} /> Cambiar correo
      </button>
    </>
  )
}

// ─── Step 3: Nueva contraseña ─────────────────────────────────────────────────
function StepPassword({ email, code, onDone }) {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [errors, setErrors]       = useState({})
  const [isLoading, setLoading]   = useState(false)

  const validate = () => {
    const e = {}
    if (!password)            e.password = 'La contraseña es requerida'
    else if (password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (password !== confirm) e.confirm  = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    // TODO: POST /api/auth/reset-password → { email, code, newPassword: password }
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    onDone()
  }

  // Indicador de fortaleza
  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Débil', 'Regular', 'Fuerte']
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500']

  return (
    <>
      <div className="flex justify-center mb-2">
        <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
          <Lock size={22} className="text-purple-400" />
        </div>
      </div>

      <h1 className="login-title mb-1">Nueva contraseña</h1>
      <p className="login-subtitle">Elige una contraseña segura para tu cuenta.</p>

      <form onSubmit={handleSubmit} className="login-form">

        {/* Nueva contraseña */}
        <div className="login-field">
          <label className="login-label">Nueva contraseña</label>
          <div className="login-input-wrap">
            <span className="login-icon"><Lock size={15} /></span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }) }}
              className={`login-input ${errors.password ? 'border-red-500/50' : ''}`}
            />
            <button type="button" className="login-eye" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {/* Barra de fortaleza */}
          {password.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-white/10'}`} />
                ))}
              </div>
              <span className="text-xs text-white/40">{strengthLabel[strength]}</span>
            </div>
          )}
          {errors.password && <span className="reg-error">{errors.password}</span>}
        </div>

        {/* Confirmar */}
        <div className="login-field">
          <label className="login-label">Confirmar contraseña</label>
          <div className="login-input-wrap">
            <span className="login-icon"><Lock size={15} /></span>
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors({ ...errors, confirm: '' }) }}
              className={`login-input ${errors.confirm ? 'border-red-500/50' : ''}`}
            />
            <button type="button" className="login-eye" onClick={() => setShowConf(!showConf)}>
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirm && <span className="reg-error">{errors.confirm}</span>}
        </div>

        <button type="submit" className="btn-gold w-full mt-2" disabled={isLoading}>
          {isLoading ? <span className="login-spinner" /> : 'Cambiar contraseña'}
        </button>
      </form>
    </>
  )
}

// ─── Step 4: Éxito ────────────────────────────────────────────────────────────
function StepDone() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
        <CheckCircle size={32} className="text-emerald-400" />
      </div>
      <h1 className="login-title mb-2">¡Contraseña actualizada!</h1>
      <p className="login-subtitle mb-6">
        Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión.
      </p>
      <button onClick={() => navigate('/login')} className="btn-gold px-8">
        Iniciar sesión
      </button>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const [step, setStep]   = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [code, setCode]   = useState('')

  // Indicador de progreso
  const progress = ((step - 1) / 3) * 100

  return (
    <div className="login-root">
      <div className="login-bg">
        <img src={fondoMejorado} alt="Background" className="login-bg-img" />
      </div>
      <div className="login-overlay" />

      <div className="login-card" style={{ maxWidth: '420px' }}>

        {/* Logo */}
        <img src={logoLogin} alt="Elysium" className="login-logo" />

        {/* Barra de progreso */}
        {step !== STEPS.DONE && (
          <div className="w-full h-0.5 bg-white/[0.06] rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Pasos */}
        {step === STEPS.EMAIL && (
          <StepEmail onNext={(em) => { setEmail(em); setStep(STEPS.CODE) }} />
        )}
        {step === STEPS.CODE && (
          <StepCode
            email={email}
            onNext={(c) => { setCode(c); setStep(STEPS.PASSWORD) }}
            onBack={() => setStep(STEPS.EMAIL)}
          />
        )}
        {step === STEPS.PASSWORD && (
          <StepPassword
            email={email}
            code={code}
            onDone={() => setStep(STEPS.DONE)}
          />
        )}
        {step === STEPS.DONE && <StepDone />}

        {/* Link a login */}
        {step !== STEPS.DONE && (
          <div className="login-links mt-2">
            <Link to="/login" className="login-link flex items-center gap-1">
              <ArrowLeft size={13} /> Volver al login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
