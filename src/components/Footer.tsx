import { Link } from "react-router-dom";

const Footer = () => {
  return (
  <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-black text-white w-full mt-12">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Bloc 1 : Logo & Slogan */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-extrabold text-2xl tracking-tight">
                ElectroPro
              </span>
              <span className="text-sm text-blue-200 font-medium -mt-1">
                Matériels Électricité
              </span>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Votre partenaire de confiance pour tous vos besoins en matériel d'électricité en Guinée. 
            Qualité professionnelle, service expert.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
               className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
              <span className="text-white font-bold">f</span>
            </a>
            <a href="https://wa.me/224625147422" target="_blank" rel="noopener noreferrer" 
               className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
              <span className="text-white font-bold">W</span>
            </a>
          </div>
        </div>
        
        {/* Bloc 2 : Liens utils */}
        <div>
          <h3 className="font-bold mb-6 text-white text-lg border-b border-blue-400 pb-2">Liens utils</h3>
          <div className="space-y-3">
            <Link to="/products" className="block text-gray-300 hover:text-white transition-colors text-sm">Catalogue</Link>
            <Link to="/cart" className="block text-gray-300 hover:text-white transition-colors text-sm">Panier</Link>
            <Link to="/orders" className="block text-gray-300 hover:text-white transition-colors text-sm">Commandes</Link>
            <Link to="/about" className="block text-gray-300 hover:text-white transition-colors text-sm">À propos</Link>
            <Link to="/contact" className="block text-gray-300 hover:text-white transition-colors text-sm">Contact</Link>
            <Link to="/favorites" className="block text-gray-300 hover:text-white transition-colors text-sm">Favoris</Link>
          </div>
        </div>
        
        {/* Bloc 3 : Contact */}
        <div>
          <h3 className="font-bold mb-6 text-white text-lg border-b border-blue-400 pb-2">Contact</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <span className="text-white text-sm">📍</span>
              </div>
              <span className="text-gray-300 text-sm">Conakry, Guinée</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <span className="text-white text-sm">📞</span>
              </div>
              <div className="text-gray-300 text-sm">
                <div>+224 625 14 74 22</div>
                <div>+224 610 18 94 18</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <span className="text-white text-sm">✉️</span>
              </div>
              <span className="text-gray-300 text-sm">electroproguinee@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="mt-12 pt-8 border-t border-gray-700">
        <div className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} ElectroPro - Matériels Électricité. Tous droits réservés.
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;