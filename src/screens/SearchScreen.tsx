import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';
import MovieCard from '../components/MovieCard';
import Card from '../components/Card';
import Button from '../components/Button';
import { Movie } from '../types/movie';
import { movieService } from '../services/api/tmdb';
import useMovieStore from '../store/useMovieStore';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToSuperLiked,
    isSuperLiked,
  } = useMovieStore();

  const searchMovies = async (query: string, pageNum: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await movieService.searchMovies(query, pageNum);
      
      if (pageNum === 1) {
        setSearchResults(response.results);
      } else {
        setSearchResults(prev => [...prev, ...response.results]);
      }
      
      setTotalPages(response.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      Alert.alert('Erreur', 'Impossible de rechercher les films');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    searchMovies(searchQuery, 1);
  };

  const loadMoreResults = () => {
    if (page < totalPages && !loading) {
      searchMovies(searchQuery, page + 1);
    }
  };

  const handleAddMovie = (movie: Movie) => {
    if (isInWatchlist(movie.id)) {
      Alert.alert(
        'Retirer de la liste',
        `Voulez-vous retirer "${movie.title}" de votre liste ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Retirer',
            style: 'destructive',
            onPress: () => removeFromWatchlist(movie.id),
          },
        ]
      );
    } else {
      addToWatchlist(movie);
      Alert.alert(
        'Ajouté !',
        `"${movie.title}" a été ajouté à votre liste`,
        [
          {
            text: 'Super like ?',
            onPress: () => {
              addToSuperLiked(movie);
            },
          },
          { text: 'OK' },
        ]
      );
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const inWatchlist = isInWatchlist(item.id);
    const superLiked = isSuperLiked(item.id);

    return (
      <TouchableOpacity
        onPress={() => handleAddMovie(item)}
        activeOpacity={0.9}
      >
        <View style={styles.movieItemContainer}>
          <MovieCard movie={item} variant="list" />
          {inWatchlist && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusEmoji}>
                {superLiked ? '⭐' : '✅'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (!searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Rechercher un film</Text>
          <Text style={styles.emptySubtitle}>
            Tapez le nom d'un film pour commencer
          </Text>
        </View>
      );
    }

    if (!loading && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
          <Text style={styles.emptySubtitle}>
            Essayez avec d'autres mots-clés
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rechercher</Text>
        <Text style={styles.subtitle}>Trouvez et ajoutez des films</Text>
      </View>

      <View style={styles.searchContainer}>
        <Card style={styles.searchCard}>
          <TextInput
            style={styles.searchInput}
            placeholder="Titre du film..."
            placeholderTextColor={theme.colors.secondaryLabel}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Suggestions de recherche rapide */}
      {!searchQuery && (
        <View style={styles.quickSearchContainer}>
          <Text style={styles.quickSearchTitle}>Recherches populaires</Text>
          <View style={styles.quickSearchTags}>
            {['Marvel', 'Star Wars', 'Pixar', 'Harry Potter', 'Inception'].map(
              (tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => {
                    setSearchQuery(tag);
                    searchMovies(tag, 1);
                  }}
                >
                  <Card style={styles.tagCard}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </Card>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovieItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreResults}
        onEndReachedThreshold={0.5}
        contentContainerStyle={
          searchResults.length === 0 && styles.emptyListContainer
        }
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.md,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 0,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  quickSearchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  quickSearchTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickSearchTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagCard: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
  },
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  movieItemContainer: {
    position: 'relative',
  },
  statusBadge: {
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
  statusEmoji: {
    fontSize: 20,
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
  loadingFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
});

export default SearchScreen;