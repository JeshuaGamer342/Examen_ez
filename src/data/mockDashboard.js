// src/data/mockDashboard.js
// ─────────────────────────────────────────────────────────────────────────────
// Datos mock del panel de usuario.
// Cuando el backend esté listo, reemplazar con llamadas a src/api/tickets.js
// ─────────────────────────────────────────────────────────────────────────────

export const mockUserTickets = [
  {
    id: 1,
    eventName: 'Coldplay: Music of the Spheres',
    venue: 'Estadio Nacional, Santiago, CL',
    date: 'Sábado 30/MAY',
    time: '21:00 hrs',
    category: 'Música',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
    status: 'confirmado',   // 'confirmado' | 'pendiente' | 'cancelado'
    seat: 'Sección A · Fila 5 · Asiento 12',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ELYSIUM-TKT-001',
    canTransfer: false,
    canResell: false,
    price: 1200,
    isFeatured: true,       // boleto destacado (próximo evento)
  },
  {
    id: 2,
    price: 800,
    eventName: 'SuperClásico',
    venue: 'Estadio Monumental',
    date: '23/NOV',
    time: '18:00 hrs',
    category: 'Deportes',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    status: 'confirmado',
    seat: 'Tribuna Norte · Fila 10',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ELYSIUM-TKT-002',
    canTransfer: true,
    canResell: false,
  },
  {
    id: 3,
    price: 950,
    eventName: 'Gran Obra Musical',
    venue: 'Teatro Municipal',
    date: '15/JUN',
    time: '20:00 hrs',
    category: 'Artes Escénicas',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80',
    status: 'confirmado',
    seat: 'Platea C1 · Fila 3 · Asiento 8',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ELYSIUM-TKT-003',
    canTransfer: false,
    canResell: true,
  },
  {
    id: 4,
    price: 550,
    eventName: 'Concierto a confirmar',
    venue: 'Por definir',
    date: 'Por confirmar',
    time: '',
    category: 'Música',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80',
    status: 'pendiente',
    seat: 'Por asignar',
    qrCode: null,
    canTransfer: false,
    canResell: false,
  },
]

export const mockUserStats = {
  activeTickets: 3,
  nextEventDays: 2,
  savedFavorites: 7,
}

export const mockRecommended = [
  {
    id: 10,
    title: 'Coldplay',
    subtitle: 'Coldplay Music of the Spheres',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80',
  },
  {
    id: 11,
    title: 'Concierto',
    subtitle: 'Artista similar a Coldplay',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
  },
  {
    id: 12,
    title: 'Teatro',
    subtitle: 'Show similar to C1',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&q=80',
  },
  {
    id: 13,
    title: 'Festival',
    subtitle: 'Show similar to C2',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80',
  },
]
