import { useState } from 'react';
import { getOrders, getUsers, getProducts, updateOrder, deleteOrder, getUser, updateUser } from '../utils/dataService';
import { format } from 'date-fns';
import { Filter, Pencil, Trash2 } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState(getOrders());
  const users = getUsers();
  const products = getProducts();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [previousStatus, setPreviousStatus] = useState<string>('');
  
  const filteredOrders = orders.filter(order => {
    const categoryMatch = selectedCategory === 'all' || order.category === selectedCategory;
    const userMatch = selectedUserId === 'all' || order.userId === selectedUserId;
    return categoryMatch && userMatch;
  });
  
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  
  const openStatusModal = (order: any) => {
    setCurrentOrder({ ...order });
    setPreviousStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const openDeleteModal = (order: any) => {
    setCurrentOrder({ ...order });
    setIsDeleteModalOpen(true);
  };

  const handleStatusUpdate = () => {
    if (currentOrder) {
      // Store the previous authentication state
      const authUser = localStorage.getItem('currentUser');
      
      // Check if the status changed to cancelled/rejected from another status
      if (previousStatus !== 'cancelled' && currentOrder.status === 'cancelled') {
        // Refund credits to the user
        const user = getUser(currentOrder.userId);
        if (user) {
          const updatedCredits = user.credits + currentOrder.amount;
          updateUser(currentOrder.userId, { credits: updatedCredits });
        }
      }
      
      // Update the order and get the updated order
      const updatedOrder = updateOrder(currentOrder.id, { 
        status: currentOrder.status,
        replyCode: currentOrder.replyCode
      });
      
      // Update the local state instead of reloading the page
      if (updatedOrder) {
        setOrders(orders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        ));
      }
      
      // Restore authentication state if needed
      if (!localStorage.getItem('currentUser') && authUser) {
        localStorage.setItem('currentUser', authUser);
      }
      
      setIsStatusModalOpen(false);
    }
  };

  const handleDeleteOrder = () => {
    if (currentOrder) {
      // Store the previous authentication state
      const authUser = localStorage.getItem('currentUser');
      
      // If deleting an order that's not cancelled, refund the credits
      if (currentOrder.status !== 'cancelled' && currentOrder.status !== 'completed') {
        const user = getUser(currentOrder.userId);
        if (user) {
          const updatedCredits = user.credits + currentOrder.amount;
          updateUser(currentOrder.userId, { credits: updatedCredits });
        }
      }
      
      // Delete the order
      const success = deleteOrder(currentOrder.id);
      
      // Update the local state if deletion was successful
      if (success) {
        setOrders(orders.filter(order => order.id !== currentOrder.id));
      }
      
      // Restore authentication state if needed
      if (!localStorage.getItem('currentUser') && authUser) {
        localStorage.setItem('currentUser', authUser);
      }
      
      setIsDeleteModalOpen(false);
    }
  };

  // Format to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Categories</option>
              <option value="IMEI">IMEI Services</option>
              <option value="FILE">FILE Services</option>
              <option value="SERVER">SERVER Services</option>
              <option value="REMOTE">REMOTE Services</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${order.category === 'IMEI' ? 'bg-blue-100 text-blue-800' : 
                    order.category === 'FILE' ? 'bg-green-100 text-green-800' : 
                    order.category === 'SERVER' ? 'bg-purple-100 text-purple-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                    {order.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getUserName(order.userId)}</div>
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
                    'bg-red-100 text-red-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.replyCode || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openStatusModal(order)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Change Status"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(order)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Order"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No orders found with the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Change Status Modal */}
      {isStatusModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Order</h2>
            <p className="text-sm text-gray-600 mb-4">
              Order #{currentOrder.id.slice(0, 8)} - {currentOrder.productName}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={currentOrder.status}
                  onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {previousStatus !== 'cancelled' && currentOrder.status === 'cancelled' && (
                  <p className="mt-1 text-xs text-amber-600">
                    Credits will be refunded to user when changing status to cancelled.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Reply Code</label>
                <input
                  type="text"
                  value={currentOrder.replyCode || ''}
                  onChange={(e) => setCurrentOrder({ ...currentOrder, replyCode: e.target.value })}
                  placeholder="Enter reply code or message"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="mt-1 text-xs text-gray-500">This code will be visible to the customer</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Modal */}
      {isDeleteModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Order</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this order?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="font-medium">Order #{currentOrder.id.slice(0, 8)}</p>
              <p>{currentOrder.productName}</p>
              <p className="text-sm text-gray-500">{format(new Date(currentOrder.date), 'MMM dd, yyyy')}</p>
              <p className="text-sm font-medium">{formatIDR(currentOrder.amount)}</p>
            </div>
            {currentOrder.status !== 'cancelled' && currentOrder.status !== 'completed' && (
              <p className="text-sm text-amber-600 mb-4">
                Credits will be refunded to the user.
              </p>
            )}
            <p className="text-sm text-red-600 mb-4">
              This action cannot be undone. This will permanently delete the order from the system.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
