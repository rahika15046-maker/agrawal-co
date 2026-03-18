import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sortOrder: '0',
    imageUrl: '',
    imagePublicId: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [], isLoading } = useQuery('categories', async () => {
    const { data } = await api.get('/categories');
    return data.categories;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, imageUrl: data.url, imagePublicId: data.publicId }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        sortOrder: form.sortOrder,
        image: form.imageUrl
          ? { url: form.imageUrl, publicId: form.imagePublicId }
          : undefined,
      };
  
      if (editing) return api.put(`/categories/${editing._id}`, payload);
      return api.post('/categories', payload);
    },
  
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created');
      qc.invalidateQueries('categories');
      setShowForm(false);
      setEditing(null);
      setForm({
        name: '',
        description: '',
        sortOrder: '0',
        imageUrl: '',
        imagePublicId: '',
      });
    },
  
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Save failed');
    },
  });
  const deleteMutation = useMutation(
    (id: string) => api.delete(`/categories/${id}`),
    {
      onSuccess: () => {
        toast.success('Category removed');
        qc.invalidateQueries('categories');
      },
    }
  );

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      sortOrder: String(cat.sortOrder || 0),
      imageUrl: cat.image?.url || '',
      imagePublicId: cat.image?.publicId || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '', sortOrder: '0', imageUrl: '', imagePublicId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="input resize-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Category Image</label>
              <div className="flex items-center gap-4">
                {form.imageUrl ? (
                  <div className="relative">
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-orange-200"
                    />
                    <button
                      onClick={() => setForm(f => ({ ...f, imageUrl: '', imagePublicId: '' }))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                    <CloudArrowUpIcon className="w-8 h-8" />
                  </div>
                )}
                <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed text-sm transition-colors ${uploading ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}`}>
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4" />
                      {form.imageUrl ? 'Change Image' : 'Upload Image'}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isLoading || uploading}
              className="btn-primary disabled:opacity-60"
            >
              {saveMutation.isLoading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button onClick={closeForm} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Image', 'Name', 'Slug', 'Description', 'Sort', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : !categories.length ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No categories yet</td></tr>
            ) : categories.map((c: any) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  {c.image?.url ? (
                    <img src={c.image.url} alt={c.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl">
                      🛒
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                <td className="px-5 py-3 text-gray-500 max-w-[150px] truncate">{c.description || '-'}</td>
                <td className="px-5 py-3 text-gray-600">{c.sortOrder}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c._id); }}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}