"use client";

import {useCamera} from "../contexts/CameraContext";
import {Icon} from "@iconify/react";

const CameraToggle = () => {
  const {isCameraOn, toggleCamera} = useCamera();

  return (
    <button
      onClick={toggleCamera}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "6px 12px",
        fontSize: "16px",
        fontWeight: 500,
        border: "1px solid white",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#ffffff",
        cursor: "pointer",
        zIndex: 10000,
        transition: "all 0.2s ease",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateX(-50%) scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateX(-50%) scale(1)";
      }}
    >
      <Icon
        icon={isCameraOn ? "mdi:camera-outline" : "mdi:camera-off-outline"}
        width={24}
        height={24}
      />
    </button>
  );
};

export default CameraToggle;
