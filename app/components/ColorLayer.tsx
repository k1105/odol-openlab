'use client';

import { useEffect, useState } from 'react';

const ColorLayer = () => {
  const [colorState, setColorState] = useState(3); // Initial: black
  const [currentColor, setCurrentColor] = useState({ r: 0, g: 0, b: 0 });
  const [targetColor, setTargetColor] = useState({ r: 0, g: 0, b: 0 });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === '0' || key === '1' || key === '2' || key === '3') {
        const value = parseInt(key);
        setColorState(value);

        switch (value) {
          case 0:
            setTargetColor({ r: 255, g: 100, b: 100 }); // Red
            break;
          case 1:
            setTargetColor({ r: 100, g: 255, b: 100 }); // Green
            break;
          case 2:
            setTargetColor({ r: 100, g: 100, b: 255 }); // Blue
            break;
          case 3:
          default:
            setTargetColor({ r: 0, g: 0, b: 0 }); // Black
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Easing animation
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setCurrentColor((prev) => {
        const newColor = {
          r: prev.r + (targetColor.r - prev.r) * 0.05,
          g: prev.g + (targetColor.g - prev.g) * 0.05,
          b: prev.b + (targetColor.b - prev.b) * 0.05,
        };

        // Continue animation if not close enough to target
        if (
          Math.abs(newColor.r - targetColor.r) > 0.5 ||
          Math.abs(newColor.g - targetColor.g) > 0.5 ||
          Math.abs(newColor.b - targetColor.b) > 0.5
        ) {
          animationFrame = requestAnimationFrame(animate);
        }

        return newColor;
      });
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetColor]);

  // Apply color to body
  useEffect(() => {
    document.body.style.backgroundColor = `rgb(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)})`;
    document.body.style.transition = 'none'; // CSS transition is handled by JS easing
  }, [currentColor]);

  return null;
};

export default ColorLayer;
