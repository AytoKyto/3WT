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
import useSeriesStore from '../store/useSeriesStore';
import { TVShow, TVShowDetails } from '../types/tv';
import { tvService, getImageUrl } from '../services/api/tmdb';

interface CreditRow {
  name: string;
  role: string;
}

const SeriesDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const show: TVShow = route.params.show;

  const [seasonsInfo, setSeasonsInfo] = useState<{ seasons: number; episodes: number } | null>(null);
  const [credits, setCredits] = useState<CreditRow[]>([]);

  const {
    isInWatchlist,
    isSuperLiked,
    isWatched,
    addToWatchlist,
    removeFromWatchlist,
    removeFromSuperLiked,
    markAsWatched,
  } = useSeriesStore();

  const inWatchlist = isInWatchlist(show.id);
  const watched = isWatched(show.id);

  useEffect(() => {
    let cancelled = false;

    tvService.getDetails(show.id).then((details: TVShowDetails) => {
      if (cancelled) return;
      setSeasonsInfo({ seasons: details.number_of_seasons, episodes: details.number_of_episodes });
      const rows: CreditRow[] = (details.created_by || []).map((c) => ({ name: c.name, role: 'CRÉATION' }));
      setCredits((prev) => [...rows, ...prev.filter((r) => r.role !== 'CRÉATION')]);
    }).catch(() => {});

    tvService.getCredits(show.id).then((data: any) => {
      if (cancelled) return;
      const castRows: CreditRow[] = (data.cast || []).slice(0, 3).map((c: any) => ({
        name: c.name,
        role: c.character ? c.character.toUpperCase() : 'ACTEUR',
      }));
      setCredits((prev) => [...prev.filter((r) => r.role === 'CRÉATION'), ...castRows]);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [show.id]);

  const posterUrl = getImageUrl(show.poster_path, 'w500');

  const handleRemove = () => {
    if (isSuperLiked(show.id)) removeFromSuperLiked(show.id);
    removeFromWatchlist(show.id);
    navigation.goBack();
  };

  const handleAdd = () => {
    addToWatchlist(show);
  };

  const handleMarkTonight = () => {
    markAsWatched(show);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.topBarText}>← RETOUR</Text>
        </TouchableOpacity>
        <Text style={styles.topBarText}>FICHE {show.id}</Text>
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
            <Text style={styles.titleOverlayText}>{show.name.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>NOTE</Text>
            <Text style={styles.statValue}>{show.vote_average.toFixed(1)}</Text>
          </View>
          <View style={[styles.statCell, styles.statCellBordered]}>
            <Text style={styles.statLabel}>SAISONS</Text>
            <Text style={styles.statValue}>{seasonsInfo ? seasonsInfo.seasons : '—'}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>ANNÉE</Text>
            <Text style={styles.statValue}>
              {show.first_air_date ? new Date(show.first_air_date).getFullYear() : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.overviewBlock}>
          <Text style={styles.overviewText}>{show.overview || 'Pas de synopsis disponible.'}</Text>
          {seasonsInfo && (
            <Text style={styles.episodesHint}>
              {seasonsInfo.episodes} ÉPISODE{seasonsInfo.episodes > 1 ? 'S' : ''} AU TOTAL
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISPONIBLE CHEZ VOUS</Text>
          <StreamingBadges movieId={show.id} dark mediaType="tv" />
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
  episodesHint: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginTop: theme.spacing.sm,
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

export default SeriesDetailScreen;
