import { beforeEach, describe, expect, it, vi } from "vitest";

const { exerciseServiceMock } = vi.hoisted(() => ({
  exerciseServiceMock: {
    listBreathingExercises: vi.fn(),
    createExercisePractice: vi.fn()
  }
}));

vi.mock("../services/exercise.service.js", () => exerciseServiceMock);

import { createPractice, listExercises } from "./exercise.controller.js";

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("exercise.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists exercises", async () => {
    exerciseServiceMock.listBreathingExercises.mockResolvedValueOnce([{ exerciseId: 1 }]);
    const req: any = {};
    const res = createRes();
    await listExercises(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("creates practice", async () => {
    exerciseServiceMock.createExercisePractice.mockResolvedValueOnce({ practiceId: 1 });
    const req: any = { params: { exerciseId: "1" }, body: { durationCompleted: 120 }, user: { userId: 3 } };
    const res = createRes();
    await createPractice(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("rejects invalid duration", async () => {
    const req: any = { params: { exerciseId: "1" }, body: { durationCompleted: 0 }, user: { userId: 3 } };
    const res = createRes();
    await createPractice(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

