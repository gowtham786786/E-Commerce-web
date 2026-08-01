import { DollarSign, Package, ShoppingCart } from 'lucide-react';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';

const SellerDashboard = () => {
  // Placeholder stats for the seller dashboard. In a real app, you would fetch these from Firestore where the product's sellerId matches the current user.
  const stats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0
  };

  const statCards = [
    { title: 'My Revenue', value: formatCurrency(convertUsdToInr(stats.totalRevenue)), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'My Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'My Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-dark mb-8">Seller Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-light flex items-center">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} mr-4`}>
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-neutral font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-neutral-dark">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
        <h2 className="text-xl font-bold text-neutral-dark mb-4">Recent Orders</h2>
        <div className="text-center py-8 text-neutral">
          No orders yet.
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
