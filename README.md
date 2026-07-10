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
3. **Commit to a 90% confidence range** — a low and high bound you're 90% sure
   the answer falls between. Point estimates test your math; ranges test whether
   you actually know how sure you are.
4. **Reveal the expert breakdown** — your guess and range are plotted on a
   logarithmic ruler (10⁰ → 10¹²). You're scored two ways: how close your point
   estimate is *in order of magnitude*, and whether the truth landed inside your
   range.
5. **Go deeper** — each question lists the follow-ups an interviewer would
   ask and the reasoning concepts you just practiced.
6. **Track yourself** — the Progress page shows completed questions, self-ratings,
   and two calibration signals built over time: your **hit rate** (are you
   right ~90% of the time, or quietly overconfident?) and your **directional
   bias** (do your estimates systematically run high or low?).

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
