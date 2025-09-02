import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import MultiLevelFilterMenu from "../components/MultiLevelFilterMenu";
import { getProducts } from "../api/axios";

interface Product {
  _id: string;
  nom: string;
  prix: number;
  images: string[];
  categorie?: string;
  enPromotion?: boolean;
  prixPromo?: number;
  quantiteStock?: number;
  note?: number;
  nombreAvis?: number;
  marque?: string;
  description?: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // États pour les filtres
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [currentSort, setCurrentSort] = useState<string>('default');

  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts({ params: { limit: 1000 } });
        const list = Array.isArray((res as any).data?.data) 
          ? (res as any).data.data 
          : (Array.isArray((res as any).data) ? (res as any).data : []);
        
        const mapped = list.map((p: any) => ({
          ...p,
          categorie: typeof p.categorie === 'object' && p.categorie !== null 
            ? (p.categorie.nom || '') 
            : (p.categorie || '')
        }));
        
        setProducts(mapped);
        setFilteredProducts(mapped);
        
        // Définir la gamme de prix maximale
        const maxPrice = Math.max(...mapped.map((p: Product) => p.prix), 0);
        setPriceRange([0, maxPrice]);
      } catch (e) {
        console.error("Erreur chargement produits:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Effet pour filtrer et trier les produits
  useEffect(() => {
    let filtered = [...products];

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categorie === selectedCategory);
    }

    // Filtre par prix
    filtered = filtered.filter(product => 
      product.prix >= priceRange[0] && product.prix <= priceRange[1]
    );

    // Tri
    switch (currentSort) {
      case 'price-asc':
        filtered.sort((a, b) => a.prix - b.prix);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.prix - a.prix);
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.nombreAvis || 0) - (a.nombreAvis || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.nom.localeCompare(a.nom));
        break;
      default:
        // Tri par défaut (ordre original)
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset à la première page lors du changement de filtres
  }, [products, selectedCategory, priceRange, currentSort]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Obtenir les catégories uniques
  const categories = Array.from(new Set(products.map(p => p.categorie).filter(Boolean)));
  const maxPrice = Math.max(...products.map(p => p.prix), 0);

  // Handlers pour les filtres
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleSortChange = (sortBy: string) => {
    setCurrentSort(sortBy);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
    setCurrentSort('default');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">📦 Catalogue Produits</h1>
                <p className="text-blue-100 text-lg">Découvrez notre gamme complète de matériel électrique professionnel</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Plus de {products.length} produits</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Livraison rapide</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <span>Garantie qualité</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Filtres et Tri Multi-Niveaux */}
        <div className="mb-6 flex justify-end">
          <MultiLevelFilterMenu
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              maxPrice={maxPrice}
              currentSort={currentSort}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onSortChange={handleSortChange}
              onReset={handleResetFilters}
            />
        </div>

        {/* Informations sur les résultats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <div className="text-sm text-gray-600">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredProducts.length)} sur {filteredProducts.length} produits
            {filteredProducts.length !== products.length && (
              <span className="ml-2 text-blue-600 font-medium">
                (sur {products.length} au total)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} produit={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600">Aucun produit disponible pour le moment</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            showItemsInfo={false}
            showPageInfo={false}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;