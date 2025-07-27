import React from 'react';
import { useSearchParams } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
        }}
      />
    </div>
  );
};

export default ChatPage; 