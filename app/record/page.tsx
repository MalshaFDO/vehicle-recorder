"use client";

import { useRef } from "react";

export default function RecordPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // when button clicked → open camera
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // when video is recorded
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      console.log("Video file:", file);
      alert("Video captured successfully ✅");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Vehicle Recorder</h1>

      <button
        onClick={handleButtonClick}
        style={{
          padding: "15px 20px",
          fontSize: "16px",
          backgroundColor: "black",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Record Vehicle
      </button>

      {/* hidden input to trigger camera */}
      <input
        type="file"
        accept="video/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleVideoChange}
      />
    </div>
  );
}