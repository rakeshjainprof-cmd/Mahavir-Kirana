import React, { useState } from 'react';
import { ShoppingBag, Search, X, UserCheck, ShieldCheck, MapPin, Phone } from 'lucide-react';

const logoImg = '/src/assets/images/mahavir_kirana_logo_1784916098329.jpg';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenCustomerOrders: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  announcement: string;
  isOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenCustomerOrders,
  onOpenAdmin,
  isAdminLoggedIn,
  announcement,
  isOpen
}) => {
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-xs border-b border-stone-200">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-3 sm:px-4 overflow-hidden border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Marquee Ticker Offer Message */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded tracking-wide uppercase flex-shrink-0 z-10 shadow-xs">
              STORE DEALS
            </span>
            <div className="relative overflow-hidden flex-1 py-0.5">
              <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-emerald-100 font-semibold text-[11px] sm:text-xs">
                <span>{announcement}</span>
                <span className="text-amber-400 font-black">•</span>
                <span>🚚 FREE Express Delivery on Orders ≥ ₹500 across Ahilyanagar!</span>
                <span className="text-amber-400 font-black">•</span>
                <span>🌾 Pure Basmati Rice, Chakki Atta, Pure Cow Ghee & Daily Essentials at Wholesaler Prices!</span>
                <span className="text-amber-400 font-black">•</span>
                <span>📞 Call to Order: 8177864419 | WhatsApp: 7304202340</span>
                <span className="text-amber-400 font-black">•</span>
                <span>{announcement}</span>
                <span className="text-amber-400 font-black">•</span>
                <span>🚚 FREE Express Delivery on Orders ≥ ₹500 across Ahilyanagar!</span>
                <span className="text-amber-400 font-black">•</span>
                <span>🌾 Pure Basmati Rice, Chakki Atta, Pure Cow Ghee & Daily Essentials at Wholesaler Prices!</span>
                <span className="text-amber-400 font-black">•</span>
                <span>📞 Call to Order: 8177864419 | WhatsApp: 7304202340</span>
                <span className="text-amber-400 font-black">•</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Timings */}
          <div className="hidden md:flex items-center gap-4 text-[11px] text-emerald-200 flex-shrink-0">
            <a href="tel:+918177864419" className="flex items-center gap-1 hover:text-amber-300 transition-colors">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>8177864419</span>
            </a>
            <a href="https://wa.me/917304202340" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-amber-300 transition-colors">
              <span className="text-emerald-400 font-bold">💬</span>
              <span>7304202340</span>
            </a>
            <div 
              className="relative flex items-center gap-1 cursor-pointer hover:text-white"
              onMouseEnter={() => setShowLocationTooltip(true)}
              onMouseLeave={() => setShowLocationTooltip(false)}
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="max-w-[280px] lg:max-w-none truncate">Kinetic Chowk, Ahilyanagar</span>
              
              {showLocationTooltip && (
                <div className="absolute right-0 top-6 z-50 bg-stone-900 text-white text-xs p-3 rounded-xl shadow-xl border border-stone-700 w-72 whitespace-normal">
                  <p className="font-bold text-amber-400 mb-1">Mahavir Kirana and General Store</p>
                  <p className="text-stone-300 text-[11px] leading-relaxed">Plot no. 31, Sukhkarta Colony, Kinetic Chowk, Ahilyanagar, Maharashtra - 414001</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img 
              src={logoImg} 
              alt="Mahavir Kirana Logo" 
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain shadow-xs border border-amber-200/60 bg-amber-50/50 p-0.5"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-black text-base sm:text-lg md:text-xl text-stone-900 tracking-tight leading-none whitespace-nowrap">
                  Mahavir <span className="text-emerald-800">Kirana</span>
                </h1>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold ${
                  isOpen ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`}></span>
                  {isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-stone-500 truncate max-w-[140px] sm:max-w-none mt-0.5">
                Ahilyanagar • Quality Provisions
              </p>
            </div>
          </div>

          {/* Live Search Bar (Desktop / Tablet) */}
          <div className="hidden sm:block flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search rice, atta, oil, spices, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-stone-100 border border-stone-200 focus:border-emerald-700 focus:bg-white focus:outline-none rounded-xl text-xs md:text-sm text-stone-900 placeholder-stone-400 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full hover:bg-stone-200"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* My Orders Button */}
            <button
              onClick={onOpenCustomerOrders}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-stone-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold border border-stone-200 transition-colors"
              title="Track My Orders"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span className="hidden lg:inline">My Orders</span>
            </button>

            {/* Owner Admin Trigger */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isAdminLoggedIn 
                  ? 'bg-amber-100 text-stone-900 border-amber-400' 
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
              }`}
              title={isAdminLoggedIn ? "Open Admin Panel" : "Owner Login"}
            >
              <ShieldCheck className={`w-4 h-4 ${isAdminLoggedIn ? 'text-amber-700' : 'text-stone-500'}`} />
              <span className="hidden sm:inline">{isAdminLoggedIn ? 'Admin' : 'Admin'}</span>
            </button>

            {/* Active Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:bg-black text-amber-300 px-3 py-2 sm:px-3.5 rounded-xl font-black text-xs md:text-sm shadow-md transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-400 text-stone-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-emerald-900">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline border-l border-emerald-700 pl-2 text-white">
                ₹{cartTotal}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar (Visible only on mobile screens below sm) */}
        <div className="mt-2 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search rice, atta, oil, spices, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-stone-100 border border-stone-200 focus:border-emerald-700 focus:bg-white focus:outline-none rounded-xl text-xs text-stone-900 placeholder-stone-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

