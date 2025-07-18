// Configuration API pour StudyBot Admin Dashboard

export const API_CONFIG = {
  // URLs de base
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  ADMIN_BASE_URL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001/api/admin',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',

  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 secondes
  UPLOAD_TIMEOUT: 120000, // 2 minutes pour les uploads

  // Configuration des uploads
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB par défaut
  ALLOWED_FILE_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),

  // Mode de développement
  DEBUG: import.meta.env.VITE_DEBUG_API === 'true',
  CHAT_MODE: import.meta.env.VITE_CHAT_MODE || 'mock',

  // Authentication
  AUTH_PROVIDER: import.meta.env.VITE_AUTH_PROVIDER || 'local',
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes avant expiration

  // Pagination par défaut
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 seconde

  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Azure Configuration (pour la production)
  AZURE: {
    STORAGE_URL: import.meta.env.VITE_AZURE_STORAGE_URL,
    STORAGE_ACCOUNT: import.meta.env.VITE_AZURE_STORAGE_ACCOUNT,
  }
} as const;

// Types pour la validation des endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Conversations
  CONVERSATIONS: {
    LIST: '/conversations',
    DETAIL: (id: string) => `/conversations/${id}`,
    SEARCH: '/conversations/search',
    EXPORT: '/conversations/export',
  },

  // System Prompt
  SYSTEM_PROMPT: {
    LIST: '/system-prompt',
    DETAIL: (id: string) => `/system-prompt/${id}`,
    ACTIVE: '/system-prompt/active',
    ACTIVATE: (id: string) => `/system-prompt/${id}/activate`,
    HISTORY: (id: string) => `/system-prompt/${id}/history`,
  },

  // Configuration
  CONFIGURATION: {
    GET: '/configuration',
    UPDATE: '/configuration',
    UPLOAD: '/configuration/upload',
    INTEGRATION_LINKS: '/configuration/integration-links',
    REGENERATE_TOKEN: '/configuration/regenerate-token',
  },

  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    RESEND_INVITATION: (id: string) => `/users/${id}/resend-invitation`,
  },

  // Analytics
  ANALYTICS: {
    METRICS: '/analytics/metrics',
    USAGE: '/analytics/usage',
    EXPORT: '/analytics/export',
  }
} as const;

// Validation des variables d'environnement
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifications obligatoires
  if (!API_CONFIG.BASE_URL) {
    errors.push('VITE_API_URL est requis');
  }

  if (!API_CONFIG.ADMIN_BASE_URL) {
    errors.push('VITE_ADMIN_API_URL est requis');
  }

  // Vérifications conditionnelles
  if (API_CONFIG.CHAT_MODE === 'production' && API_CONFIG.BASE_URL.includes('localhost')) {
    errors.push('URL de production ne peut pas être localhost');
  }

  if (API_CONFIG.MAX_FILE_SIZE > 10 * 1024 * 1024) { // 10MB
    errors.push('Taille maximale de fichier trop élevée (max 10MB)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utilitaires
export function getFullUrl(endpoint: string, baseUrl: string = API_CONFIG.ADMIN_BASE_URL): string {
  return `${baseUrl}${endpoint}`;
}

export function isValidFileType(file: File): boolean {
  return API_CONFIG.ALLOWED_FILE_TYPES.includes(file.type);
}

export function isValidFileSize(file: File): boolean {
  return file.size <= API_CONFIG.MAX_FILE_SIZE;
}

// Export par défaut pour une utilisation simple
export default API_CONFIG; 