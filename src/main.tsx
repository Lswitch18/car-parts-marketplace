import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

console.log('[main] App starting...');
console.log('[main] SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'OK' : 'MISSING!');
console.log('[main] SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'MISSING!');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

window.addEventListener('error', (e) => console.error('[main] Global error:', e.message, e.error));
window.addEventListener('unhandledrejection', (e) => console.error('[main] Unhandled rejection:', e.reason));

const root = document.getElementById('root');
if (!root) {
  console.error('[main] #root element not found!');
} else {
  console.log('[main] Rendering React...');
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log('[main] React rendered successfully');
  } catch (err) {
    console.error('[main] React render error:', err);
    root.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0B1220;color:white;font-family:system-ui;padding:20px;text-align:center;">
      <h2 style="color:#EF4444;">Erro ao carregar</h2>
      <p style="color:#9CA3AF;margin-top:8px;">${(err as Error).message}</p>
      <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;background:#3B82F6;border:none;border-radius:8px;color:white;cursor:pointer;">Recarregar</button>
    </div>`;
  }
}
