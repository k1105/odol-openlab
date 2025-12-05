"use client";

import {useEffect, useRef} from "react";
import p5 from "p5";

interface P5CanvasProps {
  symbolLayer: number; // 7, 8, 9 (9 = hidden)
}

const P5Canvas = ({symbolLayer}: P5CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const symbolLayerRef = useRef(symbolLayer);

  // Update refs when props change
  useEffect(() => {
    symbolLayerRef.current = symbolLayer;
  }, [symbolLayer]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let symbolGraphics: p5.Graphics;

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        // Create graphics layer
        symbolGraphics = p.createGraphics(p.windowWidth, p.windowHeight);
      };

      p.draw = () => {
        p.clear();

        // Symbol Layer - use ref to get current value
        const currentSymbolLayer = symbolLayerRef.current;
        if (currentSymbolLayer === 7 || currentSymbolLayer === 8) {
          drawSymbolLayer();
          p.image(symbolGraphics, 0, 0);
        }
      };

      const drawSymbolLayer = () => {
        symbolGraphics.clear();

        // Update shake
        const shakeX = p.random(-3, 3);
        const shakeY = p.random(-3, 3);

        const centerX = p.width / 2 + shakeX;
        const centerY = p.height / 2 + shakeY;

        symbolGraphics.push();
        symbolGraphics.translate(centerX, centerY);

        const currentSymbolLayer = symbolLayerRef.current;
        if (currentSymbolLayer === 7) {
          // Circle
          symbolGraphics.noFill();
          symbolGraphics.stroke(255);
          symbolGraphics.strokeWeight(3);
          symbolGraphics.circle(0, 0, 200);
        } else if (currentSymbolLayer === 8) {
          // Rectangle
          symbolGraphics.noFill();
          symbolGraphics.stroke(255);
          symbolGraphics.strokeWeight(3);
          symbolGraphics.rectMode(p.CENTER);
          symbolGraphics.rect(0, 0, 200, 200);
        }

        symbolGraphics.pop();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        symbolGraphics.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    const p5Instance = new p5(sketch, canvasRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []); // Empty deps - p5 instance should only be created once

  return (
    <div
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
};

export default P5Canvas;
