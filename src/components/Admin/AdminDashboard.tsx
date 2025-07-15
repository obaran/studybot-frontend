import React from 'react';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  className?: string;
}

// Données mockées pour commencer
const MOCK_METRICS = {
  totalConversations: 1247,
  todayMessages: 89,
  averageRating: 4.2,
  activeUsers: 34
};

const MOCK_CONVERSATIONS = [
  { id: 1, user: 'Étudiant BBA2', lastMessage: 'Merci pour les informations sur les horaires', time: '14:32', status: 'completed' },
  { id: 2, user: 'Étudiant BBA1', lastMessage: 'Comment accéder aux cours en ligne ?', time: '14:28', status: 'active' },
  { id: 3, user: 'Étudiant BBA3', lastMessage: 'Informations sur les stages', time: '14:15', status: 'completed' },
  { id: 4, user: 'Étudiant BBA4', lastMessage: 'Contact coordinateur Lyon', time: '13:45', status: 'completed' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  return (
    <div className={className} style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar Navigation Premium */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: "easeOutCubic" }}
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, #ffffff 0%, #fefefe 100%)',
          borderRight: '1px solid rgba(226, 0, 26, 0.1)',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(180deg, rgba(226, 0, 26, 0.03) 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />

        {/* Header avec titre premium */}
        <div style={{
          padding: '32px 24px 24px',
          position: 'relative',
          zIndex: 1
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
            <h1 style={{
              background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '28px',
              fontWeight: '800',
              margin: '0',
              letterSpacing: '-0.02em'
            }}>
              StudyBot
            </h1>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              fontWeight: '500',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              ADMINISTRATION
            </div>
          </motion.div>
          
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(226, 0, 26, 0.3) 50%, transparent 100%)',
            margin: '20px 0'
          }} />
        </div>

        {/* Navigation Premium */}
        <nav style={{ flex: 1, padding: '0 16px' }}>
          {[
            { icon: '📊', label: 'Dashboard', active: true, badge: null },
            { icon: '💬', label: 'Conversations', active: false, badge: '12' },
            { icon: '📈', label: 'Analytics', active: false, badge: null },
            { icon: '⚙️', label: 'Configuration', active: false, badge: null },
            { icon: '👥', label: 'Utilisateurs', active: false, badge: '2.4k' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ 
                x: 4,
                transition: { duration: 0.2 }
              }}
              style={{
                padding: '14px 20px',
                borderRadius: '12px',
                marginBottom: '6px',
                background: item.active 
                  ? 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)' 
                  : 'transparent',
                color: item.active ? 'white' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '15px',
                fontWeight: item.active ? '600' : '500',
                transition: 'all 0.3s ease',
                boxShadow: item.active 
                  ? '0 4px 12px rgba(226, 0, 26, 0.3), 0 2px 4px rgba(226, 0, 26, 0.2)' 
                  : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'rgba(226, 0, 26, 0.05)';
                  e.currentTarget.style.color = '#e2001a';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              {item.active && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                  pointerEvents: 'none'
                }} />
              )}
              <span style={{ fontSize: '18px', position: 'relative', zIndex: 1 }}>{item.icon}</span>
              <span style={{ position: 'relative', zIndex: 1, flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  backgroundColor: item.active ? 'rgba(255,255,255,0.2)' : '#e2001a',
                  color: item.active ? 'white' : 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {item.badge}
                </span>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Logo emlyon officiel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            margin: '24px 16px',
            padding: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            textAlign: 'center',
            border: '2px solid rgba(226, 0, 26, 0.1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <img 
            src="https://aksflowisestorageprod.blob.core.windows.net/images/emlyon_logo_seul_rvb.png"
            alt="emlyon business school"
            style={{
              width: '100%',
              maxWidth: '100px',
              height: 'auto',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Contenu Principal Premium */}
      <div style={{
        flex: 1,
        padding: '32px 40px',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'radial-gradient(ellipse at top, rgba(226, 0, 26, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Header Premium */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            marginBottom: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}>
              Dashboard StudyBot
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '18px',
              margin: '0',
              fontWeight: '400'
            }}>
              Vue d'ensemble de l'activité • <span style={{ color: '#e2001a', fontWeight: '600' }}>emlyon business school</span>
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(226, 0, 26, 0.3), 0 2px 4px rgba(226, 0, 26, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🔄</span>
            Actualiser
          </motion.button>
        </motion.div>

        {/* Métriques Cards Premium */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          {[
            { title: 'Conversations Totales', value: MOCK_METRICS.totalConversations, icon: '💬', color: '#e2001a', trend: '+12%' },
            { title: 'Messages Aujourd\'hui', value: MOCK_METRICS.todayMessages, icon: '📝', color: '#059669', trend: '+8%' },
            { title: 'Note Moyenne', value: `${MOCK_METRICS.averageRating}/5`, icon: '⭐', color: '#d97706', trend: '+0.3' },
            { title: 'Utilisateurs Actifs', value: MOCK_METRICS.activeUsers, icon: '👥', color: '#0ea5e9', trend: '+5%' },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                padding: '28px',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background Gradient */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${metric.color}15 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#64748b',
                  margin: '0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {metric.title}
                </h3>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${metric.color} 0%, ${metric.color}CC 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: `0 4px 12px ${metric.color}40`
                }}>
                  {metric.icon}
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: metric.color,
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em'
                }}>
                  {metric.value}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#059669',
                    backgroundColor: '#059669/10',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    {metric.trend}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    vs mois dernier
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Conversations Récentes Premium */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0'
            }}>
              Conversations Récentes
            </h3>
            <span style={{
              fontSize: '12px',
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: '500'
            }}>
              En temps réel
            </span>
          </div>
          
          <div style={{ overflow: 'auto' }}>
            {MOCK_CONVERSATIONS.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{
                  x: 4,
                  transition: { duration: 0.2 }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  borderRadius: '16px',
                  marginBottom: index < MOCK_CONVERSATIONS.length - 1 ? '12px' : '0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = 'rgba(226, 0, 26, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: conv.status === 'active' 
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                    : 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: conv.status === 'active' 
                    ? '0 4px 12px rgba(5, 150, 105, 0.3)' 
                    : '0 4px 12px rgba(226, 0, 26, 0.3)'
                }}>
                  {conv.user.charAt(0)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 4px 0'
                  }}>
                    {conv.user}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: '0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conv.lastMessage}
                  </p>
                </div>
                
                <div style={{
                  textAlign: 'right',
                  marginLeft: '16px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>
                    {conv.time}
                  </span>
                  <div style={{
                    marginTop: '6px'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: conv.status === 'active' 
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                        : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                      color: 'white',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {conv.status === 'active' ? 'En cours' : 'Terminé'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 