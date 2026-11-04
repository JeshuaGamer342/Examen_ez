/**
 * OrganizerDashboard.jsx — Panel del Organizador
 * Casos de uso: Crear/editar/eliminar eventos, configurar boletos (precio base),
 *              consultar ventas de sus eventos, visualizar reportes.
 *
 * Modelo financiero:
 *   Organizador define precio base → sistema agrega 15% → usuario paga total
 *   Organizador recibe su precio base completo al transferir el Contador
 *
 * TODO: reemplazar mock con src/api/events.js y src/api/tickets.js
 */

import { useState } from 'react'
import {
  CalendarPlus, BarChart2, Ticket, FileText,
  Edit, Trash2, Eye, Plus, TrendingUp, Users, DollarSign, AlertCircle,
  X, MapPin, Calendar, FileImage, AlignLeft, Hash, Clock, CheckCircle, Settings,
  Mail, Lock, EyeOff, ExternalLink, CreditCard, Wallet, Building2, CheckCircle2,
  Users2, UserPlus,
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { toTitleCase, validators } from '../utils/inputHelpers'
import { useAuth } from '../context/AuthContext'

// ─── Mock data ────────────────────────────────────────────────────────────────
// Precios en ejemplos — precio base definido por el organizador
const mockMyEvents = [
  {
    id: 1,
    title: 'Coldplay: Music of the Spheres',
    date: '30/MAY', venue: 'Estadio Nacional',
    status: 'publicado',
    sold: 320, capacity: 500,
    precioBase: 1200,   // organizador definió este precio
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=70',
  },
  {
    id: 2,
    title: 'Festival de Jazz',
    date: '12/JUN', venue: 'Parque Metropolitano',
    status: 'publicado',
    sold: 180, capacity: 300,
    precioBase: 450,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=70',
  },
  {
    id: 3,
    title: 'Gran Obra Musical',
    date: '15/JUN', venue: 'Teatro Municipal',
    status: 'borrador',
    sold: 0, capacity: 200,
    precioBase: 950,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&q=70',
  },
]

const mockVentasMes = [
  { mes: 'Ene', boletos: 45 }, { mes: 'Feb', boletos: 78 }, { mes: 'Mar', boletos: 62 },
  { mes: 'Abr', boletos: 95 }, { mes: 'May', boletos: 130 }, { mes: 'Jun', boletos: 88 },
]

const statusStyle = {
  publicado: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  borrador:  'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
  cancelado: 'bg-red-500/15     text-red-400     border-red-500/30',
}

const navItems = [
  { id: 'eventos',       icon: CalendarPlus, label: 'Mis Eventos' },
  { id: 'ventas',        icon: BarChart2,    label: 'Mis Ventas' },
  { id: 'reportes',      icon: FileText,     label: 'Reportes' },
  { id: 'colaboradores', icon: Users2,       label: 'Colaboradores' },
  { id: 'bancario',      icon: Wallet,       label: 'Datos bancarios' },
  { id: 'config',        icon: Settings,     label: 'Configuración' },
]

// ─── helper: calcula montos del modelo financiero ─────────────────────────────
function calcFinanciero(precioBase, cantidad = 1) {
  const cargoServicio = precioBase * 0.15
  const totalUsuario  = precioBase + cargoServicio
  const feeStripe     = totalUsuario * 0.036
  const netoOrg       = precioBase * cantidad
  return { cargoServicio, totalUsuario, feeStripe, netoOrg }
}

// ─── Modal: Crear Evento ──────────────────────────────────────────────────────
const categorias = ['Conciertos', 'Festivales', 'Teatro']

const estadosMX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
  'Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Estado de México',
  'Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán','Morelos','Nayarit',
  'Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí',
  'Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
]

const municipiosPorEstado = {
  'Aguascalientes':      ['Aguascalientes','Calvillo','Jesús María','Pabellón de Arteaga','Rincón de Romos'],
  'Baja California':     ['Tijuana','Mexicali','Ensenada','Tecate','Playas de Rosarito','San Quintín'],
  'Baja California Sur': ['La Paz','Los Cabos','Comondú','Loreto','Mulegé'],
  'Campeche':            ['Campeche','Ciudad del Carmen','Champotón','Escárcega','Calkiní'],
  'Chiapas':             ['Tuxtla Gutiérrez','San Cristóbal de las Casas','Tapachula','Comitán','Palenque'],
  'Chihuahua':           ['Chihuahua','Ciudad Juárez','Delicias','Cuauhtémoc','Parral','Nuevo Casas Grandes'],
  'Ciudad de México':    ['Álvaro Obregón','Azcapotzalco','Benito Juárez','Coyoacán','Cuauhtémoc','Gustavo A. Madero','Iztapalapa','Miguel Hidalgo','Tlalpan','Xochimilco'],
  'Coahuila':            ['Saltillo','Torreón','Monclova','Piedras Negras','Acuña','Ramos Arizpe'],
  'Colima':              ['Colima','Manzanillo','Tecomán','Villa de Álvarez','Armería'],
  'Durango':             ['Durango','Gómez Palacio','Lerdo','Santiago Papasquiaro','El Salto'],
  'Estado de México':    ['Ecatepec','Toluca','Naucalpan','Tlalnepantla','Chimalhuacán','Nezahualcóyotl','Texcoco','Metepec'],
  'Guanajuato':          ['Guanajuato','León','Irapuato','Celaya','Salamanca','Silao','San Miguel de Allende'],
  'Guerrero':            ['Acapulco','Chilpancingo','Zihuatanejo','Taxco','Iguala'],
  'Hidalgo':             ['Pachuca','Tulancingo','Tula de Allende','Actopan','Huejutla'],
  'Jalisco':             ['Guadalajara','Zapopan','Tlaquepaque','Tonalá','Puerto Vallarta','Lagos de Moreno'],
  'Michoacán':           ['Morelia','Zamora','Lázaro Cárdenas','Uruapan','Apatzingán'],
  'Morelos':             ['Cuernavaca','Cuautla','Jiutepec','Temixco','Yautepec'],
  'Nayarit':             ['Tepic','Bahía de Banderas','Compostela','Santiago Ixcuintla','Tuxpan'],
  'Nuevo León':          ['Monterrey','Guadalupe','San Nicolás de los Garza','Apodaca','General Escobedo','Santa Catarina'],
  'Oaxaca':              ['Oaxaca de Juárez','Salina Cruz','Juchitán','Tuxtepec','Puerto Escondido'],
  'Puebla':              ['Puebla','Tehuacán','San Martín Texmelucan','Atlixco','Cholula'],
  'Querétaro':           ['Querétaro','San Juan del Río','Corregidora','El Marqués','Tequisquiapan'],
  'Quintana Roo':        ['Cancún','Playa del Carmen','Chetumal','Cozumel','Tulum','Felipe Carrillo Puerto'],
  'San Luis Potosí':     ['San Luis Potosí','Ciudad Valles','Matehuala','Rioverde','Soledad de Graciano'],
  'Sinaloa':             ['Culiacán','Mazatlán','Los Mochis','Guasave','Guamúchil'],
  'Sonora':              ['Hermosillo','Ciudad Obregón','Nogales','San Luis Río Colorado','Navojoa','Guaymas'],
  'Tabasco':             ['Villahermosa','Cárdenas','Macuspana','Comalcalco','Paraíso'],
  'Tamaulipas':          ['Reynosa','Matamoros','Nuevo Laredo','Tampico','Victoria','Laredo'],
  'Tlaxcala':            ['Tlaxcala','Apizaco','Huamantla','Calpulalpan','Chiautempan'],
  'Veracruz':            ['Veracruz','Xalapa','Coatzacoalcos','Córdoba','Orizaba','Poza Rica','Tuxpan'],
  'Yucatán':             ['Mérida','Valladolid','Progreso','Umán','Kanasín','Tekax'],
  'Zacatecas':           ['Zacatecas','Fresnillo','Guadalupe','Jerez','Río Grande'],
}

