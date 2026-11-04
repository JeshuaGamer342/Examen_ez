import { ArrowRight, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import EventCard from '../components/EventCard'
import CategoryCard from '../components/CategoryCard'
import Button from '../components/ui/Button'
import { featuredEvents, categories, nearbyEvents } from '../data/mockData'

function SectionHeader({ title, showAll = true, onVerTodo }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="section-title mb-0">{title}</h2>
      {showAll && (
        <button
          onClick={onVerTodo}
          className="text-purple-300 hover:text-pink-400 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          Ver todo <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <main>
      <Hero />

      <div className="max-w-7xl mx-auto px-6">

        {/* Destacados */}
        <section className="py-16">
          <SectionHeader
            title="Destacados"
            onVerTodo={() => navigate('/eventos')}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate('/eventos')}
            >
              Explorar más <ArrowRight size={16} />
            </Button>
          </div>
        </section>

        {/* Categorías */}
        <section className="py-8">
          <SectionHeader
            title="Explorar categorías"
            showAll={false}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* Cercanos */}
        <section className="py-16">
          <SectionHeader
            title="Eventos populares"
            onVerTodo={() => navigate('/eventos')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}