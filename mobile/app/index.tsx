import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../features/auth/AuthProvider";

export default function WelcomeScreen() {
  const router = useRouter();
  const { session } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <LinearGradient colors={["#FFF6EA", "#F7F3EE", "#EFE7DE"]} style={styles.background} />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CZ</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>CesiZen</Text>
            <Text style={styles.brandSubtitle}>Bien-être et suivi quotidien</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Bienvenue</Text>
          <Text style={styles.title}>Choisissez comment entrer dans l’application</Text>
          <Text style={styles.subtitle}>
            Vous pouvez consulter le contenu librement, ou vous connecter pour retrouver votre compte mobile.
          </Text>
        </View>

        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text style={styles.primaryButtonText}>Créer un compte</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.darkButton, pressed && styles.buttonPressed]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.darkButtonText}>{session?.accessToken ? "Changer de compte" : "Se connecter"}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.replace("/(tabs)/articles")}
          >
            <Text style={styles.secondaryButtonText}>
              {session?.accessToken ? "Entrer avec mon compte" : "Continuer sans compte"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F3EE",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  orbTop: {
    position: "absolute",
    top: -100,
    right: -70,
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: "rgba(255, 224, 188, 0.58)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -120,
    left: -90,
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "rgba(226, 211, 196, 0.52)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: "space-between",
    gap: 24,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#151515",
  },
  brandSubtitle: {
    marginTop: 2,
    color: "#6A635C",
  },
  hero: {
    gap: 10,
  },
  eyebrow: {
    color: "#9A6B47",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    color: "#171411",
    fontWeight: "900",
  },
  subtitle: {
    color: "#5E5952",
    lineHeight: 22,
    fontSize: 15,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    gap: 12,
    shadowColor: "#5C4637",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#CC6A2B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFF8F2",
    fontWeight: "800",
    fontSize: 16,
  },
  darkButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#1F1A16",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  darkButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#F4EADF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E5D7C8",
  },
  secondaryButtonText: {
    color: "#2F241B",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
