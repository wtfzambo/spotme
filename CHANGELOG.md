# Changelog

## [1.2.3](https://github.com/wtfzambo/spotme/compare/v1.2.2...v1.2.3) (2026-05-26)


### Bug Fixes

* add root index.ts re-export for clean Pi extension display name ([611fdfe](https://github.com/wtfzambo/spotme/commit/611fdfee754dcc44a19abf9eb4b5cc0c989aa7e9))
* revert Pi extension back to src/pi.ts ([403afb7](https://github.com/wtfzambo/spotme/commit/403afb7029f0d8220caa88eb87f912fd07bc5d6e))

## [1.2.2](https://github.com/wtfzambo/spotme/compare/v1.2.1...v1.2.2) (2026-05-26)


### Bug Fixes

* move Pi adapter to src/pi/index.ts for clean display name ([62f7d00](https://github.com/wtfzambo/spotme/commit/62f7d006632bf21cca1dc8eff6e64256bf8eeff1))

## [1.2.1](https://github.com/wtfzambo/spotme/compare/v1.2.0...v1.2.1) (2026-05-26)


### Bug Fixes

* change Pi image ([b8a1fe3](https://github.com/wtfzambo/spotme/commit/b8a1fe3d410ff72348dc20944a75b5797030b983))

## [1.2.0](https://github.com/wtfzambo/spotme/compare/v1.1.0...v1.2.0) (2026-05-26)


### Features

* **pi:** test and customize SpotMe for Pi ([55e8415](https://github.com/wtfzambo/spotme/commit/55e84151064ed73d0bb1ac3f1cb25c06bf9fc550))


### Bug Fixes

* **pi:** remove premature endExercise in done/solve/skip commands\n\nThe LLM calls spotme_end as the final step; doing it in the\nhandler wipes exercise state before the LLM can review/solve.\n\nAlso adds docs/flow.md — Mermaid state machine + platform comparison table. ([b57ec3f](https://github.com/wtfzambo/spotme/commit/b57ec3f001b0e72b8da266fe8b4d76db4217aee8))

## [1.1.0](https://github.com/wtfzambo/spotme/compare/v1.0.1...v1.1.0) (2026-05-15)


### Features

* allowlist code file extensions for exercise trigger\n\nCounter only increments for known code extensions.\nEverything else (.md, .json, .yaml, .lock, .env, etc.) is ignored.\n\nKey change: extension-based allowlist instead of blacklist.\nNew set: CODE_EXTENSIONS in types.ts (42 extensions covering\nJS/TS, Python, Go, Rust, Java, C-family, web, shell, functional,\nand other common languages). ([f028629](https://github.com/wtfzambo/spotme/commit/f02862970e2f1437c03e0406813e6c7fe92a0930))

## [1.0.1](https://github.com/wtfzambo/spotme/compare/v1.0.0...v1.0.1) (2026-05-13)

### Bug Fixes

* normalize repository.url and use Node 24 for npm OIDC ([bfff601](https://github.com/wtfzambo/spotme/commit/bfff601355c8fcb0b396732fdab7ef784f27a202))
* remove invalid cache param from setup-node ([be8ac22](https://github.com/wtfzambo/spotme/commit/be8ac228abde3ba91a259a437a26654d6e0eb6e8))
* use npm OIDC trusted publishing (no token needed) ([944a68a](https://github.com/wtfzambo/spotme/commit/944a68a07f95e358a10cad8330adb7224f6ae380))

## [1.0.0](https://github.com/wtfzambo/spotme/compare/v0.1.0...v1.0.0) (2026-05-13)

### ⚠ BREAKING CHANGES

* SKILL.md tool/command names changed from spotter_*to spotme_*

### Features

* add SpotMeTuiPlugin with DialogSelect for exercise widget and toasts ([5ecdc4d](https://github.com/wtfzambo/spotme/commit/5ecdc4d67e6052d1a97b6279605e786007d3f6bd))
* prepare 1.0 release ([6871678](https://github.com/wtfzambo/spotme/commit/6871678111ec77df43fdaf4e8f4854e3008e8b65))
* rename to spotme, fix core plugin issues, add new tasks ([f047f71](https://github.com/wtfzambo/spotme/commit/f047f716683872d1a233b06488980761f2edc46b))
* **spo-12:** bypass LLM for spotme:on/off/status via command.execute.before ([ee63532](https://github.com/wtfzambo/spotme/commit/ee63532acf0e13d362b4a4d144314b5219b0450b))
* **spo-12:** finalize command.execute.before with toasts + original templates ([cc04bd5](https://github.com/wtfzambo/spotme/commit/cc04bd5f7a61b5506353e1f7edf197f8af5e8efd))
* **SPO-13/15:** replace BLOCKED_REASON with blockedMessage() for richer scaffold instructions ([d9ec7f6](https://github.com/wtfzambo/spotme/commit/d9ec7f60e7900bd2ae8d52a0543c6538d5fb682d))

### Bug Fixes

* add main field and default export for plugin discovery ([e69d27d](https://github.com/wtfzambo/spotme/commit/e69d27dfc3bf1abb57c8c1a1f330c5dff20a3a78))
* normalise absolute filePath in spotme_exercise ([55fc68a](https://github.com/wtfzambo/spotme/commit/55fc68ab1e55599e0a46d4a42782c47a1c29c9ff))
* remove graceWritesRemaining — counter resets to 0 at spotme_end ([03374ed](https://github.com/wtfzambo/spotme/commit/03374eda6ff90baa80ec0cdb504e335638070172))
* reorder done/solve/skip prompts — call spotme_end LAST ([85870a4](https://github.com/wtfzambo/spotme/commit/85870a4696ab23344a6241c2954fb0427cd7b488))
* replace session.idle grace with write-count countdown; remove git init ([fe61016](https://github.com/wtfzambo/spotme/commit/fe61016d2e48122f11495c578d07757d04ca8b1e))
* restore NODE_AUTH_TOKEN for npm publish ([3b64432](https://github.com/wtfzambo/spotme/commit/3b64432b66f12b03f66517f7f175360744995101))
* **spo-12:** restore minimal templates + clean up debug code ([b0c8368](https://github.com/wtfzambo/spotme/commit/b0c8368374cfb872c183503f8ced9cf2861e6d69))
* **SPO-14:** revert exercise branch after done/solve/skip ([99488be](https://github.com/wtfzambo/spotme/commit/99488bec9c4cb6919af479af846c42b3efd24d03))
* **SPO-20:** bypass write counter for LLM resume writes after solve/skip ([ef3ee25](https://github.com/wtfzambo/spotme/commit/ef3ee2595e245501148fdbbe7179d01d6e893e8b))
* spotme:on template reads state instead of re-parsing args ([387c1a0](https://github.com/wtfzambo/spotme/commit/387c1a0b6ba9e287117cfdf4ec7ca1aa3c2ab86f))
* spotme:solve template — write solution BEFORE calling spotme_end ([297b1ee](https://github.com/wtfzambo/spotme/commit/297b1eee5371385db027c6d469f2dd7bffd159d2))

### Performance Improvements

* remove pi.js from npm build to reduce package size ([8b843a6](https://github.com/wtfzambo/spotme/commit/8b843a67af8758b765374ad4316bd272921fd2fa))

### Reverts

* remove unnecessary setup-node step from publish workflow ([28ddc15](https://github.com/wtfzambo/spotme/commit/28ddc15f6b248aed8d9ad6b6370d5d9ec4a09be9))
* **spo-16:** restore original exerciseReadyMessage with command list ([578cbb8](https://github.com/wtfzambo/spotme/commit/578cbb8688f26a7232bdb6f849fac297a4474fac))
