import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerProducts from './pages/farmer/FarmerProducts';
import Marketplace from './pages/buyer/Marketplace';
import Cart from './pages/buyer/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'farmer') setCurrentPage('farmer-products');
      else if (profile.role === 'buyer') setCurrentPage('marketplace');
      else if (profile.role === 'admin') setCurrentPage('admin-dashboard');
    } else if (!loading && !user) {
      setCurrentPage('landing');
    }
  }, [user, profile, loading]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'register') return <Register onNavigate={handleNavigate} />;
    if (currentPage === 'login') return <Login onNavigate={handleNavigate} />;
    return <Landing onNavigate={handleNavigate} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'farmer-products': return <FarmerProducts />;
      case 'farmer-orders': return <Orders />;
      case 'marketplace': return <Marketplace />;
      case 'cart': return <Cart onNavigate={handleNavigate} />;
      case 'buyer-orders': return <Orders />;
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-products':
      case 'admin-orders':
        return <AdminDashboard />;
      default:
        if (profile?.role === 'farmer') return <FarmerProducts />;
        if (profile?.role === 'buyer') return <Marketplace />;
        if (profile?.role === 'admin') return <AdminDashboard />;
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      {renderPage()}
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
