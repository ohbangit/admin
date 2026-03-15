import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './app/App'
import { QUERY_STALE_TIME_DEFAULT } from './constants/config'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: QUERY_STALE_TIME_DEFAULT,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>,
)
