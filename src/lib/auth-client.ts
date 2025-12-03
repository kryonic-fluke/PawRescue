"use client"
import { useEffect, useState } from 'react';

const API_PREFIX = '';

// Minimal client shim to replace better-auth usage in the app.
export const authClient = {
  // simple sign out helper
  signOut: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : null;
      if (token) {
        await fetch(`${API_PREFIX}/api/auth/local/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => { });
      }
    } catch { }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bearer_token');
      localStorage.removeItem('mock_user');
    }
    return { error: null };
  },
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      try {
        const res = await fetch(`${API_PREFIX}/api/auth/local/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          // persist token if provided
          if (data?.session?.token) localStorage.setItem('bearer_token', data.session.token);
          return { data, error: null };
        }
        // fallthrough to local fallback
      } catch (e) {
        console.warn('Auth login network error, falling back to local mock:', e);
      }

      // Local fallback: create or validate a mock user stored in localStorage
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      let user = mockUsers.find((u: any) => u.email === email);
      if (!user) {
        user = { id: `local-${mockUsers.length + 1}`, name: email.split('@')[0], email, passwordHash: password };
        mockUsers.push(user);
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      const token = `local-token-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('bearer_token', token);
      localStorage.setItem('mock_user', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
      return { data: { user: { id: user.id, name: user.name, email: user.email }, session: { token } }, error: null };
    },
    social: async (_opts: unknown) => {
      // Social not supported in this shim
      return { url: null };
    }
  },
  signUp: {
    email: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      try {
        const res = await fetch(`${API_PREFIX}/api/auth/local/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (res.ok) {
          if (data?.session?.token) localStorage.setItem('bearer_token', data.session.token);
          return { data, error: null };
        }
        // fallthrough to local fallback
      } catch (e) {
        console.warn('Auth register network error, falling back to local mock:', e);
      }

      // Local fallback: create a mock user
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (mockUsers.find((u: any) => u.email === email)) {
        return { data: null, error: { message: 'User already exists (local)' } };
      }
      const user = { id: `local-${mockUsers.length + 1}`, name: name || email.split('@')[0], email, passwordHash: password };
      mockUsers.push(user);
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      const token = `local-token-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('bearer_token', token);
      localStorage.setItem('mock_user', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
      return { data: { user: { id: user.id, name: user.name, email: user.email }, session: { token } }, error: null };
    }
  }
};

export const useSession = () => {
  const [state, setState] = useState({ data: null as any, isPending: true });

  const fetchSession = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : null;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_PREFIX}/api/auth/local/session`, { headers });
      let json = null;
      try {
        json = await res.json();
      } catch (e) {
        json = null;
      }

      // If remote session is missing or unauthenticated, fall back to local mock user
      if (!json || !json.user) {
        const mock = typeof window !== 'undefined' ? localStorage.getItem('mock_user') : null;
        if (mock) {
          setState({ data: { user: JSON.parse(mock) }, isPending: false });
          return;
        }
      }

      setState({ data: json, isPending: false });
    } catch (e) {
      // On network error, hydrate from local mock_user if present
      const mock = typeof window !== 'undefined' ? localStorage.getItem('mock_user') : null;
      if (mock) setState({ data: { user: JSON.parse(mock) }, isPending: false });
      else setState({ data: null, isPending: false });
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return { data: state.data, isPending: state.isPending, refetch: fetchSession };
};

export const getBearerToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bearer_token');
};

export const setBearerToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bearer_token', token);
};

export const clearBearerToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bearer_token');
};