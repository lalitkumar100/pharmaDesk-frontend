import React, { useState, useEffect } from 'react';

// Function to generate a random color from a predefined list
const getRandomColor = () => {
  const colors = [
  "#333333",
  "#000080",
  "#228B22",
  "#800020",
  "#36220B",
  "#008080",
  "#4169E1",
  "#9400D3",
  "#2F4F4F",
  "#191970",
  "#556B2F",
  "#8B4513",
  "#5C4033",
  "#006064",
  "#8E4585",
  "#8B008B",
  "#4B0082",
  "#E2725B",
  "#264653",
  "#000000",
  "#000000",
  "#003153",
  "#5C4033",
  "#006400",
  "#2B3539",
  "#36454F",
  "#46535E",
  "#35393C",
  "#2F4F4F",
  "#9966CC",
  "#0F52BA",
  "#50C878",
  "#00A36C",
  "#E0115F",
  "#CC5500",
  "#E34234",
  "#954535",
  "#B7410E",
  "#E9967A",
  "#003153",
  "#008080",
  "#6A5ACD",
  "#228B22",
  "#355E3B",
  "#800020",
  "#8B0000",
  "#6F4E37",
  "#36454F",
  "#556B2F"
]
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
    }, 700); // Change color every 1000 milliseconds (1 second)

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
