// Types pour le Dashboard Admin StudyBot

// =============================================================================
// TYPES DE BASE
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================================================
// CONVERSATIONS
// =============================================================================

export interface User {
  id: string;
  sessionId: string;
  identifier: string; // Ex: "Étudiant BBA2"
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    responseTime?: number;
    sources?: string[];
  };
}

export interface Feedback {
  id: string;
  messageId: string;
  sessionId: string;
  type: 'positive' | 'negative';
  comment?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  user: User;
  messages: Message[];
  feedback?: Feedback[];
  status: 'active' | 'completed' | 'expired';
  startTime: string;
  endTime?: string;
  messageCount: number;
  lastMessage: string;
  lastMessageTime: string;
  averageResponseTime?: number;
  totalTokensUsed?: number;
}

export interface ConversationFilters {
  status?: 'active' | 'completed' | 'expired' | 'all';
  feedback?: 'positive' | 'negative' | 'none' | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  userIdentifier?: string;
  userId?: string;
  minMessages?: number;
  maxMessages?: number;
}

// =============================================================================
// SYSTÈME PROMPT
// =============================================================================

export interface SystemPrompt {
  id: string;
  content: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  activatedAt?: string;
  description?: string;
  tags?: string[];
}

export interface SystemPromptHistory {
  id: string;
  promptId: string;
  version: string;
  content: string;
  changedBy: string;
  changeSummary: string;
  timestamp: string;
}

export interface CreateSystemPromptRequest {
  content: string;
  description?: string;
  tags?: string[];
}

export interface UpdateSystemPromptRequest {
  content?: string;
  description?: string;
  tags?: string[];
  changeSummary?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface BotConfiguration {
  id: string;
  token: string;
  organization: string;
  welcomeMessage: string;
  footerText: string;
  footerLinkText?: string;
  footerLink?: string;
  botAvatarUrl?: string;
  userAvatarUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  language: string;
  environment: 'development' | 'production';
  baseUrl: string;
  apiUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UpdateConfigurationRequest {
  welcomeMessage?: string;
  footerText?: string;
  footerLink?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface FileUploadResponse {
  success: boolean;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface IntegrationLinks {
  uniqueToken: string;
  directLink: string;
  iframeCode: string;
  embedCode: string;
  generatedAt: string;
}

// =============================================================================
// UTILISATEURS ADMIN
// =============================================================================

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'moderator';
  status: 'active' | 'pending' | 'suspended';
  permissions: AdminPermission[];
  createdAt: string;
  lastLoginAt?: string;
  invitedBy?: string;
}

export type AdminPermission = 'conversations' | 'analytics' | 'configuration' | 'users' | 'system-prompt';

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  permissions: AdminPermission[];
}

export interface UpdateAdminUserRequest {
  name?: string;
  role?: 'admin' | 'moderator';
  permissions?: AdminPermission[];
  status?: 'active' | 'suspended';
}

// =============================================================================
// ANALYTICS
// =============================================================================

export interface DashboardMetrics {
  totalConversations: number;
  todayMessages: number;
  averageRating: number;
  activeUsers: number;
  totalTokensUsed: number;
  estimatedCost: number;
  activeSessions: number;
  peakUsageTime: string;
  averageResponseTime: number;
  costSavings: number;
}

export interface UsageStatistics {
  date: string;
  conversations: number;
  messages: number;
  tokensUsed: number;
  uniqueUsers: number;
  positiveFeedback: number;
  negativeFeedback: number;
}

export interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

// =============================================================================
// AUTHENTIFICATION
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
  expiresAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: AdminPermission[];
  iat: number;
  exp: number;
}

// =============================================================================
// ERREURS ET ÉTATS
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface LoadingState {
  conversations: boolean;
  systemPrompt: boolean;
  configuration: boolean;
  users: boolean;
  analytics: boolean;
  auth: boolean;
}

export interface ErrorState {
  conversations?: string;
  systemPrompt?: string;
  configuration?: string;
  users?: string;
  analytics?: string;
  auth?: string;
  general?: string;
} 