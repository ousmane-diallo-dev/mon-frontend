import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearFavorites, removeFavorite } from "../store/slices/favoritesSlice";
import ProductCard from "../components/ProductCard";

const Favorites = () => {
  const favorites = useSelector((s: RootState) => s.favorites.items);
  const dispatch = useDispatch();
  const list = useMemo(() => Object.values(favorites), [favorites]);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">❤️ Favoris</h1>
          {list.length > 0 && (
            <button
              onClick={() => dispatch(clearFavorites())}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Tout supprimer
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🫶</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun favori</h3>
            <p className="text-gray-600 dark:text-gray-300">Ajoutez des produits à vos favoris en cliquant sur le cœur.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map((p) => (
              <div key={p._id} className="relative">
                <button
                  aria-label="Retirer des favoris"
                  onClick={() => dispatch(removeFavorite(p._id))}
                  className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-gray-900/90 rounded-full p-2 shadow hover:scale-105 transition"
                >
                  ✕
                </button>
                <ProductCard produit={p as any} variant="default" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;


