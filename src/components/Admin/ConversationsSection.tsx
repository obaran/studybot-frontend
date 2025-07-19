import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useConversations } from '../../hooks/useAdminApi';
import type { ConversationFilters } from '../../types/admin';

const ConversationsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showConversationModal, setShowConversationModal] = useState(false);

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
        style={{ padding: '20px', textAlign: 'center', color: 'red' }}
      >
        <h3>Erreur de chargement</h3>
        <p>{error?.toString()}</p>
        <button onClick={refetch}>Réessayer</button>
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
                  {/* Jours du mois de janvier 2025 */}
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const dateString = `2025-01-${day.toString().padStart(2, '0')}`;
                    const isToday = new Date().toISOString().split('T')[0] === dateString;
                                         const hasConversations = conversations?.some(conv => 
                       new Date(conv.startTime).toISOString().split('T')[0] === dateString
                     );
                    
                    return (
                      <motion.button
                        key={day}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedDate(dateString);
                          setIsCalendarOpen(false);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          borderRadius: '8px',
                          background: selectedDate === dateString 
                            ? 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)' 
                            : isToday 
                            ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' 
                            : hasConversations 
                            ? 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)'
                            : 'transparent',
                          color: selectedDate === dateString
                            ? 'white'
                            : isToday 
                              ? '#1e293b'
                              : '#64748b',
                          fontSize: '13px',
                          fontWeight: selectedDate === dateString || isToday ? '600' : '500',
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
                            backgroundColor: selectedDate === dateString ? 'white' : '#e2001a',
                            borderRadius: '50%'
                          }} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Actions du calendrier */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  gap: '8px'
                }}>
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
                  {selectedDate && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedDate('');
                        setIsCalendarOpen(false);
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
                      Effacer
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Filtre par feedback */}
          <motion.select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value as 'all' | 'positive' | 'negative')}
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
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 24px 0'
        }}>
          Conversations ({conversations?.length || 0})
        </h3>

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
                  {conversation.userId?.charAt(0)?.toUpperCase() || 'U'}
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
                           const hasPositive = feedbackArray.some((f: any) => f.type === 'positive');
                           const hasNegative = feedbackArray.some((f: any) => f.type === 'negative');
                           
                           if (hasPositive || hasNegative) {
                             const feedbackType = hasPositive ? 'positive' : 'negative';
                             return (
                               <span style={{
                                 fontSize: '13px',
                                 color: feedbackType === 'positive' ? '#10b981' : '#ef4444',
                                 fontWeight: '600',
                                 background: feedbackType === 'positive' ? '#ecfdf5' : '#fef2f2',
                                 padding: '4px 8px',
                                 borderRadius: '6px'
                               }}>
                                 {feedbackType === 'positive' ? '👍 Positif' : '👎 Négatif'}
                               </span>
                             );
                           }
                           return null;
                         })()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {(() => {
                        const feedbackArray = conversation.feedback || [];
                        const hasPositive = feedbackArray.some((f: any) => f.type === 'positive');
                        const hasNegative = feedbackArray.some((f: any) => f.type === 'negative');
                        
                        if (hasPositive || hasNegative) {
                          return (
                            <span style={{ fontSize: '20px' }}>
                              {hasPositive ? '👍' : '👎'}
                            </span>
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
                      fontSize: '14px', 
                      color: '#64748b', 
                      fontWeight: '600',
                      background: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      🆔 Session: {selectedConversation.sessionId}
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
                      💬 {selectedConversation.messages?.length || 0} messages
                    </span>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedConversation.messages?.map((message: any, index: number) => (
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ConversationsSection; 