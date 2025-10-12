import type { ReactElement } from 'react'
import { QueryClient } from '@tanstack/react-query'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  within,
  type RenderOptions,
} from '@testing-library/react'
import TestProviders from './provider'

// Create a test query client
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {},
) => {
  const { queryClient, ...renderOptions } = options

  return render(ui, {
    wrapper: (props) => <TestProviders queryClient={queryClient} {...props} />,
    ...renderOptions,
  })
}

export {
  renderWithProviders,
  createTestQueryClient,
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  within,
}
