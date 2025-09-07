import { useState, useEffect, useMemo } from "react";
import axios from "../api/axios";

interface ChatMessage {
  _id: string;
  userInfo: {
    nom: string;
    email: string;
    telephone?: string;
    isAuthenticated: boolean;
  };
  message: string;
  messageType: 'user' | 'admin' | 'system';
  conversationId: string;
  status: 'sent' | 'delivered' | 'read';
  isAutoResponse: boolean;
  respondedBy?: string;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    page?: string;
    sessionId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  _id: string;
  isGuest: boolean;
  lastMessage: ChatMessage;
  messageCount: number;
  unreadCount: number;
  userInfo: {
    nom: string;
    email: string;
    telephone?: string;
    isAuthenticated: boolean;
  };
  firstMessageDate: string;
}

interface ChatStats {
  totalMessages: number;
  totalConversations: number;
  unreadMessages: number;
  todayMessages: number;
}

const AdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await axios.get('/api/chat/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Charger les conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'historique d'une conversation
  const loadConversationHistory = async (conversation: Conversation) => {
    if (!conversation) return;
    try {
      const { _id: groupId, isGuest } = conversation;
      const response = await axios.get(`/api/chat/conversation/${groupId}`, {
        params: { isGuest }
      });
      setMessages(response.data.data);
      setSelectedConversation(conversation);
      
      // Marquer comme lu
      await axios.patch(`/api/chat/conversation/${groupId}/read`, null, { params: { isGuest } });
      
      // Recharger les conversations pour mettre à jour le compteur
      loadConversations();
      loadStats();
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  // Envoyer une réponse
  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation) return;
    
    try {
      const conversationIdToReply = selectedConversation.lastMessage.conversationId;
      await axios.post('/api/chat/reply', {
        conversationId: conversationIdToReply,
        message: replyMessage
      });
      
      setReplyMessage("");
      // Recharger l'historique
      loadConversationHistory(selectedConversation);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadConversations();
  }, []);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
      loadConversations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredConversations = useMemo(() => {
    if (filter === 'unread') return conversations.filter(c => c.unreadCount > 0);
    return conversations;
  }, [conversations, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure(s)`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💬 Gestion des Messages Chat
          </h1>
          <p className="text-gray-600">
            Gérez les conversations avec vos clients en temps réel
          </p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔔</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Non Lus</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unreadMessages}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.todayMessages}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
                  <button
                    onClick={loadConversations}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    🔄
                  </button>
                </div>
                
                {/* Filtres */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'unread'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Non lus ({stats?.unreadMessages || 0})
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Toutes
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">
                    Chargement...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Aucune conversation trouvée
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => loadConversationHistory(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?._id === conversation._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {conversation.userInfo.nom}
                            </h3>
                            {conversation.userInfo.isAuthenticated && (
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {conversation.userInfo.email}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.message}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">
                            {formatDate(conversation.lastMessage.createdAt)}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Conversation sélectionnée */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Header de la conversation */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Conversation avec {selectedConversation.userInfo.nom}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.userInfo.email}
                          {selectedConversation.userInfo.telephone && (
                            <span className="ml-2">• {selectedConversation.userInfo.telephone}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedConversation.userInfo.isAuthenticated ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            ✅ Connecté
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            👤 Anonyme
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.messageType === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.messageType === 'admin'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`text-xs ${
                                  message.messageType === 'admin' ? 'text-blue-200' : 'text-gray-500'
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {message.isAutoResponse && (
                                <span className="text-xs text-gray-400 ml-2">🤖 Auto</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Zone de réponse */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                        placeholder="Tapez votre réponse..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendReply}
                        disabled={!replyMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">💬</span>
                    <p className="text-lg">Sélectionnez une conversation pour commencer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
