import { exercises } from "@back/cesizen-api";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import { DEFAULT_BREATHING_EXERCISES } from "./presets";
import type { BreathingExercise } from "./types";
import { useBreathingRunner } from "./useBreathingRunner";

const PHASE_LABELS = {
  INHALE: "Inspiration",
  HOLD: "Apnee",
  EXHALE: "Expiration",
} as const;

const PHASE_COLORS = {
  INHALE: "#7AA3FF",
  HOLD: "#8E8E8E",
  EXHALE: "#2B2621",
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function BreathingScreen() {
  const { session } = useAuth();
  const [availableExercises, setAvailableExercises] = useState<BreathingExercise[]>(DEFAULT_BREATHING_EXERCISES);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number>(DEFAULT_BREATHING_EXERCISES[1]?.exerciseId ?? 0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadExercises = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await exercises.listExercises({});
        if (cancelled) {
          return;
        }

        const nextExercises = response.exercises?.length ? response.exercises : DEFAULT_BREATHING_EXERCISES;
        setAvailableExercises(nextExercises);
        setSelectedExerciseId(nextExercises[0]?.exerciseId ?? 0);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Impossible de charger les exercices.");
          setAvailableExercises(DEFAULT_BREATHING_EXERCISES);
          setSelectedExerciseId(DEFAULT_BREATHING_EXERCISES[0]?.exerciseId ?? 0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadExercises();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedExercise = useMemo(
    () => availableExercises.find((exercise) => exercise.exerciseId === selectedExerciseId) ?? availableExercises[0],
    [availableExercises, selectedExerciseId]
  );
  const { presetKey, runner, startedAt, start, stop, reset } = useBreathingRunner(
    selectedExercise?.presetKey ?? DEFAULT_BREATHING_EXERCISES[0].presetKey,
    selectedExercise?.preset ?? DEFAULT_BREATHING_EXERCISES[0].preset
  );

  const remainingSeconds = (runner.remainingMs / 1000).toFixed(1);
  const phaseProgress = clamp(1 - runner.remainingMs / Math.max(1, runner.phaseDurationMs), 0, 1);

  const circleScale =
    runner.currentPhase === "INHALE"
      ? 0.65 + 0.35 * phaseProgress
      : runner.currentPhase === "HOLD"
        ? 1
        : 1 - 0.35 * phaseProgress;
  const phaseHint =
    runner.currentPhase === "INHALE" ? "Inspire" : runner.currentPhase === "HOLD" ? "Garde l'air" : "Expire";

  const savePractice = async () => {
    if (!session?.accessToken || !selectedExercise?.exerciseId || !startedAt) {
      return;
    }

    const durationCompleted = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

    try {
      await exercises.createPractice({
        exerciseId: selectedExercise.exerciseId,
        payload: { durationCompleted },
        token: session.accessToken
      });
      setSuccessMessage("Session enregistree.");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible d'enregistrer la session.");
      setSuccessMessage(null);
    }
  };

  const handleStop = async () => {
    stop();
    if (session?.accessToken) {
      await savePractice();
    } else {
      setSuccessMessage("Exercice termine. Connectez-vous pour enregistrer vos sessions.");
      setErrorMessage(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercice de respiration</Text>
      <Text style={styles.subtitle}>Presets recuperes depuis le backend. L'exercice est accessible meme sans compte.</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Preset actuel: {presetKey}</Text>
        {selectedExercise ? <Text style={styles.description}>{selectedExercise.description}</Text> : null}
        <View style={styles.row}>
          {availableExercises.map((exercise) => (
            <Pressable
              key={exercise.exerciseId}
              onPress={() => {
                setSelectedExerciseId(exercise.exerciseId);
                setSuccessMessage(null);
              }}
              style={[styles.chip, selectedExerciseId === exercise.exerciseId && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedExerciseId === exercise.exerciseId && styles.chipTextActive]}>
                {exercise.presetKey}
              </Text>
            </Pressable>
          ))}
        </View>
        {isLoading ? <ActivityIndicator color="#2F241B" /> : null}
        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}
      </View>

      <View style={styles.section}>
        <View style={styles.circleWrap}>
          <View style={[styles.circleOuter, { borderColor: PHASE_COLORS[runner.currentPhase] }]}>
            <View
              style={[
                styles.circleInner,
                {
                  backgroundColor: PHASE_COLORS[runner.currentPhase],
                  transform: [{ scale: circleScale }],
                },
              ]}
            />
          </View>
        </View>
        <Text style={styles.phase}>{PHASE_LABELS[runner.currentPhase]}</Text>
        <Text style={styles.countdown}>{remainingSeconds}s</Text>
        <Text style={styles.helper}>{phaseHint}</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.button} onPress={start}>
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    paddingHorizontal: 20,
    paddingTop: 56,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#151515",
  },
  subtitle: {
    color: "#5E5952",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  label: {
    fontWeight: "600",
    color: "#2B2621",
  },
  description: {
    color: "#5E5952",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EEE6DC",
  },
  chipActive: {
    backgroundColor: "#111111",
  },
  chipText: {
    color: "#2B2621",
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  phase: {
    fontSize: 22,
    fontWeight: "800",
    color: "#151515",
  },
  countdown: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111111",
  },
  helper: {
    color: "#6A635C",
    fontSize: 12,
    textAlign: "center",
  },
  circleWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  circleOuter: {
    width: 180,
    height: 180,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F2EC",
  },
  circleInner: {
    width: 130,
    height: 130,
    borderRadius: 999,
  },
  button: {
    backgroundColor: "#111111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  errorText: {
    color: "#A63D40",
    fontWeight: "700",
  },
  successText: {
    color: "#256D1B",
    fontWeight: "700",
  },
});
