import React, { useState, useEffect } from 'react';
import { CartItem, CustomerInfo, DeliveryType, PaymentMethod } from '../types';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, Store, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency, validatePhone } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryType: DeliveryType;
    paymentMethod: PaymentMethod;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  isSubmitting,
}) => {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  // Load saved customer info from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mahavir_customer_info');
      if (saved) {
        const parsed: CustomerInfo = JSON.parse(saved);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.address) setDeliveryAddress(parsed.address);
      }
    } catch (e) {
      console.error('Error loading customer info:', e);
    }
  }, []);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalMrp = cartItems.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - subtotal);

  const freeDeliveryThreshold = 500;
  const deliveryFee = deliveryType === 'pickup' ? 0 : (subtotal >= freeDeliveryThreshold ? 0 : 59);
  const totalPrice = subtotal + deliveryFee;

  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string; address?: string } = {};

    if (!customerName.trim()) {
      newErrors.name = 'Please enter your full name';
    }

    if (!customerPhone.trim() || !validatePhone(customerPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      newErrors.address = 'Please enter your delivery address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Save customer info in localStorage
    try {
      const infoToSave: CustomerInfo = {
        name: customerName,
        phone: customerPhone,
        address: deliveryAddress
      };
      localStorage.setItem('mahavir_customer_info', JSON.stringify(infoToSave));
    } catch (e) {
      console.error(e);
    }

    await onPlaceOrder({
      customerName,
      customerPhone,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : 'Store Pickup',
      deliveryType,
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end transition-opacity animate-fadeIn">
      
      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Your Grocery Basket</h2>
              <p className="text-xs text-emerald-200">{cartItems.length} unique items</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {cartItems.length > 0 && (
          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                {deliveryType === 'pickup' 
                  ? 'Store Pickup Selected (No Delivery Fee)'
                  : remainingForFreeDelivery > 0
                    ? `Add ${formatCurrency(remainingForFreeDelivery)} more for FREE Delivery!`
                    : '🎉 You unlocked FREE Home Delivery!'
                }
              </span>
              <span className="text-emerald-700">{Math.round(freeDeliveryProgress)}%</span>
            </div>
            
            {deliveryType === 'delivery' && (
              <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{ width: `${freeDeliveryProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Total Savings Highlight */}
        {totalSavings > 0 && cartItems.length > 0 && (
          <div className="bg-amber-50 px-4 py-2 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Total Smart Savings on this order: {formatCurrency(totalSavings)}</span>
          </div>
        )}

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="font-bold text-stone-800 text-base mb-1">Your cart is currently empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mb-4">
                Explore our fresh grains, dals, oils, and daily essentials at wholesaler prices!
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Selected Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                  </h3>
                  <button
                    onClick={onClearCart}
                    className="text-xs font-medium text-rose-600 hover:text-rose-800"
                  >
                    Clear All
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 hover:border-stone-300 transition-colors"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-14 h-14 object-cover rounded-lg bg-stone-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {item.product.weight} • {formatCurrency(item.product.price)} each
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-stone-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        {item.product.mrp > item.product.price && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                            Saved {formatCurrency((item.product.mrp - item.product.price) * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controllers */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center bg-white border border-stone-300 rounded-lg overflow-hidden shadow-2xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:bg-stone-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:bg-stone-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Option Toggle */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Select Fulfillment Method
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      deliveryType === 'delivery'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Home Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      deliveryType === 'pickup'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Store Pickup (Free)</span>
                  </button>
                </div>
              </div>

              {/* Customer Checkout Details Form */}
              <form id="checkout-form" onSubmit={handleSubmit} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Customer Details</span>
                  <span className="text-[10px] font-normal text-stone-500">Auto-saved for next time</span>
                </h3>

                {/* Name Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Shah"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                  />
                  {errors.name && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{errors.name}</p>}
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    10-Digit WhatsApp Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9820173042"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{errors.phone}</p>}
                </div>

                {/* Delivery Address (If Home Delivery) */}
                {deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Full Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Flat/House No., Building Name, Street, Landmark..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:border-emerald-600 focus:outline-none"
                    />
                    {errors.address && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{errors.address}</p>}
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Payment Method
                  </label>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💵</span>
                      <div>
                        <strong className="font-extrabold text-emerald-950 block">
                          {deliveryType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay Cash at Store'}
                        </strong>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Pay with cash upon {deliveryType === 'delivery' ? 'receiving your delivery' : 'pickup at shop'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-700 text-white font-bold text-[10px] rounded-md uppercase tracking-wider">
                      Cash Only
                    </span>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Drawer Footer & Total Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items MRP Total:</span>
                <span className="line-through font-medium">{formatCurrency(totalMrp)}</span>
              </div>

              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Kirana Savings:</span>
                <span>-{formatCurrency(totalSavings)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
                <span className="font-extrabold text-sm">Total Payable Amount:</span>
                <span className="font-black text-lg text-emerald-800">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Placing Order...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>PLACE ORDER ({formatCurrency(totalPrice)})</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
