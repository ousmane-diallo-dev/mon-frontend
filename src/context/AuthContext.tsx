import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api, { loginUser } from "../api/axios";
import { API_CONFIG } from "../config/api";

interface User {
  _id: string;
  nom: string;
  email: string;
  role: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, motDePasse: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setUser: () => {},
  isAuthenticated: false,
  isLoading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const withNormalizedPhoto = (u: User | null): User | null => {
    if (!u) return u;
    if (u.photo) {
      let url = u.photo.trim();
      // Cas 1: URL absolue (http/https) => laisser, juste cache buster
      const isAbsolute = /^https?:\/\//i.test(url);
      // Cas 2: commence par '/uploads' => préfixer baseURL
      if (!isAbsolute && url.startsWith('/uploads')) {
        url = `${API_CONFIG.baseURL}${url}`;
      }
      // Cas 3: commence par 'uploads' (sans slash) => corriger et préfixer
      if (!isAbsolute && url.startsWith('uploads')) {
        url = `${API_CONFIG.baseURL}/${url}`;
      }
      // Cas 4: juste un nom de fichier => supposer dossier uploads du backend
      if (!isAbsolute && !url.includes('/')) {
        url = `${API_CONFIG.baseURL}/uploads/${url}`;
      }
      // Cache buster
      url = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
      return { ...u, photo: url };
    }
    return u;
  };
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifie si un token existe au démarrage
  useEffect(() => {
    const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
      console.log("[AuthContext] Vérification du token:", token ? "Présent" : "Absent");
      
    if (token) {
        try {
          // Vérifier la validité du token avec l'API
          const res = await api.get<User>("/api/auth/me");
          console.log("[AuthContext] Token valide, utilisateur:", res.data);
          setUser(withNormalizedPhoto(res.data));
        } catch (err: any) {
          console.warn("[AuthContext] Token invalide ou expiré, déconnexion automatique.", err?.response?.data || err);
          
          // Nettoyer le token invalide
          await performLogout();
        }
      } else {
        console.log("[AuthContext] Aucun token trouvé");
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Fonction de déconnexion complète
  const performLogout = async () => {
    try {
      // Nettoyer le token
      localStorage.removeItem("token");
      
      // Nettoyer le panier
      localStorage.removeItem("cart");
      
      // Nettoyer les autres données utilisateur
      localStorage.removeItem("userPreferences");
      localStorage.removeItem("recentSearches");
      
      // Réinitialiser l'état utilisateur
      setUser(null);
      
      // Réinitialiser les headers d'autorisation dans l'API
      delete api.defaults.headers.common['Authorization'];
      
      console.log("[AuthContext] Déconnexion effectuée avec succès");
      
    } catch (error) {
      console.error("[AuthContext] Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, on nettoie l'état local
          localStorage.removeItem("token");
          setUser(null);
        }
  };

  const login = async (email: string, motDePasse: string) => {
    try {
      console.log("[AuthContext] Tentative de connexion pour:", email);
      
  const res = await loginUser(email, motDePasse);
  const data = res.data as { token: string; user: User };
      
      // Stocker le token
  localStorage.setItem("token", data.token);
      
      // Configurer les headers d'autorisation pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Mettre à jour l'état utilisateur
      setUser(withNormalizedPhoto(data.user));
      
      console.log("[AuthContext] Connexion réussie pour:", data.user.email);
      
    } catch (err: any) {
      console.error("[AuthContext] Erreur lors de la connexion:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  const register = async (formData: FormData) => {
    try {
      console.log("[AuthContext] Tentative d'inscription");
      
  const res = await api.post<{ token: string; user: User }>("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // Stocker le token
      localStorage.setItem("token", res.data.token);
      
      // Configurer les headers d'autorisation
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Mettre à jour l'état utilisateur
      setUser(withNormalizedPhoto(res.data.user as any));
      
      console.log("[AuthContext] Inscription réussie pour:", res.data.user.email);
      
    } catch (err: any) {
      console.error("[AuthContext] Erreur lors de l'inscription:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log("[AuthContext] Déconnexion demandée");
      
      // Appeler l'API de déconnexion si elle existe (optionnel)
      try {
        await api.post("/api/auth/logout");
        console.log("[AuthContext] API de déconnexion appelée avec succès");
      } catch (apiError) {
        console.log("[AuthContext] API de déconnexion non disponible, déconnexion locale uniquement");
      }
      
      // Effectuer la déconnexion locale
      await performLogout();
      
      console.log("[AuthContext] Déconnexion terminée, redirection gérée par le composant");
      
    } catch (error) {
      console.error("[AuthContext] Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, on effectue la déconnexion locale
      await performLogout();
    }
  };

  // Calculer si l'utilisateur est authentifié
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      setUser, 
      isAuthenticated, 
      isLoading 
    }}>
      {children}
      
      {/* Indicateur de débogage (à retirer en production) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed', 
          bottom: 10, 
          right: 10, 
          background: user ? '#efe' : '#fee', 
          color: user ? '#0a0' : '#b00', 
          padding: 8, 
          borderRadius: 8, 
          zIndex: 9999,
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {user ? `✅ ${user.email} (${user.role})` : '❌ Non connecté'}
          {isLoading && ' | 🔄 Chargement...'}
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
