import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';
import { movieService } from '../services/api/tmdb';
import { WatchProviders } from '../types/movie';

interface StreamingBadgesProps {
  movieId: number;
  variant?: 'small' | 'medium';
}

const StreamingBadges: React.FC<StreamingBadgesProps> = ({ 
  movieId, 
  variant = 'small' 
}) => {
  const [providers, setProviders] = useState<WatchProviders | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, [movieId]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await movieService.getWatchProviders(movieId);
      console.log(`Providers for movie ${movieId}:`, data);
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
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
    return null;
  }

  // Mapper les provider_id vers les noms et emojis
  const getProviderInfo = (providerId: number) => {
    const providers: { [key: number]: { name: string; emoji: string; color: string } } = {
      // Services de streaming populaires
      8: { name: 'Netflix', emoji: '🎬', color: '#E50914' },
      119: { name: 'Prime', emoji: '📺', color: '#00A8E1' },
      337: { name: 'Disney+', emoji: '🏰', color: '#113CCF' },
      381: { name: 'Canal+', emoji: '🎭', color: '#000000' },
      350: { name: 'Apple TV+', emoji: '🍎', color: '#000000' },
      2: { name: 'Apple TV', emoji: '🍎', color: '#000000' },
      531: { name: 'Paramount+', emoji: '⭐', color: '#0064FF' },
      1870: { name: 'Max', emoji: '🎥', color: '#002BE7' },
      
      // Services français
      56: { name: 'OCS', emoji: '🎪', color: '#FF7900' },
      61: { name: 'Orange', emoji: '🟠', color: '#FF7900' },
      58: { name: 'MyCanal', emoji: '🎭', color: '#000000' },
      60: { name: 'Univers+', emoji: '🌟', color: '#FF0066' },
      1733: { name: 'Arte', emoji: '🎨', color: '#F47521' },
      234: { name: 'France TV', emoji: '🇫🇷', color: '#002F7F' },
      
      // Services de location/achat
      10: { name: 'Amazon', emoji: '📦', color: '#FF9900' },
      35: { name: 'Rakuten', emoji: '🎯', color: '#BF0000' },
      3: { name: 'Google Play', emoji: '▶️', color: '#4285F4' },
      192: { name: 'YouTube', emoji: '📺', color: '#FF0000' },
      68: { name: 'Microsoft', emoji: '🪟', color: '#0078D4' },
      
      // Autres services internationaux
      384: { name: 'HBO', emoji: '🎬', color: '#000000' },
      15: { name: 'Hulu', emoji: '💚', color: '#1CE783' },
      387: { name: 'Peacock', emoji: '🦚', color: '#000000' },
      1899: { name: 'Crunchyroll', emoji: '🌸', color: '#FF6600' },
      283: { name: 'Mubi', emoji: '🎞️', color: '#000000' },
      257: { name: 'Fubo', emoji: '⚽', color: '#FF6B00' },
      
      // Services additionnels français
      415: { name: 'Shadowz', emoji: '👻', color: '#8B00FF' },
      1764: { name: 'Molotov', emoji: '📺', color: '#E73838' },
      1771: { name: 'Pass Warner', emoji: '🎬', color: '#003DA5' },
      1853: { name: 'ADN', emoji: '🎌', color: '#FF6B00' },
    };
    return providers[providerId] || null;
  };

  const renderProviders = (providerList: any[], type: string) => {
    if (!providerList || providerList.length === 0) return null;

    // Limiter à 3-4 providers pour ne pas surcharger
    const limitedProviders = providerList.slice(0, 4);
    
    // Collecter les providers connus et compter les inconnus
    const knownProviders: JSX.Element[] = [];
    let unknownCount = 0;

    limitedProviders.forEach((provider) => {
      const info = getProviderInfo(provider.provider_id);
      
      if (info) {
        // Provider connu
        knownProviders.push(
          <View 
            key={provider.provider_id} 
            style={[styles.providerBadge, { backgroundColor: info.color }]}
          >
            <Text style={styles.providerName}>{info.name}</Text>
          </View>
        );
      } else {
        // Provider inconnu
        unknownCount++;
      }
    });
    
    // Ajouter un seul badge "Autre" si nécessaire
    if (unknownCount > 0) {
      knownProviders.push(
        <View 
          key="other" 
          style={[styles.providerBadge, { backgroundColor: '#666666' }]}
        >
          <Text style={styles.providerName}>
            {unknownCount > 1 ? `Autres (${unknownCount})` : 'Autre'}
          </Text>
        </View>
      );
    }

    return knownProviders;
  };

  return (
    <View style={[
      styles.container,
      variant === 'medium' && styles.containerMedium
    ]}>
      {providers.flatrate && renderProviders(providers.flatrate, 'stream')}
      {!providers.flatrate && providers.rent && renderProviders(providers.rent, 'rent')}
      {!providers.flatrate && !providers.rent && providers.buy && renderProviders(providers.buy, 'buy')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  containerMedium: {
    gap: 8,
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.md,
    borderWidth: 0,
    borderColor: 'transparent',
    marginRight: 4,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default StreamingBadges;