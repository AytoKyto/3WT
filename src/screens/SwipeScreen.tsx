import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import Swiper from 'react-native-deck-swiper';
import { theme } from '../styles/theme';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types/movie';
import { movieService } from '../services/api/tmdb';
import useMovieStore from '../store/useMovieStore';
import useStreamingStore from '../store/useStreamingStore';
import { useFadeIn, useSlideIn, useScaleAnimation, usePulse } from '../hooks/useAnimations';

// Composant indicateur animé
const AnimatedSwipeIndicator = ({ emoji, text, index }: { emoji: string; text: string; index: number }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const delay = index * 100;
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    scale.value = withSpring(1, {
      ...theme.animation.easing.springGentle,
      delay,
    });
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.swipeIndicator, animatedStyle]}>
      <Text style={styles.swipeIndicatorEmoji}>{emoji}</Text>
      <Text style={styles.swipeIndicatorText}>{text}</Text>
    </Animated.View>
  );
};

const SwipeScreen = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [movieCategory, setMovieCategory] = useState<'popular' | 'top_rated' | 'upcoming'>('popular');
  const [undoPressed, setUndoPressed] = useState(false);
  const swiperRef = useRef<Swiper<Movie>>(null);

  const {
    addToWatchlist,
    addToSwiped,
    addToSuperLiked,
    hasBeenSwiped,
  } = useMovieStore();

  const { getSelectedProviderIds, showAllMovies } = useStreamingStore();

  // Animations d'entrée
  const headerFade = useFadeIn(500);
  const headerSlide = useSlideIn('top', 20, 500);
  const undoScale = useScaleAnimation(undoPressed);
  const undoPulse = usePulse();

  useEffect(() => {
    loadMovies();
  }, [currentPage, movieCategory]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      console.log(`Chargement de la catégorie ${movieCategory}, page ${currentPage}...`);

      // Choisir la bonne méthode selon la catégorie
      let response;
      switch (movieCategory) {
        case 'top_rated':
          console.log('Appel API: getTopRated');
          response = await movieService.getTopRated(currentPage);
          break;
        case 'upcoming':
          console.log('Appel API: getUpcoming');
          response = await movieService.getUpcoming(currentPage);
          break;
        default:
          console.log('Appel API: getPopular');
          response = await movieService.getPopular(currentPage);
      }

      console.log('Réponse API reçue:', response ? 'OK' : 'NULL');
      
      // Mettre à jour le nombre total de pages
      const maxPages = Math.min(response.total_pages || 500, 500); // Limiter à 500 pages
      setTotalPages(maxPages);
      
      // Filtrer les films déjà swipés ET ceux déjà dans la pile
      const newMovies = response.results.filter(
        (movie: Movie) => !hasBeenSwiped(movie.id) && !movies.some(m => m.id === movie.id)
      );

      console.log(`${movieCategory} - Page ${currentPage}: ${newMovies.length} nouveaux films sur ${response.results.length}`);
      console.log('Réponse API:', response);

      // Trier les nouveaux films par popularité décroissante
      const sortedMovies = newMovies.sort((a: Movie, b: Movie) => {
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity;
        }
        return b.vote_average - a.vote_average;
      });
      
      // Ajouter seulement les nouveaux films à la fin
      setMovies(prevMovies => [...prevMovies, ...sortedMovies]);
      
      // Si on n'a pas trouvé de nouveaux films
      if (newMovies.length === 0) {
        if (currentPage < maxPages) {
          // Essayer la page suivante
          setCurrentPage(prev => prev + 1);
        } else if (movieCategory === 'popular') {
          // Passer à la catégorie suivante
          console.log('Passage à la catégorie top_rated');
          setMovieCategory('top_rated');
          setCurrentPage(1);
          setHasMorePages(true);
        } else if (movieCategory === 'top_rated') {
          // Passer à la catégorie upcoming
          console.log('Passage à la catégorie upcoming');
          setMovieCategory('upcoming');
          setCurrentPage(1);
          setHasMorePages(true);
        } else {
          // Plus de films disponibles
          setHasMorePages(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des films:', error);
      Alert.alert('Erreur', 'Impossible de charger les films');
    } finally {
      setLoading(false);
    }
  };

  const onSwipedLeft = (cardIndex: number) => {
    const movie = movies[cardIndex];
    console.log('Swiped left:', movie.title);
    addToSwiped(movie.id);
    setCurrentIndex(cardIndex + 1);
    
    // Charger plus de films si on approche de la fin
    if (cardIndex >= movies.length - 10 && !loading && hasMorePages) {
      console.log('Chargement automatique de plus de films...');
      setCurrentPage(prev => prev + 1);
    }
  };

  const onSwipedRight = (cardIndex: number) => {
    const movie = movies[cardIndex];
    console.log('Swiped right (added):', movie.title);
    addToWatchlist(movie);
    addToSwiped(movie.id);
    setCurrentIndex(cardIndex + 1);
    
    // Charger plus de films si on approche de la fin
    if (cardIndex >= movies.length - 10 && !loading && hasMorePages) {
      console.log('Chargement automatique de plus de films...');
      setCurrentPage(prev => prev + 1);
    }
  };

  const onSwipedTop = (cardIndex: number) => {
    const movie = movies[cardIndex];
    console.log('Swiped top (super liked):', movie.title);
    addToSuperLiked(movie);
    addToSwiped(movie.id);
    setCurrentIndex(cardIndex + 1);
    
    // Charger plus de films si on approche de la fin
    if (cardIndex >= movies.length - 10 && !loading && hasMorePages) {
      console.log('Chargement automatique de plus de films...');
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleUndo = () => {
    if (swiperRef.current && currentIndex > 0) {
      swiperRef.current.swipeBack();
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading && movies.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des films...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (movies.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyText}>Vous avez tout vu !</Text>
          <Text style={styles.emptySubtext}>
            Explorez d'autres catégories ou réinitialisez votre historique
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
                      // Réinitialiser seulement les films swipés
                      useMovieStore.getState().clearSwipedMovies();
                      setMovies([]);
                      setMovieCategory('popular');
                      setCurrentPage(1);
                      setCurrentIndex(0);
                      setHasMorePages(true);
                      // Forcer le rechargement immédiat
                      setTimeout(() => loadMovies(), 100);
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.resetButtonText}>Réinitialiser l'historique</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerFade, headerSlide]}>
        <Text style={styles.title}>Découvrez</Text>
        <Text style={styles.subtitle}>Swipez pour créer votre liste</Text>
      </Animated.View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={movies}
          renderCard={(movie) => movie ? <MovieCard movie={movie} variant="swipe" /> : null}
          keyExtractor={(movie) => movie.id.toString()}
          onSwipedLeft={onSwipedLeft}
          onSwipedRight={onSwipedRight}
          onSwipedTop={onSwipedTop}
          backgroundColor="transparent"
          cardIndex={currentIndex}
          stackSize={3}
          stackScale={10}
          stackSeparation={15}
          animateCardOpacity
          animateOverlayLabelsOpacity
          infinite={false}
          overlayLabels={{
            left: {
              title: 'PASSER',
              style: {
                label: styles.overlayLabelLeft,
                wrapper: styles.overlayWrapper,
              },
            },
            right: {
              title: 'AJOUTER',
              style: {
                label: styles.overlayLabelRight,
                wrapper: styles.overlayWrapper,
              },
            },
            top: {
              title: 'SUPER LIKE',
              style: {
                label: styles.overlayLabelTop,
                wrapper: styles.overlayWrapper,
              },
            },
          }}
          overlayOpacityHorizontalThreshold={30}
          overlayOpacityVerticalThreshold={30}
          useViewOverflow={false}
        />

        <View style={styles.indicatorsContainer}>
          <AnimatedSwipeIndicator emoji="👈" text="Passer" index={0} />
          <AnimatedSwipeIndicator emoji="👆" text="Super" index={1} />
          <AnimatedSwipeIndicator emoji="👉" text="Ajouter" index={2} />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <Animated.View style={[undoScale, currentIndex > 0 && undoPulse]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.undoButton,
              currentIndex === 0 && styles.undoButtonDisabled
            ]}
            onPress={handleUndo}
            onPressIn={() => setUndoPressed(true)}
            onPressOut={() => setUndoPressed(false)}
            disabled={currentIndex === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>↩️</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  swiperContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  overlayWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayLabelLeft: {
    backgroundColor: '#FF3B30',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overlayLabelRight: {
    backgroundColor: '#34C759',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overlayLabelTop: {
    backgroundColor: '#FFD60A',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  swipeIndicator: {
    alignItems: 'center',
  },
  swipeIndicatorEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  swipeIndicatorText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: theme.spacing.lg,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    borderWidth: 0,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoButton: {
    backgroundColor: theme.colors.accent,
  },
  undoButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    fontSize: 28,
  },
  resetButton: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  resetButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'uppercase',
  },
});

export default SwipeScreen;