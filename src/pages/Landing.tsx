import { Sprout, ShoppingBag, Users, TrendingUp } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
              <Sprout size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart AgroConnect
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting farmers directly with consumers. Empowering agriculture through technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp size={32} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Price Recommendations</h3>
            <p className="text-gray-600">
              Get intelligent pricing suggestions based on market trends and demand
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Marketplace</h3>
            <p className="text-gray-600">
              Buy fresh produce directly from farmers without intermediaries
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Users size={32} className="text-orange-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Community Connect</h3>
            <p className="text-gray-600">
              Build direct relationships between farmers and consumers
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Register Now
          </button>
        </div>

        <div className="mt-20 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Register</h3>
              <p className="text-gray-600">Sign up as a farmer or buyer</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">List or Browse</h3>
              <p className="text-gray-600">Farmers list products, buyers browse marketplace</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect & Trade</h3>
              <p className="text-gray-600">Direct transaction between farmer and buyer</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-sm text-green-700 font-medium">Admin Login: kruthi@gmail.com &nbsp;|&nbsp; Password: Kruthi@123</p>
        </div>
      </div>
    </div>
  );
}
