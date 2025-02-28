import { User, Product, Order, addUser, addProduct, addOrder } from './dataService';

export const initializeData = () => {
  // Only initialize if localStorage is empty
  if (!localStorage.getItem('users') || JSON.parse(localStorage.getItem('users')!).length === 0) {
    // Create demo users
    const users: Omit<User, 'id'>[] = [
      { name: 'Admin User', email: 'admin@example.com', role: 'admin', credits: 1000 },
      { name: 'John Doe', email: 'john@example.com', role: 'user', credits: 500 },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'user', credits: 750 },
    ];
    
    const createdUsers = users.map(user => addUser(user));
    
    // Create demo products
    const products: Omit<Product, 'id'>[] = [
      {
        name: 'iPhone Unlock Service',
        description: 'Unlock any iPhone device from carrier restrictions',
        price: 49.99,
        category: 'IMEI',
      },
      {
        name: 'Android IMEI Repair',
        description: 'Fix IMEI issues on Android devices',
        price: 39.99,
        category: 'IMEI',
      },
      {
        name: 'PDF Conversion',
        description: 'Convert documents to PDF format',
        price: 9.99,
        category: 'FILE',
      },
      {
        name: 'Document Recovery',
        description: 'Recover deleted or corrupted documents',
        price: 29.99,
        category: 'FILE',
      },
      {
        name: 'VPS Hosting - Basic',
        description: 'Virtual private server with 2GB RAM and 20GB SSD',
        price: 19.99,
        category: 'SERVER',
      },
      {
        name: 'Dedicated Server Setup',
        description: 'Setup and configuration of dedicated server',
        price: 99.99,
        category: 'SERVER',
      },
      {
        name: 'Remote PC Support',
        description: 'One-time remote technical support session',
        price: 49.99,
        category: 'REMOTE',
      },
      {
        name: 'Remote Database Setup',
        description: 'Setup and configure database systems remotely',
        price: 89.99,
        category: 'REMOTE',
      },
    ];
    
    const createdProducts = products.map(product => addProduct(product));
    
    // Create demo orders
    const getRandomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    
    const statuses: ('pending' | 'processing' | 'completed')[] = ['pending', 'processing', 'completed'];
    
    const orders: Omit<Order, 'id'>[] = [];
    
    // Create 20 random orders from the past 6 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const endDate = new Date();
    
    for (let i = 0; i < 20; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const date = getRandomDate(startDate, endDate);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      orders.push({
        userId: user.id,
        productId: product.id,
        productName: product.name,
        amount: product.price,
        date: date.toISOString(),
        status,
        category: product.category,
      });
    }
    
    orders.forEach(order => addOrder(order));
  }
};
