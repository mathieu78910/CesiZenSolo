import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth.js";
import { saveAuth } from "../utils/auth.js";
import styles from "../styles/AuthCard.module.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password
      });
      saveAuth({ accessToken: data.accessToken, user: data.user });
      if (data.user?.role === "ADMIN") {
        navigate("/admin/users", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authCard}>
      <div className={styles.authCardHeader}>
        <h1>Créer un compte</h1>
        <p>Rejoignez CesiZen en quelques secondes.</p>
      </div>

      <form className={styles.authForm} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Prénom</span>
          <input
            type="text"
            name="firstName"
            placeholder="Camille"
            value={form.firstName}
            onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Nom</span>
          <input
            type="text"
            name="lastName"
            placeholder="Dupont"
            value={form.lastName}
            onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="vous@exemple.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
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
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Confirmer le mot de passe</span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            required
          />
        </label>
        {error && <p className={styles.errorText}>{error}</p>}
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className={styles.authFooter}>
        Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </section>
  );
}
