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

export const useWidgetConfig = (token?: string) => {
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
          url = `${API_CONFIG.BASE_URL}/widget/config/${token}`;
        } else {
          url = `${API_CONFIG.ADMIN_BASE_URL}/configuration`;
        }

        const response = await fetch(url);
        
        // 🚨 CORRECTION CRITIQUE: Vérifier le statut HTTP avant de parser JSON
        if (!response.ok) {
          console.error(`❌ Erreur HTTP ${response.status} pour l'URL: ${url}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
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
          // SÉCURITÉ CRITIQUE: Distinguer token invalide vs pas de token
          if (token) {
            // Token fourni mais invalide → ERREUR (sécurité)
            console.error(`Token invalide: ${token}`);
            setError(`Token d'accès invalide ou expiré: ${token}`);
            setConfig(DEFAULT_CONFIG); // Fallback pour éviter crash
          } else {
            // Pas de token → Configuration par défaut (normal)
            console.warn('Aucun token fourni, utilisation de la configuration par défaut');
            setConfig(DEFAULT_CONFIG);
          }
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
  }, []);

  // 🔄 Actualisation automatique sur focus de la fenêtre (SEULEMENT pour admin, pas pour tokens)
  useEffect(() => {
    const handleFocus = () => {
      // SÉCURITÉ: Ne pas actualiser si on a un token (évite de reset les erreurs d'accès)
      if (!token) {
        console.log('🔄 Focus détecté, actualisation de la configuration admin...');
        refetchConfig();
      } else {
        console.log('🔄 Focus détecté mais token présent, pas d\'actualisation (sécurité)');
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  // 🎯 Écoute de l'événement personnalisé pour actualisation immédiate après sauvegarde admin
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🎯 Événement widgetConfigUpdated détecté, actualisation immédiate...');
      refetchConfig();
    };

    window.addEventListener('widgetConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('widgetConfigUpdated', handleConfigUpdate);
  }, []);

  // 🌐 Écoute des messages cross-frame pour synchronisation iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WIDGET_CONFIG_UPDATED') {
        console.log('🌐 [ChatOnly] Message cross-frame reçu, actualisation configuration...');
        refetchConfig();
        
        // Confirmer la synchronisation au parent
        if (event.source && typeof event.source.postMessage === 'function') {
          (event.source as Window).postMessage({
            type: 'WIDGET_CONFIG_UPDATED_CONFIRMED',
            timestamp: Date.now()
          }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ⏰ SUPPRIMÉ: Polling périodique (causait logs répétitifs)
  // La synchronisation se fait maintenant uniquement via:
  // 1. Événements admin (widgetConfigUpdated)
  // 2. Messages cross-frame
  // 3. Focus window (admin seulement)

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
        
        // 🚨 CORRECTION CRITIQUE: Vérifier le statut HTTP avant de parser JSON
        if (!response.ok) {
          console.error(`❌ Erreur HTTP ${response.status} pour l'URL: ${url}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
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
          // SÉCURITÉ CRITIQUE: Distinguer token invalide vs pas de token (MÊME LOGIQUE que useEffect initial)
          if (token) {
            // Token fourni mais invalide → ERREUR (sécurité)
            console.error(`Token invalide lors du refresh: ${token}`);
            setError(`Token d'accès invalide ou expiré: ${token}`);
            setConfig(DEFAULT_CONFIG); // Fallback pour éviter crash
          } else {
            // Pas de token → Configuration par défaut (normal)
            console.warn('Aucun token fourni lors du refresh, utilisation de la configuration par défaut');
            setConfig(DEFAULT_CONFIG);
          }
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
