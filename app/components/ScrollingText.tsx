'use client';

import styles from './ScrollingText.module.css';

const ScrollingText = () => {
  const text = 'お手元のスマホでこのQRコードを読み込んでみてね！今この会場には、人間には聞こえない信号が飛び交っているよ！それを受信して君たちのスマホが会場全体と同期して光るんだ！　2時間くらいで作ってるから、もし動かなかったらごめんちょ！';

  return (
    <div className={styles.container}>
      <div className={styles.scrollingText}>
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
};

export default ScrollingText;
