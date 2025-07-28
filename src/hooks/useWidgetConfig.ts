// =============================================================================
// HOOK POUR LA CONFIGURATION WIDGET EN TEMPS RÉEL
// =============================================================================

import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

interface WidgetConfig {
  organization: string;
  welcomeMessage: string;
  footerText: string;
  footerLink?: string;
  primaryColor: string;
  secondaryColor: string;
  botAvatarUrl?: string;
  userAvatarUrl?: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  language: string;
  apiUrl: string;
  refetch?: () => void;
}

const DEFAULT_CONFIG: WidgetConfig = {
  organization: 'emlyon business school',
  welcomeMessage: '👋 Bienvenue ! Je suis votre assistant virtuel pour répondre à vos questions administratives. 🚨 Veuillez ne pas transmettre d\'informations personnelles. 🔔 Studybot peut faire des erreurs. Envisagez de vérifier les informations importantes. Comment puis-je vous aider aujourd\'hui ?',
  footerText: 'Powered by emlyon business school',
  footerLink: 'https://emlyon.com',
  primaryColor: '#e2001a',
  secondaryColor: '#b50015',
  position: 'bottom-right',
  language: 'fr',
  apiUrl: API_CONFIG.BASE_URL
};

export function useWidgetConfig(token?: string) {
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        let url: string;
        if (token) {
          // Configuration publique via token
          url = `${API_CONFIG.BASE_URL}/widget/config/${token}`;
        } else {
          // Configuration admin (pour le dashboard)
          url = `${API_CONFIG.ADMIN_BASE_URL}/configuration`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
          setConfig({
            organization: data.data.organization || DEFAULT_CONFIG.organization,
            welcomeMessage: data.data.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
            footerText: data.data.footerText || DEFAULT_CONFIG.footerText,
            footerLink: data.data.footerLink || DEFAULT_CONFIG.footerLink,
            primaryColor: data.data.primaryColor || DEFAULT_CONFIG.primaryColor,
            secondaryColor: data.data.secondaryColor || DEFAULT_CONFIG.secondaryColor,
            botAvatarUrl: data.data.botAvatarUrl,
            userAvatarUrl: data.data.userAvatarUrl,
            position: data.data.position || DEFAULT_CONFIG.position,
            language: data.data.language || DEFAULT_CONFIG.language,
            apiUrl: data.data.apiUrl || DEFAULT_CONFIG.apiUrl
          });
        } else {
          console.warn('Configuration non trouvée, utilisation des valeurs par défaut');
          setConfig(DEFAULT_CONFIG);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration:', err);
        setError('Erreur lors du chargement de la configuration');
        setConfig(DEFAULT_CONFIG);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [token]);

  // 🔄 Actualisation automatique sur focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Focus détecté, actualisation de la configuration...');
      refetchConfig();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 🎯 Écoute de l'événement personnalisé pour actualisation immédiate après sauvegarde admin
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🎯 Événement widgetConfigUpdated détecté, actualisation immédiate...');
      refetchConfig();
    };

    window.addEventListener('widgetConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('widgetConfigUpdated', handleConfigUpdate);
  }, []);

  // ⏰ Polling périodique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Polling automatique de la configuration...');
      refetchConfig();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  // Fonction pour recharger la configuration
  const refetchConfig = () => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        let url: string;
        if (token) {
          url = `${API_CONFIG.BASE_URL}/widget/config/${token}`;
        } else {
          url = `${API_CONFIG.ADMIN_BASE_URL}/configuration`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
          setConfig({
            organization: data.data.organization || DEFAULT_CONFIG.organization,
            welcomeMessage: data.data.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
            footerText: data.data.footerText || DEFAULT_CONFIG.footerText,
            footerLink: data.data.footerLink || DEFAULT_CONFIG.footerLink,
            primaryColor: data.data.primaryColor || DEFAULT_CONFIG.primaryColor,
            secondaryColor: data.data.secondaryColor || DEFAULT_CONFIG.secondaryColor,
            botAvatarUrl: data.data.botAvatarUrl,
            userAvatarUrl: data.data.userAvatarUrl,
            position: data.data.position || DEFAULT_CONFIG.position,
            language: data.data.language || DEFAULT_CONFIG.language,
            apiUrl: data.data.apiUrl || DEFAULT_CONFIG.apiUrl
          });
        }
      } catch (err) {
        console.error('Erreur lors du rechargement de la configuration:', err);
        setError('Erreur lors du rechargement de la configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  };

  return {
    config,
    loading,
    error,
    refetch: refetchConfig
  };
}
