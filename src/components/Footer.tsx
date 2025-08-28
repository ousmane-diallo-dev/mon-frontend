import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-blue-900 dark:bg-gray-950 text-white w-full mt-12">
    <div className="px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
      {/* Bloc 1 : Logo & Slogan */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            {/* Logo principal avec effet éclair */}
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            {/* Badge statut */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-extrabold text-xl tracking-tight">
              ElectroPro
            </span>
            <span className="text-xs text-blue-200 font-medium -mt-1">
              Électronique Premium
            </span>
          </div>
        </div>
        <p className="text-blue-100 text-sm">Votre partenaire pour tout le matériel électrique en Guinée.</p>
      </div>
      {/* Bloc 2 : Liens rapides */}
      <div>
        <h3 className="font-semibold mb-3 text-blue-100">Liens utiles</h3>
        <ul className="space-y-2">
          <li><Link to="/products" className="hover:underline hover:text-blue-300">Catalogue</Link></li>
          <li><Link to="/category" className="hover:underline hover:text-blue-300">Catégories</Link></li>
          <li><Link to="/cart" className="hover:underline hover:text-blue-300">Panier</Link></li>
          <li><Link to="/orders" className="hover:underline hover:text-blue-300">Commandes</Link></li>
          <li><Link to="/about" className="hover:underline hover:text-blue-300">À propos</Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-blue-300">Contact</Link></li>
          <li><Link to="/services" className="hover:underline hover:text-blue-300">Nos services</Link></li>
          <li><Link to="/favorites" className="hover:underline hover:text-blue-300">Favoris</Link></li>
          <li><Link to="/settings" className="hover:underline hover:text-blue-300">Paramètres</Link></li>
        </ul>
      </div>
      {/* Bloc 3 : Contact */}
      <div>
        <h3 className="font-semibold mb-3 text-blue-100">Contact</h3>
        <p className="text-sm mb-2">📍 Conakry, Guinée</p>
        <p className="text-sm mb-2">📞 +224 625 14 74 22 / +224 610 18 94</p>
        <p className="text-sm mb-2">✉️ electroproguinee@gmail.com</p>
        <div className="flex gap-3 mt-2">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Facebook</a>
          <a href="https://wa.me/224600000000" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">WhatsApp</a>
        </div>
      </div>
    </div>
    <div className="text-center text-blue-100 py-4 border-t border-blue-800 dark:border-gray-800 text-xs w-full">
      © {new Date().getFullYear()} ElectroPro. Tous droits réservés.
    </div>
  </footer>
);

export default Footer;