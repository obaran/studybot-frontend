(function() {
  'use strict';

  // ====================================================================
  // STUDYBOT WIDGET - SCRIPT D'INTÉGRATION JAVASCRIPT
  // ====================================================================

  // Vérifier si le widget est déjà chargé
  if (window.StudyBotWidgetLoaded) {
    console.warn('StudyBot Widget déjà chargé');
    return;
  }

  // Marquer comme chargé
  window.StudyBotWidgetLoaded = true;

  // Configuration par défaut
  const defaultConfig = {
    apiUrl: 'http://localhost:3001',
    baseUrl: 'http://localhost:5173',
    token: 'default-emlyon-2025',
    theme: {
      primaryColor: '#e2001a',
      secondaryColor: '#b50015',
      position: 'bottom-right',
      language: 'fr'
    },
    welcome: {
      message: 'Bonjour ! Je suis votre assistant virtuel emlyon.',
      delay: 2000
    },
    footer: {
      text: 'Powered by emlyon business school',
      link: 'https://emlyon.com'
    }
  };

  // Fusionner avec la configuration utilisateur
  const config = window.StudyBotConfig ? 
    Object.assign({}, defaultConfig, window.StudyBotConfig) : 
    defaultConfig;

  // Fonction pour créer le widget
  function createWidget() {
    try {
      // Créer l'iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'studybot-widget-iframe';
      iframe.src = `${config.baseUrl}/bot?token=${config.token}`;
      iframe.style.cssText = `
        position: fixed !important;
        bottom: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        z-index: 999999 !important;
        pointer-events: none !important;
        background: transparent !important;
      `;
      iframe.allow = 'microphone';
      iframe.frameBorder = '0';

      // Ajouter l'iframe au body
      document.body.appendChild(iframe);

      // Permettre les interactions uniquement avec le widget
      iframe.addEventListener('load', function() {
        iframe.style.pointerEvents = 'auto';
      });

      console.log('✅ StudyBot Widget intégré avec succès');
      console.log('🔧 Configuration:', {
        token: config.token,
        baseUrl: config.baseUrl,
        apiUrl: config.apiUrl
      });

    } catch (error) {
      console.error('❌ Erreur lors de la création du StudyBot Widget:', error);
    }
  }

  // Fonction pour injecter les styles CSS
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'studybot-widget-styles';
    style.textContent = `
      /* StudyBot Widget Styles */
      #studybot-widget-iframe {
        transition: all 0.3s ease !important;
      }
      
      /* Responsive pour mobile */
      @media (max-width: 768px) {
        #studybot-widget-iframe {
          width: 100vw !important;
          height: 100vh !important;
        }
      }
      
      /* Masquer les scrollbars du site hôte si nécessaire */
      body.studybot-active {
        overflow: hidden !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Fonction d'initialisation
  function initializeWidget() {
    // Injecter les styles
    injectStyles();
    
    // Créer le widget
    createWidget();

    // API globale pour contrôler le widget
    window.StudyBot = {
      version: '1.0.0',
      config: config,
      
      // Recharger le widget avec nouvelle config
      reload: function(newConfig) {
        if (newConfig) {
          Object.assign(config, newConfig);
        }
        
        const existingIframe = document.getElementById('studybot-widget-iframe');
        if (existingIframe) {
          existingIframe.remove();
        }
        
        createWidget();
      },
      
      // Masquer le widget
      hide: function() {
        const iframe = document.getElementById('studybot-widget-iframe');
        if (iframe) {
          iframe.style.display = 'none';
        }
      },
      
      // Afficher le widget
      show: function() {
        const iframe = document.getElementById('studybot-widget-iframe');
        if (iframe) {
          iframe.style.display = 'block';
        }
      },
      
      // Détruire le widget
      destroy: function() {
        const iframe = document.getElementById('studybot-widget-iframe');
        const styles = document.getElementById('studybot-widget-styles');
        
        if (iframe) iframe.remove();
        if (styles) styles.remove();
        
        window.StudyBotWidgetLoaded = false;
        delete window.StudyBot;
        delete window.StudyBotConfig;
      }
    };

    // Message de bienvenue différé si configuré
    if (config.welcome && config.welcome.delay && config.welcome.delay > 0) {
      setTimeout(function() {
        console.log('👋 ' + config.welcome.message);
      }, config.welcome.delay);
    }
  }

  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }

  // Message de debug
  console.log('📦 StudyBot Widget Script chargé - Version 1.0.0');
  console.log('🎯 Token:', config.token);
  console.log('🌐 Base URL:', config.baseUrl);

})(); 