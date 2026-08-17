import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, MovieDetails } from '../types/movie';

const DEFAULT_ELO = 1200;
const ELO_K_FACTOR = 32;

interface MovieStore {
  watchlist: Movie[];
  watchedMovies: Movie[];
  swipedMovies: number[]; // IDs des films déjà swipés
  superLikedMovies: Movie[];
  watchlistAddedAt: Record<number, number>; // movieId -> timestamp d'ajout à la liste
  watchedElo: Record<number, number>; // movieId -> score du jeu "Duel à mort" (1200 par défaut)

  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  
  markAsWatched: (movie: Movie) => void;
  removeFromWatched: (movieId: number) => void;
  isWatched: (movieId: number) => boolean;
  
  addToSwiped: (movieId: number) => void;
  hasBeenSwiped: (movieId: number) => boolean;
  
  addToSuperLiked: (movie: Movie) => void;
  removeFromSuperLiked: (movieId: number) => void;
  isSuperLiked: (movieId: number) => boolean;

  reorderWatchlist: (newSubsetOrder: Movie[]) => void;
  reorderWatchedMovies: (newOrder: Movie[]) => void;
  getEloRating: (movieId: number) => number;
  recordDuel: (winnerId: number, loserId: number) => void;

  getRandomMovie: (genreId?: number) => Movie | null;
  clearAllData: () => void;
  clearSwipedMovies: () => void;
}

const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      watchedMovies: [],
      swipedMovies: [],
      superLikedMovies: [],
      watchlistAddedAt: {},
      watchedElo: {},

      addToWatchlist: (movie) => {
        set((state) => ({
          watchlist: [...state.watchlist.filter(m => m.id !== movie.id), movie],
          watchlistAddedAt: state.watchlistAddedAt[movie.id]
            ? state.watchlistAddedAt
            : { ...state.watchlistAddedAt, [movie.id]: Date.now() },
        }));
      },

      removeFromWatchlist: (movieId) => {
        set((state) => {
          const { [movieId]: _removed, ...restAddedAt } = state.watchlistAddedAt;
          return {
            watchlist: state.watchlist.filter(m => m.id !== movieId),
            watchlistAddedAt: restAddedAt,
          };
        });
      },
      
      isInWatchlist: (movieId) => {
        return get().watchlist.some(m => m.id === movieId);
      },
      
      markAsWatched: (movie) => {
        set((state) => {
          const { [movie.id]: _removed, ...restAddedAt } = state.watchlistAddedAt;
          return {
            watchedMovies: [...state.watchedMovies.filter(m => m.id !== movie.id), movie],
            watchlist: state.watchlist.filter(m => m.id !== movie.id),
            watchlistAddedAt: restAddedAt,
          };
        });
      },
      
      removeFromWatched: (movieId) => {
        set((state) => {
          const { [movieId]: _removed, ...restElo } = state.watchedElo;
          return {
            watchedMovies: state.watchedMovies.filter(m => m.id !== movieId),
            watchedElo: restElo,
          };
        });
      },
      
      isWatched: (movieId) => {
        return get().watchedMovies.some(m => m.id === movieId);
      },
      
      addToSwiped: (movieId) => {
        set((state) => ({
          swipedMovies: [...state.swipedMovies, movieId],
        }));
      },
      
      hasBeenSwiped: (movieId) => {
        return get().swipedMovies.includes(movieId);
      },
      
      addToSuperLiked: (movie) => {
        set((state) => ({
          superLikedMovies: [...state.superLikedMovies.filter(m => m.id !== movie.id), movie],
          watchlist: [...state.watchlist.filter(m => m.id !== movie.id), movie],
          watchlistAddedAt: state.watchlistAddedAt[movie.id]
            ? state.watchlistAddedAt
            : { ...state.watchlistAddedAt, [movie.id]: Date.now() },
        }));
      },
      
      removeFromSuperLiked: (movieId) => {
        set((state) => ({
          superLikedMovies: state.superLikedMovies.filter(m => m.id !== movieId),
        }));
      },
      
      isSuperLiked: (movieId) => {
        return get().superLikedMovies.some(m => m.id === movieId);
      },

      // newSubsetOrder est le nouvel ordre du sous-ensemble "à voir" (hors coups
      // de cœur, cf. filtre CE SOIR) — on réinjecte ce nouvel ordre dans la
      // liste complète en gardant les coups de cœur à leur position d'origine.
      reorderWatchlist: (newSubsetOrder) => {
        set((state) => {
          const superLikedIds = new Set(state.superLikedMovies.map(m => m.id));
          let subsetIndex = 0;
          const merged = state.watchlist.map((movie) => {
            if (superLikedIds.has(movie.id)) return movie;
            return newSubsetOrder[subsetIndex++];
          });
          return { watchlist: merged };
        });
      },

      reorderWatchedMovies: (newOrder) => {
        set({ watchedMovies: newOrder });
      },

      getEloRating: (movieId) => {
        return get().watchedElo[movieId] ?? DEFAULT_ELO;
      },

      // "Duel à mort" : met à jour le score façon Elo des deux films (pour
      // l'affichage du score dans le jeu), PUIS corrige l'ordre du classement
      // si besoin — pas par un tri global (qui écraserait un classement fait
      // à la main), mais en déplaçant uniquement le gagnant juste au-dessus
      // du perdant s'il n'y était pas déjà. Un duel gagné garantit donc
      // toujours un rang strictement meilleur, sans perturber le reste.
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

          const arr = [...state.watchedMovies];
          const winnerIndex = arr.findIndex(m => m.id === winnerId);
          const loserIndex = arr.findIndex(m => m.id === loserId);

          if (winnerIndex !== -1 && loserIndex !== -1 && winnerIndex > loserIndex) {
            const [winnerMovie] = arr.splice(winnerIndex, 1);
            const newLoserIndex = arr.findIndex(m => m.id === loserId);
            arr.splice(newLoserIndex, 0, winnerMovie);
          }

          return { watchedElo: newElo, watchedMovies: arr };
        });
      },

      getRandomMovie: (genreId) => {
        const { watchlist, superLikedMovies } = get();
        
        // Combiner watchlist et superLiked avec pondération
        const weightedList: Movie[] = [
          ...watchlist,
          ...superLikedMovies,
          ...superLikedMovies, // Doubler les super liked pour augmenter leurs chances
        ];
        
        // Filtrer par genre si spécifié
        const filteredList = genreId
          ? weightedList.filter(m => m.genre_ids.includes(genreId))
          : weightedList;
        
        if (filteredList.length === 0) return null;
        
        // Sélection aléatoire
        const randomIndex = Math.floor(Math.random() * filteredList.length);
        return filteredList[randomIndex];
      },
      
      clearAllData: () => {
        set({
          watchlist: [],
          watchedMovies: [],
          swipedMovies: [],
          superLikedMovies: [],
          watchlistAddedAt: {},
          watchedElo: {},
        });
      },
      
      clearSwipedMovies: () => {
        set({ swipedMovies: [] });
      },
    }),
    {
      name: '3wt-movie-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useMovieStore;