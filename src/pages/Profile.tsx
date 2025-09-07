import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { meProfile, updateMeProfile, uploadProfilePhoto, getOrders as getOrdersApi } from '../api/axios';
import ConfirmLogoutModal from '../components/ConfirmLogoutModal';
import { formatPrice } from '../utils/formatPrice';

interface ProfileData {
  nom: string;
  email: string;
  telephone?: string;
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    langue: 'fr' | 'en';
  };
}

interface Order {
  _id: string;
  numero: string;
  date: string;
  statut: string;
  montant: number;
  produits: Array<{
    nom: string;
    quantite: number;
    prix: number;
  }>;
}

const Profile: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    nom: '',
    email: '',
    telephone: '',
    adresse: {
      rue: '',
      ville: '',
      codePostal: '',
      pays: ''
    },
    preferences: {
      newsletter: false,
      notifications: true,
      langue: 'fr'
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
    loadOrders();
  }, [user, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const res = await meProfile();
      const u = res.data;
      setProfileData({
        nom: u.nom || '',
        email: u.email || '',
        telephone: '',
        adresse: {
          rue: '',
          ville: '',
          codePostal: '',
          pays: ''
        },
        preferences: {
          newsletter: false,
          notifications: true,
          langue: 'fr'
        }
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await getOrdersApi();
      const arr = (res.data?.data || res.data || []) as any[];
      const mapped: Order[] = arr.map((o: any) => ({
        _id: o._id,
        numero: o.numero || o.reference,
        date: o.createdAt,
        statut: o.statut,
        montant: o.montantTotal,
        produits: (o.produits || o.items || []).map((it: any) => ({
          nom: it.nom || it.produit?.nom || it.name,
          quantite: it.quantite || it.quantity,
          prix: it.prix || it.prixUnitaire || it.price,
        }))
      }));
      setOrders(mapped);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors du chargement des commandes');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMeProfile({ nom: profileData.nom, email: profileData.email });
      try {
        const refreshed = await meProfile();
        setUser(refreshed.data);
      } catch {}
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setSaving(true);
      await updateMeProfile({ motDePasse: passwordData.newPassword });
      try {
        const refreshed = await meProfile();
        setUser(refreshed.data);
      } catch {}
      toast.success('Mot de passe mis à jour avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      await uploadProfilePhoto(file);
      try {
        const refreshed = await meProfile();
        setUser(refreshed.data);
      } catch {}
      toast.success('Photo de profil mise à jour');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'upload de la photo');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_preparation':
        return 'bg-orange-100 text-orange-800';
      case 'expediee':
        return 'bg-purple-100 text-purple-800';
      case 'livree':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'en_preparation':
        return 'En préparation';
      case 'expediee':
        return 'Expédiée';
      case 'livree':
        return 'Livrée';
      default:
        return status;
    }
  };

  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" variant="dots" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du profil avec design amélioré */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 relative overflow-hidden">
          {/* Décoration de fond */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex items-center space-x-6">
            {/* Photo de profil avec fonctionnalité de modification */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-white shadow-xl">
                {user?.photo ? (
                  <img src={user.photo} alt="Profil" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/electroshop-logo.svg'; }} />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {user?.nom?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              {/* Overlay pour modifier la photo */}
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              {/* Badge en ligne */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-3 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
            </div>
            
            {/* Informations utilisateur */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {user?.nom}
                </h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  ✨ Membre VIP
                </span>
              </div>
              <p className="text-gray-600 text-lg mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                {user?.email}
              </p>
              <p className="text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                </svg>
                Membre depuis {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 font-medium border border-red-200 hover:border-red-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Navigation par onglets avec design moderne */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-100">
            <nav className="flex px-6">
              {[
                { id: 'profile', label: 'Profil', icon: '👤', color: 'blue' },
                { id: 'orders', label: 'Commandes', icon: '📦', color: 'purple' },
                { id: 'security', label: 'Sécurité', icon: '🔒', color: 'green' },
                { id: 'preferences', label: 'Préférences', icon: '⚙️', color: 'orange' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-4 px-6 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? `text-${tab.color}-600 bg-white rounded-t-xl shadow-sm border-t-2 border-${tab.color}-500 -mb-px`
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-t-lg'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600`}></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-8">
            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={profileData.nom}
                      onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={profileData.telephone}
                      onChange={(e) => setProfileData({...profileData, telephone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse de livraison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rue
                      </label>
                      <input
                        type="text"
                        value={profileData.adresse?.rue}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          adresse: {...profileData.adresse!, rue: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={profileData.adresse?.ville}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          adresse: {...profileData.adresse!, ville: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        value={profileData.adresse?.codePostal}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          adresse: {...profileData.adresse!, codePostal: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <input
                        type="text"
                        value={profileData.adresse?.pays}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          adresse: {...profileData.adresse!, pays: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" isLoading={saving}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                  </Button>
                </div>
              </form>
            )}

            {/* Onglet Commandes */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Historique des commandes</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">📦</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                    <p className="text-gray-500 mb-4">
                      Vous n'avez pas encore passé de commande.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/products')}>
                      Découvrir nos produits
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{order.numero}</h3>
                            <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{formatPrice(order.montant)}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.statut)}`}>
                              {getStatusText(order.statut)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.produits.map((produit, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{produit.nom} × {produit.quantite}</span>
                              <span className="font-medium">{formatPrice(produit.prix * produit.quantite)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <Button variant="outline" size="sm" fullWidth>
                            📄 Voir les détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Onglet Sécurité */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sécurité du compte</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel *
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Le mot de passe doit contenir au moins 8 caractères
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" isLoading={saving}>
                    {saving ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                  </Button>
                </div>
              </form>
            )}

            {/* Onglet Préférences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Préférences du compte</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Newsletter</h3>
                      <p className="text-sm text-gray-500">
                        Recevoir les dernières actualités et offres par email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.preferences.newsletter}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          preferences: {...profileData.preferences, newsletter: e.target.checked}
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Recevoir des notifications sur le statut des commandes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.preferences.notifications}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          preferences: {...profileData.preferences, notifications: e.target.checked}
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Langue préférée
                    </label>
                    <select
                      value={profileData.preferences.langue}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {...profileData.preferences, langue: e.target.value as 'fr' | 'en'}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleProfileUpdate} isLoading={saving}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmLogoutModal
        open={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Profile;