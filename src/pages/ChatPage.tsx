import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWidgetConfig } from '../hooks/useWidgetConfig';

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Valider le token via l'API
  const { config, loading, error } = useWidgetConfig(token || undefined);

  // 🔄 Communication cross-frame pour synchronisation configuration
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🎯 [ChatPage] Événement widgetConfigUpdated détecté, propagation vers iframe...');
      
      // Propager l'événement vers l'iframe ChatOnly
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'WIDGET_CONFIG_UPDATED',
          timestamp: Date.now()
        }, '*');
      }
    };

    // Écouter les événements de configuration du parent
    window.addEventListener('widgetConfigUpdated', handleConfigUpdate);
    
    // Écouter les messages de l'iframe pour synchronisation bidirectionnelle
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WIDGET_CONFIG_UPDATED') {
        console.log('🔄 [ChatPage] Message reçu de l\'iframe, synchronisation...');
        // L'iframe nous informe d'un changement, on peut réagir si nécessaire
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('widgetConfigUpdated', handleConfigUpdate);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // États d'affichage conditionnel pour validation token
  if (token && loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{
            fontSize: '18px',
            marginBottom: '12px'
          }}>
            ⏳ Validation du token en cours...
          </div>
          <div style={{
            fontSize: '14px',
            color: '#999'
          }}>
            Vérification de l'accès
          </div>
        </div>
      </div>
    );
  }
  
  if (token && (error || !config)) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          textAlign: 'center',
          color: '#e74c3c',
          maxWidth: '400px',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🚫
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            Accès refusé
          </div>
          <div style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            Token d'accès invalide ou expiré. Veuillez contacter l'administrateur pour obtenir un nouveau lien.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative'
    }}>
      {/* Logo emlyon en haut à gauche */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#e2001a',
          letterSpacing: '-0.5px'
        }}>
          emlyon
        </div>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginTop: '-2px'
        }}>
          business school
        </div>
      </div>

      {/* Message d'accueil centré */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 1
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '16px'
        }}>
          StudyBot emlyon
        </div>
        <div style={{
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '24px'
        }}>
          Votre assistant virtuel est prêt à vous aider
        </div>
        <div style={{
          fontSize: '14px',
          color: '#94a3b8',
          background: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'inline-block'
        }}>
          👉 Cliquez sur l'icône en bas à droite pour commencer
        </div>
      </div>

      {/* Iframe vers ChatOnly (source unique) */}
      <iframe
        ref={iframeRef}
        src={`/bot${token ? `?token=${token}` : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 999
        }}
        title="StudyBot Chat"
        allow="microphone"
        onLoad={(e) => {
          // Permettre les interactions avec l'iframe une fois chargée
          e.currentTarget.style.pointerEvents = 'auto';
          console.log('🎯 [ChatPage] Iframe ChatOnly chargée et prête pour la synchronisation');
        }}
      />
    </div>
  );
};

export default ChatPage; 