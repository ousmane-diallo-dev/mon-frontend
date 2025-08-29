import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import AdvancedFilters from "../components/AdvancedFilters";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { getProducts } from "../api/axios";

// Types
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
}

interface FilterState {
  categories: string[];
  availability: string;
  sortBy: string;
}

// Données récupérées depuis l'API


const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(1000);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    availability: "all",
    sortBy: "relevance"
  });

  // Charger les produits depuis l'API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProducts({ params: { limit: 1000 } });
        // Certains backends renvoient { data: [...] } ou directement [...]
        const list = Array.isArray((res as any).data?.data) ? (res as any).data.data : (Array.isArray((res as any).data) ? (res as any).data : []);
        const mapped = list.map((p: any) => ({
          ...p,
          categorie: typeof p.categorie === 'object' && p.categorie !== null ? (p.categorie.nom || '') : (p.categorie || '')
        }));
        if (mounted) setProducts(mapped);
      } catch (e) {
        console.error("Erreur chargement produits:", e);
      }
      finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filtrer les produits
  useEffect(() => {
    let filtered = [...products];

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.marque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categorie?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par catégories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.categorie || "")
      );
    }


    // Filtre par disponibilité
    if (filters.availability === "inStock") {
      filtered = filtered.filter(product => (product.quantiteStock || 0) > 0);
    } else if (filters.availability === "outOfStock") {
      filtered = filtered.filter(product => (product.quantiteStock || 0) === 0);
    }

    // Tri
    switch (filters.sortBy) {
      case "name":
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case "newest":
        // Tri par date de création (simulé par ID)
        filtered.sort((a, b) => b._id.localeCompare(a._id));
        break;
      case "popular":
        // Tri par popularité (simulé par nombre d'avis)
        filtered.sort((a, b) => (b.nombreAvis || 0) - (a.nombreAvis || 0));
        break;
      default:
        // Tri par pertinence (garder l'ordre original)
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Retour à la première page lors du filtrage
  }, [products, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📦 Catalogue Produits</h1>
          <p className="text-gray-600">Découvrez notre gamme complète de matériel électrique professionnel</p>
        </div>

        {/* Barre de recherche avec bouton filtres dépliable */}
        <div className="mb-6">
          <div className="flex items-center gap-4 max-w-4xl">
            <div className="flex-1">
              <SearchBar 
                placeholder="Rechercher un produit, une marque, une catégorie..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl border border-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filtres & Tri</span>
              <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filtres dépliables */}
        {showFilters && (
          <div className="mb-8 transition-all duration-300 ease-in-out">
            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              categories={Array.from(new Map(products.filter(p => !!p.categorie).map(p => [p.categorie as string, (products.filter(x => x.categorie === p.categorie).length)])).entries()).map(([label, count]) => ({ value: label as string, label: label as string, count }))}
              totalProducts={filteredProducts.length}
              className="w-full"
            />
          </div>
        )}

        <div className="flex flex-col gap-8">

          {/* Contenu principal */}
          <div className="w-full">
            
            {/* Informations sur les résultats */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredProducts.length)} sur {filteredProducts.length} produits
              </div>
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
            </div>

            {/* GRILLE PRODUITS */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse bg-white dark:bg-gray-900">
                    <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-800 mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {currentProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    produit={product} 
                    variant="default"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche ou vos filtres
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      categories: [],
                      availability: "all",
                      sortBy: "relevance"
                    });
                    setSearchQuery("");
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Effacer tous les filtres
                </button>
              </div>
            )}

            {/* PAGINATION */}
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
      </div>
    </div>
  );
};

export default ProductList;