import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, CartItem, Order, DeliveryType, PaymentMethod } from './types';

const logoImg = '/src/assets/images/mahavir_kirana_logo_1784916098329.jpg';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { SparkleOrderModal } from './components/SparkleOrderModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductModal } from './components/ProductModal';
import { initialProducts } from './data/initialProducts';
import { Sparkles, ShoppingBag, ShieldCheck, Phone, MapPin, Store, CheckCircle2 } from 'lucide-react';

const CATEGORIES: Category[] = [
  'All',
  'Rice & Grains',
  'Dal & Pulses',
  'Oils & Ghee',
  'Spices & Masala',
  'Snacks & Beverages',
  'Daily Essentials',
  'Personal Care'
];

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Store Info
  const [storeInfo, setStoreInfo] = useState({
    isOpen: true,
    announcement: '⚡ Special Offer: Free Express Delivery on orders above ₹500! 🌾 Pure Quality Rice, Atta & Spices at Wholesaler Prices!'
  });

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mahavir_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // View & Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return !!localStorage.getItem('mahavir_admin_token');
  });
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Sparkle Confirmation Popup Order
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Save Cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('mahavir_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  // Fetch Products & Store Info on mount
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const res = await fetch('/api/store-info');
      if (res.ok) {
        const data = await res.json();
        setStoreInfo(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStoreInfo();
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    setCart(prev => {
      if (newQty <= 0) {
        return prev.filter(item => item.product.id !== productId);
      }
      return prev.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item);
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order Placement
  const handlePlaceOrder = async (orderPayload: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryType: DeliveryType;
    paymentMethod: PaymentMethod;
  }) => {
    setIsSubmittingOrder(true);
    try {
      const payload = {
        ...orderPayload,
        items: cart.map(item => ({
          id: item.product.id,
          title: item.product.title,
          weight: item.product.weight,
          mrp: item.product.mrp,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdOrder: Order = await res.json();
        setLatestPlacedOrder(createdOrder);
        setCart([]);
        setIsCartOpen(false);
      } else {
        alert('Failed to place order. Please check your details.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Network error while placing order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Save or Edit Product in Admin
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productToEdit) {
        // Edit existing
        const res = await fetch(`/api/products/${productToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) fetchProducts();
      } else {
        // Add new
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Logout
  const handleAdminLogout = () => {
    localStorage.removeItem('mahavir_admin_token');
    setIsAdminLoggedIn(false);
    setViewMode('storefront');
  };

  // Filter & Sort Products Calculation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // In Stock filter
    if (showOnlyInStock) {
      result = result.filter(p => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'discount':
        result.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'recommended':
      default:
        result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
    }

    return result;
  }, [products, activeCategory, searchQuery, showOnlyInStock, sortBy]);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      'All': products.length,
      'Rice & Grains': 0,
      'Dal & Pulses': 0,
      'Oils & Ghee': 0,
      'Spices & Masala': 0,
      'Snacks & Beverages': 0,
      'Daily Essentials': 0,
      'Personal Care': 0
    };

    products.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    });

    return counts;
  }, [products]);

  // Cart Stats
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Cart Quantity Map for Cards
  const cartQuantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(item => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  // Render Admin Dashboard if viewMode is 'admin' and logged in
  if (viewMode === 'admin' && isAdminLoggedIn) {
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        categories={CATEGORIES}
        onOpenProductModal={(p) => {
          setProductToEdit(p);
          setIsProductModalOpen(true);
        }}
        products={products}
        onRefreshProducts={fetchProducts}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-200">
      
      {/* Sticky Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomerOrders={() => setIsCustomerOrdersOpen(true)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setViewMode('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        announcement={storeInfo.announcement}
        isOpen={storeInfo.isOpen}
      />

      {/* Category Tabs & Filter Toolbar */}
      <CategoryNav
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryCounts={categoryCounts}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showOnlyInStock={showOnlyInStock}
        setShowOnlyInStock={setShowOnlyInStock}
      />

      {/* Main Product Catalog Stage */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        
        {/* Active Search Banner or Filter Notification */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
            <span>
              Search results for: <strong className="text-emerald-950 font-extrabold">"{searchQuery}"</strong> ({filteredProducts.length} items found)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Product Grid */}
        {isLoadingProducts ? (
          <div className="py-20 text-center text-stone-400 space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold">Loading Mahavir Kirana catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 space-y-3 max-w-md mx-auto my-8">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-extrabold text-stone-800 text-base">No Kirana products found</h3>
            <p className="text-xs text-stone-500">
              Try adjusting your search keywords, clearing category filters, or turning off "In Stock Only".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setShowOnlyInStock(false);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cartQuantityMap[product.id] || 0}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateCartQuantity}
              />
            ))}
          </div>
        )}

      </main>

      {/* Floating View Cart Sticky Bar for Mobile */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-bounce">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between font-extrabold text-xs border border-emerald-600"
          >
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-stone-900 font-black px-2 py-0.5 rounded-lg text-[11px]">
                {cartCount} ITEMS
              </span>
              <span>View Grocery Basket</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span>₹{cartTotal}</span>
              <span className="text-amber-300">→</span>
            </div>
          </button>
        </div>
      )}

      {/* Store Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 py-8 px-4 mt-12 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img 
                src={logoImg} 
                alt="Mahavir Kirana Logo" 
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-md object-contain bg-amber-50 p-0.5"
              />
              <h3 className="font-extrabold text-white text-sm">Mahavir Kirana and General Store</h3>
            </div>
            <p className="text-stone-300 font-semibold text-xs mb-2">
              Your Trusted Neighborhood Supermarket & Daily Essentials
            </p>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Plot no. 31, Sukhkarta Colony, Kinetic Chowk, Ahilyanagar, MH 414001
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">STORE CONTACT NUMBERS</h4>
            <div className="space-y-1.5 text-[11px]">
              <a href="tel:+918177864419" className="text-stone-300 hover:text-amber-400 font-bold block transition-colors">
                📞 8177864419
              </a>
              <a href="https://wa.me/917304202340" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold block transition-colors">
                💬 7304202340 (WhatsApp Orders)
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">DELIVERY TERMS</h4>
            <ul className="text-stone-400 text-[11px] space-y-1">
              <li>• FREE Home Delivery on orders ≥ ₹500</li>
              <li>• Flat ₹59 Delivery Fee on orders under ₹500</li>
              <li>• Cash on Delivery (COD) & Store Pickup available</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-stone-800 text-center text-[10px] text-stone-500">
          © 2026 Mahavir Kirana and General Store. All rights reserved.
        </div>
      </footer>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        isSubmitting={isSubmittingOrder}
      />

      {/* Sparkle Order Confirmation Modal */}
      <SparkleOrderModal
        order={latestPlacedOrder}
        onClose={() => setLatestPlacedOrder(null)}
        onViewOrders={() => {
          setLatestPlacedOrder(null);
          setIsCustomerOrdersOpen(true);
        }}
      />

      {/* Customer Portal Modal */}
      <CustomerOrdersModal
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={(token) => {
          setIsAdminLoggedIn(true);
          setViewMode('admin');
        }}
      />

      {/* Product Edit/Add Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        categories={CATEGORIES}
      />

    </div>
  );
}
