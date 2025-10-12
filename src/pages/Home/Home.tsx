import { type JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DescriptionSize,
  fetchMovie,
  MediaType,
  type OMDbFetchAPIResult,
} from '../../api/movies'
import ContentRow from '@/components/ContentRow'

function Home(): JSX.Element {
  const FEATURED_MOVIES_IDS = [
    'tt0372784', // Batman Begins
    'tt0468569', // The Dark Knight
    'tt4154796', // Avengers: Endgame
    'tt0111161', // Shawshank Redemption
    'tt0133093', // The Matrix
    'tt0137523', // Fight Club
  ]

  const FEATURED_SERIES_IDS = [
    'tt0944947', // Game of Thrones
    'tt0108778', // Friends
    'tt2861424', // Rick and Morty
    'tt0306414', // How I Met Your Mother
    'tt0903747', // Breaking Bad
    'tt1475582', // Sherlock (BBC)
  ]

  const FEATURED_EPISODES_IDS = [
    'tt1541289', // How I Met Your Mother – "The Playbook" (Season 5, Episode 8)
    'tt0583452', // Friends – "The One Where Everybody Finds Out" (Season 5, Episode 14)
    'tt2301451', // Breaking Bad – "Ozymandias" (Season 5, Episode 14)
    'tt2861424', // Rick and Morty – "The Ricklantis Mixup" (Season 3, Episode 7)
    'tt2178784', // Game of Thrones – "The Rains of Castamere" (Season 3, Episode 9)
    'tt2301455', // Breaking Bad – "Felina" (Season 5, Episode 16)
  ]

  const { data: featuredMovies = [], isFetching: isFetchingFeaturedMovies } =
    useQuery<OMDbFetchAPIResult[]>({
      queryKey: ['featured', 'movies'],
      queryFn: async () =>
        Promise.all(
          FEATURED_MOVIES_IDS.map((id) =>
            fetchMovie({
              mediaId: id,
              type: MediaType.Movie,
              descriptionSize: DescriptionSize.Short,
            }),
          ),
        ),
      staleTime: 1000 * 60 * 60 * 24,
      retry: 3,
    })

  const { data: featuredSeries = [], isFetching: isFetchingFeaturedSeries } =
    useQuery({
      queryKey: ['featured', 'series'],
      queryFn: async () =>
        Promise.all(
          FEATURED_SERIES_IDS.map((id) =>
            fetchMovie({
              mediaId: id,
              type: MediaType.Series,
              descriptionSize: DescriptionSize.Short,
            }),
          ),
        ),
      staleTime: 1000 * 60 * 60 * 24,
      retry: 3,
    })

  const {
    data: featuredEpisodes = [],
    isFetching: isFetchingFeaturedEpisodes,
  } = useQuery({
    queryKey: ['featured', 'episodes'],
    queryFn: async () =>
      Promise.all(
        FEATURED_EPISODES_IDS.map((id) =>
          fetchMovie({
            mediaId: id,
            type: MediaType.Episode,
            descriptionSize: DescriptionSize.Short,
          }),
        ),
      ),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 3,
  })

  return (
    <>
      <ContentRow
        title="Featured Movies"
        content={featuredMovies}
        isLoading={isFetchingFeaturedMovies}
      />
      <ContentRow
        title="Popular Series"
        content={featuredSeries}
        isLoading={isFetchingFeaturedSeries}
      />
      <ContentRow
        title="Latest Episodes"
        content={featuredEpisodes}
        isLoading={isFetchingFeaturedEpisodes}
      />
    </>
  )
}

export default Home
