# Portrait visual / touch regression

Client test date: **2026-10-19 (Asia/Shanghai)**. Formal baseline: `7ad321568909e997f1f16eea646e995c73a9119e`. Main is not updated by this preview task.

Start the static server from this worktree:

```powershell
$env:PORT='4202'
node scripts/serve.mjs
```

Open `/tests/mobile-portrait/review.html` for the 330 full screenshots, component overlays, five contact sheets, native card video and live responsive iframe. Only the QA review uses an iframe; the actual homepage remains the root page.

Tests require local Node + Playwright; `helpers.cjs` records the actual Windows Chromium executable. In this session Playwright resolves through the bundled runtime's `NODE_PATH`. No framework/build dependency is added to production.

```powershell
node tests/mobile-portrait/static.cjs
$env:MOBILE_LABEL='before' # serves accepted baseline files from Git, not current source
node tests/mobile-portrait/audit.cjs
$env:MOBILE_LABEL='after'
node tests/mobile-portrait/audit.cjs
node tests/mobile-portrait/geometry.cjs
node tests/mobile-portrait/touch.cjs
node tests/mobile-portrait/desktop.cjs
node tests/mobile-portrait/performance.cjs
node tests/mobile-portrait/video.cjs
python tests/mobile-portrait/make-report.py
```

`MOBILE_SCENES` optionally regenerates selected named frames and merges them into the existing report; `MOBILE_QUICK` is only for local investigation. The final reports contain all five view sizes, both DPRs, and 165 frames per revision. The viewport list plus source timeline map define sampling; the quantization frame targets actual legacy time 5.42, not a guessed root scroll.

Instrumentation is confined to HTTP test responses: expose the existing `NF_DEBUG` API without enabling developer UI, record actual Canvas text/RT rectangles/cube vertices, and reset the virtual debug clock when touch tests resume live time. No geometry or animation code is replaced by fixtures. Pure baseline responses use Git blobs. The recorded native card-switch video has neither debug params nor response interception.

Geometry compares painted DOM unions, actual text metrics, Local matrix/workflow, network cube vertices and final card rectangles. Infinite planes, background lines and incoming particle flows intentionally extend beyond the viewport; these are not classified as clipped content. Component AABB overlap totals contain repeated sizes/DPRs and padding, not a count of unique product bugs. Screenshots remain the visual authority.

Also executed existing suites into isolated subdirectories:

- `tests/release-v010/check.cjs` → `full/`, via `NF_RELEASE_BASE` / `NF_RELEASE_OUT`.
- `tests/lens/check.cjs` → `lens/`, via `UI_BASE` / `UI_OUT`.
- `tests/home-global/fallback.cjs` / `opus-regression.cjs` → `fallback/` / `opus/`, via `NF_TEST_BASE` / `NF_TEST_OUT`.
- `tests/static-check.cjs` / `tests/home-global/static.cjs` now delegate immutable boundaries to this portrait guard; original fixture reports remain archived.

Some older runners retain their historical fixture `date` string. This run's actual client date, baseline, scope and report inventory are in `run-metadata.json`; results/assertions are not rewritten to manufacture a pass.

Limits: desktop NVIDIA hardware + mobile/touch/viewport emulation. Safari/WebKit/Firefox and real Android/iPhone are not available. Insets, short detail body, and visualViewport-only changes are explicitly controlled pressure cases. Rotation verifies recovery, not a new landscape design. Performance reports are rAF/CPU/counters, not phone FPS or GPU timer-query evidence.
