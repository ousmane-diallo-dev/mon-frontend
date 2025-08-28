import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { meProfile, updateMeProfile } from "../api/axios";
import { toast } from "react-toastify";

interface UserProfile {
  nom?: string;
  prenom?: string;
  email?: string;
}


const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserProfile>({ nom: "", prenom: "", email: "" });
  const [tab, setTab] = useState<'appearance' | 'profile'>('profile');

  useEffect(() => {
    (async () => {
      try {
        const res = await meProfile();
        const userData = (res as any).data?.data || (res as any).data || {};
        setForm({ 
          nom: userData.nom || "", 
          prenom: userData.prenom || "", 
          email: userData.email || "" 
        });
        
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    console.log('🔄 Tentative de sauvegarde avec:', form);
    
    if (!form.nom?.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    
    if (!form.email?.trim()) {
      toast.error("L'email est requis");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Format d'email invalide");
      return;
    }
    
    try {
      setSaving(true);
      console.log('📤 Envoi des données vers API:', form);
      
      // Vérifier le token avant l'envoi
      const token = localStorage.getItem('token');
      console.log('🔑 Token présent:', !!token);
      
      const response = await updateMeProfile(form);
      console.log('✅ Réponse API reçue:', response);
      
      // Mettre à jour le state local avec les données sauvegardées
      const updatedData = (response as any).data?.data || (response as any).data || form;
      setForm({
        nom: updatedData.nom || form.nom,
        prenom: updatedData.prenom || form.prenom,
        email: updatedData.email || form.email
      });
      console.log('💾 Données mises à jour localement:', updatedData);
      
      // Forcer le re-render en mettant à jour explicitement les champs
      setTimeout(() => {
        console.log('🔄 État final du formulaire:', form);
      }, 100);
      
      toast.success("✅ Profil mis à jour avec succès!");
    } catch (e: any) {
      console.error('❌ Erreur sauvegarde complète:', e);
      console.error('📋 Détails erreur:', {
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        message: e?.message
      });
      
      if (e?.response?.status === 401) {
        toast.error("🔒 Session expirée, veuillez vous reconnecter");
      } else if (e?.response?.status === 403) {
        toast.error("🚫 Accès refusé");
      } else {
        toast.error(e?.response?.data?.message || "❌ Erreur lors de la sauvegarde");
      }
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header moderne avec logo ElectroPro */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 order-2 sm:order-1"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="flex-1 order-1 sm:order-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
                  {/* Logo ElectroPro moderne */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-3 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 3L4 14h6.5l-.5 4 9-11h-6.5L13 3z"/>
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        ElectroPro
                      </h1>
                      <div className="flex items-center gap-2 text-blue-100">
                        <span className="text-sm font-medium">Paramètres</span>
                        <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                        <span className="text-xs opacity-75">Configuration</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
                  🎯 Personnalisez votre expérience d'achat électronique
                </p>
              </div>
              
              {/* Badge Premium */}
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-xl px-4 py-2 order-3">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300 text-lg">👑</span>
                  <span className="text-yellow-100 font-semibold text-sm">Premium</span>
                </div>
              </div>
            </div>
            
            {/* Stats interactives */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                <div className="text-2xl sm:text-3xl font-bold mb-1 group-hover:animate-bounce">✅</div>
                <div className="text-xs sm:text-sm text-blue-100 font-medium">Profil Vérifié</div>
                <div className="text-xs text-blue-200 opacity-75 mt-1">100% Complet</div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                <div className="text-2xl sm:text-3xl font-bold mb-1 group-hover:animate-pulse">⚡</div>
                <div className="text-xs sm:text-sm text-blue-100 font-medium">Électronique</div>
                <div className="text-xs text-blue-200 opacity-75 mt-1">Spécialisé</div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 col-span-2 sm:col-span-1">
                <div className="text-2xl sm:text-3xl font-bold mb-1 group-hover:animate-spin">🎨</div>
                <div className="text-xs sm:text-sm text-blue-100 font-medium">Interface</div>
                <div className="text-xs text-blue-200 opacity-75 mt-1">Personnalisée</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation moderne avec onglets */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-2 mb-8">
          <div className="flex gap-1 justify-center">
            {[
              { id: 'profile', label: '👤 Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'appearance', label: '🎨 Apparence', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z' }
            ].map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id as any)}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  tab === tabItem.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className={`w-5 h-5 transition-transform duration-200 ${tab === tabItem.id ? 'rotate-12' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tabItem.icon} />
                </svg>
                <span className="text-base">{tabItem.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        {tab === 'profile' && (
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">👤 Informations Personnelles</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input 
                    type="text"
                    value={form.nom || ""} 
                    onChange={e => setForm({ ...form, nom: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all duration-200"
                    placeholder="Votre nom de famille"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Prénom
                  </label>
                  <input 
                    type="text"
                    value={form.prenom || ""} 
                    onChange={e => setForm({ ...form, prenom: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all duration-200"
                    placeholder="Votre prénom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Adresse email *
                  </label>
                  <input 
                    type="email"
                    value={form.email || ""} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all duration-200"
                    placeholder="votre.email@exemple.com"
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Statistiques du Compte</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Membre depuis</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Commandes</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Points fidélité</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">2,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Niveau</span>
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold">🌟 Premium</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dernière modification : {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    const currentData = { ...form };
                    setForm({ nom: "", prenom: "", email: "" });
                    toast.info("🔄 Formulaire réinitialisé");
                    console.log('Formulaire réinitialisé, anciennes données:', currentData);
                  }}
                  className="group bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  🔄 Réinitialiser
                </button>
                
                <button 
                  disabled={saving} 
                  onClick={handleSave} 
                  className="group bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Sauvegarde...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">💾 Enregistrer</span>
                      <span className="sm:hidden">💾</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'appearance' && (
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🎨 Thème et Apparence</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mode d'affichage</h3>
                <ThemeToggle />
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💡 Conseil</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Le mode sombre réduit la fatigue oculaire et économise la batterie sur les écrans OLED.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🎯 Préférences d'affichage</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Animations</span>
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      ✅ Activées
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Transitions fluides</span>
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      ✅ Activées
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Effets visuels</span>
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      ✅ Optimaux
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}




        
        {/* Footer avec bouton retour responsive */}
        <div className="mt-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                🎯 Paramètres configurés avec succès
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Vos préférences ont été sauvegardées automatiquement
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/profile')}
                className="group bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 text-indigo-700 dark:text-indigo-300 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 border-2 border-indigo-200 dark:border-indigo-700"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                👤 Mon Profil
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                ⬅️ Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


