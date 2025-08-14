import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OrderCard } from './components/OrderCard';
import { OrderDetails } from './components/OrderDetails';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { Payments } from './components/Payments';
import { erpnextService } from './services/erpnext';
import { SalesOrder } from './types';
import { Package, WifiOff } from 'lucide-react';

function App() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'orders' | 'payments' | 'settings'>('orders');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await erpnextService.getSalesOrders();
      
      // Fetch detailed information for each order
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order: any) => {
          try {
            const details = await erpnextService.getSalesOrderDetails(order.name);
            return {
              ...order,
              items: details.items || []
            };
          } catch (error) {
            console.error(`Error fetching details for order ${order.name}:`, error);
            return {
              ...order,
              items: []
            };
          }
        })
      );
      
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderSelect = (order: SalesOrder) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleShowSettings = () => {
    setCurrentPage('settings');
  };

  const handleBackFromSettings = () => {
    setCurrentPage('orders');
    // Refresh orders after settings change
    fetchOrders();
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handlePageChange = (page: 'orders' | 'payments' | 'settings') => {
    setCurrentPage(page);
    setSelectedOrder(null); // Reset selected order when changing pages
  };

  // Handle page routing
  if (currentPage === 'settings') {
    return (
      <>
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onClose={handleSidebarClose}
        />
        <Settings onBack={handleBackFromSettings} />
      </>
    );
  }

  if (currentPage === 'payments') {
    return (
      <>
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onClose={handleSidebarClose}
        />
        <div className="min-h-screen bg-gray-50">
          <Header 
            onRefresh={fetchOrders} 
            isRefreshing={loading} 
            onSettings={handleShowSettings}
            onMenuClick={handleMenuClick}
          />
          <Payments />
        </div>
      </>
    );
  }

  if (selectedOrder) {
    return (
      <>
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onClose={handleSidebarClose}
        />
        <OrderDetails order={selectedOrder} onBack={handleBackToList} />
      </>
    );
  }

  return (
    <>
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onClose={handleSidebarClose}
        />
      
      <div className="min-h-screen bg-gray-50">
        <Header 
          onRefresh={fetchOrders} 
          isRefreshing={loading} 
          onSettings={handleShowSettings}
          onMenuClick={handleMenuClick}
        />
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center">
            <WifiOff className="w-4 h-4 mr-2" />
            You're offline. Some features may not work.
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{orders.length}</h2>
              <p className="text-gray-600">Active Orders</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading && orders.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-red-500 mb-4">
              <WifiOff className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchOrders}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Package className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Available</h3>
            <p className="text-gray-600">There are no pending deliveries at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard 
                key={order.name} 
                order={order} 
                onClick={() => handleOrderSelect(order)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
