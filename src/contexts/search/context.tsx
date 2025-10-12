import { createContext } from 'react'

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export default SearchContext
