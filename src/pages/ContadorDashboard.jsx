/**
 * ContadorDashboard.jsx — Panel del Contador
 * Casos de uso (según diagrama):
 *   Ver comisiones retenidas, calcular comisión (15%),
 *   aprobar pago a organizador, consultar ventas, generar reportes financieros.
 *
 * Modelo financiero exacto:
 *   Precio base (org)   = $100.00
 *   Cargo servicio 15%  = + $15.00
 *   Total usuario       = $115.00
 *   Stripe 3.6%         = - $4.14  (de $115)
 *   Plataforma recibe   = $110.86
 *   → Organizador:      $100.00
 *   → Plataforma neto:  $ 10.86
 *
 * Reembolso por cancelación:
 *   Usuario recibe:     $100.00 (solo precio base)
 *   Plataforma retiene: $ 10.86 (cargo servicio - fee Stripe del reembolso)
 *
 * TODO: reemplazar mock con API real
 */

import { useState } from 'react'
import {
  DollarSign, TrendingUp, FileText, BarChart2,
  CreditCard, CheckCircle, Clock, Calculator, Eye,
  ArrowDownRight, AlertTriangle,
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

// ─── helper financiero — modelo exacto ───────────────────────────────────────
function calcPorBoleto(precioBase) {
  const cargo      = precioBase * 0.15
  const total      = precioBase + cargo
  const feeStripe  = total * 0.036
  const plataforma = total - feeStripe      // lo que llega a Stripe de la plataforma
  const netoOrg    = precioBase             // el organizador recibe su precio base
  const netoPlat   = cargo - feeStripe      // neto plataforma = cargo - fee stripe
  return { cargo, total, feeStripe, plataforma, netoOrg, netoPlat }
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockVentas = [
  { id: 1, evento: 'Coldplay: Music of the Spheres', organizer: 'Jorge Ramírez',  clabe: '****3821', precioBase: 1200, sold: 320, status: 'pendiente' },
  { id: 2, evento: 'Festival de Jazz',                organizer: 'Ana Martínez',   clabe: '****7142', precioBase: 450,  sold: 180, status: 'transferido' },
  { id: 3, evento: 'Rock en Vivo (cancelado)',        organizer: 'Jorge Ramírez',  clabe: '****3821', precioBase: 550,  sold: 45,  status: 'reembolsado' },
]

const mockVentasMes = [
  { mes: 'Ene', bruto: 45000,  netoPlat: 4250  },
  { mes: 'Feb', bruto: 78000,  netoPlat: 7380  },
  { mes: 'Mar', bruto: 62000,  netoPlat: 5870  },
  { mes: 'Abr', bruto: 95000,  netoPlat: 8990  },
  { mes: 'May', bruto: 320000, netoPlat: 30272 },
  { mes: 'Jun', bruto: 150600, netoPlat: 14257 },
]

const transferStatus = {
  pendiente:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  transferido: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reembolsado: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

const navItems = [
  { id: 'resumen',   icon: DollarSign,  label: 'Resumen Financiero' },
  { id: 'comisiones',icon: Calculator,  label: 'Comisiones (15%)' },
  { id: 'ventas',    icon: BarChart2,   label: 'Ventas Realizadas' },
  { id: 'ingresos',  icon: TrendingUp,  label: 'Aprobar Pagos' },
  { id: 'reportes',  icon: FileText,    label: 'Reportes Financieros' },
]

// ─── Vistas ───────────────────────────────────────────────────────────────────
function ResumenFinanciero() {
  const totales = mockVentas.reduce((acc, v) => {
    const c = calcPorBoleto(v.precioBase)
    acc.bruto    += c.total    * v.sold
    acc.cargo    += c.cargo    * v.sold
    acc.stripe   += c.feeStripe * v.sold
    acc.netoPlat += c.netoPlat * v.sold
    acc.netoOrg  += c.netoOrg  * v.sold
    return acc
  }, { bruto: 0, cargo: 0, stripe: 0, netoPlat: 0, netoOrg: 0 })

  const maxBruto = Math.max(...mockVentasMes.map(d => d.bruto))

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-white font-display text-xl font-semibold">Resumen Financiero</h1>
        <p className="text-white/40 text-xs mt-0.5">Panorama general — modelo financiero Elysium</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Ingresos brutos (usuarios)',  value: `$${(totales.bruto/1000).toFixed(1)}K`,   color: 'text-purple-400', icon: DollarSign },
          { label: 'Cargos por servicio (15%)',   value: `$${(totales.cargo/1000).toFixed(1)}K`,   color: 'text-pink-400',   icon: TrendingUp },
          { label: 'Fee Stripe retenido (3.6%)',  value: `$${totales.stripe.toFixed(0)}`,           color: 'text-red-400',    icon: CreditCard },
          { label: 'Neto plataforma',             value: `$${(totales.netoPlat/1000).toFixed(1)}K`, color: 'text-emerald-400',icon: CheckCircle },
          { label: 'A transferir organizadores',  value: `$${(totales.netoOrg/1000).toFixed(1)}K`,  color: 'text-blue-400',   icon: ArrowDownRight },
          { label: 'Boletos vendidos',            value: mockVentas.reduce((a,v)=>a+v.sold,0),      color: 'text-white/60',   icon: Eye },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2"><p className="text-white/40 text-xs leading-tight">{label}</p><Icon size={14} className={color} /></div>
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Gráfica ingresos brutos */}
      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
        <h2 className="text-white/70 text-sm font-semibold mb-4">Ingresos brutos por mes (MXN)</h2>
        <div className="flex items-end gap-2 h-24">
          {mockVentasMes.map(({ mes, bruto }) => (
            <div key={mes} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md" style={{ height: `${(bruto/maxBruto)*100}%` }} />
              <span className="text-white/30 text-[10px]">{mes}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Comisiones() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-white font-display text-xl font-semibold">Comisiones Retenidas (15%)</h1>
        <p className="text-white/40 text-xs mt-0.5">Desglose del cargo por servicio por evento</p>
      </div>

      {/* Calculadora del modelo */}
      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
        <h2 className="text-white/70 text-sm font-semibold mb-4 flex items-center gap-2">
          <Calculator size={16} className="text-emerald-400" /> Simulador de comisión por boleto
        </h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Precio base (organizador)',    value: '$100.00', color: 'text-white/60' },
            { label: 'Cargo por servicio (15%)',     value: '+$15.00', color: 'text-pink-400' },
            { label: 'Total que paga el usuario',    value: '$115.00', color: 'text-white font-bold', sep: true },
            { label: 'Stripe retiene (3.6% de $115)', value: '-$4.14', color: 'text-red-400' },
            { label: 'Plataforma recibe de Stripe',  value: '$110.86', color: 'text-purple-300', sep: true },
            { label: '  → Organizador recibe',       value: '$100.00', color: 'text-blue-300' },
            { label: '  → Plataforma retiene neto',  value: '$10.86',  color: 'text-emerald-400 font-bold' },
          ].map(({ label, value, color, sep }) => (
            <div key={label} className={`flex items-center justify-between py-1.5 ${sep ? 'border-t border-white/[0.08] mt-1 pt-2.5' : ''}`}>
              <span className="text-white/40 text-xs">{label}</span>
              <span className={`text-xs font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-300/70 text-xs">Por cada boleto vendido, la plataforma retiene <span className="font-bold">$10.86 neto</span> después de pagar la comisión de Stripe.</p>
        </div>
      </div>

      {/* Comisiones por evento */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-white/70 text-sm font-semibold">Comisiones retenidas por evento</h2>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {mockVentas.map((v) => {
            const c = calcPorBoleto(v.precioBase)
            const totalCargo  = c.cargo    * v.sold
            const totalStripe = c.feeStripe * v.sold
            const netoPlat    = c.netoPlat * v.sold
            return (
              <div key={v.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/80 text-sm truncate flex-1 mr-4">{v.evento}</p>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${transferStatus[v.status]}`}>{v.status}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-white/30 mt-1">
                  <span>{v.sold} boletos × ${c.cargo.toFixed(2)} cargo</span>
                  <span className="text-pink-300">Cargo total: ${totalCargo.toFixed(2)}</span>
                  <span className="text-red-400/70">Stripe: -${totalStripe.toFixed(2)}</span>
                  <span className="text-emerald-400 font-semibold">Neto plataforma: ${netoPlat.toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function VentasRealizadas() {
  const maxBruto = Math.max(...mockVentasMes.map(d => d.bruto))
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Ventas Realizadas</h1>
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-white/70 text-sm font-semibold">Ventas por mes</h2>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {mockVentasMes.map(({ mes, bruto, netoPlat }) => (
            <div key={mes} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="w-8 text-white/40 text-xs font-medium">{mes}</div>
              <div className="flex-1">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${(bruto/maxBruto)*100}%` }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white/70 text-sm font-semibold">${bruto.toLocaleString()}</p>
                <p className="text-emerald-400 text-xs">Neto plat: ${netoPlat.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AprobarPagos({ query = '' }) {
  const [ventas, setVentas]           = useState([...mockVentas])
  const [transferModal, setTransferModal] = useState(null)

  const applyQuery = (list) => query.trim()
    ? list.filter(v =>
        v.organizer.toLowerCase().includes(query.toLowerCase()) ||
        v.evento.toLowerCase().includes(query.toLowerCase())
      )
    : list

  const pendientes   = applyQuery(ventas.filter(v => v.status === 'pendiente'))
  const completadas  = applyQuery(ventas.filter(v => v.status !== 'pendiente'))

  function confirmarTransferencia() {
    setVentas(prev => prev.map(v => v.id === transferModal.id ? { ...v, status: 'transferido' } : v))
    setTransferModal(null)
    // TODO: POST /api/contador/pagos/:id/transferir → registra la transferencia
  }

  function TablaVentas({ lista, emptyMsg }) {
    return (
      <div className="divide-y divide-white/[0.05]">
        {lista.length === 0
          ? <p className="px-5 py-6 text-white/30 text-sm text-center">{emptyMsg}</p>
          : lista.map(v => {
            const c = calcPorBoleto(v.precioBase)
            const netoOrg = c.netoOrg * v.sold
            return (
              <div key={v.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{v.organizer}</p>
                  <p className="text-white/30 text-xs truncate">{v.evento}</p>
                  <p className="text-white/20 text-xs mt-0.5">CLABE: {v.clabe} · {v.sold} boletos × ${v.precioBase}</p>
                </div>
                <div className="text-right shrink-0 mr-3">
                  <p className="text-white/80 text-sm font-semibold">${netoOrg.toLocaleString()}</p>
                  <p className="text-white/30 text-xs">MXN</p>
                </div>
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${transferStatus[v.status]}`}>{v.status}</span>
                {v.status === 'pendiente' && (
                  <button onClick={() => setTransferModal({ ...v, netoOrg })}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold transition-all border border-emerald-500/30">
                    Transferir
                  </button>
                )}
              </div>
            )
          })
        }
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Modal confirmar transferencia */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTransferModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-emerald-500/20 rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={22} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-white text-lg font-semibold mb-1">¿Confirmar transferencia?</h2>
            <p className="text-white/50 text-sm mb-4">Organizador: <span className="text-white/80 font-medium">{transferModal.organizer}</span></p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-5 space-y-1.5 text-xs text-left">
              <div className="flex justify-between"><span className="text-white/40">Evento</span><span className="text-white/70 truncate ml-2">{transferModal.evento}</span></div>
              <div className="flex justify-between"><span className="text-white/40">CLABE destino</span><span className="text-white/70">{transferModal.clabe}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Monto a transferir</span><span className="text-emerald-400 font-bold">${transferModal.netoOrg.toLocaleString()} MXN</span></div>
            </div>
            <p className="text-white/30 text-xs mb-5">Esta acción marcará el pago como completado. Asegúrate de haber ejecutado la transferencia en Stripe antes de confirmar.</p>
            <div className="flex gap-3">
              <button onClick={() => setTransferModal(null)}
                className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 transition-all">
                Cancelar
              </button>
              <button onClick={confirmarTransferencia}
                className="flex-1 py-2.5 text-sm rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-semibold transition-all">
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-white font-display text-xl font-semibold">Aprobar Pagos a Organizadores</h1>
        <p className="text-white/40 text-xs mt-0.5">Ejecuta la transferencia en Stripe y confirma aquí</p>
      </div>

      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-yellow-200/70 text-xs leading-relaxed">
          <span className="font-semibold">Proceso:</span> Ejecuta la transferencia manualmente en el Dashboard de Stripe usando la CLABE del organizador, luego presiona <span className="font-semibold">Transferir</span> para confirmarla aquí.
        </p>
      </div>

      {/* Tabla pendientes */}
      <div className="rounded-xl bg-white/[0.04] border border-yellow-500/20 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <h2 className="text-yellow-300 text-sm font-semibold">Transferencias pendientes</h2>
          {pendientes.length > 0 && (
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">{pendientes.length}</span>
          )}
        </div>
        <TablaVentas lista={pendientes} emptyMsg="No hay transferencias pendientes" />
      </div>

      {/* Tabla completadas */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <h2 className="text-white/70 text-sm font-semibold">Transferencias completadas</h2>
        </div>
        <TablaVentas lista={completadas} emptyMsg="No hay transferencias completadas" />
      </div>
    </div>
  )
}

function ReportesFinancieros() {
  const [activeReport, setActiveReport] = useState(null)

  // Datos calculados del mock
  const totalBruto     = mockVentasMes.reduce((a, m) => a + m.bruto, 0)
  const totalNetoPlat  = mockVentasMes.reduce((a, m) => a + m.netoPlat, 0)
  const totalStripe    = mockVentas.reduce((a, v) => {
    const c = calcPorBoleto(v.precioBase)
    return a + c.feeStripe * v.sold
  }, 0)
  const totalComisiones = mockVentas.reduce((a, v) => {
    const c = calcPorBoleto(v.precioBase)
    return a + c.cargo * v.sold
  }, 0)
  const cancelados      = mockVentas.filter(v => v.status === 'reembolsado')
  const totalReembolsos = cancelados.reduce((a, v) => a + v.precioBase * v.sold, 0)
  const maxBruto        = Math.max(...mockVentasMes.map(m => m.bruto), 1)

  // ── Reporte: Estado de resultados ──
  if (activeReport === 'resultados') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-emerald-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Estado de Resultados</h1>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ingresos brutos',   value: `$${totalBruto.toLocaleString()}`,    color: 'text-emerald-400' },
            { label: 'Fee Stripe total',  value: `$${totalStripe.toLocaleString('es-MX', {maximumFractionDigits:0})}`, color: 'text-red-400' },
            { label: 'Neto plataforma',   value: `$${totalNetoPlat.toLocaleString()}`, color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center backdrop-blur-sm">
              <p className="text-white/40 text-xs mb-1">{label}</p>
              <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]"><h2 className="text-white/70 text-sm font-semibold">Desglose mensual</h2></div>
          <div className="divide-y divide-white/[0.05]">
            {mockVentasMes.map(m => (
              <div key={m.mes} className="flex items-center px-5 py-3 gap-4">
                <span className="text-white/50 text-xs w-8">{m.mes}</span>
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${(m.bruto / maxBruto) * 100}%` }} />
                </div>
                <span className="text-emerald-400 text-xs w-24 text-right">${m.bruto.toLocaleString()}</span>
                <span className="text-purple-300 text-xs w-20 text-right">+${m.netoPlat.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Reporte: Comisiones ──
  if (activeReport === 'comisiones') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-emerald-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Comisiones Retenidas (15%)</h1>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex justify-between items-center">
            <h2 className="text-white/70 text-sm font-semibold">Por evento</h2>
            <span className="text-pink-300 text-xs font-semibold">Total: ${totalComisiones.toLocaleString('es-MX', {maximumFractionDigits:0})} MXN</span>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {mockVentas.map(v => {
              const c = calcPorBoleto(v.precioBase)
              return (
                <div key={v.id} className="px-5 py-3">
                  <div className="flex justify-between mb-1">
                    <p className="text-white/80 text-sm font-medium truncate">{v.evento}</p>
                    <p className="text-pink-300 text-sm font-semibold shrink-0">${(c.cargo * v.sold).toLocaleString('es-MX', {maximumFractionDigits:0})}</p>
                  </div>
                  <div className="flex gap-4 text-xs text-white/30">
                    <span>{v.sold} boletos × ${c.cargo.toFixed(2)}/boleto</span>
                    <span className={transferStatus[v.status] ? '' : ''}>Estado: {v.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Reporte: Transferencias ──
  if (activeReport === 'transferencias') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-emerald-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Transferencias</h1>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {mockVentas.map(v => {
              const c = calcPorBoleto(v.precioBase)
              return (
                <div key={v.id} className="px-5 py-4">
                  <div className="flex justify-between mb-1">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{v.organizer}</p>
                      <p className="text-white/30 text-xs">{v.evento} · CLABE: {v.clabe}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm font-semibold">${(c.netoOrg * v.sold).toLocaleString()} MXN</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${transferStatus[v.status]}`}>{v.status}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Reporte: Análisis económico ──
  if (activeReport === 'analisis') {
    const margen = ((totalNetoPlat / totalBruto) * 100).toFixed(1)
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-emerald-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Análisis Económico</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Margen neto plataforma', value: `${margen}%`,                                       color: 'text-emerald-400' },
            { label: 'Promedio neto/mes',       value: `$${Math.round(totalNetoPlat/6).toLocaleString()}`, color: 'text-purple-400' },
            { label: 'Eventos activos',          value: mockVentas.filter(v=>v.status!=='reembolsado').length, color: 'text-blue-400' },
            { label: 'Fee Stripe acumulado',     value: `$${totalStripe.toLocaleString('es-MX',{maximumFractionDigits:0})}`, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
              <p className="text-white/40 text-xs mb-1">{label}</p>
              <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-300/80 text-xs leading-relaxed">
            La plataforma retiene <span className="font-semibold">{margen}%</span> de margen neto sobre los ingresos brutos. El fee de Stripe ({((totalStripe/totalBruto)*100).toFixed(1)}%) reduce el ingreso del cargo por servicio (15%), resultando en ~9.4% neto por boleto vendido.
          </p>
        </div>
      </div>
    )
  }

  // ── Reporte: Reembolsos ──
  if (activeReport === 'reembolsos') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-emerald-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Reembolsos</h1>
        </div>
        {cancelados.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
            <p className="text-white/30 text-sm">No hay reembolsos registrados</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06] flex justify-between">
              <h2 className="text-white/70 text-sm font-semibold">Cancelaciones procesadas</h2>
              <span className="text-yellow-400 text-xs">Reembolsado: ${totalReembolsos.toLocaleString()} MXN</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {cancelados.map(v => {
                const c = calcPorBoleto(v.precioBase)
                return (
                  <div key={v.id} className="px-5 py-3">
                    <p className="text-white/80 text-sm font-medium mb-1">{v.evento}</p>
                    <div className="flex gap-4 text-xs text-white/30">
                      <span>Boletos: {v.sold}</span>
                      <span>Reembolso usuario: <span className="text-yellow-400">${(v.precioBase * v.sold).toLocaleString()}</span></span>
                      <span>Plataforma retiene: <span className="text-emerald-400">${(c.netoPlat * v.sold).toLocaleString('es-MX',{maximumFractionDigits:0})}</span></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Reporte: Fee Stripe ──
  if (activeReport === 'stripe') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-emerald-300 text-xs transition-colors">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Fee Stripe Mensual</h1>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-300/70 text-xs leading-relaxed">
            Stripe cobra <span className="font-semibold">3.6%</span> sobre el total cobrado al usuario. Este costo se descuenta de las comisiones de la plataforma.
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex justify-between">
            <h2 className="text-white/70 text-sm font-semibold">Fee por evento</h2>
            <span className="text-red-400 text-xs font-semibold">Total: ${totalStripe.toLocaleString('es-MX',{maximumFractionDigits:0})} MXN</span>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {mockVentas.map(v => {
              const c = calcPorBoleto(v.precioBase)
              return (
                <div key={v.id} className="flex justify-between px-5 py-3">
                  <div>
                    <p className="text-white/70 text-sm">{v.evento}</p>
                    <p className="text-white/30 text-xs">{v.sold} boletos × ${c.feeStripe.toFixed(2)}/boleto</p>
                  </div>
                  <p className="text-red-400 text-sm font-semibold">${(c.feeStripe * v.sold).toLocaleString('es-MX',{maximumFractionDigits:0})}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Vista principal — tarjetas ──
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Reportes Financieros</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ingresos brutos',  value: `$${totalBruto.toLocaleString()}`,    color: 'text-emerald-400' },
          { label: 'Neto plataforma',  value: `$${totalNetoPlat.toLocaleString()}`, color: 'text-purple-400' },
          { label: 'Fee Stripe total', value: `$${totalStripe.toLocaleString('es-MX',{maximumFractionDigits:0})}`, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center backdrop-blur-sm">
            <p className="text-white/35 text-[10px] mb-1">{label}</p>
            <p className={`font-display text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: 'resultados',    title: 'Estado de resultados',        desc: 'Ingresos, costos Stripe y utilidad neta de la plataforma.',          icon: BarChart2,      color: 'text-emerald-400' },
          { id: 'comisiones',    title: 'Reporte de comisiones (15%)', desc: 'Cargos por servicio retenidos desglosados por evento.',              icon: Calculator,     color: 'text-pink-400' },
          { id: 'transferencias',title: 'Reporte de transferencias',   desc: 'Pagos realizados y pendientes a organizadores con CLABE.',           icon: CreditCard,     color: 'text-blue-400' },
          { id: 'analisis',      title: 'Análisis económico general',  desc: 'Margen neto, promedios mensuales y KPIs del modelo financiero.',     icon: TrendingUp,     color: 'text-purple-400' },
          { id: 'reembolsos',    title: 'Reporte de reembolsos',       desc: 'Cancelaciones: usuario recibe precio base, plataforma retiene neto.',icon: ArrowDownRight, color: 'text-yellow-400' },
          { id: 'stripe',        title: 'Fee Stripe mensual',          desc: 'Total de comisiones pagadas a Stripe (3.6% por transacción).',       icon: AlertTriangle,  color: 'text-red-400' },
        ].map(({ id, title, desc, icon: Icon, color }) => (
          <div key={id} onClick={() => setActiveReport(id)}
            className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-emerald-500/25 backdrop-blur-sm transition-all cursor-pointer group">
            <Icon size={18} className={`${color} mb-3`} />
            <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
            <p className="text-white/35 text-xs leading-relaxed mb-4">{desc}</p>
            <span className={`${color} group-hover:opacity-80 text-xs transition-opacity`}>Ver reporte →</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const views = { resumen: ResumenFinanciero, comisiones: Comisiones, ventas: VentasRealizadas, ingresos: AprobarPagos, reportes: ReportesFinancieros }

export default function ContadorDashboard() {
  return (
    <DashboardLayout navItems={navItems} accentColor="emerald" blockBack={true} searchPlaceholder="Buscar organizador, evento o transferencia...">
      {(activeNav, query) => { const View = views[activeNav] || ResumenFinanciero; return <View query={query} /> }}
    </DashboardLayout>
  )
}
