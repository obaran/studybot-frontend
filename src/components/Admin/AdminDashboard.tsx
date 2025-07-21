import React from 'react';
import { motion } from 'framer-motion';
import ConversationsSection from './ConversationsSection';
import { useConversationsCount } from '../../hooks/useAdminApi';

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
  { id: 1, user: 'Étudiant BBA2', lastMessage: 'Merci pour les informations sur les horaires', time: '14:32', date: '2025-01-15', status: 'completed', feedback: 'positive', messageCount: 5 },
  { id: 2, user: 'Étudiant BBA1', lastMessage: 'Comment accéder aux cours en ligne ?', time: '14:28', date: '2025-01-15', status: 'active', feedback: null, messageCount: 3 },
  { id: 3, user: 'Étudiant BBA3', lastMessage: 'Informations sur les stages', time: '14:15', date: '2025-01-15', status: 'completed', feedback: 'positive', messageCount: 8 },
  { id: 4, user: 'Étudiant BBA4', lastMessage: 'Contact coordinateur Lyon', time: '13:45', date: '2025-01-15', status: 'completed', feedback: 'negative', messageCount: 4 },
  { id: 5, user: 'Étudiant BBA1', lastMessage: 'Problème avec mon planning de cours', time: '12:30', date: '2025-01-15', status: 'completed', feedback: 'negative', messageCount: 6 },
  { id: 6, user: 'Étudiant BBA3', lastMessage: 'Excellente aide pour les démarches administratives', time: '11:15', date: '2025-01-14', status: 'completed', feedback: 'positive', messageCount: 7 },
  { id: 7, user: 'Étudiant BBA2', lastMessage: 'Informations incomplètes sur les examens', time: '16:45', date: '2025-01-14', status: 'completed', feedback: 'negative', messageCount: 9 },
  { id: 8, user: 'Étudiant BBA4', lastMessage: 'Merci pour l\'aide avec les coordonnées', time: '10:22', date: '2025-01-14', status: 'completed', feedback: 'positive', messageCount: 3 },
  { id: 9, user: 'Étudiant BBA1', lastMessage: 'Questions sur les stages à l\'étranger', time: '09:15', date: '2025-01-13', status: 'completed', feedback: 'positive', messageCount: 12 },
  { id: 10, user: 'Étudiant BBA3', lastMessage: 'Réponse pas claire sur les frais de scolarité', time: '15:30', date: '2025-01-13', status: 'completed', feedback: 'negative', messageCount: 5 },
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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [feedbackFilter, setFeedbackFilter] = React.useState('all'); // 'all', 'positive', 'negative'
  const [selectedDate, setSelectedDate] = React.useState(''); // Date sélectionnée au format YYYY-MM-DD
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false); // État du calendrier popup
  const [showAddUserModal, setShowAddUserModal] = React.useState(false); // Modal d'ajout d'utilisateur
  const [showPermissionsModal, setShowPermissionsModal] = React.useState(false); // Modal de permissions
  const [selectedUser, setSelectedUser] = React.useState<any>(null); // Utilisateur sélectionné pour édition
  
  // Hook pour récupérer le nombre total de conversations pour le badge
  const { data: conversationsCountData, refetch: refetchConversationsCount } = useConversationsCount();
  const conversationsCount = conversationsCountData?.total || 0;

  // Générer les dates pour le calendrier (janvier 2025) - utilisée dans la section legacy désactivée
  const generateCalendarDates = () => {
    const dates = [];
    // const currentDate = new Date(2025, 0, 1); // Janvier 2025 - non utilisée actuellement
    const daysInMonth = new Date(2025, 0 + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(2025, 0, day);
      const dateString = date.toISOString().split('T')[0];
      const hasConversations = MOCK_CONVERSATIONS.some(conv => conv.date === dateString);
      
      dates.push({
        day,
        dateString,
        hasConversations,
        isToday: dateString === '2025-01-15' // Simuler "aujourd'hui"
      });
    }
    return dates;
  };
  return (
    <div className={className} style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" // ✅ Poppins priorité
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
            { icon: '💬', label: 'Conversations', id: 'conversations', badge: conversationsCount.toString() },
            { icon: '🤖', label: 'Prompt Système', id: 'prompt', badge: 'v1.3' },
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
            onClick={() => {
              // Actualiser le badge des conversations
              refetchConversationsCount();
            }}
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



        {/* Section Conversations */}
        {activeSection === 'conversations' && <ConversationsSection />}
        
        {/* LEGACY - Section Conversations Inline (sera supprimé) */}
        {false && activeSection === 'conversations' && (
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
                        gap: '4px'
                      }}>
                        {/* Espaces vides pour commencer le mois au bon jour */}
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={`empty-${i}`} style={{ height: '36px' }} />
                        ))}
                        
                        {/* Dates du mois */}
                        {generateCalendarDates().map((dateInfo) => (
                          <motion.button
                            key={dateInfo.day}
                            onClick={() => {
                              setSelectedDate(dateInfo.dateString);
                              setIsCalendarOpen(false);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                              width: '36px',
                              height: '36px',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              position: 'relative',
                              background: selectedDate === dateInfo.dateString
                                ? 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)'
                                : dateInfo.isToday
                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                : dateInfo.hasConversations
                                ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                                : 'transparent',
                              color: selectedDate === dateInfo.dateString || dateInfo.isToday
                                ? 'white'
                                : dateInfo.hasConversations
                                ? '#1e293b'
                                : '#94a3b8',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {dateInfo.day}
                            {dateInfo.hasConversations && (
                              <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: selectedDate === dateInfo.dateString ? 'white' : '#e2001a'
                              }} />
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {/* Légende */}
                      <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#e2001a'
                          }} />
                          Conversations
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#fbbf24'
                          }} />
                          Aujourd'hui
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Filtre par feedback */}
                <div style={{ position: 'relative' }}>
                  <motion.select
                    value={feedbackFilter}
                    onChange={(e) => setFeedbackFilter(e.target.value)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      width: '100%',
                      padding: '16px 50px 16px 24px',
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
                      transition: 'all 0.3s ease',
                      appearance: 'none'
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
                    <option value="all">🌟 Tous les feedbacks</option>
                    <option value="positive">👍 Feedback positif</option>
                    <option value="negative">👎 Feedback négatif</option>
                  </motion.select>
                  
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    ▼
                  </div>
                </div>
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
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0'
              }}>
                Conversations ({(() => {
                  const filtered = MOCK_CONVERSATIONS.filter(conv => {
                    const matchesSearch = conv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFeedback = feedbackFilter === 'all' || 
                                          (feedbackFilter === 'positive' && conv.feedback === 'positive') ||
                                          (feedbackFilter === 'negative' && conv.feedback === 'negative');
                    
                    // Filtre par date sélectionnée
                    const matchesDate = !selectedDate || conv.date === selectedDate;
                    
                    return matchesSearch && matchesFeedback && matchesDate;
                  });
                  return filtered.length;
                })()})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  // Filtrage et tri des conversations
                  const filtered = MOCK_CONVERSATIONS.filter(conv => {
                    const matchesSearch = conv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFeedback = feedbackFilter === 'all' || 
                                          (feedbackFilter === 'positive' && conv.feedback === 'positive') ||
                                          (feedbackFilter === 'negative' && conv.feedback === 'negative');
                    
                    // Filtre par date sélectionnée
                    const matchesDate = !selectedDate || conv.date === selectedDate;
                    
                    return matchesSearch && matchesFeedback && matchesDate;
                  });

                                     // Tri par date/heure (plus récent en premier)
                   const sorted = filtered.sort((a, b) => {
                     const dateA = new Date(`${a.date}T${a.time}`).getTime();
                     const dateB = new Date(`${b.date}T${b.time}`).getTime();
                     return dateB - dateA;
                   });

                  return sorted.map((conversation, index) => (
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
                        backgroundColor: conversation.status === 'active' ? 'rgba(5, 150, 105, 0.05)' : 'transparent'
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
                        {conversation.user.charAt(0)}
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
                              {conversation.user}
                            </h4>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <span style={{
                                fontSize: '12px',
                                color: '#64748b',
                                fontWeight: '500'
                              }}>
                                {conversation.date} • {conversation.time}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                color: '#64748b',
                                fontWeight: '500'
                              }}>
                                {conversation.messageCount} messages
                              </span>
                            </div>
                          </div>
                          
                          {/* Status et feedback */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {conversation.feedback && (
                              <span style={{
                                fontSize: '16px'
                              }}>
                                {conversation.feedback === 'positive' ? '👍' : '👎'}
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
                          lineHeight: '1.5'
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
                        >
                          👁️
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                          title="Supprimer"
                        >
                          🗑️
                        </motion.button>
                      </div>
                    </motion.div>
                  ));
                })()}
              </div>
            </motion.div>
          </>
        )}

        {/* Section Analytics */}
        {activeSection === 'analytics' && (
          <>
            {/* Métriques principales */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}
            >
              {/* Total Tokens */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-20%',
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #e2001a15 0%, #e2001a05 100%)',
                  borderRadius: '50%'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      🪙
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        margin: '0'
                      }}>
                        Tokens Utilisés
                      </h4>
                      <p style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#1e293b',
                        margin: '4px 0 0 0'
                      }}>
                        2,847,592
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}>
                    <span style={{
                      color: '#10b981',
                      fontWeight: '600'
                    }}>
                      +12.5%
                    </span>
                    <span style={{ color: '#64748b' }}>
                      vs mois dernier
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Coût Estimé */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-20%',
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #059669a15 0%, #05966905 100%)',
                  borderRadius: '50%'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      💰
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        margin: '0'
                      }}>
                        Coût Estimé
                      </h4>
                      <p style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#1e293b',
                        margin: '4px 0 0 0'
                      }}>
                        €428.97
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}>
                    <span style={{
                      color: '#ef4444',
                      fontWeight: '600'
                    }}>
                      +8.2%
                    </span>
                    <span style={{ color: '#64748b' }}>
                      ce mois-ci
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Sessions Actives */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-20%',
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #3b82f615 0%, #3b82f605 100%)',
                  borderRadius: '50%'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      👥
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        margin: '0'
                      }}>
                        Sessions Actives
                      </h4>
                      <p style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#1e293b',
                        margin: '4px 0 0 0'
                      }}>
                        147
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}>
                    <span style={{
                      color: '#10b981',
                      fontWeight: '600'
                    }}>
                      +24.1%
                    </span>
                    <span style={{ color: '#64748b' }}>
                      aujourd'hui
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Graphique d'utilisation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '32px'
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0'
              }}>
                Utilisation Mensuelle - Janvier 2025
              </h3>

              {/* Graphique simplifié */}
              <div style={{
                height: '300px',
                position: 'relative',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                {/* Axe Y */}
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '20px',
                  bottom: '40px',
                  width: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <span>100k</span>
                  <span>75k</span>
                  <span>50k</span>
                  <span>25k</span>
                  <span>0</span>
                </div>

                {/* Graphique en barres */}
                <div style={{
                  marginLeft: '50px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  paddingBottom: '40px'
                }}>
                  {[
                    { day: '1', value: 45, label: '45k' },
                    { day: '2', value: 52, label: '52k' },
                    { day: '3', value: 38, label: '38k' },
                    { day: '4', value: 61, label: '61k' },
                    { day: '5', value: 28, label: '28k' },
                    { day: '6', value: 19, label: '19k' },
                    { day: '7', value: 15, label: '15k' },
                    { day: '8', value: 43, label: '43k' },
                    { day: '9', value: 67, label: '67k' },
                    { day: '10', value: 55, label: '55k' },
                    { day: '11', value: 41, label: '41k' },
                    { day: '12', value: 33, label: '33k' },
                    { day: '13', value: 72, label: '72k' },
                    { day: '14', value: 85, label: '85k' },
                    { day: '15', value: 91, label: '91k' },
                  ].map((data, index) => (
                    <motion.div
                      key={data.day}
                      initial={{ height: 0 }}
                      animate={{ height: `${data.value}%` }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      style={{
                        flex: 1,
                        background: index === 14 
                          ? 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)'
                          : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        cursor: 'pointer',
                        minWidth: '20px'
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                      title={`${data.day} janvier: ${data.label} tokens`}
                    >
                      {/* Tooltip au survol */}
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1e293b',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s'
                      }}
                      >
                        {data.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Axe X */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50px',
                  right: '20px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                </div>
              </div>

              {/* Légende */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                gap: '24px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '2px'
                  }} />
                  <span style={{ color: '#64748b' }}>Jours précédents</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                    borderRadius: '2px'
                  }} />
                  <span style={{ color: '#64748b' }}>Aujourd'hui</span>
                </div>
              </div>
            </motion.div>

            {/* Statistiques détaillées */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px'
              }}
            >
              {/* Pic d'utilisation */}
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 16px 0'
                }}>
                  🔥 Pic d'Utilisation
                </h4>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#e2001a',
                  margin: '0 0 8px 0'
                }}>
                  14h30 - 16h00
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0'
                }}>
                  Moyenne de 125k tokens/heure
                </p>
              </div>

              {/* Économie du mois */}
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 16px 0'
                }}>
                  💡 Optimisation IA
                </h4>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#10b981',
                  margin: '0 0 8px 0'
                }}>
                  -€89.45
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0'
                }}>
                  Économisé grâce au cache
                </p>
              </div>

              {/* Temps de réponse moyen */}
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 16px 0'
                }}>
                  ⚡ Temps de Réponse
                </h4>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#3b82f6',
                  margin: '0 0 8px 0'
                }}>
                  1.2s
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0'
                }}>
                  Moyenne des 7 derniers jours
                </p>
              </div>
            </motion.div>
          </>
        )}

        {/* Section Configuration */}
        {activeSection === 'config' && (
          <>
            {/* Configuration Message de Bienvenue */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '32px'
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                💬 Messages et Textes
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px'
              }}>
                {/* Message de Bienvenue */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748b',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Message de Bienvenue
                  </label>
                  <textarea
                    style={{
                      width: '100%',
                      height: '120px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    defaultValue="👋 Bienvenue ! Je suis votre assistant virtuel pour répondre à vos questions administratives. 🚨 Veuillez ne pas transmettre d'informations personnelles. 🔔 Studybot peut faire des erreurs. Envisagez de vérifier les informations importantes. Comment puis-je vous aider aujourd'hui ?"
                    onFocus={(e) => e.target.style.borderColor = '#e2001a'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    placeholder="Entrez votre message de bienvenue..."
                  />
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      Délai d'affichage : 2 secondes
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      💾 Sauvegarder
                    </motion.button>
                  </div>
                </div>

                {/* Message Footer Widget */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748b',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Message Footer Widget
                  </label>
                  
                  {/* Texte affiché */}
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      outline: 'none',
                      marginBottom: '12px',
                      transition: 'border-color 0.3s ease'
                    }}
                    defaultValue="Powered by emlyon business school"
                    onFocus={(e) => e.target.style.borderColor = '#e2001a'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    placeholder="Texte affiché dans le footer"
                  />

                  {/* Lien (optionnel) */}
                  <input
                    type="url"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      outline: 'none',
                      marginBottom: '12px',
                      transition: 'border-color 0.3s ease'
                    }}
                    defaultValue="https://emlyon.com"
                    onFocus={(e) => e.target.style.borderColor = '#e2001a'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    placeholder="Lien de redirection (optionnel)"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    💾 Mettre à jour
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Configuration Logos */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '32px'
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                🎨 Logos et Avatars
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {/* Logo Bot */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px 0'
                  }}>
                    Logo Bot
                  </h4>
                  
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'white',
                    borderRadius: '50%',
                    border: '2px dashed #e2e8f0',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#e2001a'
                  }}>
                    🤖
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📁 Choisir un fichier
                  </motion.button>
                </div>

                {/* Logo User */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px 0'
                  }}>
                    Logo User
                  </h4>
                  
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'white',
                    borderRadius: '50%',
                    border: '2px dashed #e2e8f0',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#e2001a'
                  }}>
                    👤
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📁 Choisir un fichier
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Génération de liens et intégrations - EN BAS */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                🔗 Génération de Liens et Intégrations
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px'
              }}>
                {/* Lien Direct */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🌐 Lien Direct
                    <span style={{
                      fontSize: '12px',
                      background: '#e2001a',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      UNIQUE
                    </span>
                  </h4>
                  
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#1e293b',
                    wordBreak: 'break-all'
                  }}>
                    https://studybot.emlyon.com/chat?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #e2001a 0%, #b50015 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText('https://studybot.emlyon.com/chat?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
                        // Ici on pourrait ajouter une notification de succès
                      }}
                    >
                      📋 Copier le Lien
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Regénérer
                    </motion.button>
                  </div>
                </div>

                {/* Code Iframe */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🖼️ Code Iframe
                    <span style={{
                      fontSize: '12px',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      SIMPLE
                    </span>
                  </h4>
                  
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#1e293b',
                    lineHeight: '1.5'
                  }}>
                    {`<iframe
  src="https://studybot.emlyon.com/embed"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone">
</iframe>`}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="https://studybot.emlyon.com/embed" width="100%" height="600" frameborder="0" allow="microphone"></iframe>`);
                    }}
                  >
                    📋 Copier le Code Iframe
                  </motion.button>
                </div>

                {/* Code Embed Complet */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  gridColumn: '1 / -1' // Prend toute la largeur
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ⚡ Code Embed Complet
                    <span style={{
                      fontSize: '12px',
                      background: '#059669',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      AVANCÉ
                    </span>
                  </h4>
                  
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#1e293b',
                    lineHeight: '1.5',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {`<!-- StudyBot emlyon - Code d'intégration complet -->
<div id="studybot-container"></div>
<script>
(function() {
  // Configuration StudyBot
  window.StudyBotConfig = {
    apiUrl: 'https://studybot.emlyon.com',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    theme: {
      primaryColor: '#e2001a',
      position: 'bottom-right',
      language: 'fr'
    },
    welcome: {
      message: 'Bonjour ! Je suis StudyBot, votre assistant emlyon. Comment puis-je vous aider ?',
      delay: 2000
    }
  };

  // Chargement du widget
  var script = document.createElement('script');
  script.src = 'https://studybot.emlyon.com/widget.js';
  script.async = true;
  document.head.appendChild(script);
})();
</script>
<!-- Fin StudyBot -->`}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const embedCode = `<!-- StudyBot emlyon - Code d'intégration complet -->
<div id="studybot-container"></div>
<script>
(function() {
  window.StudyBotConfig = {
    apiUrl: 'https://studybot.emlyon.com',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    theme: { primaryColor: '#e2001a', position: 'bottom-right', language: 'fr' },
    welcome: { message: 'Bonjour ! Je suis StudyBot, votre assistant emlyon.', delay: 2000 }
  };
  var script = document.createElement('script');
  script.src = 'https://studybot.emlyon.com/widget.js';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
                        navigator.clipboard.writeText(embedCode);
                      }}
                    >
                      📋 Copier le Code Embed
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ⚙️ Personnaliser
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Instructions d'utilisation */}
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px',
                border: '1px solid #f59e0b'
              }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💡 Instructions pour les Services Externes
                </h5>
                <div style={{
                  fontSize: '14px',
                  color: '#78350f',
                  lineHeight: '1.6'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Lien Direct :</strong> À partager aux équipes pour accès direct au chatbot
                  </p>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Code Iframe :</strong> Pour intégration simple dans une page web existante
                  </p>
                  <p style={{ margin: '0' }}>
                    <strong>Code Embed :</strong> Pour intégration complète avec widget flottant personnalisable
                  </p>
                </div>
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

        {/* Section Utilisateurs */}
        {activeSection === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(226,232,240,0.2)',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(15,23,42,0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  👥 Gestion des Utilisateurs
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  margin: 0,
                  fontSize: '14px'
                }}>
                  Gérez les accès administrateur et les permissions des utilisateurs
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddUserModal(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #e2001a 0%, #b71c1c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(226,0,26,0.3)'
                }}
              >
                <span>➕</span>
                Ajouter un admin
              </motion.button>
            </div>

            {/* Statistiques des utilisateurs */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginBottom: '32px'
            }}>
              {[
                { title: 'Admins Actifs', value: '3', icon: '👤', color: '#0ea5e9' },
                { title: 'Admins en Attente', value: '1', icon: '⏳', color: '#f59e0b' },
                { title: 'Permissions Spéciales', value: '2', icon: '🔐', color: '#8b5cf6' },
                { title: 'Connexions Aujourd\'hui', value: '5', icon: '🚪', color: '#10b981' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(226,232,240,0.3)',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {stat.title}
                      </p>
                      <h4 style={{ 
                        fontSize: '28px', 
                        fontWeight: '700', 
                        color: '#1e293b',
                        margin: 0
                      }}>
                        {stat.value}
                      </h4>
                    </div>
                    <div style={{
                      fontSize: '24px',
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Liste des administrateurs */}
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(226,232,240,0.3)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(226,232,240,0.2)',
                background: 'linear-gradient(90deg, rgba(226,0,26,0.05) 0%, rgba(226,0,26,0.02) 100%)'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📋</span>
                  Liste des Administrateurs
                </h4>
              </div>

              <div style={{ padding: '0' }}>
                {[
                  { 
                    id: '1',
                    name: 'Marie Dubois', 
                    email: 'marie.dubois@emlyon.com',
                    role: 'Super Admin',
                    status: 'active',
                    lastLogin: '2025-01-15 14:30',
                    permissions: ['all']
                  },
                  { 
                    id: '2',
                    name: 'Pierre Martin', 
                    email: 'pierre.martin@emlyon.com',
                    role: 'Admin',
                    status: 'active',
                    lastLogin: '2025-01-15 09:15',
                    permissions: ['conversations', 'analytics']
                  },
                  { 
                    id: '3',
                    name: 'Sophie Laurent', 
                    email: 'sophie.laurent@emlyon.com',
                    role: 'Admin',
                    status: 'active',
                    lastLogin: '2025-01-14 16:45',
                    permissions: ['conversations', 'configuration']
                  },
                  { 
                    id: '4',
                    name: 'Thomas Leclerc', 
                    email: 'thomas.leclerc@emlyon.com',
                    role: 'Admin',
                    status: 'pending',
                    lastLogin: 'Jamais connecté',
                    permissions: ['conversations']
                  }
                ].map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '20px 24px',
                      borderBottom: index < 3 ? '1px solid rgba(226,232,240,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e2001a 0%, #b71c1c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '600'
                      }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h5 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          margin: '0 0 4px 0'
                        }}>
                          {user.name}
                        </h5>
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#64748b',
                          margin: '0 0 4px 0'
                        }}>
                          {user.email}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            background: user.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)',
                            color: user.status === 'active' ? '#059669' : '#d97706',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {user.status === 'active' ? '🟢 Actif' : '🟡 En attente'}
                          </span>
                          <span style={{
                            background: 'rgba(59,130,246,0.1)',
                            color: '#2563eb',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right', minWidth: '120px' }}>
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#64748b',
                          margin: '0 0 4px 0'
                        }}>
                          Dernière connexion
                        </p>
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#1e293b',
                          fontWeight: '500',
                          margin: 0
                        }}>
                          {user.lastLogin}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPermissionsModal(true);
                        }}
                        style={{
                          padding: '8px',
                          background: 'rgba(59,130,246,0.1)',
                          color: '#2563eb',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        title="Modifier les permissions"
                      >
                        ⚙️
                      </motion.button>
                      
                      {user.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '8px',
                            background: 'rgba(34,197,94,0.1)',
                            color: '#059669',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          title="Activer le compte"
                        >
                          ✅
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '8px',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        title="Supprimer l'utilisateur"
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal d'ajout d'utilisateur */}
        {showAddUserModal && (
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
              background: 'rgba(15,23,42,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowAddUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 25px 50px rgba(15,23,42,0.25)'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  ➕ Ajouter un Administrateur
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  margin: 0,
                  fontSize: '14px'
                }}>
                  Invitez un nouvel utilisateur à rejoindre l'équipe administrative
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Nom complet
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Marie Dubois"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      background: 'rgba(249,250,251,0.5)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Adresse email
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: marie.dubois@emlyon.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      background: 'rgba(249,250,251,0.5)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Rôle
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'rgba(249,250,251,0.5)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                    <option value="moderator">Modérateur</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Permissions
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { id: 'conversations', label: 'Gestion des conversations', icon: '💬' },
                      { id: 'analytics', label: 'Accès aux analytics', icon: '📊' },
                      { id: 'configuration', label: 'Configuration système', icon: '⚙️' },
                      { id: 'users', label: 'Gestion des utilisateurs', icon: '👥' }
                    ].map(permission => (
                      <label key={permission.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'rgba(249,250,251,0.5)'
                      }}>
                        <input type="checkbox" defaultChecked={permission.id === 'conversations'} />
                        <span style={{ fontSize: '14px' }}>{permission.icon}</span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '32px',
                justifyContent: 'flex-end'
              }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddUserModal(false);
                    // Ici vous ajouteriez la logique pour envoyer l'invitation
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #e2001a 0%, #b71c1c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📧</span>
                  Envoyer l'invitation
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal de gestion des permissions */}
        {showPermissionsModal && selectedUser && (
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
              background: 'rgba(15,23,42,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowPermissionsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 25px 50px rgba(15,23,42,0.25)'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  ⚙️ Modifier les Permissions
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  margin: 0,
                  fontSize: '14px'
                }}>
                  Permissions pour {selectedUser.name}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { id: 'conversations', label: 'Gestion des conversations', icon: '💬', description: 'Voir et modérer les conversations' },
                  { id: 'analytics', label: 'Accès aux analytics', icon: '📊', description: 'Consulter les statistiques d\'usage' },
                  { id: 'configuration', label: 'Configuration système', icon: '⚙️', description: 'Modifier les paramètres du bot' },
                  { id: 'users', label: 'Gestion des utilisateurs', icon: '👥', description: 'Ajouter/supprimer des administrateurs' }
                ].map(permission => (
                  <div key={permission.id} style={{ 
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    background: 'rgba(249,250,251,0.5)'
                  }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedUser.permissions.includes(permission.id) || selectedUser.permissions.includes('all')}
                        style={{ marginTop: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px' }}>{permission.icon}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{permission.label}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{permission.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '32px',
                justifyContent: 'flex-end'
              }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPermissionsModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #e2001a 0%, #b71c1c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>💾</span>
                  Enregistrer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 