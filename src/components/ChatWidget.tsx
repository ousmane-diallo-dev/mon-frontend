import { useState, useContext, useEffect, useRef, useCallback } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { MessageSquare, X } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'support';
  text: string;
  time: string;
}

interface UserInfo {
  nom: string;
  email: string;
  telephone?: string;
}

interface ApiChatMessage {
  _id: string;
  messageType: 'user' | 'admin';
  message: string;
  createdAt: string;
}

const CHAT_CONVERSATION_ID_KEY = 'chatConversationId_v2';

const ChatWidget = () => {
  const { user } = useContext(AuthContext) || { user: null };
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(() => localStorage.getItem(CHAT_CONVERSATION_ID_KEY));
  const [userInfoCollected, setUserInfoCollected] = useState(false);
  const [guestInfo, setGuestInfo] = useState<UserInfo>({ nom: "", email: "" });
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const fetchHistory = useCallback(async () => {
    if (!conversationId) return;
      try {
        const response = await axios.get(`/api/chat/history/${conversationId}`);
        const apiMessages: ApiChatMessage[] = response.data.data || [];
        
        const formattedMessages: ChatMessage[] = apiMessages.map(msg => ({
          sender: msg.messageType === 'admin' ? 'support' : 'user',
          text: msg.message,
          time: new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }));

        setChatMessages(formattedMessages);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
      }
  }, [conversationId]);

  useEffect(() => {
    if (!chatOpen || !conversationId) return;

    fetchHistory(); // Fetch on open
    const intervalId = setInterval(fetchHistory, 5000); // Poll toutes les 5 secondes

    return () => clearInterval(intervalId);
  }, [chatOpen, conversationId, fetchHistory]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    // Collecter les infos utilisateur si pas connecté et pas encore collectées
    if (!user && !userInfoCollected) {
      if (!guestInfo.nom || !guestInfo.email) {
        // Afficher un formulaire pour collecter les infos
        return;
      }
    }
    
    // Affichage optimiste du message de l'utilisateur
    const newMessage: ChatMessage = {
      sender: 'user',
      text: chatMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMessage]);

    const messageToSend = chatMessage;
    setChatMessage("");
    
    try {
      // Envoyer le message au backend
      const userInfo = user ? {
        nom: user.nom,
        email: user.email,
        telephone: user.telephone
      } : guestInfo;

      const response = await axios.post('/api/chat/send', {
        message: messageToSend,
        userInfo,
        conversationId,
        metadata: {
          page: window.location.pathname,
          sessionId: Date.now().toString()
        }
      });

      // Récupérer l'ID de conversation si c'est le premier message
      if (!conversationId && response.data?.data?.conversationId) {
        const newId = response.data.data.conversationId;
        setConversationId(newId);
        localStorage.setItem(CHAT_CONVERSATION_ID_KEY, newId);
      }

      if (!user && !userInfoCollected) {
        setUserInfoCollected(true);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // En cas d'erreur, on peut retirer le message optimiste pour ne pas induire en erreur
      setChatMessages(prev => prev.filter(msg => msg.text !== newMessage.text || msg.time !== newMessage.time));
      // Optionnel: toast.error("Votre message n'a pas pu être envoyé.");
    }
  };

  const handleQuickMessage = (message: string) => {
    setChatMessage(message);
    setTimeout(() => {
      handleSendMessage();
    }, 100); // Un petit délai pour que l'état se mette à jour avant l'envoi
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Chat Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        >
          {chatOpen ? (
            <X className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" />
          ) : (
            <MessageSquare className="w-8 h-8 transition-transform duration-300 group-hover:-rotate-12" />
          )}
          {/* Modern Notification Badge */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
        </button>

        {/* Chat Window */}
        {chatOpen && (
          <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">ElectroPro Support</h3>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    En ligne
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-xs">
                    <p className="text-gray-800 text-sm">
                      Bonjour ! 👋 Je suis là pour vous aider avec vos questions sur nos produits électriques. Comment puis-je vous assister aujourd'hui ?
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">Maintenant</span>
                  </div>
                </div>

                {/* User Messages */}
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
                    {message.sender === 'support' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                      </div>
                    )}
                    <div className={`rounded-2xl p-3 shadow-sm max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm' 
                        : 'bg-white text-gray-800 rounded-tl-sm'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <span className={`text-xs mt-1 block ${
                        message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}

                <div ref={chatMessagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
