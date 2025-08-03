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
  ShoppingBag,
  Shell,
} from 'lucide-react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import BoxLoader from "../looader/BoxLoader"; // Imported but not used in this snippet, assuming it's for future use.
// Import all the components that will be rendered inside Home
import Reports from './reportFeature/Reports';
import AddStock from './StockEntry/AddStock';
import StockManagement from './StockManagement';
import EmployeeForm from './StaffFeature/EmployeeForm';
import StaffDirectory from './StaffFeature/StaffDirectory';
import Billing from '../Billing';
import Dashboard from './Dashboard'; // Assuming this is the Dashboard component you want to render
import Wholesaler from './reportFeature/wholesaler';
import Invoice from './reportFeature/invoice';
// Import the Chatbot App component
import ChatbotApp from '../ChatbotApp'; // Assuming your chatbot component is in App.js
import Expiry from './reportFeature/expiry';

// Define menu items with their names, icons, and paths
const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/home' }, // Path for the main dashboard
  { name: 'Add Stock', icon: Plus, path: '/home/addStock' },
  { name: 'Stock', icon: Package, path: '/home/stock' },
  { name: 'Reports', icon: BarChart3, path: '/home/reports' },
  { name: 'Staff', icon: UserCircle, path: '/home/staff' },
];

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a menu item is active based on the current path
  const isMenuItemActive = (path) => {
    if (path === '/home') {
      // For the dashboard, it's active if the path is exactly /home
      return location.pathname === '/home';
    }
    // For other paths, it's active if the current path starts with the item's path
    return location.pathname.startsWith(path);
  };

  // Function to get the title of the current page for the breadcrumb
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    // Find the active menu item
    const activeItem = menuItems.find(item => isMenuItemActive(item.path));

    if (activeItem) {
      return activeItem.name;
    }

    // Handle specific sub-paths for staff management
    if (currentPath.startsWith('/home/staff/add')) {
      return 'Add Staff';
    }
    if (currentPath.startsWith('/home/staff/update')) {
      return 'Update Staff';
    }
    // Default title if no specific match is found
    return 'Dashboard';
  };

  // Handler for the "New Sale" button
  const handleNewSaleClick = () => {
    navigate('/billing');
  };

  // Handler for toggling the chat sidebar
  const handleChatToggle = () => {
    setChatSidebarOpen(!chatSidebarOpen);
  };

  return (
    <div className="relative z-0 min-h-screen flex bg-gradient-to-br from-theme-50 to-theme-100">
      {/* Existing Sidebar */}
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
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-theme-700 tracking-tight">pharmaDesk</span>
          </div>
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
        {/* Top Bar */}
        <header
          className={`
            sticky top-0 ${sidebarOpen || chatSidebarOpen ? 'z-10' : 'z-30'}
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
        <main className="flex-1 p-2 sm:p-6 overflow-y-auto relative">
          <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
  <Routes>
    {/* Default route for /home, renders the Dashboard */}
    <Route index element={<Dashboard />} /> {/* This makes /home render Dashboard */}
    <Route path="staff" element={<StaffDirectory />} />
    <Route path="staff/add" element={<EmployeeForm mode="add" />} />
    <Route path="staff/update/:id" element={<EmployeeForm mode="update" />} />
    <Route path="addStock" element={<AddStock />} />
    <Route path="stock" element={<StockManagement />} />
    <Route path="reports" element={<Reports />} />
    <Route path="billing" element={<Billing />} />
    <Route path="reports/invoice" element={<Invoice />} />
    <Route path="reports/wholesaler" element={<Wholesaler />} />
     <Route path="reports/expiry" element={<Expiry />} />
    {/* The Dashboard route is now handled by the index route for /home */}
    {/* If you specifically want /home/dashboard to work, you can add: */}
    {/* <Route path="dashboard" element={<Dashboard />} /> */}
  </Routes>
</div>
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

      {/* Shell button to toggle chat sidebar */}
      <button
        onClick={handleChatToggle}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg
                    hover:bg-blue-600 transition-colors duration-200 ease-in-out"
        aria-label="Open chat"
      >
        <Shell className="w-6 h-6" />
      </button>

      {/* The Chatbot Sidebar (using ChatbotApp component) */}
      <div
        className={`fixed top-0 right-0 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          ${chatSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          max-sm:w-full sm:w-96 md:w-80 lg:w-96 // Responsive width
          z-[60]
        `}
      >
        <ChatbotApp onClose={handleChatToggle} />
      </div>

      {/* Overlay for chat sidebar - shows only on mobile */}
      {chatSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 sm:hidden"
          onClick={handleChatToggle}
        ></div>
      )}
    </div>
  );
};

export default Home;
