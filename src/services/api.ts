// =============================================================================
// STUDYBOT FRONTEND - SERVICE API
// =============================================================================

import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Instance axios configurée
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 secondes pour les appels OpenAI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types pour l'API
export interface ChatRequest {
  message: string;
  sessionId?: string;
  chatbot?: 'studybot' | 'bibliobot';
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  messageId: string;
  tokensUsed: number;
  model: string;
  responseTime: number;
  sources?: string[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

// Service API StudyBot
export class StudyBotAPI {
  /**
   * Envoyer un message au chatbot
   */
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await api.post<APIResponse<ChatResponse>>('/chat/message', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur API sendMessage:', error);
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Erreur de communication: ${message}`);
      }
      
      throw error;
    }
  }

  /**
   * Envoyer un message en mode mock (pour les tests)
   */
  static async sendMessageMock(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await api.post<APIResponse<ChatResponse>>('/chat/message-mock', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur API sendMessageMock:', error);
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Erreur de communication: ${message}`);
      }
      
      throw error;
    }
  }

  /**
   * Tester la connexion aux services
   */
  static async testServices(): Promise<{
    openai: { success: boolean; model: string; endpoint: string };
    qdrant: { success: boolean; collectionExists: boolean; pointsCount: number; url: string };
    status: string;
  }> {
    try {
      const response = await api.get('/chat/test');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Test services failed');
      }
    } catch (error) {
      console.error('❌ Erreur API testServices:', error);
      throw error;
    }
  }

  /**
   * Obtenir les informations de la collection Qdrant
   */
  static async getQdrantInfo(): Promise<{
    name: string;
    pointsCount: number;
    vectorSize: number;
    status: string;
  }> {
    try {
      const response = await api.get('/chat/qdrant-info');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Qdrant info failed');
      }
    } catch (error) {
      console.error('❌ Erreur API getQdrantInfo:', error);
      throw error;
    }
  }

  /**
   * Rechercher directement dans Qdrant (pour debug)
   */
  static async searchQdrant(query: string, limit: number = 5, threshold: number = 0.7): Promise<{
    query: string;
    results: Array<{
      content: string;
      score: number;
      metadata?: any;
    }>;
    count: number;
  }> {
    try {
      const response = await api.post('/chat/search', {
        query,
        limit,
        threshold
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Search failed');
      }
    } catch (error) {
      console.error('❌ Erreur API searchQdrant:', error);
      throw error;
    }
  }

  /**
   * Envoyer un feedback utilisateur
   */
  static async submitFeedback(feedbackData: {
    sessionId: string;
    messageId: string;
    type: 'positive' | 'negative';
    comment?: string;
  }): Promise<{
    feedbackId: string;
    sessionId: string;
    messageId: string;
    type: 'positive' | 'negative';
    comment?: string;
  }> {
    try {
      const response = await api.post('/chat/feedback', feedbackData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Feedback submission failed');
      }
    } catch (error) {
      console.error('❌ Erreur API submitFeedback:', error);
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Erreur lors de l'envoi du feedback: ${message}`);
      }
      
      throw error;
    }
  }
}

// Configuration pour le développement
if (import.meta.env.DEV) {
  // Interceptor pour logger les requêtes en dev
  api.interceptors.request.use(
    (config) => {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
      return config;
    },
    (error) => {
      console.error('📤 API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor pour logger les réponses en dev
  api.interceptors.response.use(
    (response) => {
      console.log(`📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      return response;
    },
    (error) => {
      console.error(`📥 API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

export default StudyBotAPI; 