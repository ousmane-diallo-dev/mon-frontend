import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import ProductCard from "../components/ProductCard";

// Types
interface Product {
  _id: string;
  nom: string;
  prix: number;
  images: string[];
  categorie?: string;
  enPromotion?: boolean;
  prixPromo?: number;
  quantiteStock?: number;
  note?: number;
  nombreAvis?: number;
}

// Données de test pour les produits
const nouveautes: Product[] = [
  { 
    _id: "p1", 
    nom: "Prise murale Legrand", 
    prix: 4500, 
    images: ["/assets/prise-chic.jpg"],
    quantiteStock: 50,
    note: 4.5,
    nombreAvis: 12
  },
  { 
    _id: "p2", 
    nom: "Câble électrique 3G2.5", 
    prix: 12000, 
    images: ["/assets/cable.jpg"],
    quantiteStock: 200,
    note: 4.8,
    nombreAvis: 25
  },
  { 
    _id: "p3", 
    nom: "Interrupteur Schneider", 
    prix: 3500, 
    images: ["/assets/interrupteur-chic.jpg"],
    quantiteStock: 75,
    note: 4.6,
    nombreAvis: 18
  },
  { 
    _id: "p4", 
    nom: "Disjoncteur Hager", 
    prix: 8000, 
    images: ["/assets/disjoncteur-chic.jpg"],
    quantiteStock: 30,
    note: 4.9,
    nombreAvis: 22
  }
];

