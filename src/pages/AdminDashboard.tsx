import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCategories, getOrders, adminListUsers } from "../api/axios";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";

const statsInit = {
  ventes: 0,
  commandes: 0,
  utilisateurs: 0,
  produits: 0,
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(statsInit);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, ordRes, usrRes] = await Promise.all([
          getProducts(),
          getCategories(),
          getOrders(),
          adminListUsers({ limit: 1 })
        ]);

        const productsArr = (prodRes.data?.data || prodRes.data || []) as any[];
        const categoriesArr = (catRes.data?.data || catRes.data || []) as any[];
        const ordersArr = (ordRes.data?.data || ordRes.data || []) as any[];
        const usersTotal = usrRes.data?.total ?? (usrRes.data?.data?.length || 0);

        const totalSales = ordersArr.reduce((sum: number, o: any) => sum + (o.montantTotal || 0), 0);

        setStats({
          ventes: Math.round(totalSales),
          commandes: ordersArr.length,
          utilisateurs: usersTotal,
          produits: productsArr.length,
        });

        // Trier commandes récentes par date desc et garder 5
        const sorted = [...ordersArr].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentOrders(sorted.slice(0, 5));
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const managementActions = [
    {
      id: 'analytics',
      title: 'Analyses & Rapports',
      description: 'Tableaux de bord et métriques détaillées',
      icon: '📊',
      color: 'from-cyan-500 to-blue-600',
      href: '/admin/analytics'
    },
    {
      id: 'products',
      title: 'Gestion des Produits',
      description: 'Ajouter, modifier et supprimer des produits',
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      href: '/admin/products'
    },
    {
      id: 'categories',
      title: 'Gestion des Catégories',
      description: 'Organiser les catégories de produits',
      icon: '🏷️',
      color: 'from-yellow-500 to-orange-500',
      href: '/admin/categories'
    },
    {
      id: 'orders',
      title: 'Gestion des Commandes',
      description: 'Suivre et traiter les commandes',
      icon: '📋',
      color: 'from-green-500 to-green-600',
      href: '/admin/orders'
    },
    {
      id: 'users',
      title: 'Gestion des Utilisateurs',
      description: 'Administrer les comptes utilisateurs',
      icon: '👥',
      color: 'from-purple-500 to-purple-600',
      href: '/admin/users'
    },
    {
      id: 'payments',
      title: 'Gestion des Paiements',
      description: 'Suivre les transactions et paiements',
      icon: '💳',
      color: 'from-indigo-500 to-indigo-600',
      href: '/admin/payments'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header avec dégradé */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tableau de Bord</h1>
              <p className="text-blue-100 text-lg">Administration ElectroPro</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">Dernière mise à jour</p>
                <p className="font-semibold">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
        {/* Statistiques rapides avec design moderne */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(stats.ventes)}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +12% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Commandes</p>
                <p className="text-3xl font-bold text-green-600">{stats.commandes}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +8% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Utilisateurs</p>
                <p className="text-3xl font-bold text-purple-600">{stats.utilisateurs}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +15% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Produits</p>
                <p className="text-3xl font-bold text-orange-600">{stats.produits}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +5% ce mois
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
        </section>

        {/* Commandes récentes */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📋</span>
                Commandes Récentes
              </h2>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📦</span>
                  </div>
                  <p className="text-gray-500">Aucune commande récente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentOrders.map((o: any) => (
                        <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {o.client?.nom || 'Client'}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              o.statut === 'livré' ? 'bg-green-100 text-green-800' :
                              o.statut === 'en cours' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {o.statut}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-gray-900">
                            {formatPrice(o.montantTotal || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Boutons de gestion modernisés */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Outils de Gestion</h2>
            <button 
              onClick={() => setActiveModal('quick-actions')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Actions Rapides
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementActions.map((action) => (
              <div key={action.id} className="group">
                <Link 
                  to={action.href}
                  className="block bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      <span className="text-xl">{action.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <span>Accéder</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Modal Actions Rapides */}
        {activeModal === 'quick-actions' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Actions Rapides</h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Link 
                  to="/admin/products/new"
                  onClick={() => setActiveModal(null)}
                  className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors block"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">➕</span>
                    <div>
                      <p className="font-semibold text-gray-900">Ajouter un produit</p>
                      <p className="text-sm text-gray-600">Créer un nouveau produit rapidement</p>
                    </div>
                  </div>
                </Link>
                
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    // Générer et télécharger un rapport CSV
                    const csvContent = `Date,Ventes,Commandes,Utilisateurs,Produits\n${new Date().toLocaleDateString('fr-FR')},${stats.ventes},${stats.commandes},${stats.utilisateurs},${stats.produits}`;
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `rapport-electroshop-${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Rapport généré et téléchargé avec succès !');
                  }}
                  className="w-full p-4 bg-green-50 border border-green-200 rounded-xl text-left hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <div>
                      <p className="font-semibold text-gray-900">Générer un rapport</p>
                      <p className="text-sm text-gray-600">Exporter les données de vente</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setActiveModal('newsletter');
                  }}
                  className="w-full p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📧</span>
                    <div>
                      <p className="font-semibold text-gray-900">Envoyer newsletter</p>
                      <p className="text-sm text-gray-600">Communiquer avec les clients</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setActiveModal('settings');
                  }}
                  className="w-full p-4 bg-orange-50 border border-orange-200 rounded-xl text-left hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚙️</span>
                    <div>
                      <p className="font-semibold text-gray-900">Paramètres système</p>
                      <p className="text-sm text-gray-600">Configurer l'application</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Newsletter */}
        {activeModal === 'newsletter' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Envoyer Newsletter</h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sujet</label>
                    <input 
                      type="text" 
                      placeholder="Nouveautés ElectroPro - Janvier 2024"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea 
                      rows={6}
                      placeholder="Découvrez nos derniers produits et offres spéciales..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    ></textarea>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">Tous les clients</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">Clients VIP uniquement</span>
                    </label>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        toast.success('Newsletter envoyée avec succès à tous les clients !');
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    >
                      📧 Envoyer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Paramètres */}
        {activeModal === 'settings' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Paramètres Système</h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Mode maintenance</p>
                      <p className="text-sm text-gray-600">Activer le mode maintenance du site</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Notifications email</p>
                      <p className="text-sm text-gray-600">Recevoir les notifications par email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Sauvegarde automatique</p>
                      <p className="text-sm text-gray-600">Sauvegarde quotidienne des données</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      toast.success('Paramètres sauvegardés avec succès !');
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                  >
                    ⚙️ Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;