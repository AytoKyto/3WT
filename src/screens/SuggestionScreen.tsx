import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Reanimated from 'react-native-reanimated';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import AnimatedTouchable from '../components/AnimatedTouchable';
import MediaTypeToggle, { MediaType } from '../components/MediaTypeToggle';
import { PROVIDER_NAMES } from '../components/StreamingBadges';
import useMovieStore from '../store/useMovieStore';
import useSeriesStore from '../store/useSeriesStore';
import { Movie, MovieDetails, Genre } from '../types/movie';
import { TVShow, TVShowDetails } from '../types/tv';
import { STREAMING_SERVICES } from '../types/streaming';
import { movieService, tvService, getImageUrl } from '../services/api/tmdb';
import { useFadeIn, useSlideIn } from '../hooks/useAnimations';
import { getDisplayTitle, getDisplayYear } from '../utils/media';

type Item = Movie | TVShow;

const formatFinishTime = (runtimeMinutes: number): string => {
  const end = new Date(Date.now() + runtimeMinutes * 60 * 1000);
  const h = String(end.getHours()).padStart(2, '0');
  const m = String(end.getMinutes()).padStart(2, '0');
  return `${h}H${m}`;
};

const formatDaysSince = (timestamp: number): string => {
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
  return `${days} J`;
};

const MAX_REFUSALS = 3;

