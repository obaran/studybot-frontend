import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversations, useConversation } from '../../hooks/useAdminApi';
import type { ConversationFilters } from '../../types/admin';

const ConversationsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'positive' | 'negative' | 'none'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [showConversationModal, setShowConversationModal] = useState(false);
  
  // États pour la navigation du calendrier
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // États pour la sélection de fourchettes de dates
  const [dateRangeMode, setDateRangeMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectingEndDate, setSelectingEndDate] = useState(false);

  // NOUVEAU : États pour la recherche combinée avancée
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    textQuery: '',
    feedbackType: 'all' as 'all' | 'positive' | 'negative' | 'none'
  });

  // Fonctions de navigation du calendrier
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  // NOUVEAU : Fonctions pour la recherche combinée avancée
  const toggleAdvancedSearch = () => {
    setIsAdvancedSearch(!isAdvancedSearch);
    if (!isAdvancedSearch) {
      // Reset des filtres simples quand on passe en mode avancé
      setSearchTerm('');
      setFeedbackFilter('all');
      setSelectedDate('');
      setStartDate('');
      setEndDate('');
    } else {
      // Reset des filtres avancés quand on revient en mode simple
      setAdvancedFilters({
        textQuery: '',
        feedbackType: 'all'
      });
    }
  };

  const updateAdvancedFilter = (key: string, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setFeedbackFilter('all');
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setAdvancedFilters({
      textQuery: '',
      feedbackType: 'all'
    });
    setDateRangeMode(false);
    setSelectingEndDate(false);
  };

  // Fonctions pour la gestion des fourchettes de dates
  const toggleDateRangeMode = () => {
    setDateRangeMode(!dateRangeMode);
    // Reset des sélections
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setSelectingEndDate(false);
  };

  const handleDateClick = (dateString: string) => {
    if (!dateRangeMode) {
      // Mode simple : sélection d'une seule date
      setSelectedDate(dateString);
      setIsCalendarOpen(false);
    } else {
      // Mode fourchette de dates
      if (!startDate || selectingEndDate) {
        // Premier clic ou sélection de la date de fin
        if (!startDate) {
          setStartDate(dateString);
          setSelectingEndDate(true);
        } else {
          // Vérifier que la date de fin est après la date de début
          if (dateString >= startDate) {
            setEndDate(dateString);
            setSelectingEndDate(false);
            setIsCalendarOpen(false);
          } else {
            // Si la date de fin est avant le début, on recommence
            setStartDate(dateString);
            setEndDate('');
            setSelectingEndDate(true);
          }
        }
      } else {
        // Deuxième clic pour la date de fin
        if (dateString >= startDate) {
          setEndDate(dateString);
          setSelectingEndDate(false);
          setIsCalendarOpen(false);
        } else {
          // Nouveau début si on clique avant la date de début
          setStartDate(dateString);
          setEndDate('');
          setSelectingEndDate(true);
        }
      }
    }
  };

  const clearDateSelection = () => {
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setSelectingEndDate(false);
    setIsCalendarOpen(false);
  };

  // Calculer les informations du mois actuel
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Utiliser le hook pour récupérer les vraies données
  const {
    conversations,
    total,
    page,
    totalPages,
    loading,
    error,
    updateFilters,
    updatePagination,
    exportConversations,
    refetch
  } = useConversations();

  // Hook pour récupérer les détails d'une conversation spécifique
  const {
    data: conversationDetails,
    loading: detailsLoading,
    error: detailsError
  } = useConversation(selectedConversationId);

  // Debounce pour éviter trop de requêtes
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [debouncedAdvancedSearch, setDebouncedAdvancedSearch] = React.useState('');

  // Debouncer pour le terme de recherche simple
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debouncer pour la recherche avancée
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAdvancedSearch(advancedFilters.textQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [advancedFilters.textQuery]);

  // Mettre à jour les filtres de façon optimisée
  React.useEffect(() => {
    let newFilters: Partial<ConversationFilters> = {};

    if (isAdvancedSearch) {
      // Mode recherche avancée - filtres combinés
      newFilters = {
        search: debouncedAdvancedSearch || undefined,
        feedback: advancedFilters.feedbackType || 'all', // ✅ Garder 'all' au lieu de undefined
      };
    } else {
      // Mode recherche simple
      newFilters = {
        search: debouncedSearch || undefined,
        feedback: feedbackFilter, // ✅ Garder la valeur directement (y compris 'all')
      };
    }

    // Gestion des dates - logique unifiée pour tous les modes
    if (dateRangeMode && startDate && endDate) {
      // Mode fourchette avec début et fin
      newFilters.dateFrom = startDate;
      newFilters.dateTo = endDate;
    } else if (selectedDate) {
      // Mode simple avec une seule date
      newFilters.dateFrom = selectedDate;
      newFilters.dateTo = selectedDate;
    } else {
      // Aucune date sélectionnée
      newFilters.dateFrom = undefined;
      newFilters.dateTo = undefined;
    }

    updateFilters(newFilters);
  }, [debouncedSearch, debouncedAdvancedSearch, feedbackFilter, selectedDate, dateRangeMode, startDate, endDate, updateFilters, isAdvancedSearch, advancedFilters.feedbackType]);

  const handleExport = async () => {
    try {
      await exportConversations();
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
    }
  };

  if (error) {
    const errorMessage = error?.message || (error as any)?.response?.data?.message || 'Une erreur est survenue';
    const isRateLimited = errorMessage.includes('429') || errorMessage.includes('Too Many Requests');
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: isRateLimited ? '#f59e0b' : '#dc2626',
          background: isRateLimited ? '#fef3c7' : '#fee2e2',
          borderRadius: '10px',
          border: `2px solid ${isRateLimited ? '#f59e0b' : '#dc2626'}`
        }}
      >
        <h3>
          {isRateLimited ? '⏳ Trop de requêtes' : '❌ Erreur de chargement'}
        </h3>
        <p style={{ margin: '10px 0', fontSize: '14px' }}>
          {isRateLimited 
            ? 'Veuillez attendre quelques secondes avant de réessayer'
            : errorMessage
          }
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refetch}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: isRateLimited ? '#f59e0b' : '#dc2626',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </motion.button>
      </motion.div>
    );
  }

  return (
    <>
      {/* Filtres et recherche */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          marginBottom: '32px'
        }}
      >
        {/* Ligne 1: Barre de recherche */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <motion.input
              type="text"
              placeholder="Rechercher dans les conversations, utilisateurs, messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '100%',
                padding: '18px 60px 18px 60px',
                borderRadius: '16px',
                border: '2px solid transparent',
                fontSize: '15px',
                outline: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                color: '#1e293b',
                transition: 'all 0.3s ease'
              }}
            />
            
            {/* Icône de recherche */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px'
            }}>
              🔍
            </div>

            {/* Compteur de résultats */}
            {searchTerm && (
              <div style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {conversations?.length || 0} résultat{(conversations?.length || 0) > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Recherche Avancée */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <motion.button
            onClick={toggleAdvancedSearch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: isAdvancedSearch 
                ? 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)' 
                : 'white',
              color: isAdvancedSearch ? 'white' : '#64748b',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>{isAdvancedSearch ? '🔧' : '⚡'}</span>
            {isAdvancedSearch ? 'Recherche Simple' : 'Recherche Avancée'}
          </motion.button>
        </div>

        {/* Interface de recherche avancée */}
        <AnimatePresence>
          {isAdvancedSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h4 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔧 Recherche Combinée Avancée
              </h4>
              
              {/* Layout des filtres en colonnes */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Recherche textuelle - pleine largeur */}
                <div style={{ width: '100%' }}>
                  <label style={{ 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    marginBottom: '8px', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📝 Recherche dans le contenu
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: impression documents, campus, restaurant..."
                    value={advancedFilters.textQuery}
                    onChange={(e) => updateAdvancedFilter('textQuery', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e2001a'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* Deuxième ligne : Feedback et Période */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  width: '100%'
                }}>
                  {/* Type de feedback */}
                  <div>
                    <label style={{ 
                      fontSize: '13px', 
                      fontWeight: '700', 
                      color: '#1e293b', 
                      marginBottom: '8px', 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      👍 Type de feedback
                    </label>
                    <select
                      value={advancedFilters.feedbackType}
                      onChange={(e) => updateAdvancedFilter('feedbackType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        background: 'white',
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Tous les feedbacks</option>
                      <option value="positive">👍 Positif uniquement</option>
                      <option value="negative">👎 Négatif uniquement</option>
                      <option value="none">⭕ Sans feedback</option>
                    </select>
                  </div>

                  {/* Sélection de dates */}
                  <div>
                    <label style={{ 
                      fontSize: '13px', 
                      fontWeight: '700', 
                      color: '#1e293b', 
                      marginBottom: '8px', 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📅 Période
                    </label>
                    <div style={{ position: 'relative' }}>
                      <motion.button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '2px solid #e2e8f0',
                          fontSize: '14px',
                          outline: 'none',
                          background: 'white',
                          fontFamily: 'Inter, sans-serif',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'border-color 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.borderColor = '#e2001a'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.borderColor = '#e2e8f0'}
                      >
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                          {(() => {
                            if (dateRangeMode && startDate && endDate) {
                              return `${new Date(startDate + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${new Date(endDate + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
                            } else if (selectedDate) {
                              return new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                            } else {
                              return 'Toutes les dates';
                            }
                          })()}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>📅</span>
                      </motion.button>
                      
                      {/* Bouton reset dates */}
                      {(selectedDate || startDate || endDate) && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearDateSelection();
                          }}
                          style={{
                            position: 'absolute',
                            right: '30px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '18px',
                            height: '18px',
                            background: '#64748b',
                            border: 'none',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                          title="Effacer la sélection"
                        >
                          ✕
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  onClick={resetAllFilters}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Réinitialiser
                </button>
                <button
                  onClick={() => {
                    // Les filtres sont appliqués automatiquement via useEffect
                    console.log('Filtres appliqués:', advancedFilters);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔍 Appliquer les filtres
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ligne 2: Filtres */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          {/* Sélecteur de date avec calendrier popup */}
          <div style={{ position: 'relative' }}>
            {/* Bouton principal du calendrier */}
            <motion.button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%',
                padding: '16px 50px 16px 50px',
                borderRadius: '12px',
                border: `2px solid ${isCalendarOpen ? '#e2001a' : 'transparent'}`,
                fontSize: '14px',
                outline: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                boxShadow: isCalendarOpen 
                  ? '0 4px 16px rgba(226, 0, 26, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08)'
                  : '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#1e293b',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>
                {(() => {
                  if (dateRangeMode) {
                    if (startDate && endDate) {
                      return `Du ${new Date(startDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })} au ${new Date(endDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}`;
                    } else if (startDate) {
                      return `Début: ${new Date(startDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })} (choisir fin)`;
                    } else {
                      return '📅 Sélectionner une fourchette';
                    }
                  } else {
                    return selectedDate 
                      ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })
                      : 'Toutes les dates';
                  }
                })()}
              </span>
            </motion.button>
            
            {/* Icône calendrier */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'white',
              pointerEvents: 'none'
            }}>
              📅
            </div>

            {/* Bouton reset */}
            {(selectedDate || startDate || endDate) && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  clearDateSelection();
                }}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  background: '#64748b',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: 'white',
                  cursor: 'pointer'
                }}
                title="Effacer la sélection"
              >
                ✕
              </motion.button>
            )}

            {/* Calendrier popup */}
            {isCalendarOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  zIndex: 1000,
                  overflow: 'hidden',
                  padding: '20px'
                }}
              >
                {/* En-tête du calendrier avec navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousMonth}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ← Préc.
                  </motion.button>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={goToCurrentMonth}
                    style={{
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s ease'
                    }}
                    title="Retour au mois actuel"
                  >
                    {monthNameCapitalized}
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextMonth}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Suiv. →
                  </motion.button>
                </div>

                {/* Message d'aide pour le mode fourchette */}
                {dateRangeMode && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    background: '#fef3c7',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    color: '#92400e',
                    fontWeight: '500'
                  }}>
                    {!startDate 
                      ? '🎯 Cliquez sur une date de début' 
                      : !endDate 
                      ? '🎯 Maintenant, cliquez sur une date de fin'
                      : '✅ Fourchette sélectionnée'
                    }
                  </div>
                )}

                {/* Jours de la semaine */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} style={{
                      textAlign: 'center',
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b'
                    }}>
                      {day}
                    </div>
                  ))}
                </div>

                                {/* Grille des jours */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '2px'
                }}>
                  {(() => {
                    const firstDay = new Date(currentYear, currentMonth, 1);
                    const lastDay = new Date(currentYear, currentMonth + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
                    
                    const days = [];
                    
                    // Jours du mois précédent (grisons)
                    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
                    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                      const day = prevMonth.getDate() - i;
                      const dateString = `${currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentMonth === 0 ? 12 : currentMonth).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                      
                      days.push(
                        <motion.button
                          key={`prev-${day}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            handleDateClick(dateString);
                            if (!dateRangeMode || (dateRangeMode && startDate && !selectingEndDate)) {
                              goToPreviousMonth();
                            }
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {day}
                        </motion.button>
                      );
                    }
                    
                    // Jours du mois actuel
                    const today = new Date().toISOString().split('T')[0];
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                      const isToday = today === dateString;
                      const hasConversations = conversations?.some(conv => 
                        new Date(conv.startTime).toISOString().split('T')[0] === dateString
                      );
                      
                      // Logique pour l'affichage des fourchettes de dates
                      const isSelected = selectedDate === dateString;
                      const isRangeStart = startDate === dateString;
                      const isRangeEnd = endDate === dateString;
                      const isInRange = dateRangeMode && startDate && endDate && 
                        dateString >= startDate && dateString <= endDate;
                      
                      days.push(
                        <motion.button
                          key={day}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDateClick(dateString)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            borderRadius: '8px',
                            background: (() => {
                              if (isSelected) return 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)';
                              if (isRangeStart || isRangeEnd) return 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)';
                              if (isInRange) return 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                              if (isToday) return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                              if (hasConversations) return 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)';
                              return 'transparent';
                            })(),
                            color: (() => {
                              if (isSelected || isRangeStart || isRangeEnd) return 'white';
                              if (isInRange) return '#7f1d1d';
                              if (isToday) return '#1e293b';
                              return '#64748b';
                            })(),
                            fontSize: '13px',
                            fontWeight: (isSelected || isRangeStart || isRangeEnd || isToday) ? '600' : '500',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {day}
                          {hasConversations && (
                            <div style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              width: '4px',
                              height: '4px',
                              backgroundColor: (isSelected || isRangeStart || isRangeEnd) ? 'white' : '#e2001a',
                              borderRadius: '50%'
                            }} />
                          )}
                        </motion.button>
                      );
                    }
                    
                    // Jours du mois suivant (grisons) pour compléter la grille
                    const totalCells = 42; // 6 semaines × 7 jours
                    const remainingCells = totalCells - days.length;
                    for (let day = 1; day <= remainingCells; day++) {
                      const dateString = `${currentMonth === 11 ? currentYear + 1 : currentYear}-${(currentMonth === 11 ? 1 : currentMonth + 2).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                      
                      days.push(
                        <motion.button
                          key={`next-${day}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            handleDateClick(dateString);
                            if (!dateRangeMode || (dateRangeMode && startDate && !selectingEndDate)) {
                              goToNextMonth();
                            }
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {day}
                        </motion.button>
                      );
                    }
                    
                    return days;
                  })()}
                </div>

                {/* Actions du calendrier */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCalendarOpen(false)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Fermer
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const today = new Date();
                        const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                        goToCurrentMonth();
                        handleDateClick(todayString);
                      }}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      📅 Aujourd'hui
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleDateRangeMode}
                      style={{
                        padding: '8px 16px',
                        border: `1px solid ${dateRangeMode ? '#e2001a' : '#10b981'}`,
                        borderRadius: '8px',
                        background: dateRangeMode ? '#fef2f2' : 'white',
                        color: dateRangeMode ? '#e2001a' : '#10b981',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {dateRangeMode ? '📅 Mode simple' : '📊 Fourchette'}
                    </motion.button>
                  </div>
                  
                  {(selectedDate || startDate || endDate) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        clearDateSelection();
                      }}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #e2001a',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#e2001a',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Effacer sélection
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Filtre par feedback */}
          <motion.select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value as 'all' | 'positive' | 'negative' | 'none')}
            whileFocus={{ scale: 1.01 }}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid transparent',
              fontSize: '14px',
              outline: 'none',
              background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              color: '#1e293b',
              transition: 'all 0.3s ease'
            }}
          >
            <option value="all">🌟 Tous les feedbacks</option>
            <option value="positive">👍 Feedbacks positifs</option>
            <option value="negative">👎 Feedbacks négatifs</option>
            <option value="none">⭕ Sans feedback</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Résultats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
                  <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0'
            }}>
              Conversations ({conversations?.length || 0})
            </h3>
          
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: '0 8px 25px rgba(226, 0, 26, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            disabled={loading}
            style={{
              padding: '14px 20px',
              background: loading 
                ? 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              color: loading ? '#6c757d' : '#e2001a',
              border: loading 
                ? '2px solid #dee2e6' 
                : '2px solid #e2001a',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading 
                ? '0 2px 8px rgba(108, 117, 125, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 4px 15px rgba(226, 0, 26, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(145deg, #fef2f2 0%, #ffffff 100%)';
                e.currentTarget.style.borderColor = '#b50015';
                e.currentTarget.style.color = '#b50015';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)';
                e.currentTarget.style.borderColor = '#e2001a';
                e.currentTarget.style.color = '#e2001a';
              }
            }}
          >
            {/* Effet de brillance subtile */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              transition: 'left 0.6s ease',
              pointerEvents: 'none'
            }} />
            
            <motion.span 
              style={{
                display: 'inline-block',
                fontSize: '16px',
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }}
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
            >
              {loading ? '⟳' : '↻'}
            </motion.span>
            <span style={{ 
              fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", // ✅ Poppins priorité
              letterSpacing: '0.25px'
            }}>
              {loading ? 'Actualisation...' : 'Actualiser'}
            </span>
          </motion.button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f1f5f9',
                borderTop: '4px solid #e2001a',
                borderRadius: '50%',
                margin: '0 auto 20px'
              }}
            />
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
              Chargement des conversations...
            </h4>
            <p style={{ color: '#64748b', margin: 0 }}>
              Récupération des données depuis le backend
            </p>
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
              Aucune conversation trouvée
            </h4>
            <p style={{ color: '#64748b', margin: 0 }}>
              {searchTerm || feedbackFilter !== 'all' || selectedDate
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Les conversations apparaîtront ici une fois que les utilisateurs commenceront à interagir avec le chatbot'
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conversations.map((conversation: any) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.01,
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
                  transition: { duration: 0.2 }
                }}
                onClick={() => {
                  setSelectedConversation(conversation);
                  setSelectedConversationId(conversation.sessionId);
                  setShowConversationModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Avatar avec gradient */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '700',
                  flexShrink: 0,
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                }}>
                  👤
                </div>

                {/* Contenu de la conversation */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{
                        fontSize: '17px',
                        fontWeight: '700',
                        color: '#1e293b',
                        margin: '0 0 6px 0'
                      }}>
                        Session {conversation.sessionId?.slice(-8) || 'Inconnue'}
                      </h4>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '13px',
                          color: '#64748b',
                          fontWeight: '500',
                          background: '#f8fafc',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                                                     📅 {new Date(conversation.startTime).toLocaleDateString('fr-FR')}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: '#64748b',
                          fontWeight: '500',
                          background: '#f8fafc',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          💬 {conversation.messageCount || 0} message{(conversation.messageCount || 0) > 1 ? 's' : ''}
                        </span>
                                                 {(() => {
                           const feedbackArray = conversation.feedback || [];
                           const positiveCount = feedbackArray.filter((f: any) => f.type === 'positive').length;
                           const negativeCount = feedbackArray.filter((f: any) => f.type === 'negative').length;
                           
                           if (positiveCount > 0 || negativeCount > 0) {
                             const hasBoth = positiveCount > 0 && negativeCount > 0;
                             
                             return (
                               <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                 {positiveCount > 0 && (
                                   <span style={{
                                     fontSize: '13px',
                                     color: '#10b981',
                                     fontWeight: '600',
                                     background: '#ecfdf5',
                                     padding: '4px 8px',
                                     borderRadius: '6px',
                                     border: '1px solid #10b981'
                                   }}>
                                     👍 {positiveCount}
                                   </span>
                                 )}
                                 {negativeCount > 0 && (
                                   <span style={{
                                     fontSize: '13px',
                                     color: '#ef4444',
                                     fontWeight: '600',
                                     background: '#fef2f2',
                                     padding: '4px 8px',
                                     borderRadius: '6px',
                                     border: '1px solid #ef4444'
                                   }}>
                                     👎 {negativeCount}
                                   </span>
                                 )}
                               </div>
                             );
                           }
                           return null;
                         })()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {(() => {
                        const feedbackArray = conversation.feedback || [];
                        const positiveCount = feedbackArray.filter((f: any) => f.type === 'positive').length;
                        const negativeCount = feedbackArray.filter((f: any) => f.type === 'negative').length;
                        
                        if (positiveCount > 0 || negativeCount > 0) {
                          return (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {positiveCount > 0 && (
                                <span style={{ fontSize: '18px' }}>👍</span>
                              )}
                              {negativeCount > 0 && (
                                <span style={{ fontSize: '18px' }}>👎</span>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <span style={{
                        fontSize: '11px',
                        padding: '6px 10px',
                        background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {conversation.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '15px',
                    color: '#475569',
                    margin: '0',
                    lineHeight: '1.6',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {conversation.lastMessage || 'Aucun message disponible'}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <motion.button
                    whileHover={{ scale: 1.1, background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConversation(conversation);
                      setSelectedConversationId(conversation.sessionId);
                      setShowConversationModal(true);
                    }}
                    style={{
                      padding: '10px',
                      border: 'none',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                    title="Voir la conversation complète"
                  >
                    👁️
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination avec design soigné */}
        {!loading && conversations && conversations.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <motion.button
              whileHover={{ scale: 1.05, background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)' }}
              whileTap={{ scale: 0.95 }}
              disabled={page <= 1}
              onClick={() => updatePagination({ page: page - 1 })}
              style={{
                padding: '12px 20px',
                border: page <= 1 ? '2px solid #e2e8f0' : '2px solid #e2001a',
                borderRadius: '12px',
                background: page <= 1 ? '#f8fafc' : 'white',
                color: page <= 1 ? '#94a3b8' : '#e2001a',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              ← Précédent
            </motion.button>

            <span style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              Page {page} sur {totalPages} • {total} conversation{total > 1 ? 's' : ''}
            </span>

            <motion.button
              whileHover={{ scale: 1.05, background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)' }}
              whileTap={{ scale: 0.95 }}
              disabled={page >= totalPages}
              onClick={() => updatePagination({ page: page + 1 })}
              style={{
                padding: '12px 20px',
                border: page >= totalPages ? '2px solid #e2e8f0' : '2px solid #e2001a',
                borderRadius: '12px',
                background: page >= totalPages ? '#f8fafc' : 'white',
                color: page >= totalPages ? '#94a3b8' : '#e2001a',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Suivant →
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Modal de conversation complète avec design soigné */}
      {showConversationModal && selectedConversation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowConversationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête du modal */}
            <div style={{ 
              padding: '32px 32px 24px 32px',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px 0' }}>
                    Conversation complète
                  </h2>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#94a3b8', 
                      fontWeight: '500',
                      background: '#f8fafc',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #f1f5f9',
                      cursor: 'pointer'
                    }}
                    title={`Session complète: ${selectedConversation.sessionId}`}>
                      🆔 {selectedConversation.sessionId?.slice(-6) || 'N/A'}
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#64748b', 
                      fontWeight: '600',
                      background: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                                             📅 {new Date(selectedConversation.startTime).toLocaleDateString('fr-FR')}
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#64748b', 
                      fontWeight: '600',
                      background: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      💬 {conversationDetails?.messages?.length || selectedConversation.messageCount || 0} messages
                    </span>
                    {(() => {
                      const feedbackArray = conversationDetails?.feedback || selectedConversation.feedback || [];
                      const totalFeedbacks = feedbackArray.length;
                      const positiveFeedbacks = feedbackArray.filter((f: any) => f.type === 'positive').length;
                      const negativeFeedbacks = feedbackArray.filter((f: any) => f.type === 'negative').length;
                      
                      if (totalFeedbacks > 0) {
                        const hasBothTypes = positiveFeedbacks > 0 && negativeFeedbacks > 0;
                        
                        return (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {positiveFeedbacks > 0 && (
                              <span style={{ 
                                fontSize: '14px', 
                                color: '#10b981', 
                                fontWeight: '600',
                                background: '#ecfdf5',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #10b981',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                👍 {positiveFeedbacks}
                              </span>
                            )}
                            {negativeFeedbacks > 0 && (
                              <span style={{ 
                                fontSize: '14px', 
                                color: '#ef4444', 
                                fontWeight: '600',
                                background: '#fef2f2',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                👎 {negativeFeedbacks}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConversationModal(false)}
                  style={{
                    padding: '12px',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(226, 0, 26, 0.3)'
                  }}
                >
                  ✕
                </motion.button>
              </div>
            </div>

            {/* Messages avec scroll */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '24px 32px',
              background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)'
            }}>
              {detailsLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #f1f5f9',
                      borderTop: '4px solid #e2001a',
                      borderRadius: '50%',
                      margin: '0 auto 20px'
                    }}
                  />
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                    Chargement des messages...
                  </h4>
                  <p style={{ color: '#64748b', margin: 0 }}>
                    Récupération du détail de la conversation
                  </p>
                </div>
              ) : detailsError ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444', margin: '0 0 8px 0' }}>
                    Erreur de chargement
                  </h4>
                  <p style={{ color: '#64748b', margin: 0 }}>
                    Impossible de charger les détails de la conversation
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(conversationDetails?.messages || [])?.map((message: any, index: number) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                      gap: '16px'
                    }}
                  >
                    {/* Avatar */}
                    {message.type === 'assistant' && (
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '700',
                        flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(226, 0, 26, 0.3)'
                      }}>
                        🤖
                      </div>
                    )}

                    {/* Bulle de message */}
                    <div style={{
                      maxWidth: '75%',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: message.type === 'user' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: message.type === 'user' ? 'white' : '#1e293b',
                      border: message.type === 'user' ? 'none' : '1px solid #e2e8f0',
                      boxShadow: message.type === 'user' 
                        ? '0 8px 24px rgba(102, 126, 234, 0.3)'
                        : '0 4px 16px rgba(0, 0, 0, 0.06)'
                    }}>
                      <p style={{
                        margin: '0',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {message.content}
                      </p>
                      <div style={{
                        marginTop: '12px',
                        fontSize: '12px',
                        opacity: 0.8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR')}
                        </span>
                        {(() => {
                          // Pour les messages individuels, le feedback peut être différent
                          if (message.feedback) {
                            // Si c'est un string direct
                            if (typeof message.feedback === 'string') {
                              return (
                                <span style={{ fontSize: '14px' }}>
                                  {message.feedback === 'positive' ? '👍' : '👎'}
                                </span>
                              );
                            }
                            // Si c'est un objet avec type
                            if (message.feedback.type) {
                              return (
                                <span style={{ fontSize: '14px' }}>
                                  {message.feedback.type === 'positive' ? '👍' : '👎'}
                                </span>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Feedbacks détaillés pour ce message */}
                    {(() => {
                      const feedbackArray = conversationDetails?.feedback || selectedConversation.feedback || [];
                      const messageFeedbacks = feedbackArray.filter((f: any) => f.messageId === message.id);
                      
                      return messageFeedbacks.map((feedback: any, idx: number) => (
                        <motion.div
                          key={`feedback-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          style={{
                            maxWidth: '70%',
                            marginLeft: message.type === 'user' ? 'auto' : '60px',
                            marginRight: message.type === 'user' ? '0' : 'auto',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: feedback.type === 'positive' 
                              ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                              : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                            border: `2px solid ${feedback.type === 'positive' ? '#10b981' : '#ef4444'}`,
                            boxShadow: `0 4px 12px ${feedback.type === 'positive' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            marginTop: '8px'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px'
                          }}>
                            <span style={{
                              fontSize: '16px'
                            }}>
                              {feedback.type === 'positive' ? '👍' : '👎'}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              color: feedback.type === 'positive' ? '#059669' : '#dc2626',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Feedback {feedback.type === 'positive' ? 'positif' : 'négatif'}
                            </span>
                          </div>
                          {feedback.comment && (
                            <p style={{
                              margin: '0',
                              fontSize: '13px',
                              color: feedback.type === 'positive' ? '#059669' : '#dc2626',
                              fontStyle: 'italic',
                              lineHeight: '1.4'
                            }}>
                              "{feedback.comment}"
                            </p>
                          )}
                        </motion.div>
                      ));
                    })()}

                    {/* Avatar utilisateur */}
                    {message.type === 'user' && (
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '700',
                        flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                      }}>
                        👤
                      </div>
                    )}
                  </motion.div>
                ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ConversationsSection; 