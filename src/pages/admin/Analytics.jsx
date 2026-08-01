import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart as BarChartIcon } from 'lucide-react';

const Analytics = () => {
  // Mock Data for Analytics
  const monthlyRevenue = [
    { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 }, { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 }, { name: 'Aug', revenue: 4100 },
    { name: 'Sep', revenue: 3800 }, { name: 'Oct', revenue: 4300 },
    { name: 'Nov', revenue: 5100 }, { name: 'Dec', revenue: 6200 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home', value: 300 },
    { name: 'Beauty', value: 200 },
  ];
  const COLORS = ['#0D8ABC', '#3B82F6', '#10B981', '#F59E0B'];

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
            <BarChartIcon className="w-8 h-8 text-primary" />
            Analytics
          </h1>
          <p className="text-neutral mt-1">Deep dive into your store's performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-6">Monthly Revenue (Yearly)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0D8ABC" strokeWidth={3} dot={{r: 4, fill: '#0D8ABC', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-6">Sales by Category</h2>
          <div className="h-80 flex flex-col sm:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%" className="flex-1">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full sm:w-1/3 flex flex-col gap-3 justify-center mt-4 sm:mt-0">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-neutral-dark">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional full width chart if needed */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-6">Customer Traffic (Last 30 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue.slice(0, 10)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
    </motion.div>
  );
};

export default Analytics;
