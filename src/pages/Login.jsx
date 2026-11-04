import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoLogin from '../assets/logoLogin.png'
import fondoMejorado from '../assets/fondoMejorado.jpg'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState('')

  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const from = location.state?.from?.pathname || '/'

  function getRedirectByRole(role) {
    switch (role) {
      case 'admin':       return '/admin'
      case 'contador':    return '/contabilidad'
      case 'organizador': return '/'        // ve el home, puede explorar sin comprar
      default:            return '/'        // usuario normal va al home
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const userData = await login(email, password)
      navigate(getRedirectByRole(userData.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg">
        <img src={fondoMejorado} alt="Background" className="login-bg-img" />
      </div>
      <div className="login-overlay" />

      <div className="login-card">
        <img src={logoLogin} alt="Elysium" className="login-logo" />

        <h1 className="login-title">Iniciar Sesión</h1>
        <p className="login-subtitle">Accede a tu cuenta</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">

          {/* Email */}
          <div className="login-field">
            <label className="login-label">Correo electrónico</label>
            <div className="login-input-wrap">
              <span className="login-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <div className="login-input-wrap">
              <span className="login-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón — igual que Register: btn-gold + w-full */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full mt-2"
          >
            {isLoading ? <span className="login-spinner" /> : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/forgot-password" className="login-link">
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="login-register-text">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="login-link login-link--bold">
              Regístrate aquí
            </Link>
          </p>
          <Link to="/" className="login-link flex items-center justify-center gap-1 mt-1 text-white/30 hover:text-white/60">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}