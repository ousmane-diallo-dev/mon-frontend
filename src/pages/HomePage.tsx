import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Truck, 
  Users, 
  Award,
  Star,
  Zap,
  Lightbulb,
  Settings,
  Wrench
} from 'lucide-react';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                ElectroPro
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-normal text-blue-100">
                Matériel Électrique Professionnel
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Votre partenaire de confiance pour tous vos besoins en équipements électriques. 
              Qualité professionnelle, service d'excellence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <span className="mr-2">Se connecter</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/register"
                className="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Créer un compte
              </Link>
            </div>

            {/* Animated Icon Grid */}
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
              {[
                <Zap className="w-12 h-12" />,
                <Lightbulb className="w-12 h-12" />,
                <Settings className="w-12 h-12" />,
                <Wrench className="w-12 h-12" />
              ].map((icon, index) => (
                <div
                  key={index}
                  className="group w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 cursor-pointer border border-white/20"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animation: 'fadeInUp 0.8s ease-out forwards'
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-6 right-6 w-4 h-4 bg-white/50 rounded-full animate-pulse shadow-lg"></div>
        <div className="absolute bottom-12 left-12 w-3 h-3 bg-white/70 rounded-full animate-ping shadow-md"></div>
        <div className="absolute top-1/3 left-6 w-5 h-5 bg-white/40 rounded-full animate-bounce shadow-lg"></div>
      </section>

      {/* Services/Advantages Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🌟 Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous nous engageons à fournir des produits et services de la plus haute qualité.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="w-12 h-12" />,
                title: "Qualité Garantie",
                description: "Produits certifiés conformes aux normes internationales.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Truck className="w-12 h-12" />,
                title: "Livraison Rapide",
                description: "Expédition sur tout le territoire guinéen en 24/48h.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "Conseil d'Experts",
                description: "Notre équipe technique vous accompagne dans vos projets.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <Award className="w-12 h-12" />,
                title: "Meilleurs Prix",
                description: "Des tarifs compétitifs pour les professionnels et particuliers.",
                color: "from-orange-500 to-orange-600"
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              💬 Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La satisfaction de nos clients est notre plus grande récompense.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Moussa Camara",
                role: "Électricien Professionnel",
                content: "MN Pros est mon fournisseur n°1. Leurs produits sont fiables, les prix compétitifs et la livraison toujours à temps.",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Fatoumata Sylla",
                role: "Architecte d'intérieur",
                content: "Je trouve toujours des solutions d'éclairage modernes chez MN Pros. Leur catalogue est vaste et la qualité irréprochable.",
                rating: 5,
                avatar: "FS"
              },
              {
                name: "Ibrahima Diallo",
                role: "Chef de chantier",
                content: "Pour mes chantiers, je ne fais confiance qu'à MN Pros. Le matériel est robuste, certifié et disponible en grande quantité.",
                rating: 5,
                avatar: "ID"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;