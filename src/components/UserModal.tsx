import React from 'react';
import { X, User, Mail, Calendar, Clock, Crown } from 'lucide-react';

interface User {
  _id: string;
  nom: string;
  email: string;
  role: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
  derniereConnexion: string;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactif': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspendu': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {user.nom.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.nom}</h2>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Crown className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Rôle</h3>
              </div>
              <span className={`inline-flex items-center px-3 py-2 text-sm font-bold rounded-full border ${getRoleColor(user.role)}`}>
                {user.role === 'admin' ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Administrateur
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Client
                  </>
                )}
              </span>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-5 h-5 rounded-full bg-green-500"></div>
                <h3 className="font-semibold text-gray-900">Statut</h3>
              </div>
              <span className={`inline-flex items-center px-3 py-2 text-sm font-bold rounded-full border ${getStatutColor(user.statut)}`}>
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
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Informations de contact</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Nom complet:</span>
                <span className="font-medium text-gray-900">{user.nom}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Email:</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Date d'inscription</h3>
              </div>
              <p className="text-gray-700 font-medium">{formatDate(user.dateCreation)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Dernière connexion</h3>
              </div>
              <p className="text-gray-700 font-medium">{formatDate(user.derniereConnexion)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;