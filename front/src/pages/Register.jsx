import { Link } from "react-router-dom";
import styles from "../styles/AuthCard.module.css";

export default function Register() {
  return (
    <section className={styles.authCard}>
      <div className={styles.authCardHeader}>
        <h1>Créer un compte</h1>
        <p>Rejoignez CesiZen en quelques secondes.</p>
      </div>

      <form className={styles.authForm}>
        <label className={styles.field}>
          <span>Nom complet</span>
          <input type="text" name="fullName" placeholder="Camille Dupont" required />
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <input type="email" name="email" placeholder="vous@exemple.com" required />
        </label>
        <label className={styles.field}>
          <span>Mot de passe</span>
          <input type="password" name="password" placeholder="••••••••" required />
        </label>
        <label className={styles.field}>
          <span>Confirmer le mot de passe</span>
          <input type="password" name="confirmPassword" placeholder="••••••••" required />
        </label>
        <button type="submit" className={styles.primaryButton}>
          Créer mon compte
        </button>
      </form>

      <p className={styles.authFooter}>
        Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </section>
  );
}
