'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AudioReceiver } from './components/AudioReceiver';
import TextEffect from './components/TextEffect';

const P5Canvas = dynamic(() => import('./components/P5Canvas'), { ssr: false });
const ColorLayer = dynamic(() => import('./components/ColorLayer'), { ssr: false });

export default function Home() {
  const [colorState, setColorState] = useState(3); // 0, 1, 2, 3
  const [effectLayer, setEffectLayer] = useState(6); // 4, 5, 6
  const [symbolLayer, setSymbolLayer] = useState(9); // 7, 8, 9
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // マイク権限をリクエスト
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionsGranted(true);
      } catch (error) {
        console.error('マイク権限エラー:', error);
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
      // 4-6: エフェクトレイヤー（円）
      console.log(`エフェクトレイヤーを${effectId}に設定`);
      setEffectLayer(effectId);
    } else if (effectId >= 7 && effectId <= 9) {
      // 7-9: シンボルレイヤー
      console.log(`シンボルレイヤーを${effectId}に設定`);
      setSymbolLayer(effectId);
    }
  };

  // キーボード入力（テスト用）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;

      if (key >= '0' && key <= '9') {
        const value = parseInt(key);
        handleEffectDetected(value);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <AudioReceiver
        onEffectDetected={handleEffectDetected}
        availableEffects={10}
        permissionsGranted={permissionsGranted}
      />
      <ColorLayer colorState={colorState} />
      <TextEffect effectLayer={effectLayer} />
      <P5Canvas symbolLayer={symbolLayer} />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        }}
      >
        <Image
          src="/qrcode.png"
          alt="QR Code"
          width={200}
          height={200}
          priority
        />
      </div>
    </>
  );
}
