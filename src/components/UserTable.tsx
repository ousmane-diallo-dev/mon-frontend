import React from 'react';
import { User, Crown, Calendar, Clock, Edit, Trash2 } from 'lucide-react';

interface User {
  _id: string;
  nom: string;
  email: string;
  role: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
  derniereConnexion: string;
}

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onPromote: (userId: string) => void;
  onDelete: (userId: string) => void;
  loading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Utilisateur</span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Rôle</span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Statut</span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Inscription</span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Dernière connexion</span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user, index) => (
            <tr key={user._id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {user.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{user.nom}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-sm border ${getRoleColor(user.role)}`}>
                  {user.role === 'admin' ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Client
                    </>
                  )}
                </span>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-sm border ${getStatutColor(user.statut)}`}>
                  {user.statut === 'actif' ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Actif
                    </>
                  ) : user.statut === 'inactif' ? (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      Inactif
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Suspendu
                    </>
                  )}
                </span>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.dateCreation)}</p>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.derniereConnexion)}</p>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(user)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    title="Voir les détails"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onPromote(user._id)}
                      disabled={loading}
                      className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200 disabled:opacity-50"
                      title="Promouvoir en admin"
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDelete(user._id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                    title="Supprimer l'utilisateur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;