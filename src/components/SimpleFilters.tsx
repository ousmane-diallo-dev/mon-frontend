import { useState, useRef, useEffect } from 'react';

interface SimpleFiltersProps {
  categories: string[];
  selectedCategory: string;
  priceRange: [number, number];
  maxPrice: number;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

const SimpleFilters = ({
  categories,
  selectedCategory,
  priceRange,
  maxPrice,
  onCategoryChange,
  onPriceRangeChange,
  onReset
}: SimpleFiltersProps) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setShowPriceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const priceRanges = [
    { label: 'Tous les prix', min: 0, max: maxPrice },
    { label: 'Moins de 100 000 GNF', min: 0, max: 100000 },
    { label: '100 000 - 500 000 GNF', min: 100000, max: 500000 },
    { label: '500 000 - 1 000 000 GNF', min: 500000, max: 1000000 },
    { label: 'Plus de 1 000 000 GNF', min: 1000000, max: maxPrice }
  ];

  const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      
      {/* Titre */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <span className="font-medium text-gray-700 hidden sm:inline">Filtres :</span>
      </div>

      {/* Filtre Catégories */}
      <div className="relative" ref={categoryRef}>
        <button
          onClick={() => {
            setShowCategoryDropdown(!showCategoryDropdown);
            setShowPriceDropdown(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
            selectedCategory !== 'all'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-sm font-medium">
            {selectedCategory === 'all' ? 'Catégorie' : selectedCategory}
          </span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Catégories */}
        {showCategoryDropdown && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onCategoryChange('all');
                  setShowCategoryDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Toutes les catégories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryChange(category);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filtre Prix */}
      <div className="relative" ref={priceRef}>
        <button
          onClick={() => {
            setShowPriceDropdown(!showPriceDropdown);
            setShowCategoryDropdown(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
            priceRange[0] > 0 || priceRange[1] < maxPrice
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-sm font-medium">
            {priceRange[0] === 0 && priceRange[1] === maxPrice
              ? 'Prix'
              : `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`
            }
          </span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${showPriceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Prix */}
        {showPriceDropdown && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Gammes de prix</h4>
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onPriceRangeChange([range.min, range.max]);
                      setShowPriceDropdown(false);
                    }}
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
            </div>
          </div>
        )}
      </div>

      {/* Bouton Reset */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Effacer</span>
        </button>
      )}

      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Filtres actifs
        </div>
      )}
    </div>
  );
};

export default SimpleFilters;
