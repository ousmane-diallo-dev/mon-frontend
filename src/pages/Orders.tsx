import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getOrders } from "../api/axios";

interface OrderItem {
  produit: {
    _id: string;
    nom: string;
    prix: number;
    images?: string[];
  };
  quantite: number;
  prixUnitaire: number;
}

interface Order {
  _id: string;
  produits: OrderItem[];
  statut: string;
  montantTotal: number;
  adresseLivraison: string;
  modePaiement: string;
  dateCommande: string;
  commentaire?: string;
}

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      toast.error("❌ Vous devez être connecté pour voir vos commandes");
      navigate("/login");
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const mapApiOrderToView = (apiOrder: any): Order => {
    return {
      _id: apiOrder._id,
      produits: (apiOrder.produits || []).map((item: any) => ({
        produit: {
          _id: item.produit?._id || item.produit,
          nom: item.produit?.nom || "Produit inconnu",
          prix: item.produit?.prix || item.prixUnitaire || 0,
          images: item.produit?.images || [],
        },
        quantite: item.quantite || 1,
        prixUnitaire: item.prixUnitaire || item.produit?.prix || 0,
      })),
      statut: apiOrder.statut || "en attente",
      montantTotal: apiOrder.montantTotal || 0,
      adresseLivraison: apiOrder.adresseLivraison || "Adresse non spécifiée",
      modePaiement: apiOrder.modePaiement || "Non spécifié",
      dateCommande: apiOrder.dateCommande || apiOrder.createdAt || new Date().toISOString(),
      commentaire: apiOrder.commentaire,
    };
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      console.log("API Response:", response);
      
      // Handle different response structures
      let ordersData = [];
      if (response.data?.data) {
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data) {
        ordersData = [response.data];
      }
      
      const mappedOrders = ordersData.map(mapApiOrderToView);
      console.log("Mapped Orders:", mappedOrders);
      
      setOrders(mappedOrders);
      
      if ((location.state as any)?.paymentSuccess) {
        toast.success("🎉 Paiement effectué avec succès ! Votre commande a été créée.");
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des commandes:", error);
      toast.error(error?.response?.data?.message || "❌ Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expédiée":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "livrée":
        return "bg-green-100 text-green-800 border-green-200";
      case "annulée":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en attente":
        return "⏳";
      case "en cours":
        return "🚚";
      case "expédiée":
        return "📦";
      case "livrée":
        return "✅";
      case "annulée":
        return "❌";
      default:
        return "❓";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "en attente":
        return "En attente de traitement";
      case "en cours":
        return "En cours de préparation";
      case "expédiée":
        return "Expédiée";
      case "livrée":
        return "Livrée";
      case "annulée":
        return "Annulée";
      default:
        return status;
    }
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.statut === filterStatus);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Mes Commandes</h1>
        <p className="text-gray-600">Suivez l'état de vos commandes et l'historique de vos achats</p>
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Debug:</strong> {orders.length} commande(s) chargée(s)
          </p>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Filtrer par statut</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                📋 Toutes ({orders.length})
              </button>
              <button
                onClick={() => setFilterStatus("en attente")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterStatus === "en attente"
                    ? "bg-yellow-600 text-white border-yellow-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                ⏳ En attente ({orders.filter(o => o.statut === "en attente").length})
              </button>
              <button
                onClick={() => setFilterStatus("en cours")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterStatus === "en cours"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                🚚 En cours ({orders.filter(o => o.statut === "en cours").length})
              </button>
              <button
                onClick={() => setFilterStatus("expédiée")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterStatus === "expédiée"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                📦 Expédiées ({orders.filter(o => o.statut === "expédiée").length})
              </button>
              <button
                onClick={() => setFilterStatus("livrée")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterStatus === "livrée"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                ✅ Livrées ({orders.filter(o => o.statut === "livrée").length})
              </button>
              <button
                onClick={() => setFilterStatus("annulée")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterStatus === "annulée"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                ❌ Annulées ({orders.filter(o => o.statut === "annulée").length})
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🛍️ Continuer les achats
          </button>
        </div>
      </div>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            {filterStatus === "all" ? "Aucune commande" : `Aucune commande ${filterStatus}`}
          </h2>
          <p className="text-gray-500 mb-6">
            {filterStatus === "all" 
              ? "Vous n'avez pas encore passé de commande. Commencez vos achats !"
              : `Vous n'avez pas de commande avec le statut "${filterStatus}"`
            }
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🛍️ Parcourir les produits
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* En-tête de la commande */}
              <div className="bg-gray-50 p-6 border-b">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.statut)}`}>
                      {getStatusIcon(order.statut)} {getStatusText(order.statut)}
                    </div>
                    <span className="text-sm text-gray-500">
                      Commande #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Passée le</p>
                    <p className="font-semibold text-gray-800">{formatDate(order.dateCommande)}</p>
                  </div>
                </div>
              </div>

              {/* Détails de la commande */}
              <div className="p-6">
                {/* Produits */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Produits commandés</h3>
                  <div className="space-y-3">
                    {order.produits.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.produit.images && item.produit.images.length > 0 
                              ? item.produit.images[0] 
                              : "/assets/placeholder.jpg"
                            }
                            alt={item.produit.nom}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/assets/placeholder.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.produit.nom}</h4>
                          <p className="text-sm text-gray-500">
                            Quantité: {item.quantite} × {formatPrice(item.prixUnitaire)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.prixUnitaire * item.quantite)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations de livraison et paiement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">📦 Livraison</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Adresse de livraison :</p>
                      <p className="text-gray-800">{order.adresseLivraison}</p>
                      {order.commentaire && (
                        <>
                          <p className="text-sm text-gray-600 mt-2 mb-1">Commentaire :</p>
                          <p className="text-gray-800 italic">"{order.commentaire}"</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">💳 Paiement</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Mode de paiement :</p>
                      <p className="text-gray-800 capitalize">{order.modePaiement}</p>
                      <p className="text-sm text-gray-600 mt-2 mb-1">Montant total :</p>
                      <p className="text-2xl font-bold text-green-600">{formatPrice(order.montantTotal)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <button
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    📋 Voir les détails
                  </button>
                  {order.statut === "livrée" && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      ⭐ Évaluer
                    </button>
                  )}
                  {order.statut === "en attente" && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                      ❌ Annuler
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                    📞 Contacter le support
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default Orders;