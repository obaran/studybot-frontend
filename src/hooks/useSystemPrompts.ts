// =============================================================================
// STUDYBOT FRONTEND - HOOK GESTION PROMPTS SYSTÈME
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Instance API simple pour les prompts système
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SystemPrompt {
  id: string;
  promptId: string;
  content: string;
  version: string;
  title?: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  characterCount: number;
  wordCount: number;
  metadata?: any;
}

export interface CreatePromptRequest {
  content: string;
  title?: string;
  description?: string;
  metadata?: any;
}

export interface UpdatePromptRequest {
  content: string;
  title?: string;
  description?: string;
  changeSummary?: string;
  metadata?: any;
}

export interface SystemPromptStats {
  totalPrompts: number;
  activeVersion: string | null;
  lastUpdated: Date | null;
  averageLength: number;
}

interface UseSystemPromptsReturn {
  // Données
  prompts: SystemPrompt[];
  activePrompt: SystemPrompt | null;
  stats: SystemPromptStats | null;
  
  // États
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Actions
  fetchPrompts: () => Promise<void>;
  fetchActivePrompt: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createPrompt: (data: CreatePromptRequest) => Promise<SystemPrompt | null>;
  updatePrompt: (promptId: string, data: UpdatePromptRequest) => Promise<SystemPrompt | null>;
  restoreVersion: (promptId: string) => Promise<SystemPrompt | null>;
  deletePrompt: (promptId: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

export const useSystemPrompts = (): UseSystemPromptsReturn => {
  // États
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [activePrompt, setActivePrompt] = useState<SystemPrompt | null>(null);
  const [stats, setStats] = useState<SystemPromptStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour gérer les erreurs
  const handleError = useCallback((error: any, action: string) => {
    console.error(`❌ Erreur ${action}:`, error);
    const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || `Erreur lors de ${action}`;
    setError(errorMessage);
  }, []);

  // Récupérer tous les prompts (historique)
  const fetchPrompts = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/admin/system-prompts');
      
      if (response.data.success) {
        const fetchedPrompts = response.data.data.map((prompt: any) => ({
          ...prompt,
          createdAt: new Date(prompt.createdAt)
        }));
        setPrompts(fetchedPrompts);
      } else {
        throw new Error(response.data.message || 'Erreur récupération prompts');
      }
    } catch (error) {
      handleError(error, 'de la récupération des prompts');
    }
  }, [handleError]);

  // Récupérer le prompt actif
  const fetchActivePrompt = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/admin/system-prompts/active');
      
      if (response.data.success) {
        const activeData = {
          ...response.data.data,
          createdAt: new Date(response.data.data.createdAt)
        };
        setActivePrompt(activeData);
      } else {
        setActivePrompt(null);
      }
    } catch (error) {
      // Si pas de prompt actif, ce n'est pas une erreur fatale
      if (error?.response?.status === 404) {
        setActivePrompt(null);
      } else {
        handleError(error, 'de la récupération du prompt actif');
      }
    }
  }, [handleError]);

  // Récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/admin/system-prompts/stats');
      
      if (response.data.success) {
        const statsData = {
          ...response.data.data,
          lastUpdated: response.data.data.lastUpdated 
            ? new Date(response.data.data.lastUpdated) 
            : null
        };
        setStats(statsData);
      } else {
        throw new Error(response.data.message || 'Erreur récupération statistiques');
      }
    } catch (error) {
      handleError(error, 'de la récupération des statistiques');
    }
  }, [handleError]);

  // Créer un nouveau prompt
  const createPrompt = useCallback(async (data: CreatePromptRequest): Promise<SystemPrompt | null> => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.post('/admin/system-prompts', data);
      
      if (response.data.success) {
        const newPrompt = {
          ...response.data.data,
          createdAt: new Date(response.data.data.createdAt)
        };
        
        // Rafraîchir les données
        await Promise.all([fetchPrompts(), fetchActivePrompt(), fetchStats()]);
        
        return newPrompt;
      } else {
        throw new Error(response.data.message || 'Erreur création prompt');
      }
    } catch (error) {
      handleError(error, 'de la création du prompt');
      return null;
    } finally {
      setSaving(false);
    }
  }, [handleError, fetchPrompts, fetchActivePrompt, fetchStats]);

  // Mettre à jour un prompt (créer une nouvelle version)
  const updatePrompt = useCallback(async (promptId: string, data: UpdatePromptRequest): Promise<SystemPrompt | null> => {
    try {
      setSaving(true);
      setError(null);
      
      // On utilise le prompt actif actuel comme base pour la mise à jour
      const currentActivePrompt = activePrompt;
      if (!currentActivePrompt) {
        throw new Error('Aucun prompt actif trouvé');
      }
      
      const response = await api.put(`/admin/system-prompts/${currentActivePrompt.promptId}`, data);
      
      if (response.data.success) {
        const updatedPrompt = {
          ...response.data.data,
          createdAt: new Date(response.data.data.createdAt)
        };
        
        // Rafraîchir les données
        await Promise.all([fetchPrompts(), fetchActivePrompt(), fetchStats()]);
        
        return updatedPrompt;
      } else {
        throw new Error(response.data.message || 'Erreur mise à jour prompt');
      }
    } catch (error) {
      handleError(error, 'de la mise à jour du prompt');
      return null;
    } finally {
      setSaving(false);
    }
  }, [handleError, fetchPrompts, fetchActivePrompt, fetchStats, activePrompt]);

  // Restaurer une version précédente
  const restoreVersion = useCallback(async (promptId: string): Promise<SystemPrompt | null> => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.post(`/admin/system-prompts/${promptId}/restore`);
      
      if (response.data.success) {
        const restoredPrompt = {
          ...response.data.data,
          createdAt: new Date(response.data.data.createdAt)
        };
        
        // Rafraîchir les données
        await Promise.all([fetchPrompts(), fetchActivePrompt(), fetchStats()]);
        
        return restoredPrompt;
      } else {
        throw new Error(response.data.message || 'Erreur restauration version');
      }
    } catch (error) {
      handleError(error, 'de la restauration de la version');
      return null;
    } finally {
      setSaving(false);
    }
  }, [handleError, fetchPrompts, fetchActivePrompt, fetchStats]);

  // Supprimer un prompt
  const deletePrompt = useCallback(async (promptId: string): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.delete(`/admin/system-prompts/${promptId}`);
      
      if (response.data.success) {
        // Rafraîchir les données
        await Promise.all([fetchPrompts(), fetchStats()]);
        return true;
      } else {
        throw new Error(response.data.message || 'Erreur suppression prompt');
      }
    } catch (error) {
      handleError(error, 'de la suppression du prompt');
      return false;
    } finally {
      setSaving(false);
    }
  }, [handleError, fetchPrompts, fetchStats]);

  // Rafraîchir toutes les données
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPrompts(),
        fetchActivePrompt(),
        fetchStats()
      ]);
    } catch (error) {
      // Les erreurs sont déjà gérées dans les fonctions individuelles
    } finally {
      setLoading(false);
    }
  }, [fetchPrompts, fetchActivePrompt, fetchStats]);

  // Charger les données initiales
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // Données
    prompts,
    activePrompt,
    stats,
    
    // États
    loading,
    saving,
    error,
    
    // Actions
    fetchPrompts,
    fetchActivePrompt,
    fetchStats,
    createPrompt,
    updatePrompt,
    restoreVersion,
    deletePrompt,
    refreshAll
  };
}; 