import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TVShow } from '../types/tv';

const DEFAULT_ELO = 1200;
const ELO_K_FACTOR = 32;

interface SeriesStore {
  watchlist: TVShow[];
  watchedShows: TVShow[];
  swipedShows: number[]; // IDs des séries déjà swipées
  superLikedShows: TVShow[];
  watchlistAddedAt: Record<number, number>; // showId -> timestamp d'ajout à la liste
  watchedElo: Record<number, number>; // showId -> score du jeu "Duel à mort" (1200 par défaut)

  addToWatchlist: (show: TVShow) => void;
  removeFromWatchlist: (showId: number) => void;
  isInWatchlist: (showId: number) => boolean;

  markAsWatched: (show: TVShow) => void;
  removeFromWatched: (showId: number) => void;
  isWatched: (showId: number) => boolean;

  addToSwiped: (showId: number) => void;
  hasBeenSwiped: (showId: number) => boolean;

  addToSuperLiked: (show: TVShow) => void;
  removeFromSuperLiked: (showId: number) => void;
  isSuperLiked: (showId: number) => boolean;

  reorderWatchlist: (newSubsetOrder: TVShow[]) => void;
  reorderWatchedShows: (newOrder: TVShow[]) => void;
  getEloRating: (showId: number) => number;
  recordDuel: (winnerId: number, loserId: number) => void;

  clearAllData: () => void;
  clearSwipedShows: () => void;
}

const useSeriesStore = create<SeriesStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      watchedShows: [],
      swipedShows: [],
      superLikedShows: [],
      watchlistAddedAt: {},
      watchedElo: {},

      addToWatchlist: (show) => {
        set((state) => ({
          watchlist: [...state.watchlist.filter(s => s.id !== show.id), show],
          watchlistAddedAt: state.watchlistAddedAt[show.id]
            ? state.watchlistAddedAt
            : { ...state.watchlistAddedAt, [show.id]: Date.now() },
        }));
      },

      removeFromWatchlist: (showId) => {
        set((state) => {
          const { [showId]: _removed, ...restAddedAt } = state.watchlistAddedAt;
          return {
            watchlist: state.watchlist.filter(s => s.id !== showId),
            watchlistAddedAt: restAddedAt,
          };
        });
      },

      isInWatchlist: (showId) => {
        return get().watchlist.some(s => s.id === showId);
      },

      markAsWatched: (show) => {
        set((state) => {
          const { [show.id]: _removed, ...restAddedAt } = state.watchlistAddedAt;
          return {
            watchedShows: [...state.watchedShows.filter(s => s.id !== show.id), show],
            watchlist: state.watchlist.filter(s => s.id !== show.id),
            watchlistAddedAt: restAddedAt,
          };
        });
      },

      removeFromWatched: (showId) => {
        set((state) => {
          const { [showId]: _removed, ...restElo } = state.watchedElo;
          return {
            watchedShows: state.watchedShows.filter(s => s.id !== showId),
            watchedElo: restElo,
          };
        });
      },

      isWatched: (showId) => {
        return get().watchedShows.some(s => s.id === showId);
      },

      addToSwiped: (showId) => {
        set((state) => ({
          swipedShows: [...state.swipedShows, showId],
        }));
      },

      hasBeenSwiped: (showId) => {
        return get().swipedShows.includes(showId);
      },

      addToSuperLiked: (show) => {
        set((state) => ({
          superLikedShows: [...state.superLikedShows.filter(s => s.id !== show.id), show],
          watchlist: [...state.watchlist.filter(s => s.id !== show.id), show],
          watchlistAddedAt: state.watchlistAddedAt[show.id]
            ? state.watchlistAddedAt
            : { ...state.watchlistAddedAt, [show.id]: Date.now() },
        }));
      },

      removeFromSuperLiked: (showId) => {
        set((state) => ({
          superLikedShows: state.superLikedShows.filter(s => s.id !== showId),
        }));
      },

      isSuperLiked: (showId) => {
        return get().superLikedShows.some(s => s.id === showId);
      },

      reorderWatchlist: (newSubsetOrder) => {
        set((state) => {
          const superLikedIds = new Set(state.superLikedShows.map(s => s.id));
          let subsetIndex = 0;
          const merged = state.watchlist.map((show) => {
            if (superLikedIds.has(show.id)) return show;
            return newSubsetOrder[subsetIndex++];
          });
          return { watchlist: merged };
        });
      },

      reorderWatchedShows: (newOrder) => {
        set({ watchedShows: newOrder });
      },

      getEloRating: (showId) => {
        return get().watchedElo[showId] ?? DEFAULT_ELO;
      },

      recordDuel: (winnerId, loserId) => {
        set((state) => {
          const ratingWinner = state.watchedElo[winnerId] ?? DEFAULT_ELO;
          const ratingLoser = state.watchedElo[loserId] ?? DEFAULT_ELO;

          const expectedWinner = 1 / (1 + Math.pow(10, (ratingLoser - ratingWinner) / 400));
          const expectedLoser = 1 - expectedWinner;

          const newElo = {
            ...state.watchedElo,
            [winnerId]: Math.round(ratingWinner + ELO_K_FACTOR * (1 - expectedWinner)),
            [loserId]: Math.round(ratingLoser + ELO_K_FACTOR * (0 - expectedLoser)),
          };

          const arr = [...state.watchedShows];
          const winnerIndex = arr.findIndex(s => s.id === winnerId);
          const loserIndex = arr.findIndex(s => s.id === loserId);

          if (winnerIndex !== -1 && loserIndex !== -1 && winnerIndex > loserIndex) {
            const [winnerShow] = arr.splice(winnerIndex, 1);
            const newLoserIndex = arr.findIndex(s => s.id === loserId);
            arr.splice(newLoserIndex, 0, winnerShow);
          }

          return { watchedElo: newElo, watchedShows: arr };
        });
      },

      clearAllData: () => {
        set({
          watchlist: [],
          watchedShows: [],
          swipedShows: [],
          superLikedShows: [],
          watchlistAddedAt: {},
          watchedElo: {},
        });
      },

      clearSwipedShows: () => {
        set({ swipedShows: [] });
      },
    }),
    {
      name: '3wt-series-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSeriesStore;
