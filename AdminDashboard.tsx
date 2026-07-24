import React, { useState, useEffect } from 'react';
import { Order, Product, Category, OrderStatus, AnalyticsStats } from '../types';
import { 
  ShoppingBag, Package, BarChart3, LogOut, Search, Filter, Phone, MessageSquare, 
  Plus, Edit, Trash2, Calendar, CheckCircle2, AlertCircle, RefreshCw, Eye, Sparkles, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { formatCurrency, generateWhatsAppUrl } from '../utils/helpers';
import { ProductModal } from './ProductModal';

interface AdminDashboardProps {
  onLogout: () => void;
  categories: Category[];
  onOpenProductModal: (prod: Product | null) => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  categories,
  onOpenProductModal,
  products,
  onRefreshProducts
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'analytics'>('orders');

  // Product Add / Edit Modal State inside Admin
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Inventory State
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<Category>('All');

  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);

  // Store Status
  const [storeIsOpen, setStoreIsOpen] = useState(true);

  // Fetch Orders
  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    }
  };

  // Poll orders and store info
  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchOrders();
      fetchAnalytics();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Product Stock Quick Action
  const handleToggleStock = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH'
      });
      if (res.ok) {
        onRefreshProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Product Modal
  const handleOpenProductModal = (prod: Product | null) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productToEdit) {
        // Edit existing product
        const res = await fetch(`/api/products/${productToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) {
          onRefreshProducts();
        } else {
          alert('Failed to update product details.');
        }
      } else {
        // Add new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) {
          onRefreshProducts();
        } else {
          alert('Failed to add product.');
        }
      }
    } catch (e) {
      console.error('Error saving product:', e);
      alert('Network error while saving product.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        if (res.ok) {
          onRefreshProducts();
        } else {
          alert('Failed to delete product.');
        }
      } catch (e) {
        console.error('Error deleting product:', e);
        alert('Network error while deleting product.');
      }
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchesQuery = !orderSearchQuery.trim() || 
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerPhone.includes(orderSearchQuery);
    return matchesStatus && matchesQuery;
  });

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCat = inventoryCategory === 'All' || p.category === inventoryCategory;
    const matchesSearch = !inventorySearch.trim() || 
      p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.description.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Confirmed': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Delivered': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelled': return 'bg-rose-100 text-rose-900 border-rose-300';
      default: return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const COLORS = ['#059669', '#d97706', '#2563eb', '#9333ea', '#e11d48', '#0891b2', '#475569'];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col">
      
      {/* Admin Top Navigation Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-stone-950 font-black shadow-inner">
              MK
            </div>
            <div>
              <h1 className="font-extrabold text-base md:text-lg leading-none">
                Mahavir Kirana <span className="text-amber-400">Owner Portal</span>
              </h1>
              <p className="text-[11px] text-stone-400 mt-0.5">Station Road Branch Admin</p>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl text-xs font-bold border border-stone-700">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.filter(o => o.status === 'Pending').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventory ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Sales Reports</span>
            </button>
          </div>

          {/* Logout & Quick Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-rose-300 hover:text-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin View Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        
        {/* TAB 1: ORDER MANAGEMENT SYSTEM */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Orders Controls Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {['All', 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => {
                  const count = st === 'All' ? orders.length : orders.filter(o => o.status === st).length;
                  const isActive = orderStatusFilter === st;

                  return (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>{st}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Order Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search order ID, name, phone..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                />
              </div>

            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-500">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h3 className="font-bold text-stone-800 text-base">No orders matching criteria</h3>
                <p className="text-xs text-stone-500 mt-1">Try resetting search query or status filter tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Order Top Banner */}
                    <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-stone-900 text-base">#{ord.id}</span>
                          <span className="text-[10px] font-bold uppercase bg-stone-200 text-stone-800 px-2 py-0.5 rounded-md">
                            {ord.deliveryType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mt-0.5">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{ord.formattedDate}</span>
                        </div>
                      </div>

                      {/* Status Selector Dropdown */}
                      <div>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className={`text-xs font-extrabold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusColor(ord.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Info & Contact Actions */}
                    <div className="p-3.5 border-b border-stone-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-stone-900 font-bold block text-sm">{ord.customerName}</strong>
                          <span className="text-stone-500 font-semibold">+91 {ord.customerPhone}</span>
                        </div>

                        {/* Direct Call & WhatsApp buttons */}
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:+91${ord.customerPhone}`}
                            className="p-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={generateWhatsAppUrl(ord, `91${ord.customerPhone}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors"
                            title="Open WhatsApp Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {ord.deliveryType === 'delivery' && (
                        <p className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/80 leading-snug">
                          📍 {ord.deliveryAddress}
                        </p>
                      )}
                    </div>

                    {/* Itemized Order List */}
                    <div className="p-3.5 text-xs space-y-1.5 flex-1 max-h-40 overflow-y-auto">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-stone-700 border-b border-stone-100 pb-1 last:border-0">
                          <span className="truncate pr-2 font-medium">
                            {it.title} <span className="text-[10px] text-stone-400">({it.weight})</span> × {it.quantity}
                          </span>
                          <span className="font-bold text-stone-900 flex-shrink-0">
                            {formatCurrency(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Total Footer */}
                    <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs font-bold">
                      <div className="text-stone-600">
                        <span>Payable Amount: </span>
                        <span className="text-stone-900 text-sm font-black">{formatCurrency(ord.totalPrice)}</span>
                      </div>

                      {ord.totalDiscount > 0 && (
                        <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md">
                          Saved ₹{ord.totalDiscount}
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PRODUCT INVENTORY MANAGER */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            
            {/* Inventory Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search Product */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search product inventory..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value as Category)}
                  className="bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Add New Product Button */}
              <button
                onClick={() => handleOpenProductModal(null)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Kirana Product</span>
              </button>

            </div>

            {/* Inventory Grid Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 font-extrabold text-stone-600 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">MRP vs Price</th>
                      <th className="p-3">Stock Switch</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                        
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-10 h-10 object-cover rounded-lg bg-stone-200 flex-shrink-0"
                            />
                            <div>
                              <strong className="font-bold text-stone-900 block leading-tight">{p.title}</strong>
                              <span className="text-[10px] text-stone-400 line-clamp-1">{p.description}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-semibold text-emerald-800">
                          {p.category}
                        </td>

                        <td className="p-3 font-bold text-stone-600">
                          {p.weight}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-stone-900">
                            {formatCurrency(p.price)}
                            <span className="text-[11px] text-stone-400 line-through ml-1 font-semibold">
                              {formatCurrency(p.mrp)}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-rose-600">
                            {p.discountPercent}% OFF
                          </span>
                        </td>

                        {/* Quick Stock Toggle */}
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleStock(p.id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all ${
                              p.inStock 
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200' 
                                : 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            {p.inStock ? '🟢 IN STOCK' : '🔴 OUT OF STOCK'}
                          </button>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="p-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: BUSINESS ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-stone-500 font-bold text-[11px] uppercase tracking-wider block">Total Sales Revenue</span>
                <p className="text-2xl font-black text-emerald-800">{formatCurrency(analytics.totalRevenue)}</p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Valid Order Earnings
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-stone-500 font-bold text-[11px] uppercase tracking-wider block">Total Orders</span>
                <p className="text-2xl font-black text-stone-900">{analytics.totalOrders}</p>
                <span className="text-[10px] text-stone-500 font-semibold">Completed & Processing</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-stone-500 font-bold text-[11px] uppercase tracking-wider block">Avg Order Value (AOV)</span>
                <p className="text-2xl font-black text-blue-700">{formatCurrency(analytics.avgOrderValue)}</p>
                <span className="text-[10px] text-stone-500 font-semibold">Per Basket Average</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-stone-500 font-bold text-[11px] uppercase tracking-wider block">Customer Savings Given</span>
                <p className="text-2xl font-black text-amber-600">{formatCurrency(analytics.totalCustomerSavings)}</p>
                <span className="text-[10px] text-amber-700 font-bold">Smart Kirana Discounts</span>
              </div>

            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sales Trend Bar Chart */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Sales Revenue Trend (₹)</span>
                </h3>

                <div className="h-64 w-full">
                  {analytics.salesTrend.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-stone-400 text-xs font-semibold">
                      No chart data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.salesTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#78716c' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Category Breakdown Pie Chart */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Category Revenue Share</span>
                </h3>

                <div className="h-64 w-full flex items-center justify-center">
                  {analytics.categoryBreakdown.length === 0 ? (
                    <div className="text-stone-400 text-xs font-semibold">No category data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="category"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {analytics.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`₹${val}`, 'Category Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Top Selling Products Table */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm">
                Top Selling Grocery Items
              </h3>

              <div className="space-y-2">
                {analytics.topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full font-black flex items-center justify-center text-[11px]">
                        #{idx + 1}
                      </span>
                      <strong className="font-bold text-stone-900">{p.title}</strong>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-stone-500 font-semibold">{p.unitsSold} units sold</span>
                      <span className="font-black text-stone-900">{formatCurrency(p.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Product Add & Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        categories={categories}
      />

    </div>
  );
};
