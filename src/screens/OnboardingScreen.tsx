import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import useStreamingStore from '../store/useStreamingStore';
import { STREAMING_SERVICES } from '../types/streaming';
import { useFadeIn, useSlideIn, useStagger } from '../hooks/useAnimations';

const OnboardingScreen = () => {
  const {
    selectedServices,
    toggleService,
    setShowAllMovies,
    showAllMovies,
    completeOnboarding,
  } = useStreamingStore();

  const [step, setStep] = useState(1);

  const handleServiceToggle = (serviceId: string) => {
    toggleService(serviceId);
  };

  const handleAllMoviesToggle = () => {
    setShowAllMovies(!showAllMovies);
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      completeOnboarding();
    }
  };

  const canContinue = showAllMovies || selectedServices.length > 0;

  // Animation styles for step 1
  const logoFade = useFadeIn(600);
  const titleSlide = useSlideIn('top', 30, 500);
  const subtitleFade = useFadeIn(800);

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Animated.Text style={[styles.logo, logoFade]}>3WT</Animated.Text>
          <Animated.Text style={[styles.title, titleSlide]}>What Are We{'\n'}Watching Tonight?</Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleFade]}>
            L'app qui choisit votre film du soir en un swipe !
          </Animated.Text>

          <Card style={styles.featureCard} animated slideDirection="bottom">
            <View style={styles.features}>
              <Text style={styles.featureItem}>👆 Swipe pour découvrir</Text>
              <Text style={styles.featureItem}>📚 Créez votre liste</Text>
              <Text style={styles.featureItem}>🎲 Un film au hasard</Text>
              <Text style={styles.featureItem}>🎬 Fini les hésitations</Text>
            </View>
          </Card>

          <Button
            title="C'est parti !"
            onPress={handleContinue}
            size="large"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.stepTitle}>Choisissez vos plateformes</Text>
          <Text style={styles.stepSubtitle}>
            Sélectionnez les services de streaming que vous avez
          </Text>

          <View style={styles.servicesGrid}>
            {STREAMING_SERVICES.map((service, index) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <AnimatedServiceCard
                  key={service.id}
                  service={service}
                  isSelected={isSelected}
                  onToggle={() => handleServiceToggle(service.id)}
                  index={index}
                />
              );
            })}

            <AnimatedAllMoviesCard
              showAllMovies={showAllMovies}
              onToggle={handleAllMoviesToggle}
              index={STREAMING_SERVICES.length}
            />
          </View>

          <Button
            title="Continuer"
            onPress={handleContinue}
            disabled={!canContinue}
            size="large"
            style={styles.button}
            variant="filled"
          />

          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 72,
    fontWeight: '900',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: '900',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.fontSize.xxxl * 1.1,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  features: {
    alignItems: 'center',
  },
  featureItem: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginVertical: theme.spacing.sm,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '900',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  serviceCard: {
    width: 160,
    height: 120,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  serviceCardSelected: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
  },
  serviceEmoji: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  serviceName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  button: {
    marginBottom: theme.spacing.lg,
  },
  backText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

// Animated Service Card Component with stagger
const AnimatedServiceCard = ({ service, isSelected, onToggle, index }: any) => {
  const staggerStyle = useStagger(index);

  return (
    <Animated.View style={staggerStyle}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <Card
          style={{
            ...styles.serviceCard,
            ...(isSelected ? styles.serviceCardSelected : {}),
            borderColor: isSelected ? service.color : theme.colors.border,
          }}
        >
          <Text style={styles.serviceEmoji}>
            {service.id === 'netflix' && '🎬'}
            {service.id === 'prime' && '📺'}
            {service.id === 'disney' && '🏰'}
            {service.id === 'canal' && '🎭'}
            {service.id === 'apple' && '🍎'}
          </Text>
          <Text style={styles.serviceName}>{service.name}</Text>
          {isSelected && (
            <View style={[styles.checkmark, { backgroundColor: service.color }]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated All Movies Card with stagger
const AnimatedAllMoviesCard = ({ showAllMovies, onToggle, index }: any) => {
  const staggerStyle = useStagger(index);

  return (
    <Animated.View style={staggerStyle}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <Card
          style={{
            ...styles.serviceCard,
            ...(showAllMovies ? styles.serviceCardSelected : {}),
            borderColor: showAllMovies ? theme.colors.primary : theme.colors.border,
          }}
        >
          <Text style={styles.serviceEmoji}>🌍</Text>
          <Text style={styles.serviceName}>Tous les films</Text>
          {showAllMovies && (
            <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OnboardingScreen;