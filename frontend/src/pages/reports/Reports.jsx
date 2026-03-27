import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import reportAPI from '../../services/reportAPI';

/**
 * Reports Page - Reports & Analytics Dashboard
 * Modern UI with summary cards, charts, and detailed reports
 */
function Reports() {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [lowStockData, setLowStockData] = useState([]);
  const [topSellingData, setTopSellingData] = useState([]);

  // Check permissions
  const canViewSales = isAdmin() || isManager();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    console.log('[Reports] Loading dashboard data');

    try {
      // Load multiple reports in parallel
      const [
        dashboardResult,
        inventoryResult,
        lowStockResult
      ] = await Promise.all([
        reportAPI.getDashboardSummary(),
        reportAPI.getInventorySummary(),
        reportAPI.getLowStockItems(10)
      ]);

      console.log('[Reports] Dashboard data:', dashboardResult);
      console.log('[Reports] Inventory data:', inventoryResult);
      console.log('[Reports] Low stock data:', lowStockResult);

      setDashboardData(dashboardResult.data);
      setInventoryData(inventoryResult.data);
      setLowStockData(lowStockResult.data);

      // Load sales data if allowed
      if (canViewSales) {
        const [salesResult, topSellingResult] = await Promise.all([
          reportAPI.getSalesSummary(dateRange.startDate, dateRange.endDate),
          reportAPI.getTopSellingItems(dateRange.startDate, dateRange.endDate, 10)
        ]);
        
        setSalesData(salesResult.data);
        setTopSellingData(topSellingResult.data);
      }
    } catch (err) {
      console.error('[Reports] Error loading data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load reports';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = async () => {
    setLoading(true);
    console.log('[Reports] Applying date filter:', dateRange);

    try {
      if (canViewSales) {
        const [salesResult, topSellingResult] = await Promise.all([
          reportAPI.getSalesSummary(dateRange.startDate, dateRange.endDate),
          reportAPI.getTopSellingItems(dateRange.startDate, dateRange.endDate, 10)
        ]);
        
        setSalesData(salesResult.data);
        setTopSellingData(topSellingResult.data);
      }
    } catch (err) {
      console.error('[Reports] Error applying filter:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <div className='flex items-center gap-5'>
              <div className="flex items-end">
                      <Link
                        to="/dashboard"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        ← Back to Dashboard
                      </Link>
                    </div>
          <button
            onClick={refreshData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          </div>
        
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Date Filter for Sales */}
        {canViewSales && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="text-black px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="text-black px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleDateFilter}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                Apply Filter
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'inventory', label: 'Inventory' },
                { id: 'sales', label: 'Sales', restricted: true },
                { id: 'alerts', label: 'Stock Alerts' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.restricted && !canViewSales}
                  className={`${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${
                    tab.restricted && !canViewSales ? 'opacity-50 cursor-not-allowed' : ''
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Items */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="shrink-0 bg-emerald-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                      <dd className="text-2xl font-bold text-gray-900">{dashboardData.inventory?.total_items || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Total Quantity */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Quantity</dt>
                      <dd className="text-2xl font-bold text-gray-900">{dashboardData.inventory?.total_quantity || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Total Value */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        ${(dashboardData.inventory?.total_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Low Stock Items */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                      <dd className="text-2xl font-bold text-gray-900">{dashboardData.inventory?.low_stock_count || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Orders Summary</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Orders</dt>
                    <dd className="font-medium text-gray-900">{dashboardData.orders?.total_orders || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Pending</dt>
                    <dd className="font-medium text-yellow-600">{dashboardData.orders?.pending_orders || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Completed</dt>
                    <dd className="font-medium text-green-600">{dashboardData.orders?.completed_orders || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">This Week</dt>
                    <dd className="font-medium text-gray-900">{dashboardData.orders?.orders_this_week || 0}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Suppliers</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Suppliers</dt>
                    <dd className="font-medium text-gray-900">{dashboardData.suppliers?.total_suppliers || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Active</dt>
                    <dd className="font-medium text-green-600">{dashboardData.suppliers?.active_suppliers || 0}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Categories</dt>
                    <dd className="font-medium text-gray-900">{dashboardData.categories?.total_categories || 0}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && inventoryData && (
          <div className="space-y-6">
            {/* Inventory Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Total Items</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{inventoryData.total_items}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Total Quantity</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{inventoryData.total_quantity}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Total Value</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  ${inventoryData.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                  Low Stock Items
                </h3>
                <div className="text-2xl font-bold text-yellow-600">{inventoryData.low_stock_count}</div>
                <p className="text-sm text-gray-500 mt-1">Items at or below reorder threshold</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                  Out of Stock
                </h3>
                <div className="text-2xl font-bold text-red-600">{inventoryData.out_of_stock_count}</div>
                <p className="text-sm text-gray-500 mt-1">Items with zero quantity</p>
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab - Only for Admin/Manager */}
        {activeTab === 'sales' && canViewSales && salesData && (
          <div className="space-y-6">
            {/* Sales Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{salesData.total_orders}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  ${(salesData.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Sale Revenue</div>
                <div className="text-3xl font-bold text-emerald-600 mt-2">
                  ${(salesData.sale_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500">Purchase Cost</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  ${(salesData.purchase_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">{salesData.pending_orders}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{salesData.completed_orders}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{salesData.cancelled_orders}</div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </div>
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Items</h3>
              {topSellingData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sold</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topSellingData.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.total_sold}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">
                            ${(item.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No sales data available</p>
              )}
            </div>
          </div>
        )}

        {/* Stock Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Low Stock Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                Low Stock Items
              </h3>
              {lowStockData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deficit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lowStockData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.sku}</td>
                          <td className="px-4 py-3 text-sm text-yellow-600 font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.low_stock_threshold}</td>
                          <td className="px-4 py-3 text-sm text-red-600 font-medium">{item.deficit}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.category_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No low stock items</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reports;