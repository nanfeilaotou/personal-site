# V0.1.1 browser evidence

Run from repository root with Node + Playwright and the Chromium executable specified in `helpers.cjs`. The checked-in paths describe the actual Windows test host; adapt them for another host. Set `$env:PORT='4201'`, then start `node scripts/serve.mjs` (or set `UI_BASE` to your server). No test runtime is required by the static production site.

```powershell
$env:UI_BASE='http://127.0.0.1:4201'
node tests/ui-v011/static.cjs
node tests/ui-v011/regression.cjs
node tests/ui-v011/rail.cjs
node tests/ui-v011/return.cjs
$env:UI_LABEL='after'
node tests/ui-v011/seam.cjs
python tests/ui-v011/make-contacts.py
```

`UI_OUT` isolates outputs (for example `tests/ui-v011/online-rail`). Before seam captures were taken on untouched 7b7e53b before implementation; rerunning `seam.cjs` on current code does not recreate the original baseline. `regression.cjs` supplies baseline files from Git responses and compares protected layers at the same time / resolution. It disables CSS transitions only for stable-frame screenshots. Interactions run with normal transitions in the other scripts.

Existing suites also passed:

- `tests/static-check.cjs`, `tests/home-global/static.cjs` protect code/data/artwork boundaries.
- `tests/release-v010/check.cjs` with `NF_RELEASE_BASE` / `NF_RELEASE_OUT`: current real-root full interaction checks, outputs in `legacy-functional/`.
- `tests/home-global/fallback.cjs` with `NF_TEST_BASE` / `NF_TEST_OUT`: DPR2, mouse recovery, reduced motion, actual no-WebGL and slow texture states, outputs in `legacy-fallback/`.
- `tests/home-global/opus-regression.cjs` with the same variables: Opus baseline, standalone and integrated rendering, outputs in `opus-check/`.

Open [review.html](review.html) over HTTP. JSON files retain assertions, real timing samples and the actual NVIDIA renderer. Timing figures are CPU submission / rAF measurements, not GPU timer-query results. Mobile tests use viewport/touch emulation, not a physical device. Source artwork, original V0.1.0 evidence and experimental nav branch are not replaced.

[Production verification](production.md) includes real-root online results. To rerun without replacing local evidence, set `UI_BASE` to production and `UI_OUT` to a fresh directory for `rail.cjs` / `return.cjs`; use `NF_RELEASE_BASE` / `NF_RELEASE_OUT` for the full root suite. `deployment.cjs` compares deployed bytes with current HEAD; `DEPLOY_OUT` optionally stores its report outside this archive.
