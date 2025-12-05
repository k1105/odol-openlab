"use client";

import {useEffect, useRef} from "react";
import p5 from "p5";

interface P5CanvasProps {
  effectLayer: number; // 4, 5, 6 (6 = hidden)
  symbolLayer: number; // 7, 8, 9 (9 = hidden)
}

const P5Canvas = ({effectLayer, symbolLayer}: P5CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const effectLayerRef = useRef(effectLayer);
  const symbolLayerRef = useRef(symbolLayer);

  // Update refs when props change
  useEffect(() => {
    effectLayerRef.current = effectLayer;
  }, [effectLayer]);

  useEffect(() => {
    symbolLayerRef.current = symbolLayer;
  }, [symbolLayer]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let effectGraphics: p5.Graphics;
    let symbolGraphics: p5.Graphics;

    // Effect layer state
    let circles: Array<{x: number; y: number; size: number; speed: number}> =
      [];

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        // Create graphics layers
        effectGraphics = p.createGraphics(p.windowWidth, p.windowHeight);
        symbolGraphics = p.createGraphics(p.windowWidth, p.windowHeight);

        // Initialize effect circles
        resetCircles();
      };

      p.draw = () => {
        p.clear();

        // Effect Layer - use ref to get current value
        const currentEffectLayer = effectLayerRef.current;
        if (currentEffectLayer < 6) {
          drawEffectLayer();
          p.image(effectGraphics, 0, 0);
        }

        // Symbol Layer - use ref to get current value
        const currentSymbolLayer = symbolLayerRef.current;
        if (currentSymbolLayer === 7 || currentSymbolLayer === 8) {
          drawSymbolLayer();
          p.image(symbolGraphics, 0, 0);
        }
      };

      const drawEffectLayer = () => {
        effectGraphics.clear();

        // Update and draw circles - use ref to get current value
        const currentEffectLayer = effectLayerRef.current;
        const numCircles =
          currentEffectLayer === 4 ? 5 : currentEffectLayer === 5 ? 15 : 0;
        const tempo = currentEffectLayer === 4 ? 1 : 2.5;

        // Add or remove circles based on current state
        while (circles.length < numCircles) {
          circles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            size: p.random(20, 80),
            speed: p.random(0.5, 2) * tempo,
          });
        }
        while (circles.length > numCircles) {
          circles.pop();
        }

        circles.forEach((circle) => {
          circle.y += circle.speed;
          if (circle.y > p.height + circle.size) {
            circle.y = -circle.size;
            circle.x = p.random(p.width);
          }

          effectGraphics.noStroke();
          effectGraphics.fill(255, 255, 255, 100);
          effectGraphics.circle(circle.x, circle.y, circle.size);
        });
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

      const resetCircles = () => {
        circles = [];
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        effectGraphics.resizeCanvas(p.windowWidth, p.windowHeight);
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
