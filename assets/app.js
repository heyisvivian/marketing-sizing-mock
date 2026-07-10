/* Envelope — app logic: hash router, guided worksheet, progress store. */
(function () {
  "use strict";

  var STORE_KEY = "envelope:progress:v1";
  var RULER_MAX = 12; // log10 axis runs 10^0 .. 10^12
  var app = document.getElementById("app");

  /* ---------- progress store ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(p) { try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {} }
  function record(id, patch) {
    var p = load();
    p[id] = Object.assign({}, p[id], patch, { ts: Date.now() });
    save(p);
    return p[id];
  }

  /* ---------- helpers ---------- */
  function byId(id) { for (var i = 0; i < QUESTIONS.length; i++) if (QUESTIONS[i].id === id) return QUESTIONS[i]; return null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function stars(n) { return "★★★".slice(0, n) + "☆☆☆".slice(0, 3 - n); }

  // Compute the running estimate from a question's expert factors or user inputs.
  function computeFrom(steps, values) {
    var out = 1, ok = false;
    for (var i = 0; i < steps.length; i++) {
      var v = values[i];
      if (v === undefined || v === null || isNaN(v)) continue;
      ok = true;
      out = steps[i].op === "/" ? out / v : out * v;
    }
    return ok ? out : null;
  }

  // Human-readable number: "3.2 million", "$1.3B", "72,000".
  function human(n) {
    if (n === null || isNaN(n) || !isFinite(n)) return "—";
    var abs = Math.abs(n);
    var units = [
      [1e12, " trillion"], [1e9, " billion"], [1e6, " million"], [1e3, " thousand"],
    ];
    for (var i = 0; i < units.length; i++) {
      if (abs >= units[i][0]) {
        var x = n / units[i][0];
        return (x >= 100 ? Math.round(x) : +x.toFixed(1)) + units[i][1];
      }
    }
    if (abs >= 1) return (Number.isInteger(n) ? n.toLocaleString("en-US") : +n.toFixed(2)).toString();
    return (+n.toPrecision(2)).toString();
  }

  function pos(value) { // % position on the log ruler
    if (!value || value <= 0) return 0;
    var l = Math.log10(value);
    return Math.max(0, Math.min(100, (l / RULER_MAX) * 100));
  }

  /* ---------- shared: the magnitude ruler ---------- */
  function rulerHTML(caption, you, expert, range) {
    var ticks = [
      [0, "1", "10⁰"], [3, "thousand", "10³"], [6, "million", "10⁶"],
      [9, "billion", "10⁹"], [12, "trillion", "10¹²"],
    ].map(function (t) {
      var left = (t[0] / RULER_MAX) * 100;
      return '<div class="tick" style="left:' + left + '%"><b>' + t[2] + "</b><span>" + t[1] + "</span></div>";
    }).join("");

    var band = "";
    if (range && range.low > 0 && range.high > 0) {
      var a = pos(range.low), b = pos(range.high);
      band = '<div class="ruler-band" style="left:' + Math.min(a, b) + "%;width:" + Math.abs(b - a) + '%"></div>';
    }

    var markers = "";
    if (you != null) markers += '<div class="marker you" style="left:' + pos(you) + '%"><div class="tag">you · ' + esc(human(you)) + '</div><div class="dot"></div></div>';
    if (expert != null) markers += '<div class="marker exp" style="left:' + pos(expert) + '%"><div class="dot"></div><div class="tag">expert · ' + esc(human(expert)) + '</div></div>';

    return (
      '<div class="ruler">' +
      '<div class="ruler-caption">' + esc(caption) + "</div>" +
      '<div class="ruler-track">' + band + ticks + markers + "</div>" +
      "</div>"
    );
  }

  /* ---------- views ---------- */
  function viewHome() {
    var p = load();
    var done = Object.keys(p).filter(function (k) { return p[k].status === "done"; }).length;

    var howSteps = [
      ["01", "Read the question", "No formula given — just a deliberately fuzzy real-world quantity."],
      ["02", "Break it into factors", "Fill in your own assumption for each multiply/divide step."],
      ["03", "Commit to a range", "Give a point estimate and a 90% confidence band — how sure are you, really?"],
      ["04", "Check yourself", "Plot your guess and range against the expert's on the log ruler. Over time, see if you're calibrated — or quietly overconfident."],
    ].map(function (s) {
      return '<div class="step-card"><div class="n">' + s[0] + '</div><h3>' + esc(s[1]) + "</h3><p>" + esc(s[2]) + "</p></div>";
    }).join("");

    app.innerHTML =
      '<section class="hero">' +
      '<p class="eyebrow">Fermi estimation trainer</p>' +
      "<h1>You won't get the exact number. Get the <em>order of magnitude</em> right.</h1>" +
      '<p class="lede">That\'s the real skill behind "how many tennis balls fit in a plane?" — the staple of consulting, product, and marketing interviews. Decompose, assume out loud, and check yourself against the scale that actually matters.</p>' +
      rulerHTML("Every answer lives somewhere on this scale. Your job is the right band, not the right digit.", 3.2e6, 4250) +
      '<div class="btn-row">' +
      '<button class="btn primary" data-go="random">Start a random question</button>' +
      '<button class="btn ghost" data-go="library">Browse the library</button>' +
      "</div>" +
      "</section>" +
      '<div class="section-head"><h2>How a session works</h2><span class="muted" style="font-family:var(--font-mono);font-size:12px">' + done + " / " + QUESTIONS.length + " done</span></div>" +
      '<div class="steps-grid">' + howSteps + "</div>";
  }

  function viewLibrary() {
    var p = load();
    var cats = ["All"].concat(QUESTIONS.map(function (q) { return q.category; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    var active = viewLibrary._cat || "All";

    var chips = cats.map(function (c) {
      return '<button class="chip' + (c === active ? " active" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");

    var rows = QUESTIONS.filter(function (q) { return active === "All" || q.category === active; }).map(function (q) {
      var d = p[q.id] && p[q.id].status === "done";
      return (
        '<button class="qcard" data-q="' + q.id + '">' +
        '<span class="status' + (d ? " done" : "") + '"></span>' +
        '<span class="body"><h3>' + esc(q.title) + '</h3><span class="meta">' + esc(q.category) + (d ? " · done" : "") + "</span></span>" +
        '<span class="diff" title="difficulty">' + stars(q.difficulty) + "</span>" +
        "</button>"
      );
    }).join("");

    app.innerHTML =
      '<p class="eyebrow">Question library</p>' +
      "<h1 style=\"font-size:clamp(28px,4vw,44px);font-weight:700;margin:0 0 24px\">Pick something to estimate</h1>" +
      '<div class="filters">' + chips + "</div>" +
      '<div class="qlist">' + rows + "</div>";

    Array.prototype.forEach.call(app.querySelectorAll(".chip"), function (c) {
      c.addEventListener("click", function () { viewLibrary._cat = c.getAttribute("data-cat"); viewLibrary(); });
    });
  }

  function viewPractice(id) {
    var q = byId(id);
    if (!q) { location.hash = "#/library"; return; }
    var saved = load()[id] || {};
    var userVals = []; // per-step numeric input
    var userRange = { low: undefined, high: undefined };

    app.innerHTML =
      '<button class="btn ghost small" data-go="library" style="margin-bottom:24px">← Library</button>' +
      '<div class="q-head">' +
      '<div class="meta"><span>' + esc(q.category) + '</span><span class="diff">' + stars(q.difficulty) + "</span></div>" +
      "<h1>" + esc(q.title) + "</h1>" +
      '<p class="prompt">' + esc(q.prompt) + "</p>" +
      "</div>" +
      '<div class="callout"><b>The catch:</b> ' + esc(q.thesis) + "</div>" +

      // worksheet
      '<div class="panel">' +
      "<h2>Your worksheet</h2>" +
      '<p class="sub">Enter your own assumption for each factor. The estimate updates as you type — don\'t peek yet.</p>' +
      '<div id="factors"></div>' +
      '<div class="running"><span class="lab">Your estimate</span><span class="val" id="running">—</span></div>' +
      "</div>" +

      // confidence interval
      '<div class="panel">' +
      "<h2>Your 90% confidence range</h2>" +
      '<p class="sub">State a low and high bound you\'re 90% sure the true answer falls between. Over many questions, you should be right about 9 times in 10 — too many misses means overconfident, never missing means your ranges are too wide.</p>' +
      '<div class="range-row">' +
      '<label class="range-field"><span>Low</span><input type="number" inputmode="decimal" id="ci-low" placeholder="?"></label>' +
      '<span class="range-sep">to</span>' +
      '<label class="range-field"><span>High</span><input type="number" inputmode="decimal" id="ci-high" placeholder="?"></label>' +
      '<span class="unit">' + esc(q.answer.unit) + "</span>" +
      "</div>" +
      "</div>" +

      '<div class="reveal-row"><button class="btn primary" id="reveal">Reveal expert breakdown &amp; score me</button></div>' +
      '<div id="result"></div>';

    // build factor rows
    var fwrap = app.querySelector("#factors");
    q.steps.forEach(function (s, i) {
      var row = el(
        '<div class="factor">' +
        '<div><div class="label"><span class="op">' + (s.op === "/" ? "÷" : "×") + "</span> " + esc(s.label) + '</div><div class="hint">' + esc(s.hint || "") + "</div></div>" +
        '<div class="input-wrap"><input type="number" inputmode="decimal" placeholder="?" aria-label="' + esc(s.label) + '"><span class="unit">' + esc(s.unit || "") + "</span></div>" +
        "</div>"
      );
      var input = row.querySelector("input");
      if (saved.userVals && saved.userVals[i] != null) { input.value = saved.userVals[i]; userVals[i] = saved.userVals[i]; }
      input.addEventListener("input", function () {
        userVals[i] = input.value === "" ? undefined : parseFloat(input.value);
        app.querySelector("#running").innerHTML = renderRunning();
      });
      fwrap.appendChild(row);
    });
    function renderRunning() {
      var v = computeFrom(q.steps, userVals);
      return esc(human(v)) + (v != null ? ' <span class="unit">' + esc(q.answer.unit) + "</span>" : "");
    }
    app.querySelector("#running").innerHTML = renderRunning();

    // wire the confidence range inputs
    var lowEl = app.querySelector("#ci-low"), highEl = app.querySelector("#ci-high");
    if (saved.range) {
      if (saved.range.low != null) { lowEl.value = saved.range.low; userRange.low = saved.range.low; }
      if (saved.range.high != null) { highEl.value = saved.range.high; userRange.high = saved.range.high; }
    }
    lowEl.addEventListener("input", function () { userRange.low = lowEl.value === "" ? undefined : parseFloat(lowEl.value); });
    highEl.addEventListener("input", function () { userRange.high = highEl.value === "" ? undefined : parseFloat(highEl.value); });

    app.querySelector("#reveal").addEventListener("click", function () {
      revealResult(q, userVals, userRange);
    });

    if (saved.revealed) revealResult(q, userVals, userRange); // re-show if returning
  }

  function revealResult(q, userVals, userRange) {
    var you = computeFrom(q.steps, userVals);
    var expert = q.answer.value;
    userRange = userRange || {};

    var verdict, vclass, vtext;
    if (you == null) { verdict = "Fill in the factors first"; vclass = "off"; vtext = "Enter your assumptions above, then reveal."; }
    else {
      var gap = Math.abs(Math.log10(you) - Math.log10(expert));
      if (gap <= 0.5) { verdict = "Spot on"; vclass = "spot"; vtext = "Within a factor of ~3 of the expert estimate — excellent."; }
      else if (gap <= 1) { verdict = "Right order of magnitude"; vclass = "order"; vtext = "Within 10×. In an interview, this is a pass."; }
      else if (gap <= 2) { verdict = "Close-ish"; vclass = "off"; vtext = "Off by up to 100×. Check which factor pulled you away."; }
      else { verdict = "Off the mark"; vclass = "off"; vtext = "More than 100× off — revisit your assumptions one by one."; }
    }

    // calibration: did the expert value fall inside the user's 90% range?
    var hasRange = userRange.low > 0 && userRange.high > 0;
    var lo = hasRange ? Math.min(userRange.low, userRange.high) : null;
    var hi = hasRange ? Math.max(userRange.low, userRange.high) : null;
    var hit = hasRange ? (expert >= lo && expert <= hi) : null;
    var widthOrders = hasRange ? (Math.log10(hi) - Math.log10(lo)) : null;
    var calClass, calVerdict, calText;
    if (!hasRange) {
      calVerdict = "No range given";
      calClass = "off";
      calText = "Next time, commit to a low and high bound before revealing — calibration is half the skill.";
    } else if (hit) {
      calClass = "spot"; calVerdict = "Caught it";
      calText = widthOrders <= 1
        ? "The answer sat inside a tight range — well-calibrated and confident."
        : "You caught the answer, but the range spans " + widthOrders.toFixed(1) + " orders of magnitude. See if you can tighten it next time.";
    } else {
      calClass = "off"; calVerdict = "Missed";
      calText = "The answer fell outside your range — a sign of overconfidence. Widen your bounds until you'd expect to be right ~9 times in 10.";
    }

    var expRows = q.steps.map(function (s) {
      return (
        '<div class="exp-factor">' +
        '<div class="op">' + (s.op === "/" ? "÷" : "×") + "</div>" +
        '<div><div class="label">' + esc(s.label) + '</div><div class="why">' + esc(s.rationale) + "</div></div>" +
        '<div class="num">' + esc(human(s.value)) + (s.unit ? " " + esc(s.unit) : "") + "</div>" +
        "</div>"
      );
    }).join("");

    var follow = q.followups.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    var tags = q.concepts.map(function (c) { return '<span class="t">' + esc(c) + "</span>"; }).join("");

    var html =
      rulerHTML("Where you landed vs the expert estimate", you, expert, hasRange ? { low: lo, high: hi } : null) +
      '<div class="panel">' +
      '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:6px"><span class="verdict ' + vclass + '">' + esc(verdict) + '</span>' +
      (you != null ? '<span class="muted" style="font-family:var(--font-mono);font-size:13px">you ' + esc(human(you)) + " · expert " + esc(human(expert)) + "</span>" : "") +
      "</div>" +
      '<p class="note">' + esc(vtext) + "</p>" +
      '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:18px 0 6px;padding-top:16px;border-top:1px solid var(--line)"><span class="verdict ' + calClass + '">' + esc(calVerdict) + '</span>' +
      (hasRange ? '<span class="muted" style="font-family:var(--font-mono);font-size:13px">range ' + esc(human(lo)) + " – " + esc(human(hi)) + "</span>" : "") +
      "</div>" +
      '<p class="note">' + esc(calText) + "</p>" +
      "</div>" +

      '<div class="panel">' +
      "<h2>Expert breakdown</h2>" +
      '<p class="sub">One reasonable path to the answer — yours may differ and still be right.</p>' +
      expRows +
      '<div class="running"><span class="lab">Expert estimate</span><span class="val">' + esc(human(expert)) + ' <span class="unit">' + esc(q.answer.unit) + '</span></span></div>' +
      '<p class="note"><b>Reality check:</b> ' + esc(q.answer.note) + '</p>' +
      '<p class="note"><b>Sanity check:</b> ' + esc(q.sanity) + "</p>" +
      "</div>" +

      '<div class="panel">' +
      "<h2>If the interviewer pushes further</h2>" +
      '<ul class="clean">' + follow + "</ul>" +
      '<div style="margin-top:22px"><h2 style="margin-bottom:10px">Concepts you just practiced</h2><div class="tags">' + tags + "</div></div>" +
      "</div>" +

      '<div class="panel">' +
      "<h2>Log it</h2>" +
      '<div class="rate-row"><span class="q">How did that go?</span>' +
      '<button class="rate" data-rate="3">Nailed it</button>' +
      '<button class="rate" data-rate="2">Okay</button>' +
      '<button class="rate" data-rate="1">Struggled</button>' +
      "</div></div>" +

      '<div class="practice-foot">' +
      '<button class="btn ghost" data-go="library">← Back to library</button>' +
      '<button class="btn" data-go="random">Next random question →</button>' +
      "</div>";

    var holder = app.querySelector("#result");
    holder.innerHTML = html;

    // persist reveal + rating + calibration
    record(q.id, {
      revealed: true, userVals: userVals.slice(), mag: you,
      range: hasRange ? { low: lo, high: hi } : null,
      hit: hit, ratioLog: (you != null) ? (Math.log10(you) - Math.log10(expert)) : null,
    });
    var savedRating = (load()[q.id] || {}).rating;
    Array.prototype.forEach.call(holder.querySelectorAll(".rate"), function (b) {
      if (String(savedRating) === b.getAttribute("data-rate")) b.classList.add("sel");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(holder.querySelectorAll(".rate"), function (x) { x.classList.remove("sel"); });
        b.classList.add("sel");
        record(q.id, { status: "done", rating: parseInt(b.getAttribute("data-rate"), 10) });
      });
    });

    holder.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function viewProgress() {
    var p = load();
    var doneIds = Object.keys(p).filter(function (k) { return p[k].status === "done"; });
    var done = doneIds.length;

    if (done === 0) {
      app.innerHTML =
        '<p class="eyebrow">Progress</p>' +
        '<h1 style="font-size:clamp(28px,4vw,44px);font-weight:700;margin:0 0 8px">Nothing logged yet</h1>' +
        '<div class="empty"><p>Finish a question and rate yourself — your stats and weak spots show up here.</p><button class="btn primary" data-go="random">Start a question</button></div>';
      return;
    }

    // rating distribution
    var ratings = doneIds.map(function (id) { return p[id].rating || 0; });
    var avg = ratings.reduce(function (a, b) { return a + b; }, 0) / ratings.length;
    var struggled = ratings.filter(function (r) { return r === 1; }).length;

    // per-category breakdown
    var cats = {};
    QUESTIONS.forEach(function (q) {
      cats[q.category] = cats[q.category] || { total: 0, done: 0 };
      cats[q.category].total++;
      if (p[q.id] && p[q.id].status === "done") cats[q.category].done++;
    });
    var bars = Object.keys(cats).map(function (c) {
      var pct = Math.round((cats[c].done / cats[c].total) * 100);
      return (
        '<div class="bar-row"><span class="name">' + esc(c) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="pct">' + cats[c].done + "/" + cats[c].total + "</span></div>"
      );
    }).join("");

    // calibration: how often the truth fell inside the user's 90% range
    var rangeIds = doneIds.filter(function (id) { return typeof p[id].hit === "boolean"; });
    var hits = rangeIds.filter(function (id) { return p[id].hit; }).length;
    var hitRate = rangeIds.length ? hits / rangeIds.length : null;
    var calSummary = "";
    if (rangeIds.length >= 1) {
      var pctHit = Math.round(hitRate * 100);
      var cverd, cnote;
      if (rangeIds.length < 3) {
        cverd = "Building a read"; cnote = "You've given ranges on " + rangeIds.length + " question" + (rangeIds.length === 1 ? "" : "s") + ". A few more and this becomes a real calibration signal (the target is being right ~90% of the time).";
      } else if (hitRate < 0.8) {
        cverd = "Overconfident"; cnote = "The answer landed inside your range only " + pctHit + "% of the time — you're aiming for ~90%. Widen your bounds; genuine uncertainty deserves room.";
      } else if (hitRate > 0.97) {
        cverd = "Ranges too wide"; cnote = "You caught the answer " + pctHit + "% of the time — safe, but so wide it says little. Tighten toward a real 90% interval.";
      } else {
        cverd = "Well calibrated"; cnote = "You caught the answer " + pctHit + "% of the time, right around the 90% target. This is exactly the instinct interviewers reward.";
      }
      calSummary =
        '<div class="section-head"><h2>Calibration</h2></div>' +
        '<div class="panel"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:6px">' +
        '<span class="verdict ' + (hitRate >= 0.8 && hitRate <= 0.97 ? "spot" : "off") + '">' + esc(cverd) + '</span>' +
        '<span class="muted" style="font-family:var(--font-mono);font-size:13px">' + hits + "/" + rangeIds.length + " inside range · target 90%</span>" +
        "</div><p class=\"note\">" + esc(cnote) + "</p></div>";
    }

    // directional bias: do point estimates run high or low vs expert?
    var ratios = doneIds.map(function (id) { return p[id].ratioLog; }).filter(function (r) { return typeof r === "number" && isFinite(r); });
    var biasNote = "";
    if (ratios.length >= 3) {
      var meanLog = ratios.reduce(function (a, b) { return a + b; }, 0) / ratios.length;
      var factor = Math.pow(10, Math.abs(meanLog));
      if (Math.abs(meanLog) < 0.15) biasNote = "Your estimates show no systematic high/low bias — nicely centered.";
      else biasNote = "You tend to " + (meanLog > 0 ? "over" : "under") + "-estimate by about " + (factor >= 10 ? Math.round(factor) : factor.toFixed(1)) + "× on average. Worth noticing which assumptions pull you that way.";
    }

    // questions to revisit (rated "struggled")
    var revisit = doneIds.filter(function (id) { return p[id].rating === 1; }).map(function (id) {
      var q = byId(id);
      return q ? '<button class="qcard" data-q="' + id + '"><span class="status done"></span><span class="body"><h3>' + esc(q.title) + '</h3><span class="meta">' + esc(q.category) + ' · struggled</span></span><span class="diff">' + stars(q.difficulty) + "</span></button>" : "";
    }).join("");

    app.innerHTML =
      '<p class="eyebrow">Progress</p>' +
      '<h1 style="font-size:clamp(28px,4vw,44px);font-weight:700;margin:0 0 24px">Your training log</h1>' +
      '<div class="stat-grid">' +
      '<div class="stat"><div class="big"><span class="accent">' + done + "</span>/" + QUESTIONS.length + '</div><div class="lab">Questions completed</div></div>' +
      '<div class="stat"><div class="big">' + (avg ? avg.toFixed(1) : "—") + '</div><div class="lab">Avg self-rating (3 = nailed it)</div></div>' +
      '<div class="stat"><div class="big">' + (hitRate != null ? '<span class="accent">' + Math.round(hitRate * 100) + "</span>%" : "—") + '</div><div class="lab">Truth inside your range' + (rangeIds.length ? " (" + rangeIds.length + ")" : "") + "</div></div>" +
      "</div>" +
      calSummary +
      (biasNote ? '<div class="section-head"><h2>Directional bias</h2></div><div class="panel"><p class="note" style="margin:0">' + esc(biasNote) + "</p></div>" : "") +
      '<div class="section-head"><h2>Coverage by category</h2></div>' +
      '<div class="bars">' + bars + "</div>" +
      (revisit ? '<div class="section-head"><h2>Worth another pass</h2></div><div class="qlist">' + revisit + "</div>" : "") +
      '<div class="practice-foot" style="margin-top:40px"><button class="btn primary" data-go="random">Practice another →</button><button class="btn ghost small" id="reset">Reset all progress</button></div>';

    var reset = app.querySelector("#reset");
    if (reset) reset.addEventListener("click", function () {
      if (confirm("Erase all saved progress and ratings? This can't be undone.")) { save({}); render(); }
    });
  }

  /* ---------- routing ---------- */
  function setNav(name) {
    Array.prototype.forEach.call(document.querySelectorAll(".nav button"), function (b) {
      b.classList.toggle("active", b.getAttribute("data-nav") === name);
    });
  }

  function randomId() {
    var p = load();
    var undoneIds = QUESTIONS.filter(function (q) { return !(p[q.id] && p[q.id].status === "done"); });
    var pool = undoneIds.length ? undoneIds : QUESTIONS;
    return pool[Math.floor(Math.random() * pool.length)].id;
  }

  function render() {
    var h = location.hash || "#/home";
    var parts = h.replace(/^#\//, "").split("/");
    window.scrollTo(0, 0);
    if (parts[0] === "practice" && parts[1]) { setNav("library"); viewPractice(parts[1]); }
    else if (parts[0] === "library") { setNav("library"); viewLibrary(); }
    else if (parts[0] === "progress") { setNav("progress"); viewProgress(); }
    else { setNav("home"); viewHome(); }
  }

  // global click delegation for navigation buttons
  document.addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]");
    if (go) {
      var dst = go.getAttribute("data-go");
      if (dst === "random") location.hash = "#/practice/" + randomId();
      else if (dst === "library") location.hash = "#/library";
      else if (dst === "home") location.hash = "#/home";
      else if (dst === "progress") location.hash = "#/progress";
      return;
    }
    var qc = e.target.closest("[data-q]");
    if (qc) { location.hash = "#/practice/" + qc.getAttribute("data-q"); return; }
    var nav = e.target.closest("[data-nav]");
    if (nav) {
      var n = nav.getAttribute("data-nav");
      location.hash = n === "home" ? "#/home" : "#/" + n;
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
