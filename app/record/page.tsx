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

  // Memory Cleanup
  useEffect(() => {
    return () => {
      if (videoURL) URL.revokeObjectURL(videoURL);
    };
  }, [videoURL]);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setTimeout(() => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      console.log("No file yet, retrying...");
      return;
    }

    console.log("File received:", selectedFile);

    if (videoURL) URL.revokeObjectURL(videoURL);

    setVideoFile(selectedFile);
    setVideoURL(URL.createObjectURL(selectedFile));
  }, 300); // 👈 small delay fixes Android bug
};

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Support form submission
    
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
      if (!res.ok) throw new Error();

      showNotification("Record saved successfully", "success");
      setVideoFile(null);
      setVideoURL(null);
      setVehicleNumber("");
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <div className={`${styles.toast} ${styles[toast.type]}`} role="alert">
          {toast.message}
        </div>
      )}

      <section className={styles.contentCard}>
        <p className={styles.hint}>Record 10-20 seconds of the vehicle clearly.</p>

        {!videoFile ? (
          <button
            className={styles.recordButton}
            onClick={() => fileInputRef.current?.click()}
          >
            Capture Video
          </button>
        ) : (
          <div className={styles.previewContainer}>
            <video src={videoURL!} controls className={styles.videoPreview} />

            <form className={styles.inputGroup} onSubmit={handleUpload}>
              <input
                className={styles.vehicleInput}
                type="text"
                placeholder="Vehicle Number (e.g. ABC-1234)"
                value={vehicleNumber}
                required
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              />

              <button
                type="submit"
                className={styles.uploadButton}
                disabled={loading}
              >
                {loading ? "Processing..." : "Save Record"}
              </button>

              <button
                type="button"
                className={styles.retakeButton}
                onClick={() => {
                  setVideoFile(null);
                  setVideoURL(null);
                }}
              >
                Retake Video
              </button>
            </form>
          </div>
        )}
      </section>

      <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleVideoChange}
            onClick={(e) => ((e.target as HTMLInputElement).value = "")}
           />
    </div>
  );
}
