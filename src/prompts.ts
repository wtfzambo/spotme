// ─── All prompt templates and display messages ─────────────────────────────
// Single source of truth for every string the LLM or user sees.

import type { Difficulty, SpotMeState } from './types.js';

// ─── Difficulty labels ────────────────────────────────────────────────────────

function difficultyLabel(d: Difficulty): string {
  switch (d) {
    case 'lite':
      return 'signature + structure provided — implement the body';
    case 'medium':
      return 'signature provided — implement the logic';
    case 'hard':
      return 'spec only — design and implement from scratch';
  }
}

// ─── Comment syntax helpers ────────────────────────────────────────────────────

const EXT_COMMENT: Record<string, { open: string; close?: string }> = {
  // C-style
  ts: { open: '//' },
  tsx: { open: '//' },
  js: { open: '//' },
  jsx: { open: '//' },
  java: { open: '//' },
  c: { open: '//' },
  cpp: { open: '//' },
  cs: { open: '//' },
  go: { open: '//' },
  swift: { open: '//' },
  kt: { open: '//' },
  rs: { open: '//' },
  php: { open: '//' },
  dart: { open: '//' },
  // Hash-style
  py: { open: '#' },
  rb: { open: '#' },
  sh: { open: '#' },
  bash: { open: '#' },
  zsh: { open: '#' },
  yaml: { open: '#' },
  yml: { open: '#' },
  toml: { open: '#' },
  r: { open: '#' },
  // Block-style
  html: { open: '<!--', close: '-->' },
  xml: { open: '<!--', close: '-->' },
  svg: { open: '<!--', close: '-->' },
  css: { open: '/*', close: '*/' },
  scss: { open: '//' },
  sass: { open: '//' },
  less: { open: '//' },
  // Double-dash
  lua: { open: '--' },
  sql: { open: '--' },
  // Lisp-style
  el: { open: ';;' },
  clj: { open: ';;' },
};

function commentForFile(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const syntax = EXT_COMMENT[ext] ?? { open: '//' };
  return syntax.close
    ? `${syntax.open} SPOTME: <description> ${syntax.close}`
    : `${syntax.open} SPOTME: <description>`;
}

// ─── Display messages (returned to user / LLM as tool output) ──────────────

export function statusMessage(state: SpotMeState): string {
  const lines = [
    `SpotMe: ${state.enabled ? '🟢 on' : '⚪ off'}`,
    `Difficulty: ${state.difficulty}`,
    `Trigger every: ${state.every} code write(s)`,
    `Counter: ${state.counter}/${state.every}`,
  ];
  if (state.exercise?.active) {
    lines.push(`Active exercise: ${state.exercise.unit} (${state.exercise.filePath})`);
  }
  return lines.join('\n');
}

export function exerciseReadyMessage(
  unit: string,
  filePath: string,
  difficulty: Difficulty
): string {
  return [
    `🏋️ Exercise ready: **${unit}**`,
    `Difficulty: ${difficulty} — ${difficultyLabel(difficulty)}`,
    `File: \`${filePath}\``,
    ``,
    `Edit the file in your editor. Replace the \`# SPOTME:\` marker with your implementation.`,
    ``,
    `Your options:`,
    `  \`/spotme:hint\`  — get a targeted hint`,
    `  \`/spotme:solve\` — concede and let the agent finish`,
    `  \`/spotme:skip\`  — skip this exercise`,
    `  \`/spotme:done\`  — submit your implementation for review`,
  ].join('\n');
}

export function blockedMessage(toolName: string, filePath: string, difficulty: Difficulty): string {
  const marker = commentForFile(filePath);
  const scaffoldStep =
    toolName === 'edit' && filePath
      ? `Edit \`${filePath}\` to add a \`${marker}\` comment at the location where the implementation should go.`
      : filePath
        ? `Write the scaffold to \`${filePath}\` using the Write tool. Include a \`${marker}\` comment where the implementation should go.`
        : `Write the scaffold file using the Write tool. Include a \`${marker}\` comment (use appropriate comment syntax for the language) where the implementation should go.`;

  return [
    `[SpotMe] Counter reached — time for an exercise!`,
    ``,
    `Follow these steps in order:`,
    `1. ${scaffoldStep}`,
    `2. Call \`spotme_exercise\` with the unit name, the file path, and difficulty "${difficulty}".`,
    `3. Display the full return value of \`spotme_exercise\` verbatim to the user (do not summarize).`,
  ].join('\n');
}

