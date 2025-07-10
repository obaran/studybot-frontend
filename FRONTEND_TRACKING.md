# 🎨 Frontend Tracking - Studybot Platform

**Module :** Interface Utilisateur & Widget Embeddable  
**Technologies :** React + TypeScript + Styled Components  
**Dernière mise à jour :** `${new Date().toLocaleDateString('fr-FR')}`

---

## 🎯 Objectifs du Frontend

1. **Widget Chatbot Embeddable** - Reproduire et améliorer votre design Flowise
2. **Interface d'Administration** - Dashboard pour gérer les chatbots
3. **Système Responsive** - Compatible mobile/desktop
4. **Thèmes Personnalisables** - Configuration visuelle complète

---

## 📊 Progression Globale

| Composant | Status | Progression | Tests |
|-----------|--------|-------------|-------|
| 🏗️ Structure Base | ⏳ En attente | 0% | ❌ |
| 🤖 Widget Chat | ⏳ En attente | 0% | ❌ |
| 👤 Interface Admin | ⏳ En attente | 0% | ❌ |
| 🎨 Système Thèmes | ⏳ En attente | 0% | ❌ |
| 📱 Responsive | ⏳ En attente | 0% | ❌ |

---

## 🏗️ Phase 1 : Configuration & Structure de Base

### ⏳ 1.1 Setup Initial React
- [ ] Initialisation projet React + TypeScript
- [ ] Configuration ESLint + Prettier
- [ ] Installation dépendances principales
- [ ] Structure des dossiers composants
- [ ] Configuration des variables d'environnement

### ⏳ 1.2 Architecture Composants
```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Widget/         # Widget embeddable
│   │   ├── Admin/          # Interface admin
│   │   └── Common/         # Composants partagés
│   ├── hooks/              # Custom hooks React
│   ├── services/           # Services API
│   ├── types/              # Types TypeScript
│   ├── styles/             # Styles globaux
│   └── utils/              # Utilitaires
```

### ⏳ 1.3 Configuration Build & Deploy
- [ ] Configuration Webpack pour embed
- [ ] Configuration CORS pour iframe
- [ ] Build séparés (Widget + Admin)
- [ ] Variables d'environnement par build

---

## 🤖 Phase 2 : Widget Chatbot Embeddable

### ⏳ 2.1 Composants Widget de Base
- [ ] **BubbleButton** - Bouton flottant avec votre design
  - [ ] Position configurable (gauche/droite)
  - [ ] Icône personnalisable
  - [ ] Animation de pulsation
  - [ ] Drag & Drop fonctionnel
  
- [ ] **ChatWindow** - Fenêtre de conversation
  - [ ] Header avec titre et avatar
  - [ ] Zone messages scrollable
  - [ ] Input avec bouton envoi
  - [ ] Footer personnalisable

- [ ] **MessageBubble** - Bulles de messages
  - [ ] Messages utilisateur (votre style doré)
  - [ ] Messages bot (style gris clair)
  - [ ] Avatars configurables
  - [ ] Timestamps optionnels

### ⏳ 2.2 Système de Thèmes
Reproduction exacte de votre configuration Flowise :

```typescript
interface WidgetTheme {
  button: {
    backgroundColor: string;    // #d4a94e
    position: 'bottom-left' | 'bottom-right';
    size: number;              // 48px
    iconColor: string;         // white
    customIconSrc?: string;    // URL icône
  };
  chatWindow: {
    backgroundColor: string;   // #ffffff
    width: number;            // 400px
    height: number;           // 700px (responsive)
    title: string;            // "Studybot"
    titleAvatarSrc?: string;  // Avatar titre
    welcomeMessage: string;   // Message bienvenue
    botMessage: {
      backgroundColor: string; // #f7f8ff
      textColor: string;       // #303235
      avatarSrc?: string;     // Avatar bot
    };
    userMessage: {
      backgroundColor: string; // #d4a94e
      textColor: string;       // #ffffff
      avatarSrc?: string;     // Avatar user
    };
    footer?: {
      text: string;           // "Powered by"
      company: string;        // "emlyon business school"
      companyLink: string;    // "https://em-lyon.com/"
    };
  };
}
```

### ⏳ 2.3 Fonctionnalités Avancées
- [ ] **Système Feedback** - Boutons like/dislike sur messages bot
- [ ] **Indicateur Typing** - Animation "bot écrit..."
- [ ] **Sons Notifications** - Sons envoi/réception
- [ ] **Historique Local** - Sauvegarde session localStorage
- [ ] **Mode Responsive** - Adaptation mobile automatique

