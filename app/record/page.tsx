"use client";

import { useRef, useState } from "react";

export default function RecordPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");

  // open camera
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // when video selected
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setVideoFile(file);
      setVideoURL(URL.createObjectURL(file)); // preview
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Vehicle Recorder</h1>

      {/* Record Button */}
      {!videoFile && (
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
      )}

      {/* Hidden input */}
      <input
        type="file"
        accept="video/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleVideoChange}
      />

      {/* Video Preview */}
      {videoURL && (
        <div style={{ marginTop: "20px" }}>
          <video
            src={videoURL}
            controls
            style={{ width: "100%", borderRadius: "10px" }}
          />
        </div>
      )}

      {/* Vehicle Number Input */}
      {videoFile && (
        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Enter Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            style={{
              padding: "10px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          />
        </div>
      )}
    </div>
  );
}