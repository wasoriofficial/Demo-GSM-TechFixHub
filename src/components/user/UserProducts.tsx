import { useState, useEffect } from 'react';
import { getProducts, addOrder, getUser, updateUser } from '../../utils/dataService';
import { useAuth } from '../../contexts/AuthContext';
import UserLayout from './UserLayout';
import { CircleCheck, CreditCard, Filter, ShoppingCart } from 'lucide-react';

const UserProducts = () => {
  const { user, refreshUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const allProducts = getProducts();
    setProducts(allProducts);
  }, []);

  const categories = ['all', 'IMEI', 'FILE', 'SERVER', 'REMOTE'];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const handlePlaceOrder = () => {
    if (!user || !selectedProduct) return;
    
    // Get product price for user's role
    const price = getProductPrice(selectedProduct);
    
    // Calculate total based on quantity
    const totalAmount = price * selectedQuantity;
    
    // Check if user has enough credits
    if (user.credits < totalAmount) {
      setErrorMessage(`Insufficient credits. You need ${formatIDR(totalAmount)} but have ${formatIDR(user.credits)}`);
      return;
    }

    // Deduct credits from user
    const updatedCredits = user.credits - totalAmount;
    updateUser(user.id, { credits: updatedCredits });
    
    // Create the order
    const order = {
      userId: user.id,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      amount: totalAmount,
      date: new Date().toISOString(),
      status: 'pending',
      category: selectedProduct.category,
      customFields: Object.entries(customFieldValues).map(([name, value]) => ({ name, value })),
      quantity: selectedQuantity
    };
    
    addOrder(order);
    setOrderSuccess(true);
    setErrorMessage('');
    
    // Refresh user data to reflect updated credits
    refreshUser();
    
    // Reset after 2 seconds
    setTimeout(() => {
      setOrderSuccess(false);
      setIsOrderModalOpen(false);
      setSelectedProduct(null);
      setCustomFieldValues({});
      setSelectedQuantity(1);
    }, 2000);
  };

  const openOrderModal = (product: any) => {
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setErrorMessage('');
    
    // Initialize custom fields if any
    if (product.customFields && product.customFields.length > 0) {
      const initialValues: Record<string, string> = {};
      product.customFields.forEach((field: any) => {
        initialValues[field.name] = '';
      });
      setCustomFieldValues(initialValues);
    } else {
      setCustomFieldValues({});
    }
    
    setIsOrderModalOpen(true);
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Get product price based on user role
  const getProductPrice = (product: any) => {
    if (!user) return 0;
    
    // For products with role-based pricing
    if (product.prices && product.prices[user.role]) {
      return product.prices[user.role];
    }
    
    // Fallback to default price
    return product.price || 0;
  };

  // Format price to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Available Services</h1>
          <div className="relative">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <Filter size={16} className="text-gray-400 mr-2" />
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="appearance-none bg-transparent border-none focus:outline-none pr-8"
              >
                <option value="all">All Categories</option>
                <option value="IMEI">IMEI Services</option>
                <option value="FILE">FILE Services</option>
                <option value="SERVER">SERVER Services</option>
                <option value="REMOTE">REMOTE Services</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mb-2
                      ${product.category === 'IMEI' ? 'bg-blue-100 text-blue-800' : 
                        product.category === 'FILE' ? 'bg-green-100 text-green-800' : 
                        product.category === 'SERVER' ? 'bg-purple-100 text-purple-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {product.category}
                    </span>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{formatIDR(getProductPrice(product))}</p>
                </div>
                <button
                  onClick={() => openOrderModal(product)}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Order Now
                </button>
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">No services found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {isOrderModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            {orderSuccess ? (
              <div className="text-center py-8">
                <CircleCheck size={48} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-600">Thank you for your order. Your service request has been submitted.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Order Service</h2>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{selectedProduct.name}</h3>
                    <span className="font-bold text-blue-600">{formatIDR(getProductPrice(selectedProduct))}</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                </div>
                
                {/* Show custom fields if any */}
                {selectedProduct.customFields && selectedProduct.customFields.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Required Information</h3>
                    {selectedProduct.customFields.map((field: any, index: number) => (
                      <div key={index} className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.name}</label>
                        <input
                          type="text"
                          value={customFieldValues[field.name] || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.name}`}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Quantity options if any */}
                {selectedProduct.quantities && selectedProduct.quantities.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Quantity Options</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProduct.quantities.map((qty: any, index: number) => (
                        <div key={index} className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">{qty.name}</label>
                          <input
                            type="number"
                            min="1"
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your Credits:</span>
                    <span className="font-medium">{formatIDR(user?.credits || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-blue-600">
                      {formatIDR(getProductPrice(selectedProduct) * selectedQuantity)}
                    </span>
                  </div>
                  {errorMessage && (
                    <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={user && user.credits < (getProductPrice(selectedProduct) * selectedQuantity)}
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white flex items-center gap-2
                    ${user && user.credits >= (getProductPrice(selectedProduct) * selectedQuantity)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    <CreditCard size={16} />
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserProducts;
