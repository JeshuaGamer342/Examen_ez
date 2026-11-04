import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toTitleCase, validators } from '../utils/inputHelpers'
import { CheckCircle, Mail } from 'lucide-react'
import logoLogin from '../assets/logoLogin.png'
import fondoMejorado from '../assets/fondoMejorado.jpg'

// ─── Modal OTP ────────────────────────────────────────────────────────────────
function OtpModal({ email, onVerified }) {
  const [code, setCode]         = useState(['', '', '', '', '', ''])
  const [error, setError]       = useState('')
  const [isLoading, setLoading] = useState(false)
  const [resent, setResent]     = useState(false)

  function handleChange(val, idx) {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[idx] = val
    setCode(next)
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus()
    }
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus()
    }
  }

  async function handleResend() {
    // TODO: POST /api/auth/resend-otp → { email }
    await new Promise(r => setTimeout(r, 800))
    setResent(true)
    setTimeout(() => setResent(false), 4000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const full = code.join('')
    if (full.length < 6) { setError('Ingresa los 6 dígitos del código'); return }
    setLoading(true)
    // TODO: POST /api/auth/verify-email → { email, code: full }
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    onVerified()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl p-7 text-center">

        <div className="w-14 h-14 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto mb-4">
          <Mail size={26} className="text-purple-400" />
        </div>

        <h2 className="font-display text-white text-xl font-semibold mb-1">Verifica tu correo</h2>
        <p className="text-white/40 text-sm mb-1">Enviamos un código de 6 dígitos a</p>
        <p className="text-purple-300 text-sm font-medium mb-5 truncate">{email}</p>

        {error && <p className="text-red-400/80 text-xs mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Inputs OTP */}
          <div className="flex justify-center gap-2 mb-5">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                className="w-11 h-12 text-center text-lg font-bold text-white rounded-xl
                           bg-white/[0.06] border border-purple-500/25
                           focus:outline-none focus:border-purple-400 focus:bg-white/10
                           transition-all duration-200 caret-purple-400"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full"
          >
            {isLoading ? <span className="login-spinner" /> : 'Verificar y continuar'}
          </button>
        </form>

        {/* Reenviar */}
        <div className="mt-4">
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
      </div>
    </div>
  )
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [role, setRole]                 = useState('usuario')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const [showOtp, setShowOtp] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    const cleaned = name === 'name' ? toTitleCase(value) : value
    setForm({ ...form, [name]: cleaned })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    const nameErr = validators.name(form.name)
    if (nameErr)                            newErrors.name     = nameErr
    const emailErr = validators.email(form.email)
    if (emailErr)                           newErrors.email    = emailErr
    if (!form.password)                     newErrors.password = 'La contraseña es requerida'
    else if (form.password.length < 8)      newErrors.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirm)     newErrors.confirm  = 'Las contraseñas no coinciden'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setIsLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role })
      // TODO: backend envía OTP al correo → POST /api/auth/send-otp
      setShowOtp(true) // mostrar modal OTP antes de navegar
    } catch (err) {
      setApiError(err.message || 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="reg-root">
      {/* Modal OTP — aparece tras registro exitoso */}
      {showOtp && (
        <OtpModal
          email={form.email}
          onVerified={() => navigate('/', { replace: true })}
        />
      )}

      <div className="reg-bg">
        <img src={fondoMejorado} alt="background" className="reg-bg-img" />
      </div>
      <div className="reg-overlay" />

      <div className="reg-card">

        {/* Logo */}
        <div className="reg-logo-wrap">
          <img src={logoLogin} alt="Elysium" className="reg-logo" />
        </div>

        {/* Título — igual que Login */}
        <h1 className="login-title">Crear Cuenta</h1>
        <p className="login-subtitle">Únete a Elysium</p>

        {/* Selector de rol */}
        <div className="reg-role-tabs">
          <button
            type="button"
            className={`reg-role-tab ${role === 'usuario' ? 'active' : ''}`}
            onClick={() => setRole('usuario')}
          >
            Usuario
          </button>
          <button
            type="button"
            className={`reg-role-tab ${role === 'organizador' ? 'active' : ''}`}
            onClick={() => setRole('organizador')}
          >
            Organizador
          </button>
          <span
            className="reg-role-slider"
            style={{ transform: role === 'organizador' ? 'translateX(100%)' : 'translateX(0)' }}
          />
        </div>

        {apiError && <div className="login-error">{apiError}</div>}

        <form onSubmit={handleSubmit} className="reg-form" noValidate>

          {/* Nombre */}
          <div className="reg-field">
            <label className="reg-label">Nombre completo</label>
            <div className="reg-input-wrap">
              <span className="reg-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={form.name}
                onChange={handleChange}
                className={`reg-input ${errors.name ? 'error' : ''}`}
                autoComplete="name"
              />
            </div>
            {errors.name && <span className="reg-error">{errors.name}</span>}
          </div>

          {/* Correo */}
          <div className="reg-field">
            <label className="reg-label">Correo electrónico</label>
            <div className="reg-input-wrap">
              <span className="reg-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={handleChange}
                className={`reg-input ${errors.email ? 'error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="reg-error">{errors.email}</span>}
          </div>

          {/* Contraseña */}
          <div className="reg-field">
            <label className="reg-label">Contraseña</label>
            <div className="reg-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña (mín. 8 caracteres)"
                value={form.password}
                onChange={handleChange}
                className={`reg-input-no-icon ${errors.password ? 'error' : ''}`}
              />
              <button type="button" className="reg-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="reg-error">{errors.password}</span>}
          </div>

          {/* Confirmar contraseña */}
          <div className="reg-field">
            <label className="reg-label">Confirmar contraseña</label>
            <div className="reg-input-wrap">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={handleChange}
                className={`reg-input-no-icon ${errors.confirm ? 'error' : ''}`}
              />
              <button type="button" className="reg-eye" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirm && <span className="reg-error">{errors.confirm}</span>}
          </div>

          {/* Términos */}
          <p className="reg-terms">
            Al registrarte, aceptas nuestros{' '}
            <Link to="/terminos" className="reg-link">Términos</Link>
            {' '}y{' '}
            <Link to="/privacidad" className="reg-link">Condiciones</Link>
          </p>

          {/* Botón — idéntico al de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full mt-2"
          >
            {isLoading ? <span className="reg-spinner" /> : 'Registrarse'}
          </button>
        </form>

        <p className="reg-login-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="reg-link reg-link--bold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}