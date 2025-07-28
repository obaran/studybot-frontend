import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWidgetConfig } from '../hooks/useWidgetConfig';

const EmbedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  
  // Validation du token via l'API
  const { config, loading, error } = useWidgetConfig(token || undefined);
  
  // Effet pour valider le token
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsValidToken(false);
      return;
    }
    
    if (!loading) {
      setIsValidating(false);
      setIsValidToken(!!config && !error);
    }
  }, [token, config, loading, error]);

  // 🔄 Communication cross-frame pour synchronisation configuration (Embed)
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🎯 [EmbedPage] Événement widgetConfigUpdated détecté, propagation vers iframe...');
      
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
        console.log('🔄 [EmbedPage] Message reçu de l\'iframe, synchronisation...');
        // L'iframe nous informe d'un changement, on peut réagir si nécessaire
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('widgetConfigUpdated', handleConfigUpdate);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'transparent',
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Iframe vers ChatOnly (source unique) pour embed */}
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
          pointerEvents: 'auto'
        }}
        title="StudyBot Embed"
        allow="microphone"
        onLoad={() => {
          console.log('🎯 [EmbedPage] Iframe ChatOnly chargée et prête pour la synchronisation');
        }}
      />
    </div>
  );
};

export default EmbedPage; 