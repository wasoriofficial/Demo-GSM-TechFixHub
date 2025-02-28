import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getProducts, getUserTopUpRequests } from '../../utils/dataService';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import UserLayout from './UserLayout';
import { CreditCard, Package, ShoppingCart } from 'lucide-react';
import TopUpCreditsModal from './TopUpCreditsModal';

const UserDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [topupRequests, setTopupRequests] = useState<any[]>([]);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Get products
      const allProducts = getProducts();
      setProducts(allProducts);

      // Get user's orders
      const allOrders = getOrders();
      const userOrders = allOrders.filter(order => order.userId === user.id);
      setOrders(userOrders);

      // Get topup requests
      const userTopupRequests = getUserTopUpRequests(user.id);
      setTopupRequests(userTopupRequests);
    }
  }, [user]);

  // Format to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl">
                {user?.name.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                  user?.role === 'premium' ? 'bg-blue-100 text-blue-800' :
                  user?.role === 'vip' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'}`}>
                  {user?.role.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <CreditCard size={16} className="text-emerald-600" />
                  Credit Balance: <span className="font-semibold">{formatIDR(user?.credits || 0)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Orders</h2>
              <Link to="/user/orders" className="text-blue-600 text-sm hover:underline">View All</Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="text-blue-600" size={24} />
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-lg font-semibold">
                  {formatIDR(orders.reduce((sum, order) => sum + order.amount, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Available Services</h2>
              <Link to="/user/products" className="text-blue-600 text-sm hover:underline">View All</Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="text-emerald-600" size={24} />
                <div>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-gray-500">Services</p>
                </div>
              </div>
              <div>
                <Link 
                  to="/user/products" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Credits</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="text-purple-600" size={24} />
                <div>
                  <p className="text-2xl font-bold">{formatIDR(user?.credits || 0)}</p>
                  <p className="text-sm text-gray-500">Available Balance</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTopUpModalOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Top Up Credits
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reply Code
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 5).reverse().map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{format(new Date(order.date), 'MMM dd, yyyy')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatIDR(order.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.replyCode || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No orders yet. Start by ordering a service!
            </div>
          )}
        </div>

        {/* Display TopUp Requests if any */}
        {topupRequests.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Recent Top Up Requests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Account
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topupRequests.slice(0, 5).reverse().map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{format(new Date(request.date), 'MMM dd, yyyy')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatIDR(request.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.bankAccount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.notes || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Top Up Credits Modal */}
      {isTopUpModalOpen && (
        <TopUpCreditsModal 
          onClose={() => setIsTopUpModalOpen(false)}
          onSuccess={() => {
            setIsTopUpModalOpen(false);
            // Refresh top-up requests
            if (user) {
              const userTopupRequests = getUserTopUpRequests(user.id);
              setTopupRequests(userTopupRequests);
            }
          }}
        />
      )}
    </UserLayout>
  );
};

export default UserDashboard;
