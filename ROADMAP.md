# 🎬 3WT - What Are We Watching Tonight 
## Roadmap de développement

### 📋 Vue d'ensemble
Application React Native de suggestion de films avec interface de swipe, base de données locale et intégration TheMovieDB API.

---

## Phase 1: 🚀 Initialisation du projet ✅
### Configuration de base
- [x] Initialiser le projet React Native avec Expo ou React Native CLI
- [x] Configurer l'environnement de développement (iOS/Android)
- [x] Mettre en place la structure de dossiers du projet
- [x] Installer les dépendances de base
- [x] Configurer ESLint et Prettier
- [x] Initialiser Git et créer le repository

### Configuration API
- [ ] Créer un compte TheMovieDB et obtenir la clé API
- [x] Configurer les variables d'environnement
- [x] Créer le service API de base
- [ ] Tester les endpoints principaux (discover, search, movie details)

---

## Phase 2: 🏗️ Architecture & Infrastructure ✅
### Base de données locale
- [x] Installer et configurer AsyncStorage ou Realm
- [x] Créer le schéma de données pour les films
- [x] Créer le schéma pour les préférences utilisateur
- [x] Créer le schéma pour les services de streaming
- [x] Implémenter les fonctions CRUD de base

### Gestion d'état
- [x] Installer et configurer Redux/Zustand/Context API
- [x] Créer les stores pour:
  - [x] Films à voir
  - [x] Préférences utilisateur
  - [x] Services de streaming
  - [x] État de l'application

### Navigation
- [x] Installer React Navigation
- [x] Configurer la structure de navigation (Tab + Stack)
- [x] Créer les routes principales

---

## Phase 3: 🎨 Design System Neo-Brutalist ✅
### Fondations du design
- [x] Définir la palette de couleurs (couleurs vives, contrastées)
- [x] Définir la typographie (police bold, grande taille)
- [x] Créer les variables de style globales
- [x] Définir les ombres et bordures épaisses caractéristiques

### Composants de base
- [x] Créer le composant Button (bordures épaisses, ombres décalées)
- [x] Créer le composant Card (style cartoon, bordures noires)
- [ ] Créer le composant Input (style neo-brutalist)
- [ ] Créer le composant Modal
- [ ] Créer les composants de texte stylisés
- [ ] Créer les animations de base (bounce, shake)

---

## Phase 4: 📱 Écrans d'onboarding ✅
### Écran de bienvenue
- [x] Créer l'écran splash avec logo 3WT
- [ ] Animer le logo d'entrée

### Configuration initiale
- [x] Créer l'écran de sélection des services de streaming
- [x] Design des cartes de services (Netflix, Prime, Disney+, etc.)
- [x] Logique de sélection multiple
- [x] Sauvegarde des préférences
- [x] Option "Voir tous les films"

---

## Phase 5: 🎯 Écran principal de swipe (Tinder-like) ✅
### Interface de swipe
- [x] Installer react-native-deck-swiper ou créer un composant custom
- [x] Créer la carte de film avec:
  - [x] Poster
  - [x] Titre
  - [x] Note
  - [x] Année
  - [ ] Genres
  - [x] Synopsis court
- [x] Implémenter les gestes de swipe (gauche = passer, droite = ajouter)
- [x] Ajouter les animations de swipe
- [x] Créer les indicateurs visuels (❌ et ✅)

### Logique de swipe
- [x] Charger les films depuis l'API
- [x] Gérer la pagination
- [ ] Filtrer par services de streaming disponibles
- [x] Ajouter les films likés à la liste
- [x] Gérer l'historique des films vus

### Actions supplémentaires
- [ ] Bouton "Annuler" le dernier swipe
- [ ] Bouton "Super like" (ajouter en priorité)
- [ ] Bouton "Plus d'infos" pour voir les détails

---

## Phase 6: 🔍 Écran de recherche ✅
### Interface de recherche
- [x] Créer la barre de recherche
- [x] Implémenter la recherche en temps réel (debounce)
- [x] Créer la grille/liste de résultats
- [x] Afficher les posters et infos basiques

### Fonctionnalités de recherche
- [x] Recherche par titre
- [ ] Filtres par:
  - [ ] Genre
  - [ ] Année
  - [ ] Note minimum
  - [ ] Service de streaming
- [x] Ajouter à la liste depuis les résultats
- [ ] Voir les détails d'un film

---

## Phase 7: 📚 Ma liste de films ✅
### Affichage de la liste
- [x] Créer la vue liste/grille
- [x] Afficher les films sauvegardés
- [ ] Trier par:
  - [ ] Date d'ajout
  - [ ] Note
  - [ ] Alphabétique
