import { useEffect, useState } from "react";
import { getCategories, createManyCategories } from "../api/axios";
import api from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

const CategoryList = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [bulkCategories, setBulkCategories] = useState("");
  const [bulkAdding, setBulkAdding] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchCategories = () => {
    getCategories()
      .then(res => {
        // Vérifier la structure de la réponse
        if (res.data && Array.isArray(res.data)) {
          setCategories(res.data);
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        } else {
          setCategories([]);
          console.warn("Structure de réponse inattendue:", res.data);
        }
        setLoading(false);
        setError("");
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des catégories:", err);
        const errorMessage = err.response?.data?.message || "Erreur lors du chargement des catégories";
        setError(errorMessage);
        setCategories([]);
        setLoading(false);
        toast.error(`❌ ${errorMessage}`);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateCategory = (nom: string, description: string) => {
    if (!nom.trim()) {
      toast.error("❌ Le nom de la catégorie est requis");
      return false;
    }
    if (nom.trim().length < 2) {
      toast.error("❌ Le nom doit contenir au moins 2 caractères");
      return false;
    }
    if (nom.trim().length > 120) {
      toast.error("❌ Le nom ne peut pas dépasser 120 caractères");
      return false;
    }
    if (description && description.length > 500) {
      toast.error("❌ La description ne peut pas dépasser 500 caractères");
      return false;
    }
    return true;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCategory(newCat, newDesc)) {
      return;
    }
    if (!isAdmin) {
      toast.error('Accès réservé aux administrateurs');
      return;
    }

    setAdding(true);
    try {
      const response = await api.post("/api/categories", { 
        nom: newCat.trim(), 
        description: newDesc.trim() 
      });
      
      console.log("Catégorie ajoutée:", response.data);
      toast.success("✅ Catégorie ajoutée avec succès !");
      
      setNewCat("");
      setNewDesc("");
      fetchCategories();
    } catch (err: any) {
      console.error("Erreur lors de l'ajout de la catégorie:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de l'ajout de la catégorie";
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setAdding(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!validateCategory(editValue, "")) {
      return;
    }
    if (!isAdmin) {
      toast.error('Accès réservé aux administrateurs');
      return;
    }

    setEditLoading(true);
    try {
      const response = await api.put(`/api/categories/${id}`, { 
        nom: editValue.trim() 
      });
      
      console.log("Catégorie modifiée:", response.data);
      toast.success("✅ Catégorie modifiée avec succès !");
      
      setEditId(null);
      setEditValue("");
      fetchCategories();
    } catch (err: any) {
      console.error("Erreur lors de la modification:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la modification";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAdmin) {
      toast.error('Accès réservé aux administrateurs');
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await api.delete(`/api/categories/${id}`);
      
      console.log("Catégorie supprimée:", response.data);
      toast.success("✅ Catégorie supprimée avec succès !");
      
      fetchCategories();
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBulkAddCategories = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Accès réservé aux administrateurs');
      return;
    }

    const lines = bulkCategories.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast.error('❌ Veuillez saisir au moins une catégorie');
      return;
    }

    const categories = lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        nom: parts[0],
        description: parts[1] || ""
      };
    });

    // Validation
    for (const cat of categories) {
      if (!validateCategory(cat.nom, cat.description)) {
        return;
      }
    }

    setBulkAdding(true);
    try {
      const response = await createManyCategories(categories);
      console.log("Catégories ajoutées en lot:", response.data);
      toast.success(`✅ ${categories.length} catégories ajoutées avec succès !`);
      
      setBulkCategories("");
      setShowBulkForm(false);
      fetchCategories();
    } catch (err: any) {
      console.error("Erreur lors de l'ajout en lot:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de l'ajout en lot";
      const doublons = err.response?.data?.doublons;
      
      if (doublons && doublons.length > 0) {
        toast.error(`❌ Catégories déjà existantes: ${doublons.join(', ')}`);
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
    } finally {
      setBulkAdding(false);
    }
  };

  if (loading) return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded shadow">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Chargement des catégories...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-3xl font-bold mb-6 text-blue-900">{isAdmin ? '📂 Gestion des Catégories' : '🏷️ Catégories'}</h2>
      
      {/* Formulaire d'ajout */}
      {isAdmin && (
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">➕ Ajouter des catégories</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowBulkForm(false); setBulkCategories(""); }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showBulkForm ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📝 Une par une
            </button>
            <button
              onClick={() => setShowBulkForm(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showBulkForm ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 En lot
            </button>
          </div>
        </div>

        {showBulkForm ? (
          <form onSubmit={handleBulkAddCategories} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories en lot (une par ligne) *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Format: <code>Nom de la catégorie</code> ou <code>Nom de la catégorie | Description</code>
              </p>
              <textarea
                placeholder={`Smartphones
Ordinateurs portables | Laptops et ultrabooks
Audio | Casques, écouteurs et haut-parleurs
Accessoires`}
                value={bulkCategories}
                onChange={e => setBulkCategories(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows={8}
                required
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={bulkAdding} 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Ajout en cours...
                  </>
                ) : (
                  "📋 Ajouter toutes les catégories"
                )}
              </button>
              <button
                type="button"
                onClick={() => setBulkCategories("")}
                className="bg-gray-400 text-white px-4 py-3 rounded-lg hover:bg-gray-500 transition-colors"
                disabled={bulkAdding}
              >
                🗑️ Vider
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h4 className="text-lg font-medium mb-3">Ajouter une nouvelle catégorie</h4>
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              placeholder="Ex: Smartphones, Ordinateurs, Audio..."
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={2}
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              placeholder="Description détaillée de la catégorie..."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
          </div>
          <button 
            type="submit" 
            disabled={adding} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                Ajout en cours...
              </>
            ) : (
              "➕ Ajouter la catégorie"
            )}
          </button>
        </form>
          </div>
        )}
      </div>
      )}

      {/* Liste des catégories */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold p-4 border-b bg-gray-50">📋 Catégories existantes</h3>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg m-4">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">Aucune catégorie trouvée</p>
            <p className="text-sm">Ajoutez votre première catégorie ci-dessus</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map(cat => (
              <li key={cat._id} className="p-4 hover:bg-gray-50 transition-colors">
                {isAdmin && editId === cat._id ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={editLoading}
                      minLength={2}
                      maxLength={120}
                    />
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => handleEditCategory(cat._id)}
                      disabled={editLoading}
                    >
                      {editLoading ? "Enregistrement..." : "💾 Enregistrer"}
                    </button>
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                      onClick={() => { setEditId(null); setEditValue(""); }}
                      disabled={editLoading}
                    >
                      ❌ Annuler
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-blue-700">{cat.nom}</h4>
                      {cat.description && (
                        <p className="text-gray-600 text-sm mt-1">{cat.description}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">ID: {cat._id}</p>
                    </div>
                    <div className={`flex gap-2 ${isAdmin ? '' : 'hidden'}`}>
                      <button
                        className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                        onClick={() => { setEditId(cat._id); setEditValue(cat.nom); }}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        onClick={() => handleDeleteCategory(cat._id)}
                        disabled={deleteLoading === cat._id}
                      >
                        {deleteLoading === cat._id ? "🗑️ Suppression..." : "🗑️ Supprimer"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CategoryList;
