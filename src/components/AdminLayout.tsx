import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Settings, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Home,
  LogOut,
  Bell,
  Search,
  BarChart3,
  MessageSquare,
  FileText,
  Shield
} from 'lucide-react';
import ConfirmLogoutModal from './ConfirmLogoutModal';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConfirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  // Vérifier si l'utilisateur est admin
  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getBackTarget = (pathname: string): string | null => {
    if (pathname === '/admin') return null;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 3 && parts[0] === 'admin') {
      return `/admin/${parts[1]}`;
    }
    if (parts.length === 2 && parts[0] === 'admin') {
      return '/admin';
    }
    return '/admin';
  };

  const backTarget = getBackTarget(location.pathname);

  const handleBack = () => {
    if (backTarget) {
      navigate(backTarget);
    }
  };

  const menuItems = [
    { 
      path: '/admin', 
      label: 'Tableau de bord', 
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble des statistiques'
    },
    { 
      path: '/admin/products', 
      label: 'Produits', 
      icon: Package,
      description: 'Gestion du catalogue'
    },
    { 
      path: '/admin/categories', 
      label: 'Catégories', 
      icon: Tag,
      description: 'Organisation des produits'
    },
    { 
      path: '/admin/orders', 
      label: 'Commandes', 
      icon: ShoppingCart,
      description: 'Suivi des commandes'
    },
    { 
      path: '/admin/payments', 
      label: 'Paiements', 
      icon: CreditCard,
      description: 'Gestion des transactions'
    },
    { 
      path: '/admin/users', 
      label: 'Utilisateurs', 
      icon: Users,
      description: 'Gestion des comptes'
    },
    { 
      path: '/admin/analytics', 
      label: 'Analyses', 
      icon: BarChart3,
      description: 'Rapports et statistiques'
    },
    { 
      path: '/admin/chat', 
      label: 'Messages', 
      icon: MessageSquare,
      description: 'Support client'
    },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } hidden lg:flex flex-col`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-semibold text-gray-900">ElectroPro</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isSidebarOpen && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {(user.nom || user.email || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.nom || user.email}
                </div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white w-80 transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">ElectroPro</span>
              <span className="text-xs text-gray-500">Administration</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {(user.nom || user.email || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user.nom || user.email}
              </div>
              <div className="text-xs text-gray-500">Administrateur</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  className="lg:hidden p-2 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to="/"
                  className="hidden sm:flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded text-sm font-medium hover:bg-gray-100"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Site
                </Link>
                <button
                  onClick={() => setConfirmLogoutOpen(true)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
      <ConfirmLogoutModal
        open={isConfirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default AdminLayout;