import { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1/admin`;

export default function LogistixPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const setupLogistix = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }

      const iframe = iframeRef.current;
      if (!iframe) return;

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const [url, options] = args;
        let requestUrl = url;
        
        if (typeof url === 'string' && url.startsWith('/api/')) {
          const endpoint = url.replace('/api/', '');
          requestUrl = `${FUNCTIONS_URL}/${endpoint}`;
          
          const headers = new Headers(options?.headers || {});
          if (session.access_token) {
            headers.set('Authorization', `Bearer ${session.access_token}`);
          }
          
          return originalFetch.call(window, requestUrl, {
            ...options,
            headers
          });
        }
        
        return originalFetch.apply(this, args);
      };
    };

    setupLogistix();
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/src/pages/admin/logistix/index.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      title="Logistix WMS"
    />
  );
}