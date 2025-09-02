import { useState, useRef, useEffect } from 'react';

interface MultiLevelFilterMenuProps {
  categories: string[];
  selectedCategory: string;
  priceRange: [number, number];
  maxPrice: number;
  currentSort: string;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onSortChange: (sortBy: string) => void;
  onReset: () => void;
}

const MultiLevelFilterMenu = ({
  categories,
  selectedCategory,
  priceRange,
  maxPrice,
  currentSort,
  onCategoryChange,
  onPriceRangeChange,
  onSortChange,
  onReset
}: MultiLevelFilterMenuProps) => {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMainOpen(false);
        setOpenSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const priceRanges = [
    { label: 'Tous les prix', min: 0, max: maxPrice },
    { label: 'Moins de 100 000 GNF', min: 0, max: 100000 },
    { label: '100 000 - 500 000 GNF', min: 100000, max: 500000 },
    { label: '500 000 - 1 000 000 GNF', min: 500000, max: 1000000 },
    { label: 'Plus de 1 000 000 GNF', min: 1000000, max: maxPrice }
  ];

  const sortOptions = [
    { value: 'default', label: 'Par défaut', icon: '🏠' },
    { value: 'price-asc', label: 'Prix croissant', icon: '💰' },
    { value: 'price-desc', label: 'Prix décroissant', icon: '💎' },
    { value: 'popularity', label: 'Popularité', icon: '⭐' },
    { value: 'name-asc', label: 'Nom A-Z', icon: '🔤' },
    { value: 'name-desc', label: 'Nom Z-A', icon: '🔡' }
  ];

  const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < maxPrice || currentSort !== 'default';

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (currentSort !== 'default') count++;
    return count;
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleOptionSelect = (action: () => void) => {
    action();
    setOpenSection(null);
  };

  const getCurrentCategoryLabel = () => {
    return selectedCategory === 'all' ? 'Toutes les catégories' : selectedCategory;
  };

  const getCurrentPriceLabel = () => {
    const range = priceRanges.find(r => r.min === priceRange[0] && r.max === priceRange[1]);
    return range ? range.label : 'Prix personnalisé';
  };

  const getCurrentSortLabel = () => {
    const sort = sortOptions.find(s => s.value === currentSort);
    return sort ? sort.label : 'Par défaut';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsMainOpen(!isMainOpen)}
        className={`flex items-center gap-3 px-6 py-3 rounded-lg border transition-all duration-200 ${
          hasActiveFilters
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-md'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Filtres & Tri</span>
          <span className="text-sm font-medium">
            {hasActiveFilters ? `${getActiveFiltersCount()} filtre(s) actif(s)` : 'Aucun filtre'}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isMainOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        
        {/* Badge de filtres actifs */}
        {hasActiveFilters && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {getActiveFiltersCount()}
          </div>
        )}
      </button>

      {/* Menu principal */}
      {isMainOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-4">
            
            {/* Section Catégorie */}
            <div className="mb-1">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Catégorie</div>
                    <div className="text-sm text-gray-500">{getCurrentCategoryLabel()}</div>
                  </div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSection === 'category' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Sous-menu Catégorie */}
              {openSection === 'category' && (
                <div className="mt-2 ml-8 space-y-1 max-h-40 overflow-y-auto animate-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => handleOptionSelect(() => onCategoryChange('all'))}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleOptionSelect(() => onCategoryChange(category))}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section Prix */}
            <div className="mb-1">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Prix</div>
                    <div className="text-sm text-gray-500">{getCurrentPriceLabel()}</div>
                  </div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSection === 'price' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Sous-menu Prix */}
              {openSection === 'price' && (
                <div className="mt-2 ml-8 space-y-1 animate-in slide-in-from-top-1 duration-150">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(() => onPriceRangeChange([range.min, range.max]))}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        priceRange[0] === range.min && priceRange[1] === range.max
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section Tri */}
            <div className="mb-1">
              <button
                onClick={() => toggleSection('sort')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Trier par</div>
                    <div className="text-sm text-gray-500">{getCurrentSortLabel()}</div>
                  </div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSection === 'sort' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Sous-menu Tri */}
              {openSection === 'sort' && (
                <div className="mt-2 ml-8 space-y-1 animate-in slide-in-from-top-1 duration-150">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(() => onSortChange(option.value))}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        currentSort === option.value
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-base">{option.icon}</span>
                      <span>{option.label}</span>
                      {currentSort === option.value && (
                        <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onReset();
                    setIsMainOpen(false);
                    setOpenSection(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tout effacer
                </button>
              )}
              <button
                onClick={() => {
                  setIsMainOpen(false);
                  setOpenSection(null);
                }}
                className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiLevelFilterMenu;
