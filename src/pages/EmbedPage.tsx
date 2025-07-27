import React from 'react';
import { useSearchParams } from 'react-router-dom';

const EmbedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
      />
    </div>
  );
};

export default EmbedPage; 