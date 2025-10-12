import { Link, useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import Input from '@/components/ui/Input'
import useSearch from '@/contexts/search/useSearch'
import { useCallback, useEffect, useState } from 'react'
import { searchResultsRoute } from '@/routes'

const Navbar = () => {
  const { searchQuery, setSearchQuery } = useSearch()
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!searchQuery.trim()) return

      navigate({
        to: searchResultsRoute.id,
      })
    },
    [searchQuery, navigate],
  )

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
        scrolled
          ? 'bg-background/90 backdrop-blur-md shadow-md'
          : 'bg-gradient-to-b from-background to-background/0'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-primary text-3xl font-bold tracking-tight">
          AUTOMAFLIX
        </Link>

        <div className="flex items-center gap-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-secondary border-border focus-primary"
            />
          </form>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
