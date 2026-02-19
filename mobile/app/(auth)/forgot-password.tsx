import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import * as React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AuthScaffold } from "./AuthScaffold";
import { authStyles as styles } from "./styles";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const onSubmit = React.useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Veuillez renseigner votre email.");
      return;
    }

    setSuccessMessage("Fonction de réinitialisation non disponible avec l'API actuelle.");
  }, [email]);

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
            <Text style={styles.cardTitle}>Mot de passe oublié</Text>
            <Text style={styles.cardSubtitle}>Entrez votre email pour réinitialiser votre mot de passe.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={email}
              placeholder="vous@exemple.com"
              placeholderTextColor="#8A8177"
              keyboardType="email-address"
              onChangeText={setEmail}
            />
          </View>

          {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}
          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <Pressable
            style={({ pressed }) => [styles.primaryButton, !email.trim() && styles.primaryButtonDisabled, pressed && styles.primaryButtonPressed]}
            onPress={onSubmit}
            disabled={!email.trim()}
          >
            <Text style={styles.primaryButtonText}>Envoyer</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Retour à </Text>
            <Link href="/(auth)/login">
              <Text style={styles.footerAction}>Connexion</Text>
            </Link>
          </View>
        </View>
      </View>
    </AuthScaffold>
  );
}
