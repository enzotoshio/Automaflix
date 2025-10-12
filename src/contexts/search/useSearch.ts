import { useContext } from 'react'
import SearchContext from './context'

const useSearch = () => {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within a SearchProvider')
  return ctx
}

export default useSearch
