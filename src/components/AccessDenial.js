import React from 'react';
import { Ban, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Renders a full-screen "Access Denied" page.
 *
 * This component is designed to be displayed when a user attempts to access a page
 * for which they do not have the necessary permissions. It features a large icon,
 * a clear message, and a button to help the user navigate away.
 *
 * @returns {JSX.Element} The AccessDenied component.
 */
function AccessDenied() {
    // useNavigate hook is used to programmatically navigate the user
    const navigate = useNavigate();

    // Function to handle the "Go Back" button click
    const handleGoBack = () => {
        // Navigates back to the previous page in the history stack
        navigate('/login');
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center max-w-xl w-full">
                {/* Large ban icon to visually indicate lack of access */}
                <div className="flex justify-center mb-6">
                    <Ban size={96} className="text-red-500" />
                </div>

                {/* Main heading for the access denied message */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Access Denied</h1>

                {/* Subtitle with a more detailed explanation */}
                <p className="text-lg text-gray-500 font-medium mb-8">
                    You do not have the required permissions to view this page.
                </p>

                {/* A button to help the user navigate back */}
                <button
                    onClick={handleGoBack}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-colors shadow-md"
                >
                    <ChevronLeft size={20} />
                    Go Back
                </button>
            </div>
        </div>
    );
}

export default AccessDenied;
