import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favorites: Set<string>;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavorites: () => string[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),

      addFavorite: (id: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          newFavorites.add(id);
          return { favorites: newFavorites };
        });
      },

      removeFavorite: (id: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          newFavorites.delete(id);
          return { favorites: newFavorites };
        });
      },

      toggleFavorite: (id: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(id)) {
            newFavorites.delete(id);
          } else {
            newFavorites.add(id);
          }
          return { favorites: newFavorites };
        });
      },

      isFavorite: (id: string) => {
        return get().favorites.has(id);
      },

      getFavorites: () => {
        return Array.from(get().favorites);
      },
    }),
    {
      name: "favorites-storage",
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              favorites: new Set(state.favorites || []),
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              favorites: Array.from(value.state.favorites),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

