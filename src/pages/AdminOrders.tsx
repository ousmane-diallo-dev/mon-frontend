import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrders, adminUpdateOrderStatus, adminValidateOrder, adminRejectOrder } from '../api/axios';
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
    statut: 'en attente' | 'validée' | 'rejetée' | 'en cours' | 'expédiée' | 'livrée' | 'annulée' | string;
  montantTotal: number;
  adresseLivraison: string;
  modePaiement: string;
  dateCommande: string;
  dateLivraison?: string;
  validéeParAdmin?: boolean;
}

const mapApiOrderToView = (o: any): Order => ({
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
  dateCommande: o.createdAt || o.dateCommande,
  dateLivraison: o.dateLivraison,
  validéeParAdmin: o.validéeParAdmin
});

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
      const mapped: Order[] = arr.map(mapApiOrderToView);
      setOrders(mapped);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['statut']) => {
    try {
      const res = await adminUpdateOrderStatus(orderId, newStatus as any);
      const updatedOrder = mapApiOrderToView(res.data);
      setOrders(prev => prev.map(order => (order._id === orderId ? updatedOrder : order)));
      toast.success('Statut de la commande mis à jour');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status: Order['statut']) => {
    switch (status) {
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
      case 'validée':
        return 'bg-blue-100 text-blue-800 ring-blue-200';
      case 'en cours':
        return 'bg-orange-100 text-orange-800 ring-orange-200';
      case 'expédiée':
        return 'bg-purple-100 text-purple-800 ring-purple-200';
      case 'livrée':
        return 'bg-green-100 text-green-800 ring-green-200';
      case 'annulée':
        return 'bg-red-100 text-red-800 ring-red-200';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-200';
    }
  };

  const getStatusText = (status: Order['statut']) => {
    switch (status) {
      case 'en attente':
        return 'En attente';
      case 'validée':
        return 'Validée';
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

  const getNextStatus = (currentStatus: Order['statut']): Order['statut'] | null => {
    switch (currentStatus) {
      case 'validée':
        return 'en cours';
      case 'en cours':
        return 'expédiée';
      case 'expédiée':
        return 'livrée';
      default:
        return null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement des commandes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
            <p className="text-sm text-gray-600">Suivi et actions rapides sur les commandes</p>
          </div>
          <div className="flex gap-2">
                        <button
              onClick={loadOrders}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par numéro, nom, email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800"
              >
                <option value="">Tous les statuts</option>
                <option value="en attente">En attente</option>
                <option value="validée">Validée</option>
                <option value="en cours">En préparation</option>
                <option value="expédiée">Expédiée</option>
                <option value="livrée">Livrée</option>
                <option value="annulée">Annulée</option>
              </select>
              <button
                onClick={() => { setSearchQuery(''); setSelectedStatus(''); }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:border-gray-300"
              >Réinitialiser</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.statut === 'en attente').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Validées</p>
            <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.statut === 'validée').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">En cours</p>
            <p className="text-2xl font-bold text-orange-600">{orders.filter(o => o.statut === 'en cours').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Livrées</p>
            <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.statut === 'livrée').length}</p>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {order.client.nom?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{order.numero || `CMD-${order._id.slice(-8)}`}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ring-1 ${getStatusColor(order.statut)}`}>
                        {getStatusText(order.statut)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{new Date(order.dateCommande).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-500">Montant</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(order.montantTotal)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {order.produits.map((p) => (
                      <div key={p._id} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm flex items-center gap-2">
                        <img src={p.image || '/images/placeholder.jpg'} alt={p.nom} className="w-8 h-8 rounded object-cover" />
                        <div className="truncate">
                          <div className="font-medium text-gray-900 truncate">{p.nom}</div>
                          <div className="text-gray-600 text-xs">{p.quantite} × {formatPrice(p.prix)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 justify-start lg:justify-end">
                  {order.statut === 'en attente' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await adminValidateOrder(order._id);
                            const updatedOrder = mapApiOrderToView(res.data);
                            setOrders(prev => prev.map(o => (o._id === order._id ? updatedOrder : o)));
                            toast.success('Commande validée');
                          } catch (e: any) {
                            toast.error(e?.response?.data?.message || 'Erreur validation');
                          }
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                      >Valider</button>
                      <button
                        onClick={async () => {
                          const raison = prompt('Raison du rejet ? (optionnel)') || 'Aucune raison spécifiée';
                          try {
                            const res = await adminRejectOrder(order._id, raison);
                            const updatedOrder = mapApiOrderToView(res.data);
                            setOrders(prev => prev.map(o => (o._id === order._id ? updatedOrder : o)));
                            toast.info('Commande rejetée');
                          } catch (e: any) {
                            toast.error(e?.response?.data?.message || 'Erreur rejet');
                          }
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm border border-red-200"
                      >Rejeter</button>
                    </div>
                  )}
                  {getNextStatus(order.statut) && (
                    <button
                      onClick={() => handleStatusChange(order._id, getNextStatus(order.statut)!)}
                      className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      Passer à {getStatusText(getNextStatus(order.statut)!)}
                    </button>
                  )}
                  {order.statut === 'en attente' && (
                    <button
                      onClick={() => handleStatusChange(order._id, 'annulée')}
                      className="w-full px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm border border-red-200"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/admin/orders/edit/${order._id}`)}
                    className="w-full px-4 py-2 rounded-lg text-sm border bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                  >
                    Modifier la commande
                  </button>
                  <button
                    onClick={() => navigate(`/invoice?orderId=${order._id}`)}
                    disabled={order.statut !== 'livrée'}
                    className={`w-full px-4 py-2 rounded-lg text-sm border ${(order.statut !== 'livrée') ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'}`}
                    title={order.statut !== 'livrée' ? 'La facture sera disponible une fois la commande livrée' : 'Voir la facture'}
                  >
                    Voir facture
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="font-medium">{order.client.nom}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="truncate">{order.client.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paiement</p>
                  <p className="capitalize">{order.modePaiement}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Produits</p>
                  <p className="font-medium">{order.produits.length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center mt-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM3 7h18M6 10h12M6 13h12M9 16h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande</h3>
            <p className="text-gray-600">Aucune commande ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
