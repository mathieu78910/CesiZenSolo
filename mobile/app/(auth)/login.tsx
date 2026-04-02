import { auth, getApiBaseUrl } from "@back/cesizen-api";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "../../features/auth/AuthProvider";
import AuthScaffold from "./AuthScaffold";
import styles from "./styles";

export default function LoginScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSignInPress = async () => {
    console.log("[AUTH][login] sign-in pressed");
    setErrorMessage(null);

    if (!emailAddress.trim() || !password.trim()) {
      setErrorMessage("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await auth.login({
        email: emailAddress.trim(),
        password,
      });
      setSession({ accessToken: response.accessToken, user: response.user });
      console.log("[AUTH][login] success");
      router.replace("/(tabs)/articles");
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connexion impossible.";
      const invalidCredentialsMessage =
        message === "Invalid credentials" ? "Email ou mot de passe incorrect." : message;
      const networkMessage =
        invalidCredentialsMessage === "Network request failed"
          ? `Connexion impossible: API injoignable (${getApiBaseUrl()}).`
          : invalidCredentialsMessage;
      console.error("[AUTH][login] error", message, err);
      setErrorMessage(networkMessage);
    } finally {
      setIsLoading(false);
    }
  }

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

          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

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
