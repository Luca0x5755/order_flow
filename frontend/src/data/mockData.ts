export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerId: string;
  shippingAddress: string;
  phone: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
}

export const products: Product[] = [
  { id: '1', name: '無線藍牙耳機', description: '高音質藍牙5.0耳機，續航力強', price: 2990, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', isActive: true },
  { id: '2', name: '智慧手錶', description: '健康監測、運動追蹤、訊息通知', price: 4990, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop', isActive: true },
  { id: '3', name: '行動電源 20000mAh', description: '大容量快充行動電源', price: 890, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=100&h=100&fit=crop', isActive: true },
  { id: '4', name: 'USB-C 快充線', description: '100W快充支援，編織線材', price: 390, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop', isActive: true },
  { id: '5', name: '筆電支架', description: '鋁合金材質，可調節角度', price: 1290, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop', isActive: true },
  { id: '6', name: '機械鍵盤', description: 'Cherry MX軸體，RGB背光', price: 3490, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop', isActive: true },
  { id: '7', name: '無線滑鼠', description: '靜音點擊，雙模連接', price: 990, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop', isActive: true },
  { id: '8', name: '螢幕保護貼', description: '防藍光鋼化玻璃', price: 290, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100&h=100&fit=crop', isActive: false },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-12-18',
    status: 'pending',
    customerName: '王小明',
    customerId: '4',
    shippingAddress: '台北市信義區信義路五段7號',
    phone: '0912-345-678',
    notes: '請在下午配送',
    items: [
      { id: '1', productName: '無線藍牙耳機', quantity: 2, unitPrice: 2990, subtotal: 5980 },
      { id: '2', productName: 'USB-C 快充線', quantity: 3, unitPrice: 390, subtotal: 1170 },
    ],
    totalAmount: 7150,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-12-17',
    status: 'completed',
    customerName: '李美玲',
    customerId: '5',
    shippingAddress: '新北市板橋區中山路一段100號',
    phone: '0923-456-789',
    items: [
      { id: '1', productName: '智慧手錶', quantity: 1, unitPrice: 4990, subtotal: 4990 },
    ],
    totalAmount: 4990,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-12-16',
    status: 'processing',
    customerName: '張大華',
    customerId: '6',
    shippingAddress: '台中市西屯區台灣大道四段500號',
    phone: '0934-567-890',
    notes: '公司地址，請寄管理室',
    items: [
      { id: '1', productName: '機械鍵盤', quantity: 1, unitPrice: 3490, subtotal: 3490 },
      { id: '2', productName: '無線滑鼠', quantity: 1, unitPrice: 990, subtotal: 990 },
      { id: '3', productName: '筆電支架', quantity: 1, unitPrice: 1290, subtotal: 1290 },
    ],
    totalAmount: 5770,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: '2024-12-15',
    status: 'cancelled',
    customerName: '陳志偉',
    customerId: '7',
    shippingAddress: '高雄市前鎮區中山路200號',
    phone: '0945-678-901',
    items: [
      { id: '1', productName: '行動電源 20000mAh', quantity: 2, unitPrice: 890, subtotal: 1780 },
    ],
    totalAmount: 1780,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    date: '2024-12-14',
    status: 'shipped',
    customerName: '林雅婷',
    customerId: '8',
    shippingAddress: '台南市東區大學路1號',
    phone: '0956-789-012',
    items: [
      { id: '1', productName: '螢幕保護貼', quantity: 5, unitPrice: 290, subtotal: 1450 },
      { id: '2', productName: 'USB-C 快充線', quantity: 2, unitPrice: 390, subtotal: 780 },
    ],
    totalAmount: 2230,
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    date: '2024-12-13',
    status: 'completed',
    customerName: '黃建國',
    customerId: '9',
    shippingAddress: '桃園市中壢區中正路300號',
    phone: '0967-890-123',
    items: [
      { id: '1', productName: '智慧手錶', quantity: 2, unitPrice: 4990, subtotal: 9980 },
    ],
    totalAmount: 9980,
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    date: '2024-12-12',
    status: 'pending',
    customerName: '吳淑芬',
    customerId: '10',
    shippingAddress: '新竹市東區光復路二段101號',
    phone: '0978-901-234',
    notes: '禮物包裝',
    items: [
      { id: '1', productName: '無線藍牙耳機', quantity: 1, unitPrice: 2990, subtotal: 2990 },
      { id: '2', productName: '行動電源 20000mAh', quantity: 1, unitPrice: 890, subtotal: 890 },
    ],
    totalAmount: 3880,
  },
  {
    id: '8',
    orderNumber: 'ORD-2024-008',
    date: '2024-12-11',
    status: 'completed',
    customerName: '鄭明德',
    customerId: '11',
    shippingAddress: '台北市大安區忠孝東路四段100號',
    phone: '0989-012-345',
    items: [
      { id: '1', productName: '機械鍵盤', quantity: 1, unitPrice: 3490, subtotal: 3490 },
    ],
    totalAmount: 3490,
  },
];

// Statistics helpers
export const getMonthlyStats = () => {
  // Use all orders for demo purposes
  const pendingOrders = mockOrders.filter(order => order.status === 'pending');
  const totalAmount = mockOrders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    totalOrders: mockOrders.length,
    pendingOrders: pendingOrders.length,
    totalAmount,
  };
};

export const getRecentOrders = (count: number = 5) => {
  return [...mockOrders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

// Admin statistics
export const getAdminStats = () => {
  const totalRevenue = mockOrders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  
  const totalOrders = mockOrders.length;
  const newUsers = 12; // Mock new users count

  return {
    totalRevenue,
    totalOrders,
    newUsers,
  };
};

// Daily order data for charts
export const getDailyOrderData = () => {
  const days = ['12/12', '12/13', '12/14', '12/15', '12/16', '12/17', '12/18'];
  const data = days.map(day => {
    const ordersOnDay = mockOrders.filter(o => {
      const orderDay = o.date.slice(5).replace('-', '/');
      return orderDay === day;
    });
    return {
      date: day,
      orders: ordersOnDay.length,
      revenue: ordersOnDay.reduce((sum, o) => sum + o.totalAmount, 0),
    };
  });
  return data;
};
