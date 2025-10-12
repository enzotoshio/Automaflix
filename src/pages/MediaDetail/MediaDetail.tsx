import { Star } from 'lucide-react'
import ContentRow from '@/components/ContentRow'
import type { JSX } from 'react'
import {
  DescriptionSize,
  fetchMovie,
  MediaType,
  searchMovies,
  type OMDbFetchAPIResult,
} from '@/api/movies'
import { useQuery } from '@tanstack/react-query'
import { mediaDetailRoute } from '@/routes'
import { useParams } from '@tanstack/react-router'

function MediaDetail(): JSX.Element {
  const { id: mediaId } = useParams({ from: mediaDetailRoute.id })
  const { data: media, isFetching } = useQuery({
    queryKey: ['movie', mediaId],
    queryFn: async () =>
      fetchMovie({ mediaId, descriptionSize: DescriptionSize.Full }),
    retry: 2,
    staleTime: 1000 * 60 * 60 * 24,
  })

  const { data: relatedContent = [], isFetching: isFetchingRelatedContent } =
    useQuery({
      queryKey: ['movies', 'featured', new Date().getDate()],
      queryFn: async () => {
        const movies =
          (
            await searchMovies({
              title: media?.Title || 'movie',
              type: media?.Type || MediaType.Movie,
              page: 1,
            })
          ).Search || []

        return movies.slice(0, 6).filter((m) => m.imdbID !== mediaId)
      },
      retry: 3,
      staleTime: 1000 * 60 * 60 * 24,
      enabled: !!media?.Title,
    })

  if (!media && isFetching) {
    return (
      <div className="container mx-auto px-4 pt-24 text-center">
        <h1 className="text-3xl font-bold text-foreground">Content Loading</h1>
      </div>
    )
  } else if (media?.Response === 'False' || !media) {
    return (
      <div className="container mx-auto px-4 pt-24 text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Content not found
        </h1>
      </div>
    )
  }

  const {
    Title,
    Year,
    Genre,
    Plot,
    Poster,
    imdbRating,
    Type,
    Runtime,
    Director,
    Writer,
  } = media as OMDbFetchAPIResult

  const relatedContentCategory = {
    [MediaType.Movie]: 'Movies',
    [MediaType.Series]: 'Series',
    [MediaType.Episode]: 'Episodes',
  }
  const relatedContentTitle = `More ${relatedContentCategory[Type as MediaType]}`

  return (
    <>
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={Poster}
          alt={Title}
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />

        <div className="absolute inset-0 gradient-hero" />

        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold uppercase">
                {Type}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              {Title}
            </h1>

            {Director && Writer && (
              <span className="text-foreground">
                Director: {Director} • Writer: {Writer}
              </span>
            )}

            <div className="flex items-center gap-4 text-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold">{imdbRating}</span>
              </div>
              <span>•</span>
              <span>{Year}</span>
              <span>•</span>
              <span>{Runtime}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Genre?.split(', ').map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
          <p className="text-lg text-foreground/80 leading-relaxed">{Plot}</p>
        </div>

        {relatedContent.length > 0 && (
          <ContentRow
            title={relatedContentTitle}
            content={relatedContent}
            isLoading={isFetchingRelatedContent}
          />
        )}
      </div>
    </>
  )
}

export default MediaDetail
