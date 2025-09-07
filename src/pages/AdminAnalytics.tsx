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
  const [activeChart, setActiveChart] = useState<'sales' | 'users'>('sales');

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
      const totalOrders = orders.length;
      const totalUsers = users.length;
      const totalProducts = products.length;

      // Données par mois (démo)
      const salesByMonth = [
        { month: 'Jan', sales: Math.round(totalSales * 0.15) },
        { month: 'Fév', sales: Math.round(totalSales * 0.12) },
        { month: 'Mar', sales: Math.round(totalSales * 0.18) },
        { month: 'Avr', sales: Math.round(totalSales * 0.14) },
        { month: 'Mai', sales: Math.round(totalSales * 0.16) },
        { month: 'Jun', sales: Math.round(totalSales * 0.25) }
      ];

      // Top produits (démo)
      const topProducts = products.slice(0, 5).map((p: any, i: number) => ({
        name: p.nom,
        sales: Math.round(totalSales * (0.2 - i * 0.03)),
        quantity: Math.round(50 - i * 8)
      }));

      // Croissance utilisateurs (démo)
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
          sales: totalProducts > 0 ? Math.round(totalSales * (catProducts.length / totalProducts)) : 0
        };
      });

      setAnalytics({
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
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
      toast.success('Rapport CSV généré');
    } else {
      toast.info('Export PDF en cours de développement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement des analyses…</p>
        </div>
      </div>
    );
  }

  const chartData = activeChart === 'sales' ? analytics.salesByMonth : analytics.userGrowth;
  const chartMax = Math.max(...(activeChart === 'sales' ? analytics.salesByMonth.map(s => s.sales) : analytics.userGrowth.map(u => u.users)), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analyses & Rapports</h1>
            <p className="text-sm text-gray-600">Indicateurs clés et tendances</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">1 an</option>
            </select>
            <button
              onClick={() => exportReport('csv')}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >Exporter CSV</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(analytics.totalSales)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Commandes</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Utilisateurs</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Produits</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
          </div>
        </div>

        {/* Charts + Top products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{activeChart === 'sales' ? 'Évolution des ventes' : 'Évolution des utilisateurs'}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveChart('sales')}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${activeChart === 'sales' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200'}`}
                >Ventes</button>
                <button
                  onClick={() => setActiveChart('users')}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${activeChart === 'users' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-gray-700 border-gray-200'}`}
                >Utilisateurs</button>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((item: any, idx: number) => {
                const value = activeChart === 'sales' ? item.sales : item.users;
                const height = (value / chartMax) * 200;
                const color = activeChart === 'sales' ? 'bg-blue-500' : 'bg-purple-500';
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className={`w-full ${color} rounded-t-md transition-all duration-300`} style={{ height: `${height}px` }} />
                    <p className="text-xs text-gray-600 mt-2 font-medium">{item.month}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Top produits</h3>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.quantity} ventes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(product.sales)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category performance */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Performance par catégorie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.categoryStats.map((category, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-gray-900 truncate">{category.name}</p>
                  <span className="text-xs text-gray-500">{category.products} produits</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Ventes</span>
                  <span className="font-semibold text-gray-900">{formatPrice(category.sales)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full bg-blue-500`} style={{ width: `${analytics.totalSales ? (category.sales / analytics.totalSales) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
