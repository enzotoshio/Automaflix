import ContentCard from '@/components/ContentCard'
import { useCallback, useState, type JSX, useMemo } from 'react'
import { MediaType, searchMedias } from '@/api/media'
import { useQuery } from '@tanstack/react-query'
import useSearch from '@/contexts/search/useSearch'
import Button from '@/components/ui/Button'

function SearchResults(): JSX.Element {
  const { searchQuery } = useSearch()
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState<MediaType | undefined>(undefined)
  const filters = [
    undefined,
    MediaType.Movie,
    MediaType.Series,
    MediaType.Episode,
  ]

  const {
    data: { result, totalResults } = { result: [], totalResults: 0 },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['search', searchQuery, page, filterType],
    queryFn: async () => {
      if (!searchQuery) return { result: [], totalResults: 0 }
      const { Search: result = [], totalResults = 0 } = await searchMedias({
        title: searchQuery,
        type: filterType,
        page,
      })
      return { result, totalResults: Number(totalResults) }
    },
    enabled: !!searchQuery,
    retry: 2,
    staleTime: 1000 * 60 * 5,
  })

  const totalPages = Math.ceil(totalResults / 10) || 0

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const getTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`
    if (isError) return `Error occurred while searching for "${searchQuery}"`
    return 'Please search something to see results'
  }

  const visiblePages = useMemo(() => {
    const visibleCount = 7
    const pages: number[] = []

    if (totalPages <= visibleCount) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (page <= 4) {
      for (let i = 1; i <= visibleCount; i++) pages.push(i)
    } else if (page > totalPages - 3) {
      for (let i = totalPages - visibleCount + 1; i <= totalPages; i++)
        pages.push(i)
    } else {
      for (let i = page - 3; i <= page + 3; i++) pages.push(i)
    }

    return pages
  }, [page, totalPages])

  return (
    <>
      <div className="flex gap-2 mb-4">
        {filters.map((type) => (
          <Button
            key={type ?? 'all'}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            data-testid={`filter-${type ?? 'all'}`}
            onClick={() => setFilterType(type)}
          >
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
          </Button>
        ))}
      </div>

      <h1
        className="text-4xl font-bold text-foreground mb-8"
        data-testid="search-title"
      >
        {getTitle()}
      </h1>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading...
        </div>
      ) : result.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => {
              const item = result[index]
              return item ? (
                <ContentCard key={`${item.imdbID}-${index}`} content={item} />
              ) : isLoading ? (
                <div
                  key={`placeholder-${index}`}
                  className="aspect-[2/3] rounded-lg bg-secondary animate-pulse"
                />
              ) : null
            })}
          </div>

          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              onClick={prevPage}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              &lt; Prev
            </Button>

            {visiblePages.map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                data-testid={`page-button-${p}`}
              >
                {p}
              </Button>
            ))}

            <Button
              onClick={nextPage}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
            >
              Next &gt;
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">
            No results found. Try a different search term.
          </p>
        </div>
      )}
    </>
  )
}

export default SearchResults
