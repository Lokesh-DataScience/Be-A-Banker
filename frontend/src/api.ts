import { supabase } from './auth/supabase';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function authHeaders(): Promise<HeadersInit> {
  // getSession() reads from localStorage — fast and synchronous after init
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    console.warn('authHeaders: no access token found in session');
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function safeFetch(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    console.error(`API ${options.method ?? 'GET'} ${url} →`, res.status, err);
    return err; // return error object — callers guard with Array.isArray / .detail
  }
  return res.json().catch(() => ({}));
}

export const api = {
  get: async (path: string) =>
    safeFetch(`${BASE_URL}${path}`, { headers: await authHeaders() }),

  post: async (path: string, body: unknown) =>
    safeFetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    }),

  put: async (path: string, body: unknown) =>
    safeFetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    }),

  patch: async (path: string, body: unknown) =>
    safeFetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    }),

  delete: async (path: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    }),

  reset: async () =>
    fetch(`${BASE_URL}/api/reset`, {
      method: 'DELETE',
      headers: await authHeaders(),
    }),
};