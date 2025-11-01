# 🔄 LBC ReLister

Une extension Chrome pour relister rapidement vos annonces sur leboncoin.fr.

## 🚀 Installation

1. Clonez ce dépôt ou téléchargez-le en ZIP
2. Ouvrez Chrome et allez dans `chrome://extensions`
3. Activez le "Mode développeur" en haut à droite
4. Cliquez sur "Charger l'extension non empaquetée" et sélectionnez le dossier de l'extension
5. Accédez à votre [tableau de bord Leboncoin](https://www.leboncoin.fr/compte/part/mes-annonces)

## 📖 Utilisation

1. Allez sur votre [tableau de bord Leboncoin](https://www.leboncoin.fr/compte/part/mes-annonces)
2. Cliquez sur le bouton **✨ Republier** à côté de n'importe quelle annonce
3. Mettez à jour le prix si nécessaire (ou gardez le prix actuel)
4. Confirmez l'action
5. Attendez que le processus de republication automatique se termine

L'extension va :
- ✅ Supprimer votre ancienne annonce
- ✅ Créer une nouvelle annonce avec le même contenu
- ✅ Mettre à jour le prix si vous l'avez modifié
- ✅ Actualiser le tableau de bord pour afficher la nouvelle annonce

## 🛠️ Développement

### Structure du projet

```
lbc-republish/
├── src/
│   ├── main.js          # Point d'entrée et initialisation
│   ├── config.js        # Configuration de l'application
│   ├── utils.js         # Fonctions utilitaires
│   ├── auth.js          # Authentification et headers
│   ├── notifications.js # Gestionnaire de notifications
│   ├── api.js           # Appels API et traitement des données
│   ├── ui.js            # Interface utilisateur et injection DOM
│   ├── sentry.js        # Configuration Sentry
│   ├── popup.html       # Interface popup
│   ├── popup.css        # Styles popup
│   └── popup.js         # Script popup
├── dist/                # Fichiers compilés (générés)
├── manifest.json        # Manifest Chrome Extension
├── rollup.config.js     # Configuration build
└── package.json         # Dépendances npm
```

### Scripts de build

```bash
# Production build (removes console.log)
npm run build

# Development build (keeps console.log)
npm run build:dev

# Development mode with auto-reload (keeps console.log)
npm run dev
```

**Note:** Le build de production (`npm run build`) supprime automatiquement tous les `console.log` pour optimiser les performances. Utilisez `npm run build:dev` ou `npm run dev` pour garder les logs pendant le développement.

### Preview des composants UI

Pour prévisualiser et tester les styles des composants (popup, notifications, boutons, icônes), ouvrez `preview.html` dans votre navigateur :

```bash
# Windows
start preview.html

# macOS
open preview.html

# Linux
xdg-open preview.html
```

Ce fichier contient tous les composants UI avec des contrôles interactifs pour tester les différents états.

### Icônes de l'extension

Les icônes de l'extension sont disponibles dans le dossier `icons/` (formats SVG et PNG). L'icône principale (`icon-48.png`) est **automatiquement embarquée** dans le bundle JavaScript lors de la compilation grâce à `@rollup/plugin-image`.

**Caractéristiques :**
- Simple "L" blanc sur fond mauve avec dégradé
- Embarquée en base64 dans le build pour fonctionner dans les content scripts (world: MAIN)
- Utilisée dans les notifications et l'interface de l'extension
- Aucune dépendance aux APIs Chrome pour l'affichage

## 📝 Licence

Licence MIT - Libre d'utilisation et de modification

## ☕ Soutien

Si vous trouvez cette extension utile, envisagez de soutenir le projet :
- ⭐ Mettre une étoile à ce dépôt
- 🐛 Signaler des bugs
- 💡 Suggérer des fonctionnalités
- ☕ [M'offrir un café](https://www.buymeacoffee.com/yourusername)

## ⚠️ Avertissement

Cette extension n'est pas affiliée ni approuvée par Leboncoin. À utiliser à vos propres risques. Respectez toujours les Conditions d'utilisation de Leboncoin.

---

**Fait avec ❤️ pour les utilisateurs de Leboncoin**
