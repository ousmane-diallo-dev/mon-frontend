import { useState, useRef, useEffect } from 'react';

interface SortOption {
  value: string;
  label: string;
  icon: string;
}

interface SimpleSortingProps {
  currentSort: string;
  onSortChange: (sortBy: string) => void;
}

const SimpleSorting = ({ currentSort, onSortChange }: SimpleSortingProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions: SortOption[] = [
    { value: 'default', label: 'Par défaut', icon: '🏠' },
    { value: 'price-asc', label: 'Prix croissant', icon: '💰' },
    { value: 'price-desc', label: 'Prix décroissant', icon: '💎' },
    { value: 'popularity', label: 'Popularité', icon: '⭐' },
    { value: 'name-asc', label: 'Nom A-Z', icon: '🔤' },
    { value: 'name-desc', label: 'Nom Z-A', icon: '🔡' }
  ];

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === currentSort);
    return option ? option.label : 'Trier par';
  };

  const getCurrentSortIcon = () => {
    const option = sortOptions.find(opt => opt.value === currentSort);
    return option ? option.icon : '📋';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
          currentSort !== 'default'
            ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
        }`}
      >
        <span className="text-lg">{getCurrentSortIcon()}</span>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Trier par</span>
          <span className="text-sm font-medium">{getCurrentSortLabel()}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100">
              Options de tri
            </div>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                  currentSort === option.value
                    ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
                {currentSort === option.value && (
                  <svg className="w-4 h-4 ml-auto text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSorting;
