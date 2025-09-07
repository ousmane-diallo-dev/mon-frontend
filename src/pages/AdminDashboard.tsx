import { useEffect, useState, ReactNode, useContext } from "react";
import { getProducts, getCategories, getOrders, adminListUsers } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";
import { 
  BarChart3, 
  Package, 
  Tag, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  DollarSign,
  ShoppingBag,
  UserCheck,
  SlidersHorizontal,
  MessageSquare,
  LayoutDashboard,
  ChevronLeft,
  LogOut
} from "lucide-react";

import AdminAnalytics from './AdminAnalytics';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminPayments from './AdminPayments';
import AdminChat from './AdminChat';
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";

const statsInit = {
  ventes: 0,
  commandes: 0,
  utilisateurs: 0,
  produits: 0,
};

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(statsInit);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isConfirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
      // AuthContext will handle navigation
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const managementActions = [
    {
      id: 'analytics',
      title: 'Analyses & Rapports',
      description: 'Tableaux de bord et métriques détaillées',
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-600',
      href: '/admin/analytics'
    },
    {
      id: 'products',
      title: 'Gestion des Produits',
      description: 'Ajouter, modifier et supprimer des produits',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/products'
    },
    {
      id: 'categories',
      title: 'Gestion des Catégories',
      description: 'Organiser les catégories de produits',
      icon: Tag,
      color: 'from-yellow-500 to-orange-500',
      href: '/admin/categories'
    },
    {
      id: 'orders',
      title: 'Gestion des Commandes',
      description: 'Suivre et traiter les commandes',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      href: '/admin/orders'
    },
    {
      id: 'users',
      title: 'Gestion des Utilisateurs',
      description: 'Administrer les comptes utilisateurs',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/users'
    },
    {
      id: 'payments',
      title: 'Gestion des Paiements',
      description: 'Suivre les transactions et paiements',
      icon: CreditCard,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      id: 'chat',
      title: 'Gestion du Chat',
      description: 'Gérer les conversations clients',
      icon: MessageSquare,
      color: 'from-pink-500 to-rose-500',
    }
  ];

  const renderActiveView = (): ReactNode => {
    switch (activeView) {
      case 'analytics':
        return <AdminAnalytics />;
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return <AdminCategories />;
      case 'orders':
        return <AdminOrders />;
      case 'users':
        return <AdminUsers />;
      case 'payments':
        return <AdminPayments />;
      case 'chat':
        return <AdminChat />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* Header Section moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Bonjour, {user?.nom || 'Admin'} !</h1>
                  <p className="text-blue-100 mt-1">Bienvenue sur votre tableau de bord ElectroPro.</p>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                  <p className="text-sm text-blue-200">Aujourd'hui</p>
                  <p className="font-medium text-lg">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Statistiques rapides modernes */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.ventes)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.commandes}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.utilisateurs}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Produits</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.produits}</p>
                  </div>
                  <Package className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </section>

            {/* Commandes récentes modernes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Commandes Récentes</h3>
              <div className="divide-y divide-gray-200">
                {recentOrders.length > 0 ? recentOrders.map(order => {
                  const statusColors: { [key: string]: string } = {
                    'livrée': 'bg-green-100 text-green-800',
                    'en attente': 'bg-yellow-100 text-yellow-800',
                    'annulée': 'bg-red-100 text-red-800',
                    'en cours': 'bg-blue-100 text-blue-800',
                  };
                  return (
                  <div key={order._id} className="py-4 flex items-center justify-between hover:bg-gray-50 -mx-6 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                        {order.client?.nom?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Commande #{order.numero || order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-500">{order.client?.nom || 'Client Anonyme'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.montantTotal)}</p>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[order.statut] || 'bg-gray-100 text-gray-800'}`}>
                        {order.statut}
                      </span>
                    </div>
                  </div>
                )}) : <p className="text-sm text-gray-500 py-4">Aucune commande récente.</p>}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Colonne de gauche: Menu de navigation */}
      {/* ... (le reste du composant ne change pas) ... */}
      <aside className={`flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex-shrink-0 px-4 flex items-center justify-between border-b border-gray-200">
          {isSidebarOpen && (
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <span>ElectroPro</span>
            </h2>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {[
            { id: 'dashboard', title: 'Tableau de Bord', icon: LayoutDashboard, color: 'from-gray-500 to-gray-600' },
            ...managementActions
          ].map((action) => (
            <button
              key={`menu-${action.id}`}
              onClick={() => setActiveView(action.id)}
              title={isSidebarOpen ? '' : action.title}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-700 hover:text-gray-900 ${activeView === action.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`}
            >
              <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                <action.icon className="w-4 h-4" />
              </div>
              {isSidebarOpen && <span className="text-sm font-medium">{action.title}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => setConfirmLogoutOpen(true)}
            title={isSidebarOpen ? '' : 'Déconnexion'}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700 ${!isSidebarOpen && 'justify-center'}`}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            {isSidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {renderActiveView()}
      </main>
      <ConfirmLogoutModal
        open={isConfirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default AdminDashboard;