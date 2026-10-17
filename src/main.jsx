import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { router } from './routes/Routes.jsx'
import { RouterProvider } from 'react-router'

import AuthProvider from './providers/AuthProvider.jsx'
import { ThemeProvider, useTheme } from './providers/ThemeProvider.jsx'
import { Toaster } from 'react-hot-toast'

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a single QueryClient instance
const queryClient = new QueryClient()

function AppToaster() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: isDark ? '#16163a' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#1f2937',
          border: isDark ? '1px solid #2e2e58' : '1px solid #e5e7eb',
        },
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <AppToaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
