import { useEffect, useMemo, useState } from "react";
import { resources as resourcesApi } from "@back/cesizen-api";
import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/models/dom";
import "tinymce/themes/silver";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/code";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/preview";
import "tinymce/plugins/table";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";
import { getAccessToken } from "../utils/auth.js";
import styles from "../styles/AdminArticles.module.css";

const emptyForm = {
  title: "",
  resourceType: "ARTICLE",
  categoriesText: "",
  content: "",
};

function parseCategories(value) {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AdminArticles() {
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isCompactEditor, setIsCompactEditor] = useState(
    () => window.innerWidth < 1320,
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  const fetchResources = async (searchTerm = debouncedSearch) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await resourcesApi.listResources({
        page,
        limit,
        search: searchTerm,
        resourceType: resourceTypeFilter || undefined,
        token: getAccessToken(),
      });
      setResources(data.resources || []);
      setTotal(data.total || 0);
      setPage(data.page || page);
      setLimit(data.limit || limit);
    } catch (err) {
      setError(err.message || "Impossible de charger les articles");
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
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, resourceTypeFilter]);

  useEffect(() => {
    const handleResize = () => {
      setIsCompactEditor(window.innerWidth < 1320);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setMode("create");
    setEditingId(null);
  };

  const handleEdit = (resource) => {
    setMode("edit");
    setEditingId(resource.resourceId);
    setForm({
      title: resource.title || "",
      resourceType: resource.resourceType || "ARTICLE",
      categoriesText: (resource.categories || [])
        .map((category) => category.label)
        .join(", "),
      content: resource.content || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      resourceType: form.resourceType.trim(),
      categories: parseCategories(form.categoriesText),
    };

    if (!payload.title || !payload.content || !payload.resourceType) {
      setError("Veuillez renseigner le titre, le type et le contenu.");
      return;
    }

    try {
      if (mode === "create") {
        await resourcesApi.createResource({ payload, token: getAccessToken() });
      } else {
        if (!editingId) {
          setError("Aucun article selectionne.");
          return;
        }
        await resourcesApi.updateResource({
          resourceId: editingId,
          payload,
          token: getAccessToken(),
        });
      }

      resetForm();
      await fetchResources();
    } catch (err) {
      setError(err.message || "Operation impossible");
    }
  };

  const handleDelete = async (resourceId) => {
    setError("");
    if (!window.confirm("Supprimer cet article ?")) return;

    try {
      await resourcesApi.deleteResource({ resourceId, token: getAccessToken() });
      if (editingId === resourceId) {
        resetForm();
      }
      await fetchResources();
    } catch (err) {
      setError(err.message || "Suppression impossible");
    }
  };

  return (
    <section className={styles.adminPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Console admin</p>
          <h1>Gestion des articles</h1>
          <p className={styles.subtitle}>
            Créez, modifiez et supprimez les contenus lus sur le mobile.
          </p>
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
            <h2>Liste des articles</h2>
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
                value={resourceTypeFilter}
                onChange={(event) => {
                  setPage(1);
                  setResourceTypeFilter(event.target.value);
                }}
              >
                <option value="">Tous les types</option>
                <option value="ARTICLE">ARTICLE</option>
                <option value="NEWS">NEWS</option>
                <option value="GUIDE">GUIDE</option>
              </select>
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
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => fetchResources(searchInput.trim())}
              >
                Rafraichir
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Likes</th>
                  <th>Enreg.</th>
                  <th>Categories</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      Chargement…
                    </td>
                  </tr>
                )}
                {!isLoading && resources.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      Aucun article trouve.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  resources.map((resource) => (
                    <tr key={resource.resourceId}>
                      <td>#{resource.resourceId}</td>
                      <td>
                        <strong>{resource.title}</strong>
                        <p className={styles.preview}>
                          {stripHtml(resource.content).slice(0, 110)}...
                        </p>
                      </td>
                      <td>
                        <span className={styles.badgeType}>
                          {resource.resourceType}
                        </span>
                      </td>
                      <td>{resource.likeCount ?? 0}</td>
                      <td>{resource.saveCount ?? 0}</td>
                      <td>
                        <div className={styles.categoryList}>
                          {(resource.categories || []).map((category) => (
                            <span
                              key={category.categoryId}
                              className={styles.categoryChip}
                            >
                              {category.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleEdit(resource)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className={styles.danger}
                          onClick={() => handleDelete(resource.resourceId)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Precedent
            </button>
            <span>
              Page {page} sur {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Suivant
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>
              {mode === "create" ? "Nouvel article" : `Modifier #${editingId}`}
            </h2>
            {mode === "edit" && (
              <button
                type="button"
                className={styles.ghostButton}
                onClick={resetForm}
              >
                Annuler
              </button>
            )}
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGrid}>
              <label className={styles.fieldSpanTwo}>
                <span>Titre</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Ex. Reconnaitre les signes de surcharge avant le point de rupture"
                />
              </label>
              <label>
                <span>Type</span>
                <select
                  value={form.resourceType}
                  onChange={(event) =>
                    setForm({ ...form, resourceType: event.target.value })
                  }
                >
                  <option value="ARTICLE">ARTICLE</option>
                  <option value="NEWS">NEWS</option>
                  <option value="GUIDE">GUIDE</option>
                </select>
              </label>
              <label>
                <span>Categories</span>
                <input
                  type="text"
                  value={form.categoriesText}
                  onChange={(event) =>
                    setForm({ ...form, categoriesText: event.target.value })
                  }
                  placeholder="stress, sommeil, concentration"
                />
              </label>
            </div>

            <label className={styles.editorField}>
              <div className={styles.editorHeader}>
                <div>
                  <span>Contenu</span>
                  <p className={styles.editorHelp}>
                    Structure l’article avec des titres, listes et liens. Le
                    rendu est optimisé pour la lecture mobile.
                  </p>
                </div>
              </div>
              <div className={styles.editorWrap}>
                <Editor
                  licenseKey="gpl"
                  value={form.content}
                  onEditorChange={(value) =>
                    setForm({ ...form, content: value })
                  }
                  init={{
                    min_height: isCompactEditor ? 520 : 460,
                    menubar: false,
                    branding: false,
                    resize: false,
                    statusbar: false,
                    toolbar_mode: isCompactEditor ? "sliding" : "wrap",
                    toolbar_sticky: true,
                    quickbars_selection_toolbar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "table",
                      "preview",
                      "code",
                    ],
                    toolbar: isCompactEditor
                      ? "undo redo | blocks | bold italic | bullist numlist | link | code"
                      : "undo redo | blocks | bold italic underline | bullist numlist | link table | preview code",
                    content_style:
                      "body { font-family: Inter, sans-serif; font-size: 16px; line-height: 1.7; padding: 18px; color: #201914; } h2,h3 { font-family: Montserrat, sans-serif; }",
                    placeholder:
                      "Commence par une accroche claire, puis structure avec des intertitres et des paragraphes courts.",
                  }}
                />
              </div>
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton}>
                {mode === "create" ? "Creer l'article" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
