import { prisma } from "../utils/prisma.js";

const DEFAULT_BREATHING_EXERCISES = [
  {
    title: "Respiration 7-4-8",
    description: "Un rythme progressif pour ralentir le systeme nerveux et favoriser l'apaisement.",
    exerciseType: "BREATHING",
    duration: 19,
    benefit: "Aide a reduire la tension et preparer au repos.",
    presetKey: "748",
    preset: { inhale: 7, hold: 4, exhale: 8 }
  },
  {
    title: "Respiration 5-5",
    description: "Un cycle simple et regulier pour retrouver une respiration stable pendant la journee.",
    exerciseType: "BREATHING",
    duration: 10,
    benefit: "Facilite le recentrage et la stabilisation du souffle.",
    presetKey: "55",
    preset: { inhale: 5, hold: 0, exhale: 5 }
  },
  {
    title: "Respiration 4-6",
    description: "Une expiration plus longue pour faire redescendre rapidement la charge mentale.",
    exerciseType: "BREATHING",
    duration: 10,
    benefit: "Favorise le calme et la recuperation apres une tension courte.",
    presetKey: "46",
    preset: { inhale: 4, hold: 0, exhale: 6 }
  }
] as const;

type PresetDefinition = (typeof DEFAULT_BREATHING_EXERCISES)[number];

function buildExerciseSignature(exercise: PresetDefinition) {
  return {
    title: exercise.title,
    description: exercise.description,
    exerciseType: exercise.exerciseType
  };
}

async function ensureDefaultBreathingExercises() {
  const existing = await prisma.exercise.findMany({
    where: { exerciseType: "BREATHING" },
    select: {
      exerciseId: true,
      title: true,
      description: true,
      exerciseType: true,
      duration: true,
      benefit: true
    },
    orderBy: { exerciseId: "asc" }
  });

  if (existing.length >= DEFAULT_BREATHING_EXERCISES.length) {
    return existing;
  }

  for (const presetExercise of DEFAULT_BREATHING_EXERCISES) {
    const match = existing.find((exercise) =>
      exercise.title === presetExercise.title &&
      exercise.description === presetExercise.description &&
      exercise.exerciseType === presetExercise.exerciseType
    );

    if (match) {
      continue;
    }

    await prisma.exercise.create({
      data: {
        ...buildExerciseSignature(presetExercise),
        duration: presetExercise.duration,
        benefit: presetExercise.benefit
      }
    });
  }

  return prisma.exercise.findMany({
    where: { exerciseType: "BREATHING" },
    select: {
      exerciseId: true,
      title: true,
      description: true,
      exerciseType: true,
      duration: true,
      benefit: true
    },
    orderBy: { exerciseId: "asc" }
  });
}

function attachPreset(exercise: {
  exerciseId: number;
  title: string;
  description: string;
  exerciseType: string;
  duration: number;
  benefit: string;
}) {
  const match =
    DEFAULT_BREATHING_EXERCISES.find((presetExercise) => presetExercise.title === exercise.title) ??
    DEFAULT_BREATHING_EXERCISES[0];

  return {
    exerciseId: exercise.exerciseId,
    title: exercise.title,
    description: exercise.description,
    exerciseType: exercise.exerciseType,
    duration: exercise.duration,
    benefit: exercise.benefit,
    presetKey: match.presetKey,
    preset: match.preset
  };
}

export async function listBreathingExercises() {
  const exercises = await ensureDefaultBreathingExercises();
  return exercises.map(attachPreset);
}

export async function createExercisePractice(input: {
  userId: number;
  exerciseId: number;
  durationCompleted: number;
}) {
  const exercise = await prisma.exercise.findUnique({
    where: { exerciseId: input.exerciseId },
    select: { exerciseId: true }
  });

  if (!exercise) {
    throw new Error("EXERCISE_NOT_FOUND");
  }

  const practice = await prisma.userExercise.create({
    data: {
      userId: input.userId,
      exerciseId: input.exerciseId,
      completedAt: new Date(),
      durationCompleted: input.durationCompleted
    },
    select: {
      practiceId: true,
      exerciseId: true,
      userId: true,
      completedAt: true,
      durationCompleted: true
    }
  });

  return practice;
}
