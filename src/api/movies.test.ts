import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import {
  server,
  mockMovieData,
  mockSearchResults,
  mockFetchErrorResponse,
  mockSearchErrorResponse,
} from '../test/setup'
import { fetchMovie, searchMovies, MediaType, DescriptionSize } from './movies'

const API_URL = '/api'

describe('API Movies', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('fetchMovie', () => {
    it('should handle request success', async () => {
      // Setup
      server.use(
        http.get(`${API_URL}/`, ({ request }) => {
          const url = new URL(request.url)
          const params = url.searchParams

          if (params.get('i') === 'tt0468569') {
            return HttpResponse.json(mockMovieData)
          }
          return HttpResponse.json(mockFetchErrorResponse, { status: 400 })
        }),
      )

      // Exercise
      const result = await fetchMovie({
        mediaId: 'tt0468569',
        descriptionSize: DescriptionSize.Short,
      })

      // Verify
      expect(result).toEqual(mockMovieData)
      expect(result.Title).toBe('The Dark Knight')
      expect(result.imdbID).toBe('tt0468569')
    })

    it('should throw error when neither mediaId nor title provided', async () => {
      // Exercise & Verify
      await expect(
        fetchMovie({
          descriptionSize: DescriptionSize.Short,
        }),
      ).rejects.toThrow('Either mediaId or title must be provided')
    })

    it('should handle API errors', async () => {
      // Setup
      server.use(
        http.get(`${API_URL}/`, () => {
          return HttpResponse.json({ message: 'API Error' }, { status: 500 })
        }),
      )

      // Exercise & Verify
      await expect(
        fetchMovie({
          mediaId: 'tt0468569',
          descriptionSize: DescriptionSize.Short,
        }),
      ).rejects.toThrow('API Error')
    })

    it('should handle OMDb API error responses', async () => {
      // Setup
      server.use(
        http.get(`${API_URL}/`, () => {
          return HttpResponse.json(mockFetchErrorResponse)
        }),
      )

      // Exercise
      const result = await fetchMovie({
        mediaId: 'invalid-id',
        descriptionSize: DescriptionSize.Short,
      })

      // Verify
      expect(result).toEqual(mockFetchErrorResponse)
      expect(result.Response).toBe('False')
      expect(result.Error).toBe('Movie not found!')
    })

    it('should format query parameters correctly', async () => {
      // Setup
      let capturedUrl: string = ''

      server.use(
        http.get(`${API_URL}/`, ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(mockMovieData)
        }),
      )

      // Exercise
      await fetchMovie({
        title: 'The Dark Knight',
        year: '2008',
        type: MediaType.Movie,
        descriptionSize: DescriptionSize.Full,
      })

      // Verify
      const url = new URL(capturedUrl)
      const params = url.searchParams

      expect(params.get('t')).toBe('The Dark Knight')
      expect(params.get('y')).toBe('2008')
      expect(params.get('type')).toBe('movie')
      expect(params.get('plot')).toBe('full')
      expect(params.get('apikey')).toBe('test-api-key')
    })

    it('should encode title parameter correctly', async () => {
      // Setup
      let capturedUrl: string = ''

      server.use(
        http.get(`${API_URL}/`, ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(mockMovieData)
        }),
      )

      // Exercise
      await fetchMovie({
        title: 'Spider-Man: No Way Home',
        descriptionSize: DescriptionSize.Short,
      })

      // Verify
      const url = new URL(capturedUrl)
      expect(url.searchParams.get('t')).toBe('Spider-Man: No Way Home')
    })
  })

  describe('searchMovies', () => {
    it('should handle request success', async () => {
      // Setup
      server.use(
        http.get(`${API_URL}/`, ({ request }) => {
          const url = new URL(request.url)
          const params = url.searchParams

          if (params.get('s') === 'Batman') {
            return HttpResponse.json(mockSearchResults)
          }
          return HttpResponse.json(mockFetchErrorResponse, { status: 400 })
        }),
      )

      // Exercise
      const result = await searchMovies({
        title: 'Batman',
      })

      // Verify
      expect(result).toEqual(mockSearchResults)
      expect(result.Search).toHaveLength(2)
      expect(result.totalResults).toBe('2')
    })

    it('should handle API errors', async () => {
      // Setup
      server.use(
        http.get(`${API_URL}/`, () => {
          return HttpResponse.json({ message: 'API Error' }, { status: 500 })
        }),
      )

      // Exercise & Verify
      await expect(
        searchMovies({
          title: 'Batman',
        }),
      ).rejects.toThrow('API Error')
    })

    it('should handle OMDb API error responses', async () => {
      // Setup
      server.use(
        http.get(`${API_URL}/`, () => {
          return HttpResponse.json(mockSearchErrorResponse)
        }),
      )

      // Exercise
      const result = await searchMovies({
        title: 'Batman',
      })

      // Verify
      expect(result).toEqual(mockSearchErrorResponse)
      expect(result.Response).toBe('False')
      expect(result.Error).toBe('No results found!')
    })

    it('should format search query parameters correctly', async () => {
      // Setup
      let capturedUrl: string = ''

      server.use(
        http.get(`${API_URL}/`, ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(mockSearchResults)
        }),
      )

      // Exercise
      await searchMovies({
        title: 'Batman',
        year: '2008',
        type: MediaType.Movie,
        page: 1,
      })

      // Verify
      const url = new URL(capturedUrl)
      const params = url.searchParams

      expect(params.get('s')).toBe('Batman')
      expect(params.get('y')).toBe('2008')
      expect(params.get('type')).toBe('movie')
      expect(params.get('page')).toBe('1')
      expect(params.get('apikey')).toBe('test-api-key')
    })
  })
})
