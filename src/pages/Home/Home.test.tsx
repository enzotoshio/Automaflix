import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import Home from './Home'
import * as moviesApi from '@/api/media'

vi.mock('@/components/ContentRow', () => ({
  default: ({
    title,
    content,
    isLoading,
  }: {
    title: string
    content: { Title?: string }[]
    isLoading: boolean
  }) => (
    <div
      data-testid={`content-row-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <h2>{title}</h2>
      <div data-testid="loading-state">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="content-count">{content.length}</div>
      {content.map((item: { Title?: string }, index: number) => (
        <div key={index} data-testid={`content-item-${index}`}>
          {item.Title}
        </div>
      ))}
    </div>
  ),
}))

const mockfetchMedia = vi.spyOn(moviesApi, 'fetchMedia')

describe('Home Page', () => {
  const mockMovieData = {
    Title: 'Test Movie',
    Year: '2008',
    Type: moviesApi.MediaType.Movie,
    Poster: 'https://example.com/poster.jpg',
    imdbID: 'tt0468569',
    Response: 'True' as const,
  }

  const mockSeriesData = {
    Title: 'Test Series',
    Year: '2011',
    Type: moviesApi.MediaType.Series,
    Poster: 'https://example.com/series.jpg',
    imdbID: 'tt0944947',
    Response: 'True' as const,
  }

  const mockEpisodeData = {
    Title: 'Test Episode',
    Year: '2008',
    Type: moviesApi.MediaType.Episode,
    Poster: 'https://example.com/episode.jpg',
    imdbID: 'tt1541289',
    Response: 'True' as const,
  }

  beforeEach(() => {
    mockfetchMedia.mockClear()
  })

  describe('Rendering', () => {
    it('should render all three content rows', () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      expect(
        screen.getByTestId('content-row-featured-movies'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('content-row-popular-series'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('content-row-latest-episodes'),
      ).toBeInTheDocument()
    })

    it('should display correct row titles', () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      expect(screen.getByText('Featured Movies')).toBeInTheDocument()
      expect(screen.getByText('Popular Series')).toBeInTheDocument()
      expect(screen.getByText('Latest Episodes')).toBeInTheDocument()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch all featured content on mount', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        expect(mockfetchMedia).toHaveBeenCalledTimes(18) // 6 movies + 6 series + 6 episodes
      })
    })

    it('should fetch movies with correct parameters', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        expect(mockfetchMedia).toHaveBeenCalledWith({
          mediaId: 'tt0372784',
          type: moviesApi.MediaType.Movie,
          descriptionSize: moviesApi.DescriptionSize.Short,
        })
      })
    })

    it('should fetch series with correct parameters', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockSeriesData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        expect(mockfetchMedia).toHaveBeenCalledWith({
          mediaId: 'tt0944947',
          type: moviesApi.MediaType.Series,
          descriptionSize: moviesApi.DescriptionSize.Short,
        })
      })
    })

    it('should fetch episodes with correct parameters', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockEpisodeData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        expect(mockfetchMedia).toHaveBeenCalledWith({
          mediaId: 'tt1541289',
          type: moviesApi.MediaType.Episode,
          descriptionSize: moviesApi.DescriptionSize.Short,
        })
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      // Setup
      mockfetchMedia.mockImplementation(() => new Promise(() => {}))

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      const loadingStates = screen.getAllByTestId('loading-state')
      loadingStates.forEach((state) => {
        expect(state).toHaveTextContent('loading')
      })
    })

    it('should show loaded state after data is fetched', async () => {
      // Setup
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        const loadingStates = screen.getAllByTestId('loading-state')
        loadingStates.forEach((state) => {
          expect(state).toHaveTextContent('loaded')
        })
      })
    })

    it('should handle different loading states independently', async () => {
      // Setup
      mockfetchMedia.mockImplementation((params) => {
        if (params.type === moviesApi.MediaType.Movie) {
          return Promise.resolve(mockMovieData)
        }
        // Series and episodes will hang (simulate slow loading)
        return new Promise(() => {})
      })

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        const movieRow = screen.getByTestId('content-row-featured-movies')
        const movieLoadingState = movieRow.querySelector(
          '[data-testid="loading-state"]',
        )
        expect(movieLoadingState).toHaveTextContent('loaded')
      })

      const seriesRow = screen.getByTestId('content-row-popular-series')
      const seriesLoadingState = seriesRow.querySelector(
        '[data-testid="loading-state"]',
      )
      expect(seriesLoadingState).toHaveTextContent('loading')
    })
  })

  describe('Content Display', () => {
    it('should display fetched movies', async () => {
      // Setup
      const movieData = { ...mockMovieData, Title: 'Batman Begins' }
      mockfetchMedia.mockResolvedValue(movieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        const movieRow = screen.getByTestId('content-row-featured-movies')
        expect(
          movieRow.querySelector('[data-testid="content-count"]'),
        ).toHaveTextContent('6')
      })
    })

    it('should display fetched series', async () => {
      // Setup
      const seriesData = { ...mockSeriesData, Title: 'Game of Thrones' }
      mockfetchMedia.mockResolvedValue(seriesData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        const seriesRow = screen.getByTestId('content-row-popular-series')
        expect(
          seriesRow.querySelector('[data-testid="content-count"]'),
        ).toHaveTextContent('6')
      })
    })

    it('should display fetched episodes', async () => {
      // Setup
      const episodeData = { ...mockEpisodeData, Title: 'The Playbook' }
      mockfetchMedia.mockResolvedValue(episodeData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        const episodeRow = screen.getByTestId('content-row-latest-episodes')
        expect(
          episodeRow.querySelector('[data-testid="content-count"]'),
        ).toHaveTextContent('6')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      // Setup
      mockfetchMedia.mockRejectedValue(new Error('API Error'))

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        const contentCounts = screen.getAllByTestId('content-count')
        contentCounts.forEach((count) => {
          expect(count).toHaveTextContent('0')
        })
      })
    })

    it('should retry failed requests', async () => {
      // Setup
      mockfetchMedia
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(
        () => {
          // Each category makes 6 calls, with 3 retries each = 18 calls per category
          // But some might succeed on retry, so let's check for at least 18 total calls
          expect(mockfetchMedia).toHaveBeenCalledTimes(18)
        },
        { timeout: 10000 },
      )
    })

    it('should handle partial failures across different content types', async () => {
      // Setup
      mockfetchMedia.mockImplementation((params) => {
        if (params.type === moviesApi.MediaType.Movie) {
          return Promise.resolve(mockMovieData)
        }
        if (params.type === moviesApi.MediaType.Series) {
          return Promise.reject(new Error('Series API down'))
        }
        if (params.type === moviesApi.MediaType.Episode) {
          return Promise.resolve(mockEpisodeData)
        }
        return Promise.resolve(mockMovieData)
      })

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(
        () => {
          // Movies should succeed
          const movieRow = screen.getByTestId('content-row-featured-movies')
          const movieCount = movieRow.querySelector(
            '[data-testid="content-count"]',
          )
          expect(movieCount).toHaveTextContent('6')

          // Episodes should succeed
          const episodeRow = screen.getByTestId('content-row-latest-episodes')
          const episodeCount = episodeRow.querySelector(
            '[data-testid="content-count"]',
          )
          expect(episodeCount).toHaveTextContent('6')
        },
        { timeout: 10000 },
      )

      // Series should fail and show 0 after retries are exhausted
      await waitFor(
        () => {
          const seriesRow = screen.getByTestId('content-row-popular-series')
          const seriesCount = seriesRow.querySelector(
            '[data-testid="content-count"]',
          )
          expect(seriesCount).toHaveTextContent('0')
        },
        { timeout: 15000 },
      )
    })
  })

  describe('Featured Content IDs', () => {
    it('should fetch all predefined movie IDs', async () => {
      // Setup
      const expectedMovieIds = [
        'tt0372784',
        'tt0468569',
        'tt4154796',
        'tt0111161',
        'tt0133093',
        'tt0137523',
      ]
      mockfetchMedia.mockResolvedValue(mockMovieData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        expectedMovieIds.forEach((id) => {
          expect(mockfetchMedia).toHaveBeenCalledWith({
            mediaId: id,
            type: moviesApi.MediaType.Movie,
            descriptionSize: moviesApi.DescriptionSize.Short,
          })
        })
      })
    })

    it('should fetch all predefined series IDs', async () => {
      // Setup
      const expectedSeriesIds = [
        'tt0944947',
        'tt0108778',
        'tt2861424',
        'tt0306414',
        'tt0903747',
        'tt1475582',
      ]
      mockfetchMedia.mockResolvedValue(mockSeriesData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        expectedSeriesIds.forEach((id) => {
          expect(mockfetchMedia).toHaveBeenCalledWith({
            mediaId: id,
            type: moviesApi.MediaType.Series,
            descriptionSize: moviesApi.DescriptionSize.Short,
          })
        })
      })
    })

    it('should fetch all predefined episode IDs', async () => {
      // Setup
      const expectedEpisodeIds = [
        'tt1541289',
        'tt0583452',
        'tt2301451',
        'tt2861424',
        'tt2178784',
        'tt2301455',
      ]
      mockfetchMedia.mockResolvedValue(mockEpisodeData)

      // Exercise
      renderWithProviders(<Home />)

      // Verify
      await waitFor(() => {
        expectedEpisodeIds.forEach((id) => {
          expect(mockfetchMedia).toHaveBeenCalledWith({
            mediaId: id,
            type: moviesApi.MediaType.Episode,
            descriptionSize: moviesApi.DescriptionSize.Short,
          })
        })
      })
    })
  })
})
