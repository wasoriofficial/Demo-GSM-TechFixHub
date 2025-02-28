import { useState, useEffect } from 'react';
import { getOrders } from '../../utils/dataService';
import { useAuth } from '../../contexts/AuthContext';
import UserLayout from './UserLayout';
import { format } from 'date-fns';
import { Clock, Filter, MessageSquare, Search } from 'lucide-react';

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const allOrders = getOrders();
      const userOrders = allOrders.filter(order => order.userId === user.id);
      setOrders(userOrders);
      setFilteredOrders(userOrders);
    }
  }, [user]);

  useEffect(() => {
    let result = orders;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(order => order.status === selectedStatus);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.productName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }
    
    setFilteredOrders(result);
  }, [selectedStatus, searchQuery, orders]);

  // Format to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders by name or ID"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredOrders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">#{order.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                        <div className="text-xs text-gray-500">{order.category} Service</div>
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
                        <div className="text-sm text-gray-900">
                          {order.replyCode ? 
                            <span className="font-medium">{order.replyCode}</span> : 
                            <span className="text-gray-400">-</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <MessageSquare size={16} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
            <p className="text-gray-500 mb-4">
              {orders.length === 0
                ? "You haven't placed any orders yet."
                : "No orders match your current filters."}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p className="text-sm font-medium">#{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Service</p>
                  <p className="text-sm font-medium">{selectedOrder.productName}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm">{format(new Date(selectedOrder.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm font-medium">{formatIDR(selectedOrder.amount)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      selectedOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                      selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {selectedOrder.customFields && selectedOrder.customFields.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.customFields.map((field: any, index: number) => (
                      <div key={index} className="flex justify-between mb-2 last:mb-0">
                        <p className="text-sm font-medium text-gray-500">{field.name}</p>
                        <p className="text-sm">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.replyCode && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Admin Response</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm">{selectedOrder.replyCode}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserOrders;
