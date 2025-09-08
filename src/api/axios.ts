import axios from 'axios';
import { API_CONFIG } from './config/api';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête.
// Cela garantit que toutes les requêtes authentifiées incluent le token.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fonction spécifique pour la connexion, pour une meilleure organisation.
export const loginUser = (email: string, motDePasse: string) => {
  return api.post('/api/auth/login', { email, motDePasse });
};

export default api;