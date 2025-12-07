"use client";

import {useEffect, useRef} from "react";
import p5 from "p5";

interface P5CanvasProps {
  symbolLayer: number; // 8, 9, 10 (10 = hidden)
  audioLevel: number; // 0.0 - 1.0
}

const P5Canvas = ({symbolLayer, audioLevel}: P5CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const symbolLayerRef = useRef(symbolLayer);
  const audioLevelRef = useRef(audioLevel);

  // Update refs when props change
  useEffect(() => {
    symbolLayerRef.current = symbolLayer;
  }, [symbolLayer]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let symbolGraphics: p5.Graphics;
    const trailGraphics: p5.Graphics[] = []; // 残像用のグラフィックス配列
    let frameCount = 0; // フレームカウント

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        // Create graphics layer
        symbolGraphics = p.createGraphics(p.windowWidth, p.windowHeight);

        // 残像用のグラフィックスを5枚作成
        for (let i = 0; i < 5; i++) {
          trailGraphics.push(p.createGraphics(p.windowWidth, p.windowHeight));
        }
      };

      p.draw = () => {
        p.clear();

        // Symbol Layer - use ref to get current value
        const currentSymbolLayer = symbolLayerRef.current;
        if (currentSymbolLayer === 8 || currentSymbolLayer === 9) {
          drawSymbolLayer();

          // 残像を描画（古い順に描画）
          for (let i = trailGraphics.length - 1; i >= 0; i--) {
            const alpha = (i + 1) / (trailGraphics.length + 1); // 透明度を計算
            p.push();
            p.tint(255, alpha * 255);
            p.image(trailGraphics[i], 0, 0);
            p.pop();
          }

          // 最新のフレームを描画
          p.image(symbolGraphics, 0, 0);

          // 残像を更新（配列をシフト）
          trailGraphics.unshift(trailGraphics.pop()!);
          trailGraphics[0].clear();
          trailGraphics[0].image(symbolGraphics, 0, 0);
        }
      };

      const drawSymbolLayer = () => {
        symbolGraphics.clear();

        const centerX = p.width / 2;
        const centerY = p.height / 2;

        symbolGraphics.push();
        symbolGraphics.translate(centerX, centerY);

        const currentSymbolLayer = symbolLayerRef.current;
        const currentAudioLevel = audioLevelRef.current;

        // 音量に応じた基本サイズ（8と9で強度が異なる）
        // レイヤー8: 画面幅の80%、レイヤー9: 画面幅の120%
        const baseSizeRatio = currentSymbolLayer === 8 ? 0.8 : 1.2;
        const baseSize = p.width * baseSizeRatio;
        const audioMultiplier = currentSymbolLayer === 8 ? 100 : 200;
        const size = baseSize + currentAudioLevel * audioMultiplier;

        // 新しいシェイプを描画
        symbolGraphics.noFill();
        symbolGraphics.stroke(255);
        symbolGraphics.strokeJoin(p.ROUND);
        symbolGraphics.strokeWeight(10);
        symbolGraphics.beginShape();

        const numPoints = 25;
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * p.TWO_PI;
          const noiseValue = p.noise(i + frameCount / 50);
          const amplitude = p.sin(noiseValue);

          const x = size * p.cos(angle) * amplitude;
          const y = size * p.sin(angle) * amplitude;

          symbolGraphics.vertex(x, y);
        }

        symbolGraphics.endShape(p.CLOSE);
        symbolGraphics.pop();

        // フレームカウントを更新（アニメーションのため）
        frameCount++;
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        symbolGraphics.resizeCanvas(p.windowWidth, p.windowHeight);

        // 残像用のグラフィックスもリサイズ
        for (const graphics of trailGraphics) {
          graphics.resizeCanvas(p.windowWidth, p.windowHeight);
        }
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
