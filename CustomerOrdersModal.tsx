import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { X, Phone, User, ShoppingBag, Calendar, ArrowRight, RefreshCw, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, validatePhone, generateWhatsAppUrl } from '../utils/helpers';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check saved customer phone in localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('mahavir_customer_info');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.phone) {
            setSavedPhone(parsed.phone);
            setPhoneInput(parsed.phone);
            if (parsed.name) setCustomerName(parsed.name);
            fetchCustomerOrders(parsed.phone);
          }
        }
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
    }
  }, [isOpen]);

  const fetchCustomerOrders = async (phone: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setErrorMsg('Failed to load past orders. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phoneInput)) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setSavedPhone(phoneInput);

    // Update localStorage
    try {
      const saved = localStorage.getItem('mahavir_customer_info');
      const existing = saved ? JSON.parse(saved) : {};
      localStorage.setItem('mahavir_customer_info', JSON.stringify({ ...existing, phone: phoneInput }));
    } catch (e) {
      console.error(e);
    }

    fetchCustomerOrders(phoneInput);
  };

  const handleSwitchUser = () => {
    setSavedPhone('');
    setOrders([]);
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-xl text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Customer Portal & Order History</h2>
              <p className="text-xs text-emerald-200">
                {savedPhone ? `Orders for +91 ${savedPhone}` : 'Enter mobile number to view history'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {!savedPhone ? (
            /* Phone Number Input Form */
            <form onSubmit={handlePhoneSubmit} className="py-6 space-y-4 max-w-sm mx-auto text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
                <Phone className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">Track Your Orders</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Enter your registered 10-digit mobile number to view past grocery orders and live status.
                </p>
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9820173042"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
                {errorMsg && <p className="text-xs text-rose-600 font-semibold mt-1">{errorMsg}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Find My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Orders History List */
            <div className="space-y-4">
              
              {/* User Bar */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">{customerName || 'Mahavir Shopper'}</span>
                    <span className="text-stone-500 text-[11px]">+91 {savedPhone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchCustomerOrders(savedPhone)}
                    className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-200 rounded-lg transition-colors"
                    title="Refresh orders"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={handleSwitchUser}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Change Number
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-stone-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  <p className="text-xs font-semibold">Loading order records...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-stone-800 text-sm">No past orders found</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    There are no grocery orders linked to mobile number +91 {savedPhone}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 hover:border-emerald-300 transition-colors"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5 text-xs">
                        <div>
                          <span className="font-black text-stone-900 text-sm">#{ord.id}</span>
                          <span className="text-[11px] text-stone-500 ml-2 font-medium">
                            {ord.formattedDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getStatusBadge(ord.status)}`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items Summary List */}
                      <div className="space-y-1.5 text-xs">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-stone-700">
                            <span className="truncate pr-2">
                              • <strong className="text-stone-900">{it.title}</strong> ({it.weight}) × {it.quantity}
                            </span>
                            <span className="font-semibold text-stone-900 flex-shrink-0">
                              {formatCurrency(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Order Details & Actions */}
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-stone-600">
                          <span>Total Paid: </span>
                          <strong className="text-emerald-800 font-extrabold text-sm">{formatCurrency(ord.totalPrice)}</strong>
                          {ord.totalDiscount > 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold ml-1.5 bg-emerald-50 px-1.5 py-0.2 rounded">
                              Saved {formatCurrency(ord.totalDiscount)}
                            </span>
                          )}
                        </div>

                        <a
                          href={generateWhatsAppUrl(ord)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1.5 rounded-xl border border-emerald-300 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>WhatsApp Receipt</span>
                        </a>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
