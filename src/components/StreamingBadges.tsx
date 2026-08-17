import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';
import { movieService, tvService } from '../services/api/tmdb';
import { WatchProviders } from '../types/movie';

interface StreamingBadgesProps {
  movieId: number;
  variant?: 'small' | 'medium';
  dark?: boolean;
  mediaType?: 'movie' | 'tv';
}

export const PROVIDER_NAMES: { [key: number]: string } = {
  8: 'NETFLIX',
  119: 'PRIME',
  337: 'DISNEY+',
  381: 'CANAL+',
  350: 'APPLE TV+',
  2: 'APPLE TV',
  531: 'PARAMOUNT+',
  1870: 'MAX',
  56: 'OCS',
  61: 'ORANGE',
  58: 'MYCANAL',
  60: 'UNIVERS+',
  1733: 'ARTE',
  234: 'FRANCE TV',
  10: 'AMAZON',
  35: 'RAKUTEN',
  3: 'GOOGLE PLAY',
  192: 'YOUTUBE',
  68: 'MICROSOFT',
  384: 'HBO',
  15: 'HULU',
  387: 'PEACOCK',
  1899: 'CRUNCHYROLL',
  283: 'MUBI',
  257: 'FUBO',
  415: 'SHADOWZ',
  1764: 'MOLOTOV',
  1771: 'PASS WARNER',
  1853: 'ADN',
};

const StreamingBadges: React.FC<StreamingBadgesProps> = ({
  movieId,
  variant = 'small',
  dark = false,
  mediaType = 'movie',
}) => {
  const [providers, setProviders] = useState<WatchProviders | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, [movieId, mediaType]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = mediaType === 'tv'
        ? await tvService.getWatchProviders(movieId)
        : await movieService.getWatchProviders(movieId);
      setProviders(data);
    } catch (error) {
      console.log('Erreur lors du chargement des plateformes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.ink} />
      </View>
    );
  }

  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
    return (
      <View style={styles.container}>
        <Text style={[styles.unavailableText, dark && styles.unavailableTextDark]}>
          NON DISPONIBLE EN STREAMING
        </Text>
      </View>
    );
  }

  const renderProviders = (providerList: any[]) => {
    if (!providerList || providerList.length === 0) return null;

    const limitedProviders = providerList.slice(0, 4);
    const known: string[] = [];
    let unknownCount = 0;

    limitedProviders.forEach((provider) => {
      const name = PROVIDER_NAMES[provider.provider_id];
      if (name) {
        known.push(name);
      } else {
        unknownCount++;
      }
    });

    if (unknownCount > 0) {
      known.push(unknownCount > 1 ? `AUTRES (${unknownCount})` : 'AUTRE');
    }

    return known.map((name) => (
      <View
        key={name}
        style={[
          styles.providerBadge,
          dark ? styles.providerBadgeDark : styles.providerBadgeLight,
        ]}
      >
        <Text style={[styles.providerName, dark && styles.providerNameDark]}>{name}</Text>
      </View>
    ));
  };

  const activeList = providers.flatrate || providers.rent || providers.buy;

  return (
    <View style={[styles.container, variant === 'medium' && styles.containerMedium]}>
      {activeList && renderProviders(activeList)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  containerMedium: {
    gap: 8,
  },
  providerBadge: {
    borderWidth: theme.borders.thin,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  providerBadgeLight: {
    borderColor: theme.colors.ink,
    backgroundColor: 'transparent',
  },
  providerBadgeDark: {
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
  },
  providerName: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.ink,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  providerNameDark: {
    color: theme.colors.yellow,
  },
  unavailableText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textFaint,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  unavailableTextDark: {
    color: theme.colors.textFaint,
  },
});

export default StreamingBadges;
