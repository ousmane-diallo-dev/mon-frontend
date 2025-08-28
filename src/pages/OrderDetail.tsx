import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../api/axios';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/formatPrice';

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getOrder(id as string);
        setOrder(res.data?.data || res.data);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erreur chargement commande');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>Chargement de la commande...</p>
    </div>
  );

  if (!order) return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <p className="text-gray-600">Commande introuvable</p>
      <button onClick={() => navigate('/orders')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">← Retour à mes commandes</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Commande #{String(order._id).slice(-8).toUpperCase()}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const invoice = {
                id: `FA-${String(order._id).slice(-8).toUpperCase()}`,
                date: new Date(order.createdAt || Date.now()).toLocaleDateString(),
                customer: { name: order.utilisateur?.nom || 'Client', email: order.utilisateur?.email || '' },
                items: (order.produits || []).map((it: any) => ({ nom: it.produit?.nom, quantite: it.quantite, prix: it.prixUnitaire })),
                total: order.montantTotal || 0,
              };
              navigate('/invoice', { state: { invoice } });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voir la facture
          </button>
          <button onClick={() => navigate('/orders')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Mes commandes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">📦 Produits</h2>
          <div className="space-y-3">
            {(order.produits || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 border rounded p-3">
                <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                  <img src={item.produit?.images?.[0] || '/assets/placeholder.jpg'} alt={item.produit?.nom || 'Produit'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.produit?.nom || 'Produit'}</div>
                  <div className="text-sm text-gray-600">Quantité: {item.quantite} × {formatPrice(item.prixUnitaire)}</div>
                </div>
                <div className="font-semibold">{formatPrice(item.quantite * item.prixUnitaire)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">🧾 Informations</h2>
          <p className="text-sm text-gray-600">Adresse</p>
          <p className="mb-3">{order.adresseLivraison}</p>
          {order.commentaire && <>
            <p className="text-sm text-gray-600">Commentaire</p>
            <p className="mb-3 italic">"{order.commentaire}"</p>
          </>}
          <p className="text-sm text-gray-600">Paiement</p>
          <p className="capitalize mb-3">{order.modePaiement}</p>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(order.montantTotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
