import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    exercise: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn()
    },
    userExercise: {
      create: vi.fn()
    }
  }
}));

vi.mock("../utils/prisma.js", () => ({ prisma: prismaMock }));

import { createExercisePractice, listBreathingExercises } from "./exercise.service.js";

describe("exercise.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists exercises and ensures defaults when needed", async () => {
    prismaMock.exercise.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          exerciseId: 1,
          title: "Respiration 7-4-8",
          description: "Un rythme progressif pour ralentir le systeme nerveux et favoriser l'apaisement.",
          exerciseType: "BREATHING",
          duration: 19,
          benefit: "Aide a reduire la tension et preparer au repos."
        }
      ]);
    prismaMock.exercise.create.mockResolvedValue({});

    const result = await listBreathingExercises();

    expect(prismaMock.exercise.create).toHaveBeenCalled();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].preset).toBeDefined();
  });

  it("creates a completed practice", async () => {
    prismaMock.exercise.findUnique.mockResolvedValueOnce({ exerciseId: 1 });
    prismaMock.userExercise.create.mockResolvedValueOnce({
      practiceId: 5,
      exerciseId: 1,
      userId: 9,
      durationCompleted: 120
    });

    const result = await createExercisePractice({ userId: 9, exerciseId: 1, durationCompleted: 120 });
    expect(result.practiceId).toBe(5);
  });

  it("throws when exercise does not exist", async () => {
    prismaMock.exercise.findUnique.mockResolvedValueOnce(null);
    await expect(createExercisePractice({ userId: 1, exerciseId: 999, durationCompleted: 40 })).rejects.toThrow(
      "EXERCISE_NOT_FOUND"
    );
  });
});

