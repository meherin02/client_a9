import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
export const authClient = createAuthClient({ baseURL: API_URL, plugins: [jwtClient()] });
export function safeReturnPath(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/dashboard';
}
export async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error('Please sign in again to continue.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${data.token}`);
  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include', cache: 'no-store' });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'Unable to load your account.');
  return body;
}
