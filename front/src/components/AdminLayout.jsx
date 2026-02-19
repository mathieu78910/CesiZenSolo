import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../api/auth.js";
import { clearAuth, getAuthUser } from "../utils/auth.js";
import styles from "../styles/AdminLayout.module.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore logout API errors and clear local session anyway.
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/admin/users" className={styles.brand}>
          <span className={styles.logo}>CZ</span>
          <div>
            <p className={styles.title}>CesiZen</p>
            <p className={styles.subtitle}>Administration</p>
          </div>
        </Link>
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
  );
}
