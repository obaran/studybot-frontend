import { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import type {
  Conversation,
  ConversationFilters,
  PaginationParams,
  PaginatedResponse,
  SystemPrompt,
  BotConfiguration,
  AdminUser,
  AdminPermission,
  DashboardMetrics,
  UsageStatistics,
  AnalyticsFilters,
  LoadingState,
  ErrorState,
  ApiError
} from '../types/admin';

// =============================================================================
// HOOK DE BASE POUR LES APPELS API
// =============================================================================

interface UseApiOptions<T> {
  initialData?: T;
  autoLoad?: boolean;
  dependencies?: any[];
}

function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { initialData, autoLoad = true, dependencies = [] } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    if (autoLoad) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    refetch: execute
  };
}

// =============================================================================
// HOOKS POUR LES CONVERSATIONS
// =============================================================================

export function useConversations(
  filters: ConversationFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 }
) {
  const [allFilters, setFilters] = useState(filters);
  const [allPagination, setPagination] = useState(pagination);

  const {
    data,
    loading,
    error,
    execute,
    reset
  } = useApi<PaginatedResponse<Conversation>>(
    () => adminApi.getConversations(allFilters, allPagination),
    {
      dependencies: [allFilters, allPagination],
      initialData: {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      }
    }
  );

  const updateFilters = useCallback((newFilters: Partial<ConversationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset à la page 1
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const searchConversations = useCallback(async (query: string) => {
    try {
      const results = await adminApi.searchConversations(query, allFilters);
      return results;
    } catch (err) {
      throw err as ApiError;
    }
  }, [allFilters]);

  const exportConversations = useCallback(async () => {
    try {
      const blob = await adminApi.exportConversations(allFilters);
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      throw err as ApiError;
    }
  }, [allFilters]);

  return {
    conversations: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    filters: allFilters,
    pagination: allPagination,
    updateFilters,
    updatePagination,
    searchConversations,
    exportConversations,
    refetch: execute,
    reset
  };
}

export function useConversation(id: string) {
  return useApi<Conversation>(
    () => adminApi.getConversation(id),
    {
      autoLoad: !!id,
      dependencies: [id]
    }
  );
}

// =============================================================================
// HOOKS POUR LE SYSTÈME PROMPT
// =============================================================================

export function useSystemPrompts() {
  const {
    data: prompts,
    loading,
    error,
    execute: refetch
  } = useApi<SystemPrompt[]>(
    () => adminApi.getSystemPrompts(),
    { initialData: [] }
  );

  const createPrompt = useCallback(async (data: {
    content: string;
    description?: string;
    tags?: string[];
  }) => {
    const newPrompt = await adminApi.createSystemPrompt(data);
    await refetch(); // Recharger la liste
    return newPrompt;
  }, [refetch]);

  const updatePrompt = useCallback(async (id: string, data: {
    content?: string;
    description?: string;
    tags?: string[];
    changeSummary?: string;
  }) => {
    const updatedPrompt = await adminApi.updateSystemPrompt(id, data);
    await refetch(); // Recharger la liste
    return updatedPrompt;
  }, [refetch]);

  const activatePrompt = useCallback(async (id: string) => {
    const activatedPrompt = await adminApi.activateSystemPrompt(id);
    await refetch(); // Recharger la liste
    return activatedPrompt;
  }, [refetch]);

  const deletePrompt = useCallback(async (id: string) => {
    await adminApi.deleteSystemPrompt(id);
    await refetch(); // Recharger la liste
  }, [refetch]);

  const activePrompt = prompts?.find(p => p.status === 'active');

  return {
    prompts: prompts || [],
    activePrompt,
    loading,
    error,
    createPrompt,
    updatePrompt,
    activatePrompt,
    deletePrompt,
    refetch
  };
}

export function useActiveSystemPrompt() {
  return useApi<SystemPrompt>(
    () => adminApi.getActiveSystemPrompt()
  );
}

// =============================================================================
// HOOKS POUR LA CONFIGURATION
// =============================================================================

export function useConfiguration() {
  const {
    data: config,
    loading,
    error,
    execute: refetch
  } = useApi<BotConfiguration>(
    () => adminApi.getConfiguration()
  );

  const updateConfig = useCallback(async (data: {
    welcomeMessage?: string;
    footerText?: string;
    footerLink?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }) => {
    const updatedConfig = await adminApi.updateConfiguration(data);
    await refetch(); // Recharger la configuration
    return updatedConfig;
  }, [refetch]);

  const uploadFile = useCallback(async (file: File, type: 'avatar' | 'logo') => {
    const uploadResult = await adminApi.uploadFile(file, type);
    await refetch(); // Recharger la configuration pour avoir les nouvelles URLs
    return uploadResult;
  }, [refetch]);

  const generateLinks = useCallback(async () => {
    return await adminApi.generateIntegrationLinks();
  }, []);

  const regenerateToken = useCallback(async () => {
    return await adminApi.regenerateIntegrationToken();
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    uploadFile,
    generateLinks,
    regenerateToken,
    refetch
  };
}

// =============================================================================
// HOOKS POUR LES UTILISATEURS ADMIN
// =============================================================================

export function useAdminUsers() {
  const {
    data: users,
    loading,
    error,
    execute: refetch
  } = useApi<AdminUser[]>(
    () => adminApi.getAdminUsers(),
    { initialData: [] }
  );

  const createUser = useCallback(async (data: {
    name: string;
    email: string;
    role: 'admin' | 'moderator';
    permissions: AdminPermission[];
  }) => {
    const newUser = await adminApi.createAdminUser(data);
    await refetch(); // Recharger la liste
    return newUser;
  }, [refetch]);

  const updateUser = useCallback(async (id: string, data: {
    name?: string;
    role?: 'admin' | 'moderator';
    permissions?: AdminPermission[];
    status?: 'active' | 'suspended';
  }) => {
    const updatedUser = await adminApi.updateAdminUser(id, data);
    await refetch(); // Recharger la liste
    return updatedUser;
  }, [refetch]);

  const deleteUser = useCallback(async (id: string) => {
    await adminApi.deleteAdminUser(id);
    await refetch(); // Recharger la liste
  }, [refetch]);

  const resendInvitation = useCallback(async (id: string) => {
    await adminApi.resendInvitation(id);
  }, []);

  return {
    users: users || [],
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    resendInvitation,
    refetch
  };
}

// =============================================================================
// HOOKS POUR LES ANALYTICS
// =============================================================================

export function useDashboardMetrics() {
  return useApi<DashboardMetrics>(
    () => adminApi.getDashboardMetrics(),
    {
      initialData: {
        totalConversations: 0,
        todayMessages: 0,
        averageRating: 0,
        activeUsers: 0,
        totalTokensUsed: 0,
        estimatedCost: 0,
        activeSessions: 0,
        peakUsageTime: '',
        averageResponseTime: 0,
        costSavings: 0
      }
    }
  );
}

export function useUsageStatistics(filters: AnalyticsFilters) {
  const [currentFilters, setFilters] = useState(filters);

  const {
    data: statistics,
    loading,
    error,
    execute: refetch
  } = useApi<UsageStatistics[]>(
    () => adminApi.getUsageStatistics(currentFilters),
    {
      dependencies: [currentFilters],
      initialData: []
    }
  );

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportAnalytics = useCallback(async () => {
    try {
      const blob = await adminApi.getAnalyticsExport(currentFilters);
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      throw err as ApiError;
    }
  }, [currentFilters]);

  return {
    statistics: statistics || [],
    loading,
    error,
    filters: currentFilters,
    updateFilters,
    exportAnalytics,
    refetch
  };
}

// =============================================================================
// HOOK GLOBAL POUR L'ÉTAT DU DASHBOARD
// =============================================================================

export function useAdminDashboard() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    conversations: false,
    systemPrompt: false,
    configuration: false,
    users: false,
    analytics: false,
    auth: false
  });

  const [errorState, setErrorState] = useState<ErrorState>({});

  const updateLoading = useCallback((section: keyof LoadingState, loading: boolean) => {
    setLoadingState(prev => ({ ...prev, [section]: loading }));
  }, []);

  const updateError = useCallback((section: keyof ErrorState, error: string | undefined) => {
    setErrorState(prev => ({ ...prev, [section]: error }));
  }, []);

  const clearError = useCallback((section: keyof ErrorState) => {
    setErrorState(prev => {
      const newState = { ...prev };
      delete newState[section];
      return newState;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrorState({});
  }, []);

  const isLoading = Object.values(loadingState).some(loading => loading);
  const hasErrors = Object.keys(errorState).length > 0;

  return {
    loadingState,
    errorState,
    isLoading,
    hasErrors,
    updateLoading,
    updateError,
    clearError,
    clearAllErrors
  };
} 