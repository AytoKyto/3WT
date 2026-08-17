import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../styles/theme';
import StreamingBadges from '../components/StreamingBadges';
import AnimatedTouchable from '../components/AnimatedTouchable';
import useMovieStore from '../store/useMovieStore';
import { Movie, MovieDetails } from '../types/movie';
import { movieService, getImageUrl } from '../services/api/tmdb';

interface CreditRow {
  name: string;
  role: string;
}

const MovieDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const movie: Movie = route.params.movie;

  const [runtime, setRuntime] = useState<number | null>(null);
  const [credits, setCredits] = useState<CreditRow[]>([]);

  const {
    isInWatchlist,
    isSuperLiked,
    isWatched,
    addToWatchlist,
    removeFromWatchlist,
    removeFromSuperLiked,
    markAsWatched,
  } = useMovieStore();

  const inWatchlist = isInWatchlist(movie.id);
  const watched = isWatched(movie.id);

  useEffect(() => {
    let cancelled = false;

    movieService.getDetails(movie.id).then((details: MovieDetails) => {
      if (!cancelled) setRuntime(details.runtime || null);
    }).catch(() => {});

    movieService.getCredits(movie.id).then((data: any) => {
      if (cancelled) return;
      const director = (data.crew || []).find((c: any) => c.job === 'Director');
      const rows: CreditRow[] = [];
      if (director) rows.push({ name: director.name, role: 'RÉALISATION' });
      (data.cast || []).slice(0, 3).forEach((c: any) => {
        rows.push({ name: c.name, role: c.character ? c.character.toUpperCase() : 'ACTEUR' });
      });
      setCredits(rows);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [movie.id]);

  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  const handleRemove = () => {
    if (isSuperLiked(movie.id)) removeFromSuperLiked(movie.id);
    removeFromWatchlist(movie.id);
    navigation.goBack();
  };

  const handleAdd = () => {
    addToWatchlist(movie);
  };

  const handleMarkTonight = () => {
    markAsWatched(movie);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.topBarText}>← RETOUR</Text>
        </TouchableOpacity>
        <Text style={styles.topBarText}>FICHE {movie.id}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.posterBlock}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.posterImage} resizeMode="cover" />
          ) : (
            <View style={styles.posterPlaceholder} />
          )}
          {inWatchlist && (
            <View style={styles.cornerTag}>
              <Text style={styles.cornerTagText}>DANS VOTRE LISTE</Text>
            </View>
          )}
          <View style={styles.titleOverlay}>
            <Text style={styles.titleOverlayText}>{movie.title.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>NOTE</Text>
            <Text style={styles.statValue}>{movie.vote_average.toFixed(1)}</Text>
          </View>
          <View style={[styles.statCell, styles.statCellBordered]}>
            <Text style={styles.statLabel}>DURÉE</Text>
            <Text style={styles.statValue}>{runtime ? `${Math.floor(runtime / 60)}H${String(runtime % 60).padStart(2, '0')}` : '—'}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>ANNÉE</Text>
            <Text style={styles.statValue}>
              {movie.release_date ? new Date(movie.release_date).getFullYear() : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.overviewBlock}>
          <Text style={styles.overviewText}>{movie.overview || 'Pas de synopsis disponible.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISPONIBLE CHEZ VOUS</Text>
          <StreamingBadges movieId={movie.id} dark />
        </View>

        {credits.length > 0 && (
          <View style={[styles.section, styles.creditsSection]}>
            <Text style={styles.sectionLabel}>AU GÉNÉRIQUE</Text>
            <View style={styles.creditsList}>
              {credits.map((c, i) => (
                <View key={`${c.name}-${i}`} style={styles.creditRow}>
                  <Text style={styles.creditName} numberOfLines={1}>{c.name.toUpperCase()}</Text>
                  <Text style={styles.creditRole} numberOfLines={1}>{c.role}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <AnimatedTouchable
          style={styles.actionSecondary}
          onPress={inWatchlist ? handleRemove : handleAdd}
        >
          <Text style={styles.actionSecondaryText}>
            {inWatchlist ? 'RETIRER' : 'AJOUTER À LA LISTE'}
          </Text>
        </AnimatedTouchable>
        <AnimatedTouchable
          style={[styles.actionPrimary, watched && styles.actionPrimaryDisabled]}
          onPress={handleMarkTonight}
          disabled={watched}
        >
          <Text style={styles.actionPrimaryText}>
            {watched ? 'DÉJÀ VU' : 'MARQUER CE SOIR'}
          </Text>
        </AnimatedTouchable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.yellow,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  topBarText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: theme.colors.ink,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  posterBlock: {
    height: 280,
    backgroundColor: theme.colors.placeholderA,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  posterImage: {
    ...StyleSheet.absoluteFillObject,
  },
  posterPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.placeholderA,
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
    fontSize: 10,
    color: theme.colors.yellow,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  titleOverlay: {
    backgroundColor: theme.colors.ink,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxWidth: '85%',
  },
  titleOverlayText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 26,
    color: theme.colors.yellow,
    letterSpacing: -0.5,
    lineHeight: 27,
  },
  statRow: {
    flexDirection: 'row',
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  statCell: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statCellBordered: {
    borderLeftWidth: theme.borders.thick,
    borderRightWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 22,
    color: theme.colors.ink,
    marginTop: 2,
  },
  overviewBlock: {
    padding: theme.spacing.lg,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  overviewText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.ink,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginBottom: theme.spacing.sm,
  },
  creditsSection: {
    borderBottomWidth: 0,
    paddingBottom: theme.spacing.xl,
  },
  creditsList: {
    borderTopWidth: theme.borders.medium,
    borderTopColor: theme.colors.ink,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 1,
    borderBottomWidth: theme.borders.medium,
    borderBottomColor: theme.colors.ink,
    gap: theme.spacing.sm,
  },
  creditName: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 14,
    color: theme.colors.ink,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  creditRole: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  actionBar: {
    flexDirection: 'row',
    borderTopWidth: theme.borders.thick,
    borderTopColor: theme.colors.ink,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: theme.colors.paper,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    borderRightWidth: theme.borders.thick,
    borderRightColor: theme.colors.ink,
  },
  actionSecondaryText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 15,
    color: theme.colors.ink,
    letterSpacing: -0.3,
  },
  actionPrimary: {
    flex: 1.4,
    backgroundColor: theme.colors.ink,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  actionPrimaryDisabled: {
    opacity: theme.opacity.disabled,
  },
  actionPrimaryText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 15,
    color: theme.colors.yellow,
    letterSpacing: -0.3,
  },
});

export default MovieDetailScreen;
