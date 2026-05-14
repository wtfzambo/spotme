// ─── SpotMe Engine ─────────────────────────────────────────────────────────
// Platform-agnostic core logic. Adapters (OpenCode, Pi, etc.) delegate here.

import { blockedMessage, exerciseReadyMessage, statusMessage } from './prompts.js';
import type { Difficulty, SpotMeState } from './types.js';
import { CODE_EXTENSIONS, CODE_WRITE_TOOLS, parseArgs } from './types.js';

// ─── Platform adapter interface ─────────────────────────────────────────────

export interface PlatformAdapter {
  /** Resolve a raw file path (possibly absolute) to { fullPath, relativePath }. */
  resolvePath(_rawPath: string): { fullPath: string; relativePath: string };

  /** Return true if the file at `fullPath` exists on disk. */
  fileExists(_fullPath: string): Promise<boolean>;
}

// ─── Return types for engine methods ────────────────────────────────────────

export interface ActivateResult {
  message: string;
}

export interface ExerciseResult {
  message: string;
  filePath: string;
}

export type WriteInterceptResult = { blocked: false } | { blocked: true; message: string };

// ─── Engine ─────────────────────────────────────────────────────────────────

export class SpotMeEngine {
  readonly state: SpotMeState;
  private exercisePending = false;
  private readonly platform: PlatformAdapter;

  constructor(platform: PlatformAdapter) {
    this.platform = platform;
    this.state = {
      enabled: false,
      difficulty: 'medium',
      every: 2,
      counter: 0,
      exercise: null,
    };
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Activate SpotMe with the given (or current) settings.
   * Called by the /spotme:on command hook or the spotme_on tool.
   */
  activate(args?: { difficulty?: Difficulty; every?: number }): ActivateResult {
    if (args?.difficulty) this.state.difficulty = args.difficulty;
    if (args?.every) this.state.every = Math.max(1, Math.floor(args.every));
    this.state.enabled = true;
    this.state.counter = 0;
    this.state.exercise = null;
    this.exercisePending = false;
    return {
      message: `🏋️ SpotMe is on. Difficulty: ${this.state.difficulty}. Triggering every ${this.state.every} code write(s).`,
    };
  }

  /**
   * Activate from raw CLI args string (e.g. "hard --every 3").
   * Parses args using current state as defaults.
   */
  activateFromArgs(rawArgs: string): ActivateResult {
    const parsed = parseArgs(rawArgs, this.state);
    return this.activate(parsed);
  }

  /** Deactivate SpotMe entirely. */
  deactivate(): void {
    this.state.enabled = false;
    this.state.exercise = null;
    this.state.counter = 0;
    this.exercisePending = false;
  }

  // ── Exercise lifecycle ──────────────────────────────────────────────────

  /**
   * Record an exercise start. Called by the spotme_exercise tool AFTER the
   * scaffold file has been written.
   */
  async recordExercise(
    unit: string,
    rawFilePath: string,
    difficulty: Difficulty
  ): Promise<ExerciseResult> {
    const { fullPath, relativePath } = this.platform.resolvePath(rawFilePath);

    if (!(await this.platform.fileExists(fullPath))) {
      throw new Error(
        `Scaffold file not found at ${fullPath}. Write the scaffold with the Write tool first, then call spotme_exercise.`
      );
    }

    this.exercisePending = false;
    this.state.exercise = {
      active: true,
      unit,
      filePath: relativePath,
      difficulty,
    };
    this.state.counter = 0;

    return {
      message: exerciseReadyMessage(unit, relativePath, difficulty),
      filePath: relativePath,
    };
  }

  /** Close the current exercise. Called by spotme_end tool. */
  endExercise(): string {
    this.state.exercise = null;
    this.state.counter = 0;
    this.exercisePending = false;
    return '✅ Exercise closed. Counter reset. Resuming normal mode.';
  }

  // ── Status ──────────────────────────────────────────────────────────────

  getStatus(): string {
    return statusMessage(this.state);
  }

  // ── Write interception ────────────────────────────────────────────────

  /**
   * Called before every tool execution. Returns whether the write should be
   * blocked (exercise trigger) or allowed.
   *
   * @param toolName - Name of the tool being executed.
   * @param filePath - File path argument from the tool call (may be empty).
   */
  interceptWriteToolCall(toolName: string, filePath: string): WriteInterceptResult {
    if (!this.state.enabled) return { blocked: false };

    // Bypass: scaffold write in progress, or exercise active (user implementing).
    if (this.exercisePending || this.state.exercise?.active) return { blocked: false };

    // Only count code-writing tools.
    if (!CODE_WRITE_TOOLS.has(toolName)) return { blocked: false };

    // Only count code files (allowlist).
    const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
    if (!CODE_EXTENSIONS.has(ext)) return { blocked: false };

    this.state.counter++;
    if (this.state.counter >= this.state.every) {
      this.state.counter = 0;
      this.exercisePending = true;
      return {
        blocked: true,
        message: blockedMessage(toolName, filePath, this.state.difficulty),
      };
    }

    return { blocked: false };
  }
}
