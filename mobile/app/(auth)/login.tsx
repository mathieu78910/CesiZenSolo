import { auth } from "@back/cesizen-api";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { AuthScaffold } from "./AuthScaffold";
import { authStyles as styles } from "./styles";

export default function LoginScreen() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const onSignInPress = React.useCallback(async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailAddress.trim() || !password.trim()) {
      setErrorMessage("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    try {
      setIsLoading(true);
      await auth.login({
        email: emailAddress.trim(),
        password,
      });
      setSuccessMessage("Connexion réussie.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connexion impossible.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [emailAddress, password]);

  return (
    <AuthScaffold>
      <View style={styles.card}>
        <LinearGradient
          colors={["rgba(255,255,255,0.65)", "rgba(255,255,255,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardOverlay}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Connexion</Text>
            <Text style={styles.cardSubtitle}>Accédez à votre espace CesiZen.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="vous@exemple.com"
              placeholderTextColor="#8A8177"
              onChangeText={(value) => setEmailAddress(value)}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="••••••••"
              placeholderTextColor="#8A8177"
              secureTextEntry
              onChangeText={(value) => setPassword(value)}
            />
          </View>

          {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}
          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <View style={styles.formRow}>
            <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={styles.secondaryLinkText}>Mot de passe oublié ?</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (!emailAddress.trim() || !password.trim() || isLoading) && styles.primaryButtonDisabled,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onSignInPress}
            disabled={!emailAddress.trim() || !password.trim() || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Se connecter</Text>}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/(auth)/signup">
              <Text style={styles.footerAction}>Créer un compte</Text>
            </Link>
          </View>
        </View>
      </View>
    </AuthScaffold>
  );
}
