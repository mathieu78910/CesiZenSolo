import { RouterProvider, createBrowserRouter, Navigate, Link, Outlet } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import styles from "./styles/AuthLayout.module.css";

function AuthLayout() {
  return (
    <div className={styles.authApp}>
      <header className={styles.authHeader}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            CZ
          </span>
          <div>
            <p className={styles.brandTitle}>CesiZen</p>
            <p className={styles.brandSubtitle}>Espace client</p>
          </div>
        </div>
        <nav className={styles.authNav}>
          <Link to="/login" className={styles.navLink}>
            Connexion
          </Link>
          <Link to="/register" className={`${styles.navLink} ${styles.navLinkPrimary}`}>
            Créer un compte
          </Link>
        </nav>
      </header>

      <main className={styles.authMain}>
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
