import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import Sidebar from "./Sidebar";
import CartIcon from "./CartIcon";
import { useAppSelector } from "../store/hooks";
import { Menu, Heart, User, Bell, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import ConfirmLogoutModal from "./ConfirmLogoutModal";
import api from "../api/axios";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const favCount = useAppSelector(s => Object.keys(s.favorites?.items || {}).length);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const authMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (authMenuRef.current && !authMenuRef.current.contains(target)) {
        setAuthMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch chat notifications for admin
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchUnreadCount = async () => {
      try {
        const statsRes = await api.get('/api/chat/stats');
        setUnreadChatCount(statsRes.data?.data?.unreadMessages || 0);
      } catch (error) {
        // Silently fail, no need to bother admin if stats are down
        console.error("Failed to fetch chat stats for header", error);
      }
    };

    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

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
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-16">
            {/* Left Side: Logo & Mobile Menu */}
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 -ml-2 mr-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
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

            {/* Desktop Navigation (Centered) */}
            <nav className="hidden lg:flex items-center space-x-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${isActiveRoute(link.href) ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden lg:block w-64">
                <SearchBar onSearch={query => navigate(`/products?search=${query}`)} />
              </div>

              {user?.role === 'admin' && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-6 h-6 text-gray-600" />
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 animate-in fade-in duration-150">
                      <div className="p-4 text-center">
                        <p className="font-semibold">Vous avez {unreadChatCount} message(s) non lu(s).</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Rendez-vous sur la page de chat pour répondre.
                        </p>
                      </div>
                      <div className="px-4 py-2 border-t">
                        <Link to="/admin/chat" onClick={() => setNotifOpen(false)} className="text-sm text-blue-600 hover:underline">Voir les messages</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50 animate-in fade-in duration-150">
                    <nav className="py-1">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b">
                            <p className="font-bold truncate">{user.nom}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                          {user.role === 'admin' && (
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

              <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Heart className="w-6 h-6 text-gray-600" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              
              <CartIcon />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        navLinks={navLinks}
        user={user}
        onRequestLogoutConfirm={() => setConfirmOpen(true)}
        isLoggingOut={isLoggingOut}
      />
      <ConfirmLogoutModal
        open={confirmOpen}
        onConfirm={async () => { setConfirmOpen(false); await handleLogout(); }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default Header;