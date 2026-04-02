import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { auth } from "@back/cesizen-api";
import { clearAuth, getAuthUser } from "../utils/auth.js";
import AuthSessionGuard from "./AuthSessionGuard.jsx";
import styles from "../styles/AdminLayout.module.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch {
      // Ignore logout API errors and clear local session anyway.
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className={styles.shell}>
      <AuthSessionGuard />
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIntro}>
            <Link to="/admin/articles" className={styles.brand}>
              <span className={styles.logo}>CZ</span>
              <div>
                <p className={styles.eyebrow}>Console interne</p>
                <p className={styles.title}>CesiZen</p>
                <p className={styles.subtitle}>Pilotage des contenus et des comptes</p>
              </div>
            </Link>
            <nav className={styles.nav}>
              <NavLink
                to="/admin/articles"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                Articles
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                Utilisateurs
              </NavLink>
            </nav>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userChip}>
              <span className={styles.userLabel}>Connecté</span>
              <strong>{user?.email || "Admin"}</strong>
            </div>
            <button type="button" className={styles.logout} onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
