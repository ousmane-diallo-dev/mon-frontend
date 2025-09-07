export const API_CONFIG = {
  // Utilise la variable Vite en priorité (configurée dans .env / .env.production), sinon fallback localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
