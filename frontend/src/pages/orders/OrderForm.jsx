import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import orderAPI from '../../services/orderAPI';
import inventoryAPI from '../../services/inventoryAPI';
import supplierAPI from '../../services/supplierAPI';

/**
 * OrderForm Page - Create/Edit order
 * Modern UI with dynamic item addition and validation
 */
function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isManager } = useAuth();
  
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    order_type: 'purchase',
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    customer_name: '',
    shipping_address: '',
    payment_method: 'cash',
    tax_rate: 0,
    tax_amount: 0,
    discount_amount: 0,
    notes: '',
    items: []
  });
  
  const [availableItems, setAvailableItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch items for order and suppliers
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        // Fetch inventory items
        console.log('[OrderForm] Fetching inventory items');
        const itemsResponse = await inventoryAPI.getAll({ page: 1, limit: 100 });
        console.log('[OrderForm] Inventory API response:', itemsResponse.data.items);
        if (itemsResponse.success) {
          setAvailableItems(itemsResponse.data.items);
          console.log('[OrderForm] Items loaded:', itemsResponse.data.items.length);
        }

        // Fetch suppliers
        console.log('[OrderForm] Fetching suppliers');
        const suppliersResponse = await supplierAPI.getAll({ page: 1, limit: 100 });
        console.log('[OrderForm] Suppliers API response:', suppliersResponse.data);
        if (suppliersResponse.success) {
          setSuppliers(suppliersResponse.data);
          console.log('[OrderForm] Suppliers loaded:', suppliersResponse.data.length);
        }
      } catch (err) {
        console.error('[OrderForm] Error fetching data:', err);
      } finally {
        setFetching(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add item to order
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: '',
          quantity: 1,
          unit_price: 0,
          total_price: 0
        }
      ]
    }));
  };

  // Remove item from order
  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item in order
  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      
      // Calculate total price
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].total_price = 
          (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
      }
      
      return { ...prev, items: newItems };
    });
  };

  // Calculate order total
  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const taxAmount = subtotal * (formData.tax_rate / 100);
    const discountAmount = formData.discount_amount || 0;
    return subtotal + taxAmount - discountAmount;
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  // Calculate tax amount
  const calculateTaxAmount = () => {
    return calculateSubtotal() * (formData.tax_rate / 100);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate
      if (!formData.order_type) {
        throw new Error('Order type is required');
      }
      
      if (formData.order_type === 'purchase' && !formData.supplier_id) {
        throw new Error('Supplier is required for purchase orders');
      }
      
      if (formData.items.length === 0) {
        throw new Error('At least one item is required');
      }
      
      // Filter out empty items
      const validItems = formData.items.filter(item => item.item_id && item.quantity > 0);
      
      if (validItems.length === 0) {
        throw new Error('Please add at least one valid item');
      }
      
      console.log('[OrderForm] Submitting order:', formData);
      
      const data = {
        order_type: formData.order_type,
        supplier_id: formData.supplier_id || null,
        notes: formData.notes,
        items: validItems
      };
      
      if (isEditMode) {
        await orderAPI.update(id, data);
        console.log('[OrderForm] Order updated successfully');
      } else {
        await orderAPI.create(data);
        console.log('[OrderForm] Order created successfully');
      }
      
      navigate('/orders');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || err.message || 'Failed to save order';
      setError(errorMessage);
      console.error('[OrderForm] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check permissions
  if (!isAdmin() && !isManager()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to manage orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Order' : 'Create Order'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Order Type and Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="order_type" className="block text-sm font-medium text-gray-700 mb-1">
                Order Type <span className="text-red-500">*</span>
              </label>
              <select
                id="order_type"
                name="order_type"
                value={formData.order_type}
                onChange={handleChange}
                required
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="purchase">Purchase Order</option>
                <option value="sale">Sale Order</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-1">
                Supplier {formData.order_type === 'purchase' && <span className="text-red-500">*</span>}
              </label>
              <select
                id="supplier_id"
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                required={formData.order_type === 'purchase'}
                disabled={formData.order_type === 'sale' || fetching}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
              >
                <option value="">
                  {fetching ? 'Loading suppliers...' : 'Select Supplier'}
                </option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order Date and Expected Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="order_date" className="block text-sm font-medium text-gray-700 mb-1">
                Order Date
              </label>
              <input
                type="date"
                id="order_date"
                name="order_date"
                value={formData.order_date}
                onChange={handleChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="expected_delivery_date"
                name="expected_delivery_date"
                value={formData.expected_delivery_date}
                onChange={handleChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Customer Information (for Sale orders) */}
          {formData.order_type === 'sale' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    rows={2}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter shipping address"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method (for Purchase orders) */}
          {formData.order_type === 'purchase' && (
            <div className="mb-6">
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          )}

          {/* Tax and Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="tax_rate"
                name="tax_rate"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax_rate}
                onChange={handleChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount ($)
              </label>
              <input
                type="number"
                id="discount_amount"
                name="discount_amount"
                min="0"
                step="0.01"
                value={formData.discount_amount}
                onChange={handleChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Optional notes..."
            />
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
              >
                + Add Item
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                No items added. Click "Add Item" to add products to this order.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <select
                            value={item.item_id}
                            onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="">Select Product</option>
                            {availableItems.map(ai => (
                              <option key={ai.id} value={ai.id}>
                                {ai.name} ({ai.sku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="text-black text-blackw-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ${item.total_price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Total */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-end">
              <div className="text-right space-y-2 w-64">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax ({formData.tax_rate}%):</span>
                  <span className="text-gray-900">${calculateTaxAmount().toFixed(2)}</span>
                </div>
                {formData.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount:</span>
                    <span className="text-green-600">-${formData.discount_amount}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default OrderForm;
