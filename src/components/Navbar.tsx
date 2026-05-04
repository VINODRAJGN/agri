import { ShoppingCart, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = profile?.role === 'farmer'
    ? [
        { label: 'My Products', page: 'farmer-products' },
        { label: 'Orders', page: 'farmer-orders' },
      ]
    : profile?.role === 'buyer'
    ? [
        { label: 'Marketplace', page: 'marketplace' },
        { label: 'My Orders', page: 'buyer-orders' },
      ]
    : profile?.role === 'admin'
    ? [
        { label: 'Dashboard', page: 'admin-dashboard' },
        { label: 'Users', page: 'admin-users' },
        { label: 'Products', page: 'admin-products' },
        { label: 'Orders', page: 'admin-orders' },
      ]
    : [];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate(profile?.role === 'buyer' ? 'marketplace' : profile?.role === 'farmer' ? 'farmer-products' : 'admin-dashboard')}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="text-xl font-bold text-green-700">Smart AgroConnect</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {profile?.role === 'buyer' && (
              <button
                onClick={() => onNavigate('cart')}
                className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <ShoppingCart size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center space-x-2 text-sm">
              <User size={20} className="text-gray-600" />
              <span className="text-gray-700 font-medium">{profile?.full_name}</span>
              <span className="text-gray-500 text-xs">({profile?.role})</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  currentPage === item.page
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center space-x-2">
                <User size={20} />
                <span>{profile?.full_name}</span>
              </div>
              <button onClick={handleSignOut} className="text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
