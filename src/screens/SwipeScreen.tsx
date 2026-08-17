import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Animated from 'react-native-reanimated';
import Swiper from 'react-native-deck-swiper';
import { theme } from '../styles/theme';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import Logo from '../components/Logo';
import MediaTypeToggle, { MediaType } from '../components/MediaTypeToggle';
import { Movie } from '../types/movie';
import { TVShow } from '../types/tv';
import { movieService, tvService, getImageUrl } from '../services/api/tmdb';
import useMovieStore from '../store/useMovieStore';
import useSeriesStore from '../store/useSeriesStore';
import useStreamingStore from '../store/useStreamingStore';
import { useFadeIn, useSlideIn } from '../hooks/useAnimations';
import AnimatedTouchable from '../components/AnimatedTouchable';

type Item = Movie | TVShow;

const MOVIE_CATEGORIES = ['popular', 'top_rated', 'upcoming'];
const TV_CATEGORIES = ['popular', 'top_rated', 'on_the_air'];

const CATEGORY_LABEL: Record<string, string> = {
  popular: 'POPULAIRES',
  top_rated: 'MIEUX NOTÉS',
  upcoming: 'À VENIR',
  on_the_air: 'EN COURS',
};

const SwipeScreen = () => {
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const swiperRef = useRef<Swiper<Item>>(null);
  const prefetchedIds = useRef<Set<number>>(new Set());

  const movieStore = useMovieStore();
  const seriesStore = useSeriesStore();
  const { showAllMovies } = useStreamingStore();

  const headerFade = useFadeIn(500);
  const headerSlide = useSlideIn('top', 20, 500);

  const categories = mediaType === 'tv' ? TV_CATEGORIES : MOVIE_CATEGORIES;
  const category = categories[categoryIndex];

  const hasBeenSwiped = (id: number) =>
    mediaType === 'tv' ? seriesStore.hasBeenSwiped(id) : movieStore.hasBeenSwiped(id);
  const addToSwiped = (id: number) =>
    mediaType === 'tv' ? seriesStore.addToSwiped(id) : movieStore.addToSwiped(id);
  const addToWatchlist = (item: Item) =>
    mediaType === 'tv' ? seriesStore.addToWatchlist(item as TVShow) : movieStore.addToWatchlist(item as Movie);
  const addToSuperLiked = (item: Item) =>
    mediaType === 'tv' ? seriesStore.addToSuperLiked(item as TVShow) : movieStore.addToSuperLiked(item as Movie);
  const markAsWatched = (item: Item) =>
    mediaType === 'tv' ? seriesStore.markAsWatched(item as TVShow) : movieStore.markAsWatched(item as Movie);

  const handleMediaTypeChange = (next: MediaType) => {
    if (next === mediaType) return;
    setMediaType(next);
    setItems([]);
    setCurrentIndex(0);
    setCurrentPage(1);
    setCategoryIndex(0);
    setHasMorePages(true);
  };

  useEffect(() => {
    loadItems();
  }, [currentPage, categoryIndex, mediaType]);

  // Précharge les affiches à venir pour éviter le flash blanc au changement de carte.
  // On ne précharge que les nouvelles affiches (jamais deux fois la même) pour éviter
  // d'accumuler des appels réseau redondants sur une longue session de swipe.
  useEffect(() => {
    const upcoming = items.slice(currentIndex, currentIndex + 6);
    upcoming.forEach((item) => {
      if (prefetchedIds.current.has(item.id)) return;
      const url = getImageUrl(item.poster_path, 'w500');
      if (url) {
        prefetchedIds.current.add(item.id);
        Image.prefetch(url);
      }
    });
  }, [items, currentIndex]);

  const fetchPage = (page: number) => {
    if (mediaType === 'tv') {
      switch (category) {
        case 'top_rated': return tvService.getTopRated(page);
        case 'on_the_air': return tvService.getOnTheAir(page);
        default: return tvService.getPopular(page);
      }
    }
    switch (category) {
      case 'top_rated': return movieService.getTopRated(page);
      case 'upcoming': return movieService.getUpcoming(page);
      default: return movieService.getPopular(page);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      console.log(`Chargement de la catégorie ${category} (${mediaType}), page ${currentPage}...`);

      const response = await fetchPage(currentPage);
      const maxPages = Math.min(response.total_pages || 500, 500);

      let addedCount = 0;
      setItems(prevItems => {
        const existingIds = new Set(prevItems.map(i => i.id));
        const newItems: Item[] = response.results.filter(
          (item: Item) => !hasBeenSwiped(item.id) && !existingIds.has(item.id)
        );
        addedCount = newItems.length;
        const sortedItems = newItems.sort((a: Item, b: Item) => {
          if (b.popularity !== a.popularity) {
            return b.popularity - a.popularity;
          }
          return b.vote_average - a.vote_average;
        });
        return [...prevItems, ...sortedItems];
      });

      if (addedCount === 0) {
        if (currentPage < maxPages) {
          setCurrentPage(prev => prev + 1);
        } else if (categoryIndex < categories.length - 1) {
          setCategoryIndex(prev => prev + 1);
          setCurrentPage(1);
          setHasMorePages(true);
        } else {
          setHasMorePages(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', mediaType === 'tv' ? 'Impossible de charger les séries' : 'Impossible de charger les films');
    } finally {
      setLoading(false);
    }
  };

  const maybeLoadMore = (cardIndex: number) => {
    if (cardIndex >= items.length - 10 && !loading && hasMorePages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const onSwipedLeft = (cardIndex: number) => {
    const item = items[cardIndex];
    addToSwiped(item.id);
    setCurrentIndex(cardIndex + 1);
    maybeLoadMore(cardIndex);
  };

  const onSwipedRight = (cardIndex: number) => {
    const item = items[cardIndex];
    addToWatchlist(item);
    addToSwiped(item.id);
    setCurrentIndex(cardIndex + 1);
    maybeLoadMore(cardIndex);
  };

  const onSwipedTop = (cardIndex: number) => {
    const item = items[cardIndex];
    addToSuperLiked(item);
    addToSwiped(item.id);
    setCurrentIndex(cardIndex + 1);
    maybeLoadMore(cardIndex);
  };

  const onSwipedBottom = (cardIndex: number) => {
    const item = items[cardIndex];
    markAsWatched(item);
    addToSwiped(item.id);
    setCurrentIndex(cardIndex + 1);
    maybeLoadMore(cardIndex);
  };

  const handleUndo = () => {
    if (swiperRef.current && currentIndex > 0) {
      swiperRef.current.swipeBack();
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.ink} />
          <Text style={styles.loadingText}>
            {mediaType === 'tv' ? 'CHARGEMENT DES SÉRIES…' : 'CHARGEMENT DES FILMS…'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.toggleRow}>
          <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>VOUS AVEZ TOUT VU</Text>
          <Text style={styles.emptySubtext}>
            Explorez d'autres catégories ou réinitialisez votre historique.
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              Alert.alert(
                'Réinitialiser',
                'Voulez-vous réinitialiser votre historique de swipe ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: () => {
                      if (mediaType === 'tv') seriesStore.clearSwipedShows();
                      else movieStore.clearSwipedMovies();
                      setItems([]);
                      setCategoryIndex(0);
                      setCurrentPage(1);
                      setCurrentIndex(0);
                      setHasMorePages(true);
                      setTimeout(() => loadItems(), 100);
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.resetButtonText}>RÉINITIALISER L'HISTORIQUE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const remaining = Math.max(items.length - currentIndex, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sessionBar}>
        <Logo variant="horizontal" colorway="principale" size={15} />
        <Text style={styles.sessionBarText}>{CATEGORY_LABEL[category]}</Text>
      </View>

      <View style={styles.toggleRow}>
        <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />
      </View>

      <Animated.View style={[styles.header, headerFade, headerSlide]}>
        <Text style={styles.title}>TRIER{'\n'}OU JETER</Text>
        <View style={styles.remainingBlock}>
          <Text style={styles.remainingLabel}>RESTE</Text>
          <Text style={styles.remainingValue}>{remaining}</Text>
        </View>
      </Animated.View>

      <View style={styles.swiperContainer}>
        <Swiper
          key={mediaType}
          ref={swiperRef}
          cards={items}
          renderCard={(item) => item
            ? (mediaType === 'tv'
              ? <SeriesCard show={item as TVShow} variant="swipe" />
              : <MovieCard movie={item as Movie} variant="swipe" />)
            : null}
          keyExtractor={(item) => item.id.toString()}
          onSwipedLeft={onSwipedLeft}
          onSwipedRight={onSwipedRight}
          onSwipedTop={onSwipedTop}
          onSwipedBottom={onSwipedBottom}
          backgroundColor="transparent"
          stackSize={3}
          stackScale={6}
          stackSeparation={10}
          animateCardOpacity={false}
          animateOverlayLabelsOpacity
          infinite={false}
          overlayLabels={{
            left: {
              title: 'NON',
              style: { label: styles.overlayLabelLeft, wrapper: styles.overlayWrapper },
            },
            right: {
              title: 'OUI',
              style: { label: styles.overlayLabelRight, wrapper: styles.overlayWrapper },
            },
            top: {
              title: 'CE SOIR',
              style: { label: styles.overlayLabelTop, wrapper: styles.overlayWrapper },
            },
            bottom: {
              title: 'VU',
              style: { label: styles.overlayLabelBottom, wrapper: styles.overlayWrapper },
            },
          }}
          overlayOpacityHorizontalThreshold={30}
          overlayOpacityVerticalThreshold={30}
          useViewOverflow={false}
        />
      </View>

      <View style={styles.actionBar}>
        <AnimatedTouchable
          style={[styles.actionCell, styles.actionCellNon]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text style={styles.actionCellTitle}>NON</Text>
          <Text style={styles.actionCellHint}>← GAUCHE</Text>
        </AnimatedTouchable>
        <AnimatedTouchable
          style={styles.actionCellCentre}
          onPress={() => swiperRef.current?.swipeTop()}
        >
          <Text style={styles.actionCellCentreArrow}>↑</Text>
          <Text style={styles.actionCellCentreLabel}>CE SOIR</Text>
        </AnimatedTouchable>
        <AnimatedTouchable
          style={[styles.actionCell, styles.actionCellOui]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Text style={styles.actionCellTitle}>OUI</Text>
          <Text style={styles.actionCellHint}>DROITE →</Text>
        </AnimatedTouchable>
      </View>

      <AnimatedTouchable
        onPress={() => swiperRef.current?.swipeBottom()}
        style={styles.watchedRow}
      >
        <Text style={styles.watchedRowArrow}>↓</Text>
        <View>
          <Text style={styles.watchedRowTitle}>DÉJÀ VU</Text>
          <Text style={styles.watchedRowHint}>GLISSER VERS LE BAS</Text>
        </View>
      </AnimatedTouchable>

      <TouchableOpacity
        onPress={handleUndo}
        disabled={currentIndex === 0}
        style={styles.undoRow}
      >
        <Text style={[styles.undoText, currentIndex === 0 && styles.undoTextDisabled]}>
          ↺ ANNULER LE DERNIER
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  sessionBar: {
    height: 40,
    backgroundColor: theme.colors.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  sessionBarText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    letterSpacing: theme.typography.letterSpacing.mono,
    color: theme.colors.ink,
  },
  toggleRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 30,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    letterSpacing: -1,
    lineHeight: 30,
  },
  remainingBlock: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.ink,
  },
  remainingValue: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 26,
    color: theme.colors.ink,
  },
  swiperContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    letterSpacing: theme.typography.letterSpacing.mono,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  overlayWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayLabelLeft: {
    backgroundColor: theme.colors.paper,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    padding: theme.spacing.lg,
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  overlayLabelRight: {
    backgroundColor: theme.colors.yellow,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    padding: theme.spacing.lg,
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  overlayLabelTop: {
    backgroundColor: theme.colors.ink,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    padding: theme.spacing.lg,
    color: theme.colors.yellow,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  overlayLabelBottom: {
    backgroundColor: theme.colors.white,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    padding: theme.spacing.lg,
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  actionBar: {
    flexDirection: 'row',
    borderTopWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
  },
  actionCell: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  actionCellNon: {
    backgroundColor: theme.colors.paper,
    borderRightWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  actionCellOui: {
    backgroundColor: theme.colors.yellow,
    borderLeftWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  actionCellTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 20,
    color: theme.colors.ink,
    letterSpacing: -0.3,
  },
  actionCellHint: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  actionCellCentre: {
    width: 74,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  actionCellCentreArrow: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 20,
    color: theme.colors.yellow,
  },
  actionCellCentreLabel: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.yellow,
    marginTop: 2,
  },
  watchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.paper,
    borderTopWidth: theme.borders.medium,
    borderTopColor: theme.colors.ink,
  },
  watchedRowArrow: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 20,
    color: theme.colors.ink,
  },
  watchedRowTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 14,
    color: theme.colors.ink,
    letterSpacing: -0.2,
  },
  watchedRowHint: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 8,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginTop: 1,
  },
  undoRow: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  undoText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  undoTextDisabled: {
    opacity: theme.opacity.disabled,
  },
  resetButton: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  resetButtonText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.yellow,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
});

export default SwipeScreen;
