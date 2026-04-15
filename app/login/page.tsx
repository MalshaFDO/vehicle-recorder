"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async () => {
    try {
      const email = `${username}@app.com`;
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        localStorage.setItem("rememberedUser", username);
      }

      router.push("/record");
    } catch {
      showNotification("Invalid username or password", "error");
    }
  };

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? "Success" : "Error"}: {toast.message}
        </div>
      )}

      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to AutoFlash</h1>
        <input
          className={styles.inputField}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <input
          className={styles.inputField}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <label className={styles.optionsRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span className={styles.label}>Remember me</span>
        </label>
        <button className={styles.button} onClick={handleLogin}>
          Log In
        </button>
      </div>
    </div>
  );
}
