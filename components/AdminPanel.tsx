import React, { useState } from 'react';
import { Product, PromoCode } from '../types';
import { Trash2, Plus, Edit2, X, Upload } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  promos: PromoCode[];
  headerMessage: string;
  onUpdateProducts: (products: Product[]) => void;
  onUpdatePromos: (promos: PromoCode[]) => void;
  onUpdateHeaderMessage: (msg: string) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  promos,
  headerMessage,
  onUpdateProducts,
  onUpdatePromos,
  onUpdateHeaderMessage,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'promos' | 'general'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  // Handlers for Products
  const handleDeleteProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingProduct) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.name || !editingProduct?.price) return;
    
    if (editingProduct.id) {
        // Update existing
        const updated = products.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct } as Product : p);
        onUpdateProducts(updated);
    } else {
        // Create new
        const newProduct: Product = {
            ...editingProduct as Product,
            id: Date.now().toString()
        };
        onUpdateProducts([...products, newProduct]);
    }
    setEditingProduct(null);
  };

  // Handlers for Promos
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');

  const handleAddPromo = () => {
    if (newPromoCode && newPromoDiscount) {
        onUpdatePromos([...promos, { code: newPromoCode.toUpperCase(), discountPercent: Number(newPromoDiscount) }]);
        setNewPromoCode('');
        setNewPromoDiscount('');
    }
  };

  const handleRemovePromo = (code: string) => {
    onUpdatePromos(promos.filter(p => p.code !== code));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 text-white overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif text-gold-400">CMS Admin Dashboard</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={32} />
          </button>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-700 pb-4 flex-wrap">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 ${activeTab === 'products' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-400'}`}>Products & Inventory</button>
          <button onClick={() => setActiveTab('promos')} className={`px-4 py-2 ${activeTab === 'promos' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-400'}`}>Vouchers & Discounts</button>
          <button onClick={() => setActiveTab('general')} className={`px-4 py-2 ${activeTab === 'general' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-400'}`}>General Settings</button>
        </div>

        {activeTab === 'products' && (
          <div>
             <button 
                onClick={() => setEditingProduct({ category: 'Party Wear', price: 0, name: '', description: '', imageUrl: 'https://picsum.photos/600/900' })}
                className="bg-gold-500 text-black px-4 py-2 rounded mb-4 flex items-center gap-2"
             >
                <Plus size={18} /> Add New Product
             </button>

             {editingProduct && (
                <div className="bg-gray-800 p-6 rounded mb-6 border border-gray-700">
                    <h3 className="text-xl mb-4 font-bold">{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex flex-col md:flex-row gap-4 items-start">
                             <div className="flex-1 w-full">
                                <label className="block text-gray-400 mb-1 text-sm">Product Name (Heading)</label>
                                <input 
                                    placeholder="e.g. Sapphire Evening Gown" 
                                    className="bg-gray-700 p-3 rounded text-white w-full"
                                    value={editingProduct.name || ''}
                                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                />
                             </div>
                             <div className="w-full md:w-48">
                                <label className="block text-gray-400 mb-1 text-sm">Category</label>
                                <select 
                                    className="bg-gray-700 p-3 rounded text-white w-full"
                                    value={editingProduct.category}
                                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}
                                >
                                    <option value="Party Wear">Party Wear</option>
                                    <option value="Wedding Wear">Wedding Wear</option>
                                </select>
                             </div>
                             <div className="w-full md:w-48">
                                <label className="block text-gray-400 mb-1 text-sm">Price ($)</label>
                                <input 
                                    placeholder="0.00" 
                                    type="number"
                                    className="bg-gray-700 p-3 rounded text-white w-full"
                                    value={editingProduct.price || ''}
                                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                />
                             </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-gray-400 mb-1 text-sm">Product Image</label>
                            <div className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <input 
                                        placeholder="Image URL (or use upload button)" 
                                        className="bg-gray-700 p-3 rounded text-white w-full"
                                        value={editingProduct.imageUrl || ''}
                                        onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                                    />
                                </div>
                                <label className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-pointer flex items-center gap-2">
                                    <Upload size={20} />
                                    <span className="hidden md:inline">Upload File</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                            {editingProduct.imageUrl && (
                                <img src={editingProduct.imageUrl} alt="Preview" className="mt-2 h-32 w-24 object-cover rounded border border-gray-600" />
                            )}
                        </div>

                        <div className="md:col-span-2">
                             <label className="block text-gray-400 mb-1 text-sm">Description</label>
                            <textarea 
                                placeholder="Detailed description of the item..." 
                                className="bg-gray-700 p-3 rounded text-white w-full h-32"
                                value={editingProduct.description || ''}
                                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button onClick={handleSaveProduct} className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-500">Save Product</button>
                        <button onClick={() => setEditingProduct(null)} className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-500">Cancel</button>
                    </div>
                </div>
             )}

            <div className="grid gap-4">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between bg-gray-900 p-4 rounded border border-gray-800">
                  <div className="flex items-center gap-4">
                    <img src={product.imageUrl} alt={product.name} className="w-16 h-24 object-cover rounded" />
                    <div>
                      <h4 className="font-bold text-lg">{product.name}</h4>
                      <p className="text-gold-400 font-mono">${product.price}</p>
                      <p className="text-sm text-gray-400">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProduct(product)} className="p-2 bg-gray-800 rounded hover:text-gold-400"><Edit2 size={20} /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-gray-800 rounded hover:text-red-500"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
           <div className="max-w-2xl">
               <h3 className="text-xl mb-4 font-bold">Manage Vouchers & Discounts</h3>
               <div className="flex gap-4 mb-6 p-4 bg-gray-800 rounded">
                   <div className="flex-1">
                        <label className="text-xs text-gray-400 block mb-1">Code</label>
                        <input 
                            placeholder="e.g., SUMMER10" 
                            className="bg-gray-700 p-3 rounded w-full text-white uppercase font-mono"
                            value={newPromoCode}
                            onChange={e => setNewPromoCode(e.target.value)}
                        />
                   </div>
                   <div className="w-32">
                        <label className="text-xs text-gray-400 block mb-1">Discount %</label>
                        <input 
                            placeholder="10" 
                            type="number"
                            className="bg-gray-700 p-3 rounded w-full text-white"
                            value={newPromoDiscount}
                            onChange={e => setNewPromoDiscount(e.target.value)}
                        />
                   </div>
                   <div className="flex items-end">
                       <button onClick={handleAddPromo} className="bg-gold-500 text-black px-6 py-3 font-bold rounded hover:bg-gold-400 h-[48px]">Add</button>
                   </div>
               </div>
               
               <div className="space-y-2">
                   {promos.map(promo => (
                       <div key={promo.code} className="flex justify-between items-center bg-gray-900 p-4 rounded border border-gray-800">
                           <div className="flex flex-col">
                               <span className="font-mono text-xl font-bold tracking-wider">{promo.code}</span>
                               <span className="text-gray-400 text-sm">Voucher Code</span>
                           </div>
                           <div className="flex items-center gap-6">
                               <span className="text-gold-400 font-bold text-lg">{promo.discountPercent}% OFF</span>
                               <button onClick={() => handleRemovePromo(promo.code)} className="text-red-500 hover:text-red-400 p-2 hover:bg-gray-800 rounded"><Trash2 size={20} /></button>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        )}

        {activeTab === 'general' && (
            <div className="max-w-2xl">
                <h3 className="text-xl mb-4 font-bold">Announcement Bar</h3>
                <label className="block mb-2 text-gray-400">Header Text (Shows Discounts/Updates)</label>
                <input 
                    className="w-full bg-gray-700 p-3 rounded text-white mb-4"
                    value={headerMessage}
                    onChange={(e) => onUpdateHeaderMessage(e.target.value)}
                />
            </div>
        )}
      </div>
    </div>
  );
};