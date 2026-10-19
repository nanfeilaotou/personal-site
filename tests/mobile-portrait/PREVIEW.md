# Preview status

Feature branch: `feat/mobile-portrait`, based on accepted main `7ad3215`.

Local root: http://127.0.0.1:4202/

Local visual review: http://127.0.0.1:4202/tests/mobile-portrait/review.html

## Public preview — verified 2026-10-19

- [Feature homepage](https://feat-mobile-portrait.personal-site-7xv.pages.dev/)
- [Screenshots / boundaries / live review](https://feat-mobile-portrait.personal-site-7xv.pages.dev/tests/mobile-portrait/review.html)
- [Native touch card video](https://feat-mobile-portrait.personal-site-7xv.pages.dev/tests/mobile-portrait/video/card-switching.webm)
- [Source / implementation report](https://github.com/nanfeilaotou/personal-site/blob/feat/mobile-portrait/docs/MOBILE-PORTRAIT.md)

Application commit: `3cbc294` (dedicated portrait layouts and the necessary reentry cache fix). Local evidence commit: `6dff52f1084736296389191deee0dc4d7004925e`. Later preview-verification commits only add test/doc material.

Cloudflare feature deployment succeeded: [snapshot](https://568b88ef.personal-site-7xv.pages.dev/), build `568b88ef-a014-4120-ba99-c322384eacae`. [Successful check](cloudflare-preview.json).

[Deployment verification](deployment-results.json) checked modified runtime source hashes after normalizing line endings, plus review assets / JSON / contact sheet / WebM over HTTPS. Production `/` returned bytes identical to the accepted main `7ad3215` root — this was a feature preview, not a production release.

[Online touch regression](preview-browser/touch-results.json) completed with zero Console errors and zero failed resources. All five portrait sizes exercised 21 AI entries, the four Global stops, native card selection, quick retargeting, scrolling interruption, menus and guides. The extended cases checked fixed detail-close access, controlled 47/34 safe insets, native rapid taps, actual WebGL loss/recovery, rotation/resize, listener stability, visualViewport-only changes, reduced motion and genuine no-WebGL fallback.

Manual review priorities: 320px Agent density and Local workflow; large-phone whitespace; Global number/network/accounts composition; three real cards and repeated changes; Personal readability/line response. The page nav must remain Home throughout. Physical iPhone/Android and full landscape art are not claimed tested.

**Release authorized 2026-10-19:** user approved the preview and requested main / production publication for physical-phone testing. The unchanged-production result above is historical preview evidence; see [RELEASE.md](RELEASE.md) for publication status.
