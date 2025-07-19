import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import StudyBotAPI, { type ChatRequest } from './services/api';
import TypewriterText from './components/TypewriterText';
import AdminDashboard from './components/admin/AdminDashboard';
import { useSession } from './hooks/useSession';

// 🎯 Assets emlyon officiels (depuis flowise-design-reference.js)
const EMLYON_ASSETS = {
  botAvatar: "https://aksflowisestorageprod.blob.core.windows.net/images/chatbot3avatr.png",
  userAvatar: "https://aksflowisestorageprod.blob.core.windows.net/images/eleves2.png",
  buttonIcon: "https://aksflowisestorageprod.blob.core.windows.net/images/bulle_message2.svg",
  titleAvatar: "https://aksflowisestorageprod.blob.core.windows.net/images/chatbot3avatr.png"
};

// 💬 Types pour les messages
interface BaseMessage {
  id: number;
  content: string;
}

interface UserMessage extends BaseMessage {
  type: 'user';
}

interface BotMessage extends BaseMessage {
  type: 'bot';
  feedback: { type: 'positive' | 'negative', comment?: string } | null;
}

type Message = UserMessage | BotMessage;

// 🎭 Animations Framer Motion
const chatWindowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10
  }
};

const messageVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
};

const buttonVariants = {
  idle: {
    scale: 1,
    rotate: 0
  },
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0]
  },
  tap: {
    scale: 0.95
  },
  dragging: {
    scale: 1.2,
    rotate: 10
  }
};

