/**
 * Configuration centralisée pour l'API.
 * Utilise les variables d'environnement pour plus de flexibilité.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const API_CONFIG = {
  baseURL: API_URL,
};