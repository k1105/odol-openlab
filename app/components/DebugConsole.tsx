'use client';

import { useEffect, useState } from 'react';
import styles from './DebugConsole.module.css';

interface DebugConsoleProps {
  audioLevel: number;
  effectLayer: number;
  colorState: number;
  symbolLayer: number;
}

interface LogEntry {
  timestamp: string;
  message: string;
}

const DebugConsole = ({ audioLevel, effectLayer, colorState, symbolLayer }: DebugConsoleProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [prevEffectLayer, setPrevEffectLayer] = useState(effectLayer);
  const [prevColorState, setPrevColorState] = useState(colorState);
  const [prevSymbolLayer, setPrevSymbolLayer] = useState(symbolLayer);

  // エフェクトの変更を監視してログに追加
  useEffect(() => {
    if (colorState !== prevColorState) {
      const timestamp = new Date().toLocaleTimeString();
      const effectName = ['Red', 'Green', 'Blue', 'Black'][colorState] || `Effect ${colorState}`;
      setLogs((prev) => [...prev.slice(-2), { timestamp, message: `Color: ${effectName} (${colorState})` }]);
      setPrevColorState(colorState);
    }
  }, [colorState, prevColorState]);

  useEffect(() => {
    if (effectLayer !== prevEffectLayer) {
      const timestamp = new Date().toLocaleTimeString();
      const effectName = effectLayer === 4 ? 'Text Animation' : effectLayer === 5 ? 'Flickering' : effectLayer === 6 ? 'None' : `Effect ${effectLayer}`;
      setLogs((prev) => [...prev.slice(-2), { timestamp, message: `Effect: ${effectName} (${effectLayer})` }]);
      setPrevEffectLayer(effectLayer);
    }
  }, [effectLayer, prevEffectLayer]);

  useEffect(() => {
    if (symbolLayer !== prevSymbolLayer) {
      const timestamp = new Date().toLocaleTimeString();
      const effectName = symbolLayer === 7 ? 'Circle (Small)' : symbolLayer === 8 ? 'Circle (Large)' : symbolLayer === 9 ? 'None' : `Symbol ${symbolLayer}`;
      setLogs((prev) => [...prev.slice(-2), { timestamp, message: `Symbol: ${effectName} (${symbolLayer})` }]);
      setPrevSymbolLayer(symbolLayer);
    }
  }, [symbolLayer, prevSymbolLayer]);

  return (
    <div className={styles.console}>
      <div className={styles.header}>Debug Console</div>
      <div className={styles.volumeBar}>
        <div className={styles.volumeLabel}>Audio Level:</div>
        <div className={styles.volumeMeter}>
          <div
            className={styles.volumeFill}
            style={{ width: `${audioLevel * 100}%` }}
          />
        </div>
        <div className={styles.volumeValue}>{(audioLevel * 100).toFixed(1)}%</div>
      </div>
      <div className={styles.logs}>
        {logs.map((log, index) => (
          <div key={index} className={styles.logEntry}>
            <span className={styles.timestamp}>[{log.timestamp}]</span>
            <span className={styles.message}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugConsole;
