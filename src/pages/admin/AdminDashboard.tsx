import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, TrendingUp, Trash2, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { supabase, Profile, Product, Order } from '../../lib/supabase';

type AdminTab = 'overview' | 'users' | 'products' | 'orders';

interface Stats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface OrderWithDetails extends Order {
  buyer?: { full_name: string; email: string };
  seller?: { full_name: string; email: string };
}

interface ProductWithSeller extends Product {
  seller?: { full_name: string; city?: string };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalFarmers: 0, totalBuyers: 0,
    totalProducts: 0, totalOrders: 0, totalRevenue: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [profilesRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('orders').select('total_amount', { count: 'exact' }),
      ]);
      const farmers = profilesRes.data?.filter((p) => p.role === 'farmer').length || 0;
      const buyers = profilesRes.data?.filter((p) => p.role === 'buyer').length || 0;
      const revenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      setStats({
        totalUsers: profilesRes.count || 0,
        totalFarmers: farmers, totalBuyers: buyers,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue: revenue,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data || []) as unknown as Profile[]);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(full_name, city)')
      .order('created_at', { ascending: false });
    setProducts((data || []) as unknown as ProductWithSeller[]);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, buyer:profiles!buyer_id(full_name, email), seller:profiles!seller_id(full_name, email)')
      .order('created_at', { ascending: false });
    setOrders((data || []) as unknown as OrderWithDetails[]);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
    fetchStats();
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
    { key: 'users', label: 'Users', icon: <Users size={18} /> },
    { key: 'products', label: 'Products', icon: <Package size={18} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of Smart AgroConnect platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 font-medium text-sm rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeTab === tab.key
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500 mt-1">{stats.totalFarmers} Farmers · {stats.totalBuyers} Buyers</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                  <p className="text-sm text-green-600 mt-1">Listed by farmers</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Package size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                  <p className="text-sm text-orange-600 mt-1">Platform transactions</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ShoppingBag size={24} className="text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-4xl font-bold text-green-600 mt-1">
                    ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total transaction value on platform</p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={32} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Navigation</h2>
              <div className="space-y-2">
                {[
                  { label: 'View All Users', tab: 'users' as AdminTab, color: 'blue' },
                  { label: 'View All Products', tab: 'products' as AdminTab, color: 'green' },
                  { label: 'View All Orders', tab: 'orders' as AdminTab, color: 'orange' },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full px-4 py-3 bg-${item.color}-50 text-${item.color}-700 rounded-lg hover:bg-${item.color}-100 transition-colors text-left font-medium flex items-center justify-between`}
                  >
                    {item.label}
                    <ChevronDown size={16} className="-rotate-90" />
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Health</h2>
              <div className="space-y-4">
                {[
                  { label: 'Active Products', value: 85, color: 'green' },
                  { label: 'Order Completion Rate', value: 92, color: 'blue' },
                  { label: 'User Satisfaction', value: 88, color: 'orange' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`bg-${item.color}-600 h-2 rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">City</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'farmer' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.city || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">No users found.</div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Products ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Seller</th>
                  <th className="px-6 py-3 text-left">Price</th>
                  <th className="px-6 py-3 text-left">Qty</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-gray-600">{(product as any).seller?.full_name || '—'}</td>
                    <td className="px-6 py-4 font-medium text-green-700">₹{product.price_per_unit}/{product.unit}</td>
                    <td className="px-6 py-4 text-gray-600">{product.quantity_available} {product.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">No products found.</div>
            )}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Orders ({orders.length})</h2>
          </div>
          <div className="space-y-4 p-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm font-medium">{order.id.slice(0, 12)}...</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Buyer</p>
                    <p className="text-sm font-medium">{(order as any).buyer?.full_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Seller</p>
                    <p className="text-sm font-medium">{(order as any).seller?.full_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-lg font-bold text-green-600">₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'shipped' ? 'bg-orange-100 text-orange-700' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Payment: {order.payment_status}
                  </span>
                  {order.payment_method && (
                    <span className="text-xs text-gray-500">via {order.payment_method}</span>
                  )}
                  <div className="ml-auto flex gap-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={14} /> Mark Delivered
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">No orders found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
