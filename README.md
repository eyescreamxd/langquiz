# Armenian Alphabet Trainer

Free web app for Russian-speaking learners of the Armenian alphabet. Two modes:

- **Узнавание букв** — type the transliteration of a shown letter
- **Прописи** — draw the letter on a canvas; recognition validates the shape

Pure vanilla JS/HTML/CSS, no build step. Hosted on Cloudflare Pages.

## Local development

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

ES modules require serving over HTTP — opening `index.html` directly via `file://` will not work.

## Project structure

See `docs/superpowers/specs/2026-05-12-armenian-quiz-design.md` for the full design and `docs/superpowers/plans/2026-05-12-armenian-quiz-implementation.md` for the implementation plan.

```
index.html           # SPA shell
styles/              # base / layout / components / screens CSS
js/
  app.js             # entry, screen router
  data.js            # Armenian alphabet (Latin transliteration)
  storage.js         # localStorage wrapper
  letterSets.js      # set selection logic
  screens/           # welcome / setup / quiz / writing / summary
  writing/           # canvas / reference / recognizer
  ui/                # progress dots component
fonts/               # bundled Noto Sans Armenian Bold
tests/
  calibrate.html     # recognizer threshold calibration tool
docs/
  manual-test.md     # QA checklist
  superpowers/       # design + plan documents
```

## Manual testing

Before merging to `main`, walk through `docs/manual-test.md`.

## Recognizer calibration

`tests/calibrate.html` lets you draw against any letter and inspect coverage/precision/IoU metrics. Use it to tune thresholds in `js/writing/recognizer.js`.

## Deployment

Cloudflare Pages is connected to this repo. Push to `main` triggers an automatic deploy. No build step.

## License

Code: MIT.
Font (Noto Sans Armenian): SIL Open Font License — see `fonts/`.
