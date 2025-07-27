import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudyBotAPI, { type ChatRequest, type ChatResponse } from '../services/api';
import TypewriterText from './TypewriterText';
import { useSession } from '../hooks/useSession';
import { formatBotMessage, containsLinks } from '../utils/textUtils';

// 🎯 Assets emlyon officiels
const EMLYON_ASSETS = {
  botAvatar: "https://aksflowisestorageprod.blob.core.windows.net/images/chatbot3avatr.png",
  userAvatar: "https://aksflowisestorageprod.blob.core.windows.net/images/eleves2.png",
  buttonIcon: "https://aksflowisestorageprod.blob.core.windows.net/images/bulle_message2.svg",
  titleAvatar: "https://aksflowisestorageprod.blob.core.windows.net/images/chatbot3avatr.png"
};

// Types pour les messages
interface BaseMessage {
  id: string | number;
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

// Animations Framer Motion
const chatWindowVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 }
};

const buttonVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95, rotate: -5 },
  dragging: { scale: 1.2, rotate: 10 }
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface ChatWidgetProps {
  token?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ token, className, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [typewritingMessageId, setTypewritingMessageId] = useState<string | number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  
  // Hook de gestion de session
  const { sessionId, isNewSession, updateSessionActivity, resetSession } = useSession();
  
  // Références
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: '👋 Bienvenue ! Je suis votre assistant virtuel pour répondre à vos questions administratives. 🚨 Veuillez ne pas transmettre d\'informations personnelles. 🔔 Studybot peut faire des erreurs. Comment puis-je vous aider aujourd\'hui ?',
      feedback: null
    }
  ]);

  // Position du bouton (draggable) - Position fixe pour éviter les problèmes d'affichage
  const [buttonPosition, setButtonPosition] = useState(() => {
    // Position fixe en bas à droite, toujours visible
    return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [widgetSize, setWidgetSize] = useState({ width: 380, height: 600 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Gestion des messages selon le type de session
  useEffect(() => {
    if (!sessionId) return;

    const messagesKey = `studybot_messages_${sessionId}`;
    
    if (isNewSession) {
      const welcomeMessages = [
        {
          id: 1,
          type: 'bot' as const,
          content: '👋 Bienvenue ! Je suis votre assistant virtuel pour répondre à vos questions administratives. 🚨 Veuillez ne pas transmettre d\'informations personnelles. 🔔 Studybot peut faire des erreurs. Comment puis-je vous aider aujourd\'hui ?',
          feedback: null
        }
      ];
      setMessages(welcomeMessages);
      localStorage.setItem(messagesKey, JSON.stringify(welcomeMessages));
    } else {
      try {
        const savedMessages = localStorage.getItem(messagesKey);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
          console.log('📡 Messages restaurés pour session:', sessionId, '- Nb:', parsedMessages.length);
        }
      } catch (error) {
        console.error('❌ Erreur restauration messages:', error);
      }
    }
  }, [isNewSession, sessionId]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (isOpen && typewritingMessageId === null) {
      scrollToBottom();
    }
  }, [messages, isOpen, typewritingMessageId, scrollToBottom]);

  // Contraindre position dans l'écran
  const constrainPosition = useCallback((pos: { x: number; y: number }) => {
    const buttonSize = 48;
    const margin = 20;
    
    return {
      x: Math.max(margin, Math.min(window.innerWidth - buttonSize - margin, pos.x)),
      y: Math.max(margin, Math.min(window.innerHeight - buttonSize - margin, pos.y))
    };
  }, []);

  // Gestion du drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setShowTooltip(false);
    hasDragged.current = false;
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = buttonPosition;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDragged.current = true;
      }
      
      const newPosition = constrainPosition({
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY
      });
      
      setButtonPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (hasDragged.current) {
        localStorage.setItem('studybot-button-position', JSON.stringify(buttonPosition));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [buttonPosition, constrainPosition]);

  // 👍👎 Gestion du feedback
  const handleFeedback = useCallback((messageId: string | number, type: 'positive' | 'negative') => {
    setFeedbackMessageId(messageId);
    setFeedbackType(type);
    setShowFeedbackModal(true);
  }, []);

  // 💬 Envoyer feedback avec commentaire
  const submitFeedback = useCallback(async () => {
    if (feedbackMessageId === null || feedbackType === null || !sessionId) return;

    try {
      // Envoyer le feedback au serveur
      await StudyBotAPI.submitFeedback({
        sessionId,
        messageId: typeof feedbackMessageId === 'string' ? feedbackMessageId : feedbackMessageId.toString(),
        type: feedbackType,
        comment: feedbackComment.trim() || undefined
      });

      // Mettre à jour l'affichage local
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

      // Conserver aussi dans localStorage comme backup
      const feedbackData = {
        messageId: feedbackMessageId,
        type: feedbackType,
        comment: feedbackComment.trim(),
        timestamp: new Date().toISOString(),
        message: messages.find(m => m.id === feedbackMessageId)?.content,
        sessionId: sessionId,
        synced: true
      };

      const existingFeedbacks = JSON.parse(localStorage.getItem('studybot-feedbacks') || '[]');
      existingFeedbacks.push(feedbackData);
      localStorage.setItem('studybot-feedbacks', JSON.stringify(existingFeedbacks));

      console.log('✅ Feedback envoyé avec succès au serveur');
      
    } catch (error) {
      console.error('❌ Erreur envoi feedback:', error);
      
      // En cas d'erreur, sauvegarder quand même en localStorage
      const feedbackData = {
        messageId: feedbackMessageId,
        type: feedbackType,
        comment: feedbackComment.trim(),
        timestamp: new Date().toISOString(),
        message: messages.find(m => m.id === feedbackMessageId)?.content,
        sessionId: sessionId,
        synced: false
      };

      const existingFeedbacks = JSON.parse(localStorage.getItem('studybot-feedbacks') || '[]');
      existingFeedbacks.push(feedbackData);
      localStorage.setItem('studybot-feedbacks', JSON.stringify(existingFeedbacks));

      // Afficher quand même le feedback dans l'interface
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
    }

    // Reset modal
    setShowFeedbackModal(false);
    setFeedbackMessageId(null);
    setFeedbackType(null);
    setFeedbackComment('');
  }, [feedbackMessageId, feedbackType, feedbackComment, messages, sessionId]);

  // ❌ Annuler feedback
  const cancelFeedback = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedbackMessageId(null);
    setFeedbackType(null);
    setFeedbackComment('');
  }, []);

  // Envoi de message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !sessionId) return;

    const userMessage: UserMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowTyping(true);

    updateSessionActivity();

    try {
      const chatRequest: ChatRequest = {
        message: content.trim(),
        sessionId,
        chatbot: 'studybot'
      };

      const chatMode = import.meta.env.VITE_CHAT_MODE || 'mock';
      const apiResponse = chatMode === 'production'
        ? await StudyBotAPI.sendMessage(chatRequest)
        : await StudyBotAPI.sendMessageMock(chatRequest);

      if (apiResponse) {
        const serverId = apiResponse.messageId || `bot_${Date.now()}`;
        const botMessage: BotMessage = {
          id: serverId,
          type: 'bot',
          content: formatBotMessage(apiResponse.response),
          feedback: null
        };

        setMessages(prev => [...prev, botMessage]);
        setTypewritingMessageId(serverId);

        const messagesKey = `studybot_messages_${sessionId}`;
        const newMessages = [...messages, userMessage, botMessage];
        localStorage.setItem(messagesKey, JSON.stringify(newMessages));
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      const errorMessage: BotMessage = {
        id: `error_${Date.now()}`,
        type: 'bot',
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer.',
        feedback: null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setShowTyping(false);
    }
  }, [sessionId, messages, updateSessionActivity]);

  return (
    <div 
      className={className}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 999999,
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        ...style
      }}
    >
      {/* Bouton widget emlyon */}
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
        onClick={() => {
          if (!hasDragged.current) {
            setIsOpen(!isOpen);
          }
        }}
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
        title="StudyBot emlyon - Assistant virtuel"
      >
        {isOpen ? (
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4a94e 0%, #e6b85c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(212, 169, 78, 0.4)',
            color: 'white',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            ×
          </div>
        ) : (
          <img
            src={EMLYON_ASSETS.buttonIcon}
            alt="StudyBot"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              objectFit: 'cover',
              filter: 'drop-shadow(0 4px 16px rgba(212, 169, 78, 0.4))'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement!;
              parent.style.background = 'linear-gradient(135deg, #d4a94e 0%, #e6b85c 100%)';
              parent.innerHTML = '💬';
              parent.style.color = 'white';
              parent.style.fontSize = '20px';
            }}
          />
        )}
      </motion.button>

      {/* Fenêtre de chat */}
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
              width: window.innerWidth <= 700 ? '100vw' : `${widgetSize.width}px`,
              height: window.innerWidth <= 700 ? '85vh' : `${widgetSize.height}px`,
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e5e5e5',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header du chat */}
            <motion.div
              style={{
                background: 'linear-gradient(135deg, #d4a94e 0%, #e6b85c 100%)',
                color: 'white',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={EMLYON_ASSETS.titleAvatar}
                    alt="StudyBot"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>StudyBot</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Assistant emlyon</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const newSessionId = resetSession();
                    console.log('🔄 Conversation réinitialisée avec nouvelle session:', newSessionId);
                  }}
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
                    borderRadius: '4px'
                  }}
                >
                  ×
                </motion.button>
              </div>
            </motion.div>

            {/* Corps du chat avec messages */}
            <div 
              ref={chatContainerRef}
              style={{
                flex: 1,
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                          />
                        </div>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        {typewritingMessageId === message.id && message.type === 'bot' ? (
                          <TypewriterText
                            text={message.content}
                            speed={30}
                            onComplete={() => {
                              setTypewritingMessageId(null);
                              setTimeout(scrollToBottom, 100);
                            }}
                          />
                        ) : (
                          <div 
                            style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                            dangerouslySetInnerHTML={{
                              __html: containsLinks(message.content) 
                                ? formatBotMessage(message.content)
                                : message.content
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Boutons de feedback pour les messages bot (sauf message de bienvenue) */}
                    {message.type === 'bot' && message.id !== 1 && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        paddingLeft: '44px',
                        marginTop: '4px'
                      }}>
                        {message.feedback === null ? (
                          <>
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
                          <div style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            backgroundColor: message.feedback.type === 'positive' ? '#e8f5e8' : '#ffeaea',
                            color: message.feedback.type === 'positive' ? '#2d5a2d' : '#8b2635',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {message.feedback.type === 'positive' ? '✅ Feedback positif' : '❌ Feedback négatif'}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage(inputValue);
                    }
                  }}
                  placeholder="Tapez votre message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '24px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                />
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: inputValue.trim() ? '#d4a94e' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: inputValue.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Envoyer
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de feedback */}
      <AnimatePresence>
        {showFeedbackModal && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={cancelFeedback}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e5e5'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '24px'
                }}>
                  {feedbackType === 'positive' ? '👍' : '👎'}
                </div>
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    {feedbackType === 'positive' ? 'Merci pour votre retour !' : 'Aidez-nous à améliorer'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    {feedbackType === 'positive' 
                      ? 'Votre avis nous aide à améliorer StudyBot'
                      : 'Que pouvons-nous améliorer dans cette réponse ?'
                    }
                  </div>
                </div>
              </div>

              {/* Zone de commentaire */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {feedbackType === 'positive' ? 'Commentaire (optionnel)' : 'Votre commentaire nous aidera'}
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder={feedbackType === 'positive' 
                    ? 'Dites-nous ce qui vous a plu...'
                    : 'Expliquez-nous le problème...'
                  }
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#d4a94e';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 169, 78, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
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

      {/* CSS pour scrollbar */}
      <style>{`
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

export default ChatWidget; 