import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Text, View } from "react-native";
import { authStyles as styles } from "./styles";

type AuthScaffoldProps = {
  children: React.ReactNode;
};

export function AuthScaffold({ children }: AuthScaffoldProps) {
  return (
    <View style={styles.screen}>
      <LinearGradient colors={["#FFF6EA", "#F7F3EE", "#EFE7DE"]} style={styles.background} />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <View style={styles.container}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CZ</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>CesiZen</Text>
            <Text style={styles.brandSubtitle}>Bien-être et suivi quotidien</Text>
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}
