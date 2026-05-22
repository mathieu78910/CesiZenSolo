export type BreathingPreset = {
  inhale: number;
  hold: number;
  exhale: number;
};

export type BreathingExercise = {
  exerciseId: number;
  title: string;
  description: string;
  exerciseType: string;
  duration: number;
  benefit: string;
  presetKey: string;
  preset: BreathingPreset;
};
