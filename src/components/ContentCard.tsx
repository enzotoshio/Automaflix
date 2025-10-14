import type { OMDbFetchAPIResult, OMDbSearchAPIResult } from '@/api/media'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

interface ContentCardProps {
  content: OMDbFetchAPIResult | OMDbSearchAPIResult
}

const ContentCard = ({ content }: ContentCardProps) => {
  const navigate = useNavigate()
  const FALLBACK_SVG = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='600' height='900' viewBox='0 0 600 900'>
    <rect width='100%' height='100%' fill='#0f172a' />
    <g fill='#94a3b8' font-family='system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' font-size='28' text-anchor='middle'>
      <text x='50%' y='48%' style='font-weight:600'>NO IMAGE</text>
      <text x='50%' y='55%' style='font-size:18'>Unavailable</text>
    </g>
  </svg>
`)
  const FALLBACK_DATA_URL = `data:image/svg+xml;charset=utf-8,${FALLBACK_SVG}`
  const { Title, Year, Type, Poster } = content
  const [imgSrc, setImgSrc] = useState(
    Poster && Poster !== 'N/A' ? Poster : FALLBACK_DATA_URL,
  )
  const [hasError, setHasError] = useState(false)
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(FALLBACK_DATA_URL)
    }
  }
  const onSelect = useCallback(
    (id: string) => {
      navigate({ to: `/media/${id}` })
    },
    [navigate],
  )

  return (
    <div
      onClick={() => onSelect(content.imdbID)}
      className="group cursor-pointer relative overflow-hidden rounded-lg transition-smooth hover:scale-105 hover:z-10"
    >
      <div className="aspect-[2/3] relative bg-secondary">
        <img
          src={imgSrc}
          alt={Title}
          onError={handleError}
          loading="lazy"
          className="w-full h-full object-cover bg-secondary"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 gradient-card opacity-0 group-hover:opacity-100 transition-smooth" />

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-smooth">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {Title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <span>{Year}</span>
            <span>•</span>
            <span className="capitalize">{Type}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentCard
