"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Record.module.css";

export default function RecordPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🎥 START CAMERA
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream);
      let chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const file = new File([blob], `video-${Date.now()}.webm`, {
          type: "video/webm",
        });

        setVideoFile(file);
        setVideoURL(URL.createObjectURL(file));

        // stop camera
        mediaStream.getTracks().forEach((t) => t.stop());
      };

      setRecorder(mediaRecorder);
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      showNotification("Camera not supported", "error");
    }
  };

  // ⏹ STOP RECORDING
  const stopRecording = () => {
    recorder?.stop();
    setRecording(false);
  };

  // ☁️ UPLOAD
  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      showNotification("Record saved successfully", "success");

      setVideoFile(null);
      setVideoURL(null);
      setVehicleNumber("");
    } catch {
      showNotification("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navHeader}>
        <h1 className={styles.header}>Vehicle Recorder</h1>
        <Link href="/videos" className={styles.dbLink}>
          Database
        </Link>
      </nav>

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <section className={styles.contentCard}>
        {!videoFile ? (
          <>
            {/* 🎥 LIVE CAMERA */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={styles.videoPreview}
            />

            {!recording ? (
              <button
                className={styles.recordButton}
                onClick={startCamera}
              >
                Start Recording
              </button>
            ) : (
              <button
                className={styles.uploadButton}
                onClick={stopRecording}
              >
                Stop Recording
              </button>
            )}
          </>
        ) : (
          <div className={styles.previewContainer}>
            <video
              src={videoURL!}
              controls
              className={styles.videoPreview}
            />

            <form className={styles.inputGroup} onSubmit={handleUpload}>
              <input
                className={styles.vehicleInput}
                type="text"
                placeholder="Vehicle Number"
                value={vehicleNumber}
                required
                onChange={(e) =>
                  setVehicleNumber(e.target.value.toUpperCase())
                }
              />

              <button
                type="submit"
                className={styles.uploadButton}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Record"}
              </button>

              <button
                type="button"
                className={styles.retakeButton}
                onClick={() => {
                  setVideoFile(null);
                  setVideoURL(null);
                }}
              >
                Retake
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}