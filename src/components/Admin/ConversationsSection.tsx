import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useConversations } from '../../hooks/useAdminApi';
import type { ConversationFilters } from '../../types/admin';

const ConversationsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Utiliser le hook pour récupérer les vraies données
  const {
    conversations,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    updateFilters,
    updatePagination,
    searchConversations,
    exportConversations,
    refetch
  } = useConversations();

  // Mettre à jour les filtres quand les états locaux changent
  React.useEffect(() => {
    const newFilters: Partial<ConversationFilters> = {
      search: searchTerm || undefined,
      feedback: feedbackFilter === 'all' ? undefined : feedbackFilter,
      dateFrom: selectedDate || undefined,
      dateTo: selectedDate || undefined
    };
    updateFilters(newFilters);
  }, [searchTerm, feedbackFilter, selectedDate, updateFilters]);

  // Générer les dates pour le calendrier (janvier 2025)
  const generateCalendarDates = () => {
    const dates = [];
    const currentDate = new Date(2025, 0, 1); // Janvier 2025
    const daysInMonth = new Date(2025, 0 + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(2025, 0, day);
      const dateString = date.toISOString().split('T')[0];
      
      dates.push({
        day,
        dateString,
        hasConversations: conversations.some(conv => 
          conv.startTime.toISOString().split('T')[0] === dateString
        ),
        isToday: dateString === new Date().toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const handleExport = async () => {
    try {
      await exportConversations();
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          border: '2px solid #fecaca'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: '0 0 8px 0' }}>
          Erreur de connexion
        </h3>
        <p style={{ color: '#7f1d1d', margin: '0 0 16px 0' }}>
          Impossible de charger les conversations. Vérifiez que le backend est démarré.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={refetch}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔄 Réessayer
        </motion.button>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#7f1d1d' }}>
          Erreur: {error.message}
        </div>
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
        style={{ marginBottom: '32px' }}
      >
        {/* Header avec boutons d'action */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0'
            }}>
              💬 Conversations
            </h2>
            <p style={{
              color: '#64748b',
              margin: 0,
              fontSize: '16px'
            }}>
              {loading ? 'Chargement...' : `${total} conversations • Page ${page}/${totalPages}`}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={refetch}
              disabled={loading}
              style={{
                padding: '12px 20px',
                background: loading 
                  ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                  : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{loading ? '⏳' : '🔄'}</span>
              {loading ? 'Chargement...' : 'Actualiser'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={loading || conversations.length === 0}
              style={{
                padding: '12px 20px',
                background: conversations.length === 0 
                  ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: conversations.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📥</span>
              Exporter CSV
            </motion.button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <motion.input
              type="text"
              placeholder="Rechercher dans les conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ scale: 1.005 }}
              style={{
                width: '100%',
                padding: '18px 24px 18px 56px',
                borderRadius: '16px',
                border: '2px solid transparent',
                fontSize: '15px',
                outline: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                color: '#1e293b'
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #e2001a';
                e.target.style.boxShadow = '0 4px 16px rgba(226, 0, 26, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid transparent';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)';
              }}
            />
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
          </div>
        </div>

        {/* Filtres */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          {/* Sélecteur de date avec calendrier popup */}
          <div style={{ position: 'relative' }}>
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
                {selectedDate 
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })
                  : 'Toutes les dates'}
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
            {selectedDate && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate('');
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
                title="Effacer la date"
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
                {/* En-tête du calendrier */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '16px',
                  padding: '8px',
                  background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '16px'
                }}>
                  Janvier 2025
                </div>

                {/* Jours de la semaine */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <div key={i} style={{
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

                {/* Grille des dates */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '2px'
                }}>
                  {generateCalendarDates().map((dateInfo, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.1, backgroundColor: '#e2001a' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedDate(dateInfo.dateString);
                        setIsCalendarOpen(false);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        borderRadius: '8px',
                        background: selectedDate === dateInfo.dateString 
                          ? '#e2001a' 
                          : dateInfo.isToday 
                          ? '#f1f5f9' 
                          : 'transparent',
                        color: selectedDate === dateInfo.dateString || dateInfo.isToday 
                          ? selectedDate === dateInfo.dateString ? 'white' : '#1e293b'
                          : '#64748b',
                        fontSize: '13px',
                        fontWeight: selectedDate === dateInfo.dateString || dateInfo.isToday ? '600' : '500',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {dateInfo.day}
                      {dateInfo.hasConversations && (
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          backgroundColor: selectedDate === dateInfo.dateString ? 'white' : '#e2001a',
                          borderRadius: '50%'
                        }} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Filtre feedback */}
          <motion.select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value as any)}
            whileFocus={{ scale: 1.005 }}
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
            onFocus={(e) => {
              e.target.style.border = '2px solid #e2001a';
              e.target.style.boxShadow = '0 4px 16px rgba(226, 0, 26, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08)';
            }}
            onBlur={(e) => {
              e.target.style.border = '2px solid transparent';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)';
            }}
          >
            <option value="all">Tous les feedbacks</option>
            <option value="positive">👍 Positifs seulement</option>
            <option value="negative">👎 Négatifs seulement</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Liste des conversations */}
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #e2001a',
                borderRadius: '50%',
                margin: '0 auto 16px'
              }}
            />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
              Chargement des conversations...
            </h3>
            <p style={{ color: '#64748b', margin: 0 }}>
              Connexion au backend en cours
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
              Aucune conversation trouvée
            </h3>
            <p style={{ color: '#64748b', margin: 0 }}>
              {searchTerm || feedbackFilter !== 'all' || selectedDate 
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Les conversations apparaîtront ici une fois que les utilisateurs commenceront à interagir avec le chatbot'
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backgroundColor: conversation.status === 'active' ? 'rgba(5, 150, 105, 0.05)' : 'transparent',
                  borderBottom: index < conversations.length - 1 ? '1px solid #f1f5f9' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = conversation.status === 'active' 
                    ? 'rgba(5, 150, 105, 0.1)' 
                    : 'rgba(226, 0, 26, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(226, 0, 26, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = conversation.status === 'active' 
                    ? 'rgba(5, 150, 105, 0.05)' 
                    : 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Avatar utilisateur */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px',
                  marginRight: '16px'
                }}>
                  {conversation.user.identifier.charAt(0)}
                </div>

                {/* Contenu conversation */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: '0 0 4px 0'
                      }}>
                        {conversation.user.identifier}
                      </h4>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: '500'
                        }}>
                          {new Date(conversation.startTime).toLocaleDateString('fr-FR')} • {new Date(conversation.lastMessageTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: '500'
                        }}>
                          {conversation.messageCount} messages
                        </span>
                        {conversation.totalTokensUsed && (
                          <span style={{
                            fontSize: '12px',
                            color: '#64748b',
                            fontWeight: '500'
                          }}>
                            {conversation.totalTokensUsed} tokens
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Status et feedback */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {conversation.feedback && conversation.feedback.length > 0 && (
                        <span style={{ fontSize: '16px' }}>
                          {conversation.feedback.some(f => f.type === 'positive') ? '👍' : '👎'}
                        </span>
                      )}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: conversation.status === 'active' ? '#059669' : '#64748b',
                        backgroundColor: conversation.status === 'active' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        textTransform: 'uppercase'
                      }}>
                        {conversation.status === 'active' ? 'EN COURS' : 'TERMINÉ'}
                      </span>
                    </div>
                  </div>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: '0',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ marginLeft: '16px', display: 'flex', gap: '8px' }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}
                    title="Voir la conversation"
                    onClick={() => console.log('Voir conversation:', conversation.id)}
                  >
                    👁️
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updatePagination({ page: Math.max(1, page - 1) })}
              disabled={page === 1}
              style={{
                padding: '8px 12px',
                background: page === 1 
                  ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
                  : 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                color: page === 1 ? '#64748b' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Précédent
            </motion.button>
            
            <span style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              Page {page} sur {totalPages}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updatePagination({ page: Math.min(totalPages, page + 1) })}
              disabled={page === totalPages}
              style={{
                padding: '8px 12px',
                background: page === totalPages 
                  ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
                  : 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                color: page === totalPages ? '#64748b' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Suivant →
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ConversationsSection; 