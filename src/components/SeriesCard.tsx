import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { TVShow } from '../types/tv';
import { getImageUrl } from '../services/api/tmdb';
import { theme } from '../styles/theme';
import Card from './Card';
import StreamingBadges from './StreamingBadges';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.57;

interface SeriesCardProps {
  show: TVShow;
  variant?: 'swipe' | 'list' | 'grid';
  loading?: boolean;
}

const formatVoteCount = (count: number) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K VOTES`;
  return `${count} VOTES`;
};

const SeriesCard: React.FC<SeriesCardProps> = ({ show, variant = 'swipe', loading = false }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const posterUrl = getImageUrl(show.poster_path, 'w500');

  if (variant === 'swipe') {
    return (
      <Card style={styles.swipeCard} noPadding variant="default">
        <View style={styles.posterContainer}>
          {posterUrl ? (
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
                  <ActivityIndicator size="large" color={theme.colors.ink} />
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderPoster}>
              <Text style={styles.placeholderText}>AFFICHE / TMDB</Text>
            </View>
          )}
          <View style={styles.cornerTag}>
            <Text style={styles.cornerTagText}>N°{String(show.id).slice(-2)} · SÉRIE</Text>
          </View>
        </View>

        <View style={styles.swipeContent}>
          <Text style={styles.swipeTitle} numberOfLines={1}>
            {show.name.toUpperCase()}
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>
                {show.first_air_date ? new Date(show.first_air_date).getFullYear() : '—'}
              </Text>
            </View>
            <View style={[styles.statCell, styles.statCellBordered]}>
              <Text style={styles.statValue}>{show.vote_average.toFixed(1)}/10</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{formatVoteCount(show.vote_count)}</Text>
            </View>
          </View>

          <View style={styles.badgesRow}>
            <StreamingBadges movieId={show.id} variant="small" mediaType="tv" />
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
            {posterUrl ? (
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
                    <ActivityIndicator size="small" color={theme.colors.ink} />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.listPlaceholder} />
            )}
          </View>
          <View style={styles.listInfo}>
            <Text style={styles.listTitle} numberOfLines={2}>
              {show.name.toUpperCase()}
            </Text>
            <Text style={styles.listYear}>
              {show.first_air_date ? new Date(show.first_air_date).getFullYear() : '—'} · {show.vote_average.toFixed(1)}/10
            </Text>
            <View style={styles.streamingContainer}>
              <StreamingBadges movieId={show.id} mediaType="tv" />
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
        {posterUrl ? (
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
                <ActivityIndicator size="small" color={theme.colors.ink} />
              </View>
            )}
          </>
        ) : (
          <View style={styles.listPlaceholder} />
        )}
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {show.name.toUpperCase()}
        </Text>
        <Text style={styles.gridRating}>{show.vote_average.toFixed(1)}/10</Text>
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
    height: '56%',
    position: 'relative',
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  swipePoster: {
    width: '100%',
    height: '100%',
  },
  placeholderPoster: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.placeholderA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: theme.typography.letterSpacing.mono,
    color: theme.colors.textMuted,
  },
  imageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.placeholderA,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  cornerTagText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 11,
    letterSpacing: theme.typography.letterSpacing.wide,
    color: theme.colors.yellow,
  },
  swipeContent: {
    flex: 1,
    padding: theme.spacing.sm + 4,
    backgroundColor: theme.colors.white,
    justifyContent: 'space-between',
  },
  swipeTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 21,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    letterSpacing: theme.typography.letterSpacing.tight,
    lineHeight: 22,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    borderTopWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  statCell: {
    flex: 1,
    paddingVertical: 6,
  },
  statCellBordered: {
    borderLeftWidth: theme.borders.thick,
    borderRightWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    paddingLeft: theme.spacing.sm,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.ink,
  },
  badgesRow: {
    marginTop: theme.spacing.sm,
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
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  listPoster: {
    width: 80,
    height: 120,
  },
  listPlaceholder: {
    width: 80,
    height: 120,
    backgroundColor: theme.colors.placeholderA,
  },
  listImageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  listTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    marginBottom: theme.spacing.xs,
  },
  listYear: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  streamingContainer: {
    marginTop: theme.spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Grid Card Styles
  gridCard: {
    width: (SCREEN_WIDTH - theme.spacing.lg * 3) / 2,
    marginBottom: theme.spacing.md,
  },
  gridPosterContainer: {
    position: 'relative',
    borderBottomWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  gridPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  gridImageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  gridTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    marginBottom: theme.spacing.xs,
  },
  gridRating: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default SeriesCard;
