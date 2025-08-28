import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface SearchSuggestion {
  id: string;
  type: 'product' | 'category' | 'brand';
  name: string;
  description?: string;
  image?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
}

const SearchBar = ({
  placeholder = "Rechercher un produit, une catégorie...",
  className = "",
  showSuggestions = true,
  onSearch,
  suggestions = [],
  isLoading = false
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Charger l'historique de recherche depuis localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique de recherche:', error);
      }
    }
  }, []);

  // Filtrer les suggestions basées sur la requête
  useEffect(() => {
    if (query.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8)); // Limiter à 8 suggestions
    } else {
      setFilteredSuggestions([]);
    }
  }, [query, suggestions.length]); // Utiliser suggestions.length au lieu de suggestions

  // Gérer les clics en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Ajouter à l'historique
    const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Effectuer la recherche
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }

    // Fermer les suggestions
    setIsFocused(false);
    setShowHistory(false);
    setQuery("");
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchQuery = suggestion.name;
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowHistory(false);
  };

  const removeHistoryItem = (itemToRemove: string) => {
    const newHistory = searchHistory.filter(item => item !== itemToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'category':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'brand':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Barre de recherche moderne et interactive */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
          ) : (
            <svg className="h-6 w-6 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (searchHistory.length > 0) setShowHistory(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-12 pr-32 py-4 border-2 border-indigo-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gradient-to-r from-white to-indigo-50/30 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium backdrop-blur-sm group-hover:border-indigo-300"
        />
        
        {/* Bouton de recherche moderne */}
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim() || isLoading}
          className="absolute inset-y-0 right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">Rechercher</span>
        </button>
        
        {/* Indicateur de focus */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none animate-pulse"></div>
        )}
      </div>

      {/* Suggestions et historique avec design moderne */}
      {(isFocused && (filteredSuggestions.length > 0 || showHistory)) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-3 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-2xl shadow-2xl border border-indigo-200/50 max-h-96 overflow-hidden backdrop-blur-sm animate-slideDown"
        >
          {/* Suggestions modernes */}
          {filteredSuggestions.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-700">⚡ Suggestions intelligentes</span>
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-200 text-left border border-transparent hover:border-indigo-200/50 group transform hover:scale-[1.02]"
                >
                  <div className="p-2 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors duration-200">
                      {suggestion.name}
                    </div>
                    {suggestion.description && (
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                  {suggestion.image && (
                    <img
                      src={suggestion.image}
                      alt={suggestion.name}
                      className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow duration-200"
                    />
                  )}
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Historique de recherche moderne */}
          {showHistory && searchHistory.length > 0 && (
            <div className="border-t border-indigo-100/50">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700">🕰️ Recherches récentes</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  🗑️ Effacer
                </button>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(historyItem)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all duration-200 text-left border border-transparent hover:border-emerald-200/50 group transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 truncate font-medium group-hover:text-emerald-700 transition-colors duration-200">{historyItem}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(historyItem);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;