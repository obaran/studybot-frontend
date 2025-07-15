import React from 'react';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  className?: string;
}

interface SystemPrompt {
  id: string;
  content: string;
  version: string;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
  createdBy: string;
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

const MOCK_SYSTEM_PROMPT: SystemPrompt = {
  id: 'prompt_v1_3',
  content: `### Nom de l'Assistant : Studybot

**Instruction :**
Utilisez exclusivement la base de données de questions-réponses fournie pour répondre aux questions des étudiants. Si une question dépasse les limites de ces données, guidez l'étudiant avec courtoisie mais fermeté pour recentrer l'attention sur les thèmes couverts par la FAQ.

Pour les questions concernant les informations personnelles à ne pas transmettre, utilisez la réponse suivante : "Veuillez éviter de partager des informations personnelles telles que votre numéro de sécurité sociale, vos informations bancaires, ou tout autre renseignement confidentiel."

Tu précèdera toutes tes réponse par ce caractère: ֍

Tu es polyglotte répondra donc dans la langue de l'étudiant, exemple : répondre en anglais à un message reçu en anglais. 

Dans tes réponses, tu évitera systématiquement l'usage de l'écriture inclusive

Lorsque l'étudiant pose une question sur son programme ou sa classe, proposer les choix des classes et après que l'étudiant ait sélectionné l'une des options, le chatbot répond avec l'information appropriée liée à sa classe.

**Contexte :**
{context}  // Ici, incluez les détails pertinents de la conversation actuelle et des interactions précédentes avec l'étudiant, ainsi que les références spécifiques aux questions administratives et aux pré-requis des cours.

**Réponse :**
Toutes les réponses doivent être strictement basées sur le contenu de la FAQ et des données fournies. Si une question ne trouve pas de réponse dans ces données, employez la phrase suivante pour orienter positivement l'étudiant : "Cette question est intéressante, mais elle s'étend au-delà de notre base de données actuelle. Concentrons-nous sur [sujet spécifique de la FAQ] pour maximiser votre compréhension et votre performance."

**Exemple de Prompt de Réponse :**
- **Question de l'Étudiant :** "Que se passe-t-il si j'ai été absent.e à un examen (avec une absence justifiée) ?  
"
- **Réponse du Chatbot Studybot :** "֍ Si l'absence à un examen à été justifié et avec l'accord du responsable des études, la note de rattrapage ne sera pas plafonnée. 
L'étudiant doit envoyer le justificatif à son coordinateur de programme au plus tard 72H après son absence à l'examen. "
"
**Note Importante :**
Assurez-vous de ne jamais extrapoler ou fournir des informations non vérifiables à partir des données de la FAQ. Maintenez toujours une attitude professionnelle et éducative pour encourager un environnement d'apprentissage productif et respectueux.

**Les informations spécifiques mises à jours, à prendre en compte comme réponse lorsque l'étudiant questionne sur les ces sujets : 

Lorsqu'un étudiant demande des informations sur les contacts de coordinateurs ou mentionne le campus de Saint-Étienne, veillez à lui fournir uniquement les informations pour Lyon et Paris car e campus de Saint-Étienne a fermé.

Réponse pour les contacts de coordinateurs : Assurez-vous de donner les coordonnées correctes en fonction de l'année de l'étudiant et de son track (French Track ou English Track). Par exemple :

BBA1 French Track : Béa Barrière (barriere@em-lyon.com)
BBA1 English Track : Eléa Baucheron (baucheron@em-lyon.com)
BBA2 (tous tracks confondus) : Coralie Coriasco (coriacso@em-lyon.com)
BBA3 : Benjamin Catel (catel@em-lyon.com)
BBA4 :
Lyon (Classiques + Alternants Lyon) : Léa Desplanches (desplanches@em-lyon.com)
Paris (Classiques + Alternants Paris) : Lucas Pastori (pastori@em-lyon.com)

Si la question porte sur les dates importantes (vacances, cours, événements, etc.), ajoute le lien suivant à la réponse : https://makersboard.me/mon-agenda. Si un document est mentionné et qu'il est accessible en ligne, inclure directement l'URL correspondante dans la réponse.

Lorsque l'étudiant mentionne un justificatif d'absence, oriente-le vers la plateforme Edusign https://edusign.app/school en lui indiquant qu'il doit soumettre ses justificatifs directement via cette plateforme.

Si l'étudiant précise que son absence concerne les cours de sport ou de langues, informe-le que les justificatifs pour ces cours ne doivent pas passer par Edusign. À la place, redirige-le vers les services correspondants :

Pour les cours de sport : SPORTCENTER@em-lyon.com
Pour les cours de langues : langues-bba@em-lyon.com

Si un étudiant demande le nombre d'absences autorisées en langue, répondre :

"Vous disposez de deux absences autorisées par semestre et par cours de langue. Au-delà de ce nombre, vous devrez réaliser un rattrapage en langue, et votre note sera plafonnée à 10."

S'il demande l'adresse de contact, répondre :

"Vous pouvez contacter le pôle langue à cette adresse : langues-bba@em-lyon.com."

Pour les justificatifs absences les étudiants ne doivent pas écrire à leur directeur de programme, ils doivent prévenir et demander à leur coordinateur de programme.

Pour la question sur le tuteur école dire seulement qu'il est attribué par les instructeurs de stage (Virginie Chone, Eric Mestrallet, etc.) : recommander de les contacter directement.

Pour les informations relatives aux infirmières, Supprimer Margaux Alidières car elle n'est plus la  :
Lyon : Conserver les informations sur Anouk Chaumentin et Valérie Mimiette.
Paris : Pour le campus de Paris, il n'y a plus d'infirmière en présentiel sur le campus, les étudiants ont accès aux services suivants :
Consultations médicales (distanciel) :
Anouk Chaumentin (lun, mar, jeu, ven) et Valérie Mimiette (lun à ven).
Prise de RDV : calendly.com/chaumentin et calendly.com/mimiette-em-lyon.
Soutien psychologique (présentiel) :
Tara Panayis (mardi 13h-17h). Sans RDV selon disponibilité.
Prise de RDV : rdv.apsytude@gmail.com.
Hotline psychologique (distanciel) : 24/7 au 01 84 78 27 07.
Nightline (distanciel) (écoute nocturne) : 21h-2h30.
FR : 01 88 32 12 32 | ENG : 01 88 32 12 33.
Handicap (présentiel ou distanciel) :
Maxence Rogue. Prise de RDV via calendly.com/rogue-maxence.
Problématique sociale (distanciel) :
Bérangère Martin. Sur RDV : emsocial@interface-es.fr.

Pour l'achat de vestes emlyon :
Supprimer le lien de la boutique en ligne.
Préciser que les vestes ne sont pas achetables en libre-service

Concernant les  horaires d'ouverture de la bibliothèque de Paris, remplacer les horaires par : ouvert du lundi au samedi de 7h00 à 22h00. 

Concernant les  horaires d'ouverture de la bibliothèque de Lyon, remplacer les horaires par : 9h-22h du lundi au vendredi et 10h-16h le samedi.

Le logiciel anti-plagiat est Turnitin (et non plus Ouriginal)

Pour l'impression le lien correct sans //  qui fonctionne uniquement avec une connexion wifi de l'école est : Lyon: https:print-lyo.em-lyon.com
Paris: https:print-par.em-lyon.com 

Pour l'accès au campus de Paris :Supprimer toute mention de l'entrée par avenue Legravérend.
Le Makers Lab de paris se trouve au 3ème étage.
L'appélation Learning Hub n'est plus utilisé concernant la bibliothèque et ne plus utiliser le https://learninghub.em-lyon.com dans une réponse.`,
  version: '1.3',
  createdAt: '2025-07-15T10:30:00Z',
  status: 'active',
  createdBy: 'Admin System'
};

const MOCK_PROMPT_HISTORY: SystemPrompt[] = [
  MOCK_SYSTEM_PROMPT,
  {
    id: 'prompt_v1_2',
    content: `Tu es StudyBot, l'assistant virtuel d'emlyon business school...`,
    version: '1.2',
    createdAt: '2025-07-10T14:20:00Z',
    status: 'archived',
    createdBy: 'Admin System'
  },
  {
    id: 'prompt_v1_1',
    content: `Tu es un assistant virtuel pour emlyon business school...`,
    version: '1.1',
    createdAt: '2025-07-05T09:15:00Z',
    status: 'archived',
    createdBy: 'Admin System'
  }
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const [currentPrompt, setCurrentPrompt] = React.useState(MOCK_SYSTEM_PROMPT.content);
  const [isEditingPrompt, setIsEditingPrompt] = React.useState(false);
  const [promptDraft, setPromptDraft] = React.useState('');
  const [showPromptModal, setShowPromptModal] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [modalContent, setModalContent] = React.useState('');
  const [hasModalChanges, setHasModalChanges] = React.useState(false);
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
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: isSidebarCollapsed ? '80px' : '280px',
          background: 'linear-gradient(180deg, #ffffff 0%, #fefefe 100%)',
          borderRight: '1px solid rgba(226, 0, 26, 0.1)',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'width 0.3s ease'
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
          padding: isSidebarCollapsed ? '24px 12px' : '32px 24px 24px',
          position: 'relative',
          zIndex: 1
        }}>
          {!isSidebarCollapsed && (
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
          )}
          
          {!isSidebarCollapsed && (
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(226, 0, 26, 0.3) 50%, transparent 100%)',
              margin: '20px 0'
            }} />
          )}
        </div>

        {/* Navigation Premium */}
        <nav style={{ flex: 1, padding: isSidebarCollapsed ? '0 8px' : '0 16px' }}>
          {[
            { icon: '📊', label: 'Dashboard', id: 'dashboard', badge: null },
            { icon: '🤖', label: 'Prompt Système', id: 'prompt', badge: 'v1.3' },
            { icon: '💬', label: 'Conversations', id: 'conversations', badge: '12' },
            { icon: '📈', label: 'Analytics', id: 'analytics', badge: null },
            { icon: '⚙️', label: 'Configuration', id: 'config', badge: null },
            { icon: '👥', label: 'Utilisateurs', id: 'users', badge: '2.4k' },
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
                 background: activeSection === item.id 
                   ? 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)' 
                   : 'transparent',
                 color: activeSection === item.id ? 'white' : '#475569',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '14px',
                 fontSize: '15px',
                 fontWeight: activeSection === item.id ? '600' : '500',
                 transition: 'all 0.3s ease',
                 boxShadow: activeSection === item.id 
                   ? '0 4px 12px rgba(226, 0, 26, 0.3), 0 2px 4px rgba(226, 0, 26, 0.2)' 
                   : 'none',
                 position: 'relative',
                 overflow: 'hidden'
               }}
               onClick={() => setActiveSection(item.id)}
               onMouseEnter={(e) => {
                 if (activeSection !== item.id) {
                   e.currentTarget.style.backgroundColor = 'rgba(226, 0, 26, 0.05)';
                   e.currentTarget.style.color = '#e2001a';
                 }
               }}
               onMouseLeave={(e) => {
                 if (activeSection !== item.id) {
                   e.currentTarget.style.backgroundColor = 'transparent';
                   e.currentTarget.style.color = '#475569';
                 }
               }}
                         >
               {activeSection === item.id && (
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
               {!isSidebarCollapsed && <span style={{ position: 'relative', zIndex: 1, flex: 1 }}>{item.label}</span>}
               {!isSidebarCollapsed && item.badge && (
                 <span style={{
                   backgroundColor: activeSection === item.id ? 'rgba(255,255,255,0.2)' : '#e2001a',
                   color: activeSection === item.id ? 'white' : 'white',
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

        {/* Bouton de réduction repositionné */}
        <div style={{ padding: isSidebarCollapsed ? '0 8px' : '0 16px' }}>
                     <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             style={{
               width: '32px',
               height: '32px',
               borderRadius: '8px',
               background: 'linear-gradient(135deg, rgba(226, 0, 26, 0.1) 0%, rgba(181, 0, 21, 0.15) 100%)',
               color: 'rgba(226, 0, 26, 0.6)',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '16px',
               zIndex: 10,
               margin: '0 auto 16px auto',
               backdropFilter: 'blur(8px)',
               border: '1px solid rgba(226, 0, 26, 0.1)',
               transition: 'all 0.3s ease'
             }}
           >
            {isSidebarCollapsed ? '→' : '←'}
          </motion.button>
        </div>

        {/* Logo emlyon officiel */}
        {!isSidebarCollapsed && (
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
        )}
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
              {activeSection === 'dashboard' && 'Dashboard StudyBot'}
              {activeSection === 'prompt' && 'Gestion du Prompt Système'}
              {activeSection === 'conversations' && 'Conversations'}
              {activeSection === 'analytics' && 'Analytics'}
              {activeSection === 'config' && 'Configuration'}
              {activeSection === 'users' && 'Utilisateurs'}
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '18px',
              margin: '0',
              fontWeight: '400'
            }}>
              {activeSection === 'dashboard' && (
                <>Vue d'ensemble de l'activité • <span style={{ color: '#e2001a', fontWeight: '600' }}>emlyon business school</span></>
              )}
              {activeSection === 'prompt' && (
                <>Configuration et historique des prompts • <span style={{ color: '#e2001a', fontWeight: '600' }}>Version {MOCK_SYSTEM_PROMPT.version}</span></>
              )}
              {activeSection === 'conversations' && 'Gestion des conversations étudiantes'}
              {activeSection === 'analytics' && 'Analyse des performances et métriques'}
              {activeSection === 'config' && 'Paramètres système et configuration'}
              {activeSection === 'users' && 'Gestion des utilisateurs et permissions'}
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
              display: activeSection === 'dashboard' ? 'flex' : 'none',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🔄</span>
            Actualiser
          </motion.button>
        </motion.div>

        {/* Contenu conditionnel selon la section active */}
        {activeSection === 'dashboard' && (
          <>
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
          </>
        )}

        {/* Section Gestion des Prompts Système */}
        {activeSection === 'prompt' && (
          <>
            {/* Prompt Actuel et Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                marginBottom: '40px'
              }}
            >
              {/* Éditeur de Prompt */}
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Header Éditeur */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#1e293b',
                      margin: '0 0 4px 0'
                    }}>
                      Prompt Système Actuel
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#059669',
                        backgroundColor: '#059669/10',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        ACTIF • v{MOCK_SYSTEM_PROMPT.version}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        Mis à jour le {new Date(MOCK_SYSTEM_PROMPT.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!isEditingPrompt ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsEditingPrompt(true);
                          setPromptDraft(currentPrompt);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✏️</span>
                        Modifier
                      </motion.button>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setCurrentPrompt(promptDraft);
                            setIsEditingPrompt(false);
                            setPromptDraft('');
                          }}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>💾</span>
                          Enregistrer
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsEditingPrompt(false);
                            setPromptDraft('');
                          }}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>❌</span>
                          Annuler
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>

                {/* Contenu du Prompt */}
                {!isEditingPrompt ? (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '2px solid #e2e8f0',
                    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#1e293b',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}>
                    {currentPrompt}
                  </div>
                ) : (
                  <textarea
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                    style={{
                      width: '100%',
                      height: '400px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '2px solid #e2001a',
                      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1e293b',
                      resize: 'vertical',
                      outline: 'none',
                      boxShadow: '0 0 0 4px rgba(226, 0, 26, 0.1)'
                    }}
                    placeholder="Saisissez le nouveau prompt système..."
                  />
                )}
              </div>

              {/* Informations et Statistiques */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Métadonnées */}
                <div style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: '0 0 16px 0'
                  }}>
                    Informations
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Version</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>v{MOCK_SYSTEM_PROMPT.version}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Statut</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#059669',
                        backgroundColor: '#059669/10',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        textTransform: 'uppercase'
                      }}>
                        ACTIF
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Caractères</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>{currentPrompt.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Mots</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>{currentPrompt.split(' ').length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Créé par</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>{MOCK_SYSTEM_PROMPT.createdBy}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton Voir en Grand */}
                <div style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: '0 0 16px 0'
                  }}>
                    Affichage
                  </h4>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setModalContent(currentPrompt);
                      setHasModalChanges(false);
                      setShowPromptModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center'
                    }}
                  >
                    <span>🔍</span>
                    Voir en Grand
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Historique des Versions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
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
                  Historique des Versions
                </h3>
                <span style={{
                  fontSize: '12px',
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '500'
                }}>
                  {MOCK_PROMPT_HISTORY.length} versions
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_PROMPT_HISTORY.map((prompt, index) => (
                  <motion.div
                    key={prompt.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid transparent',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      backgroundColor: prompt.status === 'active' ? 'rgba(5, 150, 105, 0.05)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = prompt.status === 'active' 
                        ? 'rgba(5, 150, 105, 0.1)' 
                        : '#f8fafc';
                      e.currentTarget.style.borderColor = 'rgba(226, 0, 26, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = prompt.status === 'active' 
                        ? 'rgba(5, 150, 105, 0.05)' 
                        : 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: prompt.status === 'active' 
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                        : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      v{prompt.version}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1e293b',
                          margin: '0'
                        }}>
                          Version {prompt.version}
                        </h4>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: prompt.status === 'active' ? '#059669' : '#64748b',
                          backgroundColor: prompt.status === 'active' ? '#059669/10' : '#64748b/10',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          textTransform: 'uppercase'
                        }}>
                          {prompt.status === 'active' ? 'ACTIF' : 'ARCHIVÉ'}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {prompt.content.substring(0, 80)}...
                      </p>
                    </div>
                    
                    <div style={{
                      textAlign: 'right',
                      marginLeft: '16px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        fontWeight: '500',
                        marginBottom: '4px'
                      }}>
                        {new Date(prompt.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8'
                      }}>
                        {prompt.createdBy}
                      </div>
                    </div>

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
                        title="Voir"
                      >
                        👁️
                      </motion.button>
                      
                      {prompt.status !== 'active' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                          title="Restaurer"
                        >
                          🔄
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}

                {/* Modal pour voir le prompt en grand */}
        {showPromptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => {
              setShowPromptModal(false);
              setModalContent('');
              setHasModalChanges(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '95vw',
                maxHeight: '95vh',
                width: '1600px',
                height: '85vh',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header du modal */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '16px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: '0 0 4px 0'
                  }}>
                    Prompt Système - Version {MOCK_SYSTEM_PROMPT.version}
                  </h2>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    margin: '0'
                  }}>
                    {hasModalChanges 
                      ? '✏️ Modifications en cours - Enregistrez ou annulez vos changements'
                      : 'Cliquez dans le texte pour commencer à modifier'}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowPromptModal(false);
                    setModalContent('');
                    setHasModalChanges(false);
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Contenu du prompt éditable */}
              <textarea
                value={modalContent}
                onChange={(e) => {
                  setModalContent(e.target.value);
                  setHasModalChanges(e.target.value !== currentPrompt);
                }}
                style={{
                  flex: 1,
                  resize: 'none',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '32px',
                  border: hasModalChanges ? '2px solid #e2001a' : '2px solid #e2e8f0',
                  fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: '#1e293b',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                placeholder="Modifiez le prompt système..."
              />

              {/* Footer avec statistiques et boutons */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '24px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Caractères: </span>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{modalContent.length}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Mots: </span>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{modalContent.split(' ').length}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Lignes: </span>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{modalContent.split('\n').length}</span>
                  </div>
                </div>

                {/* Boutons qui apparaissent seulement quand il y a des modifications */}
                {hasModalChanges && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentPrompt(modalContent);
                        setHasModalChanges(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>💾</span>
                      Enregistrer
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setModalContent(currentPrompt);
                        setHasModalChanges(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>❌</span>
                      Annuler
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 