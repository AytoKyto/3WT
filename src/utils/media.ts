import { Movie } from '../types/movie';
import { TVShow } from '../types/tv';

export type MediaItem = Movie | TVShow;

export const isMovie = (item: MediaItem): item is Movie => 'title' in item;

export const getDisplayTitle = (item: MediaItem): string =>
  isMovie(item) ? item.title : item.name;

export const getDisplayDate = (item: MediaItem): string =>
  isMovie(item) ? item.release_date : item.first_air_date;

export const getDisplayYear = (item: MediaItem): string => {
  const date = getDisplayDate(item);
  return date ? new Date(date).getFullYear().toString() : '—';
};
