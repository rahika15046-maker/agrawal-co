import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', price: '',
    comparePrice: '', stock: '', sku: '', brand: '',
    category: '', tags: '', isFeatured: false, isActive: true,
    metaTitle: '', metaDescription: '',
  });
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery('categories', async () => {
    const { data } = await api.get('/categories');
    return data.categories;
  });

  const { data: product } = useQuery(['product', id], async () => {
    const { data } = await api.get(`/products/${id}`);
    return data.product;
  }, { enabled: isEdit });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price?.toString() || '',
        comparePrice: product.comparePrice?.toString() || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        brand: product.brand || '',
        category: product.category?._id || '',
        tags: product.tags?.join(', ') || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      });
      setImages(product.images || []);
    }
  }, [product]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImages((prev) => [...prev, { url: data.url, publicId: data.publicId }]);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (publicId: string) => {
    try {
      await api.delete(`/upload/${encodeURIComponent(publicId)}`);
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
    } catch {
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
    }
  };

  const saveMutation = useMutation(
    async () => {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        images: images.map((img, i) => ({ ...img, isPrimary: i === 0 })),
      };
      if (isEdit) {
        return api.put(`/products/${id}`, payload);
      }
      return api.post('/products', payload);
    },
    {
      onSuccess: () => {
        toast.success(isEdit ? 'Product updated!' : 'Product created!');
        qc.invalidateQueries('admin-products');
        navigate('/products');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
    }
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input value={form.name} onChange={set('name')} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <textarea value={form.shortDescription} onChange={set('shortDescription')} rows={2} className="input resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Description *</label>
              <textarea value={form.description} onChange={set('description')} rows={5} className="input resize-none" required />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price (₹) *</label>
                <input type="number" value={form.price} onChange={set('price')} className="input" min={0} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compare Price / MRP (₹)</label>
                <input type="number" value={form.comparePrice} onChange={set('comparePrice')} className="input" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
                <input type="number" value={form.stock} onChange={set('stock')} className="input" min={0} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input value={form.sku} onChange={set('sku')} className="input" placeholder="AGR-001" />
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Images</h2>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={img.publicId} className="relative">
                  <img src={img.url} alt="" className="w-24 h-24 object-cover rounded-lg" />
                  {i === 0 && <span className="absolute top-1 left-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded">Main</span>}
                  <button
                    onClick={() => handleRemoveImage(img.publicId)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >×</button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">SEO</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Title</label>
              <input value={form.metaTitle} onChange={set('metaTitle')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea value={form.metaDescription} onChange={set('metaDescription')} rows={2} className="input resize-none" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Organization</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select value={form.category} onChange={set('category')} className="input" required>
                <option value="">Select category…</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input value={form.brand} onChange={set('brand')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={set('tags')} className="input" placeholder="sale, new, trending" />
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Settings</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm">Active (visible on store)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm">Featured product</span>
            </label>
          </div>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isLoading}
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {saveMutation.isLoading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button onClick={() => navigate('/products')} className="btn-outline w-full py-2.5">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
