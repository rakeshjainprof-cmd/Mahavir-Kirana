import { Order } from '../types';

/**
 * Formats a number as Indian Rupee (₹) currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string or Date object to `DD Mon YYYY, hh:mm AM/PM`
 * Example: "24 Jul 2026, 10:45 AM"
 */
export function formatDateTime(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return 'Invalid Date';

  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  const hoursStr = hours.toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
}

/**
 * Calculates discount percentage given MRP and Selling Price
 */
export function calculateDiscountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Delivery fee calculation: Free for orders >= ₹500 or Store Pickup, else ₹79
 */
export function calculateDeliveryFee(subtotal: number, deliveryType: 'delivery' | 'pickup'): number {
  if (deliveryType === 'pickup') return 0;
  return subtotal >= 500 ? 0 : 59;
}

/**
 * Validates 10-digit Indian mobile number
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Formats clean WhatsApp order message and returns WhatsApp API URL
 */
export function generateWhatsAppUrl(order: Order, storeOwnerPhone = '917304202340'): string {
  const deliveryText = order.deliveryType === 'delivery' ? '🛵 Home Delivery' : '🏪 Store Pickup';
  const paymentText = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI / Online Payment';

  let itemsList = '';
  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    itemsList += `${index + 1}. *${item.title}* (${item.weight})\n   Qty: ${item.quantity} × ₹${item.price} = *₹${itemTotal}*\n`;
  });

  const message = 
`🛍️ *NEW ORDER - MAHAVIR KIRANA STORE*
━━━━━━━━━━━━━━━━━━━━
📌 *Order ID:* #${order.id}
📅 *Date & Time:* ${order.formattedDate || formatDateTime(order.createdAt)}

👤 *Customer Details:*
• Name: ${order.customerName}
• Phone: +91 ${order.customerPhone}
• Type: ${deliveryText}
${order.deliveryType === 'delivery' ? `• Address: ${order.deliveryAddress}` : ''}

📦 *Ordered Items:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
💰 *Bill Details:*
• Items Subtotal: ₹${order.subtotal}
• Delivery Fee: ${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
• *Total Payable: ₹${order.totalPrice}*
🎉 *TOTAL SAVINGS: ₹${order.totalDiscount}*

💳 *Payment:* ${paymentText}
━━━━━━━━━━━━━━━━━━━━
Thank you for shopping at Mahavir Kirana & General Store! 🙏`;

  return `https://wa.me/${storeOwnerPhone}?text=${encodeURIComponent(message)}`;
}
