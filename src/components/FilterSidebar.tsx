import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, ChevronUp, RotateCcw, Check } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  availability: 'all' | 'inStock' | 'outOfStock';
  sortBy: 'relevance' | 'name' | 'priceAsc' | 'priceDesc' | 'newest' | 'popular';
  brands: string[];
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FilterOption[];
  brands: FilterOption[];
  priceRange: [number, number];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  totalProducts: number;
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  categories,
  brands,
  priceRange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  totalProducts,
  className = ""
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    price: true,
    categories: true,
    brands: true,
    availability: true
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLocalFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
  };

  const handleCategoryToggle = (categoryValue: string) => {
    const newCategories = localFilters.categories.includes(categoryValue)
      ? localFilters.categories.filter(c => c !== categoryValue)
      : [...localFilters.categories, categoryValue];
    
    handleLocalFilterChange({ categories: newCategories });
  };

  const handleBrandToggle = (brandValue: string) => {
    const newBrands = localFilters.brands.includes(brandValue)
      ? localFilters.brands.filter(b => b !== brandValue)
      : [...localFilters.brands, brandValue];
    
    handleLocalFilterChange({ brands: newBrands });
  };

  const handlePriceChange = (index: number, value: number) => {
    const newPriceRange: [number, number] = [...localFilters.priceRange];
    newPriceRange[index] = value;
    
    // Ensure min <= max
    if (index === 0 && value > newPriceRange[1]) {
      newPriceRange[1] = value;
    } else if (index === 1 && value < newPriceRange[0]) {
      newPriceRange[0] = value;
    }
    
    handleLocalFilterChange({ priceRange: newPriceRange });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const resetFilters = () => {
    const resetState: FilterState = {
      categories: [],
      priceRange: priceRange,
      availability: 'all',
      sortBy: 'relevance',
      brands: []
    };
    setLocalFilters(resetState);
    onFiltersChange(resetState);
    onResetFilters();
  };

  const hasActiveFilters = 
    localFilters.categories.length > 0 ||
    localFilters.brands.length > 0 ||
    localFilters.availability !== 'all' ||
    localFilters.priceRange[0] !== priceRange[0] ||
    localFilters.priceRange[1] !== priceRange[1];

  const SectionHeader = ({ title, icon, section }: { title: string; icon: React.ReactNode; section: keyof typeof expandedSections }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group border border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
      )}
    </button>
  );

  const CheckboxItem = ({ 
    checked, 
    onChange, 
    label, 
    count 
  }: { 
    checked: boolean; 
    onChange: () => void; 
    label: string; 
    count?: number; 
  }) => (
    <label className="group flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          checked 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 shadow-lg' 
            : 'border-gray-300 group-hover:border-blue-400'
        }`}>
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
      <span className={`flex-1 text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
          {count}
        </span>
      )}
    </label>
  );

  const RadioItem = ({ 
    checked, 
    onChange, 
    label, 
    value 
  }: { 
    checked: boolean; 
    onChange: () => void; 
    label: string; 
    value: string; 
  }) => (
    <label className="group flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200">
      <div className="relative">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          checked 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 shadow-lg' 
            : 'border-gray-300 group-hover:border-blue-400'
        }`}>
          {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
        {label}
      </span>
    </label>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${className}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:sticky top-0 left-0 h-screen lg:h-auto
        w-80 lg:w-full
        bg-white shadow-2xl lg:shadow-lg
        z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
        overflow-y-auto
        border-r border-gray-200
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Filtres & Tri</h2>
                <p className="text-blue-100 text-sm">{totalProducts} produits</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">
                {localFilters.categories.length + localFilters.brands.length + (localFilters.availability !== 'all' ? 1 : 0)} filtres actifs
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sort Section */}
          <div className="space-y-3">
            <SectionHeader 
              title="Trier par" 
              icon={<ChevronDown className="w-4 h-4" />} 
              section="sort" 
            />
            {expandedSections.sort && (
              <div className="space-y-2 pl-4 animate-fadeIn">
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleLocalFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white text-gray-900 font-medium appearance-none cursor-pointer"
                >
                  <option value="relevance">🎯 Pertinence</option>
                  <option value="name">🔤 Nom (A-Z)</option>
                  <option value="priceAsc">💰 Prix croissant</option>
                  <option value="priceDesc">💎 Prix décroissant</option>
                  <option value="newest">⭐ Plus récents</option>
                  <option value="popular">🔥 Populaires</option>
                </select>
              </div>
            )}
          </div>

          {/* Price Range Section */}
          <div className="space-y-3">
            <SectionHeader 
              title="Prix" 
              icon={<span className="text-sm">💰</span>} 
              section="price" 
            />
            {expandedSections.price && (
              <div className="space-y-4 pl-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prix min</label>
                    <input
                      type="number"
                      value={localFilters.priceRange[0]}
                      onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                      min={priceRange[0]}
                      max={priceRange[1]}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prix max</label>
                    <input
                      type="number"
                      value={localFilters.priceRange[1]}
                      onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                      min={priceRange[0]}
                      max={priceRange[1]}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                  </div>
                </div>
                
                {/* Price Range Sliders */}
                <div className="relative">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{priceRange[0].toLocaleString()} FCFA</span>
                    <span>{priceRange[1].toLocaleString()} FCFA</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={priceRange[0]}
                      max={priceRange[1]}
                      value={localFilters.priceRange[0]}
                      onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                    <input
                      type="range"
                      min={priceRange[0]}
                      max={priceRange[1]}
                      value={localFilters.priceRange[1]}
                      onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div className="space-y-3">
            <SectionHeader 
              title="Catégories" 
              icon={<span className="text-sm">🏷️</span>} 
              section="categories" 
            />
            {expandedSections.categories && (
              <div className="space-y-1 pl-4 max-h-48 overflow-y-auto animate-fadeIn">
                {categories.map((category) => (
                  <CheckboxItem
                    key={category.value}
                    checked={localFilters.categories.includes(category.value)}
                    onChange={() => handleCategoryToggle(category.value)}
                    label={category.label}
                    count={category.count}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Brands Section */}
          {brands.length > 0 && (
            <div className="space-y-3">
              <SectionHeader 
                title="Marques" 
                icon={<span className="text-sm">🏭</span>} 
                section="brands" 
              />
              {expandedSections.brands && (
                <div className="space-y-1 pl-4 max-h-48 overflow-y-auto animate-fadeIn">
                  {brands.map((brand) => (
                    <CheckboxItem
                      key={brand.value}
                      checked={localFilters.brands.includes(brand.value)}
                      onChange={() => handleBrandToggle(brand.value)}
                      label={brand.label}
                      count={brand.count}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Availability Section */}
          <div className="space-y-3">
            <SectionHeader 
              title="Disponibilité" 
              icon={<span className="text-sm">📦</span>} 
              section="availability" 
            />
            {expandedSections.availability && (
              <div className="space-y-1 pl-4 animate-fadeIn">
                <RadioItem
                  checked={localFilters.availability === 'all'}
                  onChange={() => handleLocalFilterChange({ availability: 'all' })}
                  label="Tous les produits"
                  value="all"
                />
                <RadioItem
                  checked={localFilters.availability === 'inStock'}
                  onChange={() => handleLocalFilterChange({ availability: 'inStock' })}
                  label="En stock"
                  value="inStock"
                />
                <RadioItem
                  checked={localFilters.availability === 'outOfStock'}
                  onChange={() => handleLocalFilterChange({ availability: 'outOfStock' })}
                  label="Rupture de stock"
                  value="outOfStock"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
          <button
            onClick={applyFilters}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Appliquer les filtres
          </button>
          
          <button
            onClick={resetFilters}
            className="w-full bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 py-3 px-6 rounded-xl font-semibold transition-all duration-300 border border-gray-300 hover:border-red-300 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Réinitialiser
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
