import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SearchResults from './SearchResults'
import * as moviesApi from '@/api/movies'
import SearchContext from '@/contexts/search/context'

vi.mock('@/components/ContentCard', () => ({
  default: ({ content }: { content: { imdbID: string; Title?: string } }) => (
    <div data-testid={`content-card-${content.imdbID}`}>{content.Title}</div>
  ),
}))

vi.mock('@/components/ui/Button', () => ({
  default: ({
    children,
    onClick,
    variant,
    disabled,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    disabled?: boolean
    [key: string]: unknown
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}))

const mockSearchMovies = vi.spyOn(moviesApi, 'searchMovies')

const renderWithSearchQuery = (searchQuery = '') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SearchContext.Provider value={{ searchQuery, setSearchQuery: vi.fn() }}>
        <SearchResults />
      </SearchContext.Provider>
    </QueryClientProvider>,
  )
}

describe('SearchResults Page', () => {
  const mockSearchResults = {
    Search: [
      {
        Title: 'Batman Begins',
        Year: '2005',
        Type: moviesApi.MediaType.Movie,
        Poster: 'https://example.com/poster1.jpg',
        imdbID: 'tt0372784',
      },
      {
        Title: 'The Dark Knight',
        Year: '2008',
        Type: moviesApi.MediaType.Movie,
        Poster: 'https://example.com/poster2.jpg',
        imdbID: 'tt0468569',
      },
    ],
    totalResults: '25',
    Response: 'True' as const,
  }

  const mockEmptyResults = {
    Search: [],
    totalResults: '0',
    Response: 'False' as const,
    Error: 'Movie not found!',
  }

  beforeEach(() => {
    mockSearchMovies.mockClear()
  })

  describe('Rendering', () => {
    it('should render filter buttons', () => {
      // Exercise
      renderWithSearchQuery()

      // Verify
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Movie')).toBeInTheDocument()
      expect(screen.getByText('Series')).toBeInTheDocument()
      expect(screen.getByText('Episode')).toBeInTheDocument()
    })

    it('should render default title when no search query', () => {
      // Exercise
      renderWithSearchQuery()

      // Verify
      expect(
        screen.getByText('Please search something to see results'),
      ).toBeInTheDocument()
    })

    it('should render search title when search query exists', () => {
      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      expect(
        screen.getByText('Search results for "Batman"'),
      ).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should search movies when search query is provided', async () => {
      // Setup
      mockSearchMovies.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      await waitFor(() => {
        expect(mockSearchMovies).toHaveBeenCalledWith({
          title: 'Batman',
          type: undefined,
          page: 1,
        })
      })
    })

    it('should not search when search query is empty', () => {
      // Setup
      mockSearchMovies.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery()

      // Verify
      expect(mockSearchMovies).not.toHaveBeenCalled()
    })

    it('should display search results', async () => {
      // Setup
      mockSearchMovies.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      await waitFor(() => {
        expect(screen.getByTestId('content-card-tt0372784')).toBeInTheDocument()
        expect(screen.getByTestId('content-card-tt0468569')).toBeInTheDocument()
        expect(screen.getByText('Batman Begins')).toBeInTheDocument()
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument()
      })
    })

    it('should show loading state during search', () => {
      // Setup
      mockSearchMovies.mockImplementation(() => new Promise(() => {}))

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show no results message when no results found', async () => {
      // Setup
      mockSearchMovies.mockResolvedValue(mockEmptyResults)

      // Exercise
      renderWithSearchQuery('NonexistentMovie')

      // Verify
      await waitFor(() => {
        expect(
          screen.getByText('No results found. Try a different search term.'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Filtering', () => {
    it(`should filter by ${moviesApi.MediaType.Movie} type`, async () => {
      // Setup
      const user = userEvent.setup()
      mockSearchMovies.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery('Batman')

      await user.click(
        screen.getByTestId(`filter-${moviesApi.MediaType.Movie}`),
      )

      // Verify
      await waitFor(() => {
        expect(mockSearchMovies).toHaveBeenCalledWith({
          title: 'Batman',
          type: moviesApi.MediaType.Movie,
          page: 1,
        })
      })
    })

    it(`should filter by ${moviesApi.MediaType.Series} type`, async () => {
      // Setup
      const user = userEvent.setup()
      mockSearchMovies.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery('Batman')

      await user.click(
        screen.getByTestId(`filter-${moviesApi.MediaType.Series}`),
      )

      // Verify
      await waitFor(() => {
        expect(mockSearchMovies).toHaveBeenCalledWith({
          title: 'Batman',
          type: moviesApi.MediaType.Series,
          page: 1,
        })
      })
    })

    it(`should filter by ${moviesApi.MediaType.Movie} type`, async () => {
      // Setup
      const user = userEvent.setup()
      mockSearchMovies.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery('Batman')

      await user.click(
        screen.getByTestId(`filter-${moviesApi.MediaType.Episode}`),
      )

      // Verify
      await waitFor(() => {
        expect(mockSearchMovies).toHaveBeenCalledWith({
          title: 'Batman',
          type: moviesApi.MediaType.Episode,
          page: 1,
        })
      })
    })

    it('should highlight active filter', async () => {
      // Setup
      const user = userEvent.setup()
      mockSearchMovies.mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery('Batman')

      const movieButton = screen.getByText('Movie')
      await user.click(movieButton)

      // Verify
      await waitFor(() => {
        expect(movieButton).toHaveAttribute('data-variant', 'default')
      })

      const allButton = screen.getByText('All')
      expect(allButton).toHaveAttribute('data-variant', 'outline')
    })
  })

  describe('Pagination', () => {
    const mockManyResults = {
      ...mockSearchResults,
      totalResults: '100',
    }

    it('should show pagination controls when results exceed 10', async () => {
      // Setup
      mockSearchMovies.mockResolvedValue(mockManyResults)

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      await waitFor(() => {
        expect(screen.getByText('< Prev')).toBeInTheDocument()
        expect(screen.getByText('Next >')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })

    it('should navigate to next page', async () => {
      // Setup
      const user = userEvent.setup()
      mockSearchMovies.mockResolvedValue(mockManyResults)

      // Exercise
      renderWithSearchQuery('Batman')

      await waitFor(() => {
        expect(screen.getByText('Next >')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Next >'))

      // Verify
      await waitFor(() => {
        expect(mockSearchMovies).toHaveBeenLastCalledWith({
          title: 'Batman',
          type: undefined,
          page: 2,
        })
      })
    })

    it('should disable previous button on first page', async () => {
      // Setup
      mockSearchMovies.mockResolvedValue(mockManyResults)

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      await waitFor(() => {
        const prevButton = screen.getByText('< Prev')
        expect(prevButton).toBeDisabled()
      })
    })

    it('should navigate to specific page', async () => {
      // Setup
      const user = userEvent.setup()
      mockSearchMovies.mockResolvedValue(mockManyResults)

      // Exercise
      renderWithSearchQuery('Batman')

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument()
      })

      await user.click(screen.getByText('3'))

      // Verify
      await waitFor(() => {
        expect(mockSearchMovies).toHaveBeenLastCalledWith({
          title: 'Batman',
          type: undefined,
          page: 3,
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Setup
      mockSearchMovies.mockRejectedValue(new Error('API Error'))

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      await waitFor(
        () => {
          expect(
            screen.getByText('No results found. Try a different search term.'),
          ).toBeInTheDocument()
          expect(screen.getByTestId('search-title')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })

    it('should retry failed requests', async () => {
      // Setup
      mockSearchMovies
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue(mockSearchResults)

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      await waitFor(
        () => {
          expect(mockSearchMovies).toHaveBeenCalledTimes(3)
        },
        { timeout: 5000 },
      )
    })
  })

  describe('Visible Pages Calculation', () => {
    it('should show all pages when total pages is 7 or less', async () => {
      // Setup
      mockSearchMovies.mockResolvedValue({
        ...mockSearchResults,
        totalResults: '70',
      })

      // Exercise
      renderWithSearchQuery('Batman')

      // Verify
      await waitFor(() => {
        for (let i = 1; i <= 7; i++) {
          expect(screen.getByText(i.toString())).toBeInTheDocument()
        }
      })
    })

    it('should show 3 pages ahead and 3 behind when after the middle', async () => {
      // Setup
      const user = userEvent.setup()
      mockSearchMovies.mockResolvedValue({
        ...mockSearchResults,
        totalResults: '200',
      })

      // Exercise
      renderWithSearchQuery('Batman')
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })
      await user.click(screen.getByTestId('page-button-5'))

      // Verify
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('6')).toBeInTheDocument()
        expect(screen.getByText('7')).toBeInTheDocument()
        expect(screen.queryByText('8')).toBeInTheDocument()
      })
    })
  })
})
