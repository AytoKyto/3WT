import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Logo from '../components/Logo';
import AnimatedTouchable from '../components/AnimatedTouchable';
import useStreamingStore from '../store/useStreamingStore';
import { STREAMING_SERVICES } from '../types/streaming';
import { useFadeIn, useSlideIn, useStagger } from '../hooks/useAnimations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FEATURES = [
  'SWIPE POUR DÉCOUVRIR',
  'CRÉEZ VOTRE LISTE',
  'UN FILM AU HASARD',
  'FINI LES HÉSITATIONS',
];

// ===== Maquettes illustratives du tutoriel (statiques, non interactives) =====

const MockSwipe = () => (
  <View style={mockStyles.swipeWrap}>
    <View style={mockStyles.swipeCard}>
      <View style={mockStyles.swipePoster} />
      <View style={mockStyles.swipeFooter}>
        <View style={mockStyles.barLine} />
        <View style={[mockStyles.barLine, { width: '55%' }]} />
      </View>
    </View>
    <View style={[mockStyles.dirTag, mockStyles.dirLeft]}>
      <Text style={mockStyles.dirText}>NON</Text>
    </View>
    <View style={[mockStyles.dirTag, mockStyles.dirRight, mockStyles.dirYellow]}>
      <Text style={mockStyles.dirText}>OUI</Text>
    </View>
    <View style={[mockStyles.dirTag, mockStyles.dirTop, mockStyles.dirInk]}>
      <Text style={mockStyles.dirTextYellow}>CE SOIR</Text>
    </View>
    <View style={[mockStyles.dirTag, mockStyles.dirBottom]}>
      <Text style={mockStyles.dirText}>VU</Text>
    </View>
  </View>
);

const MockSort = () => (
  <View style={mockStyles.sortWrap}>
    <View style={mockStyles.die}>
      <Text style={mockStyles.dieText}>SORT</Text>
    </View>
    <View style={mockStyles.chipsRow}>
      <View style={mockStyles.chip}><Text style={mockStyles.chipText}>GENRE</Text></View>
      <View style={mockStyles.chip}><Text style={mockStyles.chipText}>PLATEFORME</Text></View>
    </View>
  </View>
);

const MockList = () => (
  <View style={mockStyles.listWrap}>
    {[1, 2, 3].map((n) => (
      <View key={n} style={mockStyles.listRow}>
        <View style={[mockStyles.listNum, n === 1 && mockStyles.listNumTop]}>
          <Text style={mockStyles.listNumText}>{n === 1 ? '★' : `0${n}`}</Text>
        </View>
        <View style={mockStyles.listBarWrap}>
          <View style={mockStyles.barLine} />
        </View>
        <View style={mockStyles.grip}>
          <View style={mockStyles.gripDot} />
          <View style={mockStyles.gripDot} />
          <View style={mockStyles.gripDot} />
        </View>
      </View>
    ))}
  </View>
);

const MockDuel = () => (
  <View style={mockStyles.duelWrap}>
    <View style={mockStyles.duelCard} />
    <View style={mockStyles.vsBadge}>
      <Text style={mockStyles.vsText}>VS</Text>
    </View>
    <View style={mockStyles.duelCard} />
  </View>
);

const MockSearch = () => (
  <View style={mockStyles.searchWrap}>
    <View style={mockStyles.searchBar}>
      <Text style={mockStyles.searchSlash}>/</Text>
      <View style={mockStyles.searchLine} />
    </View>
    <View style={mockStyles.tabsRow}>
      <View style={[mockStyles.tab, mockStyles.tabActive]}>
        <Text style={mockStyles.tabTextActive}>FILMS</Text>
      </View>
      <View style={mockStyles.tab}>
        <Text style={mockStyles.tabText}>PERSONNES</Text>
      </View>
      <View style={mockStyles.tab}>
        <Text style={mockStyles.tabText}>GENRES</Text>
      </View>
    </View>
  </View>
);

