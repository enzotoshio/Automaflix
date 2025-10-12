import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import Navbar from './Navbar'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({
      children,
      to,
      className,
    }: {
      children: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/routes', () => ({
  searchResultsRoute: {
    id: '/search',
  },
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render search input', () => {
      // Exercise
      renderWithProviders(<Navbar />)

      // Verify
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Search Functionality', () => {
    it('should update search query when typing in input', async () => {
      // Setup
      const user = userEvent.setup()

      // Exercise
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'Batman')

      // Verify
      expect(searchInput).toHaveValue('Batman')
    })

    it('should navigate to search results on form submission', async () => {
      // Setup
      const user = userEvent.setup()

      // Exercise
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'Batman')
      await user.keyboard('{Enter}')

      // Verify
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/search',
      })
    })

    it('should not navigate when search query is empty', async () => {
      // Setup
      const user = userEvent.setup()

      // Exercise
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText('Search...')
      searchInput.focus()
      await user.keyboard('{Enter}')

      // Verify
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should not navigate when search query is only whitespace', async () => {
      // Setup
      const user = userEvent.setup()

      // Exercise
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, '   ')
      await user.keyboard('{Enter}')

      // Verify
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should preserve search query after navigation', async () => {
      // Setup
      const user = userEvent.setup()

      // Exercise
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'The Dark Knight')
      await user.keyboard('{Enter}')

      // Verify
      expect(searchInput).toHaveValue('The Dark Knight')
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/search',
      })
    })

    it('should handle special characters in search', async () => {
      // Setup
      const user = userEvent.setup()

      // Exercise
      renderWithProviders(<Navbar />)

      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'Spider-Man: No Way Home & More!')
      await user.keyboard('{Enter}')

      // Verify
      expect(searchInput).toHaveValue('Spider-Man: No Way Home & More!')
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/search',
      })
    })
  })

  describe('Scroll Behavior', () => {
    it('should add background styling when scrolled', () => {
      // Setup
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 100,
      })

      // Exercise
      const { container } = renderWithProviders(<Navbar />)
      fireEvent.scroll(window)

      // Verify
      const nav = container.querySelector('nav')
      expect(nav).toHaveClass(
        'bg-background/90',
        'backdrop-blur-md',
        'shadow-md',
      )
    })

    it('should have gradient background when not scrolled', () => {
      // Exercise
      const { container } = renderWithProviders(<Navbar />)

      // Verify
      const nav = container.querySelector('nav')
      expect(nav).toHaveClass(
        'bg-gradient-to-b',
        'from-background',
        'to-background/0',
      )
    })

    it('should clean up scroll event listener on unmount', () => {
      // Setup
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderWithProviders(<Navbar />)

      // Exercise
      unmount()

      // Verify
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
      )

      // Teardown
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid scroll events', () => {
      // Exercise
      const { container } = renderWithProviders(<Navbar />)
      const nav = container.querySelector('nav')

      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: i % 2 === 0 ? 0 : 100,
        })
        fireEvent.scroll(window)
      }

      // Verify
      expect(nav).toHaveClass('bg-background/90')
    })
  })
})
