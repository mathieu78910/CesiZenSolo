import { RouterProvider, createBrowserRouter, Navigate, Link, Outlet } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ThreeBackground from "./components/ThreeBackground.jsx";
import styles from "./styles/AuthLayout.module.css";

// Layout commun aux pages d'authentification.
function AuthLayout() {
  return (
    <div className={styles.authApp}>
      {/* Canvas Three.js en arrière-plan */}
      <ThreeBackground />
      <div className={styles.authContent}>
        <header className={styles.authHeader}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              CZ
            </span>
            <div>
              <p className={styles.brandTitle}>CesiZen</p>
              <p className={styles.brandSubtitle}>Espace Administrateur</p>
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
          {/* Ici s'affichent Login / Register */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Routes principales (login/register).
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
