import React, { useState, useEffect } from 'react';
import { Shell } from 'lucide-react'; // Import the Shell icon

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

// RandomColorLoader component displays a rotating icon with changing colors and loading text
const RandomColorLoader = () => {
  // State to hold the current color of the icon
  const [currentColor, setCurrentColor] = useState(getRandomColor());
  // State to manage the animated dots for "Loading..." text
  const [dots, setDots] = useState('.');

  useEffect(() => {
    // Set up an interval to change the icon's color every 1 second
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
      {/* Shell icon from lucide-react */}
      {/* 'animate-spin-slow' class for continuous rotation (defined in tailwind.config.js) */}
      {/* 'style' prop applies the dynamic color and a smooth transition for color changes */}
      <Shell
        className="animate-spin-slow w-12 h-12 mb-4"
        style={{ color: currentColor, transition: 'color 0.5s ease' }}
      />

      {/* "Loading..." text with animated dots */}
      <p className="text-xl font-semibold">
        Loading{dots}
      </p>
    </div>
  );
};

export default RandomColorLoader;
