import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '';
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN || '';
const BASE_URL = process.env.EXPO_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

// Utiliser soit le token Bearer (prioritaire) soit la clé API
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: ACCESS_TOKEN ? {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  } : {},
  params: {
    ...(ACCESS_TOKEN ? {} : { api_key: API_KEY }),
    language: 'fr-FR',
  },
});

export const getImageUrl = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const movieService = {
  getPopular: async (page = 1) => {
    const response = await tmdbApi.get('/movie/popular', { params: { page } });
    return response.data;
  },

  getTopRated: async (page = 1) => {
    const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
    return response.data;
  },

  getUpcoming: async (page = 1) => {
    const response = await tmdbApi.get('/movie/upcoming', { params: { page } });
    return response.data;
  },

  getDetails: async (movieId: number) => {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  },

  searchMovies: async (query: string, page = 1) => {
    const response = await tmdbApi.get('/search/movie', {
      params: { query, page },
    });
    return response.data;
  },

  getGenres: async () => {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  },

  getMoviesByGenre: async (genreId: number, page = 1) => {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });
    return response.data;
  },

  getSimilar: async (movieId: number) => {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`);
    return response.data;
  },

  getWatchProviders: async (movieId: number) => {
    const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    return response.data.results?.FR || null;
  },

  getCredits: async (movieId: number) => {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data;
  },

  searchPeople: async (query: string, page = 1) => {
    const response = await tmdbApi.get('/search/person', {
      params: { query, page },
    });
    return response.data;
  },

  getPersonMovies: async (personId: number) => {
    const response = await tmdbApi.get(`/person/${personId}/movie_credits`);
    return response.data;
  },
};

export const tvService = {
  getPopular: async (page = 1) => {
    const response = await tmdbApi.get('/tv/popular', { params: { page } });
    return response.data;
  },

  getTopRated: async (page = 1) => {
    const response = await tmdbApi.get('/tv/top_rated', { params: { page } });
    return response.data;
  },

  getOnTheAir: async (page = 1) => {
    const response = await tmdbApi.get('/tv/on_the_air', { params: { page } });
    return response.data;
  },

  getDetails: async (tvId: number) => {
    const response = await tmdbApi.get(`/tv/${tvId}`);
    return response.data;
  },

  searchTV: async (query: string, page = 1) => {
    const response = await tmdbApi.get('/search/tv', {
      params: { query, page },
    });
    return response.data;
  },

  getGenres: async () => {
    const response = await tmdbApi.get('/genre/tv/list');
    return response.data.genres;
  },

  getShowsByGenre: async (genreId: number, page = 1) => {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });
    return response.data;
  },

  getSimilar: async (tvId: number) => {
    const response = await tmdbApi.get(`/tv/${tvId}/similar`);
    return response.data;
  },

  getWatchProviders: async (tvId: number) => {
    const response = await tmdbApi.get(`/tv/${tvId}/watch/providers`);
    return response.data.results?.FR || null;
  },

  getCredits: async (tvId: number) => {
    const response = await tmdbApi.get(`/tv/${tvId}/credits`);
    return response.data;
  },

  getPersonShows: async (personId: number) => {
    const response = await tmdbApi.get(`/person/${personId}/tv_credits`);
    return response.data;
  },
};

export default tmdbApi;