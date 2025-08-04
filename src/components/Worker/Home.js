import React, { useState } from 'react';
import {
    UserCircle,
    Package,
    ShoppingBag,
    CalendarDays,
    Shell, // Import the Shell icon for the chatbot button
    X, // Import the X icon for closing the chatbot sidebar
} from 'lucide-react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';

// Import all the components that will be rendered inside Worker
import StockManagement from './workerStock';
import ChatbotApp from '../ChatbotApp'; // Import the Chatbot App component
import Billing from '../Billing';
/**
 * Worker component for a simplified dashboard.
 *
 * This component provides a streamlined interface for a worker role,
 * featuring a top bar and four prominent action buttons for
 * "Stock", "Expiry", "New Sales", and "Chatbot". The chatbot is
 * implemented as a sliding sidebar.
 *
 * @returns {JSX.Element} The Worker component.
 */
const Worker = () => {
    // useNavigate hook to handle programmatic navigation
    const navigate = useNavigate();
    const location = useLocation();

    // State to manage the visibility of the chatbot sidebar
    const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

    // Handler for the "Stock" button
    const handleStockClick = () => {
        // Navigate to the stock management page
        navigate('/worker/stock');
    };

    // Handler for the "Expiry" button
    const handleExpiryClick = () => {
        // Navigate to the expiry page
        // navigate('/worker/expiry');
    };

    // Handler for the "New Sales" button
    const handleNewSalesClick = () => {
        // Navigate to the billing page for new sales
        navigate('/worker/billing');
    };

    // Handler for the "Chatbot" button
    const handleChatbotClick = () => {
        // Toggle the chatbot sidebar visibility
        setChatSidebarOpen(!chatSidebarOpen);
    };

    // A helper function to determine the current page title
    const getCurrentPageTitle = () => {
        if (location.pathname.startsWith('/worker/stock')) return 'Stock Management';
        if (location.pathname.startsWith('/worker/expiry')) return 'Expiry Tracking';
        if (location.pathname.startsWith('/worker/billing')) return 'New Sales';
        // When chatbot is a sidebar, its title won't be in the path.
        // It's part of the main dashboard view.
        return 'Worker Dashboard';
    };

    return (
        <div className="relative z-0 min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 font-sans">
            {/* Top Bar - Simplified without a sidebar toggle */}
            <header
                className={`
                    sticky top-0 z-30
                    bg-white/80 backdrop-blur border-b border-gray-100
                    flex items-center px-4 sm:px-6 py-3 sm:py-4 shadow-sm
                `}
            >
                <nav className="flex items-center justify-between w-full">
                    {/* Page Title */}
                    <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-500">
                        <span className="capitalize font-semibold text-gray-700">
                            {getCurrentPageTitle()}
                        </span>
                    </div>
                    {/* Profile Button */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        aria-label="View profile"
                    >
                        <UserCircle className="w-5 sm:w-6 h-5 sm:h-6" />
                    </button>
                </nav>
            </header>

            {/* Main Content Area with Large Buttons */}
            <main className="flex-1 p-2 sm:p-6 overflow-y-auto relative flex items-center justify-center">
                {/* Routes for the different pages */}
                <Routes>
                    <Route index element={
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
                                {/* "Stock" Button */}
                                <button
                                    onClick={handleStockClick}
                                    className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out p-8 md:p-12
                                               text-blue-600 hover:text-white hover:bg-blue-600 group"
                                >
                                    <Package className="w-20 h-20 md:w-24 md:h-24 mb-4 transform transition-transform group-hover:scale-110" />
                                    <span className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-white">Stock</span>
                                </button>

                                {/* "Expiry" Button */}
                                <button
                                    onClick={handleExpiryClick}
                                    className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out p-8 md:p-12
                                               text-amber-600 hover:text-white hover:bg-amber-600 group"
                                >
                                    <CalendarDays className="w-20 h-20 md:w-24 md:h-24 mb-4 transform transition-transform group-hover:scale-110" />
                                    <span className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-white">Expiry</span>
                                </button>

                                {/* "New Sales" Button */}
                                <button
                                    onClick={handleNewSalesClick}
                                    className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out p-8 md:p-12
                                               text-green-600 hover:text-white hover:bg-green-600 group"
                                >
                                    <ShoppingBag className="w-20 h-20 md:w-24 md:h-24 mb-4 transform transition-transform group-hover:scale-110" />
                                    <span className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-white">New Sales</span>
                                </button>

                                {/* "Chatbot" Button */}
                                <button
                                    onClick={handleChatbotClick}
                                    className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out p-8 md:p-12
                                               text-purple-600 hover:text-white hover:bg-purple-600 group"
                                >
                                    <Shell className="w-20 h-20 md:w-24 md:h-24 mb-4 transform transition-transform group-hover:scale-110" />
                                    <span className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-white">Chatbot</span>
                                </button>
                            </div>
                        </div>
                    } />
                    <Route path="stock" element={<StockManagement />} />
                    {/* <Route path="expiry" element={<Expiry />} /> */}
                    <Route path="billing" element={<Billing />} />
                </Routes>
            </main>

            {/* The Chatbot Sidebar (using ChatbotApp component) */}
            <div
                className={`fixed top-0 right-0 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
                            ${chatSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                            max-sm:w-full sm:w-96 md:w-80 lg:w-96 // Responsive width
                            z-[60]
                        `}
            >
                <ChatbotApp onClose={() => setChatSidebarOpen(false)} />
            </div>

            {/* Overlay for chat sidebar - shows only on mobile */}
            {chatSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-50 sm:hidden"
                    onClick={() => setChatSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Worker;
