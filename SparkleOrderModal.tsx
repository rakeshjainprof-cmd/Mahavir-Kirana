import React from 'react';
import { Order } from '../types';
import { Sparkles, CheckCircle2, MessageSquare, Calendar, MapPin, Phone, User, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { formatCurrency, generateWhatsAppUrl } from '../utils/helpers';

interface SparkleOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const SparkleOrderModal: React.FC<SparkleOrderModalProps> = ({
  order,
  onClose,
  onViewOrders
}) => {
  if (!order) return null;

  const whatsappUrl = generateWhatsAppUrl(order);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 my-8">
        
        {/* Animated Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 text-center relative overflow-hidden">
          
          {/* Sparkle decorative icons */}
          <Sparkles className="absolute top-3 left-4 w-6 h-6 text-amber-300 opacity-60 animate-bounce" />
          <Sparkles className="absolute bottom-3 right-5 w-8 h-8 text-amber-400 opacity-50 animate-pulse" />

          {/* Success Check Badge */}
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-amber-300" />
          </div>

          <h2 className="text-2xl font-black tracking-tight mb-1">
            Order Placed Successfully! 🎉
          </h2>
          <p className="text-xs text-emerald-100 font-medium">
            Thank you for shopping at Mahavir Kirana Store
          </p>

          {/* Savings Highlight Pill */}
          {order.totalDiscount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-400 text-stone-900 font-black text-sm px-4 py-1.5 rounded-full shadow-lg border-2 border-white/40 animate-pulse">
              <Sparkles className="w-4 h-4 text-stone-900" />
              <span>YOU SAVED {formatCurrency(order.totalDiscount)}!</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Key Order Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/90 text-xs text-stone-700">
            <div>
              <span className="text-stone-400 font-medium">Order ID:</span>{' '}
              <span className="font-extrabold text-stone-900">#{order.id}</span>
            </div>

            <div className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>{order.formattedDate}</span>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2 text-xs">
            <h3 className="font-extrabold text-stone-800 uppercase tracking-wider text-[11px] border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              Customer & Delivery Summary
            </h3>

            <div className="grid grid-cols-2 gap-2 pt-1 text-stone-700">
              <div>
                <span className="text-stone-400 block text-[10px]">NAME</span>
                <span className="font-bold text-stone-900">{order.customerName}</span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">PHONE</span>
                <span className="font-bold text-stone-900">+91 {order.customerPhone}</span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">FULFILLMENT</span>
                <span className="font-bold text-emerald-800 capitalize">{order.deliveryType === 'delivery' ? '🛵 Home Delivery' : '🏪 Store Pickup'}</span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">PAYMENT</span>
                <span className="font-bold text-stone-900 uppercase">{order.paymentMethod}</span>
              </div>
            </div>

            {order.deliveryType === 'delivery' && (
              <div className="pt-1.5 border-t border-stone-200/60">
                <span className="text-stone-400 block text-[10px]">DELIVERY ADDRESS</span>
                <span className="font-medium text-stone-800 leading-snug">{order.deliveryAddress}</span>
              </div>
            )}
          </div>

          {/* Itemized Bill Summary */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2 text-xs">
            <h3 className="font-extrabold text-stone-800 uppercase tracking-wider text-[11px] border-b border-stone-200 pb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                Item Details ({order.items.length})
              </span>
              <span className="text-stone-900 font-bold">{formatCurrency(order.totalPrice)}</span>
            </h3>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-400 text-[11px]">{idx + 1}.</span>
                    <div>
                      <span className="font-bold text-stone-800">{item.title}</span>
                      <span className="text-[10px] text-stone-500 ml-1">({item.weight}) × {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-stone-100 border-t border-stone-200 space-y-2.5">
          
          {/* Send Order on WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-5 h-5 text-amber-300" />
            <span>SEND ORDER ON WHATSAPP</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewOrders}
              className="w-full bg-white hover:bg-stone-200 text-stone-800 font-bold text-xs py-2.5 px-3 rounded-xl border border-stone-300 transition-colors"
            >
              Track in My Orders
            </button>

            <button
              onClick={onClose}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
