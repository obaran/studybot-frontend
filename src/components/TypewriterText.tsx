import React, { useState, useEffect } from 'react';
import { formatBotMessage } from '../utils/textUtils';

interface TypewriterTextProps {
  text: string;
  speed?: number; // millisecondes entre chaque caractère
  onComplete?: () => void;
  enableLinks?: boolean; // Pour activer la transformation des liens
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  speed = 6, 
  onComplete,
  enableLinks = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      // Délai réduit avant de signaler la fin pour l'effet visuel
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 200);

      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset si le texte change
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  // Formatage du texte avec liens si activé
  const formattedDisplayedText = enableLinks ? formatBotMessage(displayedText) : displayedText;

  return (
    <span style={{ whiteSpace: 'pre-line' }}>
      {enableLinks ? (
        <span dangerouslySetInnerHTML={{ __html: formattedDisplayedText }} />
      ) : (
        displayedText
      )}
      {currentIndex < text.length && (
        <span 
          style={{
            opacity: 0.7,
            animation: 'blink 1s infinite',
          }}
        >
          |
        </span>
      )}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 0.7; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
};

export default TypewriterText; 