const TUTORIAL_SLIDES = [
  {
    key: 'swipe',
    title: 'SWIPE POUR\nDÉCIDER',
    text: "Glissez à gauche pour refuser, à droite pour ajouter à votre liste, vers le haut pour un coup de cœur \"ce soir\", et vers le bas pour marquer un film comme déjà vu.",
    Mock: MockSwipe,
  },
  {
    key: 'sort',
    title: 'LE SORT\nDÉCIDE POUR VOUS',
    text: "Plus envie de choisir ? Filtrez par genre ou par plateforme, et laissez le tirage au sort piocher un film dans votre liste — vérifié disponible chez vous.",
    Mock: MockSort,
  },
  {
    key: 'list',
    title: "L'INVENTAIRE\nÀ VOTRE FAÇON",
    text: "Classez vos films à voir par priorité, et vos films vus par préférence : glissez pour réordonner, ou touchez le numéro pour saisir directement un rang.",
    Mock: MockList,
  },
  {
    key: 'duel',
    title: 'DUEL À MORT\nLE JEU',
    text: "Deux films, un seul gagnant. Choisissez votre préféré à chaque duel : le classement de vos films vus se construit tout seul, match après match.",
    Mock: MockDuel,
  },
  {
    key: 'search',
    title: 'CHERCHER\nSANS LIMITE',
    text: "Par titre, par acteur ou réalisateur, ou par genre — trouvez et ajoutez n'importe quel film à votre liste en quelques secondes.",
    Mock: MockSearch,
  },
];

