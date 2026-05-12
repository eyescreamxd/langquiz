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


## Recognizer calibration

`tests/calibrate.html` lets you draw against any letter and inspect coverage/precision/IoU metrics. Use it to tune thresholds in `js/writing/recognizer.js`.

## Deployment

Cloudflare Pages is connected to this repo. Push to `main` triggers an automatic deploy. No build step.

## License

Code: MIT.
Font (Noto Sans Armenian): SIL Open Font License — see `fonts/`.
