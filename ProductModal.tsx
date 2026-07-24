import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { X, Save, Image, Tag, Scale } from 'lucide-react';
import { calculateDiscountPercent } from '../utils/helpers';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  categories: Category[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  categories
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Rice & Grains');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = categories.filter((c): c is Exclude<Category, 'All'> => c !== 'All');

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setCategory(productToEdit.category);
      setMrp(productToEdit.mrp.toString());
      setPrice(productToEdit.price.toString());
      setWeight(productToEdit.weight);
      setImage(productToEdit.image);
      setDescription(productToEdit.description);
      setInStock(productToEdit.inStock);
    } else {
      setTitle('');
      setCategory('Rice & Grains');
      setMrp('');
      setPrice('');
      setWeight('1 kg');
      setImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600');
      setDescription('');
      setInStock(true);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const calculatedDiscount = calculateDiscountPercent(Number(mrp) || 0, Number(price) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mrpNum = Number(mrp) || 0;
    const priceNum = Number(price) || 0;

    await onSave({
      title: title.trim(),
      category,
      mrp: mrpNum,
      price: priceNum,
      discountPercent: calculatedDiscount,
      weight: weight.trim() || '1 kg',
      image: image.trim() || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
      description: description.trim(),
      inStock
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <h2 className="font-bold text-base">
            {productToEdit ? 'Edit Kirana Product' : 'Add New Kirana Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Title */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fortune Basmati Rice Premium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Grocery Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<Category, 'All'>)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:border-emerald-600 focus:outline-none"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Packaging / Weight *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1 kg, 500g, 1L"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* MRP, Price & Discount Badge */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Original MRP (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="180"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="145"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-emerald-800 font-black focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Discount
              </label>
              <div className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-800 font-black rounded-xl text-center">
                {calculatedDiscount}% OFF
              </div>
            </div>
          </div>

          {/* Stock Status Switch */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-800 block">Inventory Stock Status</span>
              <span className="text-[11px] text-stone-500">Toggle whether customers can buy this product</span>
            </div>

            <button
              type="button"
              onClick={() => setInStock(!inStock)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                inStock ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {inStock ? '🟢 IN STOCK' : '🔴 OUT OF STOCK'}
            </button>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Product Description
            </label>
            <textarea
              rows={2}
              placeholder="Quality details, brand specs, grain quality..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
