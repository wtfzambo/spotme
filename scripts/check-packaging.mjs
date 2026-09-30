import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'spotme-packaging-'));
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: 'utf8' });

try {
  const manifest = readJson(join(root, 'package.json'));
  const npmLock = readJson(join(root, 'package-lock.json'));
  for (const field of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
  ]) {
    assert.deepEqual(npmLock.packages[''][field], manifest[field], `npm lockfile: ${field}`);
  }
  for (const name of ['@earendil-works/pi-coding-agent', '@sinclair/typebox']) {
    assert.equal(manifest.dependencies[name], undefined);
    assert.equal(manifest.peerDependencies[name], '*');
    assert.equal(manifest.peerDependenciesMeta[name].optional, true);
    assert.ok(manifest.devDependencies[name]);
  }

  // Test the actual npm artifact, not a symlink into the development dependency tree.
  const [packed] = JSON.parse(
    run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', scratch], root)
  );
  for (const path of ['src/pi.ts', 'dist/index.js', 'dist/opencode.js']) {
    assert.ok(
      packed.files.some((file) => file.path === path),
      `Missing packaged entrypoint: ${path}`
    );
  }
  writeFileSync(
    join(scratch, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: { spotme: `file:${join(scratch, packed.filename)}` },
    })
  );
  run('bun', ['install', '--production', '--ignore-scripts'], scratch);
  const packageRoot = join(scratch, 'node_modules/spotme');
  assert.deepEqual(readJson(join(packageRoot, 'package.json')), manifest);
  for (const name of ['@earendil-works/pi-coding-agent', '@sinclair/typebox', 'typebox']) {
    assert.equal(
      existsSync(join(scratch, 'node_modules', name)),
      false,
      `Unexpected host dependency: ${name}`
    );
    assert.equal(existsSync(join(packageRoot, 'node_modules', name)), false);
  }

  // OpenCode uses its own tool.schema (Zod); neither Pi nor TypeBox is available here.
  run(
    'bun',
    [
      '--eval',
      `
    import assert from 'node:assert/strict';
    const root = await import('spotme');
    const subpath = await import('spotme/opencode');
    assert.equal(root.default, root.SpotMePlugin);
    const expected = ['spotme_end', 'spotme_exercise', 'spotme_on', 'spotme_status'];
    for (const entry of [root.default, subpath.SpotMePlugin]) {
      const hooks = await entry({ directory: process.cwd(), client: {} });
      assert.deepEqual(Object.keys(hooks.tool).sort(), expected);
      assert.equal(typeof hooks.tool.spotme_exercise.args.filePath.parse('scaffold.ts'), 'string');
      assert.match(await hooks.tool.spotme_on.execute({ difficulty: 'lite', every: 3 }), /SpotMe is on/);
      assert.match(await hooks.tool.spotme_status.execute({}), /lite/);
      assert.match(await hooks.tool.spotme_end.execute({}), /Exercise closed/);
      const config = {};
      await hooks.config(config);
      assert.equal(Object.keys(config.command).length, 8);
    }
  `,
    ],
    scratch
  );
  console.log('OpenCode: both packaged entrypoints register tools and run without Pi/TypeBox.');

  // PI_SDK_PATH selects another host installation without changing our dev dependency.
  const sdkUrl = process.env.PI_SDK_PATH
    ? pathToFileURL(join(resolve(process.env.PI_SDK_PATH), 'dist/index.js')).href
    : import.meta.resolve('@earendil-works/pi-coding-agent');
  const sdkRoot = resolve(dirname(fileURLToPath(sdkUrl)), '..');
  const sdkVersion = readJson(join(sdkRoot, 'package.json')).version;
  const { DefaultResourceLoader, SettingsManager } = await import(sdkUrl);
  const loader = new DefaultResourceLoader({
    cwd: scratch,
    agentDir: join(scratch, 'pi-agent'),
    settingsManager: SettingsManager.inMemory({ packages: [packageRoot] }),
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
  });
  await loader.reload();
  const result = loader.getExtensions();
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings ?? [], []);
  assert.equal(result.extensions.length, 1);
  const extension = result.extensions[0];
  assert.deepEqual([...extension.tools.keys()].sort(), [
    'spotme_end',
    'spotme_exercise',
    'spotme_status',
  ]);
  assert.equal(extension.commands.size, 8);
  const status = await extension.tools.get('spotme_status').definition.execute();
  assert.equal(status.content[0].type, 'text');
  const end = await extension.tools.get('spotme_end').definition.execute();
  assert.match(end.content[0].text, /Exercise closed/);

  // Negative control: on hosts exposing package warnings, prove that package metadata
  // is checked. Loading src/pi.ts directly would miss the original packaging warning.
  if (result.warnings !== undefined) {
    const manifestPath = join(packageRoot, 'package.json');
    const original = readFileSync(manifestPath, 'utf8');
    try {
      writeFileSync(
        manifestPath,
        JSON.stringify({
          ...manifest,
          dependencies: { ...manifest.dependencies, '@sinclair/typebox': '^0.34.0' },
        })
      );
      await loader.reload();
      assert.ok(
        loader
          .getExtensions()
          .warnings.some(
            ({ warning }) =>
              warning.includes('Host-provided extension packages') &&
              warning.includes('@sinclair/typebox')
          ),
        'Pi must detect the original manifest regression'
      );
    } finally {
      writeFileSync(manifestPath, original);
    }
    await loader.reload();
    assert.deepEqual(loader.getExtensions().errors, []);
    assert.deepEqual(loader.getExtensions().warnings, []);
  }
  console.log(
    `Pi ${sdkVersion}: packaged extension registers three tools and eight commands, with zero errors/warnings.`
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
