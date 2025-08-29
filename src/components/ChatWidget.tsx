import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

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

const ChatWidget = () => {
  const { user } = useContext(AuthContext) || { user: null };
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userInfoCollected, setUserInfoCollected] = useState(false);
  const [guestInfo, setGuestInfo] = useState<UserInfo>({ nom: "", email: "" });

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    // Collecter les infos utilisateur si pas connecté et pas encore collectées
    if (!user && !userInfoCollected) {
      if (!guestInfo.nom || !guestInfo.email) {
        // Afficher un formulaire pour collecter les infos
        return;
      }
    }
    
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
        setConversationId(response.data.data.conversationId);
      }

      if (!user && !userInfoCollected) {
        setUserInfoCollected(true);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
    
    // Simulate typing indicator
    setIsTyping(true);
    
    // Simulate support response
    setTimeout(() => {
      setIsTyping(false);
      const supportResponse: ChatMessage = {
        sender: 'support',
        text: getAutoResponse(messageToSend),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, supportResponse]);
    }, 1500);
  };

  const handleQuickMessage = (message: string) => {
    setChatMessage(message);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const getAutoResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('produit') || message.includes('catalogue')) {
      return "Nous avons une large gamme de produits électriques : câbles, disjoncteurs, prises, éclairage, etc. Consultez notre catalogue en ligne ou contactez-nous pour plus d'informations spécifiques.";
    }
    
    if (message.includes('devis') || message.includes('prix')) {
      return "Pour un devis personnalisé, merci de nous fournir la liste des produits souhaités et les quantités. Nous vous répondrons dans les plus brefs délais avec nos meilleurs tarifs.";
    }
    
    if (message.includes('technique') || message.includes('aide') || message.includes('support')) {
      return "Notre équipe technique est là pour vous aider ! Décrivez-nous votre problème en détail et nous vous fournirons une solution adaptée.";
    }
    
    if (message.includes('livraison') || message.includes('délai')) {
      return "Nous livrons à Conakry sous 24-48h et en province sous 3-5 jours selon la disponibilité des produits. Les frais de livraison varient selon la destination.";
    }
    
    if (message.includes('horaire') || message.includes('ouvert')) {
      return "Nous sommes ouverts du lundi au samedi de 8h à 18h. Notre équipe est disponible pour vous accueillir et répondre à vos questions.";
    }
    
    return "Merci pour votre message ! Un de nos conseillers va vous répondre rapidement. En attendant, n'hésitez pas à consulter notre FAQ ou à nous appeler au +224 625 14 74 22.";
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
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
          
          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            💬
          </div>
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

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickMessage("Je cherche des informations sur vos produits")}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    📦 Nos produits
                  </button>
                  <button
                    onClick={() => handleQuickMessage("J'aimerais avoir un devis")}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    💰 Devis
                  </button>
                  <button
                    onClick={() => handleQuickMessage("J'ai besoin d'aide technique")}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
                  >
                    🔧 Support
                  </button>
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

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
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
