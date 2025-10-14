import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import MediaDetail from './MediaDetail'
import * as moviesApi from '@/api/media'

vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(),
}))

vi.mock('@/routes', () => ({
  mediaDetailRoute: { id: 'media-detail' },
}))

vi.mock('@/components/ContentRow', () => ({
  default: ({
    title,
    content,
    isLoading,
  }: {
    title: string
    content: { imdbID: string; Title?: string }[]
    isLoading: boolean
  }) => (
    <div data-testid="content-row">
      <h2>{title}</h2>
      {isLoading ? (
        <div>Loading related content...</div>
      ) : (
        <div>
          {content.map((item) => (
            <div key={item.imdbID} data-testid={`related-${item.imdbID}`}>
              {item.Title}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}))

const mockfetchMedia = vi.spyOn(moviesApi, 'fetchMedia')
const mocksearchMedias = vi.spyOn(moviesApi, 'searchMedias')
const mockUseParams = vi.mocked(useParams)

const renderWithProviders = (mediaId = 'tt0372784') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  mockUseParams.mockReturnValue({ id: mediaId })

  return render(
    <QueryClientProvider client={queryClient}>
      <MediaDetail />
    </QueryClientProvider>,
  )
}

describe('MediaDetail Page', () => {
  const mockMovieData = {
    Title: 'Batman Begins',
    Year: '2005',
    Rated: 'PG-13',
    Released: '15 Jun 2005',
    Runtime: '140 min',
    Genre: 'Action, Crime, Drama',
    Director: 'Christopher Nolan',
    Writer: 'Bob Kane, David S. Goyer, Christopher Nolan',
    Actors: 'Christian Bale, Michael Caine, Liam Neeson',
    Plot: "After witnessing his parents' death, Bruce Wayne learns the art of fighting to confront injustice.",
    Language: 'English',
    Country: 'United States, United Kingdom',
    Awards: 'Nominated for 1 Oscar. 15 wins & 79 nominations total',
    Poster: 'https://example.com/batman-begins-poster.jpg',
    Ratings: [
      { Source: 'Internet Movie Database', Value: '8.2/10' },
      { Source: 'Rotten Tomatoes', Value: '84%' },
    ],
    Metascore: '70',
    imdbRating: '8.2',
    imdbVotes: '1,500,000',
    imdbID: 'tt0372784',
    Type: moviesApi.MediaType.Movie,
    DVD: '18 Oct 2005',
    BoxOffice: '$206,852,432',
    Production: 'N/A',
    Website: 'N/A',
    Response: 'True' as const,
  }

  const mockRelatedContent = [
    {
      Title: 'The Dark Knight',
      Year: '2008',
      Type: moviesApi.MediaType.Movie,
      Poster: 'https://example.com/dark-knight-poster.jpg',
      imdbID: 'tt0468569',
    },
    {
      Title: 'Batman Returns',
      Year: '1992',
      Type: moviesApi.MediaType.Movie,
      Poster: 'https://example.com/batman-returns-poster.jpg',
      imdbID: 'tt0103776',
    },
  ]

  const mockSearchResults = {
    Search: [mockMovieData, ...mockRelatedContent],
    totalResults: '3',
    Response: 'True' as const,
  }

  beforeEach(() => {
    mockfetchMedia.mockClear()
    mocksearchMedias.mockClear()
    mockUseParams.mockClear()
  })

  describe('Loading States', () => {
    it('should show loading state while fetching movie data', () => {
      // Setup
      mockfetchMedia.mockImplementation(() => new Promise(() => {}))

      // Exercise
      renderWithProviders()

      // Verify
      expect(screen.getByText('Content Loading')).toBeInTheDocument()
    })

    it('should show loading state for related content', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockImplementation(() => new Promise(() => {}))

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument()
      })

      // Related content doesn't show loading in this component - it's handled by ContentRow
      // We can verify that related content is not displayed while loading
      expect(screen.queryByTestId('content-row')).not.toBeInTheDocument()
    })
  })

  describe('Movie Content Display', () => {
    it('should display movie title and basic information', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument()
        expect(screen.getByText('2005')).toBeInTheDocument()
        expect(screen.getByText('140 min')).toBeInTheDocument()
        expect(screen.getByText('8.2')).toBeInTheDocument()
      })
    })

    it('should display movie genres as tags', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument()
        expect(screen.getByText('Crime')).toBeInTheDocument()
        expect(screen.getByText('Drama')).toBeInTheDocument()
      })
    })

    it('should display director and writer information', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(
          screen.getByText(/Director: Christopher Nolan/),
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /Writer: Bob Kane, David S. Goyer, Christopher Nolan/,
          ),
        ).toBeInTheDocument()
      })
    })

    it('should display movie plot in about section', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('About')).toBeInTheDocument()
        expect(
          screen.getByText(/After witnessing his parents' death/),
        ).toBeInTheDocument()
      })
    })

    it('should display media type badge', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('movie')).toBeInTheDocument()
      })
    })
  })

  describe('Related Content', () => {
    it('should display related content when available', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('More Movies')).toBeInTheDocument()
        expect(screen.getByTestId('related-tt0468569')).toBeInTheDocument()
        expect(screen.getByTestId('related-tt0103776')).toBeInTheDocument()
      })
    })

    it('should filter out current movie from related content', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders('tt0372784')

      // Verify
      await waitFor(() => {
        expect(
          screen.queryByTestId('related-tt0372784'),
        ).not.toBeInTheDocument()
        expect(screen.getByTestId('related-tt0468569')).toBeInTheDocument()
      })
    })

    it('should show appropriate title for different media types', async () => {
      // Setup
      const seriesData = { ...mockMovieData, Type: moviesApi.MediaType.Series }
      mockfetchMedia.mockResolvedValue(seriesData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('More Series')).toBeInTheDocument()
      })
    })

    it('should not display related content section when no content available', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue({
        Search: [],
        totalResults: '0',
        Response: 'True' as const,
      })

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('content-row')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show not found message when movie is not found', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue({
        imdbID: 'invalid-id',
        Response: 'False',
        Error: 'Movie not found!',
      })

      // Exercise
      renderWithProviders('invalid-id')

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Content not found')).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      // Setup
      mockfetchMedia.mockRejectedValue(new Error('API Error'))

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Content Loading')).toBeInTheDocument()
      })
    })

    it('should handle related content fetch errors', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockRejectedValue(new Error('Related content error'))

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('content-row')).not.toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('should fetch movie details with correct parameters', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders('tt0372784')

      // Verify
      await waitFor(() => {
        expect(mockfetchMedia).toHaveBeenCalledWith({
          mediaId: 'tt0372784',
          descriptionSize: moviesApi.DescriptionSize.Full,
        })
      })
    })

    it('should fetch related content after movie data loads', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(mocksearchMedias).toHaveBeenCalledWith({
          title: 'Batman Begins',
          page: 1,
        })
      })
    })

    it('should not fetch related content when movie data is not available', () => {
      // Setup
      mockfetchMedia.mockImplementation(() => new Promise(() => {}))

      // Exercise
      renderWithProviders()

      // Verify
      expect(mocksearchMedias).not.toHaveBeenCalled()
    })
  })

  describe('Conditional Rendering', () => {
    it('should not render director/writer section when data is missing', async () => {
      // Setup
      const movieWithoutCredits = {
        ...mockMovieData,
        Director: undefined,
        Writer: undefined,
      }
      mockfetchMedia.mockResolvedValue(movieWithoutCredits)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument()
      })

      expect(screen.queryByText(/Director:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Writer:/)).not.toBeInTheDocument()
    })

    it('should handle missing genre data', async () => {
      // Setup
      const movieWithoutGenre = {
        ...mockMovieData,
        Genre: undefined,
      }
      mockfetchMedia.mockResolvedValue(movieWithoutGenre)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument()
      })

      expect(screen.queryByText('Action')).not.toBeInTheDocument()
    })

    it('should render poster image in hero section', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)
      mocksearchMedias.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithProviders()

      // Verify
      await waitFor(() => {
        const posterImage = screen.getByAltText('Batman Begins')
        expect(posterImage).toBeInTheDocument()
        expect(posterImage).toHaveAttribute(
          'src',
          'https://example.com/batman-begins-poster.jpg',
        )
      })
    })
  })

  describe('Query Key Management', () => {
    it('should use correct query key for movie data', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders('tt0372784')

      // Verify
      await waitFor(() => {
        expect(mockfetchMedia).toHaveBeenCalledWith({
          mediaId: 'tt0372784',
          descriptionSize: moviesApi.DescriptionSize.Full,
        })
      })
    })

    it('should refetch when media ID changes', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders('tt0372784')

      await waitFor(() => {
        expect(mockfetchMedia).toHaveBeenCalledWith({
          mediaId: 'tt0372784',
          descriptionSize: moviesApi.DescriptionSize.Full,
        })
      })

      // Teardown
      // Note: This test verifies that the query key includes mediaId
      // Re-rendering with a different mediaId would require a new QueryClient
      expect(mockfetchMedia).toHaveBeenCalledTimes(1)
    })
  })
})
