import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct, getCategories } from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProductForm {
  nom: string;
  prix: string;
  description: string;
  categorie: string;
  quantiteStock: string;
}

interface Category {
  _id: string;
  nom: string;
  description?: string;
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductForm>({
    nom: "",
    prix: "",
    description: "",
    categorie: "",
    quantiteStock: ""
  });
  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<ProductForm & { images: string }>>({});

  // Charger les catégories avec gestion d'erreur améliorée
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getCategories({ params: { limit: 1000 } as any } as any);
      console.log("Réponse catégories:", (response as any).data);
      
      // Gérer différentes structures de réponse
      let categoriesData = [];
      if (Array.isArray((response as any).data)) {
        categoriesData = (response as any).data;
      } else if ((response as any).data && Array.isArray((response as any).data.data)) {
        categoriesData = (response as any).data.data;
      } else if ((response as any).data && Array.isArray((response as any).data.categories)) {
        categoriesData = (response as any).data.categories;
      }
      
      setCategories(categoriesData);
      console.log("Catégories chargées:", categoriesData);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      toast.error("Erreur lors du chargement des catégories");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validation des fichiers
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error(`Le fichier ${file.name} est trop volumineux (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`Le fichier ${file.name} n'est pas une image valide`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Limiter à 5 images maximum
    const totalImages = images.length + validFiles.length;
    if (totalImages > 5) {
      toast.warning("Vous ne pouvez ajouter que 5 images maximum");
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    // Créer les aperçus
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Effacer l'erreur d'images
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Partial<ProductForm & { images: string }> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du produit est requis";
    }

    if (!formData.prix.trim()) {
      newErrors.prix = "Le prix est requis";
    } else {
      const prix = parseFloat(formData.prix);
      if (isNaN(prix) || prix <= 0) {
        newErrors.prix = "Le prix doit être un nombre positif";
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (formData.description.length < 10) {
      newErrors.description = "La description doit contenir au moins 10 caractères";
    }

    if (!formData.categorie.trim()) {
      newErrors.categorie = "Veuillez sélectionner une catégorie";
    }

    if (!formData.quantiteStock.trim()) {
      newErrors.quantiteStock = "La quantité en stock est requise";
    } else {
      const stock = parseInt(formData.quantiteStock);
      if (isNaN(stock) || stock < 0) {
        newErrors.quantiteStock = "La quantité doit être un nombre positif ou zéro";
      }
    }

    if (images.length === 0) {
      newErrors.images = "Veuillez ajouter au moins une image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom.trim());
      formDataToSend.append('prix', formData.prix);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('categorie', formData.categorie);
      formDataToSend.append('quantiteStock', formData.quantiteStock);
      
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      console.log('Données envoyées:', {
        nom: formData.nom,
        prix: formData.prix,
        description: formData.description,
        categorie: formData.categorie,
        quantiteStock: formData.quantiteStock,
        imagesCount: images.length
      });

      await addProduct(formDataToSend);
      
      toast.success("✅ Produit ajouté avec succès !");
      
      // Réinitialiser le formulaire après succès
      setTimeout(() => {
        resetForm();
        navigate('/admin/products');
      }, 1500);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Erreur lors de l\'ajout du produit';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const confirmReset = window.confirm("Êtes-vous sûr de vouloir réinitialiser le formulaire ? Toutes les données saisies seront perdues.");
    
    if (confirmReset) {
      setFormData({
        nom: "",
        prix: "",
        description: "",
        categorie: "",
        quantiteStock: ""
      });
      setImages([]);
      setPreview([]);
      setErrors({});
      toast.info("🔄 Formulaire réinitialisé");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-xl mr-4 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold">Ajouter un Produit</h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Ajoutez un nouveau produit à votre catalogue
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Nom du produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Ex: iPhone 14 Pro Max"
              maxLength={100}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
          </div>

          {/* Prix et Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleInputChange}
                placeholder="Ex: 750000"
                min="0"
                step="0.01"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.prix ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.prix && <p className="text-red-500 text-sm mt-1">{errors.prix}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité en stock *
              </label>
              <input
                type="number"
                name="quantiteStock"
                value={formData.quantiteStock}
                onChange={handleInputChange}
                placeholder="Ex: 50"
                min="0"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.quantiteStock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.quantiteStock && <p className="text-red-500 text-sm mt-1">{errors.quantiteStock}</p>}
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            {categoriesLoading ? (
              <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-gray-50">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-gray-600">Chargement des catégories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-3 border border-red-300 rounded-lg bg-red-50 text-red-700">
                ⚠️ Aucune catégorie disponible. Veuillez d'abord créer des catégories.
              </div>
            ) : (
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.categorie ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.nom}
                  </option>
                ))}
              </select>
            )}
            {errors.categorie && <p className="text-red-500 text-sm mt-1">{errors.categorie}</p>}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images du produit *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Cliquez pour ajouter des images
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF jusqu'à 5MB (max 5 images)
                </p>
              </label>
            </div>

            {/* Aperçu des images */}
            {preview.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Aperçu des images ({preview.length}/5)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {preview.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Supprimer cette image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.images && <p className="text-red-500 text-sm mt-1">Veuillez ajouter au moins une image</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez le produit en détail..."
              rows={4}
              maxLength={1000}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/1000 caractères
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
            <button
              type="submit"
              disabled={loading || categoriesLoading || categories.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter le produit
                </>
              )}
            </button>
          </div>
        </form>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default AddProduct;
