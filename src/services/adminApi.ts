import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  Conversation,
  ConversationFilters,
  SystemPrompt,
  CreateSystemPromptRequest,
  UpdateSystemPromptRequest,
  BotConfiguration,
  UpdateConfigurationRequest,
  FileUploadResponse,
  IntegrationLinks,
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  DashboardMetrics,
  UsageStatistics,
  AnalyticsFilters,
  LoginRequest,
  LoginResponse,
  ApiError
} from '../types/admin';

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001/api/admin';
const REQUEST_TIMEOUT = 30000; // 30 secondes

// =============================================================================
// GESTION DE L'AUTHENTIFICATION
// =============================================================================

class AuthManager {
  private static readonly TOKEN_KEY = 'studybot_admin_token';
  private static readonly USER_KEY = 'studybot_admin_user';

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  static getUser(): AdminUser | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  static setUser(user: AdminUser): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }
}

// =============================================================================
// CLIENT API PRINCIPAL
// =============================================================================

class AdminApiClient {
  private api: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Intercepteur de requête - ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        const token = AuthManager.getToken();
        if (token && !AuthManager.isTokenExpired(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse - gestion des erreurs
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si token expiré, tenter de le rafraîchir
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const newToken = AuthManager.getToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Échec du rafraîchissement, rediriger vers login
            this.logout();
            window.location.href = '/admin/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.api.post('/auth/refresh')
      .then(response => {
        const { token } = response.data.data;
        AuthManager.setToken(token);
        this.refreshPromise = null;
        return token;
      })
      .catch(error => {
        this.refreshPromise = null;
        throw error;
      });

    return this.refreshPromise;
  }

  private handleApiError(error: any): ApiError {
    if (error.response) {
      // Erreur de réponse du serveur
      return {
        code: error.response.data?.code || 'API_ERROR',
        message: error.response.data?.message || 'Erreur API',
        details: error.response.data?.details,
        timestamp: new Date().toISOString()
      };
    } else if (error.request) {
      // Erreur de réseau
      return {
        code: 'NETWORK_ERROR',
        message: 'Erreur de connexion au serveur',
        timestamp: new Date().toISOString()
      };
    } else {
      // Erreur inconnue
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Erreur inconnue',
        timestamp: new Date().toISOString()
      };
    }
  }

  // =============================================================================
  // AUTHENTIFICATION
  // =============================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const loginData = response.data.data;
    
    AuthManager.setToken(loginData.token);
    AuthManager.setUser(loginData.user);
    
    return loginData;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      AuthManager.removeToken();
    }
  }

  async getCurrentUser(): Promise<AdminUser> {
    const response = await this.api.get<ApiResponse<AdminUser>>('/auth/me');
    const user = response.data.data;
    AuthManager.setUser(user);
    return user;
  }

  // =============================================================================
  // CONVERSATIONS
  // =============================================================================

  async getConversations(
    filters: ConversationFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Conversation>> {
    const params = { ...filters, ...pagination };
    const response = await this.api.get<ApiResponse<PaginatedResponse<Conversation>>>(
      '/conversations',
      { params }
    );
    return response.data.data;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await this.api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return response.data.data;
  }

  async searchConversations(query: string, filters: ConversationFilters = {}): Promise<Conversation[]> {
    const params = { q: query, ...filters };
    const response = await this.api.get<ApiResponse<Conversation[]>>('/conversations/search', { params });
    return response.data.data;
  }

  async exportConversations(filters: ConversationFilters = {}): Promise<Blob> {
    const response = await this.api.get('/conversations/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }

  // =============================================================================
  // SYSTÈME PROMPT
  // =============================================================================

  async getSystemPrompts(): Promise<SystemPrompt[]> {
    const response = await this.api.get<ApiResponse<SystemPrompt[]>>('/system-prompt');
    return response.data.data;
  }

  async getActiveSystemPrompt(): Promise<SystemPrompt> {
    const response = await this.api.get<ApiResponse<SystemPrompt>>('/system-prompt/active');
    return response.data.data;
  }

  async createSystemPrompt(data: CreateSystemPromptRequest): Promise<SystemPrompt> {
    const response = await this.api.post<ApiResponse<SystemPrompt>>('/system-prompt', data);
    return response.data.data;
  }

  async updateSystemPrompt(id: string, data: UpdateSystemPromptRequest): Promise<SystemPrompt> {
    const response = await this.api.put<ApiResponse<SystemPrompt>>(`/system-prompt/${id}`, data);
    return response.data.data;
  }

  async activateSystemPrompt(id: string): Promise<SystemPrompt> {
    const response = await this.api.post<ApiResponse<SystemPrompt>>(`/system-prompt/${id}/activate`);
    return response.data.data;
  }

  async deleteSystemPrompt(id: string): Promise<void> {
    await this.api.delete(`/system-prompt/${id}`);
  }

  async getSystemPromptHistory(id: string): Promise<any[]> {
    const response = await this.api.get<ApiResponse<any[]>>(`/system-prompt/${id}/history`);
    return response.data.data;
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  async getConfiguration(): Promise<BotConfiguration> {
    const response = await this.api.get<ApiResponse<BotConfiguration>>('/configuration');
    return response.data.data;
  }

  async updateConfiguration(data: UpdateConfigurationRequest): Promise<BotConfiguration> {
    const response = await this.api.put<ApiResponse<BotConfiguration>>('/configuration', data);
    return response.data.data;
  }

  async uploadFile(file: File, type: 'avatar' | 'logo'): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post<ApiResponse<FileUploadResponse>>(
      '/configuration/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  async generateIntegrationLinks(): Promise<IntegrationLinks> {
    const response = await this.api.post<ApiResponse<IntegrationLinks>>('/configuration/integration-links');
    return response.data.data;
  }

  async regenerateIntegrationToken(): Promise<IntegrationLinks> {
    const response = await this.api.post<ApiResponse<IntegrationLinks>>('/configuration/regenerate-token');
    return response.data.data;
  }

  // =============================================================================
  // UTILISATEURS ADMIN
  // =============================================================================

  async getAdminUsers(): Promise<AdminUser[]> {
    const response = await this.api.get<ApiResponse<AdminUser[]>>('/users');
    return response.data.data;
  }

  async createAdminUser(data: CreateAdminUserRequest): Promise<AdminUser> {
    const response = await this.api.post<ApiResponse<AdminUser>>('/users', data);
    return response.data.data;
  }

  async updateAdminUser(id: string, data: UpdateAdminUserRequest): Promise<AdminUser> {
    const response = await this.api.put<ApiResponse<AdminUser>>(`/users/${id}`, data);
    return response.data.data;
  }

  async deleteAdminUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  async resendInvitation(id: string): Promise<void> {
    await this.api.post(`/users/${id}/resend-invitation`);
  }

  // =============================================================================
  // ANALYTICS
  // =============================================================================

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.api.get<ApiResponse<DashboardMetrics>>('/analytics/metrics');
    return response.data.data;
  }

  async getUsageStatistics(filters: AnalyticsFilters): Promise<UsageStatistics[]> {
    const response = await this.api.get<ApiResponse<UsageStatistics[]>>('/analytics/usage', {
      params: filters
    });
    return response.data.data;
  }

  async getAnalyticsExport(filters: AnalyticsFilters): Promise<Blob> {
    const response = await this.api.get('/analytics/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
}

// =============================================================================
// INSTANCE SINGLETON
// =============================================================================

export const adminApi = new AdminApiClient();
export { AuthManager };
export default adminApi; 