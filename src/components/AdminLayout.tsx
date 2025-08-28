import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    const parts = pathname.split('/').filter(Boolean); // e.g. ['admin','products','edit','123']
    // If we are on an entity sub-route, go back to the entity list
    if (parts.length >= 3 && parts[0] === 'admin') {
      return `/admin/${parts[1]}`;
    }
    // Direct lists go back to dashboard
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
    { path: '/admin', label: 'Tableau de bord', icon: '📊' },
    { path: '/admin/products', label: 'Gestion Produits', icon: '📦' },
    { path: '/admin/categories', label: 'Gestion Catégories', icon: '🏷️' },
    { path: '/admin/orders', label: 'Gestion Commandes', icon: '📋' },
    { path: '/admin/payments', label: 'Gestion Paiements', icon: '💳' },
    { path: '/admin/users', label: 'Gestion Utilisateurs', icon: '👥' },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et Titre */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">ElectroPro</span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="h-6 w-px bg-gray-300"></div>
              </div>
              <div className="hidden md:block">
                <span className="text-sm text-gray-500">Administration</span>
              </div>
            </div>

            {/* Menu Admin et Actions */}
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🏠 Voir le site
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  👑 {user.nom || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="mt-8">
            <div className="px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Gestion de la Boutique
              </h3>
            </div>
            <ul className="space-y-1 px-4">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveRoute(item.path)
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="mb-3">
                <button
                  onClick={handleBack}
                  disabled={!backTarget}
                  aria-disabled={!backTarget}
                  className={`inline-flex items-center px-3 py-2 rounded-lg border transition-colors ${
                    backTarget
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="mr-2">←</span> Précédent
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="mt-2 text-gray-600">
                Gérez votre boutique en ligne depuis ce tableau de bord
              </p>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