const SuggestionScreen = () => {
  const route = useRoute<any>();
  const [mediaType, setMediaType] = useState<MediaType>(route.params?.mediaType === 'tv' ? 'tv' : 'movie');
  const [suggestedItem, setSuggestedItem] = useState<Item | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [refusalCount, setRefusalCount] = useState(0);
  const [drawNumber, setDrawNumber] = useState(0);
  const [runtime, setRuntime] = useState<number | null>(null);
  const [seasonsInfo, setSeasonsInfo] = useState<{ seasons: number; episodes: number } | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<Set<number>>(new Set());
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<Set<number>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const movieStore = useMovieStore();
  const seriesStore = useSeriesStore();

  const watchlist: Item[] = mediaType === 'tv' ? seriesStore.watchlist : movieStore.watchlist;
  const isSuperLiked = mediaType === 'tv' ? seriesStore.isSuperLiked : movieStore.isSuperLiked;
  const watchlistAddedAt = mediaType === 'tv' ? seriesStore.watchlistAddedAt : movieStore.watchlistAddedAt;
  const markAsWatched = (item: Item) =>
    mediaType === 'tv' ? seriesStore.markAsWatched(item as TVShow) : movieStore.markAsWatched(item as Movie);
  const addToWatchlist = (item: Item) =>
    mediaType === 'tv' ? seriesStore.addToWatchlist(item as TVShow) : movieStore.addToWatchlist(item as Movie);
  const addToSuperLiked = (item: Item) =>
    mediaType === 'tv' ? seriesStore.addToSuperLiked(item as TVShow) : movieStore.addToSuperLiked(item as Movie);

  const handleMediaTypeChange = (next: MediaType) => {
    if (next === mediaType) return;
    setMediaType(next);
    setSuggestedItem(null);
    setNoMatch(false);
    setRefusalCount(0);
    setSelectedGenreIds(new Set());
    setSelectedPlatformIds(new Set());
    setFiltersOpen(false);
  };

  useEffect(() => {
    const svc = mediaType === 'tv' ? tvService : movieService;
    svc.getGenres().then(setGenres).catch(() => {});
  }, [mediaType]);

  useEffect(() => {
    if (!suggestedItem) {
      setRuntime(null);
      setSeasonsInfo(null);
      setProviderName(null);
      return;
    }
    let cancelled = false;

    if (mediaType === 'tv') {
      tvService.getDetails(suggestedItem.id).then((details: TVShowDetails) => {
        if (cancelled) return;
        setRuntime(details.episode_run_time?.[0] || null);
        setSeasonsInfo({ seasons: details.number_of_seasons, episodes: details.number_of_episodes });
      }).catch(() => {});
      tvService.getWatchProviders(suggestedItem.id).then((providers) => {
        if (cancelled) return;
        const list = providers?.flatrate || providers?.rent || providers?.buy;
        const first = list?.[0];
        setProviderName(first ? PROVIDER_NAMES[first.provider_id] || null : null);
      }).catch(() => {});
    } else {
      movieService.getDetails(suggestedItem.id).then((details: MovieDetails) => {
        if (!cancelled) setRuntime(details.runtime || null);
      }).catch(() => {});
      setSeasonsInfo(null);
      movieService.getWatchProviders(suggestedItem.id).then((providers) => {
        if (cancelled) return;
        const list = providers?.flatrate || providers?.rent || providers?.buy;
        const first = list?.[0];
        setProviderName(first ? PROVIDER_NAMES[first.provider_id] || null : null);
      }).catch(() => {});
    }

    return () => { cancelled = true; };
  }, [suggestedItem, mediaType]);

  const toggleGenre = (id: number) => {
    setNoMatch(false);
    setSelectedGenreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePlatform = (providerId: number) => {
    setNoMatch(false);
    setSelectedPlatformIds((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) next.delete(providerId); else next.add(providerId);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedGenreIds(new Set());
    setSelectedPlatformIds(new Set());
    setNoMatch(false);
  };

  const activeFilterCount = selectedGenreIds.size + selectedPlatformIds.size;

  const handleSuggest = async () => {
    if (watchlist.length === 0) return;

    setNoMatch(false);
    setIsSpinning(true);
    setSuggestedItem(null);

    let candidates = watchlist.filter(
      (m) => selectedGenreIds.size === 0 || m.genre_ids.some((g) => selectedGenreIds.has(g))
    );

    if (selectedPlatformIds.size > 0) {
      setCheckingAvailability(true);
      const providerSvc = mediaType === 'tv' ? tvService : movieService;
      const checked = await Promise.all(
        candidates.map(async (m) => {
          try {
            const providers = await providerSvc.getWatchProviders(m.id);
            const ids: number[] = [
              ...(providers?.flatrate || []),
              ...(providers?.rent || []),
              ...(providers?.buy || []),
            ].map((p: any) => p.provider_id);
            return ids.some((id) => selectedPlatformIds.has(id)) ? m : null;
          } catch {
            return null;
          }
        })
      );
      candidates = checked.filter((m): m is Item => m !== null);
      setCheckingAvailability(false);
    }

    const weighted = [
      ...candidates,
      ...candidates.filter((m) => isSuperLiked(m.id)),
      ...candidates.filter((m) => isSuperLiked(m.id)),
    ];

    setTimeout(() => {
      if (weighted.length === 0) {
        setNoMatch(true);
        setIsSpinning(false);
        return;
      }

      const item = weighted[Math.floor(Math.random() * weighted.length)];
      setSuggestedItem(item);
      setDrawNumber((n) => n + 1);
      setIsSpinning(false);
    }, 1400);
  };

  const handleAccept = () => {
    if (suggestedItem) {
      markAsWatched(suggestedItem);
      setSuggestedItem(null);
      setRefusalCount(0);
    }
  };

  const handleReroll = () => {
    setRefusalCount((n) => n + 1);
    handleSuggest();
  };

  const addDemoItems = async () => {
    try {
      if (mediaType === 'tv') {
        const popularShows = await tvService.getPopular(1);
        const topShows: TVShow[] = popularShows.results.slice(0, 10);
        topShows.forEach((show, index) => {
          if (index < 3) seriesStore.addToSuperLiked(show);
          else seriesStore.addToWatchlist(show);
        });
      } else {
        const popularMovies = await movieService.getPopular(1);
        const topMovies: Movie[] = popularMovies.results.slice(0, 10);
        topMovies.forEach((movie, index) => {
          if (index < 3) movieStore.addToSuperLiked(movie);
          else movieStore.addToWatchlist(movie);
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les éléments de démo. Vérifiez votre connexion.', [{ text: 'OK' }]);
    }
  };

  const addedAt = suggestedItem ? watchlistAddedAt[suggestedItem.id] : undefined;
  const remainingRefusals = Math.max(MAX_REFUSALS - refusalCount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>TIRAGE {String(drawNumber).padStart(2, '0')}</Text>
        <Text style={styles.topBarText}>IRRÉVOCABLE</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {suggestedItem ? 'LE SORT\nA TRANCHÉ' : 'LANCER\nLE SORT'}
          </Text>
          <Text style={styles.subtitle}>
            {suggestedItem
              ? `PIOCHÉ PARMI ${watchlist.length} TITRES DE VOTRE LISTE`
              : `${watchlist.length} TITRE${watchlist.length > 1 ? 'S' : ''} DANS VOTRE LISTE`}
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />
        </View>

        {watchlist.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>VOTRE LISTE EST VIDE</Text>
            <Text style={styles.emptyText}>
              {mediaType === 'tv'
                ? 'Swipez des séries pour pouvoir tirer au sort — ou ajoutez des séries de démo pour tester.'
                : 'Swipez des films pour pouvoir tirer au sort — ou ajoutez des films de démo pour tester.'}
            </Text>
            <Button
              title={mediaType === 'tv' ? 'Ajouter des séries de démo' : 'Ajouter des films de démo'}
              onPress={addDemoItems}
              variant="outline"
              size="medium"
            />
          </View>
        ) : !suggestedItem ? (
          <View style={styles.drawContainer}>
            <AnimatedTouchable
              style={styles.filterToggle}
              onPress={() => setFiltersOpen((o) => !o)}
            >
              <Text style={styles.filterToggleText}>
                FILTRER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
              <Text style={styles.filterToggleArrow}>{filtersOpen ? '▲' : '▼'}</Text>
            </AnimatedTouchable>

            {filtersOpen && (
              <View style={styles.filterPanel}>
                <Text style={styles.filterSectionLabel}>GENRE</Text>
                <View style={styles.chipRow}>
                  {genres.map((g) => (
                    <TouchableOpacity key={g.id} onPress={() => toggleGenre(g.id)} activeOpacity={0.8}>
                      <View style={[styles.chip, selectedGenreIds.has(g.id) && styles.chipActive]}>
                        <Text style={[styles.chipText, selectedGenreIds.has(g.id) && styles.chipTextActive]}>
                          {g.name.toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.filterSectionLabel, styles.filterSectionLabelSpaced]}>PLATEFORME</Text>
                <View style={styles.chipRow}>
                  {STREAMING_SERVICES.map((s) => (
                    <TouchableOpacity key={s.id} onPress={() => togglePlatform(s.providerId)} activeOpacity={0.8}>
                      <View style={[styles.chip, selectedPlatformIds.has(s.providerId) && styles.chipActive]}>
                        <Text style={[styles.chipText, selectedPlatformIds.has(s.providerId) && styles.chipTextActive]}>
                          {s.name.toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {activeFilterCount > 0 && (
                  <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
                    <Text style={styles.filterClear}>✕ RÉINITIALISER LES FILTRES</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <AnimatedTouchable
              style={[styles.acceptBar, isSpinning && styles.acceptBarDisabled]}
              onPress={handleSuggest}
              disabled={isSpinning}
            >
              <View>
                <Text style={styles.acceptBarTitle}>
                  {checkingAvailability ? 'VÉRIFICATION…' : isSpinning ? 'ÇA TOURNE…' : 'LANCER LE SORT'}
                </Text>
                <Text style={styles.acceptBarSubtitle}>
                  {activeFilterCount > 0
                    ? `${activeFilterCount} FILTRE${activeFilterCount > 1 ? 'S' : ''} ACTIF${activeFilterCount > 1 ? 'S' : ''}`
                    : 'TIRAGE ALÉATOIRE DANS VOTRE LISTE'}
                </Text>
              </View>
              <View style={styles.acceptBarIcon}>
                <Text style={styles.acceptBarIconText}>▶</Text>
              </View>
            </AnimatedTouchable>

            {noMatch && (
              <View style={styles.noMatchBlock}>
                <Text style={styles.noMatchText}>
                  {mediaType === 'tv'
                    ? "AUCUNE SÉRIE NE CORRESPOND À CES FILTRES — essayez d'en retirer."
                    : "AUCUN FILM NE CORRESPOND À CES FILTRES — essayez d'en retirer."}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <SuggestionReveal
            key={drawNumber}
            item={suggestedItem}
            mediaType={mediaType}
            runtime={runtime}
            seasonsInfo={seasonsInfo}
            providerName={providerName}
            addedAt={addedAt}
            refusalCount={refusalCount}
            remainingRefusals={remainingRefusals}
            onAccept={handleAccept}
            onReroll={handleReroll}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

interface SuggestionRevealProps {
  item: Item;
  mediaType: MediaType;
  runtime: number | null;
  seasonsInfo: { seasons: number; episodes: number } | null;
  providerName: string | null;
  addedAt: number | undefined;
  refusalCount: number;
  remainingRefusals: number;
  onAccept: () => void;
  onReroll: () => void;
}

// Petit fondu + glissement à l'apparition du tirage — remonté à chaque
// nouveau tirage grâce à la key={drawNumber} posée par le parent.
const SuggestionReveal: React.FC<SuggestionRevealProps> = ({
  item,
  mediaType,
  runtime,
  seasonsInfo,
  providerName,
  addedAt,
  refusalCount,
  remainingRefusals,
  onAccept,
  onReroll,
}) => {
  const fadeStyle = useFadeIn(theme.animation.duration.normal);
  const slideStyle = useSlideIn('bottom', 24, theme.animation.duration.normal);

  return (
    <Reanimated.View style={[styles.resultWrap, fadeStyle, slideStyle]}>
      <View style={styles.resultCard}>
        <View style={styles.resultPosterWrap}>
          {item.poster_path ? (
            <Image
              source={{ uri: getImageUrl(item.poster_path, 'w500') || '' }}
              style={styles.resultPoster}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.resultPosterPlaceholder} />
          )}
          <View style={styles.providerTag}>
            <Text style={styles.providerTagText}>
              {providerName || 'NON DISPONIBLE'}
            </Text>
          </View>
        </View>
        <View style={styles.resultCaption}>
          <Text style={styles.resultMovieTitle} numberOfLines={2}>
            {getDisplayTitle(item).toUpperCase()}
          </Text>
          <Text style={styles.resultMeta}>
            {getDisplayYear(item)}
            {'  ·  '}
            {mediaType === 'tv'
              ? (seasonsInfo ? `${seasonsInfo.seasons} SAISON${seasonsInfo.seasons > 1 ? 'S' : ''} · ${seasonsInfo.episodes} ÉP.` : '…')
              : (runtime ? `${Math.floor(runtime / 60)}H${String(runtime % 60).padStart(2, '0')}` : '…')}
            {'  ·  '}
            {item.vote_average.toFixed(1)}/10
          </Text>
        </View>
      </View>

      <View style={styles.overviewBlock}>
        <Text style={styles.overviewText} numberOfLines={4}>
          {item.overview || 'Pas de synopsis disponible.'}
        </Text>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>{mediaType === 'tv' ? '1ER ÉP. FINIT À' : 'FINIT À'}</Text>
          <Text style={styles.statValue}>{runtime ? formatFinishTime(runtime) : '…'}</Text>
        </View>
        <View style={[styles.statCell, styles.statCellBordered]}>
          <Text style={styles.statLabel}>EN LISTE DEPUIS</Text>
          <Text style={styles.statValue}>{addedAt ? formatDaysSince(addedAt) : '—'}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>REFUS</Text>
          <Text style={styles.statValue}>{refusalCount} / {MAX_REFUSALS}</Text>
        </View>
      </View>

      <AnimatedTouchable style={styles.acceptBarAttached} onPress={onAccept}>
        <View>
          <Text style={styles.acceptBarTitle}>ON REGARDE ÇA</Text>
          <Text style={styles.acceptBarSubtitle}>MARQUER COMME VU CE SOIR</Text>
        </View>
        <View style={styles.acceptBarIcon}>
          <Text style={styles.acceptBarIconText}>▶</Text>
        </View>
      </AnimatedTouchable>
      <AnimatedTouchable style={styles.rerollBar} onPress={onReroll}>
        <Text style={styles.rerollBarText}>
          RETIRER — IL RESTE {remainingRefusals} REFUS
        </Text>
      </AnimatedTouchable>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.yellow,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    height: 40,
    backgroundColor: theme.colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  topBarText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    letterSpacing: theme.typography.letterSpacing.mono,
    color: theme.colors.yellow,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  toggleRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 40,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    letterSpacing: -1.5,
    lineHeight: 36,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  emptyBlock: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 22,
    color: theme.colors.ink,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  drawContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  filterToggle: {
    width: '100%',
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  filterToggleText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 15,
    color: theme.colors.ink,
    letterSpacing: -0.2,
  },
  filterToggleArrow: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 12,
    color: theme.colors.ink,
  },
  filterPanel: {
    width: '100%',
    borderWidth: theme.borders.thick,
    borderTopWidth: 0,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginTop: -theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  filterSectionLabel: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginBottom: theme.spacing.sm,
  },
  filterSectionLabelSpaced: {
    marginTop: theme.spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.ink,
  },
  chipText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.ink,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  chipTextActive: {
    color: theme.colors.yellow,
  },
  filterClear: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  noMatchBlock: {
    marginTop: theme.spacing.lg,
    width: '100%',
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
  },
  noMatchText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.ink,
    textAlign: 'center',
    lineHeight: 17,
  },
  resultWrap: {
    padding: theme.spacing.lg,
  },
  resultCard: {
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
    overflow: 'hidden',
  },
  resultPosterWrap: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  resultPoster: {
    ...StyleSheet.absoluteFillObject,
  },
  resultPosterPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2a2a2a',
  },
  resultCaption: {
    padding: theme.spacing.md,
    borderTopWidth: theme.borders.thick,
    borderTopColor: theme.colors.ink,
  },
  resultMovieTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 24,
    color: theme.colors.yellow,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  resultMeta: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textFaint,
    marginTop: theme.spacing.sm,
    lineHeight: 16,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  providerTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: theme.colors.ink,
    borderRightWidth: theme.borders.medium,
    borderBottomWidth: theme.borders.medium,
    borderColor: theme.colors.yellow,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  providerTagText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.yellow,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  overviewBlock: {
    borderWidth: theme.borders.thick,
    borderTopWidth: 0,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.paper,
    padding: theme.spacing.md,
  },
  overviewText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 12,
    lineHeight: 19,
    color: theme.colors.ink,
  },
  statRow: {
    flexDirection: 'row',
    borderWidth: theme.borders.thick,
    borderTopWidth: 0,
    borderColor: theme.colors.ink,
  },
  statCell: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.paper,
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
    fontSize: 20,
    color: theme.colors.ink,
    marginTop: 2,
  },
  acceptBar: {
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing.md,
  },
  acceptBarDisabled: {
    opacity: theme.opacity.subtle,
  },
  acceptBarAttached: {
    borderWidth: theme.borders.thick,
    borderTopWidth: 0,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  acceptBarTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 22,
    color: theme.colors.yellow,
    letterSpacing: -0.5,
  },
  acceptBarSubtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.textFaint,
    marginTop: 4,
  },
  acceptBarIcon: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBarIconText: {
    color: theme.colors.ink,
    fontSize: 16,
  },
  rerollBar: {
    borderWidth: theme.borders.thick,
    borderTopWidth: 0,
    borderColor: theme.colors.ink,
    padding: theme.spacing.md + 3,
    alignItems: 'center',
    backgroundColor: theme.colors.paper,
  },
  rerollBarText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 16,
    color: theme.colors.ink,
    letterSpacing: -0.2,
  },
});

export default SuggestionScreen;
