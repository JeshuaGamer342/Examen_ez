import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import AuthRedirect from './components/AuthRedirect'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Páginas principales
import Landing            from './pages/Landing'
import Login              from './pages/Login'
import Register           from './pages/Register'
import UserDashboard      from './pages/UserDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminDashboard     from './pages/AdminDashboard'
import ContadorDashboard  from './pages/ContadorDashboard'
import EventoDetalle      from './pages/EventoDetalle'
import Checkout           from './pages/Checkout'
import Eventos            from './pages/Eventos'

// Páginas estáticas
import Terminos       from './pages/Terminos'
import Privacidad     from './pages/Privacidad'
import Contacto       from './pages/Contacto'
import Reembolsos     from './pages/Reembolsos'
import NotFound       from './pages/NotFound'
import ForgotPassword from './pages/ForgotPassword'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuthRedirect />
        <Routes>

          {/* ── Públicas con layout ─────────────────────────────── */}
          <Route path="/"           element={<Layout><Landing /></Layout>} />
          <Route path="/terminos"   element={<Layout><Terminos /></Layout>} />
          <Route path="/privacidad" element={<Layout><Privacidad /></Layout>} />
          <Route path="/contacto"   element={<Layout><Contacto /></Layout>} />
          <Route path="/reembolsos" element={<Layout><Reembolsos /></Layout>} />

          {/* ── Evento y checkout (sin layout propio, lo incluyen) ── */}
          <Route path="/eventos"    element={<Eventos />} />
          <Route path="/evento/:id" element={<EventoDetalle />} />
          <Route path="/checkout"   element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          {/* ── Auth (sin layout) ───────────────────────────────── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/registro"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Paneles de usuario ──────────────────────────────── */}
          <Route path="/dashboard"   element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/mis-boletos" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* ── Panel de organizador ────────────────────────────── */}
          <Route path="/mis-eventos" element={
            <ProtectedRoute roles={['organizador', 'admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } />

          {/* ── Panel de admin ──────────────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ── Panel de contador ───────────────────────────────── */}
          <Route path="/contabilidad" element={
            <ProtectedRoute roles={['contador', 'admin']}>
              <ContadorDashboard />
            </ProtectedRoute>
          } />

          {/* ── 404 ─────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}