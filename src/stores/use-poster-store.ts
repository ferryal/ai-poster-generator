import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Poster {
  id: string;
  title: string;
  createdAt: Date;
  status: "draft" | "processing" | "completed";
  thumbnailUrl?: string;
}

interface PosterState {
  posters: Poster[];
  activePoster: string | null;

  addPoster: (poster: Omit<Poster, "id" | "createdAt">) => string;
  updatePoster: (id: string, updates: Partial<Poster>) => void;
  deletePoster: (id: string) => void;
  setActivePoster: (id: string | null) => void;
}

export const usePosterStore = create<PosterState>()(
  persist(
    (set) => ({
      posters: [
        {
          id: "1",
          title: "Where Elegance Meets Design Exc...",
          createdAt: new Date(),
          status: "completed",
        },
        {
          id: "2",
          title: "Modern Aesthetics for Today's World",
          createdAt: new Date(),
          status: "completed",
        },
        {
          id: "3",
          title: "Visually Telling Your Brand's Story",
          createdAt: new Date(),
          status: "completed",
        },
        {
          id: "4",
          title: "The Essence of Timeless Design",
          createdAt: new Date(),
          status: "completed",
        },
        {
          id: "5",
          title: "Simplicity in Design: A New Outlook",
          createdAt: new Date(),
          status: "completed",
        },
      ],
      activePoster: null,

      addPoster: (poster) => {
        const id = `poster-${Date.now()}`;
        const newPoster: Poster = {
          ...poster,
          id,
          createdAt: new Date(),
        };

        set((state) => ({
          posters: [newPoster, ...state.posters],
          activePoster: id,
        }));

        return id;
      },

      updatePoster: (id, updates) => {
        set((state) => ({
          posters: state.posters.map((poster) =>
            poster.id === id ? { ...poster, ...updates } : poster
          ),
        }));
      },

      deletePoster: (id) => {
        set((state) => ({
          posters: state.posters.filter((poster) => poster.id !== id),
          activePoster: state.activePoster === id ? null : state.activePoster,
        }));
      },

      setActivePoster: (id) => {
        set({ activePoster: id });
      },
    }),
    {
      name: "poster-storage",
    }
  )
);
