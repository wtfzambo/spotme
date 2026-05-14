// ─── Pi adapter ─────────────────────────────────────────────────────────────
// Thin wiring layer: connects SpotMeEngine to Pi's extension API.

import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { isToolCallEventType } from '@earendil-works/pi-coding-agent';
import { Type } from '@sinclair/typebox';
import { access } from 'fs/promises';
import { join } from 'path';
import { SpotMeEngine } from './engine.js';
import { PROMPTS } from './prompts.js';
import type { Difficulty } from './types.js';
import { CODE_WRITE_TOOLS } from './types.js';

export default function (pi: ExtensionAPI) {
  // Engine is instantiated lazily per-command since Pi doesn't provide cwd at init.
  // We create it once and use ctx.cwd at tool-execution time.
  let engineCwd: string | null = null;

  const engine = new SpotMeEngine({
    resolvePath(rawPath) {
      const cwd = engineCwd ?? process.cwd();
      const fullPath = rawPath.startsWith('/') ? rawPath : join(cwd, rawPath);
      const relativePath = fullPath.startsWith(cwd + '/')
        ? fullPath.slice(cwd.length + 1)
        : rawPath;
      return { fullPath, relativePath };
    },
    async fileExists(fullPath) {
      try {
        await access(fullPath);
        return true;
      } catch {
        return false;
      }
    },
  });

  // ─── Tool: spotme_exercise ─────────────────────────────────────────────

  pi.registerTool({
    name: 'spotme_exercise',
    label: 'SpotMe Exercise',
    description:
      'Record the start of a SpotMe coding exercise. Call this AFTER writing the scaffold with the Write tool.',
    parameters: Type.Object({
      unit: Type.String({ description: 'Name of the unit being exercised' }),
      filePath: Type.String({ description: 'Path to the scaffold file (already written to disk)' }),
      difficulty: Type.Union([Type.Literal('lite'), Type.Literal('medium'), Type.Literal('hard')], {
        description: 'Difficulty — must match the active session setting',
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      engineCwd = ctx.cwd ?? process.cwd();
      const result = await engine.recordExercise(
        params.unit,
        params.filePath,
        params.difficulty as Difficulty
      );
      return { content: [{ type: 'text' as const, text: result.message }], details: {} };
    },
  });

  // ─── Commands ─────────────────────────────────────────────────────────────

  pi.registerCommand('spotme:on', {
    description: 'Enable SpotMe gym mode [lite|medium|hard] [--every N]',
    handler: async (args) => {
      engine.activateFromArgs(args ?? '');
      pi.sendUserMessage(PROMPTS.ON);
    },
  });

  pi.registerCommand('spotme:off', {
    description: 'Disable SpotMe gym mode',
    handler: async () => {
      engine.deactivate();
      pi.sendUserMessage(PROMPTS.OFF);
    },
  });

  pi.registerCommand('spotme:status', {
    description: 'Show current SpotMe status',
    handler: async (_args, ctx) => {
      ctx.ui.notify(engine.getStatus(), 'info');
    },
  });

  pi.registerCommand('spotme:done', {
    description: 'Submit your implementation for review',
    handler: async () => {
      pi.sendUserMessage(PROMPTS.DONE);
    },
  });

  pi.registerCommand('spotme:hint', {
    description: 'Get a targeted hint for the current exercise',
    handler: async () => {
      pi.sendUserMessage(PROMPTS.HINT);
    },
  });

  pi.registerCommand('spotme:solve', {
    description: 'Concede — let the agent complete the exercise',
    handler: async () => {
      pi.sendUserMessage(PROMPTS.SOLVE);
    },
  });

  pi.registerCommand('spotme:skip', {
    description: 'Skip this exercise with no penalty',
    handler: async () => {
      pi.sendUserMessage(PROMPTS.SKIP);
    },
  });

  pi.registerCommand('spotme:rep', {
    description: 'Request an on-demand SpotMe exercise',
    handler: async () => {
      pi.sendUserMessage(PROMPTS.REP);
    },
  });

  // ─── Hook: intercept code-writing tool calls ──────────────────────────

  pi.on('tool_call', async (event) => {
    if (!CODE_WRITE_TOOLS.has(event.toolName)) return;

    const filePath =
      isToolCallEventType('write', event) || isToolCallEventType('edit', event)
        ? event.input.path
        : '';

    const result = engine.interceptWriteToolCall(event.toolName, filePath);
    if (result.blocked) {
      return { block: true, reason: result.message };
    }
  });
}
