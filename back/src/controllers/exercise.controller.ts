import type { Request, Response } from "express";
import { createExercisePractice, listBreathingExercises } from "../services/exercise.service.js";

export async function listExercises(_req: Request, res: Response) {
  const exercises = await listBreathingExercises();
  return res.status(200).json({ exercises });
}

export async function createPractice(req: Request, res: Response) {
  const exerciseId = Number.parseInt(String(req.params.exerciseId), 10);
  const durationCompleted = Number(req.body?.durationCompleted);

  if (Number.isNaN(exerciseId)) {
    return res.status(400).json({ message: "exerciseId invalide" });
  }

  if (Number.isNaN(durationCompleted) || durationCompleted < 1) {
    return res.status(400).json({ message: "durationCompleted invalide" });
  }

  try {
    const practice = await createExercisePractice({
      userId: req.user.userId,
      exerciseId,
      durationCompleted: Math.round(durationCompleted)
    });

    return res.status(201).json({ practice });
  } catch (error) {
    if (error instanceof Error && error.message === "EXERCISE_NOT_FOUND") {
      return res.status(404).json({ message: "Exercice introuvable" });
    }

    return res.status(500).json({ message: "Erreur serveur" });
  }
}
