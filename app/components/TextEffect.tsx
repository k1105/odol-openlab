"use client";

import {useEffect, useState, useRef} from "react";
import p5 from "p5";
import styles from "./TextEffect.module.css";

interface TextEffectProps {
  effectLayer: number; // 4, 5, 6
}

const TextEffect = ({effectLayer}: TextEffectProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (effectLayer === 4) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [effectLayer]);

  // effectLayer === 6の場合のp5.jsスケッチ
  useEffect(() => {
    if (effectLayer !== 6 || !canvasRef.current) return;

    let dest = {x: 0, y: 0};
    let lastDest = {x: 0, y: 0};
    let t = 0;
    let svgImage: p5.Image | null = null;
    let mainGraphics: p5.Graphics;
    const trailGraphics: p5.Graphics[] = []; // 残像用のグラフィックス配列

    const sketch = (p: p5) => {
      p.setup = () => {
        // 背景を完全に透明にする
        p.createCanvas(p.windowWidth, p.windowHeight);

        // メインのグラフィックスレイヤーを作成
        mainGraphics = p.createGraphics(p.windowWidth, p.windowHeight);

        // 残像用のグラフィックスを5枚作成
        for (let i = 0; i < 5; i++) {
          trailGraphics.push(p.createGraphics(p.windowWidth, p.windowHeight));
        }

        p.noFill();
        p.stroke(255);
        p.strokeWeight(10);
        dest = {x: p.random(p.width), y: p.random(p.height)};
        lastDest = {x: p.width / 2, y: p.height / 2};

        // SVG画像をHTMLのimg要素として読み込んでからCanvasに描画
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // 一時的なCanvasにSVGを描画
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = 300;
          tempCanvas.height = 300;
          const ctx = tempCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, 300, 300);
            // Canvasからp5.jsの画像を作成
            p.loadImage(tempCanvas.toDataURL(), (loadedImg) => {
              svgImage = loadedImg;
            });
          }
        };
        img.onerror = () => {
          console.error("Failed to load SVG image");
        };
        img.src = "/winter_special_remix_night.svg";
      };

      p.draw = () => {
        // メインキャンバスをクリア（完全に透明）
        p.clear();

        // メイングラフィックスをクリア
        mainGraphics.clear();

        if (t <= 1) {
          t += 0.05;
        } else {
          t = 0;
          lastDest = dest;
          dest = {x: p.random(p.width), y: p.random(p.height)};
        }

        const r = p.random(200) + 155;
        const switcher = p.floor(p.random(3));

        const strokeColor = [
          switcher == 0 ? r : 255 - r + 100,
          switcher == 1 ? r : 255 - r + 100,
          switcher == 2 ? r : 255 - r + 100,
        ];

        // ease-outイージング関数（入りが早く、後半でゆっくり）
        const easeOut = (t: number) => {
          return 1 - Math.pow(1 - t, 3); // easeOutCubic
        };

        const easedT = easeOut(t);

        const pos = {
          x: lastDest.x * (1 - easedT) + dest.x * easedT,
          y: lastDest.y * (1 - easedT) + dest.y * easedT,
        };

        // メイングラフィックスに描画
        mainGraphics.push();
        mainGraphics.translate(pos.x, pos.y);
        mainGraphics.noFill();
        mainGraphics.stroke(strokeColor[0], strokeColor[1], strokeColor[2]);

        // SVG画像が読み込まれている場合は画像を表示、そうでなければrectを表示
        if (svgImage && svgImage.width > 0) {
          mainGraphics.imageMode(p.CENTER);
          mainGraphics.tint(strokeColor[0], strokeColor[1], strokeColor[2]);
          mainGraphics.image(svgImage, 0, 0, 300, 300);
        } else {
          mainGraphics.rectMode(p.CENTER);
          mainGraphics.rect(0, 0, 100, 100);
        }
        mainGraphics.pop();

        // 残像を描画（古い順に描画、透明度を下げる）
        for (let i = trailGraphics.length - 1; i >= 0; i--) {
          const alpha = (i + 1) / (trailGraphics.length + 1);
          p.push();
          p.tint(255, alpha * 255);
          p.image(trailGraphics[i], 0, 0);
          p.pop();
        }

        // 最新のフレームを描画
        p.image(mainGraphics, 0, 0);

        // 残像を更新（配列をシフト）
        trailGraphics.unshift(trailGraphics.pop()!);
        trailGraphics[0].clear();
        trailGraphics[0].image(mainGraphics, 0, 0);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        mainGraphics.resizeCanvas(p.windowWidth, p.windowHeight);

        // 残像用のグラフィックスもリサイズ
        for (const graphics of trailGraphics) {
          graphics.resizeCanvas(p.windowWidth, p.windowHeight);
        }
      };
    };

    p5InstanceRef.current = new p5(sketch, canvasRef.current);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [effectLayer]);

  if (effectLayer === 6) {
    return (
      <div
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1100,
          mixBlendMode: "screen", // 背景とブレンドして透過させる
        }}
      />
    );
  }

  if (!isVisible) return null;

  const lines = ["OPEN", "LAB", "TOKYO"];

  return (
    <div className={styles.container}>
      {lines.map((line, lineIndex) => {
        // 前の行までの文字数を計算
        const charsBeforeLine = lines.slice(0, lineIndex).join("").length;

        return (
          <div key={lineIndex} className={styles.line}>
            {line.split("").map((char, charIndex) => {
              const globalCharIndex = charsBeforeLine + charIndex;
              const animationDelay = globalCharIndex * 0.1;

              return (
                <span
                  key={charIndex}
                  className={styles.char}
                  style={{
                    animationDelay: `${animationDelay}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TextEffect;