const OnboardingScreen = () => {
  const {
    selectedServices,
    toggleService,
    setShowAllMovies,
    showAllMovies,
    completeOnboarding,
  } = useStreamingStore();

  const [step, setStep] = useState(1);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const tutorialScrollRef = useRef<ScrollView>(null);

  const handleServiceToggle = (serviceId: string) => {
    toggleService(serviceId);
  };

  const handleAllMoviesToggle = () => {
    setShowAllMovies(!showAllMovies);
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      completeOnboarding();
    }
  };

  const canContinue = showAllMovies || selectedServices.length > 0;
  const selectedCount = showAllMovies ? STREAMING_SERVICES.length + 1 : selectedServices.length;

  const logoFade = useFadeIn(600);
  const titleSlide = useSlideIn('top', 30, 500);
  const subtitleFade = useFadeIn(800);

  const goToTutorialSlide = (index: number) => {
    tutorialScrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setTutorialIndex(index);
  };

  const handleTutorialScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setTutorialIndex(index);
  };

  const handleTutorialNext = () => {
    if (tutorialIndex < TUTORIAL_SLIDES.length - 1) {
      goToTutorialSlide(tutorialIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  if (step === 1) {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>9:41</Text>
          <Text style={styles.topBarText}>ÉTAPE 1 / 3</Text>
        </View>

        <View style={styles.introContent}>
          <Animated.View style={[styles.logoWrap, logoFade]}>
            <Logo variant="block" colorway="principale" size={148} />
          </Animated.View>
          <Text style={styles.logoSubtitle}>THREE WAYS TO WATCH</Text>

          <Animated.Text style={[styles.title, titleSlide]}>
            WHAT ARE WE{'\n'}WATCHING TONIGHT ?
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleFade]}>
            L'app qui choisit votre film du soir en un swipe.
          </Animated.Text>

          <View style={styles.featureList}>
            {FEATURES.map((feature, i) => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureIndex}>0{i + 1}</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.introFooter}>
          <Button
            title="C'est parti"
            onPress={handleContinue}
            size="large"
            color="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>ÉTAPE 2 / 3</Text>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.topBarLink}>← RETOUR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>OÙ EST-CE{'\n'}QUE VOUS{'\n'}PAYEZ DÉJÀ ?</Text>
          <Text style={styles.stepSubtitle}>
            On ne vous proposera que des films que vous pouvez lancer ce soir.
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.grid}>
          <View style={styles.servicesGrid}>
            {STREAMING_SERVICES.map((service, index) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <AnimatedServiceCard
                  key={service.id}
                  name={service.name}
                  isSelected={isSelected}
                  onToggle={() => handleServiceToggle(service.id)}
                  index={index}
                />
              );
            })}
            <AnimatedServiceCard
              name="TOUS LES FILMS"
              isSelected={showAllMovies}
              onToggle={handleAllMoviesToggle}
              index={STREAMING_SERVICES.length}
            />
          </View>
        </ScrollView>

        <AnimatedTouchable
          style={[styles.footerBar, !canContinue && styles.footerBarDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <View>
            <Text style={styles.footerBarTitle}>CONTINUER</Text>
            <Text style={styles.footerBarSubtitle}>
              {selectedCount} SERVICE{selectedCount > 1 ? 'S' : ''} SÉLECTIONNÉ{selectedCount > 1 ? 'S' : ''}
            </Text>
          </View>
          <View style={styles.footerArrow}>
            <Text style={styles.footerArrowText}>→</Text>
          </View>
        </AnimatedTouchable>
      </SafeAreaView>
    );
  }

  // Step 3 — tutoriel des fonctionnalités
  const isLastSlide = tutorialIndex === TUTORIAL_SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.darkContainer}>
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>ÉTAPE 3 / 3</Text>
        <TouchableOpacity onPress={completeOnboarding}>
          <Text style={styles.topBarLink}>PASSER →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={tutorialScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleTutorialScrollEnd}
      >
        {TUTORIAL_SLIDES.map((slide, i) => {
          const Mock = slide.Mock;
          return (
            <View key={slide.key} style={[styles.tutorialSlide, { width: SCREEN_WIDTH }]}>
              <Text style={styles.tutorialEyebrow}>FONCTIONNALITÉ 0{i + 1} / {TUTORIAL_SLIDES.length}</Text>
              <Text style={styles.tutorialTitle}>{slide.title}</Text>
              <Text style={styles.tutorialText}>{slide.text}</Text>
              <View style={styles.tutorialMockFrame}>
                <Mock />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dotsRow}>
        {TUTORIAL_SLIDES.map((slide, i) => (
          <TouchableOpacity key={slide.key} onPress={() => goToTutorialSlide(i)} hitSlop={8}>
            <View style={[styles.dot, i === tutorialIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <AnimatedTouchable style={styles.footerBar} onPress={handleTutorialNext}>
        <View>
          <Text style={styles.footerBarTitle}>{isLastSlide ? "C'EST PARTI" : 'SUIVANT'}</Text>
          <Text style={styles.footerBarSubtitle}>
            {isLastSlide ? 'VOUS ÊTES PRÊT' : `${tutorialIndex + 1} SUR ${TUTORIAL_SLIDES.length}`}
          </Text>
        </View>
        <View style={styles.footerArrow}>
          <Text style={styles.footerArrowText}>→</Text>
        </View>
      </AnimatedTouchable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: theme.colors.ink,
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.yellow,
  },
  topBarText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: theme.colors.yellow,
  },
  topBarLink: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: theme.colors.paper,
  },

  // Step 1
  introContent: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  logoWrap: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  logoSubtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.textFaint,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 30,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.paper,
    letterSpacing: -1,
    lineHeight: 32,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    color: theme.colors.textFaint,
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  featureList: {
    borderTopWidth: theme.borders.thick,
    borderTopColor: theme.colors.yellow,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borders.thin,
    borderBottomColor: '#2a2a2a',
    gap: theme.spacing.md,
  },
  featureIndex: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: theme.colors.yellow,
  },
  featureText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 15,
    color: theme.colors.paper,
    letterSpacing: -0.3,
  },
  introFooter: {
    padding: theme.spacing.lg,
  },

  // Step 2
  stepHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: theme.borders.thick,
    borderBottomColor: theme.colors.yellow,
  },
  stepTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.yellow,
    letterSpacing: -1,
    lineHeight: 32,
    marginBottom: theme.spacing.sm,
  },
  stepSubtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 12,
    color: theme.colors.textFaint,
    lineHeight: 18,
  },
  grid: {
    flex: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceCard: {
    height: 110,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    borderRightWidth: theme.borders.thick,
    borderBottomWidth: theme.borders.thick,
    borderColor: theme.colors.yellow,
  },
  serviceName: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.black,
    letterSpacing: -0.5,
    lineHeight: 19,
  },
  serviceState: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    letterSpacing: theme.typography.letterSpacing.mono,
  },

  // Step 3 — tutoriel
  tutorialSlide: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  tutorialEyebrow: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.yellow,
    letterSpacing: theme.typography.letterSpacing.mono,
    marginBottom: theme.spacing.sm,
  },
  tutorialTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 30,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.paper,
    letterSpacing: -1,
    lineHeight: 30,
    marginBottom: theme.spacing.md,
  },
  tutorialText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    color: theme.colors.textFaint,
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  tutorialMockFrame: {
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.yellow,
    backgroundColor: theme.colors.paper,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#2a2a2a',
  },
  dotActive: {
    backgroundColor: theme.colors.yellow,
  },

  footerBar: {
    backgroundColor: theme.colors.yellow,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerBarDisabled: {
    opacity: theme.opacity.disabled,
  },
  footerBarTitle: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 22,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.ink,
    letterSpacing: -0.5,
  },
  footerBarSubtitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  footerArrow: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerArrowText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 18,
    color: theme.colors.yellow,
  },
});

