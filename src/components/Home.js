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
  UserCircle,
  ShoppingBag, // Added a new icon for the "New Sale" button
} from 'lucide-react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';

// Import all the components that will be rendered inside Home
import Reports from './Reports';
import AddStock from './AddStock';
import StockManagement from './StockManagement';
import EmployeeForm from './EmployeeForm';
import StaffDirectory from './StaffDirectory';
import Billing from './Billing';

// Define menu items with their names, icons, and paths
const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/home' },
  { name: 'Add Stock', icon: Plus, path: '/home/addStock' },
  { name: 'Stock', icon: Package, path: '/home/stock' },
  { name: 'Reports', icon: BarChart3, path: '/home/reports' },
  { name: 'Staff', icon: UserCircle, path: '/home/staff' },
  { name: 'Todo List', icon: Menu, path: '/home/todo' },
];

// A placeholder component for the Dashboard
const Dashboard = () => (
  <div className="p-4 sm:p-6 bg-white rounded-lg shadow-lg">
    <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-theme-700">Dashboard</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      <div className="bg-theme-50 rounded-xl shadow p-4 md:p-6 flex flex-col items-center">
        <span className="text-3xl md:text-4xl font-bold text-theme-600 mb-2">120</span>
        <span className="text-gray-500">Total Medicines</span>
      </div>
      <div className="bg-theme-50 rounded-xl shadow p-4 md:p-6 flex flex-col items-center">
        <span className="text-3xl md:text-4xl font-bold text-green-500 mb-2">15</span>
        <span className="text-gray-500">Low Stock</span>
      </div>
    </div>
    <div className="mt-6 md:mt-8">
      <h2 className="text-lg md:text-xl font-semibold mb-2 text-theme-700">Welcome to pharmaDesk</h2>
      <p className="text-gray-600">
        Easily manage your pharmacy inventory, add new stock, and view insightful reports.
      </p>
    </div>
  </div>
);

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Determines if a menu item should be highlighted as active based on the current URL path.
   * @param {string} path - The path of the menu item.
   * @returns {boolean} True if the menu item is active, false otherwise.
   */
  const isMenuItemActive = (path) => {
    // Special case for dashboard to match only the exact path to avoid false positives
    if (path === '/home') {
      return location.pathname === '/home';
    }
    // For other paths, check if the current location's pathname starts with the menu item's path
    return location.pathname.startsWith(path);
  };

  /**
   * Gets the title of the current page to display in the header breadcrumb.
   * @returns {string} The title of the current page.
   */
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => isMenuItemActive(item.path));

    if (activeItem) {
      return activeItem.name;
    }

    // Handle specific cases for dynamic routes or nested pages
    if (currentPath.startsWith('/home/staff/add')) {
      return 'Add Staff';
    }
    if (currentPath.startsWith('/home/staff/update')) {
      return 'Update Staff';
    }
    // Fallback to Dashboard if no specific match is found
    return 'Dashboard';
  };

  // Handler for the new button
  const handleNewSaleClick = () => {
    // This is where you would define the action for the button, e.g., navigate to a new sale page
    navigate('/home/billing');
    // Example: navigate('/home/new-sale');
  };

  return (
    <div className="relative z-0 min-h-screen flex bg-gradient-to-br from-theme-50 to-theme-100">
      {/* Sidebar - Responsive for mobile (fixed, slide-in) and desktop (static) */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 sm:w-72 bg-white border-r border-theme-200 shadow-lg transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none lg:border-r
        `}
      >
        {/* Sidebar Header/Logo */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-theme-100">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-theme-700 rounded-full flex items-center justify-center">
              {/* Pharmacy icon (simple SVG) */}
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-theme-700 tracking-tight">pharmaDesk</span>
          </div>
          {/* Close sidebar button for mobile */}
          <button className="lg:hidden p-2 rounded-md hover:bg-theme-100" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="w-6 sm:w-7 h-6 sm:h-7 text-gray-400 hover:text-theme-700" />
          </button>
        </div>
        {/* Navigation Links */}
        <nav className="mt-6 sm:mt-8 px-2">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.name}>
                <button
                  className={`flex items-center w-full px-5 sm:px-7 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-medium transition duration-150 ease-in-out
                    ${isMenuItemActive(item.path)
                      ? 'bg-theme-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-theme-100 hover:text-theme-900'
                    }`}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Logout Button */}
        <div className="absolute bottom-0 w-full px-4 sm:px-6 py-4 sm:py-5 border-t border-theme-100">
          <button className="flex items-center space-x-2 text-gray-500 hover:text-red-600 font-medium w-full justify-center p-2 rounded-md hover:bg-red-50 transition-colors">
            <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar with Breadcrumb and Profile Icon */}
        <header
          className={`
            sticky top-0 ${sidebarOpen ? 'z-10' : 'z-30'}
            bg-white/80 backdrop-blur border-b border-theme-100
            flex items-center px-4 sm:px-6 py-3 sm:py-4 shadow-sm
          `}
        >
          {/* Open sidebar button for mobile */}
          <button
            className="lg:hidden mr-3 sm:mr-4 p-2 rounded-md text-theme-600 hover:text-theme-900 hover:bg-theme-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 sm:w-7 h-6 sm:h-7" />
          </button>
          <nav className="flex items-center justify-between w-full">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-500">
              <span className="capitalize font-semibold text-theme-700">Home</span>
              <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
              <span className="font-bold text-theme-900">{getCurrentPageTitle()}</span>
            </div>
            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-full bg-theme-100 hover:bg-theme-200 text-theme-600 transition-colors"
              aria-label="View profile"
            >
              <UserCircle className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </nav>
        </header>

        {/* Page Content Area - This is where your routed components render */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-64px)] relative">
          {/* Define your routes here */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="staff" element={<StaffDirectory />} />
            <Route path="staff/add" element={<EmployeeForm mode="add" />} />
            <Route path="staff/update/:id" element={<EmployeeForm mode="update" />} />
            <Route path="addStock" element={<AddStock />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="billing" element={<Billing />} /> {/* Add this line */}
            <Route path="todo" element={
              <div className="p-4 sm:p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-theme-700">Todo List</h1>
                <div className="bg-theme-50 rounded-xl shadow p-4 md:p-6">
                  <p className="text-gray-600">Todo functions will be implemented here.</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>

      {/* Fixed Button at the bottom middle */}
      <button
        onClick={handleNewSaleClick}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-theme-600 text-white shadow-lg
                   hover:bg-theme-700 transition-colors duration-200 ease-in-out
                   px-6 py-3 rounded-full flex items-center space-x-2
                   text-lg font-semibold"
      >
        <ShoppingBag className="w-6 h-6" />
        <span>New Sale</span>
      </button>
    </div>
  );
};

export default Home;