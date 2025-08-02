import React, { useState, useEffect } from 'react';
import BoxLoader from "./BoxLoader";
// Function to generate a random color from a predefined list
const getRandomColor = () => {
  const colors = [
    '#facc15', // Tailwind yellow-400
    '#34d399', // Tailwind green-400
    '#60a5fa', // Tailwind blue-400
    '#a78bfa', // Tailwind purple-400
    '#f87171', // Tailwind red-400
    '#e879f9', // Tailwind fuchsia-400
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// BoxLoader component displays a rotating box icon with changing colors and loading text
const BoxLoader = () => {
  // State to hold the current color for both the icon and the outer div background
  const [currentColor, setCurrentColor] = useState(getRandomColor());
  // State to manage the animated dots for "Loading..." text
  const [dots, setDots] = useState('.');

  useEffect(() => {
    // Set up an interval to change the color every 1 second
    const colorInterval = setInterval(() => {
      setCurrentColor(getRandomColor());
    }, 1000); // Change color every 1000 milliseconds (1 second)

    // Set up an interval to animate the "Loading..." dots every 0.5 seconds
    const dotsInterval = setInterval(() => {
      setDots(prevDots => {
        // Cycle through '.', '..', '...'
        if (prevDots === '...') {
          return '.';
        }
        return prevDots + '.';
      });
    }, 500); // Update dots every 500 milliseconds (0.5 seconds)

    // Cleanup function: Clear intervals when the component unmounts
    return () => {
      clearInterval(colorInterval);
      clearInterval(dotsInterval);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className="flex flex-col items-center justify-center p-8 text-white">
      {/* Container div for the loader icon - now its background color changes */}
      {/* Added 'transition-colors duration-500' for a smooth color transition */}
      <div 
        className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-20"
        style={{ backgroundColor: currentColor }} // Dynamic background color
      >
        {/* SVG icon - rotation removed, its color is inherited from fill="currentColor" */}
        <svg 
          className="w-12 h-12 text-white" // text-white ensures the icon remains visible on changing backgrounds
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* "Loading..." text with animated dots */}
      <p className="text-xl font-semibold text-gray-600">
        Loading{dots}
      </p>
    </div>
  );
};

export default BoxLoader;
