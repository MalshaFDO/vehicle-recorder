"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Videos.module.css";

type VideoItem = {
  key: string;
  url: string;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    const loadVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        if (active && res.ok) {
          setVideos(data.videos || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    loadVideos();
    return () => { active = false; };
  }, []);

  const filteredVideos = videos.filter((video) => {
  const key = video.key.toLowerCase();
  const date = video.key.split("/")[0];
  return (
    key.includes(search.toLowerCase()) ||
    date.includes(search)
  );
});

  return (
    <div className={styles.container}>
      <nav className={styles.navHeader}>
        <Link href="/record" className={styles.backLink}>
          ← Back to Recorder
        </Link>
      </nav>

      <h1 className={styles.header}>Vehicle Database</h1>

      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Search vehicle number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredVideos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No records found matching &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className={styles.videoGrid}>
          {filteredVideos.map((video, index) => {
            const fileName = video.key.split("/").pop() || "";
            const vehicleNum = fileName.includes("-")
              ? fileName.substring(0, fileName.lastIndexOf("-"))
              : fileName.replace(/\.[^/.]+$/, "");

              const date = video.key.split("/")[0]; // YYYY-MM-DD

            return (
              <div key={index} className={styles.videoCard}>
                <div className={styles.videoInfo}>
                  <span className={styles.icon}>Vehicle</span>
                  <span className={styles.plateNumber}>{vehicleNum}</span>
                  <div className={styles.dateTag}>{date}</div>
                </div>
                <video src={video.url} controls className={styles.videoPlayer} />
                <a
                  href={video.url}
                  download={`${vehicleNum}.mp4`}
                  className={styles.downloadButton}
                >
                  Download Record
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
