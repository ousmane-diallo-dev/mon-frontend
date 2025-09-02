import React from 'react';

/**
 * Fonction utilitaire pour faire défiler vers le haut de la page (header)
 * @param behavior - Type d'animation ('smooth' ou 'auto')
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};

/**
 * Fonction pour gérer le clic et faire défiler vers le top
 * Compatible avec les événements de clic React
 */
export const handleScrollToTop = () => {
  scrollToTop();
};

/**
 * Hook personnalisé pour le scroll vers le top
 */
export const useScrollToTop = () => {
  return () => scrollToTop();
};

/**
 * Hook global pour ajouter automatiquement le scroll à tous les liens
 * Utilise un event listener global sur tous les éléments <a> et <Link>
 */
export const useGlobalScrollToTop = () => {
  React.useEffect(() => {
    const handleLinkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Vérifier si c'est un lien ou un bouton de navigation
      if (target.tagName === 'A' || 
          target.closest('a') || 
          target.closest('[role="button"]') ||
          target.closest('button[type="submit"]') ||
          target.hasAttribute('data-scroll-to-top')) {
        
        // Délai court pour permettre la navigation puis scroll
        setTimeout(() => {
          scrollToTop();
        }, 100);
      }
    };

    // Ajouter l'event listener global
    document.addEventListener('click', handleLinkClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);
};
