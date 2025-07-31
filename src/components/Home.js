import React, { useState } from 'react';
import {
  Home as HomeIcon,
  Plus,
  Package,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  LogOut,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Reports from './Reports';
import StaffDirectory from './StaffDirectory';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon },
  { name: 'Add Stock', icon: Plus },
  { name: 'Stock', icon: Package },
  { name: 'Report', icon: BarChart3 },
  { name: 'Staff', icon: UserCircle },
  { name: 'Todo List', icon: Menu }
];

const pageContent = {
  Dashboard: (
    <div>
      <h1 className="text-3xl font-extrabold mb-4 text-aqua-blue-700">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-sky-600 mb-2">120</span>
          <span className="text-gray-500">Total Medicines</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-green-500 mb-2">15</span>
          <span className="text-gray-500">Low Stock</span>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2 text-sky-700">Welcome to pharmaDesk</h2>
        <p className="text-gray-600">
          Easily manage your pharmacy inventory, add new stock, and view insightful reports.
        </p>
      </div>
    </div>
  ),
  'Add Stock': (
    <div>
      <h1 className="text-3xl font-extrabold mb-4 text-sky-700">Add Stock</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-600">Add new medicines to your inventory.</p>
        {/* Add Stock form goes here */}
      </div>
    </div>
  ),
  Stock: (
    <div>
      <h1 className="text-3xl font-extrabold mb-4 text-sky-700">Stock</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-600">View and manage your current stock.</p>
        {/* Stock table goes here */}
      </div>
    </div>
  ),
  Report: (
    <Reports />
  ),
  'Todo List': (
    <div>
      <h1 className="text-3xl font-extrabold mb-4 text-sky-700">Todo List</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-600">Todo functions.</p>
        {/* Reports/analytics go here */}
      </div>
    </div>
  ),
  Staff: (
    <StaffDirectory />
  )
};

const Home = () => {
  const [active, setActive] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 inset-y-0 left-0 w-72 bg-white border-r border-sky-200 shadow-lg transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-sky-100">
          <span className="text-2xl font-extrabold text-sky-700 tracking-tight">pharmaDesk</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-7 h-7 text-gray-400 hover:text-sky-700" />
          </button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.name}>
                <button
                  className={`flex items-center w-full px-7 py-3 rounded-lg text-lg font-medium transition
                    ${active === item.name
                      ? 'bg-sky-500 text-white shadow'
                      : 'text-gray-700 hover:bg-sky-100 hover:text-sky-900'
                    }`}
                  onClick={() => {
                    setActive(item.name);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-6 h-6 mr-3" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full px-6 py-5 border-t border-sky-100">
          <button className="flex items-center space-x-2 text-gray-500 hover:text-red-600 font-medium w-full justify-center">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-h-screen">
        {/* Top Bar with Breadcrumb */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-sky-100 flex items-center px-6 py-4 shadow-sm">
          <button
            className="lg:hidden mr-4 p-2 rounded-md text-sky-600 hover:text-sky-900 hover:bg-sky-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-7 h-7" />
          </button>
          <nav className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 text-base text-gray-500">
              <span className="capitalize font-semibold text-sky-700">Home</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
              <span className="font-bold text-sky-900">{active}</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors"
            >
              <UserCircle className="w-6 h-6" />
            </button>
          </nav>
        </header>
        {/* Main Page Content */}
        <main className="flex-1 p-2">
          {pageContent[active]}
        </main>
      </div>
    </div>
  );
};

export default Home;