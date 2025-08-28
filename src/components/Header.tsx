import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import Sidebar from "./Sidebar";
import CartIcon from "./CartIcon";
import { useAppSelector } from "../store/hooks";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const favCount = useAppSelector(s => Object.keys(s.favorites?.items || {}).length);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gradient-to-r from-blue-200 via-purple-200 to-pink-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 sticky top-0 z-50 transition-all duration-300">
      {/* Cercles flottants d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -top-2 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute -bottom-2 right-8 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          {/* Logo Enhanced */}
          <div className="flex-shrink-0 group">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center space-x-3 text-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="relative">
                {/* Logo principal avec effet éclair */}
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                  <svg className="w-7 h-7 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                {/* Badge statut animé */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              {/* Texte logo avec gradient */}
              <div className="flex flex-col items-start">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold text-2xl tracking-tight">
                  ElectroPro
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1 hidden sm:block">
                  Électronique Premium
                </span>
              </div>
              
              {/* Badge Premium */}
              <div className="hidden lg:flex items-center px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-full border border-yellow-300 dark:border-yellow-600 shadow-sm">
                <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-1 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Premium</span>
              </div>
            </button>
          </div>

          {/* Navigation Desktop Enhanced */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`group relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                isActiveRoute("/") 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105" 
                  : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 hover:shadow-md"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Accueil
              </span>
              {!isActiveRoute("/") && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
            
            <Link
              to="/products"
              className={`group relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                isActiveRoute("/products") 
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-105" 
                  : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 hover:shadow-md"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Produits
              </span>
              {!isActiveRoute("/products") && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
          </nav>
          
          {/* Recherche */}
          <div className="flex-1 mx-6 max-w-lg hidden md:block">
            <SearchBar onSearch={query => navigate(`/products?search=${query}`)} />
          </div>
          
          {/* Actions & Panier Enhanced */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile menu toggle enhanced */}
            <button
              className="md:hidden group p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 text-gray-700 dark:text-gray-200 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Ouvrir le menu"
              onClick={() => setSidebarOpen(prev => !prev)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:rotate-180 transition-transform duration-300">
                <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6.75a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm.75 6a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Favoris badge enhanced */}
            <Link 
              to="/favorites" 
              className="group relative hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500 group-hover:text-red-600 transition-colors group-hover:animate-pulse">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.184 2.25 12.352 2.25 8.999 2.25 6.514 4.318 4.5 6.75 4.5c1.4 0 2.717.555 3.678 1.545L12 7.67l1.572-1.625A5.21 5.21 0 0117.25 4.5c2.432 0 4.5 2.014 4.5 4.5 0 3.353-2.438 6.185-4.739 8.508a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003a.752.752 0 01-.686 0z" />
                </svg>
                {favCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg animate-bounce">
                    {favCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">
                Favoris
              </span>
            </Link>
            
            {/* Mobile favoris */}
            <Link 
              to="/favorites" 
              className="md:hidden group relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 hover:scale-110 active:scale-95" 
              aria-label="Favoris"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500 group-hover:animate-pulse">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.184 2.25 12.352 2.25 8.999 2.25 6.514 4.318 4.5 6.75 4.5c1.4 0 2.717.555 3.678 1.545L12 7.67l1.572-1.625A5.21 5.21 0 0117.25 4.5c2.432 0 4.5 2.014 4.5 4.5 0 3.353-2.438 6.185-4.739 8.508a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003a.752.752 0 01-.686 0z" />
              </svg>
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-lg animate-bounce">
                  {favCount}
                </span>
              )}
            </Link>
            {/* Auth dropdown enhanced */}
            <div className="relative">
              <button
                onClick={() => setAuthMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={authMenuOpen}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-gray-600 hover:scale-105 hover:shadow-lg"
              >
                {user ? (
                  <>
                    <div className="relative">
                      <span className={`inline-block w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 ring-2 ring-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 ${isActiveRoute('/profile') ? 'ring-blue-400 ring-4' : ''}`}>
                        {user.photo ? (
                          <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/electroshop-logo.svg'; }} />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-white font-bold text-lg">{user?.nom?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </span>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-3 border-white rounded-full shadow-md">
                        <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.nom}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        En ligne
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:animate-pulse">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z" />
                      </svg>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="font-bold text-gray-700 dark:text-gray-300 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Se connecter</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Accès compte</div>
                    </div>
                  </>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors group-hover:rotate-180 duration-300">
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>
              {authMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-hidden">
                  {user ? (
                    <div className="py-2">
                      {/* En-tête du profil */}
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-3">
                          <span className="inline-block w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                            {user.photo ? (
                              <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/electroshop-logo.svg'; }} />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">{user?.nom?.charAt(0)?.toUpperCase()}</span>
                            )}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.nom}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu items */}
                      <div className="py-1">
                        <button
                          onClick={() => { handleNavigation('/profile'); setAuthMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">Mon Profil</span>
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => { handleNavigation('/admin'); setAuthMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">Tableau de bord</span>
                          </button>
                        )}
                        <div className="my-1 h-px bg-gray-100 dark:bg-gray-600 mx-4" />
                        <button
                          onClick={async () => { setAuthMenuOpen(false); await handleLogout(); }}
                          disabled={isLoggingOut}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center gap-3 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <button
                        onClick={() => { handleNavigation('/login'); setAuthMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Connexion</span>
                      </button>
                      <button
                        onClick={() => { handleNavigation('/register'); setAuthMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Créer un compte</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <CartIcon />
          </div>
        </div>
        
        {/* Sidebar Catégories mobile */}
        {sidebarOpen && (
          <div className="md:hidden bg-blue-50 dark:bg-gray-900 border-t border-blue-200 dark:border-gray-800">
            <div className="p-3 flex justify-end items-center">
              <button
                className="p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800"
                onClick={() => setSidebarOpen(false)}
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>
            <Sidebar />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;