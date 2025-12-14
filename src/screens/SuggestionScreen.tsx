import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  ViewStyle,
} from 'react-native';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import useMovieStore from '../store/useMovieStore';
import { Movie, Genre } from '../types/movie';
import { movieService, getImageUrl } from '../services/api/tmdb';

const SuggestionScreen = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [suggestedMovie, setSuggestedMovie] = useState<Movie | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinValue = new Animated.Value(0);

  const { 
    getRandomMovie, 
    watchlist, 
    superLikedMovies, 
    markAsWatched,
    addToWatchlist,
    addToSuperLiked 
  } = useMovieStore();

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const genreList = await movieService.getGenres();
      setGenres(genreList);
    } catch (error) {
      console.error('Erreur lors du chargement des genres:', error);
    }
  };

  const handleSuggest = () => {
    if (watchlist.length === 0 && superLikedMovies.length === 0) {
      Alert.alert(
        'Liste vide',
        "Ajoutez des films à votre liste en swipant d'abord !",
        [{ text: 'OK' }]
      );
      setIsSpinning(false);
      return;
    }

    setIsSpinning(true);
    setSuggestedMovie(null);

    // Animation de rotation avec timeout de sécurité
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      { iterations: 10 }
    );

    animation.start();

    // Arrêter l'animation après 2 secondes et choisir un film
    setTimeout(() => {
      animation.stop();
      const movie = getRandomMovie(selectedGenre || undefined);
      
      if (!movie) {
        Alert.alert(
          'Aucun film trouvé',
          selectedGenre 
            ? 'Aucun film de ce genre dans votre liste. Essayez sans filtre.'
            : 'Votre liste est vide. Swipez des films d\'abord !',
          [{ text: 'OK' }]
        );
      } else {
        setSuggestedMovie(movie);
      }
      
      setIsSpinning(false);
      spinValue.setValue(0);
    }, 2000);
  };

  const handleAccept = () => {
    if (suggestedMovie) {
      markAsWatched(suggestedMovie);
      Alert.alert(
        '🎬 Film choisi !',
        `"${suggestedMovie.title}" a été marqué comme film du soir !`,
        [{ text: 'Bon film !' }]
      );
      setSuggestedMovie(null);
    }
  };

  const handleReroll = () => {
    handleSuggest();
  };

  const addDemoMovies = async () => {
    try {
      // Charger des films populaires depuis l'API
      const popularMovies = await movieService.getPopular(1);
      const topMovies = popularMovies.results.slice(0, 10);
      
      // Ajouter les 10 premiers films à la watchlist
      topMovies.forEach((movie: Movie, index: number) => {
        if (index < 3) {
          // Les 3 premiers en super like
          addToSuperLiked(movie);
        } else {
          // Les autres dans la watchlist normale
          addToWatchlist(movie);
        }
      });

      Alert.alert(
        '✅ Films ajoutés !',
        '10 films populaires ont été ajoutés à votre liste pour tester.',
        [{ text: 'Super !' }]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de charger les films de démo. Vérifiez votre connexion.',
        [{ text: 'OK' }]
      );
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Que regarder ce soir ?</Text>
          <Text style={styles.subtitle}>
            {watchlist.length + superLikedMovies.length} films dans votre liste
          </Text>
        </View>

        {/* Sélection du genre (optionnel) */}
        <View style={styles.genreSection}>
          <Text style={styles.sectionTitle}>Filtrer par genre (optionnel)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreList}
          >
            <TouchableOpacity
              onPress={() => setSelectedGenre(null)}
              activeOpacity={0.8}
            >
              <Card
                style={{
                  ...styles.genreCard,
                  ...(!selectedGenre ? styles.genreCardSelected : {}),
                }}
              >
                <Text style={styles.genreText}>Tous</Text>
              </Card>
            </TouchableOpacity>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                onPress={() => setSelectedGenre(genre.id)}
                activeOpacity={0.8}
              >
                <Card
                  style={{
                    ...styles.genreCard,
                    ...(selectedGenre === genre.id ? styles.genreCardSelected : {}),
                  }}
                >
                  <Text style={styles.genreText}>{genre.name}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bouton de suggestion ou résultat */}
        {!suggestedMovie ? (
          <View style={styles.suggestionContainer}>
            <Animated.View
              style={[
                styles.diceContainer,
                isSpinning && { transform: [{ rotate: spin }] },
              ]}
            >
              <Text style={styles.diceEmoji}>🎲</Text>
            </Animated.View>
            <Button
              title="CHOISIR UN FILM"
              onPress={handleSuggest}
              variant="filled"
              size="large"
              disabled={isSpinning}
              loading={isSpinning}
              style={styles.suggestButton}
            />
          </View>
        ) : (
          <Card style={styles.resultCard}>
            <Text style={styles.resultTitle}>Le film du soir :</Text>
            {suggestedMovie.poster_path && (
              <Image
                source={{ uri: getImageUrl(suggestedMovie.poster_path, 'w500') || '' }}
                style={styles.resultPoster}
                resizeMode="cover"
              />
            )}
            <Text style={styles.resultMovieTitle}>{suggestedMovie.title}</Text>
            <View style={styles.resultInfo}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  ⭐ {suggestedMovie.vote_average.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.yearText}>
                {new Date(suggestedMovie.release_date).getFullYear()}
              </Text>
            </View>
            <Text style={styles.resultOverview} numberOfLines={4}>
              {suggestedMovie.overview}
            </Text>
            
            <View style={styles.resultActions}>
              <Button
                title="Regarder ce soir"
                onPress={handleAccept}
                variant="tinted"
                size="medium"
                style={styles.actionButton}
              />
              <Button
                title="Relancer"
                onPress={handleReroll}
                variant="ghost"
                size="medium"
                style={styles.actionButton}
              />
            </View>
          </Card>
        )}

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statNumber}>{watchlist.length}</Text>
            <Text style={styles.statLabel}>À voir</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>{superLikedMovies.length}</Text>
            <Text style={styles.statLabel}>Super likes</Text>
          </Card>
        </View>

        {/* Bouton de démo si la liste est vide */}
        {watchlist.length === 0 && (
          <View style={styles.demoContainer}>
            <Button
              title="Ajouter des films de démo"
              onPress={addDemoMovies}
              variant="filled"
              size="medium"
            />
            <Text style={styles.demoText}>
              Pour tester rapidement sans swiper
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  genreSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  genreList: {
    paddingHorizontal: theme.spacing.lg,
  },
  genreCard: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
  genreCardSelected: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  genreText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  suggestionContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  diceContainer: {
    marginBottom: theme.spacing.xl,
  },
  diceEmoji: {
    fontSize: 120,
  },
  suggestButton: {
    paddingHorizontal: theme.spacing.xxl,
  },
  resultCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  resultPoster: {
    width: 200,
    height: 300,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
    marginBottom: theme.spacing.lg,
  },
  resultMovieTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  ratingBadge: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 0,
    borderColor: 'transparent',
    marginRight: theme.spacing.md,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  yearText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  resultOverview: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  resultActions: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    flex: 0.45,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 0.45,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  demoContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  demoText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SuggestionScreen;