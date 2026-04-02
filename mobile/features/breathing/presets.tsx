import type { BreathingExercise } from "./types";

export const DEFAULT_BREATHING_EXERCISES: BreathingExercise[] = [
  {
    exerciseId: 0,
    title: "Respiration 7-4-8",
    description: "Un rythme progressif pour ralentir le systeme nerveux et favoriser l'apaisement.",
    exerciseType: "BREATHING",
    duration: 19,
    benefit: "Aide a reduire la tension et preparer au repos.",
    presetKey: "748",
    preset: { inhale: 7, hold: 4, exhale: 8 }
  },
  {
    exerciseId: 1,
    title: "Respiration 5-5",
    description: "Un cycle simple et regulier pour retrouver une respiration stable pendant la journee.",
    exerciseType: "BREATHING",
    duration: 10,
    benefit: "Facilite le recentrage et la stabilisation du souffle.",
    presetKey: "55",
    preset: { inhale: 5, hold: 0, exhale: 5 }
  },
  {
    exerciseId: 2,
    title: "Respiration 4-6",
    description: "Une expiration plus longue pour faire redescendre rapidement la charge mentale.",
    exerciseType: "BREATHING",
    duration: 10,
    benefit: "Favorise le calme et la recuperation apres une tension courte.",
    presetKey: "46",
    preset: { inhale: 4, hold: 0, exhale: 6 }
  }
];
