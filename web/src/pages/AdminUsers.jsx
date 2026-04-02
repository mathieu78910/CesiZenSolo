import { useEffect, useMemo, useState } from "react";
import { users as usersApi } from "@back/cesizen-api";
import { getAccessToken, getAuthUser, saveAuth } from "../utils/auth.js";
import styles from "../styles/AdminUsers.module.css";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "USER"
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const currentUser = getAuthUser();

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchUsers = async (searchTerm = debouncedSearch) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await usersApi.listUsers({ page, limit, search: searchTerm, token: getAccessToken() });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPage(data.page || page);
      setLimit(data.limit || limit);
    } catch (err) {
      setError(err.message || "Impossible de charger les utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch]);

  const resetForm = () => {
    setForm(emptyForm);
    setMode("create");
    setEditingId(null);
  };

  const handleEdit = (user) => {
    setMode("edit");
    setEditingId(user.userId);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
      role: user.role || "USER"
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "create") {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      try {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role
        };
        await usersApi.createUser({ payload, token: getAccessToken() });
        resetForm();
        await fetchUsers();
      } catch (err) {
        setError(err.message || "Création impossible");
      }
      return;
    }

    if (!editingId) {
      setError("Aucun utilisateur sélectionné.");
      return;
    }

    const payload = {};
    if (form.firstName) payload.firstName = form.firstName;
    if (form.lastName) payload.lastName = form.lastName;
    if (form.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    if (form.role) payload.role = form.role;

    if (Object.keys(payload).length === 0) {
      setError("Aucune modification à enregistrer.");
      return;
    }

    try {
      const response = await usersApi.updateUser({ userId: editingId, payload, token: getAccessToken() });
      if (currentUser?.userId === response?.user?.userId) {
        saveAuth({ accessToken: getAccessToken(), user: response.user });
      }
      resetForm();
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Mise à jour impossible");
    }
  };

  const handleDelete = async (userId) => {
    setError("");
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await usersApi.deleteUser({ userId, token: getAccessToken() });
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Suppression impossible");
    }
  };

  return (
    <section className={styles.adminPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Console admin</p>
          <h1>Gestion des utilisateurs</h1>
          <p className={styles.subtitle}>Créez, modifiez et contrôlez les accès des utilisateurs CesiZen.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.statCard}>
            <span>Total</span>
            <strong>{total}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Page</span>
            <strong>
              {page}/{totalPages}
            </strong>
          </div>
        </div>
      </header>

      <div className={styles.panelGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>{mode === "create" ? "Nouvel utilisateur" : `Modifier #${editingId}`}</h2>
            {mode === "edit" && (
              <button type="button" className={styles.ghostButton} onClick={resetForm}>
                Annuler
              </button>
            )}
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              <span>Prénom</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                placeholder="Prénom"
                required={mode === "create"}
              />
            </label>
            <label>
              <span>Nom</span>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                placeholder="Nom"
                required={mode === "create"}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="email@exemple.com"
                required={mode === "create"}
              />
            </label>
            <label>
              <span>Mot de passe</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder={mode === "create" ? "Minimum 8 caractères" : "Laisser vide pour garder"}
                required={mode === "create"}
              />
            </label>
            <label>
              <span>Rôle</span>
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.primaryButton}>
              {mode === "create" ? "Créer l'utilisateur" : "Enregistrer"}
            </button>
          </form>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Liste des utilisateurs</h2>
            <div className={styles.controls}>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => {
                  setPage(1);
                  setSearchInput(event.target.value);
                }}
                placeholder="Rechercher…"
              />
              <select
                value={limit}
                onChange={(event) => {
                  setPage(1);
                  setLimit(Number(event.target.value));
                }}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <button type="button" className={styles.ghostButton} onClick={() => fetchUsers(searchInput.trim())}>
                Rafraîchir
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Chargement…
                    </td>
                  </tr>
                )}
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  users.map((user) => (
                    <tr key={user.userId}>
                      <td>#{user.userId}</td>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={user.role === "ADMIN" ? styles.badgeAdmin : styles.badgeUser}>
                          {user.role}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button type="button" onClick={() => handleEdit(user)}>
                          Modifier
                        </button>
                        <button type="button" className={styles.danger} onClick={() => handleDelete(user.userId)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Précédent
            </button>
            <span>
              Page {page} sur {totalPages}
            </span>
            <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Suivant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
