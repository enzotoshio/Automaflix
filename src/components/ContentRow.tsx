import ContentCard from '@/components/ContentCard'
import { useEffect, useRef, useState } from 'react'
import type { OMDbFetchAPIResult, OMDbSearchAPIResult } from '@/api/media'
import Button from './ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ContentRowProps {
  title: string
  content: OMDbFetchAPIResult[] | OMDbSearchAPIResult[]
  isLoading?: boolean
}

const ContentRow = ({ title, content, isLoading = true }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const skeletonCount = 6
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    const updateShowButtons = () => {
      const container = scrollRef.current
      if (!container) return
      setShowButtons(container.scrollWidth > container.clientWidth)
    }

    updateShowButtons()

    window.addEventListener('resize', updateShowButtons)
    return () => window.removeEventListener('resize', updateShowButtons)
  }, [content])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 400
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-4 px-4">{title}</h2>

      <div className="relative group">
        {showButtons && (
          <>
            <div className="absolute left-0 top-0 h-full flex items-center z-20 pointer-events-none">
              <div className="w-16 h-full flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => scroll('left')}
                  className="h-3/5 w-16 flex items-center justify-center bg-background/90 backdrop-blur-md shadow-md rounded-r-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="absolute right-0 top-0 h-full flex items-center z-20 pointer-events-none">
              <div className="w-16 h-full flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => scroll('right')}
                  className="h-3/5 w-16 flex items-center justify-center bg-background/90 backdrop-blur-md shadow-md rounded-l-full"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, idx) => (
                <div key={idx} className="flex-none w-48 animate-pulse">
                  <div className="aspect-[2/3] bg-background rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-700/20 dark:bg-gray-300/20" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="h-4 bg-gray-600 rounded mb-2 w-3/4" />
                      <div className="h-3 bg-gray-500 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            : content.map((item, index) => (
                <div key={`${item.imdbID}-${index}`} className="flex-none w-48">
                  <ContentCard content={item} />
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}

export default ContentRow
