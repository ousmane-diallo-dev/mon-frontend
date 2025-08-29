import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { formatPrice } from "../utils/formatPrice";
import { getImageUrl } from "../utils/imageUtils";
import { useAppDispatch } from "../store/hooks";
import { addItem } from "../store/slices/cartSlice";
import { getProduct, getSimilarProducts } from "../api/axios";

// Types
interface Product {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  images: string[];
  categorie?: string;
  enPromotion?: boolean;
  prixPromo?: number;
  note?: number;
  nombreAvis?: number;
  marque?: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Charger le produit depuis l'API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const response = await getProduct(id);
        const productData = response.data;
        
        // Traiter la catégorie si c'est un objet
        const processedProduct = {
          ...productData,
          categorie: typeof productData.categorie === 'object' && productData.categorie !== null 
            ? productData.categorie.nom 
            : productData.categorie
        };
        
        setProduct(processedProduct);
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  // Charger les produits similaires
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!id) return;
      
      try {
        setLoadingSimilar(true);
        const response = await getSimilarProducts(id, 4);
        const products = response.data?.data || response.data || [];
        
        // Traiter les catégories si elles sont des objets
        const processedProducts = products.map((p: any) => ({
          ...p,
          categorie: typeof p.categorie === 'object' && p.categorie !== null 
            ? p.categorie.nom 
            : p.categorie
        }));
        
        setSimilarProducts(processedProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des produits similaires:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };
    
    fetchSimilarProducts();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addItem({
      _id: product._id,
      nom: product.nom,
      prix: product.prix,
      images: product.images,
      quantite: quantity,
    }));
    alert(`Ajouté ${quantity} x ${product.nom} au panier`);
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Affichage de chargement
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (loadingSimilar && !product) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
          <p className="text-gray-600 mb-4">Erreur lors du chargement du produit</p>
          <Link 
            to="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  // Si pas de produit, ne rien afficher
  if (!product) {
    return null;
  }

  const isOutOfStock = product.quantiteStock === 0;
  const hasDiscount = product.enPromotion && product.prixPromo && product.prixPromo < product.prix;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.prix - (product.prixPromo || 0)) / product.prix) * 100)
    : 0;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        
        {/* SECTION PRODUIT */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            {/* Galerie images produit */}
            <div className="space-y-4">
              {/* Image principale */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={getImageUrl(product.images[currentImageIndex])}
                  alt={product.nom}
                  className="w-full h-full object-cover"
                  onError={e => (e.currentTarget.src = "/assets/placeholder.jpg")}
                />
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discountPercentage}%
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Rupture
                  </div>
                )}
              </div>
              
              {/* Miniatures */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-blue-500 scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.nom} - Vue ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={e => (e.currentTarget.src = "/assets/placeholder.jpg")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations produit */}
            <div className="space-y-6">
              {/* Nom produit */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nom}</h1>
                {product.marque && (
                  <p className="text-lg text-gray-600">Marque : {product.marque}</p>
                )}
              </div>

              {/* Prix */}
              <div className="space-y-2">
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(product.prixPromo!)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.prix)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                      -{discountPercentage}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(product.prix)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <p className="text-lg text-gray-700">
                  Stock disponible : 
                  <span className={`ml-2 font-semibold ${
                    product.quantiteStock > 10 ? 'text-green-600' : 
                    product.quantiteStock > 0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {product.quantiteStock} unités
                  </span>
                </p>
                {product.quantiteStock <= 10 && product.quantiteStock > 0 && (
                  <p className="text-orange-600 text-sm">⚠️ Stock limité !</p>
                )}
                {isOutOfStock && (
                  <p className="text-red-600 text-sm">❌ Produit en rupture de stock</p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Note et avis */}
              {product.note && (
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill={i < Math.floor(product.note!) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.note}/5 ({product.nombreAvis} avis)
                  </span>
                </div>
              )}

              {/* Quantité et bouton */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="quantite" className="font-medium text-gray-700">Quantité :</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      id="quantite"
                      type="number"
                      min={1}
                      max={product.quantiteStock}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Math.min(product.quantiteStock, Number(e.target.value))))}
                      className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.quantiteStock, quantity + 1))}
                      disabled={quantity >= product.quantiteStock}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bouton "Ajouter au panier" */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || quantity < 1 || quantity > product.quantiteStock}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isOutOfStock
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 shadow-lg'
                  }`}
                >
                  {isOutOfStock ? 'Rupture de stock' : '🛒 Ajouter au panier'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION "Produits similaires" */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔄 Produits similaires</h2>
            <Link 
              to="/products" 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Voir tout le catalogue →
            </Link>
          </div>
          
          {loadingSimilar ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 p-4 animate-pulse bg-white">
                  <div className="aspect-square rounded-lg bg-gray-200 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  produit={product} 
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun produit similaire trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;