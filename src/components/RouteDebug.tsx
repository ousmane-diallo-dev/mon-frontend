import { useLocation, useNavigate } from 'react-router-dom';

const RouteDebug = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // N'afficher que en mode développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2 font-bold">🔍 Route Debug</div>
      <div className="mb-2">Path: {location.pathname}</div>
      <div className="mb-2">Search: {location.search}</div>
      
      <div className="mb-2 text-yellow-300">
        {location.pathname === '/' ? '🏠 Home' : 
         location.pathname.startsWith('/products') ? '📦 Products' :
         location.pathname.startsWith('/category') ? '🏷️ Categories' :
         location.pathname.startsWith('/admin') ? '👑 Admin' :
         location.pathname.startsWith('/profile') ? '👤 Profile' :
         location.pathname.startsWith('/cart') ? '🛒 Cart' :
         location.pathname.startsWith('/login') ? '🔐 Login' :
         '📍 Other'}
      </div>

      <div className="space-y-1">
        <button
          onClick={() => testNavigation('/')}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          🏠 Home
        </button>
        <button
          onClick={() => testNavigation('/products')}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          📦 Products
        </button>
        <button
          onClick={() => testNavigation('/category')}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          🏷️ Categories
        </button>
        <button
          onClick={() => testNavigation('/about')}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          ℹ️ About
        </button>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-600">
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          🔄 Reload Page
        </button>
      </div>
    </div>
  );
};

export default RouteDebug;
