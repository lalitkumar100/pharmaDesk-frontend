import React from 'react';
import { Building2, FileText, Calendar, BarChart3, ChevronRight } from 'lucide-react';

const reportCards = [
  {
    id: 1,
    icon: Building2,
    title: "Supplier Reports",
    description: "Track purchases by wholesaler",
    iconColor: "text-purple-600",
    bgHover: "hover:bg-purple-50",
  },
  {
    id: 2,
    icon: FileText,
    title: "Expiring Stock",
    description: "Monitor upcoming expirations",
    iconColor: "text-red-600",
    bgHover: "hover:bg-red-50",
  },
  {
    id: 3,
    icon: Calendar,
    title: "Sales Reports",
    description: "Analyze sales performance",
    iconColor: "text-green-600",
    bgHover: "hover:bg-green-50",
  },
  {
    id: 4,
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Detailed sales analytics",
    iconColor: "text-blue-600",
    bgHover: "hover:bg-blue-50",
  }
];

const Reports = () => {
  return (
    <div className="min-h-full bg-gray-100">
      {/* Overview Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Reports Dashboard</h1>
        <p className="text-gray-600 text-lg">
          Access various reports to gain insights into your pharmacy operations
        </p>
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
