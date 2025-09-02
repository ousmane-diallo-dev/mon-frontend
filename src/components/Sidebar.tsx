import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, LogIn, UserPlus } from 'lucide-react';

// Définition des types pour les props
interface NavLink {
  href: string;
  label: string;
}

interface User {
  // Définissez ici la structure de votre objet utilisateur
  nom: string;
  role: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  user: User | null;
  handleLogout: () => void;
  isLoggingOut: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, navLinks, user, handleLogout, isLoggingOut }) => {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden"
      onClick={onClose}
    >
      <div
        className="fixed top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-xl z-60 transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="p-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLinkClick(link.href)}
              className="w-full text-left block px-4 py-3 text-lg text-gray-700 rounded-md hover:bg-gray-100"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t">
          {user ? (
            <div>
              <div className="mb-4">
                <p className="font-semibold">{user.nom}</p>
                <p className="text-sm text-gray-500">{user.role === 'admin' ? 'Administrateur' : 'Client'}</p>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                disabled={isLoggingOut}
                className="w-full text-left px-4 py-3 text-red-600 rounded-md hover:bg-gray-100"
              >
                {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleLinkClick('/login')}
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100"
              >
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </button>
              <button
                onClick={() => handleLinkClick('/register')}
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <UserPlus className="w-5 h-5" />
                <span>S'inscrire</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;