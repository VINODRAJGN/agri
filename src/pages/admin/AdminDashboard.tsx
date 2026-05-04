import { useState, useEffect } from 'react';
import {
  Package, ShoppingBag, Trash2,
  CheckCircle, XCircle, Tractor, UserCheck, Flame,
  Clock, Truck, DollarSign, BarChart3
} from 'lucide-react';
import { supabase, Profile, Product, Order, OrderItem } from '../../lib/supabase';

type AdminTab = 'overview' | 'farmers' | 'customers' | 'products' | 'orders';

interface Stats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

interface OrderWithDetails extends Order {
  buyer?: { full_name: string; email: string; phone?: string };
  seller?: { full_name: string; email: string };
  items?: Array<OrderItem & { products?: { name: string; unit: string } }>;
}

interface ProductWithSeller extends Product {
  seller?: { full_name: string; city?: string };
}

interface FastSellingProduct {
  product_id: string;
  product_name: string;
  category: string;
  total_sold: number;
  total_revenue: number;
  unit: string;
  seller_name: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalFarmers: 0, totalBuyers: 0,
    totalProducts: 0, totalOrders: 0, totalRevenue: 0,
    pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0,
  });
  const [farmers, setFarmers] = useState<Profile[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [fastSelling, setFastSelling] = useState<FastSellingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [profilesRes, productsRes, ordersRes, orderItemsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('products').select('*, seller:profiles!seller_id(full_name, city)', { count: 'exact' }),
        supabase.from('orders').select('*, buyer:profiles!buyer_id(full_name, email, phone), seller:profiles!seller_id(full_name, email), items:order_items(*, products(name, unit))'),
        supabase.from('order_items').select('product_id, quantity, total_price, products(name, category, unit, seller_id), products!inner(seller:profiles!seller_id(full_name))'),
      ]);

      const allProfiles = (profilesRes.data || []) as unknown as Profile[];
      const farmersList = allProfiles.filter((p) => p.role === 'farmer');
      const customersList = allProfiles.filter((p) => p.role === 'buyer');
      const allOrders = (ordersRes.data || []) as unknown as OrderWithDetails[];
      const allProducts = (productsRes.data || []) as unknown as ProductWithSeller[];

      const revenue = allOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const pending = allOrders.filter((o) => o.status === 'pending').length;
      const delivered = allOrders.filter((o) => o.status === 'delivered').length;
      const cancelled = allOrders.filter((o) => o.status === 'cancelled').length;

      setStats({
        totalUsers: profilesRes.count || 0,
        totalFarmers: farmersList.length,
        totalBuyers: customersList.length,
        totalProducts: productsRes.count || 0,
        totalOrders: allOrders.length,
        totalRevenue: revenue,
        pendingOrders: pending,
        deliveredOrders: delivered,
        cancelledOrders: cancelled,
      });

      setFarmers(farmersList);
      setCustomers(customersList);
      setProducts(allProducts);
      setOrders(allOrders);

      // Compute fast-selling products from order_items
      const productSales: Record<string, FastSellingProduct> = {};
      const items = (orderItemsRes.data || []) as any[];
      items.forEach((item) => {
        const pid = item.product_id;
        const pName = item.products?.name || 'Unknown';
        const pCategory = item.products?.category || '';
        const pUnit = item.products?.unit || 'kg';
        const sName = item.products?.seller?.full_name || 'Unknown';

        if (!productSales[pid]) {
          productSales[pid] = {
            product_id: pid,
            product_name: pName,
            category: pCategory,
            total_sold: 0,
            total_revenue: 0,
            unit: pUnit,
            seller_name: sName,
          };
        }
        productSales[pid].total_sold += Number(item.quantity);
        productSales[pid].total_revenue += Number(item.total_price);
      });

      const sorted = Object.values(productSales).sort((a, b) => b.total_sold - a.total_sold);
      setFastSelling(sorted);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchAllData();
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchAllData();
  };

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
    { key: 'farmers', label: 'Farmers', icon: <Tractor size={18} /> },
    { key: 'customers', label: 'Customers', icon: <UserCheck size={18} /> },
    { key: 'products', label: 'Products', icon: <Package size={18} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
      <div className="flex gap-1 mb-8 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 font-medium text-sm rounded-t-lg transition-colors -mb-px border-b-2 whitespace-nowrap ${
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

      {/* ===== OVERVIEW ===== */}
      {activeTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={22} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                </div>
                <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={22} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Farmers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFarmers}</p>
                </div>
                <div className="w-11 h-11 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Tractor size={22} className="text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-teal-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBuyers}</p>
                </div>
                <div className="w-11 h-11 bg-teal-100 rounded-lg flex items-center justify-center">
                  <UserCheck size={22} className="text-teal-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <ShoppingBag size={22} className="text-green-600" />
              Order Summary
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <Clock size={24} className="mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{stats.pendingOrders}</p>
                <p className="text-xs text-yellow-600 mt-1">Pending</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <CheckCircle size={24} className="mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-700">{stats.totalOrders - stats.pendingOrders - stats.deliveredOrders - stats.cancelledOrders}</p>
                <p className="text-xs text-blue-600 mt-1">Confirmed/Shipped</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Truck size={24} className="mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-700">{stats.deliveredOrders}</p>
                <p className="text-xs text-green-600 mt-1">Delivered</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <XCircle size={24} className="mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-700">{stats.cancelledOrders}</p>
                <p className="text-xs text-red-600 mt-1">Cancelled</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <DollarSign size={24} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-emerald-700">
                  ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-emerald-600 mt-1">Revenue</p>
              </div>
            </div>

            {/* Recent Orders */}
            {orders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">Order ID</th>
                        <th className="px-4 py-3 text-left">Buyer</th>
                        <th className="px-4 py-3 text-left">Seller</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                          <td className="px-4 py-3">{(order as any).buyer?.full_name || '—'}</td>
                          <td className="px-4 py-3">{(order as any).seller?.full_name || '—'}</td>
                          <td className="px-4 py-3 font-medium text-green-700">₹{Number(order.total_amount).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'shipped' ? 'bg-orange-100 text-orange-700' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {orders.length > 5 && (
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="mt-3 text-sm text-green-600 font-medium hover:text-green-700"
                  >
                    View all {orders.length} orders →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fast Selling Products */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Flame size={22} className="text-orange-600" />
              Fast Selling Products
            </h2>
            {fastSelling.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Flame size={40} className="mx-auto mb-2 text-gray-300" />
                <p>No sales data yet. Products will appear here once orders are placed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Seller</th>
                      <th className="px-4 py-3 text-left">Qty Sold</th>
                      <th className="px-4 py-3 text-left">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fastSelling.map((item, idx) => (
                      <tr key={item.product_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {idx < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                              idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-orange-400' : 'bg-orange-300'
                            }`}>
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">{idx + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">{item.category}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.seller_name}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {item.total_sold} {item.unit}
                        </td>
                        <td className="px-4 py-3 font-medium text-green-700">
                          ₹{item.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('farmers')}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Tractor size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{stats.totalFarmers} Farmers</p>
                  <p className="text-xs text-gray-500">View farmer list →</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <UserCheck size={20} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{stats.totalBuyers} Customers</p>
                  <p className="text-xs text-gray-500">View customer list →</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{stats.totalProducts} Products</p>
                  <p className="text-xs text-gray-500">View all products →</p>
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* ===== FARMERS ===== */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b bg-orange-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Tractor size={22} className="text-orange-600" />
              Registered Farmers ({farmers.length})
            </h2>
          </div>
          {farmers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No farmers registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">City</th>
                    <th className="px-6 py-3 text-left">State</th>
                    <th className="px-6 py-3 text-left">Address</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{farmer.full_name}</td>
                      <td className="px-6 py-4 text-gray-600">{farmer.email}</td>
                      <td className="px-6 py-4 text-gray-600">{farmer.phone || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{farmer.city || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{farmer.state || '—'}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{farmer.address || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(farmer.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== CUSTOMERS ===== */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b bg-teal-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck size={22} className="text-teal-600" />
              Registered Customers ({customers.length})
            </h2>
          </div>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No customers registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">City</th>
                    <th className="px-6 py-3 text-left">State</th>
                    <th className="px-6 py-3 text-left">Address</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{customer.full_name}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.phone || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.city || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.state || '—'}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{customer.address || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(customer.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== PRODUCTS ===== */}
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

      {/* ===== ORDERS ===== */}
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

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {(item as any).products?.name || 'Product'} x {item.quantity} {(item as any).products?.unit || ''}
                          </span>
                          <span className="font-medium text-gray-900">₹{Number(item.total_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
