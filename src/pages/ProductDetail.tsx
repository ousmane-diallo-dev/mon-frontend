import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { formatPrice } from "../utils/formatPrice";
import { useAppDispatch } from "../store/hooks";
import { addItem } from "../store/slices/cartSlice";
import { getProduct, getProducts } from "../api/axios";

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

// Données de test pour le produit
const produitExemple: Product = {
  _id: "p1",
  nom: "Prise murale Legrand",
  description: "Prise murale de qualité professionnelle Legrand, idéale pour installations domestiques et professionnelles. Conforme aux normes de sécurité internationales, cette prise offre une excellente durabilité et une installation facile. Idéale pour les projets d'électricité résidentiels et commerciaux.",
  prix: 4500,
  quantiteStock: 50,
  images: [
    "/assets/prise-chic.jpg",
    "/assets/prise-chic-2.jpg",
    "/assets/prise-chic-3.jpg"
  ],
  categorie: "Électricité",
  note: 4.5,
  nombreAvis: 12,
  marque: "Legrand"
};

// Données de test pour les produits similaires
const produitsSimilaires: Product[] = [
  {
    _id: "p2",
    nom: "Interrupteur Schneider",
    description: "Interrupteur simple de qualité Schneider",
    prix: 3500,
    quantiteStock: 75,
    images: ["/assets/interrupteur-chic.jpg"],
    categorie: "Électricité",
    note: 4.6,
    nombreAvis: 18,
    marque: "Schneider"
  },
  {
    _id: "p3",
    nom: "Disjoncteur Hager",
    description: "Disjoncteur de protection Hager",
    prix: 8000,
    quantiteStock: 30,
    images: ["/assets/disjoncteur-chic.jpg"],
    categorie: "Électricité",
    note: 4.9,
    nombreAvis: 22,
    marque: "Hager"
  },
  {
    _id: "p4",
    nom: "Boîte de dérivation",
    description: "Boîte de dérivation étanche",
    prix: 800,
    quantiteStock: 100,
    images: ["/assets/boite-chic.jpg"],
    categorie: "Électricité",
    note: 4.6,
    nombreAvis: 28,
    marque: "Schneider"
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const produit = produitExemple; // Remplace par fetch API selon id
  const dispatch = useAppDispatch();
  const [quantite, setQuantite] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = () => {
    dispatch(addItem({
      _id: produit._id,
      nom: produit.nom,
      prix: produit.prix,
      images: produit.images,
      quantite: quantite,
    }));
    alert(`Ajouté ${quantite} x ${produit.nom} au panier`);
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const isOutOfStock = produit.quantiteStock === 0;
  const hasDiscount = produit.enPromotion && produit.prixPromo && produit.prixPromo < produit.prix;
  const discountPercentage = hasDiscount 
    ? Math.round(((produit.prix - produit.prixPromo) / produit.prix) * 100)
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
                  src={produit.images[currentImageIndex] || "/assets/placeholder.jpg"}
                  alt={produit.nom}
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
              {produit.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {produit.images.map((image, index) => (
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
                        src={image}
                        alt={`${produit.nom} - Vue ${index + 1}`}
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{produit.nom}</h1>
                {produit.marque && (
                  <p className="text-lg text-gray-600">Marque : {produit.marque}</p>
                )}
              </div>

              {/* Prix */}
              <div className="space-y-2">
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(produit.prixPromo!)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(produit.prix)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                      -{discountPercentage}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(produit.prix)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <p className="text-lg text-gray-700">
                  Stock disponible : 
                  <span className={`ml-2 font-semibold ${
                    produit.quantiteStock > 10 ? 'text-green-600' : 
                    produit.quantiteStock > 0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {produit.quantiteStock} unités
                  </span>
                </p>
                {produit.quantiteStock <= 10 && produit.quantiteStock > 0 && (
                  <p className="text-orange-600 text-sm">⚠️ Stock limité !</p>
                )}
                {isOutOfStock && (
                  <p className="text-red-600 text-sm">❌ Produit en rupture de stock</p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{produit.description}</p>
              </div>

              {/* Note et avis */}
              {produit.note && (
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill={i < Math.floor(produit.note!) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {produit.note}/5 ({produit.nombreAvis} avis)
                  </span>
                </div>
              )}

              {/* Quantité et bouton */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="quantite" className="font-medium text-gray-700">Quantité :</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantite(Math.max(1, quantite - 1))}
                      disabled={quantite <= 1}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      id="quantite"
                      type="number"
                      min={1}
                      max={produit.quantiteStock}
                      value={quantite}
                      onChange={e => setQuantite(Math.max(1, Math.min(produit.quantiteStock, Number(e.target.value))))}
                      className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setQuantite(Math.min(produit.quantiteStock, quantite + 1))}
                      disabled={quantite >= produit.quantiteStock}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bouton "Ajouter au panier" */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || quantite < 1 || quantite > produit.quantiteStock}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produitsSimilaires.map((product) => (
              <ProductCard 
                key={product._id} 
                produit={product} 
                variant="compact"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;