import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback((path: string, forceReload: boolean = false) => {
    // Si on est déjà sur la page et qu'on force le rechargement
    if (location.pathname === path && forceReload) {
      window.location.reload();
      return;
    }
    
    // Navigation normale
    if (location.pathname !== path) {
      navigate(path);
    }
  }, [navigate, location.pathname]);

  const isActiveRoute = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const refreshCurrentPage = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    navigateTo,
    isActiveRoute,
    refreshCurrentPage,
    currentPath: location.pathname,
    navigate
  };
};
