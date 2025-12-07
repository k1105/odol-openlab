"use client";

import {useEffect, useState} from "react";
import {useCamera} from "../contexts/CameraContext";

interface ColorLayerProps {
  colorState: number; // 0, 1, 2, 3
  isFlickering?: boolean; // フリッキング（点滅）モード
}

const ColorLayer = ({colorState, isFlickering = false}: ColorLayerProps) => {
  const {isCameraOn} = useCamera();
  const [currentColor, setCurrentColor] = useState({r: 0, g: 0, b: 0});
  const [targetColor, setTargetColor] = useState({r: 0, g: 0, b: 0});
  const [baseColor, setBaseColor] = useState({r: 0, g: 0, b: 0}); // フリッキング用の基準色

  // Update color based on props
  useEffect(() => {
    let color;
    switch (colorState) {
      case 0:
        color = {r: 255, g: 100, b: 100}; // Red
        break;
      case 1:
        color = {r: 100, g: 255, b: 100}; // Green
        break;
      case 2:
        color = {r: 100, g: 100, b: 255}; // Blue
        break;
      case 3:
      default:
        color = {r: 0, g: 0, b: 0}; // Black
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
        setCurrentColor({r: 0, g: 0, b: 0}); // 黒
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

  // Apply color to body or as overlay
  useEffect(() => {
    if (isCameraOn) {
      // カメラがONの時は、bodyの背景を透明にして、オーバーレイを表示
      document.body.style.backgroundColor = "transparent";
    } else {
      // カメラがOFFの時は、bodyの背景色を設定
      document.body.style.backgroundColor = `rgb(${Math.round(
        currentColor.r
      )}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)})`;
    }
    document.body.style.transition = "none"; // CSS transition is handled by JS easing
  }, [currentColor, isCameraOn]);

  // カメラがONの時は、色のオーバーレイを表示
  if (isCameraOn) {
    // colorStateが3（黒）の場合、または色がほぼ黒（各値が0.5以下）の場合、opacityを0にする
    const isBlack =
      colorState === 3 ||
      (Math.abs(currentColor.r) < 0.5 &&
        Math.abs(currentColor.g) < 0.5 &&
        Math.abs(currentColor.b) < 0.5);
    const alpha = isBlack ? 0 : 0.7; // 透明度（0.0 - 1.0）
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: `rgba(${Math.round(currentColor.r)}, ${Math.round(
            currentColor.g
          )}, ${Math.round(currentColor.b)}, ${alpha})`,
          zIndex: 0, // カメラより上、他のコンテンツより下
          pointerEvents: "none",
        }}
      />
    );
  }

  return null;
};

export default ColorLayer;
