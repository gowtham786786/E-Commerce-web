import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';
import { Users, Package, ShoppingCart, DollarSign, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0, todaysRevenue: 0,
    totalOrders: 0, pendingOrders: 0,
    totalProducts: 0, outOfStock: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [chartData, setChartData] = useState([
    { name: 'Mon', revenue: 0, orders: 0 },
    { name: 'Tue', revenue: 0, orders: 0 },
    { name: 'Wed', revenue: 0, orders: 0 },
    { name: 'Thu', revenue: 0, orders: 0 },
    { name: 'Fri', revenue: 0, orders: 0 },
    { name: 'Sat', revenue: 0, orders: 0 },
    { name: 'Sun', revenue: 0, orders: 0 },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        let totalRevenue = 0;
        let todaysRevenue = 0;
        let pendingOrders = 0;
        const today = new Date();
        today.setHours(0,0,0,0);

        // Generate last 7 days dynamically
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0,0,0,0);
          return d;
        });
        
        const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const chartDataMap = last7Days.map(date => ({
          dateObj: date,
          name: dayNamesShort[date.getDay()], // Keep day names for X axis
          revenue: 0,
          orders: 0
        }));

        ordersSnapshot.forEach(doc => {
          const data = doc.data();
          totalRevenue += data.total || 0;
          if (data.status === 'pending') pendingOrders++;
          if (data.createdAt?.toDate() >= today) {
            todaysRevenue += data.total || 0;
          }
          
          if (data.createdAt) {
            const date = data.createdAt.toDate();
            date.setHours(0,0,0,0);
            
            // Find if this date falls in our last 7 days window
            const dayEntry = chartDataMap.find(d => d.dateObj.getTime() === date.getTime());
            if (dayEntry) {
                dayEntry.revenue += convertUsdToInr(data.total || 0);
                dayEntry.orders += 1;
            }
          }
        });

        // Clean up the dateObj before setting state to avoid Recharts issues
        const finalChartData = chartDataMap.map(({dateObj, ...rest}) => rest);
        // Rename the last item to 'Today' for clarity
        if (finalChartData.length > 0) {
           finalChartData[finalChartData.length - 1].name = 'Today';
        }
        setChartData(finalChartData);

        const productsSnapshot = await getDocs(collection(db, 'products'));
        let outOfStock = 0;
        productsSnapshot.forEach(doc => {
          if (doc.data().stock <= 0) outOfStock++;
        });
        
        const usersSnapshot = await getDocs(collection(db, 'users'));

        setStats({
          totalRevenue, todaysRevenue,
          totalOrders: ordersSnapshot.size, pendingOrders,
          totalProducts: productsSnapshot.size, outOfStock,
          totalCustomers: usersSnapshot.size
        });

        const recentOrdersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentOrdersSnap = await getDocs(recentOrdersQuery);
        const recent = [];
        recentOrdersSnap.forEach(doc => recent.push({ id: doc.id, ...doc.data() }));
        setRecentOrders(recent);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(convertUsdToInr(stats.totalRevenue)), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+12%' },
    { title: "Today's Revenue", value: formatCurrency(convertUsdToInr(stats.todaysRevenue)), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+5%' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+18%' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', trend: '-2%' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+3%' },
    { title: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', trend: '-1%' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+24%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-neutral mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith('+');
          return (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 relative overflow-hidden group hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-neutral text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-neutral-dark">{stat.value}</h3>
              </div>
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-6">Revenue Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D8ABC" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D8ABC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} tickFormatter={(value) => `₹${value}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0D8ABC" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-6">Weekly Orders</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-6 border-b border-neutral-light flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-neutral-dark">Latest Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-neutral-light text-neutral-dark text-sm">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-accent-light/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-primary">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-neutral-dark">{order.customer?.name || 'Guest'}</p>
                    </td>
                    <td className="p-4 text-sm text-neutral">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-sm font-bold text-neutral-dark">{formatCurrency(convertUsdToInr(order.total))}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'}
                      `}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-neutral">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
