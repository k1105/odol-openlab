"use client";

import {useEffect, useRef} from "react";
import {useCamera} from "../contexts/CameraContext";

const CameraLayer = () => {
  const {isCameraOn, videoStream} = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  if (!isCameraOn || !videoStream) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
        zIndex: -1, // 一番背景
        pointerEvents: "none",
      }}
    />
  );
};

export default CameraLayer;
