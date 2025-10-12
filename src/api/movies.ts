export enum MediaType {
  Movie = 'movie',
  Series = 'series',
  Episode = 'episode',
}

export enum DescriptionSize {
  Short = 'short',
  Full = 'full',
}

export type FetchOMDbAPIParams = {
  title?: string
  year?: string
  type?: MediaType
  descriptionSize: DescriptionSize
  mediaId?: string
}

export interface OMDbRating {
  Source: string
  Value: string
}

export interface OMDbFetchAPIResult {
  Title?: string
  Year?: string
  Rated?: string
  Released?: string
  Runtime?: string
  Genre?: string
  Director?: string
  Writer?: string
  Actors?: string
  Plot?: string
  Language?: string
  Country?: string
  Awards?: string
  Poster?: string
  Ratings?: OMDbRating[]
  Metascore?: string
  imdbRating?: string
  imdbVotes?: string
  imdbID: string
  Type?: MediaType
  DVD?: string
  BoxOffice?: string
  Production?: string
  Website?: string
  totalSeasons?: string
  Response: 'True' | 'False'
  Error?: string
}

export type SearchOMDbAPIParams = {
  title: string
  year?: string
  type?: MediaType
  page?: number
}

export type OMDbSearchAPIResult = {
  Poster: string
  Title: string
  Year: string
  imdbID: string
  Type: MediaType
}

export type SearchOMDbAPIResponse = {
  Search: OMDbSearchAPIResult[]
  totalResults: string
  Response: 'True' | 'False'
  Error?: string
}

const MOVIE_API_URL = import.meta.env.VITE_MOVIE_API_URL
const MOVIE_API_TOKEN = import.meta.env.VITE_MOVIE_API_KEY

async function fetchMovie({
  title,
  year,
  type,
  mediaId,
  descriptionSize = DescriptionSize.Short,
}: FetchOMDbAPIParams): Promise<OMDbFetchAPIResult> {
  if (!mediaId && !title) {
    throw new Error('Either mediaId or title must be provided')
  }

  const identifierQuery = mediaId
    ? `i=${mediaId}`
    : `t=${encodeURIComponent(title!)}`
  const yearQuery = year ? `&y=${year}` : ''
  const typeQuery = type ? `&type=${type}` : ''

  const response = await fetch(
    `${MOVIE_API_URL}/?${identifierQuery}${yearQuery}${typeQuery}&plot=${descriptionSize}&apikey=${MOVIE_API_TOKEN}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API Error')
  }

  return response.json() as Promise<OMDbFetchAPIResult>
}

async function searchMovies({
  title,
  year,
  type,
  page,
}: SearchOMDbAPIParams): Promise<SearchOMDbAPIResponse> {
  const yearQuery = year ? `&y=${year}` : ''
  const typeQuery = type ? `&type=${type}` : ''
  const response = await fetch(
    `${MOVIE_API_URL}/?s=${title}${yearQuery}${typeQuery}&page=${page}&apikey=${MOVIE_API_TOKEN}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API Error')
  }

  return response.json()
}

export { fetchMovie, searchMovies }
