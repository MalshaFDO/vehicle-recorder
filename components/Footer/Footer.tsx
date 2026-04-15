import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>
          <span className={styles.label}>Developed by</span>
          <span className={styles.name}>Malsha Fernando</span>
          <span className={styles.year}>• 2026 Vehicle System</span>
        </p>
      </div>
    </footer>
  );
}
