import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { supabase, Order } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OrderWithDetails extends Order {
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
    products: {
      name: string;
      unit: string;
    };
  }>;
  seller?: {
    full_name: string;
    phone?: string;
    city?: string;
  };
  buyer?: {
    full_name: string;
    phone?: string;
  };
}

export default function Orders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user, profile]);

  const fetchOrders = async () => {
    if (!user || !profile) return;

    const selectStr = profile.role === 'buyer'
      ? `*, items:order_items(*, products(name, unit)), seller:profiles!seller_id(full_name, phone, city)`
      : profile.role === 'farmer'
      ? `*, items:order_items(*, products(name, unit)), buyer:profiles!buyer_id(full_name, phone)`
      : `*, items:order_items(*, products(name, unit))`;

    let query = supabase
      .from('orders')
      .select(selectStr);

    if (profile.role === 'buyer') {
      query = query.eq('buyer_id', user.id);
    } else if (profile.role === 'farmer') {
      query = query.eq('seller_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders((data || []) as unknown as OrderWithDetails[]);
    }

    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert('Error updating order status');
    } else {
      fetchOrders();
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="text-blue-600" />;
      case 'shipped':
        return <Truck className="text-orange-600" />;
      case 'delivered':
        return <CheckCircle className="text-green-600" />;
      case 'cancelled':
        return <XCircle className="text-red-600" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-orange-100 text-orange-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {profile?.role === 'buyer' ? 'My Orders' : 'Received Orders'}
        </h1>
        <p className="text-gray-600 mt-1">
          {profile?.role === 'buyer'
            ? 'Track your orders and purchases'
            : 'Manage orders from buyers'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">
            {profile?.role === 'buyer'
              ? 'Start shopping to see your orders here'
              : 'Orders from buyers will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">Order ID:</span>
                      <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      ₹{order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {profile?.role === 'buyer' && order.seller && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Seller Details:</div>
                    <div className="text-sm text-gray-600">
                      {order.seller.full_name}
                      {order.seller.city && ` • ${order.seller.city}`}
                      {order.seller.phone && ` • ${order.seller.phone}`}
                    </div>
                  </div>
                )}

                {profile?.role === 'farmer' && order.buyer && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Buyer Details:</div>
                    <div className="text-sm text-gray-600">
                      {order.buyer.full_name}
                      {order.buyer.phone && ` • ${order.buyer.phone}`}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Items:</div>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span>
                          {item.products.name} × {item.quantity} {item.products.unit}
                        </span>
                        <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700">Delivery Address:</div>
                  <div className="text-sm text-gray-600">{order.delivery_address}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-600">Payment: </span>
                    <span className={`font-medium ${order.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.payment_status}
                    </span>
                    {order.payment_method && (
                      <span className="text-gray-600"> via {order.payment_method}</span>
                    )}
                  </div>

                  {profile?.role === 'farmer' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Confirm Order
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
