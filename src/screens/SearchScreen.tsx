import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { Movie, Genre, Person } from '../types/movie';
import { TVShow } from '../types/tv';
import { movieService, tvService, getImageUrl } from '../services/api/tmdb';
import useMovieStore from '../store/useMovieStore';
import useSeriesStore from '../store/useSeriesStore';
import AnimatedTouchable from '../components/AnimatedTouchable';
import MediaTypeToggle, { MediaType } from '../components/MediaTypeToggle';
import { getDisplayTitle, getDisplayYear } from '../utils/media';

type Item = Movie | TVShow;
type Mode = 'films' | 'personnes' | 'genres';

const MODE_TITLES: Record<Mode, string> = {
  films: 'QUOI\nPRÉCISÉMENT ?',
  personnes: 'QUI\nCHERCHEZ-VOUS ?',
  genres: 'QUEL\nGENRE ?',
};

const MODE_PLACEHOLDERS: Record<Mode, string> = {
  films: 'TAPEZ UN TITRE',
  personnes: 'TAPEZ UN NOM',
  genres: '',
};

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const movieStore = useMovieStore();
  const seriesStore = useSeriesStore();

  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [mode, setMode] = useState<Mode>('films');

  const TABS: { value: Mode; label: string }[] = [
    { value: 'films', label: mediaType === 'tv' ? 'SÉRIES' : 'FILMS' },
    { value: 'personnes', label: 'PERSONNES' },
    { value: 'genres', label: 'GENRES' },
  ];

  const isInWatchlist = mediaType === 'tv' ? seriesStore.isInWatchlist : movieStore.isInWatchlist;
  const removeFromWatchlist = mediaType === 'tv' ? seriesStore.removeFromWatchlist : movieStore.removeFromWatchlist;
  const addToWatchlist = (item: Item) =>
    mediaType === 'tv' ? seriesStore.addToWatchlist(item as TVShow) : movieStore.addToWatchlist(item as Movie);

  // Films / Séries
  const [filmQuery, setFilmQuery] = useState('');
  const [filmResults, setFilmResults] = useState<Item[]>([]);
  const [filmLoading, setFilmLoading] = useState(false);
  const [filmPage, setFilmPage] = useState(1);
  const [filmTotalPages, setFilmTotalPages] = useState(1);

  // Personnes
  const [personQuery, setPersonQuery] = useState('');
  const [personResults, setPersonResults] = useState<Person[]>([]);
  const [personLoading, setPersonLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personMovies, setPersonMovies] = useState<Item[]>([]);
  const [personMoviesLoading, setPersonMoviesLoading] = useState(false);

  // Genres
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreMovies, setGenreMovies] = useState<Item[]>([]);
  const [genreMoviesLoading, setGenreMoviesLoading] = useState(false);

  const handleMediaTypeChange = (next: MediaType) => {
    if (next === mediaType) return;
    setMediaType(next);
    setFilmResults([]);
    setFilmPage(1);
    setSelectedPerson(null);
    setPersonMovies([]);
    setGenres([]);
    setSelectedGenre(null);
    setGenreMovies([]);
  };

  const searchFilms = async (query: string, pageNum: number = 1) => {
    if (!query.trim()) {
      setFilmResults([]);
      return;
    }
    try {
      setFilmLoading(true);
      const response = mediaType === 'tv'
        ? await tvService.searchTV(query, pageNum)
        : await movieService.searchMovies(query, pageNum);
      setFilmResults(pageNum === 1 ? response.results : (prev) => [...prev, ...response.results]);
      setFilmTotalPages(response.total_pages);
      setFilmPage(pageNum);
    } catch (error) {
      Alert.alert('Erreur', mediaType === 'tv' ? 'Impossible de rechercher les séries' : 'Impossible de rechercher les films');
    } finally {
      setFilmLoading(false);
    }
  };

  const loadMoreFilms = () => {
    if (filmPage < filmTotalPages && !filmLoading) {
      searchFilms(filmQuery, filmPage + 1);
    }
  };

  const searchPeople = async (query: string) => {
    if (!query.trim()) {
      setPersonResults([]);
      return;
    }
    try {
      setPersonLoading(true);
      const response = await movieService.searchPeople(query, 1);
      setPersonResults(response.results.filter((p: Person) => p.known_for_department === 'Acting' || p.known_for_department === 'Directing'));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rechercher des personnes');
    } finally {
      setPersonLoading(false);
    }
  };

  const selectPerson = async (person: Person) => {
    setSelectedPerson(person);
    setPersonMovies([]);
    try {
      setPersonMoviesLoading(true);
      const credits = mediaType === 'tv'
        ? await tvService.getPersonShows(person.id)
        : await movieService.getPersonMovies(person.id);
      const combined: Item[] = [...(credits.cast || []), ...(credits.crew || [])];
      const unique = Array.from(new Map(combined.map((m: Item) => [m.id, m])).values())
        .sort((a: Item, b: Item) => (b.popularity || 0) - (a.popularity || 0));
      setPersonMovies(unique);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la filmographie');
    } finally {
      setPersonMoviesLoading(false);
    }
  };

  const loadGenresIfNeeded = async () => {
    if (genres.length > 0 || genresLoading) return;
    try {
      setGenresLoading(true);
      const svc = mediaType === 'tv' ? tvService : movieService;
      const list = await svc.getGenres();
      setGenres(list);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les genres');
    } finally {
      setGenresLoading(false);
    }
  };

  const selectGenre = async (genre: Genre) => {
    setSelectedGenre(genre);
    setGenreMovies([]);
    try {
      setGenreMoviesLoading(true);
      const response = mediaType === 'tv'
        ? await tvService.getShowsByGenre(genre.id, 1)
        : await movieService.getMoviesByGenre(genre.id, 1);
      setGenreMovies(response.results);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger ce genre');
    } finally {
      setGenreMoviesLoading(false);
    }
  };

  const handleModeChange = (next: Mode) => {
    setMode(next);
    if (next === 'genres') loadGenresIfNeeded();
  };

  const toggleAdd = (item: Item) => {
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  const renderMovieRow = ({ item, index }: { item: Item; index: number }) => {
    const added = isInWatchlist(item.id);
    const posterUrl = getImageUrl(item.poster_path, 'w200');
    const rowBg = index % 2 ? theme.colors.paperAlt : theme.colors.paper;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(
          mediaType === 'tv' ? 'SeriesDetail' : 'MovieDetail',
          mediaType === 'tv' ? { show: item } : { movie: item }
        )}
        activeOpacity={0.85}
      >
        <View style={[styles.row, { backgroundColor: rowBg }]}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
          <View style={styles.infoCol}>
            <Text style={styles.rowTitle} numberOfLines={1}>{getDisplayTitle(item).toUpperCase()}</Text>
            <Text style={styles.rowMeta}>
              {getDisplayYear(item)} · {added ? 'DÉJÀ EN LISTE' : item.vote_average.toFixed(1) + '/10'}
            </Text>
          </View>
          <AnimatedTouchable
            style={[styles.addCol, added && styles.addColActive]}
            onPress={() => toggleAdd(item)}
          >
            <Text style={[styles.addColText, added && styles.addColTextActive]}>
              {added ? '✓' : '+'}
            </Text>
          </AnimatedTouchable>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPersonRow = ({ item, index }: { item: Person; index: number }) => {
    const photoUrl = getImageUrl(item.profile_path, 'w200');
    const rowBg = index % 2 ? theme.colors.paperAlt : theme.colors.paper;
    const department = item.known_for_department === 'Directing' ? 'RÉALISATION' : 'ACTEUR·RICE';

    return (
      <TouchableOpacity onPress={() => selectPerson(item)} activeOpacity={0.85}>
        <View style={[styles.row, { backgroundColor: rowBg }]}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
          <View style={styles.infoCol}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.name.toUpperCase()}</Text>
            <Text style={styles.rowMeta}>{department}</Text>
          </View>
          <View style={styles.addCol}>
            <Text style={styles.addColText}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBackRow = (label: string, onBack: () => void) => (
    <TouchableOpacity style={styles.backRow} onPress={onBack} activeOpacity={0.85}>
      <Text style={styles.backRowText}>← {label.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  const renderGenreGrid = () => (
    <View style={styles.genreGrid}>
      {genresLoading ? (
        <ActivityIndicator size="small" color={theme.colors.ink} style={styles.genreLoading} />
      ) : (
        genres.map((genre) => (
          <TouchableOpacity key={genre.id} onPress={() => selectGenre(genre)} activeOpacity={0.85}>
            <View style={styles.genreTag}>
              <Text style={styles.genreTagText}>{genre.name.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderEmpty = (emptyTitle: string, emptySubtitle: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{emptyTitle}</Text>
      <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
    </View>
  );

  const renderFooter = (loading: boolean) => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.ink} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{MODE_TITLES[mode]}</Text>
      </View>

      <View style={styles.toggleRow}>
        <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />
      </View>

      {mode === 'films' && (
        <View style={styles.searchBar}>
          <Text style={styles.searchSlash}>/</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={MODE_PLACEHOLDERS.films}
            placeholderTextColor={theme.colors.textFaint}
            value={filmQuery}
            onChangeText={setFilmQuery}
            onSubmitEditing={() => { setFilmPage(1); searchFilms(filmQuery, 1); }}
            returnKeyType="search"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => { setFilmPage(1); searchFilms(filmQuery, 1); }} disabled={!filmQuery.trim()}>
            <Text style={styles.searchGo}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'personnes' && !selectedPerson && (
        <View style={styles.searchBar}>
          <Text style={styles.searchSlash}>/</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={MODE_PLACEHOLDERS.personnes}
            placeholderTextColor={theme.colors.textFaint}
            value={personQuery}
            onChangeText={setPersonQuery}
            onSubmitEditing={() => searchPeople(personQuery)}
            returnKeyType="search"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => searchPeople(personQuery)} disabled={!personQuery.trim()}>
            <Text style={styles.searchGo}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabsRow}>
        {TABS.map((tab, i) => (
          <AnimatedTouchable
            key={tab.value}
            style={[
              styles.tabCell,
              i < TABS.length - 1 && styles.tabCellBorder,
              mode === tab.value && styles.tabCellActive,
            ]}
            onPress={() => handleModeChange(tab.value)}
          >
            <Text style={[styles.tabText, mode === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </AnimatedTouchable>
        ))}
      </View>

      {mode === 'films' && (
        <>
          {filmQuery.length > 0 && (
            <View style={styles.resultsMeta}>
              <Text style={styles.resultsMetaText}>
                {filmResults.length} RÉSULTAT{filmResults.length > 1 ? 'S' : ''}
              </Text>
            </View>
          )}
          <FlatList
            data={filmResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMovieRow}
            ListEmptyComponent={
              !filmQuery
                ? renderEmpty(
                    mediaType === 'tv' ? 'RECHERCHER UNE SÉRIE' : 'RECHERCHER UN FILM',
                    mediaType === 'tv' ? 'Tapez le nom d\'une série pour commencer.' : "Tapez le nom d'un film pour commencer."
                  )
                : !filmLoading
                  ? renderEmpty('AUCUN RÉSULTAT', "Essayez avec d'autres mots-clés.")
                  : null
            }
            ListFooterComponent={renderFooter(filmLoading)}
            onEndReached={loadMoreFilms}
            onEndReachedThreshold={0.5}
            contentContainerStyle={filmResults.length === 0 && styles.emptyListContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {mode === 'personnes' && (
        selectedPerson ? (
          <>
            {renderBackRow(selectedPerson.name, () => { setSelectedPerson(null); setPersonMovies([]); })}
            <FlatList
              data={personMovies}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMovieRow}
              ListEmptyComponent={
                !personMoviesLoading
                  ? renderEmpty(mediaType === 'tv' ? 'AUCUNE SÉRIE' : 'AUCUN FILM', 'Rien à afficher pour cette personne.')
                  : null
              }
              ListFooterComponent={renderFooter(personMoviesLoading)}
              contentContainerStyle={personMovies.length === 0 && styles.emptyListContainer}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <FlatList
            data={personResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPersonRow}
            ListEmptyComponent={
              !personQuery
                ? renderEmpty('RECHERCHER UNE PERSONNE', "Tapez un nom d'acteur·rice ou de réalisateur·rice.")
                : !personLoading
                  ? renderEmpty('AUCUN RÉSULTAT', "Essayez avec d'autres mots-clés.")
                  : null
            }
            ListFooterComponent={renderFooter(personLoading)}
            contentContainerStyle={personResults.length === 0 && styles.emptyListContainer}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {mode === 'genres' && (
        selectedGenre ? (
          <>
            {renderBackRow(selectedGenre.name, () => { setSelectedGenre(null); setGenreMovies([]); })}
            <FlatList
              data={genreMovies}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMovieRow}
              ListEmptyComponent={
                !genreMoviesLoading
                  ? renderEmpty(mediaType === 'tv' ? 'AUCUNE SÉRIE' : 'AUCUN FILM', 'Rien à afficher pour ce genre.')
                  : null
              }
              ListFooterComponent={renderFooter(genreMoviesLoading)}
              contentContainerStyle={genreMovies.length === 0 && styles.emptyListContainer}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          renderGenreGrid()
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  title: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    letterSpacing: -1,
    lineHeight: 32,
  },
  toggleRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  searchBar: {
    backgroundColor: theme.colors.ink,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchSlash: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 22,
    color: theme.colors.yellow,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 20,
    letterSpacing: -0.3,
    color: theme.colors.paper,
    paddingVertical: 4,
  },
  searchGo: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 20,
    color: theme.colors.yellow,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  tabCell: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
  },
  tabCellBorder: {
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  tabCellActive: {
    backgroundColor: theme.colors.ink,
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textFaint,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  tabTextActive: {
    color: theme.colors.yellow,
  },
  resultsMeta: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  resultsMetaText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  backRow: {
    backgroundColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  backRowText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 15,
    color: theme.colors.yellow,
    letterSpacing: -0.3,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  genreLoading: {
    marginTop: theme.spacing.xl,
  },
  genreTag: {
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.white,
  },
  genreTagText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 13,
    color: theme.colors.ink,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: theme.borders.medium,
    borderBottomColor: theme.colors.ink,
  },
  thumb: {
    width: 54,
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  thumbPlaceholder: {
    width: 54,
    backgroundColor: theme.colors.placeholderA,
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    justifyContent: 'center',
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 15,
    color: theme.colors.ink,
    letterSpacing: -0.3,
  },
  rowMeta: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  addCol: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: theme.borders.medium,
    borderLeftColor: theme.colors.ink,
    backgroundColor: theme.colors.yellow,
  },
  addColActive: {
    backgroundColor: theme.colors.ink,
  },
  addColText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 20,
    color: theme.colors.ink,
  },
  addColTextActive: {
    color: theme.colors.yellow,
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
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
});

export default SearchScreen;
