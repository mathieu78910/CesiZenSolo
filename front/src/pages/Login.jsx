import { Link } from "react-router-dom";
import styles from "../styles/AuthCard.module.css";

export default function Login() {
  return (
    <section className={styles.authCard}>
      <div className={styles.authCardHeader}>
        <h1>Connexion</h1>
        <p>Accédez à votre espace CesiZen.</p>
      </div>

      <form className={styles.authForm}>
        <label className={styles.field}>
          <span>Email</span>
          <input type="email" name="email" placeholder="vous@exemple.com" required />
        </label>
        <label className={styles.field}>
          <span>Mot de passe</span>
          <input type="password" name="password" placeholder="••••••••" required />
        </label>
        <div className={styles.formRow}>
          <label className={styles.checkbox}>
            <input type="checkbox" name="remember" />
            <span>Se souvenir de moi</span>
          </label>
          <button type="button" className={styles.linkButton}>
            Mot de passe oublié ?
          </button>
        </div>
        <button type="submit" className={styles.primaryButton}>
          Se connecter
        </button>
      </form>

      <p className={styles.authFooter}>
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </section>
  );
}
