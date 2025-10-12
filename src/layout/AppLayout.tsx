import { useCallback, type JSX } from 'react'
import Navbar from '@/components/Navbar'
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import useSearch from '@/contexts/search/useSearch'

function AppLayout(): JSX.Element {
  const navigate = useNavigate()
  const goHome = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  const currentLocation = useLocation()

  const isMediaPage = currentLocation.pathname.startsWith('/media/')
  const isSearchResultPage = currentLocation.pathname.startsWith('/search')
  const isHomePage = currentLocation.pathname === '/'
  const { searchQuery } = useSearch()

  const renderBreadcrumb = () => (
    <div className="mb-6 text-sm text-muted-foreground flex flex-wrap gap-1">
      <button
        className="hover:underline font-medium text-primary"
        onClick={goHome}
      >
        Home
      </button>
      {isMediaPage && <span>/ Media Detail</span>}
      {isSearchResultPage && <span>/ Search: "{searchQuery}"</span>}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto pt-24 pb-8">
        {!isHomePage && renderBreadcrumb()}
        <Outlet />
      </div>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            © 2025 AutomaFlix. Stream your favorite content anytime, anywhere.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
