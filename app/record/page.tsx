"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Record.module.css";

export default function RecordPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, [videoURL]);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }

    setVideoFile(selectedFile);
    setVideoURL(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    const normalized = vehicleNumber.trim().toUpperCase();

    if (!videoFile || !normalized) {
      showNotification("Please fill all fields", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("vehicleNumber", normalized);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        throw new Error();
      }

      showNotification("Record saved successfully", "success");
      setVideoFile(null);
      setVideoURL(null);
      setVehicleNumber("");
    } catch {
      showNotification("Upload failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navHeader}>
        <h1 className={styles.header}>Vehicle Recorder</h1>
        <Link href="/videos" className={styles.dbLink}>
          Database
        </Link>
      </div>

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? "Success" : "Error"}: {toast.message}
        </div>
      )}

      <p className={styles.hint}>Record 10-20 seconds of the vehicle clearly.</p>

      {!videoFile && (
        <button className={styles.recordButton} onClick={() => fileInputRef.current?.click()}>
          Capture Video
        </button>
      )}

      <input
        type="file"
        accept="video/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleVideoChange}
      />

      {videoURL && (
        <div className={styles.previewContainer}>
          <video src={videoURL} controls className={styles.videoPreview} />

          <div className={styles.inputGroup}>
            <input
              className={styles.vehicleInput}
              type="text"
              placeholder="Vehicle Number (e.g. ABC-1234)"
              value={vehicleNumber}
              onChange={(event) => setVehicleNumber(event.target.value.toUpperCase())}
            />

            <button className={styles.uploadButton} onClick={handleUpload} disabled={loading}>
              {loading ? "Processing..." : "Save Record"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
