import { useNavigate } from 'react-router-dom'
import Card from './ui/Card'
import Button from './ui/Button'

export default function CategoryCard({ category }) {
  const navigate = useNavigate()

  return (
    <Card
      className="group h-64 cursor-pointer"
      onClick={() => navigate(`/eventos?q=${category.name}`)}
    >
      {/* Imagen */}
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1a] via-[#0d0a1a]/50 to-transparent" />

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-display text-white text-xl font-bold mb-4">
          {category.name}
        </h3>
        <Button
          className="w-full text-xs py-2"
          onClick={e => { e.stopPropagation(); navigate(`/eventos?q=${category.name}`) }}
        >
          Explorar {category.name}
        </Button>
      </div>
    </Card>
  )
}