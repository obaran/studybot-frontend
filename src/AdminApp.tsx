import React from 'react';
import AdminDashboard from './components/admin/AdminDashboard';
import ChatOnly from './ChatOnly';

/**
 * 🎯 AdminApp - Dashboard Admin avec Widget Synchronisé
 * 
 * Ce composant combine le dashboard admin avec le widget ChatOnly synchronisé
 * qui s'affiche dans toutes les sections du dashboard.
 * 
 * Remplace l'ancien App.tsx qui contenait un widget flottant non synchronisé.
 */
const AdminApp: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Dashboard Admin - Prend tout l'écran */}
      <AdminDashboard />
      
      {/* Widget flottant (géré par ChatOnly) */}
      <ChatOnly />
    </div>
  );
};

export default AdminApp;