// ─── ColaboradorPicker — para usar dentro del modal de crear evento ───────────
function ColaboradorPicker() {
  const [seleccionados, setSeleccionados] = useState([])

  function toggleColaborador(u) {
    setSeleccionados(prev =>
      prev.find(c => c.id === u.id)
        ? prev.filter(c => c.id !== u.id)
        : [...prev, u]
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-white/40 text-xs">Añade colaboradores si lo necesitas, es opcional.</p>

      {/* Lista de colaboradores disponibles */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        {mockColaboradoresDB.map(u => {
          const activo = !!seleccionados.find(c => c.id === u.id)
          return (
            <button key={u.id} type="button" onClick={() => toggleColaborador(u)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-white/[0.04] last:border-0 ${
                activo ? 'bg-purple-500/10' : 'hover:bg-white/[0.03]'
              }`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400/40 to-pink-500/40 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/75 text-sm truncate">{u.name}</p>
                <p className="text-white/30 text-[10px]">{u.email}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                activo ? 'bg-purple-500 border-purple-400' : 'border-white/20'
              }`}>
                {activo && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          )
        })}
      </div>

      {seleccionados.length > 0 && (
        <p className="text-purple-300/70 text-xs">
          {seleccionados.length} colaborador{seleccionados.length !== 1 ? 'es' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

// ─── Modal: Crear Evento ──────────────────────────────────────────────────────
function CrearEventoModal({ onClose, onCreated }) {
  const [step, setStep]   = useState('form')
  const [form, setForm]   = useState({
    titulo: '', descripcion: '', fecha: '', estado: '',
    municipio: '', recinto: '', capacidad: '', precioBase: '', categoria: '',
  })
  const [imagen,  setImagen]  = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  // Municipios disponibles según el estado seleccionado
  const municipios = form.estado ? (municipiosPorEstado[form.estado] || []) : []

  const handleChange = (e) => {
    const { name, value } = e.target
    // Al cambiar estado, limpiar municipio
    if (name === 'estado') {
      setForm({ ...form, estado: value, municipio: '' })
    } else {
      setForm({ ...form, [name]: value })
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagen(file)
    setPreview(URL.createObjectURL(file))
    if (errors.imagen) setErrors({ ...errors, imagen: '' })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setImagen(file)
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e = {}
    if (!form.titulo.trim())      e.titulo      = 'El título es requerido'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida'
    if (!form.fecha)              e.fecha = 'La fecha es requerida'
    else if (form.fecha < new Date().toISOString().split('T')[0]) e.fecha = 'La fecha no puede ser en el pasado'
    if (!form.estado)             e.estado      = 'Selecciona un estado'
    if (!form.municipio)          e.municipio   = 'Selecciona un municipio'
    if (!form.recinto.trim())     e.recinto     = 'Ingresa el nombre del recinto'
    if (!form.capacidad || Number(form.capacidad) <= 0) e.capacidad  = 'Capacidad inválida'
    if (!form.precioBase || Number(form.precioBase) <= 0) e.precioBase = 'Precio inválido'
    if (!form.categoria)          e.categoria   = 'Selecciona una categoría'
    if (!imagen)                  e.imagen      = 'Sube el flyer o cartelera del evento'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    // TODO: POST /api/events (multipart/form-data)
    // { titulo, descripcion, fecha, estado, municipio, recinto, capacidad, precioBase, categoria, imagen }
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)

    onCreated({
      id:         Date.now(),
      title:      form.titulo,
      date:       form.fecha,
      venue:      `${form.recinto}, ${form.municipio}, ${form.estado}`,
      status:     'pendiente',
      sold:       0,
      capacity:   Number(form.capacidad),
      precioBase: Number(form.precioBase),
      image:      preview || 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=70',
    })
    setStep('success')
  }

  const base  = Number(form.precioBase) || 0
  const cargo = base * 0.15
  const total = base + cargo

  // ── Pantalla de éxito ──
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl p-8 text-center">
          {/* Icono animado */}
          <div className="w-16 h-16 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center mx-auto mb-5">
            <Clock size={32} className="text-yellow-400" />
          </div>
          <h2 className="font-display text-white text-lg font-semibold mb-2">
            ¡Evento enviado!
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-2">
            Tu evento <span className="text-white font-medium">"{form.titulo}"</span> fue enviado correctamente.
          </p>
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <p className="text-yellow-300/80 text-xs leading-relaxed">
              Está en lista de <span className="font-semibold">pendientes</span>. El Administrador lo revisará y recibirás un correo cuando sea aprobado y puedas publicarlo.
            </p>
          </div>
          <button onClick={onClose} className="btn-gold w-full py-2.5 text-sm">
            Entendido
          </button>
        </div>
      </div>
    )
  }

  // ── Formulario ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] sticky top-0 bg-[#13092a] z-10">
          <div>
            <h2 className="font-display text-white text-lg font-semibold">Crear Evento</h2>
            <p className="text-white/30 text-xs mt-0.5">El evento quedará pendiente hasta que el Admin lo apruebe</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>

          {/* ── Flyer / Cartelera ── */}
          <div className="reg-field">
            <label className="reg-label">Flyer / Cartelera del evento</label>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={`relative rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer
                ${errors.imagen ? 'border-red-500/50' : 'border-white/[0.12] hover:border-purple-500/40'}
                ${preview ? 'border-purple-500/30' : ''}
              `}
              onClick={() => document.getElementById('event-img-input').click()}
            >
              <input
                id="event-img-input" type="file" accept="image/*"
                onChange={handleImage} className="hidden"
              />
              {preview ? (
                <div className="relative h-36 rounded-xl overflow-hidden">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium">Cambiar imagen</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <FileImage size={28} className="text-white/20" />
                  <p className="text-white/40 text-xs">Arrastra tu imagen aquí o <span className="text-purple-400">haz clic para subir</span></p>
                  <p className="text-white/20 text-[10px]">JPG, PNG o WEBP · Máx. 5MB</p>
                </div>
              )}
            </div>
            {errors.imagen && <span className="reg-error">{errors.imagen}</span>}
          </div>

          {/* Título */}
          <div className="reg-field">
            <label className="reg-label">Título del evento</label>
            <div className="login-input-wrap">
              <span className="login-icon"><FileImage size={14} /></span>
              <input
                type="text" name="titulo" value={form.titulo} onChange={handleChange}
                placeholder="Ej: Coldplay: Music of the Spheres"
                className={`login-input ${errors.titulo ? 'border-red-500/50' : ''}`}
              />
            </div>
            {errors.titulo && <span className="reg-error">{errors.titulo}</span>}
          </div>

          {/* Descripción */}
          <div className="reg-field">
            <label className="reg-label">Descripción</label>
            <div className="relative">
              <AlignLeft size={14} className="absolute left-3 top-3 text-white/40 pointer-events-none" />
              <textarea
                name="descripcion" value={form.descripcion} onChange={handleChange}
                placeholder="Describe el evento, artistas, experiencia..."
                rows={3}
                className={`reg-input-no-icon resize-none pl-8 ${errors.descripcion ? 'error' : ''}`}
              />
            </div>
            {errors.descripcion && <span className="reg-error">{errors.descripcion}</span>}
          </div>

          {/* Fecha y Categoría */}
          <div className="grid grid-cols-2 gap-3">
            <div className="reg-field">
              <label className="reg-label">Fecha del evento</label>
              <div className="login-input-wrap">
                <span className="login-icon"><Calendar size={14} /></span>
                <input
                  type="date" name="fecha" value={form.fecha} onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`login-input ${errors.fecha ? 'border-red-500/50' : ''}`}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {errors.fecha && <span className="reg-error">{errors.fecha}</span>}
            </div>

            <div className="reg-field">
              <label className="reg-label">Categoría</label>
              <select
                name="categoria" value={form.categoria} onChange={handleChange}
                className={`reg-input-no-icon ${errors.categoria ? 'error' : ''}`}
                style={{ appearance: 'none' }}
              >
                <option value="" disabled>Seleccionar...</option>
                {categorias.map(c => <option key={c} value={c} className="bg-[#13092a]">{c}</option>)}
              </select>
              {errors.categoria && <span className="reg-error">{errors.categoria}</span>}
            </div>
          </div>

          {/* Ubicación: Estado → Municipio → Recinto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="reg-field">
              <label className="reg-label">Estado</label>
              <select
                name="estado" value={form.estado} onChange={handleChange}
                className={`reg-input-no-icon ${errors.estado ? 'error' : ''}`}
                style={{ appearance: 'none' }}
              >
                <option value="" disabled>Seleccionar...</option>
                {estadosMX.map(e => <option key={e} value={e} className="bg-[#13092a]">{e}</option>)}
              </select>
              {errors.estado && <span className="reg-error">{errors.estado}</span>}
            </div>

            <div className="reg-field">
              <label className="reg-label">Municipio</label>
              <select
                name="municipio" value={form.municipio} onChange={handleChange}
                disabled={!form.estado}
                className={`reg-input-no-icon ${errors.municipio ? 'error' : ''} ${!form.estado ? 'opacity-40 cursor-not-allowed' : ''}`}
                style={{ appearance: 'none' }}
              >
                <option value="" disabled>
                  {form.estado ? 'Seleccionar...' : 'Primero elige un estado'}
                </option>
                {municipios.map(m => <option key={m} value={m} className="bg-[#13092a]">{m}</option>)}
              </select>
              {errors.municipio && <span className="reg-error">{errors.municipio}</span>}
            </div>
          </div>

          <div className="reg-field">
            <label className="reg-label">Recinto / Lugar</label>
            <div className="login-input-wrap">
              <span className="login-icon"><MapPin size={14} /></span>
              <input
                type="text" name="recinto" value={form.recinto} onChange={handleChange}
                placeholder="Ej: Estadio Caliente, Auditorio Telmex..."
                className={`login-input ${errors.recinto ? 'border-red-500/50' : ''}`}
              />
            </div>
            {errors.recinto && <span className="reg-error">{errors.recinto}</span>}
          </div>

          {/* Capacidad y Precio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="reg-field">
              <label className="reg-label">Capacidad total</label>
              <div className="login-input-wrap">
                <span className="login-icon"><Hash size={14} /></span>
                <input
                  type="number" name="capacidad" value={form.capacidad} onChange={handleChange}
                  placeholder="Ej: 500" min="1"
                  className={`login-input ${errors.capacidad ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.capacidad && <span className="reg-error">{errors.capacidad}</span>}
            </div>

            <div className="reg-field">
              <label className="reg-label">Precio base (MXN)</label>
              <div className="login-input-wrap">
                <span className="login-icon"><DollarSign size={14} /></span>
                <input
                  type="number" name="precioBase" value={form.precioBase} onChange={handleChange}
                  placeholder="Ej: 500" min="1"
                  className={`login-input ${errors.precioBase ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.precioBase && <span className="reg-error">{errors.precioBase}</span>}
            </div>
          </div>

          {/* Preview precio */}
          {base > 0 && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
              <p className="text-white/40 font-semibold mb-1">Vista previa del checkout:</p>
              <div className="flex justify-between"><span className="text-white/35">Precio boleto</span><span className="text-white/60">${base.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-white/35">Cargo por servicio (15%)</span><span className="text-pink-300">+${cargo.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-white/[0.06] pt-1.5 mt-1">
                <span className="text-white font-semibold">Usuario paga</span>
                <span className="text-purple-300 font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-white/30">Tú recibirás (por boleto)</span>
                <span className="text-emerald-400">${base.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Colaboradores — opcional */}
          <div className="reg-field">
            <label className="reg-label">
              Colaboradores <span className="text-white/30 text-xs font-normal">(opcional)</span>
            </label>
            <ColaboradorPicker />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 py-2.5 text-sm">
              {loading ? <span className="reg-spinner" /> : 'Enviar para aprobación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal: Ver Evento ────────────────────────────────────────────────────────
function VerEventoModal({ event, onClose, onEdit }) {
  if (!event) return null
  const { cargoServicio, totalUsuario } = calcFinanciero(event.precioBase)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">

        {/* Imagen del evento */}
        <div className="relative h-44">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13092a] to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-5">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${statusStyle[event.status] || 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'}`}>
              {event.status}
            </span>
          </div>
        </div>

        {/* Detalles */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <h2 className="font-display text-white text-xl font-bold">{event.title}</h2>
            <p className="text-white/40 text-xs mt-1 flex items-center gap-1.5">
              <Calendar size={12} /> {event.date}
              <span className="mx-1">·</span>
              <MapPin size={12} /> {event.venue}
            </p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Capacidad',     value: event.capacity },
              { label: 'Vendidos',      value: event.sold },
              { label: 'Disponibles',   value: event.capacity - event.sold },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                <p className="text-white/35 text-xs mb-1">{label}</p>
                <p className="text-white font-semibold text-lg">{value}</p>
              </div>
            ))}
          </div>

          {/* Precios */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-white/35">Precio base (tu ingreso)</span><span className="text-emerald-400 font-semibold">${event.precioBase}.00</span></div>
            <div className="flex justify-between"><span className="text-white/35">Cargo por servicio (15%)</span><span className="text-pink-300">+${cargoServicio.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-white/[0.06] pt-1.5 mt-1">
              <span className="text-white font-semibold">Usuario paga</span>
              <span className="text-purple-300 font-semibold">${totalUsuario.toFixed(2)}</span>
            </div>
          </div>

          {/* Barra de ventas */}
          <div>
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Progreso de ventas</span>
              <span>{Math.round((event.sold / event.capacity) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${(event.sold / event.capacity) * 100}%` }}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
              Cerrar
            </button>
            <button
              onClick={() => { onClose(); onEdit(event) }}
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Edit size={14} /> Editar evento
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Editar Evento ─────────────────────────────────────────────────────
function EditarEventoModal({ event, onClose, onUpdated }) {
  if (!event) return null

  const isPublicado = event.status === 'publicado'
  const isCancelado = event.status === 'cancelado'

  const venueParts    = (event.venue || '').split(',').map(s => s.trim())
  const initRecinto   = venueParts[0] || ''
  const initMunicipio = venueParts[1] || ''
  const initEstado    = venueParts[2] || ''

  const [form, setForm] = useState({
    titulo:      event.title        || '',
    descripcion: event.descripcion  || '',
    fecha:       event.date         || '',
    estado:      initEstado,
    municipio:   initMunicipio,
    recinto:     initRecinto,
    capacidad:   String(event.capacity   || ''),
    precioBase:  String(event.precioBase || ''),
    categoria:   event.categoria    || '',
  })
  const [preview, setPreview] = useState(event.image || null)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const municipios = form.estado ? (municipiosPorEstado[form.estado] || []) : []

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'estado') setForm({ ...form, estado: value, municipio: '' })
    else setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e = {}
    // Campos siempre requeridos
    if (!form.capacidad  || Number(form.capacidad)  <= 0) e.capacidad  = 'Capacidad inválida'
    if (!form.precioBase || Number(form.precioBase) <= 0) e.precioBase = 'Precio inválido'
    // Campos solo requeridos si el evento es pendiente (editables completos)
    if (!isPublicado) {
      if (!form.titulo.trim())  e.titulo    = 'El título es requerido'
      if (!form.fecha)          e.fecha = 'La fecha es requerida'
      else if (form.fecha < new Date().toISOString().split('T')[0]) e.fecha = 'La fecha no puede ser en el pasado'
      if (!form.estado)         e.estado    = 'Selecciona un estado'
      if (!form.municipio)      e.municipio = 'Selecciona un municipio'
      if (!form.recinto.trim()) e.recinto   = 'Ingresa el nombre del recinto'
      if (!form.categoria)      e.categoria = 'Selecciona una categoría'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    // TODO: PUT /api/events/:id
    // Si publicado: solo { capacidad, precioBase, imagen }
    // Si pendiente: todos los campos
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)

    onUpdated({
      ...event,
      title:      isPublicado ? event.title : form.titulo,
      date:       isPublicado ? event.date  : form.fecha,
      venue:      isPublicado ? event.venue : `${form.recinto}, ${form.municipio}, ${form.estado}`,
      capacity:   Number(form.capacidad),
      precioBase: Number(form.precioBase),
      image:      preview || event.image,
    })
    setSuccess(true)
  }

  const base  = Number(form.precioBase) || 0
  const cargo = base * 0.15
  const total = base + cargo

  // ── Pantalla de éxito ──
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="font-display text-white text-lg font-semibold mb-2">¡Evento actualizado!</h2>
          <p className="text-white/40 text-sm mb-6">Los cambios se guardaron correctamente.</p>
          <button onClick={onClose} className="btn-gold w-full py-2.5 text-sm">Listo</button>
        </div>
      </div>
    )
  }

  // ── Helper para campo bloqueado ──
  function LockedField({ label, value }) {
    return (
      <div className="reg-field">
        <label className="reg-label flex items-center gap-1.5">
          {label}
          <span className="text-[10px] text-yellow-400/70 font-normal">(no editable — aprobado)</span>
        </label>
        <div className="reg-input-no-icon opacity-40 cursor-not-allowed select-none truncate py-[0.68rem]">
          {value || '—'}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] sticky top-0 bg-[#13092a] z-10">
          <div>
            <h2 className="font-display text-white text-lg font-semibold">Editar Evento</h2>
            <p className="text-white/30 text-xs mt-0.5 truncate max-w-xs">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        {/* Aviso si está publicado */}
        {isPublicado && (
          <div className="mx-6 mt-5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-300/80 text-xs leading-relaxed">
              Este evento ya fue <span className="font-semibold">aprobado</span>. Solo puedes modificar la <span className="font-semibold">imagen, capacidad y precio base</span>. El título, fecha, ubicación y categoría no se pueden cambiar.
            </p>
          </div>
        )}

        {/* Aviso si está cancelado */}
        {isCancelado && (
          <div className="mx-6 mt-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-300/70 text-xs">Este evento fue cancelado y no puede editarse.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>

          {/* Imagen — siempre editable */}
          <div className="reg-field">
            <label className="reg-label">Flyer / Cartelera {isPublicado && <span className="text-emerald-400/70 text-[10px] font-normal">(editable)</span>}</label>
            <div
              className={`relative h-36 rounded-xl overflow-hidden border border-white/[0.12] transition-colors ${!isCancelado ? 'hover:border-purple-500/40 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              onClick={() => !isCancelado && document.getElementById('edit-img-input').click()}
            >
              <input id="edit-img-input" type="file" accept="image/*" onChange={handleImage} className="hidden" disabled={isCancelado} />
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><FileImage size={28} className="text-white/20" /></div>
              }
              {!isCancelado && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium">Cambiar imagen</p>
                </div>
              )}
            </div>
          </div>

          {/* Título */}
          {isPublicado
            ? <LockedField label="Título" value={form.titulo} />
            : <div className="reg-field">
                <label className="reg-label">Título del evento</label>
                <div className="login-input-wrap">
                  <span className="login-icon"><FileImage size={14} /></span>
                  <input type="text" name="titulo" value={form.titulo} onChange={handleChange}
                    disabled={isCancelado}
                    className={`login-input ${errors.titulo ? 'border-red-500/50' : ''} ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`} />
                </div>
                {errors.titulo && <span className="reg-error">{errors.titulo}</span>}
              </div>
          }

          {/* Descripción */}
          {isPublicado
            ? <LockedField label="Descripción" value={form.descripcion} />
            : <div className="reg-field">
                <label className="reg-label">Descripción</label>
                <div className="relative">
                  <AlignLeft size={14} className="absolute left-3 top-3 text-white/40 pointer-events-none" />
                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                    rows={3} disabled={isCancelado}
                    className={`reg-input-no-icon resize-none pl-8 ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`} />
                </div>
              </div>
          }

          {/* Fecha y Categoría */}
          <div className="grid grid-cols-2 gap-3">
            {isPublicado
              ? <LockedField label="Fecha" value={form.fecha} />
              : <div className="reg-field">
                  <label className="reg-label">Fecha</label>
                  <div className="login-input-wrap">
                    <span className="login-icon"><Calendar size={14} /></span>
                    <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                      disabled={isCancelado}
                      min={new Date().toISOString().split('T')[0]}
                      className={`login-input ${errors.fecha ? 'border-red-500/50' : ''} ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ colorScheme: 'dark' }} />
                  </div>
                  {errors.fecha && <span className="reg-error">{errors.fecha}</span>}
                </div>
            }
            {isPublicado
              ? <LockedField label="Categoría" value={form.categoria} />
              : <div className="reg-field">
                  <label className="reg-label">Categoría</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange}
                    disabled={isCancelado}
                    className={`reg-input-no-icon ${errors.categoria ? 'error' : ''} ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={{ appearance: 'none' }}>
                    <option value="" disabled>Seleccionar...</option>
                    {categorias.map(c => <option key={c} value={c} className="bg-[#13092a]">{c}</option>)}
                  </select>
                  {errors.categoria && <span className="reg-error">{errors.categoria}</span>}
                </div>
            }
          </div>

          {/* Ubicación */}
          {isPublicado
            ? <LockedField label="Ubicación" value={event.venue} />
            : <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="reg-field">
                    <label className="reg-label">Estado</label>
                    <select name="estado" value={form.estado} onChange={handleChange}
                      disabled={isCancelado}
                      className={`reg-input-no-icon ${errors.estado ? 'error' : ''} ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ appearance: 'none' }}>
                      <option value="" disabled>Seleccionar...</option>
                      {estadosMX.map(e => <option key={e} value={e} className="bg-[#13092a]">{e}</option>)}
                    </select>
                    {errors.estado && <span className="reg-error">{errors.estado}</span>}
                  </div>
                  <div className="reg-field">
                    <label className="reg-label">Municipio</label>
                    <select name="municipio" value={form.municipio} onChange={handleChange}
                      disabled={!form.estado || isCancelado}
                      className={`reg-input-no-icon ${errors.municipio ? 'error' : ''} ${(!form.estado || isCancelado) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ appearance: 'none' }}>
                      <option value="" disabled>{form.estado ? 'Seleccionar...' : 'Primero elige un estado'}</option>
                      {municipios.map(m => <option key={m} value={m} className="bg-[#13092a]">{m}</option>)}
                    </select>
                    {errors.municipio && <span className="reg-error">{errors.municipio}</span>}
                  </div>
                </div>
                <div className="reg-field">
                  <label className="reg-label">Recinto / Lugar</label>
                  <div className="login-input-wrap">
                    <span className="login-icon"><MapPin size={14} /></span>
                    <input type="text" name="recinto" value={form.recinto} onChange={handleChange}
                      disabled={isCancelado}
                      className={`login-input ${errors.recinto ? 'border-red-500/50' : ''} ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`} />
                  </div>
                  {errors.recinto && <span className="reg-error">{errors.recinto}</span>}
                </div>
              </>
          }

          {/* Capacidad y Precio — siempre editables (excepto cancelado) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="reg-field">
              <label className="reg-label">
                Capacidad total
                {isPublicado && <span className="text-emerald-400/70 text-[10px] font-normal ml-1">(editable)</span>}
              </label>
              <div className="login-input-wrap">
                <span className="login-icon"><Hash size={14} /></span>
                <input type="number" name="capacidad" value={form.capacidad} onChange={handleChange}
                  min="1" disabled={isCancelado}
                  className={`login-input ${errors.capacidad ? 'border-red-500/50' : ''} ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`} />
              </div>
              {errors.capacidad && <span className="reg-error">{errors.capacidad}</span>}
            </div>
            <div className="reg-field">
              <label className="reg-label">
                Precio base (MXN)
                {isPublicado && <span className="text-emerald-400/70 text-[10px] font-normal ml-1">(editable)</span>}
              </label>
              <div className="login-input-wrap">
                <span className="login-icon"><DollarSign size={14} /></span>
                <input type="number" name="precioBase" value={form.precioBase} onChange={handleChange}
                  min="1" disabled={isCancelado}
                  className={`login-input ${errors.precioBase ? 'border-red-500/50' : ''} ${isCancelado ? 'opacity-40 cursor-not-allowed' : ''}`} />
              </div>
              {errors.precioBase && <span className="reg-error">{errors.precioBase}</span>}
            </div>
          </div>

          {/* Preview precio */}
          {base > 0 && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-white/35">Precio boleto</span><span className="text-white/60">${base.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-white/35">Cargo servicio (15%)</span><span className="text-pink-300">+${cargo.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-white/[0.06] pt-1.5 mt-1">
                <span className="text-white font-semibold">Usuario paga</span>
                <span className="text-purple-300 font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Botones */}
          {!isCancelado && (
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-gold flex-1 py-2.5 text-sm">
                {loading ? <span className="reg-spinner" /> : 'Guardar cambios'}
              </button>
            </div>
          )}
          {isCancelado && (
            <button type="button" onClick={onClose} className="btn-outline w-full py-2.5 text-sm">Cerrar</button>
          )}
        </form>
      </div>
    </div>
  )
}

// ─── Vistas ───────────────────────────────────────────────────────────────────
function MisEventos({ query = '' }) {
  const [events, setEvents]         = useState([...mockMyEvents])
  const [showModal, setShowModal]   = useState(false)
  const [verEvento, setVerEvento]   = useState(null)
  const [editEvento, setEditEvento] = useState(null)
  const [eliminarEvento, setEliminarEvento] = useState(null)

  const filtered = query.trim()
    ? events.filter(e =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.venue?.toLowerCase().includes(query.toLowerCase()) ||
        e.status?.toLowerCase().includes(query.toLowerCase())
      )
    : events

  const totalBoletos  = events.reduce((a, e) => a + e.sold, 0)
  const totalIngresos = events.reduce((a, e) => a + e.sold * e.precioBase, 0)

  function handleCreated(newEvent) {
    setEvents(prev => [...prev, newEvent])
  }

  function handleUpdated(updatedEvent) {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e))
    setEditEvento(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Modales */}
      {showModal      && <CrearEventoModal    onClose={() => setShowModal(false)}      onCreated={handleCreated} />}
      {verEvento      && <VerEventoModal      event={verEvento}     onClose={() => setVerEvento(null)}     onEdit={(e) => { setVerEvento(null); setEditEvento(e) }} />}
      {editEvento     && <EditarEventoModal   event={editEvento}    onClose={() => setEditEvento(null)}    onUpdated={handleUpdated} />}
      {eliminarEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEliminarEvento(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-red-500/20 rounded-2xl shadow-2xl p-6 text-center">

            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              eliminarEvento.status === 'publicado'
                ? 'bg-orange-500/15 border border-orange-500/25'
                : 'bg-red-500/15 border border-red-500/25'
            }`}>
              <Trash2 size={26} className={eliminarEvento.status === 'publicado' ? 'text-orange-400' : 'text-red-400'} />
            </div>

            <h2 className="font-display text-white text-lg font-semibold mb-2">
              {eliminarEvento.status === 'publicado' ? '¿Cancelar evento?' : '¿Eliminar evento?'}
            </h2>

            <p className="text-white/80 text-sm font-medium mb-3 truncate px-2">
              "{eliminarEvento.title}"
            </p>

            {eliminarEvento.status === 'publicado' ? (
              <p className="text-white/35 text-xs leading-relaxed mb-6">
                El evento pasará a estado <span className="text-orange-400 font-semibold">cancelado</span>. Si hay boletos vendidos ({eliminarEvento.sold} boletos), el Administrador gestionará los reembolsos del precio base. El cargo por servicio no se reembolsa.
              </p>
            ) : (
              <p className="text-white/35 text-xs leading-relaxed mb-6">
                El evento será eliminado permanentemente del sistema. Esta acción no se puede deshacer.
                {eliminarEvento.sold > 0 && (
                  <span className="text-yellow-400"> Este evento tiene boletos vendidos — coordina con el Administrador antes de eliminar.</span>
                )}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setEliminarEvento(null)}
                className="btn-outline flex-1 py-2.5 text-sm"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  if (eliminarEvento.status === 'publicado') {
                    // Cancelar → cambia estado, no elimina del sistema
                    // TODO: POST /api/events/:id/cancel
                    setEvents(prev => prev.map(e =>
                      e.id === eliminarEvento.id ? { ...e, status: 'cancelado' } : e
                    ))
                  } else {
                    // Eliminar → borra del sistema (borrador o pendiente)
                    // TODO: DELETE /api/events/:id
                    setEvents(prev => prev.filter(e => e.id !== eliminarEvento.id))
                  }
                  setEliminarEvento(null)
                }}
                className={`flex-1 py-2.5 text-sm rounded-full font-semibold transition-all border ${
                  eliminarEvento.status === 'publicado'
                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/30'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30'
                }`}
              >
                {eliminarEvento.status === 'publicado' ? 'Sí, cancelar evento' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-display text-xl font-semibold">Mis Eventos</h1>
          <p className="text-white/40 text-xs mt-0.5">Gestiona y publica tus eventos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2 text-sm px-4 py-2">
          <Plus size={15} /> Crear evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Eventos activos',        value: events.filter(e=>e.status==='publicado').length, icon: CalendarPlus, color: 'text-purple-400' },
          { label: 'Boletos vendidos',        value: totalBoletos,                                    icon: Ticket,       color: 'text-pink-400' },
          { label: 'Ingresos (precio base)', value: `$${(totalIngresos/1000).toFixed(0)}K`,           icon: DollarSign,   color: 'text-emerald-400' },
          { label: 'Capacidad total',        value: events.reduce((a,e) => a+e.capacity, 0),          icon: Users,        color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/40 text-xs leading-tight">{label}</p>
              <Icon size={14} className={color} />
            </div>
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de eventos */}
      <div className="space-y-3">
        {query && filtered.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">Sin resultados para "{query}"</p>
        )}
        {filtered.map((event) => {
          const { cargoServicio, totalUsuario } = calcFinanciero(event.precioBase)
          return (
            <div key={event.id} className="flex gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-purple-500/25 backdrop-blur-sm transition-all">
              <img src={event.image} alt={event.title} className="w-20 h-16 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm truncate">{event.title}</h3>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[event.status] || 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-white/40 text-xs mb-1">{event.date} · {event.venue}</p>
                <p className="text-white/25 text-xs mb-2">
                  Precio base: <span className="text-white/50">${event.precioBase}</span>
                  {' · '}Usuario paga: <span className="text-purple-300">${totalUsuario.toFixed(2)}</span>
                  {' · '}Cargo servicio: <span className="text-pink-300/70">${cargoServicio.toFixed(2)}</span>
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${(event.sold / event.capacity) * 100}%` }} />
                  </div>
                  <span className="text-white/40 text-xs shrink-0">{event.sold}/{event.capacity} boletos</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setVerEvento(event)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/10 text-xs transition-all border border-white/[0.08]"
                ><Eye size={11} /> Ver</button>
                <button
                  onClick={() => setEditEvento(event)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all border
                    ${event.status === 'cancelado'
                      ? 'bg-white/[0.02] text-white/20 border-white/[0.05] cursor-not-allowed'
                      : 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border-purple-500/20'
                    }`}
                  disabled={event.status === 'cancelado'}
                ><Edit size={11} /> Editar</button>
                <button
                  onClick={() => event.status !== 'cancelado' && setEliminarEvento(event)}
                  disabled={event.status === 'cancelado'}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all border
                    ${event.status === 'cancelado'
                      ? 'bg-white/[0.02] text-white/15 border-white/[0.05] cursor-not-allowed'
                      : event.status === 'publicado'
                        ? 'bg-orange-500/10 text-orange-400/80 hover:bg-orange-500/20 hover:text-orange-400 border-orange-500/20'
                        : 'bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 border-red-500/20'
                    }`}
                >
                  <Trash2 size={11} />
                  {event.status === 'publicado' ? 'Cancelar' : event.status === 'cancelado' ? 'Cancelado' : 'Eliminar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConfigBoletos() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Configuración de Boletos</h1>

      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <p className="text-purple-200/70 text-xs leading-relaxed">
          <span className="font-semibold">ℹ️ Cómo funciona el precio:</span> Tú defines el precio base. El sistema agrega automáticamente un cargo por servicio del 15% que el usuario paga en el checkout. Tú recibirás tu precio base completo.
        </p>
      </div>

      {mockMyEvents.filter(e => e.status !== 'cancelado').map((event) => {
        const { cargoServicio, totalUsuario } = calcFinanciero(event.precioBase)
        return (
          <div key={event.id} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">{event.title}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[event.status]}`}>{event.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="reg-field">
                <label className="reg-label">Precio base (MXN)</label>
                <input type="number" className="reg-input-no-icon" defaultValue={event.precioBase} placeholder="Ej: 500" />
              </div>
              <div className="reg-field">
                <label className="reg-label">Capacidad total</label>
                <input type="number" className="reg-input-no-icon" defaultValue={event.capacity} />
              </div>
            </div>

            {/* Simulador de precio */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.07] space-y-1.5 text-xs">
              <p className="text-white/50 font-semibold mb-2">Vista previa del checkout:</p>
              <div className="flex justify-between"><span className="text-white/40">Precio boleto</span><span className="text-white/60">${event.precioBase}.00</span></div>
              <div className="flex justify-between"><span className="text-white/40">Cargo por servicio (15%)</span><span className="text-pink-300">+${cargoServicio.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-white/[0.06] pt-1.5 mt-1"><span className="text-white font-semibold">Total usuario paga</span><span className="text-purple-300 font-semibold">${totalUsuario.toFixed(2)}</span></div>
              <div className="flex justify-between pt-1"><span className="text-white/30">Tú recibirás</span><span className="text-emerald-400">${event.precioBase}.00 por boleto</span></div>
            </div>

            <button className="btn-gold text-sm px-5 py-2">Guardar cambios</button>
          </div>
        )
      })}
    </div>
  )
}

function MisVentas() {
  const maxBoletos = Math.max(...mockVentasMes.map(d => d.boletos))
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Mis Ventas</h1>

      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white/80 text-sm font-semibold">Boletos vendidos por mes</h2>
          <TrendingUp size={16} className="text-purple-400" />
        </div>
        <div className="flex items-end gap-3 h-32">
          {mockVentasMes.map(({ mes, boletos }) => (
            <div key={mes} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-white/40 text-[10px]">{boletos}</span>
              <div className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-md" style={{ height: `${(boletos / maxBoletos) * 100}%` }} />
              <span className="text-white/30 text-[10px]">{mes}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
        <h2 className="text-white/80 text-sm font-semibold mb-4">Desglose por evento</h2>
        <div className="space-y-3">
          {mockMyEvents.filter(e => e.sold > 0).map((event) => {
            const netoOrg = event.sold * event.precioBase
            return (
              <div key={event.id} className="flex items-center gap-4 py-2 border-b border-white/[0.05] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm truncate">{event.title}</p>
                  <p className="text-white/30 text-xs">{event.date} · Precio base: ${event.precioBase}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white/70 text-sm font-semibold">{event.sold} boletos</p>
                  <p className="text-emerald-400 text-xs">A recibir: ${netoOrg.toLocaleString()} MXN</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Reportes() {
  const [activeReport, setActiveReport] = useState(null)

  // ── Datos calculados de los eventos reales ────────────────────────────────
  const totalVendidos  = mockMyEvents.reduce((a, e) => a + e.sold, 0)
  const totalCapacidad = mockMyEvents.reduce((a, e) => a + e.capacity, 0)
  const totalIngresos  = mockMyEvents.reduce((a, e) => a + e.sold * e.precioBase, 0)
  const maxBoletos     = Math.max(...mockMyEvents.map(e => e.sold), 1)
  const cancelados     = mockMyEvents.filter(e => e.status === 'cancelado')

  // ── Vista de reporte individual ───────────────────────────────────────────
  if (activeReport === 'ventas') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-purple-300 transition-colors text-xs flex items-center gap-1">
            ← Volver
          </button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Ventas</h1>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total vendidos',  value: totalVendidos,                              color: 'text-purple-400' },
            { label: 'Ingresos totales', value: `$${totalIngresos.toLocaleString()}`,      color: 'text-emerald-400' },
            { label: 'Ocupación media', value: `${Math.round((totalVendidos/totalCapacidad)*100)}%`, color: 'text-pink-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center backdrop-blur-sm">
              <p className="text-white/40 text-xs mb-1">{label}</p>
              <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabla por evento */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h2 className="text-white/70 text-sm font-semibold">Desglose por evento</h2>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {mockMyEvents.map(event => {
              const { cargoServicio, totalUsuario } = calcFinanciero(event.precioBase)
              const ingresos = event.sold * event.precioBase
              return (
                <div key={event.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{event.title}</p>
                      <p className="text-white/30 text-xs">{event.date} · Precio base: ${event.precioBase}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[event.status] || 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(event.sold / event.capacity) * 100}%` }} />
                    </div>
                    <span className="text-white/40 text-xs shrink-0">{event.sold}/{event.capacity}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/30">
                    <span>Ingreso base: <span className="text-emerald-400">${ingresos.toLocaleString()}</span></span>
                    <span>Usuario paga: <span className="text-purple-300">${totalUsuario.toFixed(2)}/boleto</span></span>
                    <span>Cargo serv: <span className="text-pink-300">${cargoServicio.toFixed(2)}/boleto</span></span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (activeReport === 'asistencia') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-purple-300 transition-colors text-xs">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Asistencia</h1>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h2 className="text-white/70 text-sm font-semibold">Confirmados vs Capacidad</h2>
          </div>
          <div className="p-5 space-y-5">
            {mockMyEvents.map(event => {
              const pct = Math.round((event.sold / event.capacity) * 100)
              const disponibles = event.capacity - event.sold
              return (
                <div key={event.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/80 text-sm font-medium">{event.title}</p>
                    <span className="text-white/40 text-xs">{pct}% ocupado</span>
                  </div>
                  {/* Barra doble: vendidos + disponibles */}
                  <div className="h-4 bg-white/[0.06] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-l-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/30 mt-1.5">
                    <span><span className="text-purple-300">{event.sold}</span> confirmados</span>
                    <span><span className="text-white/50">{disponibles}</span> disponibles</span>
                    <span>Total: {event.capacity}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Total global */}
          <div className="px-5 py-3 border-t border-white/[0.06] flex justify-between items-center">
            <span className="text-white/50 text-xs font-semibold">Total general</span>
            <span className="text-white/70 text-xs">{totalVendidos} / {totalCapacidad} boletos · {Math.round((totalVendidos/totalCapacidad)*100)}% ocupación</span>
          </div>
        </div>
      </div>
    )
  }

  if (activeReport === 'estadisticas') {
    const maxVal = Math.max(...mockMyEvents.map(e => e.sold), 1)
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-purple-300 transition-colors text-xs">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Estadísticas del Evento</h1>
        </div>

        {/* Gráfica de barras */}
        <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
          <h2 className="text-white/70 text-sm font-semibold mb-5">Boletos vendidos por evento</h2>
          <div className="flex items-end gap-4 h-36">
            {mockMyEvents.map(event => (
              <div key={event.id} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-white/50 text-[10px]">{event.sold}</span>
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg transition-all"
                  style={{ height: `${(event.sold / maxVal) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-white/30 text-[10px] text-center leading-tight truncate w-full px-1">
                  {event.title.split(':')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Evento más exitoso', value: mockMyEvents.reduce((a,b) => a.sold > b.sold ? a : b).title.split(':')[0], color: 'text-emerald-400' },
            { label: 'Evento con más capacidad', value: mockMyEvents.reduce((a,b) => a.capacity > b.capacity ? a : b).title.split(':')[0], color: 'text-blue-400' },
            { label: 'Precio base más alto', value: `$${Math.max(...mockMyEvents.map(e=>e.precioBase))}`, color: 'text-purple-400' },
            { label: 'Tasa de venta promedio', value: `${Math.round((totalVendidos/totalCapacidad)*100)}%`, color: 'text-pink-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm">
              <p className="text-white/40 text-xs mb-1">{label}</p>
              <p className={`font-semibold text-sm ${color} truncate`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeReport === 'cancelaciones') {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveReport(null)} className="text-white/40 hover:text-purple-300 transition-colors text-xs">← Volver</button>
          <h1 className="text-white font-display text-xl font-semibold">Reporte de Cancelaciones</h1>
        </div>

        {cancelados.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
            <AlertCircle size={28} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No tienes eventos cancelados</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm overflow-hidden">
            <div className="divide-y divide-white/[0.05]">
              {cancelados.map(event => {
                const reembolso = event.sold * event.precioBase
                return (
                  <div key={event.id} className="px-5 py-4">
                    <p className="text-white/80 text-sm font-medium mb-1">{event.title}</p>
                    <p className="text-white/30 text-xs mb-2">{event.date} · {event.venue}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-white/40">Boletos vendidos: <span className="text-white/60">{event.sold}</span></span>
                      <span className="text-white/40">Reembolso precio base: <span className="text-emerald-400">${reembolso.toLocaleString()}</span></span>
                      <span className="text-white/40">Cargo retenido: <span className="text-pink-300">${(event.sold * event.precioBase * 0.15).toLocaleString()}</span></span>
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

  // ── Vista principal — tarjetas de reportes ────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-white font-display text-xl font-semibold">Reportes de Eventos</h1>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Boletos vendidos', value: totalVendidos,                           color: 'text-purple-400' },
          { label: 'Ingresos totales', value: `$${totalIngresos.toLocaleString()}`,   color: 'text-emerald-400' },
          { label: 'Cancelaciones',    value: cancelados.length,                       color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center backdrop-blur-sm">
            <p className="text-white/40 text-[10px] mb-1">{label}</p>
            <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: 'ventas',        title: 'Reporte de ventas',       desc: 'Boletos vendidos e ingresos por evento con desglose financiero.',  icon: BarChart2,   color: 'text-purple-400' },
          { id: 'asistencia',    title: 'Reporte de asistencia',   desc: 'Confirmados vs capacidad total con barra de ocupación.',           icon: Users,       color: 'text-blue-400' },
          { id: 'estadisticas',  title: 'Estadísticas del evento', desc: 'Gráfica de ventas, KPIs y tasa de ocupación promedio.',            icon: TrendingUp,  color: 'text-pink-400' },
          { id: 'cancelaciones', title: 'Reporte de cancelaciones', desc: 'Historial de cancelaciones con montos de reembolso y cargos.',   icon: AlertCircle, color: 'text-red-400' },
        ].map(({ id, title, desc, icon: Icon, color }) => (
          <div
            key={id}
            onClick={() => setActiveReport(id)}
            className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-purple-500/30 backdrop-blur-sm transition-all cursor-pointer group"
          >
            <Icon size={20} className={`${color} mb-3`} />
            <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
            <p className="text-white/35 text-xs leading-relaxed mb-4">{desc}</p>
            <span className="text-purple-300 group-hover:text-purple-200 text-xs transition-colors">Ver reporte →</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Datos bancarios ─────────────────────────────────────────────────────────
function DatosBancarios() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    titular:  user?.name || '',
    banco:    '',
    clabe:    '',
    cuenta:   '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [editing, setEditing] = useState(true)  // false = modo lectura, true = modo formulario
  const [toast,   setToast]   = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3500) }

  function validate() {
    const e = {}
    if (!form.titular.trim())              e.titular = 'El nombre del titular es requerido'
    if (!form.banco.trim())                e.banco   = 'El nombre del banco es requerido'
    if (!/^\d{18}$/.test(form.clabe))      e.clabe   = 'La CLABE debe tener exactamente 18 dígitos'
    if (form.cuenta && !/^\d{10,11}$/.test(form.cuenta)) e.cuenta = 'Número de cuenta inválido'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    // TODO: PUT /api/organizador/datos-bancarios → { titular, banco, clabe, cuenta, rfc }
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSaved(true)
    setEditing(false)
    showToast(saved ? 'Datos bancarios actualizados correctamente' : 'Datos bancarios guardados correctamente')
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // Máscara CLABE — muestra solo últimos 4 dígitos
  const clabeMask = form.clabe.length === 18
    ? `${'•'.repeat(14)}${form.clabe.slice(-4)}`
    : form.clabe

  return (
    <div className="max-w-xl mx-auto space-y-5">

      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm bg-emerald-500/20 border-emerald-500/30 text-emerald-300 backdrop-blur-sm">
          ✓ {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-display text-xl font-semibold">Datos bancarios</h2>
          <p className="text-white/40 text-xs mt-0.5">
            Esta información se usa para procesar las transferencias de tus ventas
          </p>
        </div>
        {/* Botón editar — solo visible en modo lectura */}
        {saved && !editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] text-white/60 hover:text-white/90 hover:bg-white/10 text-xs border border-white/[0.08] transition-all">
            <Edit size={13} /> Editar
          </button>
        )}
      </div>

      {/* Aviso de seguridad */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
        <Building2 size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-blue-200/70 text-xs leading-relaxed">
          Tu información bancaria está protegida y solo es utilizada por el equipo de contabilidad para procesar tus pagos. Elysium no realiza cargos a tu cuenta.
        </p>
      </div>

      {/* ── Modo lectura — datos guardados ── */}
      {saved && !editing ? (
        <div className="p-5 rounded-xl bg-white/[0.04] border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-emerald-300 text-xs font-semibold">Datos bancarios registrados</span>
          </div>
          {[
            { label: 'Titular',          value: form.titular },
            { label: 'Banco',            value: form.banco },
            { label: 'CLABE',            value: clabeMask,   mono: true },
            { label: 'Número de cuenta', value: form.cuenta || '—' },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0">
              <span className="text-white/40 text-xs">{label}</span>
              <span className={`text-white/70 text-sm ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</span>
            </div>
          ))}
        </div>

      ) : (
        /* ── Modo formulario ── */
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] space-y-4">

          {/* Titular */}
          <div>
            <label className="reg-label">Nombre del titular <span className="text-red-400">*</span></label>
            <input type="text" value={form.titular}
              onChange={e => handleChange('titular', toTitleCase(e.target.value))}
              placeholder="Nombre completo como aparece en tu cuenta"
              className={`reg-input-no-icon ${errors.titular ? 'error' : ''}`} />
            {errors.titular && <span className="reg-error">{errors.titular}</span>}
          </div>

          {/* Banco */}
          <div>
            <label className="reg-label">Banco <span className="text-red-400">*</span></label>
            <select value={form.banco} onChange={e => handleChange('banco', e.target.value)}
              className={`reg-input-no-icon ${errors.banco ? 'error' : ''}`} style={{ appearance: 'none' }}>
              <option value="" disabled>Selecciona tu banco</option>
              {['BBVA', 'Santander', 'Citibanamex', 'HSBC', 'Banorte', 'Scotiabank',
                'Inbursa', 'Afirme', 'BanBajío', 'Otro'].map(b => (
                <option key={b} value={b} className="bg-[#13092a]">{b}</option>
              ))}
            </select>
            {errors.banco && <span className="reg-error">{errors.banco}</span>}
          </div>

          {/* CLABE */}
          <div>
            <label className="reg-label">CLABE interbancaria <span className="text-red-400">*</span></label>
            <input type="text" value={form.clabe} maxLength={18}
              onChange={e => handleChange('clabe', e.target.value.replace(/\D/g, ''))}
              placeholder="18 dígitos"
              className={`reg-input-no-icon font-mono tracking-wider ${errors.clabe ? 'error' : ''}`} />
            <div className="flex justify-between mt-1">
              {errors.clabe
                ? <span className="reg-error">{errors.clabe}</span>
                : <span className="text-white/25 text-xs">Solo números, sin espacios ni guiones</span>
              }
              <span className={`text-xs ml-auto ${form.clabe.length === 18 ? 'text-emerald-400' : 'text-white/30'}`}>
                {form.clabe.length}/18
              </span>
            </div>
          </div>

          {/* Número de cuenta (opcional) */}
          <div>
            <label className="reg-label">Número de cuenta <span className="text-white/30 text-xs font-normal">(opcional)</span></label>
            <input type="text" value={form.cuenta} maxLength={11}
              onChange={e => handleChange('cuenta', e.target.value.replace(/\D/g, ''))}
              placeholder="10 u 11 dígitos"
              className={`reg-input-no-icon font-mono ${errors.cuenta ? 'error' : ''}`} />
            {errors.cuenta && <span className="reg-error">{errors.cuenta}</span>}
          </div>

          <div className="flex gap-3">
            {/* Botón cancelar edición — solo si ya había datos guardados */}
            {saved && (
              <button type="button" onClick={() => { setEditing(false); setErrors({}) }}
                className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 transition-all">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={loading} className={`btn-gold py-3 text-sm ${saved ? 'flex-1' : 'w-full'}`}>
              {loading ? <span className="reg-spinner" /> : saved ? 'Actualizar datos' : 'Guardar datos bancarios'}
            </button>
          </div>
        </form>
      )}

      {/* Nota sobre transferencias */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/25 leading-relaxed">
        Los pagos se procesan una vez que el contador aprueba la transferencia desde el panel de contabilidad. El tiempo estimado es de 3 a 5 días hábiles después de la liquidación del evento.
      </div>
    </div>
  )
}

// ─── Configuración de la cuenta ───────────────────────────────────────────────
function ConfiguracionCuenta() {
  const { user } = useAuth()
  const [form, setForm]           = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [errors, setErrors]       = useState({})
  const [showPass, setShowPass]   = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState(null)

  function showToastMsg(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function handleSaveInfo(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 3) errs.name = 'Mínimo 3 caracteres'
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo inválido'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    showToastMsg('Datos actualizados correctamente')
  }

  async function handleSavePassword(e) {
    e.preventDefault()
    const errs = {}
    if (!passwords.current)                       errs.current = 'Ingresa tu contraseña actual'
    if (!passwords.newPass)                       errs.newPass = 'Ingresa la nueva contraseña'
    else if (passwords.newPass.length < 8)        errs.newPass = 'Mínimo 8 caracteres'
    if (passwords.newPass !== passwords.confirm)  errs.confirm = 'Las contraseñas no coinciden'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setPasswords({ current: '', newPass: '', confirm: '' })
    showToastMsg('Contraseña actualizada correctamente')
  }

  const strength = passwords.newPass.length === 0 ? 0 : passwords.newPass.length < 6 ? 1 : passwords.newPass.length < 10 ? 2 : 3
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500']
  const strengthLabel = ['', 'Débil', 'Regular', 'Fuerte']

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
          ✓ {toast}
        </div>
      )}
      <h2 className="text-white font-display text-xl font-semibold">Configuración de la cuenta</h2>

      {/* Datos personales */}
      <form onSubmit={handleSaveInfo} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] space-y-4">
        <h3 className="text-white/70 text-sm font-semibold">Datos personales</h3>
        <div className="space-y-3">
          <div>
            <label className="reg-label">Nombre completo</label>
            <input type="text" value={form.name}
              onChange={e => setForm({...form, name: toTitleCase(e.target.value)})}
              className={`reg-input-no-icon ${errors.name ? 'error' : ''}`} />
            {errors.name && <span className="reg-error">{errors.name}</span>}
          </div>
          <div>
            <label className="reg-label">Correo electrónico</label>
            <input type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className={`reg-input-no-icon ${errors.email ? 'error' : ''}`} />
            {errors.email && <span className="reg-error">{errors.email}</span>}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full py-2.5 text-sm">
          {loading ? <span className="reg-spinner" /> : 'Guardar cambios'}
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handleSavePassword} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.07] space-y-4">
        <h3 className="text-white/70 text-sm font-semibold">Cambiar contraseña</h3>
        {[
          { key: 'current', label: 'Contraseña actual',   show: showPass.current,  toggle: () => setShowPass(p => ({...p, current: !p.current})) },
          { key: 'newPass', label: 'Nueva contraseña',    show: showPass.new,      toggle: () => setShowPass(p => ({...p, new: !p.new})) },
          { key: 'confirm', label: 'Confirmar contraseña',show: showPass.confirm,  toggle: () => setShowPass(p => ({...p, confirm: !p.confirm})) },
        ].map(({ key, label, show, toggle }) => (
          <div key={key}>
            <label className="reg-label">{label}</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={passwords[key]}
                onChange={e => { setPasswords({...passwords, [key]: e.target.value}); setErrors({...errors, [key]: ''}) }}
                className={`reg-input-no-icon pr-10 ${errors[key] ? 'error' : ''}`} />
              <button type="button" onClick={toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {key === 'newPass' && passwords.newPass.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                  {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-white/10'}`} />)}
                </div>
                <span className="text-xs text-white/40">{strengthLabel[strength]}</span>
              </div>
            )}
            {errors[key] && <span className="reg-error">{errors[key]}</span>}
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-gold w-full py-2.5 text-sm">
          {loading ? <span className="reg-spinner" /> : 'Actualizar contraseña'}
        </button>
      </form>

      {/* fin configuración */}
    </div>
  )
}

// ─── Mock colaboradores disponibles en la plataforma (vendrá de BD) ──────────
const mockColaboradoresDB = [
  { id: 1, name: 'Ana Martínez',    email: 'ana@gmail.com',    role: 'organizador' },
  { id: 2, name: 'Carlos López',    email: 'carlos@gmail.com', role: 'organizador' },
  { id: 3, name: 'María González',  email: 'maria@gmail.com',  role: 'organizador' },
  { id: 4, name: 'Luis Hernández',  email: 'luis@gmail.com',   role: 'organizador' },
]

// ─── Colaboradores ────────────────────────────────────────────────────────────
function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([
    { id: 1, name: 'Ana Martínez', email: 'ana@gmail.com' },
  ])
  const [addModal,    setAddModal]    = useState(false)
  const [newColab,    setNewColab]    = useState({ name: '', email: '' })
  const [formErrors,  setFormErrors]  = useState({})
  const [toast,       setToast]       = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function handleAgregar(e) {
    e.preventDefault()
    const errs = {}
    if (!newColab.name.trim() || newColab.name.trim().length < 3) errs.name  = 'Mínimo 3 caracteres'
    if (!/\S+@\S+\.\S+/.test(newColab.email))                    errs.email = 'Correo inválido'
    if (colaboradores.find(c => c.email === newColab.email))      errs.email = 'Este colaborador ya está agregado'
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setColaboradores(prev => [...prev, { id: Date.now(), name: newColab.name.trim(), email: newColab.email.trim() }])
    showToast(`Colaborador "${newColab.name.trim()}" agregado exitosamente`)
    setNewColab({ name: '', email: '' })
    setFormErrors({})
    setAddModal(false)
    // TODO: POST /api/organizador/colaboradores → { name, email }
  }

  function handleEliminar() {
    setColaboradores(prev => prev.filter(c => c.id !== deleteModal.id))
    showToast(`${deleteModal.name} eliminado de tus colaboradores`)
    setDeleteModal(null)
    // TODO: DELETE /api/organizador/colaboradores/:id
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm bg-emerald-500/20 border-emerald-500/30 text-emerald-300 backdrop-blur-sm">
          ✓ {toast}
        </div>
      )}

      {/* Modal agregar colaborador */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setAddModal(false); setFormErrors({}) }} />
          <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-purple-500/20 rounded-2xl shadow-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto mb-4">
              <UserPlus size={20} className="text-purple-400" />
            </div>
            <h2 className="font-display text-white text-lg font-semibold text-center mb-1">Nuevo colaborador</h2>
            <p className="text-white/40 text-xs text-center mb-5">Ingresa los datos del colaborador que deseas agregar</p>
            <form onSubmit={handleAgregar} className="space-y-3">
              <div>
                <label className="reg-label">Nombre completo</label>
                <input type="text" value={newColab.name}
                  onChange={e => { setNewColab({...newColab, name: toTitleCase(e.target.value)}); setFormErrors({...formErrors, name: ''}) }}
                  placeholder="Nombre del colaborador"
                  className={`reg-input-no-icon ${formErrors.name ? 'error' : ''}`} />
                {formErrors.name && <span className="reg-error">{formErrors.name}</span>}
              </div>
              <div>
                <label className="reg-label">Correo electrónico</label>
                <input type="email" value={newColab.email}
                  onChange={e => { setNewColab({...newColab, email: e.target.value}); setFormErrors({...formErrors, email: ''}) }}
                  placeholder="correo@ejemplo.com"
                  className={`reg-input-no-icon ${formErrors.email ? 'error' : ''}`} />
                {formErrors.email && <span className="reg-error">{formErrors.email}</span>}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setAddModal(false); setFormErrors({}); setNewColab({ name: '', email: '' }) }}
                  className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 transition-all">
                  Cancelar
                </button>
                <button type="submit"
                  className="btn-gold flex-1">
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#13092a] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h2 className="font-display text-white text-lg font-semibold mb-1">¿Eliminar colaborador?</h2>
            <p className="text-white/50 text-sm mb-5">
              <span className="text-white/80 font-medium">{deleteModal.name}</span> dejará de aparecer en tu lista.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 text-sm rounded-full border border-white/[0.1] text-white/50 hover:text-white/80 transition-all">
                Cancelar
              </button>
              <button onClick={handleEliminar}
                className="flex-1 py-2.5 text-sm rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-semibold transition-all">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-display text-xl font-semibold">Colaboradores</h2>
          <p className="text-white/40 text-xs mt-0.5">Personas que colaboran contigo en tus eventos</p>
        </div>
        <button onClick={() => setAddModal(true)}
          className="btn-gold flex items-center gap-2 text-sm px-4 py-2">
          <UserPlus size={15} /> Añadir colaborador
        </button>
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-white/70 text-sm font-semibold">Mis colaboradores</h3>
          <span className="text-white/30 text-xs">{colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''}</span>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {colaboradores.length === 0
            ? (
              <div className="px-5 py-10 text-center">
                <Users2 size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No tienes colaboradores aún</p>
                <p className="text-white/20 text-xs mt-1">Añade colaboradores para trabajar juntos en tus eventos</p>
              </div>
            )
            : colaboradores.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400/50 to-pink-500/50 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{c.name}</p>
                  <p className="text-white/30 text-xs">{c.email}</p>
                </div>
                <button onClick={() => setDeleteModal(c)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-all border border-red-500/15">
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          }
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/25 leading-relaxed">
        Los colaboradores podrán ser asignados a tus eventos al momento de crearlos o editarlos. Solo tú puedes ver y gestionar esta lista.
      </div>
    </div>
  )
}

const views = { eventos: MisEventos, ventas: MisVentas, reportes: Reportes, colaboradores: Colaboradores, bancario: DatosBancarios, config: ConfiguracionCuenta }

export default function OrganizerDashboard() {
  return (
    <DashboardLayout navItems={navItems} accentColor="purple" showHomeLink={true} searchPlaceholder="Buscar mis eventos...">
      {(activeNav, query) => { const View = views[activeNav] || MisEventos; return <View query={query} /> }}
    </DashboardLayout>
  )
}
