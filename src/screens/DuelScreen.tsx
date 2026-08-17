import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { theme } from '../styles/theme';
import useMovieStore from '../store/useMovieStore';
import useSeriesStore from '../store/useSeriesStore';
import { Movie } from '../types/movie';
import { TVShow } from '../types/tv';
import { getImageUrl } from '../services/api/tmdb';
import AnimatedTouchable from '../components/AnimatedTouchable';
import MediaTypeToggle, { MediaType } from '../components/MediaTypeToggle';
import { getDisplayTitle } from '../utils/media';

type Item = Movie | TVShow;

const pickRandomPair = (items: Item[]): [Item, Item] | null => {
  if (items.length < 2) return null;
  const i = Math.floor(Math.random() * items.length);
  let j = Math.floor(Math.random() * items.length);
  while (j === i) j = Math.floor(Math.random() * items.length);
  return [items[i], items[j]];
};

const DuelScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [mediaType, setMediaType] = useState<MediaType>(route.params?.mediaType === 'tv' ? 'tv' : 'movie');

  const movieStore = useMovieStore();
  const seriesStore = useSeriesStore();

  const watchedList: Item[] = mediaType === 'tv' ? seriesStore.watchedShows : movieStore.watchedMovies;
  const getEloRating = mediaType === 'tv' ? seriesStore.getEloRating : movieStore.getEloRating;
  const recordDuel = mediaType === 'tv' ? seriesStore.recordDuel : movieStore.recordDuel;

  const [pair, setPair] = useState<[Item, Item] | null>(null);
  const [duelCount, setDuelCount] = useState(0);
  const [pickedId, setPickedId] = useState<number | null>(null);

  useEffect(() => {
    setPair(pickRandomPair(watchedList));
    setPickedId(null);
    setDuelCount(0);
  }, [mediaType]);

  const handleMediaTypeChange = (next: MediaType) => {
    if (next === mediaType) return;
    setMediaType(next);
  };

  const handleChoice = (winner: Item, loser: Item) => {
    if (pickedId) return;
    setPickedId(winner.id);
    recordDuel(winner.id, loser.id);

    setTimeout(() => {
      setPickedId(null);
      setDuelCount((c) => c + 1);
      setPair(pickRandomPair(mediaType === 'tv' ? useSeriesStore.getState().watchedShows : useMovieStore.getState().watchedMovies));
    }, 450);
  };

  if (watchedList.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.topBarText}>← RETOUR</Text>
          </TouchableOpacity>
          <Text style={styles.topBarText}>DUEL À MORT</Text>
        </View>
        <View style={styles.toggleRow}>
          <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {mediaType === 'tv' ? 'PAS ASSEZ DE SÉRIES VUES' : 'PAS ASSEZ DE FILMS VUS'}
          </Text>
          <Text style={styles.emptyText}>
            {mediaType === 'tv'
              ? "Il faut au moins 2 séries marquées comme vues pour lancer un duel. Swipez, tirez au sort, ou glissez vers le bas sur une carte pour en marquer une."
              : "Il faut au moins 2 films marqués comme vus pour lancer un duel. Swipez, tirez au sort, ou glissez vers le bas sur une carte pour en marquer un."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pair) return null;

  const [left, right] = pair;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.topBarText}>← RETOUR</Text>
        </TouchableOpacity>
        <Text style={styles.topBarText}>DUEL {String(duelCount + 1).padStart(2, '0')}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>QUI{'\n'}GAGNE ?</Text>
        <Text style={styles.subtitle}>
          TAPEZ VOTRE PRÉFÉRÉ — LE SCORE SE MET À JOUR EN DIRECT
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />
      </View>

      <View style={styles.battleArea}>
        <DuelCard
          item={left}
          opponent={right}
          isWinner={pickedId === left.id}
          isLoser={pickedId !== null && pickedId !== left.id}
          disabled={pickedId !== null}
          score={getEloRating(left.id)}
          onChoose={handleChoice}
        />
        <View style={styles.vsBadge}>
          <Text style={styles.vsBadgeText}>VS</Text>
        </View>
        <DuelCard
          item={right}
          opponent={left}
          isWinner={pickedId === right.id}
          isLoser={pickedId !== null && pickedId !== right.id}
          disabled={pickedId !== null}
          score={getEloRating(right.id)}
          onChoose={handleChoice}
        />
      </View>

      <AnimatedTouchable style={styles.rankingBar} onPress={() => navigation.goBack()}>
        <Text style={styles.rankingBarText}>VOIR LE CLASSEMENT</Text>
        <View style={styles.rankingBarIcon}>
          <Text style={styles.rankingBarIconText}>↑</Text>
        </View>
      </AnimatedTouchable>
    </SafeAreaView>
  );
};

interface DuelCardProps {
  item: Item;
  opponent: Item;
  isWinner: boolean;
  isLoser: boolean;
  disabled: boolean;
  score: number;
  onChoose: (winner: Item, loser: Item) => void;
}

// Petit pop du gagnant + fondu du perdant au moment du choix, plutôt
// qu'un changement d'état instantané.
const DuelCard: React.FC<DuelCardProps> = ({ item, opponent, isWinner, isLoser, disabled, score, onChoose }) => {
  const posterUrl = getImageUrl(item.poster_path, 'w500');

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isWinner ? 1.03 : 1, theme.animation.easing.springGentle) }],
    opacity: withTiming(isLoser ? 0.35 : 1, { duration: theme.animation.duration.fast }),
  }), [isWinner, isLoser]);

  return (
    <Animated.View style={[styles.card, isWinner && styles.cardWinner, animatedStyle]}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => onChoose(item, opponent)}
        activeOpacity={0.85}
        disabled={disabled}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.cardPoster} resizeMode="cover" />
        ) : (
          <View style={styles.cardPosterPlaceholder} />
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{getDisplayTitle(item).toUpperCase()}</Text>
          <View style={styles.cardScoreTag}>
            <Text style={styles.cardScoreText}>{score}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
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
    paddingTop: theme.spacing.md,
  },
  title: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 34,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    letterSpacing: -1,
    lineHeight: 32,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  battleArea: {
    flex: 1,
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    height: '86%',
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
  },
  cardWinner: {
    borderColor: theme.colors.yellow,
    backgroundColor: theme.colors.yellow,
  },
  cardLoser: {
    opacity: 0.35,
  },
  cardPoster: {
    width: '100%',
    height: '72%',
  },
  cardPosterPlaceholder: {
    width: '100%',
    height: '72%',
    backgroundColor: theme.colors.placeholderA,
  },
  cardInfo: {
    flex: 1,
    padding: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 14,
    color: theme.colors.ink,
    letterSpacing: -0.2,
    lineHeight: 15,
  },
  cardScoreTag: {
    alignSelf: 'flex-start',
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    marginTop: theme.spacing.xs,
  },
  cardScoreText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.ink,
  },
  vsBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -22,
    marginTop: -22,
    width: 44,
    height: 44,
    backgroundColor: theme.colors.ink,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  vsBadgeText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 15,
    color: theme.colors.yellow,
  },
  rankingBar: {
    backgroundColor: theme.colors.ink,
    borderTopWidth: theme.borders.thick,
    borderTopColor: theme.colors.ink,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankingBarText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 17,
    color: theme.colors.yellow,
    letterSpacing: -0.3,
  },
  rankingBarIcon: {
    width: 34,
    height: 34,
    backgroundColor: theme.colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingBarIconText: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DuelScreen;
