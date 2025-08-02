import React, { useState, useEffect } from 'react';
import { Shell } from 'lucide-react'; // Import the Shell icon
import BoxLoader from "./BoxLoader";
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
    }, 500); // Change color every 1000 milliseconds (1 second)

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
