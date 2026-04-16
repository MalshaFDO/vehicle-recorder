"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Record.module.css";

export default function RecordPage() {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (videoURL) URL.revokeObjectURL(videoURL);
    };
  }, [stream, videoURL]);

  // 🎥 START CAMERA
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });

      setStream(mediaStream);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream);
      let localChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) localChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(localChunks, { type: "video/webm" });
        const file = new File([blob], `video-${Date.now()}.webm`, {
          type: "video/webm",
        });

        setVideoFile(file);
        setVideoURL(URL.createObjectURL(file));
        setChunks([]);
      };

      setRecorder(mediaRecorder);
      setChunks([]);
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      showNotification("Camera not supported. Using fallback.", "error");
      fileInputRef.current?.click(); // fallback
    }
  };

  // ⏹ STOP RECORDING
  const stopRecording = () => {
    recorder?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  // 📁 FALLBACK (for unsupported devices)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoFile(file);
    setVideoURL(URL.createObjectURL(file));
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
      showNotification("Upload failed. Try again.", "error");
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
            {/* 🎥 Live Camera Preview */}
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className={styles.videoPreview}
            />

            {!recording ? (
              <button className={styles.recordButton} onClick={startCamera}>
                Start Recording
              </button>
            ) : (
              <button className={styles.uploadButton} onClick={stopRecording}>
                Stop Recording
              </button>
            )}

            {/* fallback */}
            <button
              className={styles.retakeButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Use Gallery / Retry
            </button>
          </>
        ) : (
          <div className={styles.previewContainer}>
            <video src={videoURL!} controls className={styles.videoPreview} />

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
                {loading ? "Processing..." : "Save Record"}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* fallback input */}
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}