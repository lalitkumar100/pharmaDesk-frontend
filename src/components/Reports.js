import React from 'react';
import { Building2, FileText, Calendar, BarChart3, ChevronRight } from 'lucide-react';
import BoxLoader from "./BoxLoader";
const reportCards = [
  {
    id: 1,
    icon: Building2,
    title: "Supplier Reports",
    description: "Track purchases by wholesaler",
    iconColor: "text-purple-600",
    bgHover: "hover:bg-purple-200",
  },
  {
    id: 2,
    icon: FileText,
    title: "Expiring Stock",
    description: "Monitor upcoming expirations",
    iconColor: "text-red-600",
    bgHover: "hover:bg-red-200",
  },
  {
    id: 3,
    icon: Calendar,
    title: "Sales Reports",
    description: "Analyze sales performance",
    iconColor: "text-green-600",
    bgHover: "hover:bg-green-200",
  },
  {
    id: 4,
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Detailed sales analytics",
    iconColor: "text-blue-600",
    bgHover: "hover:bg-blue-200",
  }
];

const Reports = () => {
  return (
    <div className="min-h-full bg-gray-100">
      {/* Overview Section */}
      <div className="bg-gradient-to-r from-theme-50 to-theme-100 rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Reports Dashboard</h1>
        <p className="text-gray-600 text-lg mb-6">
          Access various reports to gain insights into your pharmacy operations
        </p>
        {/* New Greenish Card */}
        <div className="bg-theme-200 text-theme-800 p-4 rounded-lg flex items-center justify-between shadow-sm">
          <p className="font-semibold">Quick Insight:</p>
          <p className="text-sm">Sales are up 12% this month!</p>
          <ChevronRight size={20} className="text-theme-600" />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl 
                transition-all duration-300 ease-in-out hover:-translate-y-1 cursor-pointer
                ${card.bgHover}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 ${card.iconColor}`}>
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-500">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
