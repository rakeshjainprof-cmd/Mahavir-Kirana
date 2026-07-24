import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialProducts } from './src/data/initialProducts';
import { Order, Product } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure data folder and store.json existence
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  products: Product[];
  orders: Order[];
  storeInfo: {
    isOpen: boolean;
    announcement: string;
    phone: string;
    address: string;
  };
}

const initialSeedOrders: Order[] = [];

function loadStoreData(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const loaded: StoreData = JSON.parse(raw);
      // Clean up pre-seeded mock orders and update storeInfo details
      loaded.orders = [];
      loaded.storeInfo = {
        isOpen: true,
        announcement: '⚡ Special Offer: Free Express Delivery on orders above ₹500 across Ahilyanagar! 🌾 Pure Quality Rice, Atta & Spices at Wholesaler Prices!',
        phone: '8177864419',
        address: 'Plot no. 31, Sukhkarta Colony, Kinetic Chowk, Ahilyanagar, Maharashtra - 414001',
      };
      saveStoreData(loaded);
      return loaded;
    }
  } catch (err) {
    console.error('Error reading store file, using initial data:', err);
  }

  const initialData: StoreData = {
    products: initialProducts,
    orders: [],
    storeInfo: {
      isOpen: true,
      announcement: '⚡ Special Offer: Free Express Delivery on orders above ₹500 across Ahilyanagar! 🌾 Pure Quality Rice, Atta & Spices at Wholesaler Prices!',
      phone: '8177864419',
      address: 'Plot no. 31, Sukhkarta Colony, Kinetic Chowk, Ahilyanagar, Maharashtra - 414001',
    }
  };
  saveStoreData(initialData);
  return initialData;
}

function saveStoreData(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store data:', err);
  }
}

let storeData = loadStoreData();

// --- API ENDPOINTS ---

// Store Info API
app.get('/api/store-info', (req, res) => {
  res.json(storeData.storeInfo);
});

app.patch('/api/store-info', (req, res) => {
  const { isOpen, announcement } = req.body;
  if (typeof isOpen === 'boolean') storeData.storeInfo.isOpen = isOpen;
  if (typeof announcement === 'string') storeData.storeInfo.announcement = announcement;
  saveStoreData(storeData);
  res.json({ success: true, storeInfo: storeData.storeInfo });
});

// Admin Authentication API
app.post('/api/auth/login', (req, res) => {
  const { id, password } = req.body;
  // Admin credentials explicitly specified in prompt: ID 730420 and Password 2340
  if (id === '730420' && password === '2340') {
    res.json({
      success: true,
      token: 'mahavir_admin_auth_token_730420',
      message: 'Admin authenticated successfully'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid Admin ID or Password. Please check your credentials.'
    });
  }
});

// Products API
app.get('/api/products', (req, res) => {
  res.json(storeData.products);
});

app.post('/api/products', (req, res) => {
  const newProduct: Product = {
    ...req.body,
    id: 'p_' + Date.now(),
    inStock: req.body.inStock !== false
  };
  storeData.products.unshift(newProduct);
  saveStoreData(storeData);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const index = storeData.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  storeData.products[index] = { ...storeData.products[index], ...req.body, id };
  saveStoreData(storeData);
  res.json(storeData.products[index]);
});

app.patch('/api/products/:id/stock', (req, res) => {
  const id = req.params.id;
  const product = storeData.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  product.inStock = typeof req.body.inStock === 'boolean' ? req.body.inStock : !product.inStock;
  saveStoreData(storeData);
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  storeData.products = storeData.products.filter(p => p.id !== id);
  saveStoreData(storeData);
  res.json({ success: true, message: 'Product deleted' });
});

// Orders API
app.get('/api/orders', (req, res) => {
  const phone = req.query.phone as string;
  const status = req.query.status as string;

  let filtered = [...storeData.orders];

  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    filtered = filtered.filter(o => o.customerPhone.replace(/\D/g, '') === cleanPhone);
  }

  if (status && status !== 'All') {
    filtered = filtered.filter(o => o.status === status);
  }

  // Sort latest order first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(filtered);
});