// ─── LLM instruction templates (injected as command templates / user messages) ─

export const PROMPTS = {
  /** /spotme:on — confirm settings after hook already set state. */
  ON: 'SpotMe gym mode was just activated. Call `spotme_status` to get the current settings, then confirm them to the user in one sentence.',

  /** /spotme:off — brief confirmation. */
  OFF: 'Confirm that SpotMe gym mode is now off and you will resume writing code normally.',

  /** /spotme:status — display current state. */
  STATUS: 'Call the `spotme_status` tool and display the result to the user.',

  /** /spotme:hint — one hint, no spoilers. */
  HINT: 'Give one targeted hint for the current SpotMe exercise. Point toward the approach without revealing the implementation. One paragraph max.',

  /** /spotme:rep — on-demand exercise. */
  REP: 'The human wants a coding exercise. Write the scaffold for the next logical unit using the Write tool (use a `# SPOTME: <description>` marker where the human should implement), then call `spotme_exercise` with the unit name, file path, and difficulty.',

  /** OpenCode compatibility: static uppercase aliases for the no-arg versions. */
  get DONE(): string {
    return this.done();
  },
  get SOLVE(): string {
    return this.solve();
  },
  get SKIP(): string {
    return this.skip();
  },

  /**
   * /spotme:done — review user's implementation, then close.
   * If exercise data is provided (Pi), inject it directly.
   * Otherwise (OpenCode), tell the LLM to call spotme_status first.
   */
  done(exercise?: { unit: string; filePath: string }): string {
    if (exercise) {
      return `Current SpotMe exercise: **${exercise.unit}** in \`${exercise.filePath}\`.\n\nRead the exercise file. Evaluate the user's implementation: (1) what they got right — 1-2 sentences, specific; (2) what could be better — concrete, no vague feedback; (3) next steps only if incomplete. Do NOT show your own solution. Resume the original task and complete any remaining code. Call \`spotme_end\` as the LAST thing you do.`;
    }
    return "Call `spotme_status` to get the active exercise details. Read the exercise file. Evaluate the user's implementation: (1) what they got right — 1-2 sentences, specific; (2) what could be better — concrete, no vague feedback; (3) next steps only if incomplete. Do NOT show your own solution. Resume the original task and complete any remaining code. Call `spotme_end` as the LAST thing you do.";
  },

  /**
   * /spotme:solve — concede and let the agent finish.
   * If exercise data is provided (Pi), inject it directly.
   * Otherwise (OpenCode), tell the LLM to call spotme_status first.
   */
  solve(exercise?: { unit: string; filePath: string }): string {
    if (exercise) {
      return `Current SpotMe exercise: **${exercise.unit}** in \`${exercise.filePath}\`.\n\nRead the exercise file. Write the solution (replace the SPOTME marker if still present, or improve what the user wrote). Briefly note the key pattern the user should remember. Resume the original task and complete any remaining code. Call \`spotme_end\` as the LAST thing you do.`;
    }
    return 'Call `spotme_status` to get the active exercise details. Read the exercise file. Write the solution (replace the SPOTME marker if still present, or improve what the user wrote). Briefly note the key pattern the user should remember. Resume the original task and complete any remaining code. Call `spotme_end` as the LAST thing you do.';
  },

  /**
   * /spotme:skip — skip this exercise.
   * If exercise data is provided (Pi), inject it directly.
   * Otherwise (OpenCode), generic skip prompt.
   */
  skip(exercise?: { unit: string; filePath: string }): string {
    if (exercise) {
      return `The human is skipping the SpotMe exercise **${exercise.unit}** in \`${exercise.filePath}\`. Resume the original task and complete the code normally. Call \`spotme_end\` as the LAST thing you do.`;
    }
    return 'The human is skipping this exercise. Resume the original task and complete the code normally. Call `spotme_end` as the LAST thing you do.';
  },
} as const;
