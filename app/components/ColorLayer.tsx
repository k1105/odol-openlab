'use client';

import { useEffect, useState } from 'react';

interface ColorLayerProps {
  colorState: number; // 0, 1, 2, 3
  isFlickering?: boolean; // フリッキング（点滅）モード
}

const ColorLayer = ({ colorState, isFlickering = false }: ColorLayerProps) => {
  const [currentColor, setCurrentColor] = useState({ r: 0, g: 0, b: 0 });
  const [targetColor, setTargetColor] = useState({ r: 0, g: 0, b: 0 });
  const [baseColor, setBaseColor] = useState({ r: 0, g: 0, b: 0 }); // フリッキング用の基準色

  // Update color based on props
  useEffect(() => {
    let color;
    switch (colorState) {
      case 0:
        color = { r: 255, g: 100, b: 100 }; // Red
        break;
      case 1:
        color = { r: 100, g: 255, b: 100 }; // Green
        break;
      case 2:
        color = { r: 100, g: 100, b: 255 }; // Blue
        break;
      case 3:
      default:
        color = { r: 0, g: 0, b: 0 }; // Black
        break;
    }
    setTargetColor(color);
    setBaseColor(color); // 基準色も更新
  }, [colorState]);

  // Flickering effect
  useEffect(() => {
    if (!isFlickering) return;

    let isBlack = false;

    const interval = setInterval(() => {
      isBlack = !isBlack;
      if (isBlack) {
        setCurrentColor({ r: 0, g: 0, b: 0 }); // 黒
      } else {
        setCurrentColor(baseColor); // 基準色
      }
    }, 100); // 100msごとに切り替え（1秒間に10回点滅）

    return () => {
      clearInterval(interval);
    };
  }, [isFlickering, baseColor]);

  // Easing animation (フリッキング中は無効)
  useEffect(() => {
    if (isFlickering) return; // フリッキング中は通常のアニメーションを無効化

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
  }, [targetColor, isFlickering]);

  // Apply color to body
  useEffect(() => {
    document.body.style.backgroundColor = `rgb(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)})`;
    document.body.style.transition = 'none'; // CSS transition is handled by JS easing
  }, [currentColor]);

  return null;
};

export default ColorLayer;