### ⏳ 2.4 Système d'Embed
- [ ] **Script d'intégration** simple :
```html
<script src="https://votre-domain.com/widget.js"></script>
<script>
  StudybotWidget.init({
    chatbotId: 'your-chatbot-id',
    theme: { /* configuration */ }
  });
</script>
```

- [ ] **iFrame sécurisé** avec postMessage
- [ ] **Configuration dynamique** via API
- [ ] **Multi-chatbots** sur même page

---

## 👤 Phase 3 : Interface d'Administration

### ⏳ 3.1 Authentification
- [ ] **Page Login** - Design professionnel
- [ ] **Gestion JWT** - Tokens sécurisés
- [ ] **Protection Routes** - PrivateRoute component
- [ ] **Session Management** - Auto-logout

### ⏳ 3.2 Dashboard Principal
- [ ] **Vue d'ensemble** - Métriques principales
- [ ] **Liste Chatbots** - Tous les bots configurés
- [ ] **Statut Services** - Santé système
- [ ] **Activité Récente** - Logs temps réel

### ⏳ 3.3 Configuration Chatbots
- [ ] **Éditeur Prompt Système** - Interface WYSIWYG
- [ ] **Configuration Thème** - Préview temps réel
- [ ] **Gestion URLs Scraping** - Ajout/suppression sources
- [ ] **Domaines Autorisés** - Whitelist domaines
- [ ] **Activation/Désactivation** - Toggle bot

### ⏳ 3.4 Analytics & Monitoring
- [ ] **Graphiques Usage** - Recharts integration
  - [ ] Sessions par jour
  - [ ] Messages par heure
  - [ ] Temps de réponse moyen
  - [ ] Taux de satisfaction

- [ ] **Questions Fréquentes** - Top questions
- [ ] **Gestion Feedbacks** - Reviews utilisateurs
- [ ] **Export Données** - CSV/JSON
- [ ] **Rapports Personnalisés** - Filtres avancés

---

## 📱 Phase 4 : Responsive & UX

### ⏳ 4.1 Mobile First Design
- [ ] **Breakpoints** - sm, md, lg, xl
- [ ] **Widget Mobile** - Adaptation automatique
- [ ] **Touch Gestures** - Swipe, pinch
- [ ] **Orientation** - Portrait/paysage

### ⏳ 4.2 Accessibility (A11Y)
- [ ] **ARIA Labels** - Screen readers
- [ ] **Keyboard Navigation** - Tab index
- [ ] **Contrast Colors** - WCAG compliance
- [ ] **Focus Management** - Visible focus

### ⏳ 4.3 Performance
- [ ] **Lazy Loading** - Composants
- [ ] **Code Splitting** - Routes
- [ ] **Image Optimization** - WebP, lazy
- [ ] **Bundle Analysis** - Webpack bundle analyzer

---

## 🧪 Phase 5 : Tests & Validation

### ⏳ 5.1 Tests Unitaires
- [ ] **Jest + RTL** - Testing Library
- [ ] **Composants Widget** - Tous les composants
- [ ] **Hooks Customs** - Logic business
- [ ] **Services API** - Mocks

### ⏳ 5.2 Tests d'Intégration
- [ ] **Cypress** - E2E testing
- [ ] **Embed Widget** - Iframe tests
- [ ] **Admin Flow** - User journeys
- [ ] **Cross-browser** - Chrome, Firefox, Safari

### ⏳ 5.3 Tests Performance
- [ ] **Lighthouse** - Performance scores
- [ ] **Bundle Size** - Optimizations
- [ ] **Load Time** - Métriques
- [ ] **Memory Leaks** - Profiling

---

## 🚀 Phase 6 : Build & Déploiement

### ⏳ 6.1 Configuration Production
- [ ] **Environment Variables** - Production config
- [ ] **Build Optimization** - Minification
- [ ] **CDN Assets** - Static files
- [ ] **Service Worker** - Caching

### ⏳ 6.2 Azure Deployment
- [ ] **Azure App Service** - Configuration
- [ ] **Custom Domain** - SSL certificates
- [ ] **CI/CD Pipeline** - GitHub Actions
- [ ] **Monitoring** - Application Insights

---

## 🐛 Issues Frontend

| Date | Issue | Priorité | Status | Solution |
|------|-------|----------|--------|----------|
| - | - | - | - | - |

---

## 📋 Resources & References

### Design Reference
- Votre configuration Flowise actuelle
- Couleurs emlyon : `#d4a94e` (doré), `#f7f8ff` (gris clair)
- Icons : Lucide React
- Fonts : System fonts (performance)

### Documentation
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Styled Components](https://styled-components.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**🔄 Mise à jour automatique lors du développement** 