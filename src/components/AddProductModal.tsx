import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AddProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Dairy',
  'Others',
];

const units = ['kg', 'quintal', 'ton', 'piece', 'dozen', 'liter'];

export default function AddProductModal({
  product,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    price_per_unit: '',
    unit: 'kg',
    quantity_available: '',
    image_url: '',
    location: profile?.city || '',
  });
  const [loading, setLoading] = useState(false);
  const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price_per_unit: product.price_per_unit.toString(),
        unit: product.unit,
        quantity_available: product.quantity_available.toString(),
        image_url: product.image_url || '',
        location: product.location || '',
      });
    }
  }, [product]);

  const getAIPriceRecommendation = async () => {
    if (!formData.name || !formData.category) {
      alert('Please enter product name and category first');
      return;
    }

    setLoadingRecommendation(true);

    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('price')
        .eq('category', formData.category)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const avgPrice = data.reduce((sum, item) => sum + Number(item.price), 0) / data.length;
        const adjustedPrice = avgPrice * (0.9 + Math.random() * 0.2);
        setRecommendedPrice(Math.round(adjustedPrice * 100) / 100);
      } else {
        const basePrices: Record<string, number> = {
          Vegetables: 30,
          Fruits: 50,
          Grains: 25,
          Pulses: 80,
          Spices: 200,
          Dairy: 60,
          Others: 40,
        };
        const basePrice = basePrices[formData.category] || 40;
        setRecommendedPrice(basePrice * (0.9 + Math.random() * 0.2));
      }
    } catch (error) {
      console.error('Error getting price recommendation:', error);
      alert('Failed to get price recommendation');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const productData = {
        seller_id: user.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price_per_unit: parseFloat(formData.price_per_unit),
        unit: formData.unit,
        quantity_available: parseFloat(formData.quantity_available),
        image_url: formData.image_url,
        location: formData.location,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);

        if (error) throw error;

        await supabase.from('price_history').insert([
          {
            product_name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price_per_unit),
            location: formData.location,
          },
        ]);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={getAIPriceRecommendation}
                  disabled={loadingRecommendation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  AI Price
                </button>
              </div>
              {recommendedPrice && (
                <p className="text-sm text-blue-600 mt-1">
                  Recommended: ₹{recommendedPrice.toFixed(2)}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, price_per_unit: recommendedPrice.toString() })}
                    className="ml-2 text-blue-700 underline"
                  >
                    Use this
                  </button>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Available
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity_available}
                onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
