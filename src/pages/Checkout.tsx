import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { selectCartItems, selectCartTotal, clearCart, removeItem } from "../store/slices/cartSlice";
import { AuthContext } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import { createOrder } from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    adresseLivraison: "",
    modePaiement: "carte",
    commentaire: "",
  });

  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Votre panier est vide</h1>
          <p className="text-gray-500 mb-6">Ajoutez des produits à votre panier avant de passer commande</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🛍️ Parcourir les produits
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.adresseLivraison.trim()) {
      toast.error("❌ Veuillez saisir une adresse de livraison");
      return;
    }

    // Vérifier des IDs produits valides (ObjectId MongoDB 24 hex)
    const invalidIds = cartItems.filter(item => !/^[0-9a-fA-F]{24}$/.test(item._id));
    if (invalidIds.length > 0) {
      // Retirer automatiquement les articles invalides du panier
      invalidIds.forEach(item => dispatch(removeItem(item._id)));
      toast.warn(`⚠️ ${invalidIds.length} article(s) de démonstration retirés du panier. Ajoutez des produits depuis le catalogue réel, puis réessayez.`);
      return;
    }
    if (cartTotal <= 0) {
      toast.error("❌ Total de commande invalide");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        produits: cartItems.map(item => ({
          produit: item._id,
          quantite: item.quantite
        })),
        adresseLivraison: formData.adresseLivraison,
        modePaiement: formData.modePaiement,
        commentaire: formData.commentaire
      };

      console.log("[Checkout] Payload envoyé à /api/orders:", orderPayload);

      let response;
      try {
        response = await createOrder(orderPayload);
      } catch (err: any) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const combined = [data?.message, ...(Array.isArray(data?.errors) ? data.errors : [])].filter(Boolean).join(' | ');
        const needsLegacy = status === 400 && /montantTotal|prixUnitaire/i.test(combined);

        if (needsLegacy) {
          // Repli pour ancienne API qui exige montantTotal et prixUnitaire
          const legacyPayload = {
            ...orderPayload,
            produits: cartItems.map(item => ({
              produit: item._id,
              quantite: item.quantite,
              prixUnitaire: item.prix
            })),
            montantTotal: cartTotal
          };
          console.warn("[Checkout] Re-tente avec payload legacy:", legacyPayload);
          response = await createOrder(legacyPayload);
        } else {
          throw err;
        }
      }
      
      if (response?.data) {
        toast.success("🎉 Commande créée avec succès !");
        dispatch(clearCart());
        navigate("/payment", { state: { orderData: response.data } });
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("Erreur lors de la création de la commande:", data || error);

      if (status === 401) {
        toast.error("❌ Session expirée, veuillez vous reconnecter");
        navigate("/login");
        return;
      }

      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        data.errors.forEach((msg: string) => toast.error(`❌ ${msg}`));
      } else {
        toast.error(data?.message || "❌ Erreur lors de la création de la commande");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🛒 Finaliser la commande</h1>
        <p className="text-gray-600">Vérifiez vos articles et complétez vos informations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Résumé du panier */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Résumé de votre commande</h2>
          
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.images && item.images.length > 0 
                      ? item.images[0] 
                      : "/assets/placeholder.jpg"
                    }
                    alt={item.nom}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.nom}</h4>
                  <p className="text-sm text-gray-500">
                    Quantité: {item.quantite} × {formatPrice(item.prix)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.prix * item.quantite)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total :</span>
              <span className="text-2xl text-green-600">{formatPrice(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* Formulaire de commande */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Informations de livraison</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="adresseLivraison" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse de livraison *
              </label>
              <textarea
                id="adresseLivraison"
                name="adresseLivraison"
                value={formData.adresseLivraison}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre adresse complète de livraison..."
                required
              />
            </div>

            <div>
              <label htmlFor="modePaiement" className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement *
              </label>
              <select
                id="modePaiement"
                name="modePaiement"
                value={formData.modePaiement}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="carte">💳 Carte bancaire</option>
                <option value="mobile">📱 Orange Money</option>
                <option value="especes">💰 Espèces</option>
                <option value="virement">🏦 Virement bancaire</option>
              </select>
            </div>

            <div>
              <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                id="commentaire"
                name="commentaire"
                value={formData.commentaire}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Instructions spéciales, préférences de livraison..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Création de la commande...
                  </span>
                ) : (
                  "✅ Confirmer la commande"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => navigate("/cart")}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Retour au panier
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default Checkout;
