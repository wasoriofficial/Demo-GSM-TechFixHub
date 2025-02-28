import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement 
} from 'chart.js';
import { getOrders } from '../utils/dataService';
import { format } from 'date-fns';
import { Banknote, CreditCard, ShoppingBag, Users } from 'lucide-react';
import { useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const orders = getOrders();
  
  // Calculate total sales by month
  const salesByMonth = useMemo(() => {
    const monthlyData: Record<string, number> = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      const monthYear = format(orderDate, 'MMM yyyy');
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += order.amount;
    });
    
    // Get last 6 months
    const months = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    }).slice(-6);
    
    return {
      labels: months,
      values: months.map(month => monthlyData[month])
    };
  }, [orders]);

  const chartData = {
    labels: salesByMonth.labels,
    datasets: [
      {
        label: 'Total Sales',
        data: salesByMonth.values,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Sales Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  // Calculate stats
  const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
  const totalUsers = new Set(orders.map(order => order.userId)).size;
  const totalProducts = new Set(orders.map(order => order.productId)).size;
  const totalOrders = orders.length;

  // Format to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const statsCards = [
    { title: 'Total Sales', value: formatIDR(totalSales), icon: <Banknote className="text-blue-600" size={24} /> },
    { title: 'Total Users', value: totalUsers, icon: <Users className="text-green-600" size={24} /> },
    { title: 'Total Products', value: totalProducts, icon: <ShoppingBag className="text-purple-600" size={24} /> },
    { title: 'Total Orders', value: totalOrders, icon: <CreditCard className="text-orange-600" size={24} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-semibold mt-2">{card.value}</p>
              </div>
              <div className="p-2 rounded-full bg-gray-50">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Line data={chartData} options={chartOptions} height={80} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(-5).reverse().map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{order.productName}</p>
                  <p className="text-sm text-gray-500">{format(new Date(order.date), 'MMM dd, yyyy')}</p>
                </div>
                <p className="font-semibold">{formatIDR(order.amount)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Category Performance</h2>
          <div className="space-y-3">
            {['IMEI', 'FILE', 'SERVER', 'REMOTE'].map(category => {
              const categoryOrders = orders.filter(order => order.category === category);
              const total = categoryOrders.reduce((sum, order) => sum + order.amount, 0);
              const percentage = orders.length > 0 ? (categoryOrders.length / orders.length) * 100 : 0;
              
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between">
                    <p>{category} Services</p>
                    <p className="font-medium">{formatIDR(total)}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
