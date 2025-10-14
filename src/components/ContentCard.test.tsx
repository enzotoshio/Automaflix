import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import ContentCard from './ContentCard'
import type { OMDbFetchAPIResult, OMDbSearchAPIResult } from '@/api/media'
import { MediaType } from '@/api/media'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

describe('ContentCard Component', () => {
  const mockMovieData: OMDbFetchAPIResult = {
    Title: 'The Dark Knight',
    Year: '2008',
    Type: MediaType.Movie,
    Poster: 'https://example.com/poster.jpg',
    imdbID: 'tt0468569',
    Response: 'True',
  }

  const mockSearchResult: OMDbSearchAPIResult = {
    Title: 'Batman Begins',
    Year: '2005',
    Type: MediaType.Movie,
    Poster: 'https://example.com/batman-begins.jpg',
    imdbID: 'tt0372784',
  }

  beforeEach(() => {
    // Setup
    mockNavigate.mockClear()
  })

  describe('Rendering', () => {
    it('should render movie title, year, and type', () => {
      // Exercise
      renderWithProviders(<ContentCard content={mockMovieData} />)

      // Verify
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument()
      expect(screen.getByText('2008')).toBeInTheDocument()
      expect(screen.getByText('movie')).toBeInTheDocument()
    })

    it('should render search result data correctly', () => {
      // Exercise
      renderWithProviders(<ContentCard content={mockSearchResult} />)

      // Verify
      expect(screen.getByText('Batman Begins')).toBeInTheDocument()
      expect(screen.getByText('2005')).toBeInTheDocument()
      expect(screen.getByText('movie')).toBeInTheDocument()
    })

    it('should render series type correctly', () => {
      // Setup
      const seriesData: OMDbFetchAPIResult = {
        ...mockMovieData,
        Title: 'Breaking Bad',
        Type: MediaType.Series,
      }

      // Exercise
      renderWithProviders(<ContentCard content={seriesData} />)

      // Verify
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument()
      expect(screen.getByText('series')).toBeInTheDocument()
    })

    it('should render episode type correctly', () => {
      // Setup
      const episodeData: OMDbFetchAPIResult = {
        ...mockMovieData,
        Title: 'Ozymandias',
        Type: MediaType.Episode,
      }

      // Exercise
      renderWithProviders(<ContentCard content={episodeData} />)

      // Verify
      expect(screen.getByText('Ozymandias')).toBeInTheDocument()
      expect(screen.getByText('episode')).toBeInTheDocument()
    })
  })

  describe('Image Handling', () => {
    it('should display poster image when poster URL is provided', () => {
      // Exercise
      renderWithProviders(<ContentCard content={mockMovieData} />)

      // Verify
      const image = screen.getByAltText('The Dark Knight')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/poster.jpg')
    })

    it('should use fallback image when poster is "N/A"', () => {
      // Setup
      const dataWithNoPoster = {
        ...mockMovieData,
        Poster: 'N/A',
      }

      // Exercise
      renderWithProviders(<ContentCard content={dataWithNoPoster} />)

      // Verify
      const image = screen.getByAltText('The Dark Knight')
      expect(image).toHaveAttribute(
        'src',
        expect.stringContaining('data:image/svg+xml'),
      )
    })

    it('should use fallback image when poster is undefined', () => {
      // Setup
      const dataWithNoPoster = {
        ...mockMovieData,
        Poster: undefined,
      }

      // Exercise
      renderWithProviders(<ContentCard content={dataWithNoPoster} />)

      // Verify
      const image = screen.getByAltText('The Dark Knight')
      expect(image).toHaveAttribute(
        'src',
        expect.stringContaining('data:image/svg+xml'),
      )
    })

    it('should handle image load error and switch to fallback', async () => {
      // Setup
      renderWithProviders(<ContentCard content={mockMovieData} />)
      const image = screen.getByAltText('The Dark Knight')
      expect(image).toHaveAttribute('src', 'https://example.com/poster.jpg')

      // Exercise
      fireEvent.error(image)

      // Verify
      await waitFor(() => {
        expect(image).toHaveAttribute(
          'src',
          expect.stringContaining('data:image/svg+xml'),
        )
      })
    })

    it('should not switch to fallback on subsequent errors', async () => {
      // Setup
      renderWithProviders(<ContentCard content={mockMovieData} />)
      const image = screen.getByAltText('The Dark Knight')

      // Exercise
      fireEvent.error(image)

      await waitFor(() => {
        expect(image).toHaveAttribute(
          'src',
          expect.stringContaining('data:image/svg+xml'),
        )
      })

      const fallbackSrc = image.getAttribute('src')

      fireEvent.error(image)

      // Verify
      expect(image).toHaveAttribute('src', fallbackSrc)
    })

    it('should have correct image attributes', () => {
      // Exercise
      renderWithProviders(<ContentCard content={mockMovieData} />)

      // Verify
      const image = screen.getByAltText('The Dark Knight')
      expect(image).toHaveAttribute('loading', 'lazy')
      expect(image).toHaveAttribute('referrerPolicy', 'no-referrer')
    })
  })

  describe('Navigation', () => {
    it('should navigate to media detail page when clicked', async () => {
      // Setup
      const user = userEvent.setup()
      renderWithProviders(<ContentCard content={mockMovieData} />)
      const card = screen.getByRole('img').closest('div')
      expect(card).toBeInTheDocument()

      // Exercise
      await user.click(card!)

      // Verify
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/media/tt0468569',
      })
    })

    it('should navigate with correct imdbID for search results', async () => {
      // Setup
      const user = userEvent.setup()
      renderWithProviders(<ContentCard content={mockSearchResult} />)
      const card = screen.getByRole('img').closest('div')

      // Exercise
      await user.click(card!)

      // Verify
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/media/tt0372784',
      })
    })

    it('should handle click on different parts of the card', async () => {
      // Setup
      const user = userEvent.setup()
      renderWithProviders(<ContentCard content={mockMovieData} />)

      // Exercise
      await user.click(screen.getByText('The Dark Knight'))

      // Verify
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/media/tt0468569',
      })

      // Teardown
      mockNavigate.mockClear()

      // Exercise
      await user.click(screen.getByText('2008'))

      // Verify
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/media/tt0468569',
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing title gracefully', () => {
      // Setup
      const dataWithoutTitle = {
        ...mockMovieData,
        Title: undefined,
      }

      // Exercise
      renderWithProviders(<ContentCard content={dataWithoutTitle} />)

      // Verify
      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
    })

    it('should handle missing year gracefully', () => {
      // Setup
      const dataWithoutYear = {
        ...mockMovieData,
        Year: undefined,
      }

      // Exercise
      renderWithProviders(<ContentCard content={dataWithoutYear} />)

      // Verify
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument()
      expect(screen.getByText('movie')).toBeInTheDocument()
    })

    it('should handle missing type gracefully', () => {
      // Setup
      const dataWithoutType = {
        ...mockMovieData,
        Type: undefined,
      }

      // Exercise
      renderWithProviders(<ContentCard content={dataWithoutType} />)

      // Verify
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument()
      expect(screen.getByText('2008')).toBeInTheDocument()
    })

    it('should handle empty imdbID', async () => {
      // Setup
      const user = userEvent.setup()
      const dataWithEmptyId = {
        ...mockMovieData,
        imdbID: '',
      }
      renderWithProviders(<ContentCard content={dataWithEmptyId} />)
      const card = screen.getByRole('img').closest('div')

      // Exercise
      await user.click(card!)

      // Verify
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/media/',
      })
    })

    it('should handle special characters in title', () => {
      // Setup
      const dataWithSpecialChars = {
        ...mockMovieData,
        Title: 'Spider-Man: No Way Home & The Multiverse!',
      }

      // Exercise
      renderWithProviders(<ContentCard content={dataWithSpecialChars} />)

      // Verify
      expect(
        screen.getByText('Spider-Man: No Way Home & The Multiverse!'),
      ).toBeInTheDocument()

      const image = screen.getByAltText(
        'Spider-Man: No Way Home & The Multiverse!',
      )
      expect(image).toBeInTheDocument()
    })
  })
})
