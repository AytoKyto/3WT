import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ViewStyle,
} from 'react-native';
import { theme } from '../styles/theme';
import MovieCard from '../components/MovieCard';
import Card from '../components/Card';
import Button from '../components/Button';
import useMovieStore from '../store/useMovieStore';
import { Movie } from '../types/movie';

type FilterType = 'all' | 'watchlist' | 'superliked' | 'watched';

const WatchlistScreen = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const {
    watchlist,
    superLikedMovies,
    watchedMovies,
    removeFromWatchlist,
    removeFromSuperLiked,
    markAsWatched,
    isSuperLiked,
  } = useMovieStore();

  const getFilteredMovies = (): Movie[] => {
    switch (filter) {
      case 'watchlist':
        return watchlist.filter(m => !isSuperLiked(m.id));
      case 'superliked':
        return superLikedMovies;
      case 'watched':
        return watchedMovies;
      case 'all':
      default:
        return [...watchlist];
    }
  };

  const filteredMovies = getFilteredMovies();

  const handleRemoveMovie = (movie: Movie) => {
    Alert.alert(
      'Retirer le film',
      `Voulez-vous retirer "${movie.title}" de votre liste ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            if (isSuperLiked(movie.id)) {
              removeFromSuperLiked(movie.id);
            }
            removeFromWatchlist(movie.id);
          },
        },
      ]
    );
  };

  const handleMarkAsWatched = (movie: Movie) => {
    markAsWatched(movie);
    Alert.alert(
      'Film vu !',
      `"${movie.title}" a été marqué comme vu`,
      [{ text: 'OK' }]
    );
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(
          item.title,
          item.overview,
          [
            {
              text: 'Marquer comme vu',
              onPress: () => handleMarkAsWatched(item),
            },
            {
              text: 'Retirer',
              style: 'destructive',
              onPress: () => handleRemoveMovie(item),
            },
            { text: 'Fermer', style: 'cancel' },
          ]
        );
      }}
      activeOpacity={0.9}
    >
      <View style={styles.movieItemContainer}>
        <MovieCard movie={item} variant="list" />
        {isSuperLiked(item.id) && (
          <View style={styles.superLikeBadge}>
            <Text style={styles.superLikeEmoji}>⭐</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {filter === 'watched' ? '🎬' : '📚'}
      </Text>
      <Text style={styles.emptyTitle}>
        {filter === 'watched' ? 'Aucun film vu' : 'Liste vide'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'watched'
          ? 'Les films que vous marquez comme vus apparaîtront ici'
          : 'Swipez des films pour les ajouter à votre liste !'}
      </Text>
    </View>
  );

  const FilterButton = ({ 
    title, 
    value, 
    emoji 
  }: { 
    title: string; 
    value: FilterType; 
    emoji: string;
  }) => (
    <TouchableOpacity
      onPress={() => setFilter(value)}
      activeOpacity={0.8}
    >
      <Card
        style={{
          ...styles.filterCard,
          ...(filter === value ? styles.filterCardActive : {}),
        }}
      >
        <Text style={styles.filterEmoji}>{emoji}</Text>
        <Text style={styles.filterText}>{title}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ma liste</Text>
        <Text style={styles.subtitle}>
          {filteredMovies.length} film{filteredMovies.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <FilterButton title="Tous" value="all" emoji="📚" />
        <FilterButton title="À voir" value="watchlist" emoji="👀" />
        <FilterButton title="Super" value="superliked" emoji="⭐" />
        <FilterButton title="Vus" value="watched" emoji="✅" />
      </View>

      {/* Liste des films */}
      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovieItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          filteredMovies.length === 0 && styles.emptyListContainer
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Statistiques */}
      {filter === 'all' && filteredMovies.length > 0 && (
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{watchlist.length}</Text>
              <Text style={styles.statLabel}>À voir</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{superLikedMovies.length}</Text>
              <Text style={styles.statLabel}>Super likes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{watchedMovies.length}</Text>
              <Text style={styles.statLabel}>Vus</Text>
            </View>
          </View>
        </Card>
      )}
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
    marginBottom: theme.spacing.md,
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
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterCard: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    minWidth: 80,
  },
  filterCardActive: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  filterEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  superLikeBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 0,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  superLikeEmoji: {
    fontSize: 20,
  },
  movieItemContainer: {
    position: 'relative',
  },
  statsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
});

export default WatchlistScreen;