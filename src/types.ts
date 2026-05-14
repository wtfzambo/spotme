// ─── Shared types and constants ─────────────────────────────────────────────

export type Difficulty = 'lite' | 'medium' | 'hard';

export interface ExerciseState {
  active: boolean;
  unit: string;
  filePath: string;
  difficulty: Difficulty;
}

export interface SpotMeState {
  enabled: boolean;
  difficulty: Difficulty;
  every: number;
  counter: number;
  exercise: ExerciseState | null;
}

/** Tool names that count toward the exercise trigger. */
export const CODE_WRITE_TOOLS = new Set(['write', 'edit', 'patch', 'create']);

/** File extensions that count as code. Everything else is ignored. */
export const CODE_EXTENSIONS = new Set([
  // JavaScript / TypeScript
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  // Python
  'py',
  'pyi',
  // Go
  'go',
  // Rust
  'rs',
  // Java / Kotlin / JVM
  'java',
  'kt',
  'kts',
  'scala',
  'groovy',
  // C family
  'c',
  'h',
  'cpp',
  'hpp',
  'cc',
  'cxx',
  'cs',
  // Web
  'html',
  'htm',
  'css',
  'scss',
  'sass',
  'less',
  'vue',
  'svelte',
  'astro',
  // Shell / system
  'sh',
  'bash',
  'zsh',
  'fish',
  'ps1',
  'bat',
  'cmd',
  'awk',
  'sed',
  // Functional
  'hs',
  'elm',
  'clj',
  'cljs',
  'erl',
  'ex',
  'exs',
  'ml',
  'fs',
  'fsx',
  // Other languages
  'php',
  'rb',
  'swift',
  'dart',
  'lua',
  'r',
  'pl',
  't',
  'pas',
  'nim',
  'zig',
  'v',
  'cr',
  // Data / Query
  'sql',
]);

export function parseArgs(
  args: string,
  current: Pick<SpotMeState, 'difficulty' | 'every'>
): { difficulty: Difficulty; every: number } {
  let difficulty = current.difficulty;
  let every = current.every;
  const parts = args.trim().split(/\s+/);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'lite' || parts[i] === 'medium' || parts[i] === 'hard') {
      difficulty = parts[i] as Difficulty;
    }
    if (parts[i] === '--every' && parts[i + 1]) {
      const n = parseInt(parts[i + 1], 10);
      if (!isNaN(n) && n >= 1) every = n;
      i++;
    }
  }
  return { difficulty, every };
}