- [x] Filtrer par genre
- [ ] Recherche dans la liste

### Gestion de la liste
- [x] Supprimer un film
- [x] Marquer comme "Vu"
- [ ] Créer des catégories personnalisées
- [ ] Export/Import de la liste

---

## Phase 8: 🎲 Écran de suggestion (Le plus important!) ✅
### Interface de suggestion
- [x] Créer l'écran principal avec grand bouton "Choisir un film"
- [x] Sélecteur de catégorie (optionnel)
- [x] Animation de sélection aléatoire (roulette, cartes qui défilent)
- [x] Affichage du film suggéré en grand

### Logique de suggestion
- [x] Algorithme de sélection aléatoire pondéré
- [x] Prendre en compte:
  - [x] Les genres préférés
  - [x] Les films super-likés (priorité)
  - [ ] L'historique (éviter les répétitions)
- [x] Option "Relancer" pour une nouvelle suggestion
- [x] Option "Accepter" qui marque le film comme "À regarder ce soir"

### Présentation du résultat
- [x] Animation d'apparition du film choisi
- [x] Afficher toutes les infos importantes
- [ ] Lien vers le service de streaming
- [ ] Option de partage

---

## Phase 9: ⚙️ Paramètres
### Préférences utilisateur
- [ ] Gérer les services de streaming
- [ ] Réinitialiser la liste
- [ ] Exporter/Importer les données
- [ ] Choix du thème (si plusieurs variants neo-brutalist)

### Paramètres de suggestion
- [ ] Fréquence de répétition des suggestions
- [ ] Préférences de genres
- [ ] Durée maximum des films

---

## Phase 10: 🎬 Détails d'un film
### Écran de détails
- [ ] Affichage complet des informations
- [ ] Bande-annonce (YouTube API)
- [ ] Cast principal
- [ ] Films similaires
- [ ] Où regarder (JustWatch API optionnel)
- [ ] Ajouter/Retirer de la liste
- [ ] Partager

---

## Phase 11: ✨ Fonctionnalités avancées
### Notifications
- [ ] Rappel quotidien pour choisir le film du soir
- [ ] Notifications de nouvelles sorties

### Statistiques
- [ ] Films vus
- [ ] Genres préférés
- [ ] Temps de visionnage total

### Social (optionnel)
- [ ] Partager une suggestion
- [ ] Créer des listes partagées

---

## Phase 12: 🧪 Tests & Optimisation
### Tests
- [ ] Tests unitaires des fonctions critiques
- [ ] Tests d'intégration
- [ ] Tests de performance
- [ ] Tests sur différents devices

### Optimisation
- [ ] Optimiser les images (lazy loading, cache)
- [ ] Optimiser les animations
- [ ] Réduire la taille du bundle
- [ ] Améliorer le temps de démarrage

---

## Phase 13: 🚀 Préparation au lancement
### Finalisation
- [ ] Icône de l'application
- [ ] Écrans de chargement
- [ ] Screenshots pour les stores
- [ ] Description de l'application

### Déploiement
- [ ] Build iOS
- [ ] Build Android
- [ ] Tests sur TestFlight/Google Play Beta
- [ ] Soumission aux stores

---

## 📊 Progression globale

**Phases complétées:** 8/13  
**Progression:** ~62%

### Priorités
1. 🔴 **Critique**: Phase 8 (Écran de suggestion)
2. 🟠 **Haute**: Phases 1-2, 5 (Setup, Swipe)
3. 🟡 **Moyenne**: Phases 3-4, 6-7 (Design, Recherche)
4. 🟢 **Basse**: Phases 9-11 (Features avancées)

### Timeline estimée
- **MVP (Phases 1-8):** 8-10 semaines
- **Version complète:** 12-16 semaines

---

## 📝 Notes techniques

### Stack recommandé
- **Framework:** React Native (Expo ou CLI)
- **Navigation:** React Navigation
- **État:** Zustand ou Redux Toolkit
- **Base de données:** AsyncStorage ou Realm
- **Animations:** React Native Reanimated
- **Swipe:** react-native-deck-swiper
- **API:** Axios
- **Styling:** StyleSheet + styled-components

### APIs nécessaires
- **TheMovieDB API** (principale)
- **JustWatch API** (optionnel pour streaming)
- **YouTube API** (optionnel pour trailers)

### Ressources Design Neo-Brutalist
- Couleurs vives et contrastées
- Bordures noires épaisses (3-5px)
- Ombres décalées colorées
- Typographie bold et grande
- Formes géométriques simples
- Animations cartoon (bounce, wobble)