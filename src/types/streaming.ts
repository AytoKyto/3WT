export enum StreamingService {
  NETFLIX = 'Netflix',
  PRIME_VIDEO = 'Prime Video',
  DISNEY_PLUS = 'Disney+',
  CANAL_PLUS = 'Canal+',
  APPLE_TV = 'Apple TV+',
  OCS = 'OCS',
  PARAMOUNT_PLUS = 'Paramount+',
  MAX = 'Max',
  ALL = 'Tous les films',
}

export interface StreamingServiceData {
  id: string;
  name: string;
  providerId: number; // TMDB provider ID
  logoUrl: string;
  color: string;
  selected: boolean;
}

export const STREAMING_SERVICES: StreamingServiceData[] = [
  {
    id: 'netflix',
    name: StreamingService.NETFLIX,
    providerId: 8,
    logoUrl: 'https://image.tmdb.org/t/p/original/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg',
    color: '#E50914',
    selected: false,
  },
  {
    id: 'prime',
    name: StreamingService.PRIME_VIDEO,
    providerId: 119,
    logoUrl: 'https://image.tmdb.org/t/p/original/emthp39XA2YScoYL1p0sdbAH2WA.jpg',
    color: '#00A8E1',
    selected: false,
  },
  {
    id: 'disney',
    name: StreamingService.DISNEY_PLUS,
    providerId: 337,
    logoUrl: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
    color: '#113CCF',
    selected: false,
  },
  {
    id: 'canal',
    name: StreamingService.CANAL_PLUS,
    providerId: 381,
    logoUrl: 'https://image.tmdb.org/t/p/original/ajbCmwvZ8HiePHZaOVEgm9MzyuA.jpg',
    color: '#000000',
    selected: false,
  },
  {
    id: 'apple',
    name: StreamingService.APPLE_TV,
    providerId: 350,
    logoUrl: 'https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrScK.jpg',
    color: '#000000',
    selected: false,
  },
];