const produitsPopulaires: Product[] = [
  { 
    _id: "p5", 
    nom: "Tableau électrique", 
    prix: 25000, 
    images: ["/assets/prises.jpg"],
    quantiteStock: 15,
    note: 4.7,
    nombreAvis: 30
  },
  { 
    _id: "p6", 
    nom: "Gaine électrique", 
    prix: 1500, 
    images: ["/assets/prise-chic.jpg"],
    quantiteStock: 500,
    note: 4.4,
    nombreAvis: 45
  },
  { 
    _id: "p7", 
    nom: "Boîte de dérivation", 
    prix: 800, 
    images: ["/assets/interrupteur-chic.jpg"],
    quantiteStock: 100,
    note: 4.6,
    nombreAvis: 28
  },
  { 
    _id: "p8", 
    nom: "Douille LED", 
    prix: 2500, 
    images: ["/assets/disjoncteur-chic.jpg"],
    quantiteStock: 80,
    note: 4.8,
    nombreAvis: 35
  }
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Utiliser useCallback pour éviter la recréation de la fonction
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-slide pour le hero
    const interval = setInterval(nextSlide, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  const bannerSlides = [
    {
      title: "ElectroPro Guinée",
      subtitle: "Votre partenaire électrique de confiance",
      description: "Solutions complètes pour professionnels et particuliers • Livraison rapide • Garantie qualité",
      cta: "Découvrir nos produits",
      bgColor: "from-slate-900 via-blue-900 to-indigo-900",
      accentColor: "from-blue-500 to-cyan-400",
      image: "/assets/hero-electrical.jpg",
      badge: "🏆 N°1 en Guinée",
      stats: [
        { label: "Produits", value: "500+" },
        { label: "Clients satisfaits", value: "2000+" },
        { label: "Années d'expérience", value: "10+" }
      ]
    },
    {
      title: "Équipements Professionnels",
      subtitle: "Marques de référence mondiale",
      description: "Legrand • Schneider Electric • Hager • ABB • Siemens • Qualité certifiée",
      cta: "Voir le catalogue",
      bgColor: "from-emerald-900 via-teal-900 to-cyan-900",
      accentColor: "from-emerald-400 to-teal-400",
      image: "/assets/hero-brands.jpg",
      badge: "✅ Garantie officielle",
      stats: [
        { label: "Marques partenaires", value: "15+" },
        { label: "Références", value: "1000+" },
        { label: "Stock permanent", value: "24/7" }
      ]
    },
    {
      title: "Service Excellence",
      subtitle: "Support technique expert",
      description: "Conseil personnalisé • Installation • Maintenance • Formation • SAV réactif",
      cta: "Contactez nos experts",
      bgColor: "from-orange-900 via-red-900 to-pink-900",
      accentColor: "from-orange-400 to-yellow-400",
      image: "/assets/hero-service.jpg",
      badge: "🔧 Support 24/7",
      stats: [
        { label: "Techniciens", value: "25+" },
        { label: "Interventions/mois", value: "500+" },
        { label: "Satisfaction", value: "98%" }
      ]
    }
  ];


  return (
    <div className={`w-full min-h-screen bg-gray-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* BANNER / SLIDER (images de couleur très chic) */}
      <section className="relative h-[600px] mb-12 overflow-hidden">
        {/* Slides */}
        {bannerSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Arrière-plan avec gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor}`} />
            
            {/* Badge de promotion */}
            <div className="absolute top-8 left-8 z-20">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                {slide.badge}
              </span>
            </div>
            
            {/* Contenu principal */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="text-white space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                        {slide.title}
                      </h1>
                      <p className="text-2xl lg:text-3xl font-medium bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent">
                        {slide.subtitle}
                      </p>
                      <p className="text-xl text-gray-200 leading-relaxed">
                        {slide.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                      <Link 
                        to="/products" 
                        className={`inline-flex items-center justify-center bg-gradient-to-r ${slide.accentColor} text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-xl border-0 group`}
                      >
                        {slide.cta}
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      
                      <div className="flex items-center gap-6">
                        {slide.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="text-center">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-white/80">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Côté droit avec image et éléments visuels */}
                  <div className="hidden lg:block relative">
                    <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                      {/* Image de fond */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10" />
                      </div>
                      
                      {/* Éléments décoratifs modernes */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-4 w-80 h-80">
                          {/* Grille d'icônes électriques */}
                          {['⚡', '🔌', '💡', '🔧', '⚙️', '🛡️', '📊', '🎯', '✨'].map((icon, iconIndex) => (
                            <div
                              key={iconIndex}
                              className={`w-20 h-20 rounded-xl bg-gradient-to-br ${slide.accentColor} flex items-center justify-center text-2xl text-white shadow-lg transform transition-all duration-500 hover:scale-110`}
                              style={{
                                animationDelay: `${iconIndex * 0.1}s`,
                                animation: 'fadeInUp 0.8s ease-out forwards'
                              }}
                            >
                              {icon}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Particules flottantes */}
                      <div className="absolute top-4 right-4 w-3 h-3 bg-white/40 rounded-full animate-pulse" />
                      <div className="absolute bottom-8 left-8 w-2 h-2 bg-white/60 rounded-full animate-ping" />
                      <div className="absolute top-1/3 left-4 w-4 h-4 bg-white/30 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation dots améliorée */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Boutons de navigation */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        >
          →
        </button>
      </section>

      {/* SECTION "Nouveautés" */}
      <section className="container mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">🆕 Nouveautés</h2>
          <Link 
            to="/products" 
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nouveautes.map((product) => (
            <ProductCard 
              key={product._id} 
              produit={product} 
              variant="default"
            />
          ))}
        </div>
      </section>

      {/* SECTION "Catégories populaires" */}
      <section className="container mx-auto px-6 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">🏷️ Nos Catégories</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre large gamme de produits électriques professionnels
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { nom: "Prises & Interrupteurs", icon: "🔌", couleur: "from-blue-500 to-cyan-500", count: "150+ produits" },
            { nom: "Câbles & Fils", icon: "🔗", couleur: "from-green-500 to-emerald-500", count: "200+ produits" },
            { nom: "Tableaux Électriques", icon: "⚡", couleur: "from-purple-500 to-violet-500", count: "80+ produits" },
            { nom: "Éclairage LED", icon: "💡", couleur: "from-yellow-500 to-orange-500", count: "120+ produits" },
            { nom: "Protection", icon: "🛡️", couleur: "from-red-500 to-pink-500", count: "90+ produits" },
            { nom: "Outillage", icon: "🔧", couleur: "from-indigo-500 to-blue-500", count: "60+ produits" }
          ].map((categorie, index) => (
            <Link
              key={index}
              to="/category"
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${categorie.couleur} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                {categorie.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-center mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {categorie.nom}
              </h3>
              <p className="text-sm text-gray-500 text-center">
                {categorie.count}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION "Produits populaires" */}
      <section className="container mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">🔥 Produits populaires</h2>
          <Link 
            to="/products" 
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Voir tout →
          </Link>
        </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {produitsPopulaires.map((product) => (
          <ProductCard 
            key={product._id} 
            produit={product} 
            variant="default"
          />
        ))}
      </div>
      </section>

      {/* SECTION "Nos Avantages" */}
      <section className="bg-gradient-to-r from-gray-50 to-blue-50 py-16 mb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">✨ Pourquoi Choisir ElectroPro ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous nous engageons à vous offrir la meilleure expérience d'achat
            </p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: "🚚",
              titre: "Livraison Rapide",
              description: "Livraison gratuite à partir de 50 000 GNF",
              couleur: "from-blue-500 to-cyan-500"
            },
            {
              icon: "🛡️",
              titre: "Garantie Qualité",
              description: "Produits certifiés avec garantie officielle",
              couleur: "from-green-500 to-emerald-500"
            },
            {
              icon: "💬",
              titre: "Support 24/7",
              description: "Assistance technique et commerciale",
              couleur: "from-purple-500 to-violet-500"
            },
            {
              icon: "💳",
              titre: "Paiement Sécurisé",
              description: "Transactions 100% sécurisées",
              couleur: "from-orange-500 to-red-500"
            }
          ].map((avantage, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${avantage.couleur} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {avantage.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {avantage.titre}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {avantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* SECTION "Témoignages Clients" */}
    <section className="container mx-auto px-6 mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">💬 Ce Que Disent Nos Clients</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          La satisfaction de nos clients est notre priorité
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            nom: "Mamadou Diallo",
            profession: "Électricien",
            avis: "Excellent service ! Produits de qualité et livraison rapide. Je recommande vivement ElectroPro pour tous vos besoins électriques.",
            note: 5,
            avatar: "👨‍🔧"
          },
          {
            nom: "Fatoumata Camara",
            profession: "Architecte",
            avis: "Interface très intuitive et large choix de produits. L'équipe technique m'a beaucoup aidée dans mes projets.",
            note: 5,
            avatar: "👩‍💼"
          },
          {
            nom: "Ibrahim Touré",
            profession: "Particulier",
            avis: "Prix compétitifs et conseils professionnels. Parfait pour mes travaux de rénovation à la maison.",
            note: 4,
            avatar: "👨‍🏠"
          }
        ].map((temoignage, index) => (
          <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl mr-4">
                {temoignage.avatar}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{temoignage.nom}</h4>
                <p className="text-gray-600">{temoignage.profession}</p>
              </div>
            </div>
            
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < temoignage.note ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            
            <p className="text-gray-700 italic leading-relaxed">
              "{temoignage.avis}"
            </p>
          </div>
        ))}
      </div>
    </section>

      {/* SECTION "Newsletter & Contact Rapide" */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16 mb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Newsletter */}
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4">📧 Restez Informé</h2>
              <p className="text-xl mb-8 text-blue-100">
                Recevez nos dernières offres et nouveautés directement dans votre boîte mail
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 hover:scale-105 transform">
                  S'abonner
                </button>
              </div>
              
              <p className="text-sm text-blue-200 mt-4">
                🔒 Vos données sont protégées. Pas de spam, promis !
              </p>
            </div>
            
            {/* Contact Rapide */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">📞 Contact Rapide</h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    📱
                  </div>
                  <div>
                    <p className="font-semibold">Téléphone</p>
                    <p className="text-blue-100">+224 XX XX XX XX</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    📧
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-blue-100">contact@electropro.gn</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    📍
                  </div>
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-blue-100">Conakry, Guinée</p>
                  </div>
                </div>
              </div>
              
              <Link
                to="/contact"
                className="block w-full bg-white text-blue-600 text-center py-3 rounded-full font-bold mt-6 hover:bg-gray-100 transition-colors duration-300 hover:scale-105 transform"
              >
                Nous Contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;