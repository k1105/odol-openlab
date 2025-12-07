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
    const trailGraphics: p5.Graphics[] = []; // 残像用のグラフィックス配列（レイヤー9用）
    let frameCount = 0; // フレームカウント
    const circlePositions: number[] = []; // レイヤー8用: 過去20フレーム分の円の位置

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        // Create graphics layer
        symbolGraphics = p.createGraphics(p.windowWidth, p.windowHeight);

        // 残像用のグラフィックスを5枚作成（レイヤー9用）
        for (let i = 0; i < 5; i++) {
          trailGraphics.push(p.createGraphics(p.windowWidth, p.windowHeight));
        }
      };

      p.draw = () => {
        // Symbol Layer - use ref to get current value
        const currentSymbolLayer = symbolLayerRef.current;
        if (currentSymbolLayer === 8 || currentSymbolLayer === 9) {
          p.clear();

          if (currentSymbolLayer === 8) {
            drawSymbolLayer8();
          } else {
            drawSymbolLayer();

            // レイヤー9: 残像を描画（古い順に描画）
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
        }
      };

      const drawSymbolLayer8 = () => {
        const circleSize = 10;
        const trailLength = 20; // 20列分の残像
        const speed = 3; // 速度係数（大きいほど速い）

        // frameCountの増分を速度に応じて調整
        frameCount += speed;

        // 現在のフレームの円の位置を計算（円のサイズごとの間隔で）
        const currentTranslateX =
          ((circleSize * Math.floor(frameCount)) % p.width) + circleSize / 2;

        // 前回記録した位置と現在の位置の差が円のサイズ以上の場合のみ記録（隙間なく）
        const lastPosition =
          circlePositions.length > 0 ? circlePositions[0] : -Infinity;
        const positionDiff = Math.abs(currentTranslateX - lastPosition);
        // 画面をまたぐ場合も考慮
        const wrappedDiff = Math.min(
          positionDiff,
          Math.abs(currentTranslateX + p.width - lastPosition),
          Math.abs(currentTranslateX - p.width - lastPosition)
        );

        if (circlePositions.length === 0 || wrappedDiff >= circleSize) {
          circlePositions.unshift(currentTranslateX);
          if (circlePositions.length > trailLength) {
            circlePositions.pop();
          }
        }

        // 過去20フレーム分を不透明度を段階的に下げて描画
        for (let i = 0; i < circlePositions.length; i++) {
          const alpha = 255 * (1 - i / trailLength); // 古いものほど透明度を下げる
          const translateX = circlePositions[i];

          p.push();
          p.noStroke();
          p.fill(255, alpha);
          p.translate(translateX, 0);

          for (let j = 0; j <= p.height / circleSize; j++) {
            p.circle(0, 0, circleSize);
            p.translate(0, circleSize);
          }

          p.pop();
        }
      };

      const drawSymbolLayer = () => {
        // レイヤー9: 既存のエフェクト
        symbolGraphics.clear();

        const centerX = p.width / 2;
        const centerY = p.height / 2;

        symbolGraphics.push();
        symbolGraphics.translate(centerX, centerY);

        const currentAudioLevel = audioLevelRef.current;

        // 音量に応じた基本サイズ
        const baseSizeRatio = 1.2;
        const baseSize = p.width * baseSizeRatio;
        const audioMultiplier = 200;
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