// 💭 Composant Typing Indicator animé
const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        backgroundColor: '#f7f8ff',
        color: '#303235',
        padding: '12px 16px',
        borderRadius: '16px 16px 16px 4px',
        fontSize: '16px',
        lineHeight: '1.5',
        maxWidth: '85%',
        alignSelf: 'flex-start',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px'
      }}
    >
      {/* Avatar bot */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#d4a94e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <img
          src={EMLYON_ASSETS.botAvatar}
          alt="Bot"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '🤖';
            e.currentTarget.parentElement!.style.color = 'white';
            e.currentTarget.parentElement!.style.fontSize = '16px';
            e.currentTarget.parentElement!.style.fontWeight = '600';
          }}
        />
      </div>
      
      {/* Dots animés */}
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        <span style={{ color: '#666', marginRight: '8px' }}>Studybot tape</span>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#d4a94e',
              borderRadius: '50%'
            }}
            animate={{
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// 🔊 Système de sons de notification
const useSounds = () => {
  const playSound = useCallback((frequency: number, duration: number = 200, type: 'sine' | 'square' = 'sine') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  const playSendSound = useCallback(() => {
    // Son d'envoi - Do aigu (523 Hz)
    playSound(523, 150, 'sine');
  }, [playSound]);

  const playReceiveSound = useCallback(() => {
    // Son de réception - Sol (392 Hz) suivi de Do (262 Hz)
    playSound(392, 100, 'sine');
    setTimeout(() => playSound(262, 150, 'sine'), 100);
  }, [playSound]);

  const playNotificationSound = useCallback(() => {
    // Son de notification - Mi (330 Hz)
    playSound(330, 120, 'sine');
  }, [playSound]);

  return { playSendSound, playReceiveSound, playNotificationSound };
};

// 🎨 StudyBot Widget Demo - emlyon business school
const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [typewritingMessageId, setTypewritingMessageId] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const { playSendSound, playReceiveSound, playNotificationSound } = useSounds();
  
  // 🧠 Hook de gestion de session persistante
  const { sessionId, isNewSession, updateSessionActivity, resetSession } = useSession();
  
  // 📜 Référence pour l'auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: '👋 Bienvenue ! Je suis votre assistant virtuel pour répondre à vos questions administratives. 🚨 Veuillez ne pas transmettre d\'informations personnelles. 🔔 Studybot peut faire des erreurs. Envisagez de vérifier les informations importantes. Comment puis-je vous aider aujourd\'hui ?',
      feedback: null
    }
  ]);

  // 🔄 Réinitialiser les messages si nouvelle session
  useEffect(() => {
    if (isNewSession && sessionId) {
      console.log('🆕 Nouvelle session détectée, réinitialisation des messages');
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: '👋 Bienvenue ! Je suis votre assistant virtuel pour répondre à vos questions administratives. 🚨 Veuillez ne pas transmettre d\'informations personnelles. 🔔 Studybot peut faire des erreurs. Envisagez de vérifier les informations importantes. Comment puis-je vous aider aujourd\'hui ?',
          feedback: null
        }
      ]);
    }
  }, [isNewSession, sessionId]);

  // 📜 Auto-scroll vers le bas quand messages changent
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
      
      // Double appel pour s'assurer du scroll même avec du contenu dynamique
      if (smooth) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
          });
        }, 100);
      }
    }
  }, []);

  // 📜 Effect pour auto-scroll sur nouveaux messages
  useEffect(() => {
    if (isOpen) {
      // Délai réduit pour un scroll plus réactif
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages, showTyping, isOpen, scrollToBottom]);

  // 📜 Scroll immédiat à l'ouverture du chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom(false); // Scroll immédiat sans animation
      }, 300); // Après l'animation d'ouverture
    }
  }, [isOpen, scrollToBottom]);
  
  // 🖱️ États pour le drag & drop
  const [buttonPosition, setButtonPosition] = useState(() => {
    // Récupérer position sauvegardée ou position par défaut
    const saved = localStorage.getItem('studybot-button-position');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: window.innerWidth - 68, y: window.innerHeight - 68 };
      }
    }
    return { x: window.innerWidth - 68, y: window.innerHeight - 68 };
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // 🖱️ Contraindre position dans les limites de l'écran
  const constrainPosition = useCallback((pos: { x: number; y: number }) => {
    const buttonSize = 48;
    const margin = 20;
    
    return {
      x: Math.max(margin, Math.min(window.innerWidth - buttonSize - margin, pos.x)),
      y: Math.max(margin, Math.min(window.innerHeight - buttonSize - margin, pos.y))
    };
  }, []);

  // 🖱️ Sauvegarder position dans localStorage
  const savePosition = useCallback((position: { x: number; y: number }) => {
    try {
      localStorage.setItem('studybot-button-position', JSON.stringify(position));
    } catch {
      console.log('Could not save button position');
    }
  }, []);

  // 🖱️ Gestionnaire début drag (souris)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Seulement clic gauche
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setShowTooltip(false);
    hasDragged.current = false;
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = buttonPosition;
  }, [buttonPosition]);

  // 🖱️ Gestionnaire début drag (tactile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    setIsDragging(true);
    setShowTooltip(false);
    hasDragged.current = false;
    
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    elementStartPos.current = buttonPosition;
  }, [buttonPosition]);

  // 🖱️ Gestionnaire mouvement global
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      // Marquer comme drag si mouvement > 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDragged.current = true;
      }
      
      const newPosition = constrainPosition({
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY
      });
      
      setButtonPosition(newPosition);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartPos.current.x;
      const deltaY = touch.clientY - dragStartPos.current.y;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDragged.current = true;
      }
      
      const newPosition = constrainPosition({
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY
      });
      
      setButtonPosition(newPosition);
    };

    const handleEnd = () => {
      setIsDragging(false);
      
      if (hasDragged.current) {
        savePosition(buttonPosition);
      }
    };

    // Ajouter listeners globaux
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, buttonPosition, constrainPosition, savePosition]);

  // 🖱️ Ajuster position lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (!isDragging) {
        setButtonPosition((current: { x: number; y: number }) => constrainPosition(current));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging, constrainPosition]);

  // 💬 Gestionnaire clic bouton (seulement si pas de drag)
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ne pas ouvrir si on vient de faire un drag
    if (hasDragged.current) {
      return;
    }
    
    setIsOpen(!isOpen);
    setShowTooltip(false);
    
    // Son d'ouverture/fermeture
    if (!isOpen) {
      playNotificationSound();
      // Ne plus afficher l'indicateur typing automatiquement à l'ouverture
    }
  };

  // 📤 Fonction d'envoi de message avec API
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: UserMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim()
    };

    // Ajouter message utilisateur
    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue.trim();
    setInputValue('');
    
    // Son d'envoi
    playSendSound();
    
    // Afficher typing indicator immédiatement
    setShowTyping(true);

    // Protection : désactiver automatiquement après 30 secondes
    const typingTimeout = setTimeout(() => {
      setShowTyping(false);
    }, 30000);

    try {
      // Préparer la requête API avec session persistante
      const chatRequest: ChatRequest = {
        message: messageText,
        chatbot: 'studybot', // ou 'bibliobot' selon le contexte
        sessionId: sessionId || undefined // Utiliser la session persistante
      };

      // Mettre à jour l'activité de session
      updateSessionActivity();

      // Choisir l'endpoint selon le mode configuré
      const chatMode = import.meta.env.VITE_CHAT_MODE || 'mock';
      
      const apiResponse = chatMode === 'production' 
        ? await StudyBotAPI.sendMessage(chatRequest)
        : await StudyBotAPI.sendMessageMock(chatRequest);

      // Désactiver l'indicateur typing AVANT de traiter la réponse
      clearTimeout(typingTimeout);
      setShowTyping(false);
      
      // Créer le message bot avec la réponse API
      const botMessage: BotMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: apiResponse.response,
        feedback: null
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Déclencher l'effet typewriter pour ce message
      setTypewritingMessageId(botMessage.id);
      
      // Son de réception
      playReceiveSound();

      // Logger les métadonnées pour le debug
      if (import.meta.env.VITE_DEBUG_API === 'true') {
        console.log('📊 Chat Response:', {
          sessionId: apiResponse.sessionId,
          messageId: apiResponse.messageId,
          tokensUsed: apiResponse.tokensUsed,
          model: apiResponse.model,
          responseTime: apiResponse.responseTime,
          sources: apiResponse.sources
        });
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      
      // Toujours désactiver l'indicateur typing en cas d'erreur
      clearTimeout(typingTimeout);
      setShowTyping(false);
      
      // Message d'erreur pour l'utilisateur
      const errorMessage: BotMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `🚨 Désolé, je rencontre un problème technique. ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez réessayer dans quelques instants.`,
        feedback: null
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Déclencher l'effet typewriter pour le message d'erreur aussi
      setTypewritingMessageId(errorMessage.id);
      
      // Son d'erreur (plus grave) - utiliser playNotificationSound disponible
      playNotificationSound();
    }
  }, [inputValue, playSendSound, playReceiveSound, playNotificationSound]);

  // ⌨️ Gestionnaire touche Entrée
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 👍👎 Gestion du feedback
  const handleFeedback = useCallback((messageId: number, type: 'positive' | 'negative') => {
    setFeedbackMessageId(messageId);
    setFeedbackType(type);
    setShowFeedbackModal(true);
    playNotificationSound();
  }, [playNotificationSound]);

  // 💬 Envoyer feedback avec commentaire
  const submitFeedback = useCallback(() => {
    if (feedbackMessageId === null || feedbackType === null) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === feedbackMessageId && msg.type === 'bot') {
        return {
          ...msg,
          feedback: {
            type: feedbackType,
            comment: feedbackComment.trim() || undefined
          }
        };
      }
      return msg;
    }));

    // Sauvegarder dans localStorage pour le futur dashboard
    const feedbackData = {
      messageId: feedbackMessageId,
      type: feedbackType,
      comment: feedbackComment.trim(),
      timestamp: new Date().toISOString(),
      message: messages.find(m => m.id === feedbackMessageId)?.content
    };

    const existingFeedbacks = JSON.parse(localStorage.getItem('studybot-feedbacks') || '[]');
    existingFeedbacks.push(feedbackData);
    localStorage.setItem('studybot-feedbacks', JSON.stringify(existingFeedbacks));

    // Reset modal
    setShowFeedbackModal(false);
    setFeedbackMessageId(null);
    setFeedbackType(null);
    setFeedbackComment('');
    
    playSendSound();
  }, [feedbackMessageId, feedbackType, feedbackComment, messages, playSendSound]);

  // ❌ Annuler feedback
  const cancelFeedback = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedbackMessageId(null);
    setFeedbackType(null);
    setFeedbackComment('');
  }, []);

  // 💭 Gestion tooltip automatique
  useEffect(() => {
    if (isOpen || isDragging) {
      setShowTooltip(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpen, isDragging]);

  // Masquer tooltip après 5 secondes
  useEffect(() => {
    if (!showTooltip) return;

    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showTooltip]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Dashboard Admin en arrière-plan */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1
      }}>
        <AdminDashboard />
      </div>

      {/* Widget StudyBot - Phase 2 avec Framer Motion */}
      <div style={{
        position: 'fixed',
        left: `${buttonPosition.x}px`,
        top: `${buttonPosition.y}px`,
        zIndex: 999999
      }}>
        {/* Bouton widget emlyon avec animations Framer Motion */}
                 <motion.button
           variants={buttonVariants}
           initial="idle"
           animate={isDragging ? "dragging" : "idle"}
           whileHover={!isDragging ? "hover" : undefined}
           whileTap="tap"
           transition={{
             scale: { duration: 0.2 },
             rotate: { duration: 0.4, ease: "easeInOut" }
           }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleButtonClick}
          style={{
            width: '48px',
            height: '48px',
            background: 'none',
            border: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            userSelect: 'none',
            touchAction: 'none'
          }}
          onMouseEnter={() => {
            if (!isDragging && !isOpen) {
              setShowTooltip(true);
            }
          }}
          onMouseLeave={() => {
            if (!isDragging) {
              setShowTooltip(false);
            }
          }}
          title="Hi There 👋! (Framer Motion enabled)"
        >
          {/* Logo emlyon complet (déjà une bulle) */}
          {isOpen ? (
            <div style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              maxWidth: '40px',
              maxHeight: '40px',
              background: 'linear-gradient(135deg, #d4a94e 0%, #e6b85c 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              boxSizing: 'border-box',
              flexShrink: 0
            }}>
              ✕
            </div>
          ) : (
            <img
              src={EMLYON_ASSETS.buttonIcon}
              alt="Chat"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                pointerEvents: 'none',
                borderRadius: '50%'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = isDragging ? '🖱️' : '💬';
              }}
            />
          )}
        </motion.button>

        {/* Tooltip animé avec positionnement intelligent */}
        <AnimatePresence>
          {!isOpen && showTooltip && !isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
              style={{
                position: 'absolute',
                // 🧭 Positionnement intelligent selon la position du bouton
                ...(buttonPosition.y < 100 ? {
                  // Si bouton en haut → tooltip en bas
                  top: '120%',
                  bottom: 'auto'
                } : {
                  // Si bouton en bas → tooltip en haut
                  bottom: '120%',
                  top: 'auto'
                }),
                ...(buttonPosition.x > window.innerWidth - 200 ? {
                  // Si bouton à droite → tooltip à gauche
                  right: '0',
                  left: 'auto',
                  transform: 'translateX(0)'
                } : buttonPosition.x < 200 ? {
                  // Si bouton à gauche → tooltip à droite
                  left: '0',
                  right: 'auto',
                  transform: 'translateX(0)'
                } : {
                  // Si bouton au centre → tooltip centré
                  left: '50%',
                  right: 'auto',
                  transform: 'translateX(-50%)'
                }),
                backgroundColor: '#d4a94e',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                pointerEvents: 'none',
                zIndex: '999999',
                maxWidth: '200px' // Limite la largeur pour éviter les débordements
              }}
            >
              Hi There 👋!
              {/* Flèche pointant vers le bouton - position adaptative */}
              <div style={{
                position: 'absolute',
                // 🔽 Flèche en bas si tooltip en haut du bouton
                ...(buttonPosition.y >= 100 ? {
                  top: '100%',
                  bottom: 'auto',
                  borderTop: '6px solid #d4a94e',
                  borderBottom: 'none'
                } : {
                  // 🔼 Flèche en haut si tooltip en bas du bouton
                  bottom: '100%',
                  top: 'auto',
                  borderBottom: '6px solid #d4a94e',
                  borderTop: 'none'
                }),
                // ◀️▶️ Position horizontale de la flèche
                ...(buttonPosition.x > window.innerWidth - 200 ? {
                  // Flèche à droite si tooltip à gauche
                  right: '12px',
                  left: 'auto'
                } : buttonPosition.x < 200 ? {
                  // Flèche à gauche si tooltip à droite
                  left: '12px',
                  right: 'auto'
                } : {
                  // Flèche centrée si tooltip centré
                  left: '50%',
                  right: 'auto',
                  transform: 'translateX(-50%)'
                }),
                border: '6px solid transparent'
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fenêtre de chat avec animations Framer Motion */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={chatWindowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              style={{
                position: 'absolute',
                bottom: buttonPosition.y > window.innerHeight / 2 ? '54px' : 'auto',
                top: buttonPosition.y <= window.innerHeight / 2 ? '54px' : 'auto',
                right: buttonPosition.x > window.innerWidth / 2 ? '0' : 'auto',
                left: buttonPosition.x <= window.innerWidth / 2 ? '0' : 'auto',
                width: window.innerWidth <= 700 ? '100vw' : '400px',
                height: window.innerWidth <= 700 ? '85vh' : '700px',
                backgroundColor: 'white',
                borderRadius: window.innerWidth <= 700 ? '0' : '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid #e1e5e9',
                ...(window.innerWidth <= 700 ? {
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999999
                } : {})
              }}
            >
              {/* En-tête emlyon avec animation */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, #d4a94e 0%, #e6b85c 100%)',
                  color: 'white',
                  padding: '16px 20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url("data:image/svg+xml,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='smallGrid' width='8' height='8' patternUnits='userSpaceOnUse'><path d='M 8 0 L 0 0 0 8' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/></pattern></defs><rect width='100%' height='100%' fill='url(%23smallGrid)' /></svg>")`,
                  opacity: 0.3,
                  pointerEvents: 'none'
                }} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Avatar officiel emlyon dans le titre */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={EMLYON_ASSETS.titleAvatar}
                      alt="Studybot"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '🤖';
                      }}
                    />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    Studybot
                  </motion.span>
                </div>
                
                {/* Boutons header */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Bouton Reset conversation - style discret comme la croix */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: -90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newSessionId = resetSession();
                      // Réinitialiser les messages avec le message de bienvenue
                      setMessages([
                        {
                          id: 1,
                          type: 'bot',
                          content: '👋 Bienvenue ! Je suis votre assistant virtuel pour répondre à vos questions administratives. 🚨 Veuillez ne pas transmettre d\'informations personnelles. 🔔 Studybot peut faire des erreurs. Envisagez de vérifier les informations importantes. Comment puis-je vous aider aujourd\'hui ?',
                          feedback: null
                        }
                      ]);
                      setInputValue('');
                      setShowTyping(false);
                      setTypewritingMessageId(null);
                      playNotificationSound();
                      console.log('🔄 Conversation réinitialisée avec session:', newSessionId);
                    }}
                    title="Réinitialiser la conversation"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    ↻
                  </motion.button>

                  {/* Bouton Fermer */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  ×
                </motion.button>
                </div>
              </motion.div>

              {/* Corps du chat avec auto-scroll */}
              <div 
                ref={chatContainerRef}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  overflowY: 'auto',
                  scrollBehavior: 'smooth'
                }}
              >
                {/* Messages animés avec feedback */}
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ 
                      delay: 0.2 + index * 0.1,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    style={{
                      backgroundColor: message.type === 'bot' ? '#f7f8ff' : '#d4a94e',
                      color: message.type === 'bot' ? '#303235' : '#ffffff',
                      padding: '12px 16px',
                      borderRadius: message.type === 'bot' ? '16px 16px 16px 4px' : '16px 4px 16px 16px',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      maxWidth: '85%',
                      alignSelf: message.type === 'bot' ? 'flex-start' : 'flex-end',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Contenu principal du message */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      {message.type === 'bot' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#d4a94e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={EMLYON_ASSETS.botAvatar}
                            alt="Bot"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '🤖';
                              e.currentTarget.parentElement!.style.color = 'white';
                              e.currentTarget.parentElement!.style.fontSize = '16px';
                              e.currentTarget.parentElement!.style.fontWeight = '600';
                            }}
                          />
                        </div>
                      )}
                      
                      <div style={{ 
                        flex: 1,
                        whiteSpace: 'pre-line', // Préserver les retours à la ligne
                        textAlign: 'left' // Alignement à gauche pour une lecture normale
                      }}>
                        {message.type === 'bot' && message.id === typewritingMessageId ? (
                          <TypewriterText 
                            text={message.content} 
                            speed={6}
                            onComplete={() => setTypewritingMessageId(null)}
                          />
                        ) : (
                          message.content
                        )}
                      </div>
                      
                      {message.type === 'user' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={EMLYON_ASSETS.userAvatar}
                            alt="User"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '👤';
                              e.currentTarget.parentElement!.style.color = '#d4a94e';
                              e.currentTarget.parentElement!.style.fontSize = '16px';
                              e.currentTarget.parentElement!.style.fontWeight = '600';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Boutons de feedback pour les messages bot (sauf bienvenue) */}
                    {message.type === 'bot' && message.id !== 1 && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        paddingLeft: '44px', // Aligner avec le texte
                        marginTop: '4px'
                      }}>
                        {message.feedback === null ? (
                          <>
                            {/* Boutons thumbs up/down */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleFeedback(message.id, 'positive')}
                              style={{
                                background: 'none',
                                border: '1px solid #d4a94e',
                                borderRadius: '20px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                color: '#d4a94e',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#d4a94e';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#d4a94e';
                              }}
                            >
                              👍 Utile
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleFeedback(message.id, 'negative')}
                              style={{
                                background: 'none',
                                border: '1px solid #999',
                                borderRadius: '20px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                color: '#999',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#999';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#999';
                              }}
                            >
                              👎 Pas utile
                            </motion.button>
                          </>
                        ) : (
                          // Affichage du feedback donné
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            color: '#666',
                            fontStyle: 'italic'
                          }}>
                            <span>
                              {message.feedback.type === 'positive' ? '👍 Merci pour votre feedback !' : '👎 Merci, nous allons améliorer cette réponse'}
                            </span>
                            {message.feedback.comment && (
                              <span style={{
                                background: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '11px'
                              }}>
                                💬 Commentaire envoyé
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator animé */}
                <AnimatePresence>
                  {showTyping && <TypingIndicator />}
                </AnimatePresence>

                {/* 📜 Élément invisible pour l'auto-scroll */}
                <div 
                  ref={messagesEndRef} 
                  style={{ 
                    height: '1px',
                    width: '100%'
                  }} 
                />
              </div>

              {/* Zone de saisie avec animation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'white',
                  borderTop: '1px solid #e1e5e9',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end'
                }}
              >
                <textarea
                  placeholder="Type your question"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    color: '#303235',
                    border: '1px solid #e1e5e9',
                    borderRadius: '24px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    lineHeight: '1.4',
                    resize: 'none',
                    maxHeight: '120px',
                    minHeight: '24px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#d4a94e';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e1e5e9';
                  }}
                  onKeyDown={handleKeyDown}
                  maxLength={1000}
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!inputValue.trim()}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: inputValue.trim() ? '#d4a94e' : '#cccccc',
                    border: 'none',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: inputValue.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background-color 0.2s'
                  }}
                  onClick={handleSendMessage}
                >
                  ➤
                </motion.button>
              </motion.div>

              {/* Footer emlyon */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                style={{
                  padding: '12px 20px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#303235',
                  borderTop: '1px solid #e1e5e9',
                  backgroundColor: '#f8f9fa'
                }}
              >
                Powered by{' '}
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href="https://em-lyon.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#d4a94e',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  emlyon business school
                </motion.a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay mobile animé */}
        <AnimatePresence>
          {isOpen && window.innerWidth <= 700 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 999997
              }}
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* 💬 Modal de feedback avec commentaire */}
        <AnimatePresence>
          {showFeedbackModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={cancelFeedback}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                transition={{ duration: 0.3, type: "spring" }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  maxWidth: '400px',
                  width: '100%',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  border: '1px solid #e1e5e9'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* En-tête du modal */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #e1e5e9'
                }}>
                  <div style={{
                    fontSize: '24px'
                  }}>
                    {feedbackType === 'positive' ? '👍' : '👎'}
                  </div>
                  <div>
                    <h3 style={{
                      margin: '0',
                      color: '#303235',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {feedbackType === 'positive' ? 'Merci pour ce retour positif !' : 'Aidez-nous à nous améliorer'}
                    </h3>
                    <p style={{
                      margin: '4px 0 0 0',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      {feedbackType === 'positive' 
                        ? 'Souhaitez-vous ajouter un commentaire sur ce qui vous a plu ?'
                        : 'Pouvez-vous nous dire ce qui n\'a pas fonctionné ?'
                      }
                    </p>
                  </div>
                </div>

                {/* Zone de commentaire */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#303235',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    Commentaire {feedbackType === 'positive' ? '(optionnel)' : '(recommandé)'}
                  </label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder={feedbackType === 'positive' 
                      ? 'Dites-nous ce qui vous a aidé...'
                      : 'Expliquez-nous le problème rencontré...'
                    }
                    style={{
                      width: '100%',
                      height: '80px',
                      padding: '12px',
                      border: '1px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#d4a94e';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e1e5e9';
                    }}
                    maxLength={500}
                  />
                  <div style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    {feedbackComment.length}/500
                  </div>
                </div>

                {/* Boutons d'action */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelFeedback}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #e1e5e9',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    Annuler
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitFeedback}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#d4a94e',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#c19940';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#d4a94e';
                    }}
                  >
                    {feedbackType === 'positive' ? 'Envoyer le feedback' : 'Envoyer et aider'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS pour les animations natives */}
      <style>{`
        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #d4a94e;
          border-radius: 3px;
          opacity: 0.7;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d4a94e;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default App;