app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, deliveryAddress, deliveryType, paymentMethod, items, notes } = req.body;

  if (!customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  const randomFive = Math.floor(10000 + Math.random() * 90000);
  const orderId = `MK-${randomFive}`;

  let subtotal = 0;
  let totalMrpSum = 0;

  const processedItems = items.map((item: any) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;
    totalMrpSum += (item.mrp || item.price) * item.quantity;
    return {
      id: item.id || item.product?.id,
      title: item.title || item.product?.title,
      weight: item.weight || item.product?.weight,
      mrp: item.mrp || item.product?.mrp || item.price,
      price: item.price || item.product?.price,
      quantity: item.quantity,
      image: item.image || item.product?.image
    };
  });

  const deliveryFee = deliveryType === 'pickup' ? 0 : (subtotal >= 500 ? 0 : 59);
  const totalDiscount = Math.max(0, totalMrpSum - subtotal);
  const totalPrice = subtotal + deliveryFee;

  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

  const newOrder: Order = {
    id: orderId,
    customerName,
    customerPhone: customerPhone.replace(/\D/g, ''),
    deliveryAddress: deliveryAddress || 'Store Pickup',
    deliveryType: deliveryType || 'delivery',
    paymentMethod: paymentMethod || 'cod',
    items: processedItems,
    subtotal,
    deliveryFee,
    totalDiscount,
    totalPrice,
    status: 'Pending',
    createdAt: now.toISOString(),
    formattedDate,
    notes
  };

  storeData.orders.unshift(newOrder);
  saveStoreData(storeData);

  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const order = storeData.orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  saveStoreData(storeData);
  res.json(order);
});

// Business Analytics API
app.get('/api/analytics', (req, res) => {
  const validOrders = storeData.orders.filter(o => o.status !== 'Cancelled');

  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = validOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalCustomerSavings = validOrders.reduce((sum, o) => sum + (o.totalDiscount || 0), 0);

  // Sales Trend (Grouped by date)
  const salesMap: Record<string, { revenue: number; orders: number }> = {};
  validOrders.forEach(o => {
    const dateKey = o.createdAt ? o.createdAt.split('T')[0] : 'Today';
    if (!salesMap[dateKey]) {
      salesMap[dateKey] = { revenue: 0, orders: 0 };
    }
    salesMap[dateKey].revenue += o.totalPrice;
    salesMap[dateKey].orders += 1;
  });

  const salesTrend = Object.keys(salesMap).map(date => ({
    date: date,
    revenue: salesMap[date].revenue,
    orders: salesMap[date].orders
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Category Breakdown
  const catMap: Record<string, { value: number; count: number }> = {};
  validOrders.forEach(o => {
    o.items.forEach(item => {
      const prod = storeData.products.find(p => p.id === item.id);
      const category = prod ? prod.category : 'General Grocery';
      if (!catMap[category]) {
        catMap[category] = { value: 0, count: 0 };
      }
      catMap[category].value += item.price * item.quantity;
      catMap[category].count += item.quantity;
    });
  });

  const categoryBreakdown = Object.keys(catMap).map(cat => ({
    category: cat,
    value: catMap[cat].value,
    count: catMap[cat].count
  }));

  // Top Selling Products
  const prodMap: Record<string, { title: string; unitsSold: number; revenue: number }> = {};
  validOrders.forEach(o => {
    o.items.forEach(item => {
      if (!prodMap[item.title]) {
        prodMap[item.title] = { title: item.title, unitsSold: 0, revenue: 0 };
      }
      prodMap[item.title].unitsSold += item.quantity;
      prodMap[item.title].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(prodMap)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  res.json({
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalCustomerSavings,
    salesTrend,
    categoryBreakdown,
    topProducts
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mahavir Kirana Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
