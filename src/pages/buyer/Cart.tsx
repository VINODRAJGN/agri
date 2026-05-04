import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface CartProps {
  onNavigate: (page: string) => void;
}

export default function Cart({ onNavigate }: CartProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalAmount } = useCart();
  const { user, profile } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user || !profile) return;

    if (!deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }

    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    setProcessing(true);

    try {
      const ordersBySeller: Record<string, typeof cartItems> = {};
      cartItems.forEach((item) => {
        if (!ordersBySeller[item.seller_id]) {
          ordersBySeller[item.seller_id] = [];
        }
        ordersBySeller[item.seller_id].push(item);
      });

      for (const sellerId in ordersBySeller) {
        const items = ordersBySeller[sellerId];
        const totalAmount = items.reduce(
          (sum, item) => sum + item.price_per_unit * item.cartQuantity,
          0
        );

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              buyer_id: user.id,
              seller_id: sellerId,
              total_amount: totalAmount,
              status: 'pending',
              delivery_address: deliveryAddress,
              payment_status: 'completed',
              payment_method: paymentMethod,
            },
          ])
          .select()
          .single();

        if (orderError || !orderData) throw orderError || new Error('Failed to create order');

        const orderItems = items.map((item) => ({
          order_id: (orderData as { id: string }).id,
          product_id: item.id,
          quantity: item.cartQuantity,
          price_per_unit: item.price_per_unit,
          total_price: item.price_per_unit * item.cartQuantity,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        for (const item of items) {
          const { error: updateError } = await supabase
            .from('products')
            .update({
              quantity_available: item.quantity_available - item.cartQuantity,
            })
            .eq('id', item.id);

          if (updateError) throw updateError;
        }
      }

      clearCart();
      alert('Order placed successfully!');
      onNavigate('buyer-orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">Add products from the marketplace</p>
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ShoppingCart size={32} className="text-green-600" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    ₹{item.price_per_unit}/{item.unit}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium">{item.cartQuantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        disabled={item.cartQuantity >= item.quantity_available}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-sm text-gray-600">
                      Subtotal: ₹{(item.price_per_unit * item.cartQuantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{getTotalAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Enter delivery address"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="upi">UPI</option>
                <option value="card">Credit/Debit Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallet</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              {processing ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
