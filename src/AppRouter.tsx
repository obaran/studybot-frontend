import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminApp from './AdminApp';
import ChatOnly from './ChatOnly';
import ChatPage from './pages/ChatPage';
import EmbedPage from './pages/EmbedPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route par défaut - Dashboard Admin avec Widget Synchronisé */}
        <Route path="/" element={<AdminApp />} />
        
        {/* Route ChatOnly - Bot identique sans Dashboard */}
        <Route path="/bot" element={<ChatOnly />} />
        
        {/* Route lien direct - Page simple avec ChatWidget */}
        <Route path="/chat" element={<ChatPage />} />
        
        {/* Route embed - Page minimal pour iframe */}
        <Route path="/embed" element={<EmbedPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 