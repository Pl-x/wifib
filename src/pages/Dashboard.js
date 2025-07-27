import React from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/ui/StatCard';
import { Users, Wifi, DollarSign, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const { customers, bills, payments, activities } = useData();

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeConnections = customers.filter(c => c.status === 'active').length;
  const monthlyRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = bills.filter(bill => bill.status === 'pending').length;

  // Revenue data for chart
  const revenueData = [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 9200 },
    { month: 'Mar', revenue: 8800 },
    { month: 'Apr', revenue: 10500 },
    { month: 'May', revenue: 11200 },
    { month: 'Jun', revenue: 12100 },
    { month: 'Jul', revenue: monthlyRevenue },
  ];

  // Customer distribution data
  const customerDistribution = [
    { name: 'Basic Plan', value: customers.filter(c => c.plan.includes('Basic')).length, color: '#ff6b6b' },
    { name: 'Premium Plan', value: customers.filter(c => c.plan.includes('Premium')).length, color: '#4ecdc4' },
    { name: 'Ultra Plan', value: customers.filter(c => c.plan.includes('Ultra')).length, color: '#45b7d1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold">Welcome to Легион Коннекшнс</h1>
        <p className="text-blue-100 mt-2">WiFi Service and Billing Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          trend="up"
          trendValue="+12%"
          color="blue"
        />
        <StatCard
          title="Active Connections"
          value={activeConnections}
          icon={Wifi}
          trend="up"
          trendValue="+8%"
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₽${monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+15%"
          color="purple"
        />
        <StatCard
          title="Pending Payments"
          value={pendingPayments}
          icon={Clock}
          trend="down"
          trendValue="-5%"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution by Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {customerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {customerDistribution.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {activity.customer.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.customer}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{activity.time}</span>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${activity.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                  ${activity.status === 'active' ? 'bg-blue-100 text-blue-800' : ''}
                  ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                `}>
                  {activity.status === 'paid' ? 'Paid' : 
                   activity.status === 'active' ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 