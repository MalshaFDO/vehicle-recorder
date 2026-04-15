"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import styles from "./Login.module.css";

const REMEMBERED_LOGIN_KEY = "rememberedLogin";

function getRememberedLogin() {
  if (typeof window === "undefined") {
    return {
      username: "",
      password: "",
      rememberMe: false,
    };
  }

  const savedLogin = window.localStorage.getItem(REMEMBERED_LOGIN_KEY);

  if (!savedLogin) {
    return {
      username: "",
      password: "",
      rememberMe: false,
    };
  }

  try {
    const parsedLogin = JSON.parse(savedLogin) as {
      username?: string;
      password?: string;
    };

    return {
      username: parsedLogin.username ?? "",
      password: parsedLogin.password ?? "",
      rememberMe: Boolean(parsedLogin.username && parsedLogin.password),
    };
  } catch {
    window.localStorage.removeItem(REMEMBERED_LOGIN_KEY);

    return {
      username: "",
      password: "",
      rememberMe: false,
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [rememberedLogin] = useState(getRememberedLogin);
  const [username, setUsername] = useState(rememberedLogin.username);
  const [password, setPassword] = useState(rememberedLogin.password);
  const [rememberMe, setRememberMe] = useState(rememberedLogin.rememberMe);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const normalizedUsername = username.trim();
      const email = `${normalizedUsername}@app.com`;
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        localStorage.setItem(
          REMEMBERED_LOGIN_KEY,
          JSON.stringify({
            username: normalizedUsername,
            password,
          })
        );
      } else {
        localStorage.removeItem(REMEMBERED_LOGIN_KEY);
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
        <div className={styles.logoWrap}>
          <Image
            src="/AFLOGO.jpg"
            alt="AutoFlash logo"
            className={styles.logo}
            width={180}
            height={180}
            priority
          />
        </div>
        <h1 className={styles.title}>Welcome to AutoFlash</h1>
        <form onSubmit={handleLogin}>
          <input
            className={styles.inputField}
            type="text"
            placeholder="Username"
            value={username}
            required
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            className={styles.inputField}
            type="password"
            placeholder="Password"
            value={password}
            required
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
          <button type="submit" className={styles.button}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
