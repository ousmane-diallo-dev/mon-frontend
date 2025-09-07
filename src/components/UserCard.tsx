import React from 'react';
import { User as UserIcon, Edit, Trash2, Crown } from 'lucide-react';

interface User {
  _id: string;
  nom: string;
  email: string;
  role: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
  derniereConnexion: string;
}

interface UserCardProps {
  user: User;
  onView: (user: User) => void;
  onPromote: (userId: string) => void;
  onDelete: (userId: string) => void;
  loading: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onView, 
  onPromote, 
  onDelete, 
  loading 
}) => {
  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-yellow-100 text-yellow-800';
      case 'suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">
              {user.nom.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">{user.nom}</h4>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getRoleColor(user.role)}`}>
                {user.role === 'admin' ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </>
                ) : (
                  <>
                    <UserIcon className="w-3 h-3 mr-1" />
                    Client
                  </>
                )}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getStatutColor(user.statut)}`}>
                {user.statut === 'actif' ? '✅ Actif' : 
                 user.statut === 'inactif' ? '⏸️ Inactif' : '🚫 Suspendu'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-600 mb-1">Inscription</p>
          <p className="font-semibold text-gray-900 text-sm">{formatDate(user.dateCreation)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs font-medium text-green-600 mb-1">Dernière connexion</p>
          <p className="font-semibold text-gray-900 text-sm">{formatDate(user.derniereConnexion)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(user)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
        >
          <UserIcon className="w-4 h-4 mr-1" />
          Voir
        </button>
        
        {user.role !== 'admin' && (
          <button
            onClick={() => onPromote(user._id)}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center"
          >
            <Crown className="w-4 h-4 mr-1" />
            Promouvoir
          </button>
        )}
        
        <button
          onClick={() => onDelete(user._id)}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Suppr
        </button>
      </div>
    </div>
  );
};

export default UserCard;