const mockStyles = StyleSheet.create({
  // Swipe
  swipeWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeCard: {
    width: 110,
    height: 150,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
  },
  swipePoster: {
    width: '100%',
    height: '65%',
    backgroundColor: theme.colors.placeholderA,
    borderBottomWidth: theme.borders.medium,
    borderBottomColor: theme.colors.ink,
  },
  swipeFooter: {
    padding: 8,
    gap: 5,
  },
  barLine: {
    height: 4,
    width: '80%',
    backgroundColor: theme.colors.ink,
  },
  dirTag: {
    position: 'absolute',
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dirLeft: { left: 0, top: '48%' },
  dirRight: { right: 0, top: '48%' },
  dirTop: { top: 0, alignSelf: 'center' },
  dirBottom: { bottom: 0, alignSelf: 'center' },
  dirYellow: { backgroundColor: theme.colors.yellow },
  dirInk: { backgroundColor: theme.colors.ink },
  dirText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 10,
    color: theme.colors.ink,
  },
  dirTextYellow: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 10,
    color: theme.colors.yellow,
  },

  // Sort
  sortWrap: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  die: {
    width: 72,
    height: 72,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dieText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 13,
    color: theme.colors.yellow,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chip: {
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9,
    color: theme.colors.ink,
  },

  // List
  listWrap: {
    width: '100%',
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 36,
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
  },
  listNum: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  listNumTop: {
    backgroundColor: theme.colors.yellow,
  },
  listNumText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 11,
    color: theme.colors.ink,
  },
  listBarWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  grip: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderLeftWidth: theme.borders.medium,
    borderLeftColor: theme.colors.ink,
  },
  gripDot: {
    width: 10,
    height: 2,
    backgroundColor: theme.colors.ink,
  },

  // Duel
  duelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  duelCard: {
    width: 80,
    height: 110,
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.placeholderA,
  },
  vsBadge: {
    width: 34,
    height: 34,
    backgroundColor: theme.colors.ink,
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 12,
    color: theme.colors.yellow,
  },

  // Search
  searchWrap: {
    width: '100%',
    gap: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchSlash: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    fontSize: 16,
    color: theme.colors.yellow,
  },
  searchLine: {
    flex: 1,
    height: 3,
    backgroundColor: theme.colors.paper,
  },
  tabsRow: {
    flexDirection: 'row',
    borderWidth: theme.borders.medium,
    borderColor: theme.colors.ink,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  tabActive: {
    backgroundColor: theme.colors.ink,
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 8,
    color: theme.colors.ink,
  },
  tabTextActive: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 8,
    color: theme.colors.yellow,
  },
});

// Tuile de service animée avec effet stagger
const AnimatedServiceCard = ({
  name,
  isSelected,
  onToggle,
  index,
}: {
  name: string;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) => {
  const staggerStyle = useStagger(index);

  return (
    <Animated.View style={[staggerStyle, { width: '50%' }]}>
      <AnimatedTouchable onPress={onToggle}>
        <View
          style={[
            styles.serviceCard,
            { backgroundColor: isSelected ? theme.colors.yellow : theme.colors.ink },
          ]}
        >
          <Text
            style={[
              styles.serviceName,
              { color: isSelected ? theme.colors.ink : theme.colors.paper },
            ]}
          >
            {name.toUpperCase()}
          </Text>
          <Text
            style={[
              styles.serviceState,
              { color: isSelected ? theme.colors.ink : theme.colors.textFaint },
            ]}
          >
            {isSelected ? 'ACTIVÉ' : 'TOUCHER'}
          </Text>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default OnboardingScreen;
