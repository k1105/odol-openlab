"use client";

import {createContext, useContext, useState, ReactNode} from "react";

interface CameraContextType {
  isCameraOn: boolean;
  toggleCamera: () => void;
  videoStream: MediaStream | null;
  setVideoStream: (stream: MediaStream | null) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export function CameraProvider({children}: {children: ReactNode}) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const toggleCamera = async () => {
    if (isCameraOn) {
      // カメラをオフにする
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }
      setIsCameraOn(false);
    } else {
      // カメラをオンにする
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // フロントカメラ
          },
        });
        setVideoStream(stream);
        setIsCameraOn(true);
      } catch (error) {
        console.error("カメラアクセスエラー:", error);
        alert("カメラへのアクセスに失敗しました");
      }
    }
  };

  return (
    <CameraContext.Provider
      value={{
        isCameraOn,
        toggleCamera,
        videoStream,
        setVideoStream,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export function useCamera() {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
}
