import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, MovieDetails } from '../types/movie';

interface MovieStore {
  watchlist: Movie[];
  watchedMovies: Movie[];
  swipedMovies: number[]; // IDs des films déjà swipés
  superLikedMovies: Movie[];
  
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
      
      addToWatchlist: (movie) => {
        set((state) => ({
          watchlist: [...state.watchlist.filter(m => m.id !== movie.id), movie],
        }));
      },
      
      removeFromWatchlist: (movieId) => {
        set((state) => ({
          watchlist: state.watchlist.filter(m => m.id !== movieId),
        }));
      },
      
      isInWatchlist: (movieId) => {
        return get().watchlist.some(m => m.id === movieId);
      },
      
      markAsWatched: (movie) => {
        set((state) => ({
          watchedMovies: [...state.watchedMovies.filter(m => m.id !== movie.id), movie],
          watchlist: state.watchlist.filter(m => m.id !== movie.id),
        }));
      },
      
      removeFromWatched: (movieId) => {
        set((state) => ({
          watchedMovies: state.watchedMovies.filter(m => m.id !== movieId),
        }));
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