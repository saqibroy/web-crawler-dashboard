import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 2 times
      retry: 2,
      // Keep data fresh for 30 seconds
      staleTime: 30 * 1000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Refetch on window focus for real-time updates
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)