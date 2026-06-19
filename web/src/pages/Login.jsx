import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "@back/cesizen-api";
import { saveAuth } from "../utils/auth.js";
import styles from "../styles/AuthCard.module.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authError = location.state?.authError;
    if (authError) {
      setError(authError);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Veuillez renseigner votre email et mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const data = await auth.login(form);
      saveAuth({ accessToken: data.accessToken, user: data.user });
      navigate("/admin/users", { replace: true });
    } catch (err) {
      setError(err.message || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authCard}>
      <div className={styles.authCardHeader}>
        <h1>Connexion</h1>
        <p>Accédez à votre espace CesiZen.</p>
      </div>

      <form className={styles.authForm} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="vous@exemple.com"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />
        </label>
        <label className={styles.field}>
          <span>Mot de passe</span>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
          />
        </label>
        {error && <p className={styles.errorText}>{error}</p>}
        <div className={styles.formRow}>
          <label className={styles.checkbox}>
            <input type="checkbox" name="remember" />
            <span>Se souvenir de moi</span>
          </label>
          <button type="button" className={styles.linkButton}>
            Mot de passe oublié ??????????
          </button>
        </div>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className={styles.authFooter}>
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </section>
  );
}
