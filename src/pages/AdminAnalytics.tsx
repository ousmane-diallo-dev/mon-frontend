import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCategories, getOrders, adminListUsers } from "../api/axios";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  salesByMonth: { month: string; sales: number }[];
  topProducts: { name: string; sales: number; quantity: number }[];
  userGrowth: { month: string; users: number }[];
  categoryStats: { name: string; products: number; sales: number }[];
}

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    salesByMonth: [],
    topProducts: [],
    userGrowth: [],
    categoryStats: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeChart, setActiveChart] = useState('sales');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, ordRes, usrRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getOrders(),
        adminListUsers({ limit: 1000 })
      ]);

      const products = (prodRes.data?.data || prodRes.data || []) as any[];
      const categories = (catRes.data?.data || catRes.data || []) as any[];
      const orders = (ordRes.data?.data || ordRes.data || []) as any[];
      const users = (usrRes.data?.data || []) as any[];

      // Calculs des métriques
      const totalSales = orders.reduce((sum: number, o: any) => sum + (o.montantTotal || 0), 0);
      
      // Données par mois (simulées pour la démo)
      const salesByMonth = [
        { month: 'Jan', sales: Math.round(totalSales * 0.15) },
        { month: 'Fév', sales: Math.round(totalSales * 0.12) },
        { month: 'Mar', sales: Math.round(totalSales * 0.18) },
        { month: 'Avr', sales: Math.round(totalSales * 0.14) },
        { month: 'Mai', sales: Math.round(totalSales * 0.16) },
        { month: 'Jun', sales: Math.round(totalSales * 0.25) }
      ];

      // Top produits (simulé)
      const topProducts = products.slice(0, 5).map((p: any, i: number) => ({
        name: p.nom,
        sales: Math.round(totalSales * (0.2 - i * 0.03)),
        quantity: Math.round(50 - i * 8)
      }));

      // Croissance utilisateurs
      const userGrowth = [
        { month: 'Jan', users: Math.round(users.length * 0.6) },
        { month: 'Fév', users: Math.round(users.length * 0.7) },
        { month: 'Mar', users: Math.round(users.length * 0.8) },
        { month: 'Avr', users: Math.round(users.length * 0.85) },
        { month: 'Mai', users: Math.round(users.length * 0.92) },
        { month: 'Jun', users: users.length }
      ];

      // Stats par catégorie
      const categoryStats = categories.map((cat: any) => {
        const catProducts = products.filter((p: any) => p.categorie === cat.nom);
        return {
          name: cat.nom,
          products: catProducts.length,
          sales: Math.round(totalSales * (catProducts.length / products.length))
        };
      });

      setAnalytics({
        totalSales,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalProducts: products.length,
        salesByMonth,
        topProducts,
        userGrowth,
        categoryStats
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors du chargement des analyses");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csvContent = [
        'Métrique,Valeur',
        `Ventes totales,${analytics.totalSales}`,
        `Commandes totales,${analytics.totalOrders}`,
        `Utilisateurs totaux,${analytics.totalUsers}`,
        `Produits totaux,${analytics.totalProducts}`,
        '',
        'Ventes par mois',
        'Mois,Ventes',
        ...analytics.salesByMonth.map(s => `${s.month},${s.sales}`),
        '',
        'Top produits',
        'Produit,Ventes,Quantité',
        ...analytics.topProducts.map(p => `${p.name},${p.sales},${p.quantity}`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Rapport CSV généré avec succès !');
    } else {
      toast.info('Export PDF en cours de développement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white mx-6 mt-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-xl mr-4 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center mb-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold">Analyses & Rapports</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Tableaux de bord et métriques détaillées de performance
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="7d" className="text-gray-900">7 derniers jours</option>
              <option value="30d" className="text-gray-900">30 derniers jours</option>
              <option value="90d" className="text-gray-900">3 derniers mois</option>
              <option value="1y" className="text-gray-900">1 an</option>
            </select>
            <button
              onClick={() => exportReport('csv')}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(analytics.totalSales)}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +12.5% vs période précédente
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
                <p className="text-3xl font-bold text-green-600">{analytics.totalOrders}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +8.3% vs période précédente
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
                <p className="text-3xl font-bold text-purple-600">{analytics.totalUsers}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +15.7% vs période précédente
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
                <p className="text-3xl font-bold text-orange-600">{analytics.totalProducts}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +5.2% vs période précédente
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Graphique des ventes */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Évolution des Ventes
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveChart('sales')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      activeChart === 'sales' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Ventes
                  </button>
                  <button
                    onClick={() => setActiveChart('users')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      activeChart === 'users' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Utilisateurs
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between space-x-2">
                {(activeChart === 'sales' ? analytics.salesByMonth : analytics.userGrowth).map((item, index) => {
                  const maxValue = Math.max(...(activeChart === 'sales' ? analytics.salesByMonth.map(s => s.sales) : analytics.userGrowth.map(u => u.users)));
                  const height = ((activeChart === 'sales' ? item.sales : (item as any).users) / maxValue) * 200;
                  const color = activeChart === 'sales' ? 'bg-gradient-to-t from-blue-400 to-blue-600' : 'bg-gradient-to-t from-purple-400 to-purple-600';
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full ${color} rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer`}
                        style={{ height: `${height}px` }}
                        title={`${item.month}: ${activeChart === 'sales' ? formatPrice(item.sales) : (item as any).users + ' utilisateurs'}`}
                      ></div>
                      <p className="text-xs text-gray-600 mt-2 font-medium">{item.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top produits */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Top Produits
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.quantity} ventes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(product.sales)}</p>
                      <p className="text-xs text-green-500">+{Math.round((5-index) * 2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques par catégorie */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Performance par Catégorie
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.categoryStats.map((category, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-lg">{category.name}</h4>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      index % 4 === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      index % 4 === 1 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      index % 4 === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                      'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}>
                      <span className="text-white text-xl">
                        {index % 4 === 0 ? '📱' : index % 4 === 1 ? '💻' : index % 4 === 2 ? '🎧' : '📺'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Produits</span>
                      <span className="font-bold text-gray-900">{category.products}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ventes</span>
                      <span className="font-bold text-green-600">{formatPrice(category.sales)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index % 4 === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          index % 4 === 1 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          index % 4 === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                          'bg-gradient-to-r from-orange-400 to-orange-600'
                        }`}
                        style={{ width: `${(category.sales / analytics.totalSales) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {((category.sales / analytics.totalSales) * 100).toFixed(1)}% du total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
