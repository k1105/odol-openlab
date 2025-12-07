"use client";

import {useState, useEffect} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {AudioReceiver} from "./components/AudioReceiver";
import styles from "./page.module.css";
import CameraLayer from "./components/CameraLayer";

const P5Canvas = dynamic(() => import("./components/P5Canvas"), {ssr: false});
const ColorLayer = dynamic(() => import("./components/ColorLayer"), {
  ssr: false,
});
const TextEffect = dynamic(() => import("./components/TextEffect"), {
  ssr: false,
});

export default function Home() {
  const [colorState, setColorState] = useState(3); // 0, 1, 2, 3
  const [effectLayer, setEffectLayer] = useState(9); // 4, 5, 6 (9 = hidden)
  const [symbolLayer, setSymbolLayer] = useState(10); // 8, 9, 10 (10 = hidden)
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // マイクの音量レベル

  // マイク権限をリクエスト
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({audio: true});
        setPermissionsGranted(true);
      } catch (error) {
        console.error("マイク権限エラー:", error);
      }
    };
    requestPermissions();
  }, []);

  // 音声信号からエフェクトを検出
  const handleEffectDetected = (effectId: number) => {
    console.log(`検出されたエフェクト: ${effectId}`);

    // エフェクトIDに基づいて状態を更新
    if (effectId >= 0 && effectId <= 3) {
      // 0-3: カラーレイヤー
      console.log(`カラーレイヤーを${effectId}に設定`);
      setColorState(effectId);
    } else if (effectId >= 4 && effectId <= 6) {
      // 4-6: エフェクトレイヤー
      console.log(`エフェクトレイヤーを${effectId}に設定`);
      setEffectLayer(effectId);
    } else if (effectId === 7) {
      // 7: エフェクトレイヤーをキャンセル
      console.log(`エフェクトレイヤーをキャンセル`);
      setEffectLayer(9);
    } else if (effectId >= 8 && effectId <= 10) {
      // 8-10: シンボルレイヤー
      console.log(`シンボルレイヤーを${effectId}に設定`);
      setSymbolLayer(effectId);
    }
  };

  // キーボード入力（テスト用）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;

      if (key >= "0" && key <= "9") {
        const value = parseInt(key);
        handleEffectDetected(value);
      } else if (key === "-") {
        // "-"キーで10を入力
        handleEffectDetected(10);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // font-weightの単振動アニメーション
  useEffect(() => {
    const element = document.getElementById("vertical-title");
    if (!element) return;

    let startTime: number | null = null;
    const duration = 1000; // 3秒周期
    const minWeight = 200;
    const maxWeight = 900;
    const amplitude = (maxWeight - minWeight) / 2; // 300
    const center = (minWeight + maxWeight) / 2; // 500

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = (timestamp - startTime) % duration;
      const progress = elapsed / duration;

      // sin波で計算: -1から1の範囲を500±300に変換
      const weight = center + amplitude * Math.sin(progress * Math.PI * 2);

      element.style.fontVariationSettings = `"wght" ${Math.round(weight)}`;

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      <CameraLayer />
      <AudioReceiver
        onEffectDetected={handleEffectDetected}
        availableEffects={11}
        permissionsGranted={permissionsGranted}
        onAudioLevelChange={setAudioLevel}
      />
      <ColorLayer colorState={colorState} isFlickering={false} />
      <TextEffect effectLayer={effectLayer} />
      <P5Canvas symbolLayer={symbolLayer} audioLevel={audioLevel} />
      <div className={styles.qrCodeContainer}>
        <Image
          src="/qrcode.png"
          alt="QR Code"
          width={200}
          height={200}
          priority
        />
      </div>
      <div className={styles.verticalTitle} id="vertical-title">
        Winter Special Remix Night
      </div>
    </>
  );
}
