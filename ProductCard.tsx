import React from 'react';
import { Product } from '../types';
import { Plus, Minus, Check, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const savings = Math.max(0, product.mrp - product.price);

  return (
    <div className={`group relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
      product.inStock 
        ? 'border-stone-200/90 hover:border-emerald-300' 
        : 'border-stone-200 bg-stone-50/60 opacity-80'
    }`}>
      
      {/* Top Image & Badges Banner */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden flex items-center justify-center">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !product.inStock ? 'grayscale opacity-75' : ''
          }`}
        />

        {/* Discount Badge */}
        {product.discountPercent > 0 && product.inStock && (
          <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{product.discountPercent}% OFF</span>
          </div>
        )}

        {/* Weight Tag */}
        <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-xs">
          {product.weight}
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3">
            <span className="bg-stone-900 text-rose-300 font-extrabold text-xs px-3 py-1.5 rounded-lg border border-rose-500/40 uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category Pill */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block mb-1.5">
            {product.category}
          </span>

          {/* Product Title */}
          <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-900 transition-colors">
            {product.title}
          </h3>

          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
            {product.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-2 border-t border-stone-100 flex items-end justify-between gap-2">
          
          {/* Pricing */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs font-semibold text-stone-400 line-through">
                  {formatCurrency(product.mrp)}
                </span>
              )}
            </div>

            {savings > 0 && (
              <p className="text-[10px] font-bold text-emerald-700">
                Save {formatCurrency(savings)}
              </p>
            )}
          </div>

          {/* Add / Quantity Button */}
          <div className="flex-shrink-0">
            {!product.inStock ? (
              <button
                disabled
                className="px-3 py-1.5 bg-stone-200 text-stone-400 font-bold text-xs rounded-xl cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : cartQuantity === 0 ? (
              <button
                onClick={() => onAddToCart(product)}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            ) : (
              <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                  className="p-2 text-emerald-800 hover:bg-emerald-200/60 active:bg-emerald-300 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-black text-xs text-emerald-950 min-w-[1.25rem] text-center">
                  {cartQuantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                  className="p-2 text-emerald-800 hover:bg-emerald-200/60 active:bg-emerald-300 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
