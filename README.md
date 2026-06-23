# Envelope — estimation practice for interviews

A small web app for practicing **Fermi / market-sizing questions** — the
"how many tennis balls fit in a plane?" staple of consulting, product, and
marketing interviews. The goal isn't the exact number; it's training the
thinking: decompose a fuzzy quantity into factors, make assumptions out loud,
and land on the right **order of magnitude**.

## How it works

1. **Pick a question** — random or from the library.
2. **Fill in your own assumption** for each multiply/divide factor. Your
   estimate updates live as you type.
3. **Reveal the expert breakdown** — your guess and the expert's are plotted
   on a logarithmic ruler (10⁰ → 10¹²), and you're scored on how close you got
   *in order of magnitude*.
4. **Go deeper** — each question lists the follow-ups an interviewer would
   ask and the reasoning concepts you just practiced.
5. **Track yourself** — completed questions, self-ratings, and the categories
   worth revisiting are saved locally and shown on the Progress page.

## Run it locally

It's plain HTML/CSS/JS — no build step. Either open `index.html` directly, or
serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy (free, via GitHub Pages)

In the repo settings → **Pages** → set the source to this branch's root.
GitHub serves `index.html` and you get a public URL you can open on any device.

## Adding your own questions

Everything lives in `assets/questions.js`. Each question is one object with an
ordered list of `steps` (the factors). Each step has an `op` of `"x"` or `"/"`,
an expert `value`, a learner-facing `hint`, and the `rationale` shown on reveal.
The app computes both your estimate and the expert's by walking those factors,
so a new question is just a new object in the array.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell, fonts, nav |
| `assets/styles.css` | Visual system (cool slate ground, vermilion accent, log-ruler) |
| `assets/app.js` | Router, guided worksheet, scoring, progress store |
| `assets/questions.js` | The question bank |
