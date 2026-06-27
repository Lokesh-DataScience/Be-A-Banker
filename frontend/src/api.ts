import { supabase } from './auth/supabase';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, { headers: await authHeaders() });
    return res.json();
  },

  post: async (path: string, body: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },

  put: async (path: string, body: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },

  patch: async (path: string, body: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async (path: string) => {
    return fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    });
  },
};