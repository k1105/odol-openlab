'use client';

import { useEffect, useState } from 'react';
import styles from './TextEffect.module.css';

interface TextEffectProps {
  effectLayer: number; // 4, 5, 6
}

const TextEffect = ({ effectLayer }: TextEffectProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (effectLayer === 4) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [effectLayer]);

  if (!isVisible) return null;

  const lines = ['OPEN', 'LAB', 'TOKYO'];
  const allChars = lines.join('');
  const totalChars = allChars.length;

  return (
    <div className={styles.container}>
      {lines.map((line, lineIndex) => {
        // 前の行までの文字数を計算
        const charsBeforeLine = lines.slice(0, lineIndex).join('').length;

        return (
          <div key={lineIndex} className={styles.line}>
            {line.split('').map((char, charIndex) => {
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
