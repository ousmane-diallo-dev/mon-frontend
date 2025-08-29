import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import { getProductImageUrl } from "../utils/imageUtils";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addItem } from "../store/slices/cartSlice";
import { toggleFavorite } from "../store/slices/favoritesSlice";

interface ProductCardProps {
  produit: {
    _id: string;
    nom: string;
    prix: number;
    images?: string[];
    categorie?: string;
    enPromotion?: boolean;
    prixPromo?: number;
    quantiteStock?: number;
    note?: number;
    nombreAvis?: number;
    enVedette?: boolean;
  };
  showCategory?: boolean;
  showRating?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const ProductCard = ({ 
  produit, 
  showCategory = true, 
  showRating = true, 
  variant = 'default' 
}: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();
  const isFav = useAppSelector(s => !!s.favorites.items[produit._id]);

  const imageSrc = getProductImageUrl(produit.images);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const isOutOfStock = produit.quantiteStock === 0;
  const hasDiscount = produit.enPromotion && produit.prixPromo && produit.prixPromo < produit.prix;
  const discountPercentage = hasDiscount 
    ? Math.round(((produit.prix - produit.prixPromo!) / produit.prix) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    const cartItem = {
      _id: produit._id,
      nom: produit.nom,
      prix: produit.prix,
      images: produit.images,
      quantite: 1,
    };
    
    console.log("🛒 Adding to cart:", cartItem);
        
    try {
      dispatch(addItem(cartItem));
      console.log("✅ Item dispatched to Redux store");
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
    }
  };

  const renderRating = () => {
    if (!showRating || !produit.note) return null;
    
    const stars = [];
    const fullStars = Math.floor(produit.note);
    const hasHalfStar = produit.note % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" 
                style={{ clipPath: 'inset(0 50% 0 0)' }}/>
        </svg>
      );
    }
    
    const emptyStars = 5 - Math.ceil(produit.note);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    return (
      <div className="flex items-center gap-1 mb-2">
        <div className="flex">{stars}</div>
        {produit.nombreAvis && (
          <span className="text-sm text-gray-500 ml-1">
            ({produit.nombreAvis})
          </span>
        )}
      </div>
    );
  };

  const renderBadges = () => (
    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
      {produit.enVedette && (
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          ⭐ Vedette
        </span>
      )}
      {hasDiscount && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          -{discountPercentage}%
        </span>
      )}
      {isOutOfStock && (
        <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          Rupture
        </span>
      )}
    </div>
  );

  const renderPrice = () => (
    <div className="flex items-center gap-2 mb-3">
      {hasDiscount ? (
        <>
          <span className="text-lg font-bold text-green-600">
            {formatPrice(produit.prixPromo!)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            {formatPrice(produit.prix)}
          </span>
        </>
      ) : (
        <span className="text-xl font-bold text-green-600">
          {formatPrice(produit.prix)}
        </span>
      )}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div 
        className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${produit._id}`} className="block">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={imageError ? "/assets/placeholder.jpg" : imageSrc}
              alt={produit.nom}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {renderBadges()}
          </div>
          
          <div className="p-4">
            {showCategory && produit.categorie && (
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                {produit.categorie}
              </p>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {produit.nom}
            </h3>
            {renderPrice()}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`mt-2 w-full py-2 rounded-lg text-sm font-semibold transition ${
                isOutOfStock ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isOutOfStock ? 'Rupture' : '🛒 Ajouter au panier'}
            </button>
          </div>
        </Link>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div 
        className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800 transform hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${produit._id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={imageError ? "/assets/placeholder.jpg" : imageSrc}
              alt={produit.nom}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-all duration-700 ${
                isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {renderBadges()}
          </div>
          
          <div className="p-6">
            {showCategory && produit.categorie && (
              <p className="text-sm text-blue-600 font-medium mb-2">
                {produit.categorie}
              </p>
            )}
            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
              {produit.nom}
            </h3>
            {/* Optionnel: rating ici */}
            {renderPrice()}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`mt-2 w-full py-2 rounded-lg text-sm font-semibold transition ${
                isOutOfStock ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isOutOfStock ? 'Rupture' : '🛒 Ajouter au panier'}
            </button>
          </div>
        </Link>
      </div>
    );
  }

  // Variant par défaut
  return (
    <div 
      className="group bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${produit._id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <button
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              dispatch(toggleFavorite({_id: produit._id, nom: produit.nom, prix: produit.prix, images: produit.images}));
            }}
            className={`absolute top-3 right-3 z-20 rounded-full p-2 shadow hover:scale-105 transition ${isFav ? 'bg-red-600 text-white' : 'bg-white/90 dark:bg-gray-900/90 text-red-600'}`}
          >
            {isFav ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.184 2.25 12.352 2.25 8.999 2.25 6.514 4.318 4.5 6.75 4.5c1.4 0 2.717.555 3.678 1.545L12 7.67l1.572-1.625A5.21 5.21 0 0117.25 4.5c2.432 0 4.5 2.014 4.5 4.5 0 3.353-2.438 6.185-4.739 8.508a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003a.752.752 0 01-.686 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-1.45-.832C5.4 16.86 2 13.77 2 9.8 2 7.015 4.239 5 6.75 5c1.54 0 3.04.76 3.95 2.02h.6C12.21 5.76 13.71 5 15.25 5 17.761 5 20 7.015 20 9.8c0 3.97-3.4 7.06-8.55 10.368L12 21z" />
              </svg>
            )}
          </button>
          <img
            src={imageError ? "/assets/placeholder.jpg" : imageSrc}
            alt={produit.nom}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {renderBadges()}
        </div>
        
        <div className="p-4">
          {showCategory && produit.categorie && (
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              {produit.categorie}
            </p>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {produit.nom}
          </h3>
          {/* Optionnel: rating */}
          {renderPrice()}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {isOutOfStock ? 'Rupture de stock' : `${produit.quantiteStock || 'N/A'} en stock`}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition ${
              isOutOfStock ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isOutOfStock ? 'Rupture' : '🛒 Ajouter au panier'}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;