import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Movie } from '../types/movie';
import { getImageUrl } from '../services/api/tmdb';
import { theme } from '../styles/theme';
import Card from './Card';
import StreamingBadges from './StreamingBadges';
import { useShimmer } from '../hooks/useAnimations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.57;

interface MovieCardProps {
  movie: Movie;
  variant?: 'swipe' | 'list' | 'grid';
  loading?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, variant = 'swipe', loading = false }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const shimmerStyle = useShimmer();

  if (variant === 'swipe') {
    // Calculer le niveau de popularité avec couleurs vives
    const getPopularityLevel = (popularity: number) => {
      if (popularity > 500) return { text: '🔥 TRÈS POPULAIRE', color: '#FF3B30' }; // Rouge vif
      if (popularity > 200) return { text: '⭐ POPULAIRE', color: '#FF9500' }; // Orange vif
      if (popularity > 100) return { text: '👍 TENDANCE', color: '#007AFF' }; // Bleu vif
      return { text: '🎬 DÉCOUVERTE', color: '#5856D6' }; // Violet vif
    };

    const popularityInfo = getPopularityLevel(movie.popularity);

    return (
      <Card style={styles.swipeCard} noPadding variant="default">
        <View style={styles.posterContainer}>
          {posterUrl && (
            <>
              <Image
                source={{ uri: posterUrl }}
                style={styles.swipePoster}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              {imageLoading && (
                <View style={styles.imageLoadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              )}
            </>
          )}
        </View>
        {/* Badge de popularité */}
        <View
          style={[
            styles.popularityBadge,
            { backgroundColor: popularityInfo.color },
          ]}
        >
          <Text style={styles.popularityText}>{popularityInfo.text}</Text>
        </View>
        <View style={styles.swipeContent}>
          <Text style={styles.swipeTitle} numberOfLines={2}>
            {movie.title}
          </Text>
          <View style={styles.swipeInfo}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {movie.vote_average.toFixed(1)}</Text>
            </View>
            <Text style={styles.year}>
              {new Date(movie.release_date).getFullYear()}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <Card style={styles.listCard} variant="outlined" noPadding>
        <View style={styles.listContent}>
          <View style={styles.listPosterContainer}>
            {posterUrl && (
              <>
                <Image
                  source={{ uri: posterUrl }}
                  style={styles.listPoster}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
                {imageLoading && (
                  <View style={styles.listImageLoadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  </View>
                )}
              </>
            )}
          </View>
          <View style={styles.listInfo}>
            <Text style={styles.listTitle} numberOfLines={2}>
              {movie.title}
            </Text>
            <Text style={styles.listYear}>
              {new Date(movie.release_date).getFullYear()}
            </Text>
            <View style={styles.listRating}>
              <Text style={styles.listRatingText}>
                ⭐ {movie.vote_average.toFixed(1)}
              </Text>
            </View>
            <View style={styles.streamingContainer}>
              <StreamingBadges movieId={movie.id} />
            </View>
          </View>
        </View>
      </Card>
    );
  }

  // Grid variant
  return (
    <Card style={styles.gridCard} noPadding variant="outlined">
      <View style={styles.gridPosterContainer}>
        {posterUrl && (
          <>
            <Image
              source={{ uri: posterUrl }}
              style={styles.gridPoster}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.gridImageLoadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.gridRating}>⭐ {movie.vote_average.toFixed(1)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Swipe Card Styles
  swipeCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  posterContainer: {
    width: '100%',
    height: '73%',
    position: 'relative',
  },
  swipePoster: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  imageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  swipeContent: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  swipeTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  swipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.card,
  },
  year: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  overview: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
    color: theme.colors.text,
  },
  popularityBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    zIndex: 1,
  },
  popularityText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '900',
    color: theme.colors.card,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // List Card Styles
  listCard: {
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
  },
  listContent: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
  },
  listPosterContainer: {
    position: 'relative',
  },
  listPoster: {
    width: 80,
    height: 120,
    borderRadius: theme.borderRadius.xl,
  },
  listImageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
  },
  listInfo: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  listYear: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  listRating: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
  },
  listRatingText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.card,
  },
  streamingContainer: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // Grid Card Styles
  gridCard: {
    width: (SCREEN_WIDTH - theme.spacing.lg * 3) / 2,
    marginBottom: theme.spacing.md,
  },
  gridPosterContainer: {
    position: 'relative',
  },
  gridPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  gridImageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  gridContent: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  gridTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  gridRating: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});

export default MovieCard;