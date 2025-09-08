import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, User, LogOut, Settings, LayoutDashboard, X, Heart, ShoppingCart } from 'lucide-react';
import ConfirmLogoutModal from "./ConfirmLogoutModal";
import { useAppSelector } from "../store/hooks";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const authMenuRef = useRef<HTMLDivElement>(null);
  const favCount = useAppSelector(s => Object.keys(s.favorites?.items || {}).length);
  const cartCount = useAppSelector(s => s.cart?.items?.length || 0);
  
  const isAuthenticated = !!user;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (authMenuRef.current && !authMenuRef.current.contains(target)) {
        setAuthMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoggingOut(false);
      setAuthMenuOpen(false);
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const publicNavLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/login', label: 'Se connecter' },
  ];

  const authenticatedNavLinks = [
    { href: '/products', label: 'Catalogue' },
    { href: '/favorites', label: 'Favoris' },
    { href: '/cart', label: 'Panier' },
  ];

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50 animate-slide-up">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover-scale transition-smooth">
              <img 
                src="/electropro-chic-logo.svg" 
                alt="ElectroPro Logo" 
                className="h-10 w-auto object-contain"
              />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold text-2xl tracking-tight">
                ElectroPro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center gap-6">
              {!isAuthenticated ? (
                // Non connecté : Accueil + Se connecter
                publicNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-semibold transition hover:text-blue-600 ${
                      isActiveRoute(link.href) ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                // Connecté : Catalogue + Favoris + Panier
                <div className="flex items-center gap-6">
                  {authenticatedNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition hover:text-blue-600 relative ${
                        isActiveRoute(link.href) ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {link.label === 'Favoris' && (
                        <Heart className="w-5 h-5 inline mr-1" />
                      )}
                      {link.label === 'Panier' && (
                        <ShoppingCart className="w-5 h-5 inline mr-1" />
                      )}
                      {link.label}
                      {link.label === 'Favoris' && favCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {favCount}
                        </span>
                      )}
                      {link.label === 'Panier' && cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            {/* User Profile (only when authenticated) */}
            {isAuthenticated && (
              <div className="hidden md:block relative" ref={authMenuRef}>
                <button
                  onClick={() => setAuthMenuOpen(!authMenuOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {user?.photo ? (
                    <img src={user.photo} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                {authMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50 animate-in fade-in duration-150">
                    <nav className="py-1">
                      <div className="px-4 py-3 border-b">
                        <p className="font-bold truncate">{user?.nom}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAuthMenuOpen(false)}>
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          <span>Tableau de bord</span>
                        </Link>
                      )}
                      <Link to="/profile" className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAuthMenuOpen(false)}>
                        <Settings className="w-4 h-4 mr-2" />
                        <span>Mon Compte</span>
                      </Link>
                      <div className="my-1 h-px bg-gray-100"></div>
                      <button onClick={() => setConfirmOpen(true)} disabled={isLoggingOut} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                {!isAuthenticated ? (
                  // Non connecté : Accueil + Se connecter
                  publicNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition hover:text-blue-600 hover:bg-gray-50 ${
                        isActiveRoute(link.href) ? "text-blue-600 bg-blue-50" : "text-gray-600"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))
                ) : (
                  // Connecté : Navigation + Profil
                  <div className="space-y-2">
                    {/* Navigation Links */}
                    {authenticatedNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-semibold transition hover:text-blue-600 hover:bg-gray-50 relative ${
                          isActiveRoute(link.href) ? "text-blue-600 bg-blue-50" : "text-gray-600"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label === 'Favoris' && (
                          <Heart className="w-5 h-5 mr-2" />
                        )}
                        {link.label === 'Panier' && (
                          <ShoppingCart className="w-5 h-5 mr-2" />
                        )}
                        {link.label}
                        {link.label === 'Favoris' && favCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {favCount}
                          </span>
                        )}
                        {link.label === 'Panier' && cartCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    ))}
                    
                    {/* User Profile Section */}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="px-3 py-2 border-b border-gray-200">
                        <p className="font-bold text-gray-800">{user?.nom}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          <span>Tableau de bord</span>
                        </Link>
                      )}
                      <Link 
                        to="/profile" 
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        <span>Mon Compte</span>
                      </Link>
                      <button 
                        onClick={() => { setConfirmOpen(true); setMobileMenuOpen(false); }} 
                        disabled={isLoggingOut}
                        className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <ConfirmLogoutModal
        open={confirmOpen}
        onConfirm={async () => { setConfirmOpen(false); await handleLogout(); }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default Header;