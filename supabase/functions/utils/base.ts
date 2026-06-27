import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { rateLimit } from './redis.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function errorResponse(error: string): ApiResponse {
  return { success: false, error };
}

export function notFoundResponse(resource: string): ApiResponse {
  return { success: false, error: `${resource} não encontrado` };
}

export function unauthorizedResponse(): ApiResponse {
  return { success: false, error: 'Não autorizado' };
}

export function validationError(field: string, message: string): ApiResponse {
  return { success: false, error: `Campo '${field}': ${message}` };
}

export function getAuthUser(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '');
}

export async function verifyToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function requireAuth(req: Request) {
  const rlResponse = await checkRateLimit(req, 100, 60);
  if (rlResponse) {
    return { user: null, response: rlResponse };
  }

  const token = getAuthUser(req);
  if (!token) {
    return {
      user: null,
      response: new Response(JSON.stringify(unauthorizedResponse()), {
        status: 401,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    };
  }

  const user = await verifyToken(token);
  if (!user) {
    return {
      user: null,
      response: new Response(JSON.stringify(errorResponse('Token inválido ou expirado')), {
        status: 401,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    };
  }

  return { user, response: null };
}

export function getUuidFromBody(body: any, field: string): string | null {
  const value = body?.[field];
  if (!value || typeof value !== 'string') return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value) ? value : null;
}

export function parseJsonBody<T>(body: unknown): T | null {
  if (!body || typeof body !== 'object') return null;
  return body as T;
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

export async function checkRateLimit(req: Request, max: number = 100, window: number = 60): Promise<Response | null> {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const allowed = await rateLimit(ip, max, window);
  if (!allowed) {
    return new Response(JSON.stringify(errorResponse('Too many requests. Please try again later.')), {
      status: 429,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json', 'Retry-After': String(window) },
    });
  }
  return null;
}