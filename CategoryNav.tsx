import React from 'react';
import { Category } from '../types';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  categoryCounts: Record<Category, number>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showOnlyInStock: boolean;
  setShowOnlyInStock: (val: boolean) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  categoryCounts,
  sortBy,
  setSortBy,
  showOnlyInStock,
  setShowOnlyInStock
}) => {
  return (
    <div className="bg-white border-b border-stone-200 py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Horizontal Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/20'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 border border-stone-200/80'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-emerald-900 text-emerald-100'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort & In-Stock Toolbar */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-4 text-stone-600 font-medium">
            <span className="text-stone-800 font-bold">
              Showing {categoryCounts[activeCategory] || 0} items
            </span>
            
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-stone-700 select-none">
              <input
                type="checkbox"
                checked={showOnlyInStock}
                onChange={(e) => setShowOnlyInStock(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-stone-500 flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-200 text-stone-800 font-semibold rounded-lg px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="discount">Highest Discount %</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
