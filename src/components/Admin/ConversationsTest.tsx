import React from 'react';
import { useConversations } from '../../hooks/useAdminApi';

const ConversationsTest: React.FC = () => {
  const {
    conversations,
    total,
    loading,
    error,
    refetch
  } = useConversations();

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      margin: '20px'
    }}>
      <h2>🧪 Test Connexion API Conversations</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={refetch}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: loading ? '#ccc' : '#e2001a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Chargement...' : '🔄 Tester l\'API'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          marginBottom: '16px'
        }}>
          <strong>❌ Erreur:</strong> {error.message}
          <details style={{ marginTop: '8px' }}>
            <summary>Détails</summary>
            <pre style={{ fontSize: '12px', marginTop: '8px' }}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {loading && (
        <div style={{
          padding: '12px',
          background: '#f3f4f6',
          borderRadius: '6px',
          color: '#374151'
        }}>
          ⏳ Connexion au backend en cours...
        </div>
      )}

      {!loading && !error && (
        <div style={{
          padding: '12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          color: '#166534',
          marginBottom: '16px'
        }}>
          <strong>✅ Connexion réussie!</strong>
          <br />
          Total conversations: {total}
          <br />
          Conversations chargées: {conversations.length}
        </div>
      )}

      {conversations.length > 0 && (
        <div>
          <h3>📝 Conversations trouvées:</h3>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {conversations.map((conv, index) => (
              <div key={conv.id} style={{
                padding: '8px',
                margin: '4px 0',
                background: '#f8fafc',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <strong>#{index + 1}</strong> - {conv.user.identifier}
                <br />
                <span style={{ color: '#64748b' }}>
                  {conv.messageCount} messages • {conv.status}
                  {conv.feedback && conv.feedback.length > 0 && 
                    ` • ${conv.feedback.map(f => f.type).join(', ')}`
                  }
                </span>
                <br />
                <em>"{conv.lastMessage.substring(0, 100)}..."</em>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
        <strong>Config API:</strong>
        <br />
        Backend URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
        <br />
        Admin URL: {import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001/api/admin'}
      </div>
    </div>
  );
};

export default ConversationsTest; 