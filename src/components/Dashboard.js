import React from 'react';
import { ShoppingCart, Package, Wallet, AlertTriangle, DollarSign, ArrowUp } from 'lucide-react';

// Main Dashboard component
const Dashboard = () => { // Renamed App to Dashboard
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Daily Sales Card */}
          <DashboardCard
            icon={<ShoppingCart className="w-6 h-6 text-blue-500" />}
            title="Daily Sales"
            items={[
              { label: 'Total Sales', value: '₹2,45,000', highlight: true },
              { label: '', value: '+12%', icon: <ArrowUp className="w-4 h-4 text-green-500 inline-block mr-1" />, color: 'text-green-500' },
              { label: 'Profit', value: '₹73,500' },
            ]}
            borderColor="border-blue-200"
            shadowColor="shadow-blue-100"
          />

          {/* Stock Value Card */}
          <DashboardCard
            icon={<Package className="w-6 h-6 text-blue-500" />}
            title="Stock Value"
            items={[
              { label: 'Total Stock', value: '₹18,75,000', highlight: true },
              { label: '', value: '2,450 items', color: 'text-gray-500 text-sm' },
            ]}
            borderColor="border-blue-200"
            shadowColor="shadow-blue-100"
          />

          {/* Unpaid Stock Card */}
          <DashboardCard
            icon={<Wallet className="w-6 h-6 text-blue-500" />}
            title="Unpaid Stock"
            items={[
              { label: 'Unpaid', value: '₹3,25,000', highlight: true, color: 'text-red-500' },
              { label: '', value: '485 items', color: 'text-gray-500 text-sm' },
            ]}
            borderColor="border-blue-200"
            shadowColor="shadow-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expiring This Month Card */}
          <DashboardCard
            icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
            title="Expiring This Month"
            items={[
              { label: 'Expiring Quantity', value: '1,250 units', highlight: true, color: 'text-orange-600' },
              { label: '', value: '45 products', color: 'text-gray-500 text-sm' },
            ]}
            borderColor="border-orange-200"
            shadowColor="shadow-orange-100"
          />

          {/* Expiry Value Card */}
          <DashboardCard
            icon={<DollarSign className="w-6 h-6 text-orange-500" />}
            title="Expiry Value"
            items={[
              { label: 'Expiry Amount', value: '₹1,85,000', highlight: true, color: 'text-red-600' },
              { label: '', value: 'Potential loss', color: 'text-gray-500 text-sm' },
            ]}
            borderColor="border-orange-200"
            shadowColor="shadow-orange-100"
          />
        </div>
      </div>
    </div>
  );
};

// Reusable Dashboard Card Component
const DashboardCard = ({ icon, title, items, borderColor, shadowColor }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${shadowColor} border-t-4 ${borderColor} transition-all duration-300 hover:scale-[1.01]`}>
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-gray-700 ml-3">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col">
            {item.label && <span className="text-gray-500 text-sm">{item.label}</span>}
            <div className={`flex items-center ${item.highlight ? 'text-2xl font-bold' : 'text-base'} ${item.color || 'text-gray-800'}`}>
              {item.icon && item.icon}
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; // Exported Dashboard instead of App
