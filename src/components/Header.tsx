import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import Sidebar from "./Sidebar";
import CartIcon from "./CartIcon";
import { useAppSelector } from "../store/hooks";
import { Menu, Heart, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const favCount = useAppSelector(s => Object.keys(s.favorites?.items || {}).length);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const authMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authMenuRef.current && !authMenuRef.current.contains(event.target as Node)) {
        setAuthMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [authMenuRef]);

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

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Catalogue' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/electropro-chic-logo.svg" 
                  alt="ElectroPro Logo" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-xl font-bold text-gray-800 hidden sm:inline">
                  ElectroPro
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                                    className={`text-gray-600 font-medium relative after:content-[''] after:absolute after:left-0 after:bottom-[-5px] after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full ${isActiveRoute(link.href) ? "text-blue-600 after:w-full" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions: Search, Auth, Fav, Cart */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <SearchBar onSearch={query => navigate(`/products?search=${query}`)} />
              </div>

              {/* Unified User Menu Dropdown */}
              <div className="relative" ref={authMenuRef}>
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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50">
                    <nav className="py-1">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b">
                            <p className="font-bold truncate">{user.nom}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                          {user.role === 'admin' && (
                            <Link to="/admin" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAuthMenuOpen(false)}>
                              Tableau de bord
                            </Link>
                          )}
                          <Link to="/profile" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAuthMenuOpen(false)}>
                            Paramètres
                          </Link>
                          <button onClick={handleLogout} disabled={isLoggingOut} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                            {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAuthMenuOpen(false)}>
                            Se connecter
                          </Link>
                          <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAuthMenuOpen(false)}>
                            S'inscrire
                          </Link>
                        </>
                      )}
                    </nav>
                  </div>
                )}
              </div>

              <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100">
                <Heart className="w-6 h-6 text-gray-600" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              
              <CartIcon />

              <Link
                to="/about"
                                className={`hidden lg:flex text-gray-600 font-medium relative after:content-[''] after:absolute after:left-0 after:bottom-[-5px] after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full ${isActiveRoute('/about') ? "text-blue-600 after:w-full" : ""}`}
              >
                À propos
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        navLinks={[...navLinks, { href: '/about', label: 'À propos' }]}
        user={user}
        handleLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default Header;