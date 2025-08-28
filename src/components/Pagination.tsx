import { useState, useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  showItemsInfo?: boolean;
  showPageInfo?: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
  showItemsInfo = true,
  showPageInfo = true
}: PaginationProps) => {
  const [visiblePages, setVisiblePages] = useState<number[]>([]);

  useEffect(() => {
    generateVisiblePages();
  }, [currentPage, totalPages]);

  const generateVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 7; // Nombre maximum de pages visibles

    if (totalPages <= maxVisible) {
      // Si on a moins de pages que le maximum, on les affiche toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages de manière intelligente
      if (currentPage <= 4) {
        // Près du début
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // Séparateur
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Près de la fin
        pages.push(1);
        pages.push(-1); // Séparateur
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Au milieu
        pages.push(1);
        pages.push(-1); // Séparateur
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Séparateur
        pages.push(totalPages);
      }
    }

    setVisiblePages(pages);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      // Scroll vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const getStartItem = () => (currentPage - 1) * itemsPerPage + 1;
  const getEndItem = () => Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Informations sur les éléments */}
      {showItemsInfo && (
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-medium text-gray-900">{getStartItem()}</span> à{" "}
          <span className="font-medium text-gray-900">{getEndItem()}</span> sur{" "}
          <span className="font-medium text-gray-900">{totalItems}</span> produit{totalItems > 1 ? 's' : ''}
        </div>
      )}

      {/* Informations sur les pages */}
      {showPageInfo && (
        <div className="text-sm text-gray-600">
          Page <span className="font-medium text-gray-900">{currentPage}</span> sur{" "}
          <span className="font-medium text-gray-900">{totalPages}</span>
        </div>
      )}

      {/* Navigation des pages */}
      <div className="flex items-center gap-1">
        {/* Bouton Précédent */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
            currentPage === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
          }`}
          aria-label="Page précédente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Pages */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === -1 ? (
                // Séparateur
                <span className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
                    page === currentPage
                      ? "border-blue-500 bg-blue-500 text-white shadow-lg scale-105"
                      : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
          }`}
          aria-label="Page suivante"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Sélecteur de page rapide (optionnel) */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Aller à la page:</span>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Page"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  const page = parseInt(target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    target.value = '';
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;