'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { api, DEMO } from '@/lib/client';
import type { PropertyCard } from '@/lib/types';
import { useAuth } from './auth';

/** Saved homes. Kept in localStorage for guests and mirrored to the API for signed-in users. */
interface SavedState {
  items: PropertyCard[];
  has: (id: string) => boolean;
  toggle: (card: PropertyCard) => boolean;
  hydrateFromServer: () => Promise<void>;
}

export const useSaved = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (id) => get().items.some((i) => i.id === id),
      toggle: (card) => {
        const on = get().has(card.id);
        set({ items: on ? get().items.filter((i) => i.id !== card.id) : [card, ...get().items] });
        if (!DEMO && useAuth.getState().user) {
          api(`/me/favorites/${card.id}`, { method: on ? 'DELETE' : 'PUT' }).catch(() => {
            // Roll back if the server rejected the change.
            set({ items: on ? [card, ...get().items] : get().items.filter((i) => i.id !== card.id) });
          });
        }
        return !on;
      },
      hydrateFromServer: async () => {
        if (DEMO || !useAuth.getState().user) return;
        try {
          const rows = await api<{ property: PropertyCard }[]>('/me/favorites');
          const server = rows.map((r) => r.property);
          const local = get().items.filter((i) => !server.some((s) => s.id === i.id));
          // Push guest favourites up once the person signs in.
          await Promise.all(local.map((i) => api(`/me/favorites/${i.id}`, { method: 'PUT' }).catch(() => undefined)));
          set({ items: [...local, ...server] });
        } catch {
          /* keep local copy */
        }
      },
    }),
    { name: 'mawtin:saved', storage: createJSONStorage(() => localStorage), partialize: (s) => ({ items: s.items }), skipHydration: true },
  ),
);

/** Up to three homes side by side. Session only. */
interface CompareState {
  items: PropertyCard[];
  toggle: (card: PropertyCard) => 'added' | 'removed' | 'full';
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (card) => {
        const on = get().items.some((i) => i.id === card.id);
        if (on) {
          set({ items: get().items.filter((i) => i.id !== card.id) });
          return 'removed';
        }
        if (get().items.length >= 3) return 'full';
        set({ items: [...get().items, card] });
        return 'added';
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'mawtin:compare', storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
);
