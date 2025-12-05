'use client';

import dynamic from 'next/dynamic';

const P5Canvas = dynamic(() => import('./components/P5Canvas'), { ssr: false });
const ColorLayer = dynamic(() => import('./components/ColorLayer'), { ssr: false });

export default function Home() {
  return (
    <>
      <ColorLayer />
      <P5Canvas />
    </>
  );
}
