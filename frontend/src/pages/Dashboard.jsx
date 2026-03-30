import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import inventoryAPI from '../services/inventoryAPI';
import orderAPI from '../services/orderAPI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

/**
 * Dashboard Page - Enhanced with sidebar layout, charts, stats, and profile
 */
function Dashboard() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [supplierStats, setSupplierStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [statsRes, supplierRes, ordersRes, lowStockRes, salesRes] = await Promise.allSettled([
          inventoryAPI.getStats(),
          inventoryAPI.getSupplierStats(),
          orderAPI.getAll({ page: 1, limit: 10, sortBy: 'created_at', sortOrder: 'desc' }),
          inventoryAPI.getLowStock(10),
          inventoryAPI.getSalesChartData(30).catch(() => null)
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.success) {
          setStats(statsRes.value.data);
        }

        if (supplierRes.status === 'fulfilled' && supplierRes.value.success) {
          setSupplierStats(supplierRes.value.data);
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
          setRecentOrders(ordersRes.value.data.orders || []);
        }

        if (lowStockRes.status === 'fulfilled' && lowStockRes.value.success) {
          setLowStockItems(lowStockRes.value.data.items || []);
        }

        if (salesRes.status === 'fulfilled' && salesRes?.value?.success) {
          setSalesData(salesRes.value.data || []);
        }

        // Generate sample sales data if API doesn't return data
        if (!salesRes.value?.success) {
          console.log('[Dashboard] Using sample data for sales chart (API not available)');
          const sampleData = [
            { name: 'Mon', sales: 400, purchases: 240 },
            { name: 'Tue', sales: 300, purchases: 139 },
            { name: 'Wed', sales: 550, purchases: 380 },
            { name: 'Thu', sales: 450, purchases: 290 },
            { name: 'Fri', sales: 700, purchases: 480 },
            { name: 'Sat', sales: 620, purchases: 420 },
            { name: 'Sun', sales: 380, purchases: 250 }
          ];
          setSalesData(sampleData);
          setUsingSampleData(true);
        }

      } catch (err) {
        console.error('[Dashboard] Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogoutClick = () => {
    console.log('[Dashboard] Logout button clicked by user:', user?.name, '(', user?.role, ')');
    setShowLogoutConfirm(true);
    setShowProfileMenu(false);
  };

  const handleConfirmLogout = () => {
    console.log('[Dashboard] User confirmed logout, calling logout function');
    setShowLogoutConfirm(false);
    logout();
  };

  const handleCancelLogout = () => {
    console.log('[Dashboard] User cancelled logout');
    setShowLogoutConfirm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-rose-100 text-rose-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  // Generate pie chart data for inventory status
  const inventoryPieData = stats ? [
    { name: 'In Stock', value: stats.totalProducts - stats.outOfStockProducts - stats.lowStockProducts, color: '#10B981' },
    { name: 'Low Stock', value: stats.lowStockProducts, color: '#F59E0B' },
    { name: 'Out of Stock', value: stats.outOfStockProducts, color: '#EF4444' }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-xl fixed top-0 left-0 right-0 z-40">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Inventory Dashboard</h1>
            </div>
            
            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl px-4 py-2.5 transition-all duration-200"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-white text-sm font-semibold">{user?.name}</p>
                  <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

             
            </div>
          </div>
        </div>
      </header>


       {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-24 mr-3 w-72 bg-white rounded-2xl shadow-2xl py-3 z-9999 border border-slate-200">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user?.name}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    <span className={`inline-block mt-3 px-3 py-1.5 text-xs font-semibold rounded-full ${
                      user?.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      user?.role === 'manager' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className=" w-full text-left px-5 py-3 text-sm text-rose-600 hover:bg-rose-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}

      {/* Sidebar - Fixed */}
      <aside className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white shadow-xl border-r border-slate-200 transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Quick Actions Header */}
         

          {/* Quick Actions List */}
          <nav className="space-y-2">
            <Link 
              to="/inventory" 
              className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="font-semibold text-slate-900 group-hover:text-blue-600">Inventory</span>
                  <p className="text-xs text-slate-500">Manage products</p>
                </div>
              )}
            </Link>

            <Link 
              to="/orders" 
              className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-100 group-hover:bg-purple-500 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="font-semibold text-slate-900 group-hover:text-purple-600">Orders</span>
                  <p className="text-xs text-slate-500">View & create orders</p>
                </div>
              )}
            </Link>

            <Link 
              to="/suppliers" 
              className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-emerald-50 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="font-semibold text-slate-900 group-hover:text-emerald-600">Suppliers</span>
                  <p className="text-xs text-slate-500">Manage suppliers</p>
                </div>
              )}
            </Link>

            <Link 
              to="/categories" 
              className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-orange-100 group-hover:bg-orange-500 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="font-semibold text-slate-900 group-hover:text-orange-600">Categories</span>
                  <p className="text-xs text-slate-500">Organize items</p>
                </div>
              )}
            </Link>

            {(isAdmin() || isManager()) && (
              <Link 
                to="/reports" 
                className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-indigo-50 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-500 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600">Reports</span>
                    <p className="text-xs text-slate-500">Analytics & insights</p>
                  </div>
                )}
              </Link>
            )}

           
          </nav>

  
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-24 px-6 pb-8 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your inventory today.</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Products</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.totalProducts || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-semibold">↑ 12%</span>
              <span className="text-slate-500 ml-2">from last month</span>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.lowStockProducts || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-amber-600 font-semibold">{stats?.lowStockItems || 0}</span>
              <span className="text-slate-500 ml-2">units below threshold</span>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Out of Stock</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.outOfStockProducts || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-rose-600 font-semibold">⚠️</span>
              <span className="text-slate-500 ml-2">Needs attention</span>
            </div>
          </div>

          {/* Active Suppliers */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Suppliers</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{supplierStats?.active || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-slate-700 font-semibold">${supplierStats?.totalPurchaseValue?.toLocaleString() || 0}</span>
              <span className="text-slate-500 ml-2">total value</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales & Purchase Trend Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sales & Purchase Trends</h3>
                <p className="text-sm text-slate-500 mt-1">Weekly overview</p>
              </div>
              {usingSampleData && (
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-medium">
                 
                </span>
              )}
            </div>
            {usingSampleData && (
              <p className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
              </p>
            )}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                  <Area type="monotone" dataKey="purchases" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorPurchases)" name="Purchases" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Inventory Status</h3>
              <p className="text-sm text-slate-500 mt-1">Stock distribution</p>
            </div>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryPieData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {inventoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {inventoryPieData.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-4 h-4 rounded-full mr-2 shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                  <span className="text-slate-400 ml-1">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert & Recent Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Low Stock Items */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Low Stock Alerts</h3>
                <p className="text-sm text-slate-500 mt-1">Items need restocking</p>
              </div>
              <Link to="/inventory?filter=low-stock" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-600">{item.quantity}</p>
                      <p className="text-xs text-slate-500">of {item.low_stock_threshold}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-emerald-50 rounded-xl border border-emerald-100">
                  <svg className="w-16 h-16 mx-auto text-emerald-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-emerald-700">All items are well stocked!</p>
                  <p className="text-sm text-emerald-600 mt-1">No items below threshold</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
                <p className="text-sm text-slate-500 mt-1">Latest transactions</p>
              </div>
              <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${order.order_type === 'purchase' ? 'bg-purple-100' : 'bg-indigo-100'}`}>
                        <svg className={`w-5 h-5 ${order.order_type === 'purchase' ? 'text-purple-600' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{order.order_number}</p>
                        <p className="text-sm text-slate-500">
                          {order.order_type === 'purchase' ? 'Purchase Order' : 'Sale Order'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        ${parseFloat(order.total_amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                  <svg className="w-16 h-16 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="font-semibold text-slate-600">No recent orders</p>
                  <p className="text-sm text-slate-500 mt-1">Orders will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">🏆 Top Suppliers</h3>
              <p className="text-sm text-slate-500 mt-1">Best performing partners</p>
            </div>
            <Link to="/suppliers" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {supplierStats?.topSuppliers?.length > 0 ? (
              supplierStats.topSuppliers.slice(0, 5).map((supplier, index) => (
                <div key={supplier.id} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
                  <div className={`h-12 w-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                    index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 
                    index === 2 ? 'bg-gradient-to-br from-amber-400 to-amber-500' : 
                    'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <p className="font-semibold text-slate-900">{supplier.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{supplier.item_count} items</p>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                <svg className="w-16 h-16 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="font-semibold text-slate-600">No suppliers found</p>
                <p className="text-sm text-slate-500 mt-1">Add suppliers to see them here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className=" " 
              onClick={handleCancelLogout}
            />

            {/* Modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block  align-bottom bg-white rounded-2xl px-6 pt-6 pb-5 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 sm:mx-0 sm:h-12 sm:w-12">
                  <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-5 sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900">
                    Sign Out
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500">
                      Are you sure you want to sign out? You'll need to sign in again to access your account.
                    </p>
                  </div>
                </div>
              </div>
              <div className=" mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-3 bg-rose-600 text-base font-semibold text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  onClick={handleCancelLogout}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-5 py-3 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
