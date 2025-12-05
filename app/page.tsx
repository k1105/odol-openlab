'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

const P5Canvas = dynamic(() => import('./components/P5Canvas'), { ssr: false });
const ColorLayer = dynamic(() => import('./components/ColorLayer'), { ssr: false });

export default function Home() {
  return (
    <>
      <ColorLayer />
      <P5Canvas />
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
