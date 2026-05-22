import { auth, users } from "@back/cesizen-api";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../features/auth/AuthProvider";
import { mapResourceToArticle } from "../../features/articles/data";
import type { ArticleResource } from "../../features/articles/types";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LibraryState = {
  likedResources: ReturnType<typeof mapResourceToArticle>[];
  savedResources: ReturnType<typeof mapResourceToArticle>[];
};

function buildInitialForm(user: { firstName: string; lastName: string; email: string }): ProfileForm {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: "",
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, clearSession, updateUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>(() =>
    buildInitialForm(
      session?.user ?? {
        firstName: "",
        lastName: "",
        email: "",
      }
    )
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [library, setLibrary] = useState<LibraryState>({ likedResources: [], savedResources: [] });
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const hasChanges = useMemo(() => {
    if (!session?.user) {
      return false;
    }

    return (
      form.firstName.trim() !== session.user.firstName ||
      form.lastName.trim() !== session.user.lastName ||
      form.email.trim().toLowerCase() !== session.user.email.toLowerCase() ||
      form.password.trim().length > 0
    );
  }, [form, session?.user]);

  const loadLibrary = async () => {
    if (!session) {
      return;
    }

    setIsLoadingLibrary(true);

    try {
      const response = await users.getMyLibrary({ token: session.accessToken });
      setLibrary({
        likedResources: (response.likedResources || []).map((resource: ArticleResource, index: number) =>
          mapResourceToArticle(resource, index === 0)
        ),
        savedResources: (response.savedResources || []).map((resource: ArticleResource, index: number) =>
          mapResourceToArticle(resource, index === 0)
        ),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible de charger vos ressources.");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    loadLibrary();
  }, [session]);

  if (!session) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Compte utilisateur</Text>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Connectez-vous pour gerer votre compte, vos likes et vos contenus enregistres.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Compte mobile requis</Text>
          <Text style={styles.guestText}>
            Les visiteurs anonymes peuvent consulter les contenus et lancer la respiration, mais la gestion du compte et les
            interactions de contenu sont reservees aux utilisateurs connectes.
          </Text>
          <View style={styles.guestActions}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text style={styles.secondaryButtonText}>Creer un compte</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  const resetForm = () => {
    setForm(buildInitialForm(session.user));
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const refreshProfile = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const response = await users.getMe({ token: session.accessToken });
      updateUser(response.user);
      setForm(buildInitialForm(response.user));
      await loadLibrary();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible de recharger le profil.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const saveProfile = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: Record<string, string> = {};
    const nextFirstName = form.firstName.trim();
    const nextLastName = form.lastName.trim();
    const nextEmail = form.email.trim().toLowerCase();
    const nextPassword = form.password.trim();

    if (!nextFirstName || !nextLastName || !nextEmail) {
      setErrorMessage("Prenom, nom et email sont obligatoires.");
      return;
    }

    if (nextFirstName !== session.user.firstName) {
      payload.firstName = nextFirstName;
    }
    if (nextLastName !== session.user.lastName) {
      payload.lastName = nextLastName;
    }
    if (nextEmail !== session.user.email.toLowerCase()) {
      payload.email = nextEmail;
    }
    if (nextPassword) {
      payload.password = nextPassword;
    }

    if (Object.keys(payload).length === 0) {
      setSuccessMessage("Aucune modification a enregistrer.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await users.updateMe({ payload, token: session.accessToken });
      updateUser(response.user);
      setForm(buildInitialForm(response.user));
      setSuccessMessage("Profil mis a jour.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Mise a jour impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      await auth.logout();
    } catch {
      // Ignore API logout failures and clear local session anyway.
    } finally {
      clearSession();
      router.replace("/(auth)/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Compte utilisateur</Text>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Consultez vos informations et mettez a jour votre compte.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.identityRow}>
          <View>
            <Text style={styles.name}>
              {session.user.firstName} {session.user.lastName}
            </Text>
            <Text style={styles.email}>{session.user.email}</Text>
          </View>
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>{session.user.role}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>ID</Text>
            <Text style={styles.metaValue}>#{session.user.userId}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Etat</Text>
            <Text style={styles.metaValue}>{session.user.isAnonymized ? "Anonymise" : "Actif"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Modifier mes informations</Text>

        <Field
          label="Prenom"
          value={form.firstName}
          onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))}
          placeholder="Prenom"
        />
        <Field
          label="Nom"
          value={form.lastName}
          onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))}
          placeholder="Nom"
        />
        <Field
          label="Email"
          value={form.email}
          onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
          placeholder="vous@exemple.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Nouveau mot de passe"
          value={form.password}
          onChangeText={(value) => setForm((current) => ({ ...current, password: value }))}
          placeholder="Laisser vide pour conserver"
          secureTextEntry
        />

        {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        {!!successMessage && <Text style={styles.success}>{successMessage}</Text>}

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={resetForm}
          >
            <Text style={styles.secondaryButtonText}>Annuler</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (!hasChanges || isSaving) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={saveProfile}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Enregistrer</Text>}
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.libraryHeader}>
          <Text style={styles.sectionTitle}>Mes ressources</Text>
          {isLoadingLibrary ? <ActivityIndicator color="#2F241B" /> : null}
        </View>
        <LibrarySection
          title="Articles likes"
          articles={library.likedResources}
          emptyText="Aucun like pour le moment."
          onOpen={(slug) => router.push(`/articles/${slug}`)}
        />
        <LibrarySection
          title="Articles enregistres"
          articles={library.savedResources}
          emptyText="Aucun article enregistre."
          onOpen={(slug) => router.push(`/articles/${slug}`)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Session</Text>
        <Pressable
          style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}
          onPress={logout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.dangerButtonText}>Se deconnecter</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

type LibrarySectionProps = {
  title: string;
  articles: ReturnType<typeof mapResourceToArticle>[];
  emptyText: string;
  onOpen: (slug: string) => void;
};

function LibrarySection({ title, articles, emptyText, onOpen }: LibrarySectionProps) {
  return (
    <View style={styles.librarySection}>
      <Text style={styles.libraryTitle}>{title}</Text>
      {articles.length === 0 ? <Text style={styles.libraryEmpty}>{emptyText}</Text> : null}
      {articles.map((article) => (
        <Pressable
          key={`${title}-${article.slug}`}
          style={({ pressed }) => [styles.libraryItem, pressed && styles.buttonPressed]}
          onPress={() => onOpen(article.slug)}
        >
          <View style={styles.libraryItemText}>
            <Text style={styles.libraryItemTitle}>{article.title}</Text>
            <Text style={styles.libraryItemMeta}>
              {article.likeCount} likes · {article.saveCount} enregistrements
            </Text>
          </View>
          <Text style={styles.libraryItemAction}>Ouvrir</Text>
        </Pressable>
      ))}
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = "words",
  keyboardType = "default",
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A8177"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F3EE",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
    gap: 18,
  },
  hero: {
    gap: 8,
  },
  eyebrow: {
    color: "#9A6B47",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#171411",
  },
  subtitle: {
    color: "#675F57",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  guestText: {
    color: "#675F57",
    lineHeight: 22,
  },
  guestActions: {
    gap: 12,
  },
  libraryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  librarySection: {
    gap: 10,
  },
  libraryTitle: {
    color: "#171411",
    fontWeight: "800",
    fontSize: 16,
  },
  libraryEmpty: {
    color: "#8A8177",
  },
  libraryItem: {
    borderRadius: 16,
    backgroundColor: "#F7F3EE",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  libraryItemText: {
    flex: 1,
    gap: 4,
  },
  libraryItemTitle: {
    color: "#171411",
    fontWeight: "700",
  },
  libraryItemMeta: {
    color: "#8A8177",
    fontSize: 12,
  },
  libraryItemAction: {
    color: "#9A6B47",
    fontWeight: "800",
  },
  identityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  name: {
    color: "#171411",
    fontSize: 22,
    fontWeight: "800",
  },
  email: {
    color: "#675F57",
    marginTop: 4,
  },
  roleChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#EFE4D8",
  },
  roleChipText: {
    color: "#2F241B",
    fontWeight: "800",
    fontSize: 12,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metaBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#F7F3EE",
    padding: 14,
    gap: 4,
  },
  metaLabel: {
    color: "#8A8177",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaValue: {
    color: "#171411",
    fontWeight: "800",
  },
  sectionTitle: {
    color: "#171411",
    fontSize: 18,
    fontWeight: "800",
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: "#2F241B",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E7DDD2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#171411",
    backgroundColor: "#FFF9F2",
  },
  error: {
    color: "#9F2D27",
    fontWeight: "700",
  },
  success: {
    color: "#1E6D53",
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#111111",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#EFE4D8",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#2F241B",
    fontWeight: "800",
  },
  secondaryAction: {
    borderRadius: 14,
    backgroundColor: "#EFE4D8",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: "#2F241B",
    fontWeight: "800",
  },
  dangerButton: {
    borderRadius: 14,
    backgroundColor: "#9F2D27",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
