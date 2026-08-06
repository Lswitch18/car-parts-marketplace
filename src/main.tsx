import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import DriverApp from './DriverApp'
import StoreApp from './StoreApp'
import './index.css'

// TODO(security): diagnostic logs restricted to dev mode only — never expose DB URLs or key status in production
if (import.meta.env.DEV) {
  console.log('[main] App starting (dev mode)...');
  console.log('[main] SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'configured' : 'MISSING!');
  console.log('[main] SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'MISSING!');
}

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

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const appMode = import.meta.env.VITE_APP_MODE;
const RootComponent = appMode === 'driver' ? DriverApp : appMode === 'store' ? StoreApp : App;

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
            <RootComponent />
          </BrowserRouter>
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log('[main] React rendered successfully');
  } catch (err) {
    // TODO(security): never expose raw error messages to the user in production
    if (import.meta.env.DEV) {
      console.error('[main] React render error:', err);
    }
    // Build error UI safely without innerHTML to prevent XSS
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#0B1220',
      color: 'white', fontFamily: 'system-ui', padding: '20px', textAlign: 'center',
    });
    const heading = document.createElement('h2');
    heading.style.color = '#EF4444';
    heading.textContent = 'Erro ao carregar a aplicação';
    const msg = document.createElement('p');
    msg.style.cssText = 'color:#9CA3AF;margin-top:8px;';
    // Generic message only — never expose internal error details to the user
    msg.textContent = 'Ocorreu um erro inesperado. Tente novamente.';
    const btn = document.createElement('button');
    btn.style.cssText = 'margin-top:16px;padding:10px 24px;background:#3B82F6;border:none;border-radius:8px;color:white;cursor:pointer;';
    btn.textContent = 'Recarregar';
    btn.addEventListener('click', () => location.reload());
    wrapper.append(heading, msg, btn);
    root.replaceChildren(wrapper);
  }
}
