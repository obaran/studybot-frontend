import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SessionData {
  id: string;
  createdAt: string;
  lastActivity: string;
}

const SESSION_STORAGE_KEY = 'studybot_session';
const SESSION_EXPIRY_HOURS = 24; // Session expire après 24h

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isNewSession, setIsNewSession] = useState(false);

  // Vérifier si une session est expirée
  const isSessionExpired = useCallback((session: SessionData): boolean => {
    const now = new Date().getTime();
    const lastActivity = new Date(session.lastActivity).getTime();
    const expiryTime = SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
    
    return (now - lastActivity) > expiryTime;
  }, []);

  // Charger ou créer une session
  const initializeSession = useCallback(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      
      if (storedSession) {
        const session: SessionData = JSON.parse(storedSession);
        
        // Vérifier si la session n'est pas expirée
        if (!isSessionExpired(session)) {
          setSessionId(session.id);
          setIsNewSession(false);
          
          // Mettre à jour l'activité
          const updatedSession: SessionData = {
            ...session,
            lastActivity: new Date().toISOString()
          };
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
          
          console.log('📡 Session restaurée:', session.id);
          return;
        } else {
          console.log('⏰ Session expirée, création d\'une nouvelle session');
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      
      // Créer une nouvelle session
      const newSessionId = `session_${Date.now()}_${uuidv4()}`;
      const newSession: SessionData = {
        id: newSessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      setSessionId(newSessionId);
      setIsNewSession(true);
      
      console.log('🆕 Nouvelle session créée:', newSessionId);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de session:', error);
      
      // Fallback: créer une session temporaire
      const fallbackSessionId = `session_${Date.now()}_${uuidv4()}`;
      setSessionId(fallbackSessionId);
      setIsNewSession(true);
    }
  }, [isSessionExpired]);

  // Mettre à jour l'activité de la session
  const updateSessionActivity = useCallback(() => {
    if (!sessionId) return;
    
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const session: SessionData = JSON.parse(storedSession);
        const updatedSession: SessionData = {
          ...session,
          lastActivity: new Date().toISOString()
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour d\'activité:', error);
    }
  }, [sessionId]);

  // Réinitialiser la session (bouton reset)
  const resetSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      
      // Créer une nouvelle session
      const newSessionId = `session_${Date.now()}_${uuidv4()}`;
      const newSession: SessionData = {
        id: newSessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      setSessionId(newSessionId);
      setIsNewSession(true);
      
      console.log('🔄 Session réinitialisée:', newSessionId);
      
      return newSessionId;
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      
      // Fallback
      const fallbackSessionId = `session_${Date.now()}_${uuidv4()}`;
      setSessionId(fallbackSessionId);
      setIsNewSession(true);
      return fallbackSessionId;
    }
  }, []);

  // Obtenir les informations de session
  const getSessionInfo = useCallback((): SessionData | null => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      return storedSession ? JSON.parse(storedSession) : null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos de session:', error);
      return null;
    }
  }, []);

  // Initialiser la session au montage du composant
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    sessionId,
    isNewSession,
    updateSessionActivity,
    resetSession,
    getSessionInfo,
    isSessionExpired
  };
}; 