import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import ContentRow from './ContentRow'
import type { OMDbFetchAPIResult } from '@/api/media'
import { MediaType } from '@/api/media'

vi.mock('./ContentCard', () => ({
  default: ({
    content,
  }: {
    content: { imdbID: string; Title?: string; Year?: string }
  }) => (
    <div data-testid={`content-card-${content.imdbID}`}>
      <h3>{content.Title}</h3>
      <span>{content.Year}</span>
    </div>
  ),
}))

vi.mock('./ui/Button', () => ({
  default: ({
    children,
    onClick,
    className,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
    [key: string]: unknown
  }) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}))

describe('ContentRow Component', () => {
  const mockMovies: OMDbFetchAPIResult[] = [
    {
      Title: 'The Dark Knight',
      Year: '2008',
      Type: MediaType.Movie,
      Poster: 'https://example.com/poster1.jpg',
      imdbID: 'tt0468569',
      Response: 'True',
    },
    {
      Title: 'Batman Begins',
      Year: '2005',
      Type: MediaType.Movie,
      Poster: 'https://example.com/poster2.jpg',
      imdbID: 'tt0372784',
      Response: 'True',
    },
    {
      Title: 'The Dark Knight Rises',
      Year: '2012',
      Type: MediaType.Movie,
      Poster: 'https://example.com/poster3.jpg',
      imdbID: 'tt1345836',
      Response: 'True',
    },
  ]

  beforeEach(() => {
    HTMLElement.prototype.scrollBy = vi.fn()

    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      get: vi.fn(() => 1000),
      configurable: true,
    })

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      get: vi.fn(() => 800),
      configurable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render title correctly', () => {
      // Exercise
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )

      // Verify
      expect(screen.getByText('Featured Movies')).toBeInTheDocument()
      expect(screen.getByText('Featured Movies')).toHaveClass(
        'text-2xl',
        'font-bold',
      )
    })

    it('should render content cards when not loading', () => {
      // Exercise
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )

      // Verify
      expect(screen.getByTestId('content-card-tt0468569')).toBeInTheDocument()
      expect(screen.getByTestId('content-card-tt0372784')).toBeInTheDocument()
      expect(screen.getByTestId('content-card-tt1345836')).toBeInTheDocument()
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument()
      expect(screen.getByText('Batman Begins')).toBeInTheDocument()
      expect(screen.getByText('The Dark Knight Rises')).toBeInTheDocument()
    })

    it('should render skeleton cards when loading', () => {
      // Exercise
      const { container } = renderWithProviders(
        <ContentRow title="Featured Movies" content={[]} isLoading={true} />,
      )

      // Verify
      const skeletonCards = container.querySelectorAll('.animate-pulse')
      expect(skeletonCards).toHaveLength(6)
    })

    it('should have correct skeleton structure', () => {
      // Exercise
      const { container } = renderWithProviders(
        <ContentRow title="Loading..." content={[]} isLoading={true} />,
      )

      // Verify
      const firstSkeleton = container.querySelector('.animate-pulse')
      expect(firstSkeleton).toHaveClass('flex-none', 'w-48')
      const aspectContainer = firstSkeleton?.querySelector(
        '.aspect-\\[2\\/3\\]',
      )
      expect(aspectContainer).toBeInTheDocument()
      expect(aspectContainer).toHaveClass('bg-background', 'rounded-lg')
    })

    it('should render empty content without errors', () => {
      // Exercise
      renderWithProviders(
        <ContentRow title="Empty Row" content={[]} isLoading={false} />,
      )

      // Verify
      expect(screen.getByText('Empty Row')).toBeInTheDocument()
    })
  })

  describe('Scrolling Functionality', () => {
    it('should show scroll buttons when content overflows', () => {
      // Setup
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        get: vi.fn(() => 1200),
        configurable: true,
      })

      // Exercise
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )

      // Verify
      const leftButton = screen.getAllByRole('button')[0]
      const rightButton = screen.getAllByRole('button')[1]
      expect(leftButton).toBeInTheDocument()
      expect(rightButton).toBeInTheDocument()
    })

    it('should not show scroll buttons when content fits', () => {
      // Setup
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        get: vi.fn(() => 600),
        configurable: true,
      })

      // Exercise
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )

      // Verify
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('should scroll left when left button is clicked', async () => {
      // Setup
      const user = userEvent.setup()
      const scrollBySpy = vi.fn()
      HTMLElement.prototype.scrollBy = scrollBySpy
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )
      const leftButton = screen.getAllByRole('button')[0]

      // Exercise
      await user.click(leftButton)

      // Verify
      expect(scrollBySpy).toHaveBeenCalledWith({
        left: -400,
        behavior: 'smooth',
      })
    })

    it('should scroll right when right button is clicked', async () => {
      // Setup
      const user = userEvent.setup()
      const scrollBySpy = vi.fn()
      HTMLElement.prototype.scrollBy = scrollBySpy
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )
      const rightButton = screen.getAllByRole('button')[1]

      // Exercise
      await user.click(rightButton)

      // Verify
      expect(scrollBySpy).toHaveBeenCalledWith({
        left: 400,
        behavior: 'smooth',
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should update button visibility on window resize', () => {
      // Setup
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )
      expect(screen.getAllByRole('button')).toHaveLength(2)
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        get: vi.fn(() => 600),
        configurable: true,
      })

      // Exercise
      fireEvent.resize(window)

      // Verify
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    it('should clean up resize event listener on unmount', () => {
      // Setup
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )

      // Exercise
      unmount()

      // Verify
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      )

      // Teardown
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle items with missing properties', () => {
      // Setup
      const incompleteMovies = [
        {
          imdbID: 'tt123',
          Title: undefined,
          Year: undefined,
          Type: MediaType.Movie,
          Response: 'True' as const,
        },
      ]

      // Exercise
      renderWithProviders(
        <ContentRow
          title="Incomplete Data"
          content={incompleteMovies}
          isLoading={false}
        />,
      )

      // Verify
      expect(screen.getByTestId('content-card-tt123')).toBeInTheDocument()
    })

    it('should show duplicated imdbIDs', () => {
      // Setup
      const duplicateMovies = [mockMovies[0], mockMovies[0], mockMovies[1]]

      // Exercise
      renderWithProviders(
        <ContentRow
          title="Duplicates"
          content={duplicateMovies}
          isLoading={false}
        />,
      )

      // Verify
      const cards = screen.getAllByTestId(/content-card-tt0468569/)
      expect(cards).toHaveLength(2)
    })

    it('should handle rapid button clicks', async () => {
      // Setup
      const user = userEvent.setup()
      const scrollBySpy = vi.fn()
      HTMLElement.prototype.scrollBy = scrollBySpy
      renderWithProviders(
        <ContentRow
          title="Featured Movies"
          content={mockMovies}
          isLoading={false}
        />,
      )
      const rightButton = screen.getAllByRole('button')[1]

      // Exercise
      await user.click(rightButton)
      await user.click(rightButton)
      await user.click(rightButton)

      // Verify
      expect(scrollBySpy).toHaveBeenCalledTimes(3)
    })

    it('should handle loading state change', () => {
      // Setup
      const { rerender } = renderWithProviders(
        <ContentRow title="Dynamic Loading" content={[]} isLoading={true} />,
      )
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(6)

      // Exercise
      rerender(
        <ContentRow
          title="Dynamic Loading"
          content={mockMovies}
          isLoading={false}
        />,
      )

      // Verify
      expect(screen.getByTestId('content-card-tt0468569')).toBeInTheDocument()
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(0)
    })
  })
})
