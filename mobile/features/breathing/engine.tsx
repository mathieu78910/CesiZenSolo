export type BreathingPhase = "INHALE" | "HOLD" | "EXHALE";

import type { BreathingPreset } from "./types";

export type PhaseTransition = {
  nextPhase: BreathingPhase;
  durationMs: number;
};

export type BreathingRunnerState = {
  currentPhase: BreathingPhase;
  phaseDurationMs: number;
  phaseStartAt: number;
  remainingMs: number;
  isRunning: boolean;
};

console.log("[BOOT][breathing/engine] module loaded");

export function toMs(seconds: number): number {
  return seconds * 1000;
}

export function computeRemainingMs(phaseStartAt: number, phaseDurationMs: number, now: number): number {
  const elapsedMs = now - phaseStartAt;
  const remaining = phaseDurationMs - elapsedMs;
  return Math.max(0, remaining);
}

export function advancePhase(state: BreathingRunnerState, preset: BreathingPreset, now: number): BreathingRunnerState {
  if (state.remainingMs > 0) {
    return state;
  }

  const transition = getNextPhase(state.currentPhase, preset);
  console.log("[BREATHING][engine] phase transition", state.currentPhase, "->", transition.nextPhase);

  return {
    ...state,
    currentPhase: transition.nextPhase,
    phaseDurationMs: transition.durationMs,
    phaseStartAt: now,
    remainingMs: transition.durationMs,
  };
}

export function tickRunner(state: BreathingRunnerState, preset: BreathingPreset, now: number): BreathingRunnerState {
  if (!state.isRunning) {
    return state;
  }

  const remainingMs = computeRemainingMs(state.phaseStartAt, state.phaseDurationMs, now);
  const updatedState = { ...state, remainingMs };

  return advancePhase(updatedState, preset, now);
}

export function createRunner(preset: BreathingPreset, now: number, isRunning = false): BreathingRunnerState {
  const phaseDurationMs = toMs(preset.inhale);
  console.log("[BREATHING][engine] createRunner", { preset, now, isRunning });

  return {
    currentPhase: "INHALE",
    phaseDurationMs,
    phaseStartAt: now,
    remainingMs: phaseDurationMs,
    isRunning,
  };
}

export function startRunner(state: BreathingRunnerState, now: number): BreathingRunnerState {
  console.log("[BREATHING][engine] startRunner", { now, currentPhase: state.currentPhase });
  return {
    ...state,
    isRunning: true,
    phaseStartAt: now,
  };
}

export function stopRunner(state: BreathingRunnerState): BreathingRunnerState {
  console.log("[BREATHING][engine] stopRunner", { currentPhase: state.currentPhase });
  return {
    ...state,
    isRunning: false,
  };
}

export function resetRunner(preset: BreathingPreset, now: number): BreathingRunnerState {
  console.log("[BREATHING][engine] resetRunner", { preset, now });
  return createRunner(preset, now, false);
}

export function getNextPhase(currentPhase: BreathingPhase, preset: BreathingPreset): PhaseTransition {
  const hasHold = preset.hold > 0;

  let nextPhase: BreathingPhase;
  switch (currentPhase) {
    case "INHALE":
      nextPhase = hasHold ? "HOLD" : "EXHALE";
      break;
    case "HOLD":
      nextPhase = "EXHALE";
      break;
    case "EXHALE":
      nextPhase = "INHALE";
      break;
  }

  let durationSeconds: number;
  switch (nextPhase) {
    case "INHALE":
      durationSeconds = preset.inhale;
      break;
    case "HOLD":
      durationSeconds = preset.hold;
      break;
    case "EXHALE":
      durationSeconds = preset.exhale;
      break;
  }

  return {
    nextPhase,
    durationMs: toMs(durationSeconds),
  };
}
