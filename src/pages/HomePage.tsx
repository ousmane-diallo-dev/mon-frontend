import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/axios";

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


const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [nouveautes, setNouveautes] = useState<Product[]>([]);
  const [produitsPopulaires, setProduitsPopulaires] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Utiliser useCallback pour éviter la recréation de la fonction
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % 5);
  }, []);

  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({ params: { limit: 1000 } }) as any;
        const products = response.data?.data || response.data || [];
        
        // Traiter les catégories si elles sont des objets
        const processedProducts = products.map((p: any) => ({
          ...p,
          categorie: typeof p.categorie === 'object' && p.categorie !== null ? p.categorie.nom : p.categorie
        }));
        
        // Prendre les 4 premiers pour nouveautés et les 4 suivants pour populaires
        setNouveautes(processedProducts.slice(0, 4));
        setProduitsPopulaires(processedProducts.slice(4, 8));
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        // Garder les données de test en cas d'erreur
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
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
    },
    {
      title: "Innovation Technologique",
      subtitle: "Solutions intelligentes et connectées",
      description: "Domotique • IoT • Systèmes automatisés • Énergie renouvelable • Smart Building",
      cta: "Explorer l'innovation",
      bgColor: "from-violet-900 via-purple-900 to-fuchsia-900",
      accentColor: "from-violet-400 to-purple-400",
      image: "/assets/hero-innovation.jpg",
      badge: "🚀 Technologie avancée",
      stats: [
        { label: "Solutions IoT", value: "50+" },
        { label: "Projets smart", value: "100+" },
        { label: "Économie d'énergie", value: "40%" }
      ]
    },
    {
      title: "Partenariats Exclusifs",
      subtitle: "Distributeur officiel des plus grandes marques",
      description: "Legrand • Schneider Electric • ABB • Siemens • Hager • Prix préférentiels • Stock garanti",
      cta: "Voir nos partenaires",
      bgColor: "from-indigo-900 via-blue-900 to-cyan-900",
      accentColor: "from-indigo-400 to-blue-400",
      image: "/assets/hero-partners.jpg",
      badge: "🤝 Partenaire officiel",
      stats: [
        { label: "Marques partenaires", value: "15+" },
        { label: "Années de collaboration", value: "12+" },
        { label: "Remise exclusive", value: "25%" }
      ]
    }
  ];


  return (
    <div className={`w-full min-h-screen bg-gray-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* BANNER / CAROUSEL MODERNE */}
      <section className="relative h-[500px] md:h-[650px] lg:h-[700px] mb-12 overflow-hidden rounded-b-3xl shadow-2xl">
        {/* Particules d'arrière-plan animées */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-white/15 rounded-full blur-lg animate-ping delay-2000"></div>
        </div>

        {/* Slides */}
        {bannerSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100 translate-x-0' 
                : index < currentSlide 
                  ? 'opacity-0 scale-95 -translate-x-full' 
                  : 'opacity-0 scale-95 translate-x-full'
            }`}
          >
            {/* Arrière-plan avec gradient amélioré */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor}`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
            
            {/* Badge de promotion moderne */}
            <div className="absolute top-6 left-6 z-20 animate-fadeInDown">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative bg-white/95 backdrop-blur-md text-gray-900 px-6 py-3 rounded-full text-sm font-bold border border-white/50 shadow-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {slide.badge}
                </span>
              </div>
            </div>
            
            {/* Contenu principal amélioré */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div className="text-white space-y-6 lg:space-y-8 animate-fadeInLeft">
                    <div className="space-y-4 lg:space-y-6">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                        {slide.title}
                      </h1>
                      <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-gray-100 to-gray-200 bg-clip-text text-transparent">
                        {slide.subtitle}
                      </p>
                      <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl">
                        {slide.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                      <Link 
                        to="/products" 
                        className={`group relative inline-flex items-center justify-center bg-gradient-to-r ${slide.accentColor} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-xl border-0 overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        <span className="relative z-10 flex items-center gap-2">
                          {slide.cta}
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </Link>
                      
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        {slide.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="text-center group cursor-pointer">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                              {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Côté droit avec éléments visuels modernes */}
                  <div className="hidden lg:block relative animate-fadeInRight">
                    <div className="relative w-full h-96 xl:h-[450px]">
                      {/* Conteneur principal avec glassmorphism */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/5 rounded-3xl" />
                      </div>
                      
                      {/* Grille d'icônes électriques interactive */}
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="grid grid-cols-3 gap-3 xl:gap-4 w-full max-w-sm xl:max-w-md">
                          {['⚡', '🔌', '💡', '🔧', '⚙️', '🛡️', '📊', '🎯', '✨'].map((icon, iconIndex) => (
                            <div
                              key={iconIndex}
                              className={`group relative w-16 h-16 xl:w-20 xl:h-20 rounded-2xl bg-gradient-to-br ${slide.accentColor} flex items-center justify-center text-xl xl:text-2xl text-white shadow-xl transform transition-all duration-500 hover:scale-110 hover:rotate-3 cursor-pointer`}
                              style={{
                                animationDelay: `${iconIndex * 0.1}s`,
                                animation: 'fadeInUp 0.8s ease-out forwards'
                              }}
                            >
                              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                                {icon}
                              </span>
                              
                              {/* Effet de brillance */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Particules flottantes améliorées */}
                      <div className="absolute top-6 right-6 w-4 h-4 bg-white/50 rounded-full animate-pulse shadow-lg"></div>
                      <div className="absolute bottom-12 left-12 w-3 h-3 bg-white/70 rounded-full animate-ping shadow-md"></div>
                      <div className="absolute top-1/3 left-6 w-5 h-5 bg-white/40 rounded-full animate-bounce shadow-lg"></div>
                      <div className="absolute bottom-1/4 right-8 w-2 h-2 bg-white/60 rounded-full animate-pulse delay-1000"></div>
                      
                      {/* Cercles décoratifs */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-white/20 rounded-full animate-spin-slow"></div>
                      <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-white/10 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation dots moderne */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 h-3 bg-white rounded-full shadow-lg' 
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/75 hover:scale-125'
              }`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Boutons de navigation modernes */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + 5) % 5)}
          className="group absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-black/20 backdrop-blur-md hover:bg-black/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/20 shadow-lg"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 5)}
          className="group absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-black/20 backdrop-blur-md hover:bg-black/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/20 shadow-lg"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicateur de progression */}
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <span className="text-white/80 text-sm font-medium">
            {currentSlide + 1} / {bannerSlides.length}
          </span>
        </div>
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
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 p-4 animate-pulse bg-white">
                <div className="aspect-square rounded-lg bg-gray-200 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nouveautes.map((product) => (
              <ProductCard 
                key={product._id} 
                produit={product} 
                variant="default"
              />
            ))}
          </div>
        )}
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
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 p-4 animate-pulse bg-white">
              <div className="aspect-square rounded-lg bg-gray-200 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {produitsPopulaires.map((product) => (
            <ProductCard 
              key={product._id} 
              produit={product} 
              variant="default"
            />
          ))}
        </div>
      )}
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
    </div>
  );
};

export default HomePage;