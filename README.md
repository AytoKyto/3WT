# 🎬 3WT - What Are We Watching Tonight

Application React Native pour choisir rapidement votre film du soir grâce à un système de swipe style Tinder et une suggestion aléatoire.

## 📱 Fonctionnalités

- **Interface de Swipe** : Découvrez des films en swipant (gauche = passer, droite = ajouter, haut = super like)
- **Écran de Suggestion** 🎲 : Sélection aléatoire pondérée parmi vos films
- **Gestion de Liste** : Films à voir, super likes, films vus
- **Recherche** : Trouvez et ajoutez des films à votre liste
- **Services de Streaming** : Filtrez par vos plateformes (Netflix, Prime, Disney+, etc.)
- **Design Neo-Brutalist** : Interface colorée avec bordures épaisses et style cartoon

## 🚀 Installation

### Prérequis

- Node.js 16+
- npm ou yarn
- Expo CLI
- Compte TheMovieDB pour obtenir une clé API

### Étapes

1. **Cloner le projet**
```bash
cd 3WT
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'API TheMovieDB**
   - Créez un compte sur [TheMovieDB](https://www.themoviedb.org/)
   - Obtenez votre clé API
   - Modifiez le fichier `.env` :
```bash
EXPO_PUBLIC_TMDB_API_KEY=votre_cle_api_ici
```

4. **Lancer l'application**
```bash
npm start
```

Puis :
- Appuyez sur `i` pour iOS
- Appuyez sur `a` pour Android
- Scannez le QR code avec l'app Expo Go sur votre téléphone

## 📁 Structure du Projet

```
3WT/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── screens/         # Écrans de l'application
│   ├── navigation/      # Configuration de navigation
│   ├── services/        # Services API
│   ├── store/          # Gestion d'état (Zustand)
│   ├── styles/         # Thème et styles globaux
│   └── types/          # Types TypeScript
├── assets/             # Images et ressources
└── App.tsx            # Point d'entrée
```

## 🎨 Stack Technique

- **Framework** : React Native avec Expo
- **Langage** : TypeScript
- **Navigation** : React Navigation
- **État** : Zustand
- **Stockage** : AsyncStorage
- **API** : TheMovieDB API
- **Swipe** : react-native-deck-swiper
- **Style** : Design System Neo-Brutalist personnalisé

## 🎯 Utilisation

### Premier lancement

1. L'application vous demandera de sélectionner vos services de streaming
2. Vous pouvez choisir "Tous les films" pour ne pas filtrer

### Navigation

- **Swipe** : Découvrez et ajoutez des films
  - 👈 Swipe gauche : Passer
  - 👉 Swipe droite : Ajouter à la liste
  - 👆 Swipe haut : Super like

- **Suggestion** : Appuyez sur "CHOISIR UN FILM" pour une suggestion aléatoire
  - Filtrez par genre (optionnel)
  - Relancez pour une nouvelle suggestion

- **Ma Liste** : Gérez vos films
  - Filtrez par : Tous, À voir, Super likes, Vus
  - Marquez comme vu ou supprimez

- **Recherche** : Trouvez des films spécifiques

## 🐛 Dépannage

### L'application ne se lance pas
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Nettoyez le cache : `expo start -c`

### Pas de films affichés
- Vérifiez votre clé API dans le fichier `.env`
- Assurez-vous d'avoir une connexion internet

### Erreurs TypeScript
- Exécutez `npx tsc --noEmit` pour vérifier les types

## 📊 Progression du Développement

**Phases complétées : 8/13 (~62%)**

Consultez le fichier [ROADMAP.md](./ROADMAP.md) pour le détail complet du développement.

### Prochaines étapes
- [ ] Détails des films
- [ ] Paramètres utilisateur
- [ ] Notifications
- [ ] Export/Import de données
- [ ] Build pour production

## 📝 License

MIT

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**3WT** - Fini les hésitations pour choisir votre film du soir ! 🍿