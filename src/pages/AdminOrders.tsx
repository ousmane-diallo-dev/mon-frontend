import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrders, adminUpdateOrderStatus } from '../api/axios';
import { formatPrice } from '../utils/formatPrice';

interface OrderItem {
  _id: string;
  nom: string;
  prix: number;
  quantite: number;
  image: string;
}

interface Order {
  _id: string;
  numero?: string;
  client: {
    nom: string;
    email: string;
  };
  produits: OrderItem[];
  statut: 'en attente' | 'en cours' | 'expédiée' | 'livrée' | 'annulée' | string;
  montantTotal: number;
  adresseLivraison: string;
  modePaiement: string;
  dateCommande: string;
  dateLivraison?: string;
}

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      const arr = ((res as any).data?.data || (res as any).data || []) as any[];
      const mapped: Order[] = arr.map((o: any) => ({
        _id: o._id,
        numero: o.numero || o.reference,
        client: {
          nom: o.client?.nom || o.clientName || 'Client',
          email: o.client?.email || o.clientEmail || ''
        },
        produits: (o.produits || o.items || []).map((it: any) => ({
          _id: it._id || it.produit?._id || it.productId,
          nom: it.nom || it.produit?.nom || it.name,
          prix: it.prix || it.prixUnitaire || it.price,
          quantite: it.quantite || it.quantity,
          image: it.image || it.produit?.images?.[0]
        })),
        statut: o.statut,
        montantTotal: o.montantTotal,
        adresseLivraison: o.adresseLivraison,
        modePaiement: o.modePaiement,
        dateCommande: o.createdAt,
        dateLivraison: o.dateLivraison
      }));
      setOrders(mapped);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['statut']) => {
    try {
      await adminUpdateOrderStatus(orderId, newStatus as any);
      setOrders(orders.map(order =>
        order._id === orderId
          ? { ...order, statut: newStatus }
          : order
      ));
      toast.success('Statut de la commande mis à jour');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status: Order['statut']) => {
    switch (status) {
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en cours':
        return 'bg-orange-100 text-orange-800';
      case 'expédiée':
        return 'bg-purple-100 text-purple-800';
      case 'livrée':
        return 'bg-green-100 text-green-800';
      case 'annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['statut']) => {
    switch (status) {
      case 'en attente':
        return 'En attente';
      case 'en cours':
        return 'En préparation';
      case 'expédiée':
        return 'Expédiée';
      case 'livrée':
        return 'Livrée';
      case 'annulée':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: Order['statut']) => {
    switch (status) {
      case 'en attente':
        return '⏳';
      case 'en cours':
        return '🔧';
      case 'expédiée':
        return '📦';
      case 'livrée':
        return '🎉';
      case 'annulée':
        return '❌';
      default:
        return '📋';
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = (searchQuery || '').toLowerCase();
    const num = (order.numero || '').toLowerCase();
    const nom = (order.client?.nom || '').toLowerCase();
    const email = (order.client?.email || '').toLowerCase();
    const matchesSearch = num.includes(q) || nom.includes(q) || email.includes(q);
    const matchesStatus = !selectedStatus || order.statut === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextStatus = (currentStatus: Order['statut']): Order['statut'] | null => {
    switch (currentStatus) {
      case 'en attente':
        return 'en cours';
      case 'en cours':
        return 'expédiée';
      case 'expédiée':
        return 'livrée';
      default:
        return null;
    }
  };

  if (loading) {
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-4">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 016 11.5V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Gérez et suivez toutes les commandes de votre boutique
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/50">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar Enhanced */}
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-indigo-400 group-focus-within:text-indigo-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="✨ Rechercher par numéro, nom client, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-indigo-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gradient-to-r from-white to-indigo-50/30 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium backdrop-blur-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Filter Dropdown Enhanced */}
            <div className="lg:w-80">
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full px-4 py-4 border-2 border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-gradient-to-r from-white to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 font-medium backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option value="">🔄 Tous les statuts</option>
                  <option value="en attente">⏳ En attente</option>
                  <option value="en cours">🔧 En préparation</option>
                  <option value="expédiée">📦 Expédiée</option>
                  <option value="livrée">🎉 Livrée</option>
                  <option value="annulée">❌ Annulée</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Search Actions */}
            <div className="flex gap-3 lg:flex-col lg:w-32">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('');
                }}
                className="flex-1 lg:flex-none bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-3 lg:py-2 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
🔄
              </button>
              <button
                onClick={() => loadOrders()}
                className="flex-1 lg:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 lg:py-2 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
🔃
              </button>
            </div>
          </div>
          
          {/* Search Results Info */}
          {(searchQuery || selectedStatus) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">
                      {filteredOrders.length} commande(s) trouvée(s)
                    </p>
                    <p className="text-sm text-blue-600">
                      {searchQuery && `Recherche: "${searchQuery}"`}
                      {searchQuery && selectedStatus && ' • '}
                      {selectedStatus && `Statut: ${selectedStatus}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  Effacer filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white p-3 rounded-xl mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 016 11.5V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-yellow-500 text-white p-3 rounded-xl mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {orders.filter(o => o.statut === 'en attente').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-orange-500 text-white p-3 rounded-xl mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">En Préparation</p>
                <p className="text-2xl font-bold text-orange-900">
                  {orders.filter(o => o.statut === 'en cours').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-purple-500 text-white p-3 rounded-xl mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Expédiées</p>
                <p className="text-2xl font-bold text-purple-900">
                  {orders.filter(o => o.statut === 'expédiée').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-500 text-white p-3 rounded-xl mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Livrées</p>
                <p className="text-2xl font-bold text-green-900">
                  {orders.filter(o => o.statut === 'livrée').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Order Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 016 11.5V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{order.numero || `CMD-${order._id.slice(-8)}`}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.statut)} mt-1`}>
                        {getStatusIcon(order.statut)} {getStatusText(order.statut)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Montant Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(order.montantTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Customer and Delivery Info */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        👤 Informations Client
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {order.client.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-lg">{order.client.nom}</p>
                            <p className="text-blue-600 font-medium">{order.client.email}</p>
                          </div>
                        </div>
                        
                        {/* Quick Actions for Client */}
                        <div className="flex gap-2 pt-2">
                          <a
                            href={`mailto:${order.client.email}?subject=${encodeURIComponent(`Commande ${order.numero || `CMD-${order._id.slice(-8)}`}`)}&body=${encodeURIComponent(`Bonjour ${order.client.nom},\n\nConcernant votre commande ${order.numero || `CMD-${order._id.slice(-8)}`} du ${formatDate(order.dateCommande)}.\n\nCordialement,\nÉquipe ElectroPro`)}`}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 no-underline"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.client.email);
                              toast.success('Email copié!');
                            }}
                            className="bg-white/70 hover:bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-700 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 rounded-2xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        🚚 Adresse de Livraison
                      </h4>
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-gray-800 font-medium leading-relaxed">{order.adresseLivraison}</p>
                        <button
                          onClick={() => {
                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.adresseLivraison)}`;
                            window.open(mapsUrl, '_blank');
                          }}
                          className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          📍 Voir sur Maps
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">💳 Paiement</h5>
                        <p className="text-gray-700">{order.modePaiement}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">📅 Commande</h5>
                        <p className="text-gray-700 text-sm">{formatDate(order.dateCommande)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                      </svg>
                      Produits ({order.produits.length})
                    </h4>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {order.produits.map((produit) => (
                        <div key={produit._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <img
                            src={produit.image || '/images/placeholder.jpg'}
                            alt={produit.nom}
                            className="w-16 h-16 rounded-xl object-cover shadow-sm"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{produit.nom}</h5>
                            <p className="text-gray-600 text-sm">
                              {formatPrice(produit.prix)} × {produit.quantite}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formatPrice(produit.prix * produit.quantite)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    {getNextStatus(order.statut) && (
                      <button
                        onClick={() => handleStatusChange(order._id, getNextStatus(order.statut)!)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Passer à {getStatusText(getNextStatus(order.statut)!)}
                      </button>
                    )}
                    {order.statut === 'en attente' && (
                      <button
                        onClick={() => handleStatusChange(order._id, 'annulée')}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Annuler
                      </button>
                    )}
                    <a 
                      href={`mailto:${order.client.email}?subject=${encodeURIComponent(`Commande ${order.numero || `CMD-${order._id.slice(-8)}`}`)}&body=${encodeURIComponent(`Bonjour ${order.client.nom},\n\nConcernant votre commande ${order.numero || `CMD-${order._id.slice(-8)}`} du ${formatDate(order.dateCommande)}.\n\nCordialement,\nÉquipe ElectroPro`)}`}
                      className="group bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-300 text-emerald-700 px-6 py-3 rounded-2xl font-semibold hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 no-underline"
                    >
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      📧 Contacter Client
                    </a>
                    <button 
                      onClick={() => {
                        const invoice = {
                          id: `FA-${String(order._id).slice(-8).toUpperCase()}`,
                          date: new Date(order.dateCommande || Date.now()).toLocaleDateString(),
                          customer: { name: order.client?.nom || 'Client', email: order.client?.email || '' },
                          items: (order.produits || []).map((it: any) => ({ nom: it.nom, quantite: it.quantite, prix: it.prix })),
                          total: order.montantTotal || 0,
                        };
                        navigate('/invoice', { state: { invoice } });
                      }}
                      className="group bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 px-6 py-3 rounded-2xl font-semibold hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      📄 Voir Détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 016 11.5V5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-600">
              {searchQuery || selectedStatus 
                ? 'Aucune commande ne correspond à vos critères de recherche.'
                : 'Aucune commande n\'a encore été passée.'
              }
            </p>
          </div>
        )}
        
        {/* Footer avec bouton retour responsive */}
        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                📋 Gestion des commandes terminée
              </h3>
              <p className="text-gray-600">
                {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} affichée{filteredOrders.length > 1 ? 's' : ''} • Suivi en temps réel
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/admin/analytics')}
                className="group bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 border-2 border-blue-200"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                📊 Analytics
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                ⬅️ Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
