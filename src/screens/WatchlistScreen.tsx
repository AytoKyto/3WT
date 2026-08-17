import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { theme } from '../styles/theme';
import useMovieStore from '../store/useMovieStore';
import useSeriesStore from '../store/useSeriesStore';
import { Movie } from '../types/movie';
import { TVShow } from '../types/tv';
import { getImageUrl } from '../services/api/tmdb';
import AnimatedTouchable from '../components/AnimatedTouchable';
import MediaTypeToggle, { MediaType } from '../components/MediaTypeToggle';
import { getDisplayTitle as getTitle, getDisplayYear as getYear } from '../utils/media';

type Item = Movie | TVShow;
type FilterType = 'all' | 'watchlist' | 'superliked' | 'watched';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'TOUT' },
  { value: 'watchlist', label: 'À VOIR' },
  { value: 'superliked', label: 'CE SOIR' },
  { value: 'watched', label: 'VUS' },
];

const REORDERABLE_FILTERS: FilterType[] = ['watchlist', 'watched'];

const RANK_HINT: Record<string, string> = {
  watchlist: 'PRIORITÉ DE VISIONNAGE — MAINTENEZ POUR GLISSER, OU TOUCHEZ LE N° POUR LE SAISIR',
  watched: 'CLASSEMENT DE VOS PRÉFÉRÉS — MAINTENEZ POUR GLISSER, OU TOUCHEZ LE N° POUR LE SAISIR',
};

const moveToRank = (list: Item[], fromIndex: number, toRank: number): Item[] => {
  const clampedIndex = Math.min(Math.max(toRank - 1, 0), list.length - 1);
  const copy = [...list];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(clampedIndex, 0, moved);
  return copy;
};

