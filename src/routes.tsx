import { createRootRoute, createRoute, RootRoute } from '@tanstack/react-router'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import AppLayout from './layout/AppLayout'
import MediaDetail from './pages/MediaDetail'
import SearchResults from './pages/SearchResults'
import SearchProvider from '@/contexts/search/provider'

export const rootRoute: RootRoute = createRootRoute({
  component: () => (
    <SearchProvider>
      <AppLayout />
    </SearchProvider>
  ),
})

export const homeRoute = createRoute({
  path: '/',
  getParentRoute: (): RootRoute => rootRoute,
  component: () => <Home />,
})

export const mediaDetailRoute = createRoute({
  path: '/media/$id',
  getParentRoute: (): RootRoute => rootRoute,
  component: MediaDetail,
})

export const searchResultsRoute = createRoute({
  path: '/search',
  getParentRoute: (): RootRoute => rootRoute,
  component: SearchResults,
})

export const notFoundRoute = createRoute({
  path: '*',
  getParentRoute: (): RootRoute => rootRoute,
  component: () => <NotFound />,
})

export const routeTree = rootRoute.addChildren([
  homeRoute,
  notFoundRoute,
  mediaDetailRoute,
  searchResultsRoute,
])

export default routeTree
