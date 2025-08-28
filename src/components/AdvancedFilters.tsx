import { useState, useEffect } from "react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}


interface AdvancedFiltersProps {
  categories: FilterOption[];
  onFiltersChange: (filters: FilterState) => void;
  totalProducts: number;
  className?: string;
}

interface FilterState {
  categories: string[];
  availability: 'all' | 'inStock' | 'outOfStock';
  sortBy: 'relevance' | 'name' | 'newest' | 'popular';
}

const AdvancedFilters = ({ 
  categories, 
  onFiltersChange, 
  totalProducts,
  className = "" 
}: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    availability: 'all',
    sortBy: 'relevance'
  });


  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleCategoryChange = (categoryValue: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryValue)
        ? prev.categories.filter(c => c !== categoryValue)
        : [...prev.categories, categoryValue]
    }));
  };




  const handleAvailabilityChange = (availability: 'all' | 'inStock' | 'outOfStock') => {
    setFilters(prev => ({
      ...prev,
      availability
    }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      availability: 'all',
      sortBy: 'relevance'
    };
    setFilters(clearedFilters);
  };

  const activeFiltersCount = [
    filters.categories.length,
    filters.availability !== 'all'
  ].filter(Boolean).length;

  return (
    <div className={`bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-3xl shadow-2xl border border-indigo-100/50 backdrop-blur-sm ${className}`}>
      {/* Header moderne et interactif */}
      <div className="p-6 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/40 to-purple-50/40 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎯 Filtres Intelligents
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-700">
                    {totalProducts} résultat{totalProducts > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-gray-400">•</span>
                <p className="text-xs text-gray-500">Mise à jour en temps réel</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden group p-3 rounded-2xl bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-200/50 backdrop-blur-sm"
          >
            <svg className={`w-6 h-6 text-indigo-600 transition-all duration-300 group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {activeFiltersCount > 0 && (
          <div className="mt-5 flex items-center gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm font-semibold rounded-full border border-indigo-200/50">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={clearAllFilters}
              className="group flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-200 border border-red-200/50 hover:border-red-300"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Tout effacer
            </button>
          </div>
        )}
      </div>

      {/* Contenu des filtres avec animations */}
      <div className={`lg:block transition-all duration-500 ease-in-out ${isOpen ? 'block animate-slideDown' : 'hidden'}`}>
        {/* Section Tri moderne */}
        <div className="p-6 border-b border-indigo-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">🔄 Trier par</h4>
          </div>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
              className="w-full p-4 border-2 border-indigo-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 font-medium shadow-sm hover:shadow-md appearance-none cursor-pointer"
            >
              <option value="relevance">🎯 Pertinence</option>
              <option value="name">🔤 Nom (A-Z)</option>
              <option value="newest">⭐ Plus récents</option>
              <option value="popular">🔥 Populaires</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>



        {/* Section Disponibilité moderne */}
        <div className="p-6 border-b border-indigo-100/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">📦 Disponibilité</h4>
          </div>
          <div className="grid gap-3">
            {[
              { value: 'all', label: 'Tous les produits', icon: '🌟', color: 'indigo' },
              { value: 'inStock', label: 'En stock', icon: '✅', color: 'emerald' },
              { value: 'outOfStock', label: 'Rupture de stock', icon: '❌', color: 'red' }
            ].map((option) => (
              <label key={option.value} className="group relative flex items-center gap-4 cursor-pointer p-3 rounded-2xl border-2 border-gray-200/50 hover:border-indigo-300/50 transition-all duration-200 hover:shadow-md bg-white/50 hover:bg-white/80">
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={filters.availability === option.value}
                  onChange={() => handleAvailabilityChange(option.value as any)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  filters.availability === option.value 
                    ? `bg-${option.color}-500 border-${option.color}-500` 
                    : 'border-gray-300 group-hover:border-indigo-400'
                }`}>
                  {filters.availability === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className={`font-medium transition-colors duration-200 ${
                    filters.availability === option.value ? 'text-gray-900' : 'text-gray-700'
                  }`}>{option.label}</span>
                </div>
                {filters.availability === option.value && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Section Catégories moderne */}
        <div className="p-6 border-b border-indigo-100/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">🏷️ Catégories</h4>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {categories.map((category) => (
              <label key={category.value} className="group relative flex items-center gap-4 cursor-pointer p-4 rounded-2xl border-2 border-gray-200/50 hover:border-purple-300/50 transition-all duration-200 hover:shadow-md bg-white/50 hover:bg-white/80 transform hover:scale-[1.02]">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                  filters.categories.includes(category.value) 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500 shadow-lg' 
                    : 'border-gray-300 group-hover:border-purple-400 group-hover:shadow-md'
                }`}>
                  {filters.categories.includes(category.value) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className={`font-medium transition-colors duration-200 ${
                    filters.categories.includes(category.value) ? 'text-gray-900' : 'text-gray-700'
                  }`}>{category.label}</span>
                  {category.count && (
                    <span className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs font-semibold rounded-full border border-gray-300/50">
                      {category.count}
                    </span>
                  )}
                </div>
                {filters.categories.includes(category.value) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>


        {/* Actions modernes */}
        <div className="p-6">
          <button
            onClick={clearAllFilters}
            className="group w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-700 py-4 px-6 rounded-2xl transition-all duration-300 font-bold text-sm border-2 border-gray-200 hover:border-red-300 shadow-sm hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            🗑️ Réinitialiser tous les filtres
          </button>
        </div>
      </div>

      {/* Badge mobile moderne */}
      {activeFiltersCount > 0 && (
        <div className="lg:hidden p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-t border-indigo-200/50 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-indigo-700 font-semibold">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-indigo-600 hover:text-red-600 font-semibold px-3 py-1 rounded-xl hover:bg-red-50 transition-all duration-200"
            >
              ✕ Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
