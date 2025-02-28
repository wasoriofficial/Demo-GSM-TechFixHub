import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, getAvailableRoles } from '../utils/dataService';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState(getProducts());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('IMEI');
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    prices: {} as Record<string, number>,
    category: 'IMEI',
    customFields: [] as { name: string, value: string }[],
    quantities: [] as { name: string, value: number }[]
  });
  const [customFieldName, setCustomFieldName] = useState('');
  const [quantityName, setQuantityName] = useState('');

  useEffect(() => {
    // Load available roles when component mounts
    const roles = getAvailableRoles();
    setAvailableRoles(roles);
    
    // Initialize prices object for each role
    const initialPrices: Record<string, number> = {};
    roles.forEach(role => {
      initialPrices[role] = 0;
    });
    
    setNewProduct(prev => ({
      ...prev,
      prices: initialPrices
    }));
  }, []);

  const handleAddProduct = () => {
    addProduct(newProduct);
    setProducts(getProducts());
    setIsAddModalOpen(false);
    setNewProduct({
      name: '',
      description: '',
      prices: availableRoles.reduce((acc, role) => ({ ...acc, [role]: 0 }), {}),
      category: activeCategory,
      customFields: [],
      quantities: []
    });
  };

  const handleEditProduct = () => {
    if (currentProduct) {
      updateProduct(currentProduct.id, currentProduct);
      setProducts(getProducts());
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteProduct = () => {
    if (currentProduct) {
      deleteProduct(currentProduct.id);
      setProducts(getProducts());
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (product: any) => {
    // Make sure product has prices object and convert from legacy structure if needed
    let updatedProduct = { ...product };
    
    // Initialize customFields and quantities if they don't exist in the product
    updatedProduct.customFields = product.customFields || [];
    updatedProduct.quantities = product.quantities || [];
    
    // Convert legacy price structure to role-based prices if needed
    if (!updatedProduct.prices) {
      const prices: Record<string, number> = {};
      availableRoles.forEach(role => {
        prices[role] = product.price || 0;
      });
      updatedProduct.prices = prices;
    }
    
    setCurrentProduct(updatedProduct);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: any) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const categories = ['IMEI', 'FILE', 'SERVER', 'REMOTE'];

  const filteredProducts = products.filter(
    (product) => product.category === activeCategory
  );

  const handleAddCustomField = () => {
    if (customFieldName.trim()) {
      setNewProduct({
        ...newProduct,
        customFields: [...newProduct.customFields, { name: customFieldName, value: '' }]
      });
      setCustomFieldName('');
    }
  };

  const handleAddQuantity = () => {
    if (quantityName.trim()) {
      setNewProduct({
        ...newProduct,
        quantities: [...newProduct.quantities, { name: quantityName, value: 1 }]
      });
      setQuantityName('');
    }
  };

  const handleRemoveCustomField = (index: number) => {
    const updatedFields = [...newProduct.customFields];
    updatedFields.splice(index, 1);
    setNewProduct({
      ...newProduct,
      customFields: updatedFields
    });
  };

  const handleRemoveQuantity = (index: number) => {
    const updatedQuantities = [...newProduct.quantities];
    updatedQuantities.splice(index, 1);
    setNewProduct({
      ...newProduct,
      quantities: updatedQuantities
    });
  };

  const handleCustomFieldValueChange = (index: number, value: string) => {
    const updatedFields = [...newProduct.customFields];
    updatedFields[index].value = value;
    setNewProduct({
      ...newProduct,
      customFields: updatedFields
    });
  };

  const handleQuantityValueChange = (index: number, value: number) => {
    const updatedQuantities = [...newProduct.quantities];
    updatedQuantities[index].value = value;
    setNewProduct({
      ...newProduct,
      quantities: updatedQuantities
    });
  };

  const handlePriceChange = (role: string, value: number) => {
    setNewProduct({
      ...newProduct,
      prices: {
        ...newProduct.prices,
        [role]: value
      }
    });
  };

  const handleEditPriceChange = (role: string, value: number) => {
    if (currentProduct) {
      setCurrentProduct({
        ...currentProduct,
        prices: {
          ...currentProduct.prices,
          [role]: value
        }
      });
    }
  };

  // For editing existing products
  const handleEditCustomFieldValueChange = (index: number, value: string) => {
    if (currentProduct) {
      const updatedFields = [...(currentProduct.customFields || [])];
      updatedFields[index].value = value;
      setCurrentProduct({
        ...currentProduct,
        customFields: updatedFields
      });
    }
  };

  // For editing existing product quantities
  const handleEditQuantityValueChange = (index: number, value: number) => {
    if (currentProduct) {
      const updatedQuantities = [...(currentProduct.quantities || [])];
      updatedQuantities[index].value = value;
      setCurrentProduct({
        ...currentProduct,
        quantities: updatedQuantities
      });
    }
  };

  // Format price to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Get user role price or fallback to default price
  const getProductPrice = (product: any) => {
    // For products with role-based pricing
    if (product.prices) {
      // Show first available price (user price) in the list view
      const firstRole = availableRoles.find(role => role === 'user') || availableRoles[0];
      return product.prices[firstRole] || 0;
    }
    // For legacy products
    return product.price || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => {
            setNewProduct({ ...newProduct, category: activeCategory });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category} Services
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-md">{product.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatIDR(getProductPrice(product))}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="text-indigo-600 hover:text-indigo-900">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(product)}
                      className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No products found in this category. Add a product to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category} Services
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              {/* Custom Fields Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={customFieldName}
                      onChange={(e) => setCustomFieldName(e.target.value)}
                      placeholder="Enter field name (e.g., IMEI, SN)"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                    <button
                      onClick={handleAddCustomField}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add Field
                    </button>
                  </div>
                  
                  {newProduct.customFields.length > 0 ? (
                    <div className="space-y-2">
                      {newProduct.customFields.map((field, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500">{field.name}</label>
                            <div className="flex">
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => handleCustomFieldValueChange(index, e.target.value)}
                                placeholder={`Enter ${field.name}`}
                                className="flex-1 border border-gray-300 rounded-l-md shadow-sm p-2 text-sm"
                              />
                              <button
                                onClick={() => handleRemoveCustomField(index)}
                                className="px-2 bg-red-100 text-red-600 rounded-r-md hover:bg-red-200"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No custom fields added</p>
                  )}
                </div>
              </div>

              {/* Quantities Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantities</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={quantityName}
                      onChange={(e) => setQuantityName(e.target.value)}
                      placeholder="Enter quantity option (e.g., Pack, Box)"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                    <button
                      onClick={handleAddQuantity}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Add QTTY
                    </button>
                  </div>
                  
                  {newProduct.quantities.length > 0 ? (
                    <div className="space-y-2">
                      {newProduct.quantities.map((qty, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500">{qty.name}</label>
                            <div className="flex">
                              <input
                                type="number"
                                min="1"
                                value={qty.value}
                                onChange={(e) => handleQuantityValueChange(index, parseInt(e.target.value))}
                                placeholder={`Enter quantity`}
                                className="flex-1 border border-gray-300 rounded-l-md shadow-sm p-2 text-sm"
                              />
                              <button
                                onClick={() => handleRemoveQuantity(index)}
                                className="px-2 bg-red-100 text-red-600 rounded-r-md hover:bg-red-200"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No quantity options added</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
              </div>

              {/* Role-based Prices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prices (IDR)</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  {availableRoles.map(role => (
                    <div key={role} className="flex items-center">
                      <div className="w-28 mr-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          role === 'premium' ? 'bg-blue-100 text-blue-800' :
                          role === 'vip' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'}`}>
                          {role}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={newProduct.prices[role] || 0}
                        onChange={(e) => handlePriceChange(role, Number(e.target.value))}
                        className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder={`Price for ${role}`}
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={currentProduct.category}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category} Services
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              {/* Edit Custom Fields Section */}
              {currentProduct.customFields && currentProduct.customFields.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    {currentProduct.customFields.map((field: any, index: number) => (
                      <div key={index} className="flex-1">
                        <label className="block text-xs font-medium text-gray-500">{field.name}</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleEditCustomFieldValueChange(index, e.target.value)}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Edit Quantities Section */}
              {currentProduct.quantities && currentProduct.quantities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantities</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    {currentProduct.quantities.map((qty: any, index: number) => (
                      <div key={index} className="flex-1">
                        <label className="block text-xs font-medium text-gray-500">{qty.name}</label>
                        <input
                          type="number"
                          min="1"
                          value={qty.value}
                          onChange={(e) => handleEditQuantityValueChange(index, parseInt(e.target.value))}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
              </div>

              {/* Role-based Prices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prices (IDR)</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  {availableRoles.map(role => (
                    <div key={role} className="flex items-center">
                      <div className="w-28 mr-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          role === 'premium' ? 'bg-blue-100 text-blue-800' :
                          role === 'vip' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'}`}>
                          {role}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={(currentProduct.prices && currentProduct.prices[role]) || 0}
                        onChange={(e) => handleEditPriceChange(role, Number(e.target.value))}
                        className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder={`Price for ${role}`}
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProduct}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Product</h2>
            <p className="mb-4">Are you sure you want to delete "{currentProduct.name}"? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
