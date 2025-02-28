// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  password?: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number; // Legacy support
  prices?: Record<string, number>; // Role-based pricing
  category: string; // 'IMEI', 'FILE', 'SERVER', 'REMOTE'
  customFields?: Array<{ name: string, value: string }>;
  quantities?: Array<{ name: string, value: number }>;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  category: string;
  customFields?: Array<{ name: string, value: string }>;
  quantity?: number;
  replyCode?: string;
}

export interface TopUpRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  bankAccount: string;
  imageProof: string; // Base64 encoded image
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  notes?: string;
  processedDate?: string;
}

export interface BankDetails {
  name: string;
  banks: Array<{
    name: string;
    account: string;
    accountName: string;
  }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'order' | 'user' | 'product' | 'topup';
}

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

// Safely get and set items in localStorage with authentication preservation
const safeGetItem = (key: string): any => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const safeSetItem = (key: string, value: any): void => {
  // Preserve authentication state
  const currentUser = localStorage.getItem('currentUser');
  
  // Set the new value
  localStorage.setItem(key, JSON.stringify(value));
  
  // Restore authentication if needed
  if (!localStorage.getItem('currentUser') && currentUser) {
    localStorage.setItem('currentUser', currentUser);
  }
};

// Get roles from localStorage or use defaults
export const getAvailableRoles = () => {
  const roles = localStorage.getItem('availableRoles');
  return roles ? JSON.parse(roles) : ['user', 'premium', 'vip', 'admin'];
};

// Notifications
export const getNotifications = (): Notification[] => {
  const notifications = localStorage.getItem('notifications');
  return notifications ? JSON.parse(notifications) : [];
};

export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    timestamp: Date.now(),
    read: false,
  };
  
  // Add to the beginning of the array and limit to 20 notifications
  notifications.unshift(newNotification);
  if (notifications.length > 20) {
    notifications.pop();
  }
  
  safeSetItem('notifications', notifications);
  return newNotification;
};

// Users
export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const getUser = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

export const addUser = (user: Omit<User, 'id'>) => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: generateId(),
  };
  users.push(newUser);
  safeSetItem('users', users);
  
  // Add notification for new user signup
  addNotification({
    title: 'New User Registration',
    message: `${newUser.name} has registered as a ${newUser.role}`,
    type: 'user'
  });
  
  return newUser;
};

export const updateUser = (id: string, user: Partial<User>) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...user };
    safeSetItem('users', users);
    
    // If the updated user is the current user, update the current user in localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      if (parsedUser.id === id) {
        localStorage.setItem('currentUser', JSON.stringify(users[index]));
      }
    }
    
    return users[index];
  }
  return null;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length < users.length) {
    safeSetItem('users', filteredUsers);
    return true;
  }
  return false;
};

export const addCredits = (userId: string, amount: number) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.credits += amount;
    safeSetItem('users', users);
    return user;
  }
  return null;
};

// Bank Details
export const getBankDetails = (): BankDetails => {
  const details = localStorage.getItem('bankDetails');
  if (details) {
    return JSON.parse(details);
  }
  
  // Default bank details
  const defaultDetails: BankDetails = {
    name: "GSM-TechFixHub Corp.",
    banks: [
      { name: "Bank Central Asia (BCA)", account: "1234567890", accountName: "GSM-TechFixHub" },
      { name: "Bank Mandiri", account: "0987654321", accountName: "GSM-TechFixHub" }
    ]
  };
  
  safeSetItem('bankDetails', defaultDetails);
  return defaultDetails;
};

export const updateBankDetails = (details: BankDetails): BankDetails => {
  safeSetItem('bankDetails', details);
  return details;
};

// TopUp Requests
export const getTopUpRequests = (): TopUpRequest[] => {
  const requests = localStorage.getItem('topupRequests');
  return requests ? JSON.parse(requests) : [];
};

export const addTopUpRequest = (request: Omit<TopUpRequest, 'id' | 'date' | 'status'>) => {
  const requests = getTopUpRequests();
  const newRequest = {
    ...request,
    id: generateId(),
    date: new Date().toISOString(),
    status: 'pending',
  };
  requests.push(newRequest);
  safeSetItem('topupRequests', requests);
  
  // Add notification for new topup request
  addNotification({
    title: 'New TopUp Request',
    message: `${newRequest.userName} requested ${newRequest.amount} credits`,
    type: 'topup'
  });
  
  return newRequest;
};

export const updateTopUpRequest = (id: string, updates: Partial<TopUpRequest>) => {
  const requests = getTopUpRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    safeSetItem('topupRequests', requests);
    
    // Add notification when topup request is processed
    if (updates.status === 'approved' || updates.status === 'rejected') {
      addNotification({
        title: `TopUp Request ${updates.status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `${requests[index].userName}'s request for ${requests[index].amount} credits was ${updates.status}`,
        type: 'topup'
      });
    }
    
    return requests[index];
  }
  return null;
};

