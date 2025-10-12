import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { SearchProvider } from './provider'
import useSearch from './useSearch'

describe('Search Context', () => {
  describe('Without SearchProvider', () => {
    it('should throw error when used', () => {
      // Exercise & Verify
      expect(() => {
        renderHook(() => useSearch())
      }).toThrow('useSearch must be used within a SearchProvider')
    })
  })

  describe('With SearchProvider', () => {
    it('should provide initial search query as empty string', () => {
      // Exercise
      const { result } = renderHook(() => useSearch(), {
        wrapper: SearchProvider,
      })

      // Verify
      expect(result.current.searchQuery).toBe('')
    })

    it('should update search query when setSearchQuery is called', () => {
      // Setup
      const { result } = renderHook(() => useSearch(), {
        wrapper: SearchProvider,
      })

      // Exercise
      act(() => {
        result.current.setSearchQuery('Batman')
      })

      // Verify
      expect(result.current.searchQuery).toBe('Batman')
    })

    it('should handle multiple search query updates', () => {
      // Setup
      const { result } = renderHook(() => useSearch(), {
        wrapper: SearchProvider,
      })

      // Exercise
      act(() => {
        result.current.setSearchQuery('Batman')
      })

      // Verify
      expect(result.current.searchQuery).toBe('Batman')

      // Exercise
      act(() => {
        result.current.setSearchQuery('Spider-Man')
      })

      // Verify
      expect(result.current.searchQuery).toBe('Spider-Man')
    })

    it('should handle empty string search query', () => {
      // Setup
      const { result } = renderHook(() => useSearch(), {
        wrapper: SearchProvider,
      })

      act(() => {
        result.current.setSearchQuery('Batman')
      })

      // Verify
      expect(result.current.searchQuery).toBe('Batman')

      // Exercise
      act(() => {
        result.current.setSearchQuery('')
      })

      // Verify
      expect(result.current.searchQuery).toBe('')
    })

    it('should handle special characters in search query', () => {
      // Setup
      const { result } = renderHook(() => useSearch(), {
        wrapper: SearchProvider,
      })
      const specialQuery = 'Spider-Man: No Way Home & Other Movies!'

      // Exercise
      act(() => {
        result.current.setSearchQuery(specialQuery)
      })

      // Verify
      expect(result.current.searchQuery).toBe(specialQuery)
    })

    it('should maintain search state across multiple hook calls', () => {
      // Setup
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SearchProvider>{children}</SearchProvider>
      )

      const { result: result1 } = renderHook(() => useSearch(), { wrapper })
      const { result: result2 } = renderHook(() => useSearch(), { wrapper })

      // Verify
      expect(result1.current.searchQuery).toBe('')
      expect(result2.current.searchQuery).toBe('')

      // Exercise
      act(() => {
        result1.current.setSearchQuery('Test Query')
      })

      // Verify
      expect(result1.current.searchQuery).toBe('Test Query')
    })
  })

  describe('Integration with components', () => {
    it('should provide search functionality to child components', () => {
      // Setup
      const TestComponent = () => {
        const { searchQuery, setSearchQuery } = useSearch()

        return (
          <div>
            <span data-testid="search-query">{searchQuery}</span>
            <button
              data-testid="update-search"
              onClick={() => setSearchQuery('Updated Query')}
            >
              Update Search
            </button>
          </div>
        )
      }

      // Exercise
      const { getByTestId } = renderWithProviders(<TestComponent />)
      act(() => {
        getByTestId('update-search').click()
      })

      // Verify
      expect(getByTestId('search-query')).toHaveTextContent('Updated Query')
    })
  })
})
