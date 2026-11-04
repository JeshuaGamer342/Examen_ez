import { useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import fondoMejorado from '../assets/fondoMejorado.jpg'
import Button from './ui/Button'

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/eventos?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={fondoMejorado}
          alt="Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a1a]/80 via-[#0d0a1a]/40 to-[#0d0a1a]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24">

        <p className="text-purple-300 text-sm font-medium tracking-[0.3em] uppercase mb-4 animate-fade-in-up delay-100">
          Elysium Events Platform
        </p>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up delay-200">
          Descubre los mejores
          <br />
          <span className="bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
            eventos y espectáculos
          </span>
        </h1>

        <p className="text-white/60 text-lg mb-10 animate-fade-in-up delay-300">
          Miles de eventos en un solo lugar. Compra tus boletos de forma segura y rápida.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="animate-fade-in-up delay-400">
          <div className="glass rounded-2xl p-2 flex items-center gap-3 max-w-2xl mx-auto">
            <Search size={18} className="text-white/40 ml-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar espectáculos, artistas o recintos..."
              className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none py-2"
            />
            <Button type="submit" className="shrink-0">
              Buscar
            </Button>
          </div>
        </form>

        {/* Stats */}
        <div className="flex items-center justify-center gap-10 mt-12 animate-fade-in-up delay-400">
          {[
            { value: '500+', label: 'Eventos activos' },
            { value: '50K+', label: 'Boletos vendidos' },
            { value: '200+', label: 'Organizadores' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-white/40 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>


    </section>
  )
}