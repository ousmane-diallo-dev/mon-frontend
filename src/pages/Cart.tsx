import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectCartItems, selectCartTotal, updateQuantity, removeItem } from "../store/slices/cartSlice";

const Cart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("Cart component mounted");
    console.log("Cart items:", cart);
    console.log("Cart total:", total);
    console.log("User:", user);
  }, [cart, total, user]);

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    try {
      if (newQuantity > 0) {
        dispatch(updateQuantity({ _id: productId, quantite: newQuantity }));
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Erreur lors de la mise à jour de la quantité");
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    try {
      if (confirm("Êtes-vous sûr de vouloir supprimer ce produit du panier ?")) {
        dispatch(removeItem(productId));
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Erreur lors de la suppression du produit");
    }
  };

  // Error display
  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Erreur détectée</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        
        {/* Debug info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Debug:</strong> Cart items: {cart?.length || 0}, Total: {total}, User: {user ? 'Connected' : 'Not connected'}
          </p>
        </div>
        
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🛒 Mon Panier</h1>
          <p className="text-gray-600">Gérez vos produits et validez votre commande</p>
        </div>

        {!cart || cart.length === 0 ? (
          /* Panier vide */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h3>
            <p className="text-gray-600 mb-6">
              Ajoutez des produits à votre panier pour commencer vos achats
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🛍️ Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LISTE PRODUITS PANIER */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* En-tête du tableau */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                    <div className="col-span-3">Produit</div>
                    <div className="col-span-2 text-center">Prix unitaire</div>
                    <div className="col-span-2 text-center">Quantité</div>
                    <div className="col-span-2 text-center">Sous-total</div>
                    <div className="col-span-3 text-center">Actions</div>
                  </div>
                </div>

                {/* Liste des produits */}
                <div className="divide-y divide-gray-200">
                  {cart.map((item, index) => (
                    <div key={item._id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        
                        {/* Image et Nom */}
                        <div className="col-span-3 flex items-center gap-3">
                          <img 
                            src={item.images && item.images.length > 0 ? item.images[0] : "/assets/placeholder.jpg"} 
                            alt={item.nom || 'Produit'} 
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            onError={e => (e.currentTarget.src = "/assets/placeholder.jpg")}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                              {item.nom || 'Nom du produit'}
                            </h3>
                          </div>
                        </div>

                        {/* Prix Unitaire */}
                        <div className="col-span-2 text-center">
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.prix || 0)}
                          </span>
                        </div>

                        {/* Quantité */}
                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item._id || '', (item.quantite || 1) - 1)}
                              disabled={(item.quantite || 1) <= 1}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                            <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
                              {item.quantite || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item._id || '', (item.quantite || 1) + 1)}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Sous-total */}
                        <div className="col-span-2 text-center">
                          <span className="font-bold text-green-600 text-lg">
                            {formatPrice((item.prix || 0) * (item.quantite || 1))}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-3 flex justify-center">
                          <button
                            onClick={() => handleRemoveFromCart(item._id || '')}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TOTAL PANIER */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Résumé de la commande</h3>
                
                {/* Détails du total */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total ({cart.length} articles)</span>
                    <span>{formatPrice(total || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(total || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton "Finaliser la commande" */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || !cart || cart.length === 0}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    loading || !cart || cart.length === 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Chargement...
                    </span>
                  ) : user ? (
                    '🛒 Finaliser la commande'
                  ) : (
                    '🔐 Connexion requise'
                  )}
                </button>

                {/* Infos */}
                <div className="mt-6 text-sm text-gray-500 text-center">
                  <p>Livraison gratuite dès 50€</p>
                  <p>Retours acceptés sous 30 jours</p>
                </div>

                {/* Lien vers les produits */}
                <div className="mt-6 text-center">
                  <Link 
                    to="/products" 
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline text-sm"
                  >
                    ← Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;