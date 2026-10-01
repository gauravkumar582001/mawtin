'use client';
import { create } from 'zustand';
import { api, DEMO, demoDelay } from '@/lib/client';
import type { Me } from '@/lib/types';

interface AuthState {
  user: Me | null;
  status: 'idle' | 'loading' | 'ready';
  load: () => Promise<void>;
  login: (email: string, password: string) => Promise<Me>;
  register: (dto: { email: string; password: string; fullName: string; phone?: string; locale?: string }) => Promise<Me>;
  logout: () => Promise<void>;
}

const DEMO_KEY = 'mawtin:demo-user';

function demoUser(email: string, fullName?: string): Me {
  const agencyStaff = /@(saraya|alkhaleej|liwan|sidrstone)\.om$/i.test(email) || email.startsWith('agent');
  return {
    id: 'demo-user',
    email,
    fullName: fullName ?? (agencyStaff ? 'Aisha Al Balushi' : 'Hamed Al Siyabi'),
    phone: null,
    role: agencyStaff ? 'AGENCY_ADMIN' : 'CUSTOMER',
    locale: 'en',
    agency: agencyStaff
      ? { id: 'g-saraya', slug: 'saraya-estates', name: 'Saraya Estates', nameAr: 'سرايا العقارية', brandColor: '#236777', logoUrl: null, status: 'VERIFIED', memberRole: 'OWNER', title: 'Senior agent' }
      : null,
  };
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  async load() {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    if (DEMO) {
      try {
        const raw = sessionStorage.getItem(DEMO_KEY);
        set({ user: raw ? (JSON.parse(raw) as Me) : null, status: 'ready' });
      } catch {
        set({ status: 'ready' });
      }
      return;
    }
    try {
      set({ user: await api<Me>('/auth/me'), status: 'ready' });
    } catch {
      set({ user: null, status: 'ready' });
    }
  },

  async login(email, password) {
    if (DEMO) {
      const u = await demoDelay(demoUser(email));
      try { sessionStorage.setItem(DEMO_KEY, JSON.stringify(u)); } catch { /* private mode */ }
      set({ user: u, status: 'ready' });
      return u;
    }
    await api('/auth/login', { method: 'POST', body: { email, password } });
    const me = await api<Me>('/auth/me');
    set({ user: me, status: 'ready' });
    return me;
  },

  async register(dto) {
    if (DEMO) {
      const u = await demoDelay(demoUser(dto.email, dto.fullName));
      try { sessionStorage.setItem(DEMO_KEY, JSON.stringify(u)); } catch { /* private mode */ }
      set({ user: u, status: 'ready' });
      return u;
    }
    await api('/auth/register', { method: 'POST', body: dto });
    const me = await api<Me>('/auth/me');
    set({ user: me, status: 'ready' });
    return me;
  },

  async logout() {
    if (DEMO) {
      try { sessionStorage.removeItem(DEMO_KEY); } catch { /* ignore */ }
    } else {
      await api('/auth/logout', { method: 'POST', body: {} }).catch(() => undefined);
    }
    set({ user: null, status: 'ready' });
  },
}));

export const isAgencyStaff = (u: Me | null) => !!u && (u.role === 'ADMIN' || !!u.agency);