export const deleteTopUpRequest = (id: string): boolean => {
  const requests = getTopUpRequests();
  const filteredRequests = requests.filter(request => request.id !== id);
  
  if (filteredRequests.length < requests.length) {
    safeSetItem('topupRequests', filteredRequests);
    return true;
  }
  return false;
};

export const getUserTopUpRequests = (userId: string): TopUpRequest[] => {
  const requests = getTopUpRequests();
  return requests.filter(r => r.userId === userId);
};

// Products
export const getProducts = (): Product[] => {
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
};

export const addProduct = (product: Omit<Product, 'id'>) => {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: generateId(),
  };
  products.push(newProduct);
  safeSetItem('products', products);
  
  // Add notification for new product
  addNotification({
    title: 'New Product Added',
    message: `${newProduct.name} (${newProduct.category}) has been added`,
    type: 'product'
  });
  
  return newProduct;
};

export const updateProduct = (id: string, product: Partial<Product>) => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...product };
    safeSetItem('products', products);
    
    // Add notification for product update
    addNotification({
      title: 'Product Updated',
      message: `${products[index].name} has been updated`,
      type: 'product'
    });
    
    return products[index];
  }
  return null;
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const productToDelete = products.find(p => p.id === id);
  const filteredProducts = products.filter(product => product.id !== id);
  
  if (filteredProducts.length < products.length) {
    safeSetItem('products', filteredProducts);
    
    // Add notification for product deletion
    if (productToDelete) {
      addNotification({
        title: 'Product Deleted',
        message: `${productToDelete.name} has been removed`,
        type: 'product'
      });
    }
    
    return true;
  }
  return false;
};

// Orders
export const getOrders = (): Order[] => {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

export const addOrder = (order: Omit<Order, 'id'>) => {
  const orders = getOrders();
  const newOrder = {
    ...order,
    id: generateId(),
  };
  orders.push(newOrder);
  safeSetItem('orders', orders);
  
  // Add notification for new order
  addNotification({
    title: 'New Order Placed',
    message: `${order.productName} ordered for ${order.amount}`,
    type: 'order'
  });
  
  return newOrder;
};

export const updateOrder = (id: string, order: Partial<Order>) => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index !== -1) {
    const previousStatus = orders[index].status;
    orders[index] = { ...orders[index], ...order };
    safeSetItem('orders', orders);
    
    // Add notification for order status change
    if (order.status && order.status !== previousStatus) {
      addNotification({
        title: 'Order Status Changed',
        message: `Order for ${orders[index].productName} is now ${order.status}`,
        type: 'order'
      });
    }
    
    return orders[index];
  }
  return null;
};

export const deleteOrder = (id: string): boolean => {
  const orders = getOrders();
  const filteredOrders = orders.filter(order => order.id !== id);
  
  if (filteredOrders.length < orders.length) {
    safeSetItem('orders', filteredOrders);
    return true;
  }
  return false;
};

// Settings
export interface AppSettings {
  general: {
    siteTitle: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  notifications: {
    orderUpdates: boolean;
    userSignups: boolean;
    productUpdates: boolean;
    marketing: boolean;
    emailDigest: string;
  };
  appearance: {
    theme: string;
    compactMode: boolean;
    sidebarExpanded: boolean;
    highContrast: boolean;
  };
}

export const getSettings = (): AppSettings => {
  const settings = localStorage.getItem('appSettings');
  if (settings) {
    return JSON.parse(settings);
  }
  
  // Default settings
  return {
    general: {
      siteTitle: 'GSM-TechFixHub',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    notifications: {
      orderUpdates: true,
      userSignups: true,
      productUpdates: true,
      marketing: false,
      emailDigest: 'weekly'
    },
    appearance: {
      theme: 'light',
      compactMode: false,
      sidebarExpanded: true,
      highContrast: false
    }
  };
};

export const saveSettings = (settings: AppSettings): void => {
  safeSetItem('appSettings', settings);
};

export const applySettings = (settings: AppSettings): void => {
  // Apply theme
  const themeClass = settings.appearance.theme === 'dark' ? 'dark' : '';
  document.documentElement.className = themeClass;
  
  // Apply high contrast if needed
  if (settings.appearance.highContrast) {
    document.documentElement.classList.add('high-contrast');
  } else {
    document.documentElement.classList.remove('high-contrast');
  }
  
  // Apply title
  document.title = settings.general.siteTitle;
  
  // You could add other settings that need to be applied to the DOM here
};
