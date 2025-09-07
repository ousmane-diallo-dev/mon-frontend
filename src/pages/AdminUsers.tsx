import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminListUsers, adminPromoteUser, adminDeleteUser } from '../api/axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Users, Crown, CheckCircle, Clock, Search, MoreVertical, Trash2, UserCheck } from 'lucide-react';
import UserModal from '../components/UserModal';

interface User {
  _id: string;
  nom: string;
  email: string;
  role: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
  photo?: string;
  derniereConnexion: string;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await adminListUsers();
        const data = res.data as { data: any[] };
        setUsers(
          (data.data || []).map(u => ({
            _id: u._id,
            nom: u.nom || u.name || 'Utilisateur',
            email: u.email,
            role: u.role,
            photo: u.photo,
            statut: (u.statut || 'actif') as User['statut'],
            dateCreation: u.createdAt,
            derniereConnexion: u.lastLoginAt || u.updatedAt || u.createdAt
          }))
        );
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erreur de chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    const matchesStatut = statutFilter === '' || user.statut === statutFilter;
    
    return matchesSearch && matchesRole && matchesStatut;
  });

  const handleRoleChange = async (userId: string) => {
    if (!window.confirm(`Promouvoir cet utilisateur en administrateur ?`)) return;
    setLoading(true);
    try {
      await adminPromoteUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: 'admin' } : u));
      toast.success('Utilisateur promu administrateur');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    setLoading(true);
    try {
      await adminDeleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('Utilisateur supprimé');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-xl mr-4 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Gérez les comptes utilisateurs et leurs permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white p-3 rounded-xl mr-4">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-purple-500 text-white p-3 rounded-xl mr-4">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Administrateurs</p>
                <p className="text-2xl font-bold text-purple-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-500 text-white p-3 rounded-xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Actifs</p>
                <p className="text-2xl font-bold text-green-900">
                  {users.filter(u => u.statut === 'actif').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-orange-500 text-white p-3 rounded-xl mr-4">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">Nouveaux (7j)</p>
                <p className="text-2xl font-bold text-orange-900">
                  {users.filter(u => {
                    const userDate = new Date(u.dateCreation);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return userDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Administrateur</option>
                <option value="client">Client</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-3" />
              Liste des Utilisateurs ({filteredUsers.length})
            </h3>
          </div>

          {/* Vue mobile - Cards */}
          <div className="block lg:hidden">
            <div className="p-4 space-y-4">
              {filteredUsers.map((user) => {
                const creationDate = new Date(user.dateCreation).toLocaleDateString('fr-FR');
                return (
                  <div key={user._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={user.photo || `https://ui-avatars.com/api/?name=${user.nom}&background=random`} 
                        alt={user.nom} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-gray-900">{user.nom}</h4>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                          <button onClick={() => openUserModal(user)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.statut}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Inscrit le: {creationDate}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {user.role !== 'admin' && (
                        <button onClick={() => handleRoleChange(user._id)} className="flex-1 text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-lg px-3 py-2 font-medium">Promouvoir</button>
                      )}
                      <button onClick={() => handleDelete(user._id)} className="flex-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg px-3 py-2 font-medium">Supprimer</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vue desktop - Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={user.photo || `https://ui-avatars.com/api/?name=${user.nom}&background=random`} alt={user.nom} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.dateCreation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {user.role !== 'admin' && (
                            <button onClick={() => handleRoleChange(user._id)} className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50" title="Promouvoir admin">
                              <Crown className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openUserModal(user)} className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50" title="Voir détails">
                            <Users className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal utilisateur */}
      <UserModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={closeUserModal}
      />
    </div>
  );
};

export default AdminUsers;