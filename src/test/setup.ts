import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'

// Setup MSW server for API mocking
export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Global test utilities
export const mockMovieData = {
  Title: 'The Dark Knight',
  Year: '2008',
  Rated: 'PG-13',
  Released: '18 Jul 2008',
  Runtime: '152 min',
  Genre: 'Action, Crime, Drama',
  Director: 'Christopher Nolan',
  Writer: 'Jonathan Nolan, Christopher Nolan, David S. Goyer',
  Actors: 'Christian Bale, Heath Ledger, Aaron Eckhart',
  Plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  Language: 'English, Mandarin',
  Country: 'United States, United Kingdom',
  Awards: 'Won 2 Oscars. 165 wins & 164 nominations total',
  Poster:
    'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '9.0/10' },
    { Source: 'Rotten Tomatoes', Value: '94%' },
    { Source: 'Metacritic', Value: '84/100' },
  ],
  Metascore: '84',
  imdbRating: '9.0',
  imdbVotes: '2,755,880',
  imdbID: 'tt0468569',
  Type: 'movie',
  DVD: '09 Dec 2008',
  BoxOffice: '$534,858,444',
  Production: 'N/A',
  Website: 'N/A',
  Response: 'True',
}

export const mockSearchResults = {
  Search: [
    {
      Title: 'Batman Begins',
      Year: '2005',
      imdbID: 'tt0372784',
      Type: 'movie',
      Poster:
        'https://m.media-amazon.com/images/M/MV5BODIyMDdhNTgtNDlmOC00MjUxLWE2NDItODA5MTdkNzY3ZTdhXkEyXkFqcGc@._V1_SX300.jpg',
    },
    {
      Title: 'The Dark Knight',
      Year: '2008',
      imdbID: 'tt0468569',
      Type: 'movie',
      Poster:
        'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
    },
  ],
  totalResults: '2',
  Response: 'True',
}

export const mockFetchErrorResponse = {
  Response: 'False',
  Error: 'Movie not found!',
}

export const mockSearchErrorResponse = {
  Response: 'False',
  Error: 'No results found!',
}
