import { auth } from "@back/cesizen-api";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AuthScaffold } from "./AuthScaffold";
import { authStyles as styles } from "./styles";

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const onSignupPress = React.useCallback(async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setIsLoading(true);
      await auth.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSuccessMessage("Compte créé. Vous pouvez vous connecter.");
      router.replace("/(auth)/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Inscription impossible.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [form, router]);

  return (
    <AuthScaffold>
      <View style={styles.card}>
        <LinearGradient
          colors={["rgba(255,255,255,0.65)", "rgba(255,255,255,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardOverlay}
        />

        <ScrollView contentContainerStyle={[styles.cardContent, styles.scrollContent]} showsVerticalScrollIndicator={false}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Créer un compte</Text>
            <Text style={styles.cardSubtitle}>Rejoignez CesiZen en quelques secondes.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={form.firstName}
              placeholder="Camille"
              placeholderTextColor="#8A8177"
              onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nom</Text>
            <TextInput
              style={styles.input}
              value={form.lastName}
              placeholder="Dupont"
              placeholderTextColor="#8A8177"
              onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={form.email}
              placeholder="vous@exemple.com"
              placeholderTextColor="#8A8177"
              keyboardType="email-address"
              onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              placeholder="••••••••"
              placeholderTextColor="#8A8177"
              secureTextEntry
              onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Confirmation</Text>
            <TextInput
              style={styles.input}
              value={form.confirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#8A8177"
              secureTextEntry
              onChangeText={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))}
            />
          </View>

          {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}
          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (!form.firstName.trim() ||
                !form.lastName.trim() ||
                !form.email.trim() ||
                !form.password.trim() ||
                !form.confirmPassword.trim() ||
                isLoading) &&
                styles.primaryButtonDisabled,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onSignupPress}
            disabled={
              !form.firstName.trim() ||
              !form.lastName.trim() ||
              !form.email.trim() ||
              !form.password.trim() ||
              !form.confirmPassword.trim() ||
              isLoading
            }
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Créer mon compte</Text>}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Déjà inscrit ? </Text>
            <Link href="/(auth)/login">
              <Text style={styles.footerAction}>Se connecter</Text>
            </Link>
          </View>
        </ScrollView>
      </View>
    </AuthScaffold>
  );
}
