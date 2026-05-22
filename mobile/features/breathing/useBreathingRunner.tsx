import { useCallback, useEffect, useState } from "react";
import {
  type BreathingRunnerState,
  createRunner,
  resetRunner,
  startRunner,
  stopRunner,
  tickRunner,
} from "./engine";
import type { BreathingPreset } from "./types";

const TICK_MS = 100;
console.log("[BOOT][breathing/hook] module loaded");

export function useBreathingRunner(presetKey: string, preset: BreathingPreset) {
  const [runner, setRunner] = useState<BreathingRunnerState>(() => createRunner(preset, Date.now(), false));
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    console.log("[BREATHING][hook] preset changed", presetKey, preset);
    setRunner(createRunner(preset, Date.now(), false));
    setStartedAt(null);
  }, [preset]);

  useEffect(() => {
    if (!runner.isRunning) {
      console.log("[BREATHING][hook] timer not started (isRunning=false)");
      return;
    }

    console.log("[BREATHING][hook] timer started", { tickMs: TICK_MS, presetKey });

    const id = setInterval(() => {
      setRunner((prev) => tickRunner(prev, preset, Date.now()));
    }, TICK_MS);

    return () => {
      console.log("[BREATHING][hook] timer cleared");
      clearInterval(id);
    };
  }, [preset, runner.isRunning]);

  const start = useCallback(() => {
    console.log("[BREATHING][hook] start requested");
    setStartedAt(Date.now());
    setRunner((prev) => startRunner(prev, Date.now()));
  }, []);

  const stop = useCallback(() => {
    console.log("[BREATHING][hook] stop requested");
    setRunner((prev) => stopRunner(prev));
  }, []);

  const reset = useCallback(() => {
    console.log("[BREATHING][hook] reset requested");
    setStartedAt(null);
    setRunner(resetRunner(preset, Date.now()));
  }, [preset]);

  return {
    presetKey,
    preset,
    runner,
    startedAt,
    start,
    stop,
    reset,
  };
}
