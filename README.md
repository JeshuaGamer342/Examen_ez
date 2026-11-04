# Elysium – Events Platform

Plataforma web de boletería digital construida con Vite + React + Tailwind CSS.

## 🚀 Cómo correr el proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Correr en desarrollo
```bash
npm run dev
```

### 3. Build para producción
```bash
npm run build
```

---

## 📁 Estructura del proyecto

```
elysium/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Header con navegación y búsqueda
│   │   ├── Hero.jsx          # Sección principal con imagen de fondo
│   │   ├── EventCard.jsx     # Card reutilizable para eventos
│   │   ├── CategoryCard.jsx  # Card para categorías
│   │   └── Footer.jsx        # Pie de página
│   ├── pages/
│   │   └── Landing.jsx       # Página principal
│   ├── data/
│   │   └── mockData.js       # Datos de ejemplo (reemplazar con API)
│   ├── App.jsx               # Router principal
│   ├── main.jsx              # Entry point
│   └── index.css             # Estilos globales + Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Vite + React 18 |
| Estilos | Tailwind CSS |
| Routing | React Router v6 |
| Iconos | Lucide React |
| Pagos | Stripe (próximamente) |
| Backend | Node.js + Express (próximamente) |
| Base de datos | MySQL (próximamente) |

---

## 📌 Rutas futuras a implementar

- `/login` — Inicio de sesión
- `/registro` — Registro de usuario
- `/evento/:id` — Detalle de evento
- `/checkout/:id` — Proceso de compra
- `/mis-boletos` — Boletos del usuario
- `/organizador/dashboard` — Panel del organizador
- `/admin/dashboard` — Panel del administrador
- `/contador/dashboard` — Panel del contador