const WatchlistScreen = () => {
  const navigation = useNavigation<any>();
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [filter, setFilter] = useState<FilterType>('all');
  const [rankTarget, setRankTarget] = useState<{ item: Item; index: number } | null>(null);
  const [rankInput, setRankInput] = useState('');

  const movieStore = useMovieStore();
  const seriesStore = useSeriesStore();

  const watchlist: Item[] = mediaType === 'tv' ? seriesStore.watchlist : movieStore.watchlist;
  const superLiked: Item[] = mediaType === 'tv' ? seriesStore.superLikedShows : movieStore.superLikedMovies;
  const watchedList: Item[] = mediaType === 'tv' ? seriesStore.watchedShows : movieStore.watchedMovies;
  const isSuperLiked = mediaType === 'tv' ? seriesStore.isSuperLiked : movieStore.isSuperLiked;
  const isWatched = mediaType === 'tv' ? seriesStore.isWatched : movieStore.isWatched;
  const reorderWatchlist = (data: Item[]) =>
    mediaType === 'tv' ? seriesStore.reorderWatchlist(data as TVShow[]) : movieStore.reorderWatchlist(data as Movie[]);
  const reorderWatched = (data: Item[]) =>
    mediaType === 'tv' ? seriesStore.reorderWatchedShows(data as TVShow[]) : movieStore.reorderWatchedMovies(data as Movie[]);

  const handleMediaTypeChange = (next: MediaType) => {
    setMediaType(next);
    setFilter('all');
    setRankTarget(null);
  };

  const getFilteredItems = (): Item[] => {
    switch (filter) {
      case 'watchlist':
        return watchlist.filter(m => !isSuperLiked(m.id));
      case 'superliked':
        return superLiked;
      case 'watched':
        return watchedList;
      case 'all':
      default:
        return [...watchlist];
    }
  };

  const filteredMovies = getFilteredItems();
  const isReorderable = REORDERABLE_FILTERS.includes(filter);

  const applyReorder = (data: Item[]) => {
    if (filter === 'watchlist') reorderWatchlist(data);
    else if (filter === 'watched') reorderWatched(data);
  };

  const openRankModal = (item: Item, index: number) => {
    setRankTarget({ item, index });
    setRankInput(String(index + 1));
  };

  const confirmRank = () => {
    if (!rankTarget) return;
    const toRank = parseInt(rankInput, 10);
    if (!isNaN(toRank)) {
      applyReorder(moveToRank(filteredMovies, rankTarget.index, toRank));
    }
    setRankTarget(null);
  };

  const renderRow = (item: Item, index: number, drag?: () => void, isActive?: boolean) => {
    const hot = isSuperLiked(item.id);
    const watched = isWatched(item.id);
    const tag = watched ? 'VU' : hot ? 'CE SOIR' : 'À VOIR';
    const isTopWatched = filter === 'watched' && index === 0;
    const rowBg = isActive
      ? theme.colors.yellow
      : isTopWatched || hot ? theme.colors.yellow : index % 2 ? theme.colors.paperAlt : theme.colors.paper;
    const posterUrl = getImageUrl(item.poster_path, 'w200');

    return (
      <View style={[styles.row, { backgroundColor: rowBg }]}>
        {isReorderable ? (
          <TouchableOpacity
            style={styles.numCol}
            onPress={() => openRankModal(item, index)}
            disabled={isActive}
            activeOpacity={0.7}
          >
            {isTopWatched && <Text style={styles.numStar}>★</Text>}
            <Text style={styles.numText}>{String(index + 1).padStart(2, '0')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.numCol}>
            <Text style={styles.numText}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.rowMain}
          onPress={() => navigation.navigate(
            mediaType === 'tv' ? 'SeriesDetail' : 'MovieDetail',
            mediaType === 'tv' ? { show: item } : { movie: item }
          )}
          onLongPress={drag}
          disabled={isActive}
          delayLongPress={180}
          activeOpacity={0.85}
        >
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder} />
          )}
          <View style={styles.infoCol}>
            <Text style={styles.rowTitle} numberOfLines={1}>{getTitle(item).toUpperCase()}</Text>
            <Text style={styles.rowMeta}>
              {getYear(item)} · {item.vote_average.toFixed(1)}/10
            </Text>
          </View>
        </TouchableOpacity>
        {drag && (
          <View style={styles.gripCol}>
            <View style={styles.gripBar} />
            <View style={styles.gripBar} />
            <View style={styles.gripBar} />
          </View>
        )}
        <View style={styles.tagCol}>
          <Text style={styles.tagColText}>{tag}</Text>
        </View>
      </View>
    );
  };

  const renderMovieItem = ({ item, index }: { item: Item; index: number }) =>
    renderRow(item, index, undefined, false);

  const renderDraggableItem = ({ item, getIndex, drag, isActive }: RenderItemParams<Item>) => (
    <ScaleDecorator>
      {renderRow(item, getIndex() ?? 0, drag, isActive)}
    </ScaleDecorator>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {filter === 'watched'
          ? (mediaType === 'tv' ? 'AUCUNE SÉRIE VUE' : 'AUCUN FILM VU')
          : 'LISTE VIDE'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'watched'
          ? (mediaType === 'tv'
            ? 'Les séries que vous marquez comme vues apparaîtront ici.'
            : 'Les films que vous marquez comme vus apparaîtront ici.')
          : (mediaType === 'tv'
            ? 'Swipez des séries pour les ajouter à votre liste.'
            : 'Swipez des films pour les ajouter à votre liste.')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>L'INVEN{'\n'}TAIRE</Text>
        <Text style={styles.subtitle}>
          {watchlist.length} TITRES · {superLiked.length} CE SOIR · {watchedList.length} VUS
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterCell,
              i < FILTERS.length - 1 && styles.filterCellBorder,
              filter === f.value && styles.filterCellActive,
            ]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isReorderable && filteredMovies.length > 1 && (
        <View style={styles.rankBanner}>
          <Text style={styles.rankBannerLabel}>
            {filter === 'watched' ? 'CLASSEMENT' : 'PRIORITÉ'}
          </Text>
          <Text style={styles.rankBannerText}>{RANK_HINT[filter]}</Text>
        </View>
      )}

      {filter === 'watched' && watchedList.length > 1 && (
        <AnimatedTouchable style={styles.duelBar} onPress={() => navigation.navigate('Duel', { mediaType })}>
          <View>
            <Text style={styles.duelBarTitle}>DUEL À MORT</Text>
            <Text style={styles.duelBarSubtitle}>
              {mediaType === 'tv' ? 'CLASSEZ VOS SÉRIES EN VOTANT L\'UNE CONTRE L\'AUTRE' : 'CLASSEZ VOS FILMS EN VOTANT FILM PAR FILM'}
            </Text>
          </View>
          <View style={styles.duelBarIcon}>
            <Text style={styles.duelBarIconText}>⚔</Text>
          </View>
        </AnimatedTouchable>
      )}

      {isReorderable ? (
        <DraggableFlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDraggableItem}
          onDragEnd={({ data }) => applyReorder(data)}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredMovies.length === 0 ? styles.emptyListContainer : undefined}
          activationDistance={0}
        />
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredMovies.length === 0 && styles.emptyListContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AnimatedTouchable style={styles.sortBar} onPress={() => navigation.navigate('Suggestion', { mediaType })}>
        <Text style={styles.sortBarText}>TIRER AU SORT</Text>
        <View style={styles.sortBarIcon}>
          <Text style={styles.sortBarIconText}>▶</Text>
        </View>
      </AnimatedTouchable>

      <Modal
        visible={!!rankTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setRankTarget(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {rankTarget ? getTitle(rankTarget.item).toUpperCase() : ''}
            </Text>
            <Text style={styles.modalSubtitle}>
              NOUVEAU RANG (1 À {filteredMovies.length})
            </Text>
            <TextInput
              style={styles.modalInput}
              value={rankInput}
              onChangeText={setRankInput}
              keyboardType="number-pad"
              autoFocus
              selectTextOnFocus
              maxLength={3}
            />
            <View style={styles.modalActions}>
              <AnimatedTouchable
                style={[styles.modalButton, styles.modalButtonGhost]}
                onPress={() => setRankTarget(null)}
              >
                <Text style={styles.modalButtonGhostText}>ANNULER</Text>
              </AnimatedTouchable>
              <AnimatedTouchable
                style={[styles.modalButton, styles.modalButtonFilled]}
                onPress={confirmRank}
              >
                <Text style={styles.modalButtonFilledText}>VALIDER</Text>
              </AnimatedTouchable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    fontSize: 38,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    letterSpacing: -1.5,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  toggleRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
  },
  filterCell: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
  },
  filterCellBorder: {
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  filterCellActive: {
    backgroundColor: theme.colors.ink,
  },
  filterText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.ink,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  filterTextActive: {
    color: theme.colors.yellow,
  },
  rankBanner: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
  },
  rankBannerLabel: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 13,
    color: theme.colors.yellow,
    letterSpacing: -0.3,
  },
  rankBannerText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.textFaint,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginTop: 2,
  },
  duelBar: {
    backgroundColor: theme.colors.yellow,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  duelBarTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 18,
    color: theme.colors.ink,
    letterSpacing: -0.3,
  },
  duelBarSubtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  duelBarIcon: {
    width: 38,
    height: 38,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duelBarIconText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: theme.borders.medium,
    borderBottomColor: theme.colors.ink,
  },
  numCol: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  numStar: {
    fontSize: 11,
    color: theme.colors.ink,
    marginBottom: 1,
  },
  numText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 14,
    color: theme.colors.ink,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
  },
  thumb: {
    width: 48,
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  thumbPlaceholder: {
    width: 48,
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
  gripCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderLeftWidth: theme.borders.medium,
    borderLeftColor: theme.colors.ink,
  },
  gripBar: {
    width: 14,
    height: 2,
    backgroundColor: theme.colors.ink,
  },
  tagCol: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: theme.borders.medium,
    borderLeftColor: theme.colors.ink,
  },
  tagColText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 9,
    color: theme.colors.ink,
    letterSpacing: theme.typography.letterSpacing.wide,
    textAlign: 'center',
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
  sortBar: {
    backgroundColor: theme.colors.yellow,
    borderTopWidth: theme.borders.thick,
    borderTopColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortBarText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 19,
    color: theme.colors.ink,
    letterSpacing: -0.5,
  },
  sortBarIcon: {
    width: 38,
    height: 38,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBarIconText: {
    color: theme.colors.yellow,
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,20,20,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.paper,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 20,
    color: theme.colors.ink,
    letterSpacing: -0.3,
    lineHeight: 21,
  },
  modalSubtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  modalInput: {
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 28,
    textAlign: 'center',
    color: theme.colors.ink,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  modalButtonGhost: {
    backgroundColor: theme.colors.paper,
  },
  modalButtonFilled: {
    backgroundColor: theme.colors.ink,
  },
  modalButtonGhostText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 13,
    color: theme.colors.ink,
  },
  modalButtonFilledText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 13,
    color: theme.colors.yellow,
  },
});

export default WatchlistScreen;
