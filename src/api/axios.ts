import axios from "axios";
import { API_CONFIG } from "../config/api";

// Création d'une instance Axios avec la base URL de ton backend
const api = axios.create({
  baseURL: API_CONFIG.baseURL, // URL locale du backend
  headers: API_CONFIG.headers,
  timeout: API_CONFIG.timeout,
});

// Ajouter un intercepteur pour gérer le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Authentification (adapté au backend)
export const loginUser = (email: string, motDePasse: string) =>
  api.post("/api/auth/login", { email, motDePasse });
export const registerUser = (userData: { nom: string; email: string; motDePasse: string; role?: string }) =>
  api.post("/api/auth/register", userData);

// Produits
export const getProducts = (config?: { params?: Record<string, any> }) => api.get("/api/products", config);
export const getProduct = (id: string) => api.get(`/api/products/${id}`);
export const getSimilarProducts = (productId: string, limit: number = 4) => 
  api.get(`/api/products/${productId}/similar?limit=${limit}`);
export const createProduct = (productData: FormData) => api.post("/api/products", productData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Catégories
export const getCategories = (config?: { params?: Record<string, any> }) => api.get("/api/categories", config);
export const createManyCategories = (categories: { nom: string; description?: string }[]) => 
  api.post("/api/categories/many", categories);

// Commandes
export const createOrder = (orderData: any) => api.post("/api/orders", orderData);
export const getOrders = () => api.get("/api/orders");
export const getOrder = (id: string) => api.get(`/api/orders/${id}`);
export const adminUpdateOrderStatus = (id: string, statut: 'en attente'|'en cours'|'expédiée'|'livrée'|'annulée') =>
  api.put(`/api/orders/${id}/status`, { statut });

// Paiements
export const createPayment = (paymentData: any) => api.post("/api/payments", paymentData);

// Utilisateurs (admin)
export const adminListUsers = (params?: { page?: number; limit?: number; sortBy?: string; order?: 'asc'|'desc' }) =>
  api.get("/api/users", { params });
export const adminPromoteUser = (id: string) => api.put(`/api/users/${id}/promote`);
export const adminDeleteUser = (id: string) => api.delete(`/api/users/${id}`);
export const meProfile = () => api.get("/api/users/me");
export const updateMeProfile = (data: { nom?: string; prenom?: string; email?: string; motDePasse?: string }) =>
  api.put("/api/users/me", data);
export const uploadProfilePhoto = (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  return api.put('/api/users/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Réinitialisation de mot de passe
export const requestPasswordReset = (email: string) =>
  api.post("/api/password-reset/request", { email });

export const verifyPasswordResetToken = (token: string) =>
  api.get(`/api/password-reset/verify/${encodeURIComponent(token)}`);

export const resetPassword = (token: string, newPassword: string, confirmPassword: string) =>
  api.post("/api/password-reset/reset", { token, newPassword, confirmPassword });

export const cancelPasswordReset = (email: string) =>
  api.post("/api/password-reset/cancel", { email });

export default api;
