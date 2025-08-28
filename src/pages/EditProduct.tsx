import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getCategories } from '../api/axios';
import api from '../api/axios';
import { toast } from 'react-toastify';

interface Category { _id: string; nom: string }

const EditProduct: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ nom: '', prix: '', description: '', categorie: '', quantiteStock: '' });
  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          getProduct(id as string),
          getCategories({ params: { limit: 1000 } } as any)
        ]);
        const p = pRes.data?.data || pRes.data;
        setForm({
          nom: p.nom || '',
          prix: String(p.prix ?? ''),
          description: p.description || '',
          categorie: typeof p.categorie === 'object' && p.categorie ? p.categorie._id : (p.categorie || ''),
          quantiteStock: String(p.quantiteStock ?? '0')
        });
        setPreview((p.images || []).map((u: string) => u));
        const cats = Array.isArray(cRes.data?.data) ? cRes.data.data : (Array.isArray(cRes.data) ? cRes.data : []);
        setCategories(cats);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erreur chargement produit');
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    setPreview(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nom', form.nom.trim());
      fd.append('prix', form.prix.replace(',', '.'));
      fd.append('description', form.description.trim());
      fd.append('categorie', form.categorie);
      fd.append('quantiteStock', form.quantiteStock.trim() ? form.quantiteStock : '0');
      images.forEach(img => fd.append('images', img));

      await api.put(`/api/products/${id}`, fd);
      toast.success('Produit mis à jour');
      navigate('/admin/products');
    } catch (e: any) {
      const data = e?.response?.data;
      if (Array.isArray(data?.errors)) data.errors.forEach((m: string) => toast.error(m));
      else toast.error(data?.message || 'Erreur mise à jour produit');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Produit supprimé');
      navigate('/admin/products');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur suppression');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">✏️ Modifier le produit</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
          <input name="nom" value={form.nom} onChange={handleChange} className="w-full p-3 border rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix *</label>
            <input name="prix" type="number" step="0.01" value={form.prix} onChange={handleChange} className="w-full p-3 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
            <input name="quantiteStock" type="number" value={form.quantiteStock} onChange={handleChange} className="w-full p-3 border rounded" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
          <select name="categorie" value={form.categorie} onChange={handleChange} className="w-full p-3 border rounded">
            <option value="">Sélectionner</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="w-full p-3 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images (optionnel)</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {preview.map((src, idx) => (
                <img key={idx} src={src} alt="preview" className="h-24 w-full object-cover rounded" />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">🗑️ Supprimer</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded">{loading ? 'Enregistrement...' : '💾 Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
