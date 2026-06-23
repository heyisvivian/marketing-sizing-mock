/* Question bank for Envelope.
 * Each question decomposes into ordered FACTORS that you multiply (op:'x')
 * or divide (op:'/') to reach an estimate. The expert `value` on each factor
 * is the reference assumption; learners fill in their own and compare.
 */
const QUESTIONS = [
  {
    id: "tennis-747",
    title: "How many tennis balls fit inside a Boeing 747?",
    category: "Physical",
    difficulty: 2,
    prompt:
      "Estimate how many tennis balls you could pack into the passenger cabin of a Boeing 747.",
    thesis:
      "A volume-over-volume problem. The trap is forgetting that spheres never fill space perfectly — packing efficiency is the factor people drop.",
    steps: [
      { key: "cabin", label: "Usable cabin volume", op: "x", value: 800, unit: "m³",
        hint: "Cabin ~ 60 m long, a tube a few meters across. Think in m³.",
        rationale: "A 747 cabin is roughly a 60 m × 6 m × 2.3 m tube of usable air ≈ 800 m³." },
      { key: "packing", label: "Packing efficiency", op: "x", value: 0.6, unit: "",
        hint: "Spheres leave gaps. A fraction between 0 and 1.",
        rationale: "Random sphere packing fills ~64%; real cabins waste more, so ~0.6." },
      { key: "ball", label: "Volume of one tennis ball", op: "/", value: 0.00015, unit: "m³",
        hint: "Diameter ~6.7 cm. Volume of a sphere is (4/3)πr³.",
        rationale: "r ≈ 3.35 cm → V ≈ 1.5×10⁻⁴ m³ per ball." },
    ],
    answer: { value: 3.2e6, unit: "balls",
      note: "~3 million in the cabin alone; closer to 10⁷ if you also fill the cargo hold." },
    sanity:
      "A cubic meter holds roughly 6,000 balls at 60% packing. 800 m³ × ~4,000 effective ≈ a few million. Order 10⁶ feels right.",
    followups: [
      "How would the answer change if we filled the entire fuselage, including cargo and avionics bays?",
      "Tennis balls are compressible and the cabin isn't a clean box — which assumption is most fragile?",
      "If the interviewer wanted weight instead of count, what extra factor do you add?",
    ],
    concepts: ["Volume / volume", "Sphere packing", "Bounding-box vs true volume"],
  },
  {
    id: "coffee-nyc",
    title: "How many coffee shops are there in New York City?",
    category: "Market sizing",
    difficulty: 2,
    prompt: "Estimate the number of coffee shops operating in New York City.",
    thesis:
      "Best solved from demand, not supply. Build daily cups, route the fraction bought out-of-home, then divide by what one shop can serve.",
    steps: [
      { key: "pop", label: "NYC population", op: "x", value: 8.5e6, unit: "people",
        hint: "One of the largest US cities.", rationale: "~8.5 million residents." },
      { key: "cups", label: "Coffees per person per day", op: "x", value: 0.5, unit: "cups",
        hint: "Average across everyone, including people who don't drink coffee.",
        rationale: "Many drink 1–2, many drink 0 → ~0.5 on average." },
      { key: "outofhome", label: "Fraction bought at a shop", op: "x", value: 0.3, unit: "",
        hint: "Most coffee is made at home or the office.",
        rationale: "Roughly a third is bought out-of-home." },
      { key: "perShop", label: "Coffees one shop sells per day", op: "/", value: 300, unit: "cups",
        hint: "A busy independent vs a quiet one — pick a daily average.",
        rationale: "A typical shop does a few hundred transactions a day." },
    ],
    answer: { value: 4250, unit: "shops",
      note: "~4,000 — in line with the few-thousand coffee shops NYC actually has." },
    sanity:
      "8.5M people × 0.5 × 0.3 ≈ 1.3M shop cups/day. Divide by 300 → ~4,000 shops. Order 10³–10⁴.",
    followups: [
      "How would you cross-check this from the supply side (people per shop, or shops per block)?",
      "Should chains like Starbucks count differently from independents?",
      "How does the answer shift for a tourist-heavy area like Midtown vs a residential borough?",
    ],
    concepts: ["Demand-side sizing", "Per-capita rates", "Cross-checking"],
  },
  {
    id: "piano-tuners",
    title: "How many piano tuners work in Chicago?",
    category: "Classic",
    difficulty: 2,
    prompt: "Estimate the number of working piano tuners in the Chicago area. (The original Fermi problem.)",
    thesis:
      "The canonical Fermi estimate. Demand (pianos needing tuning) must equal supply (what one tuner can do in a year) — set them equal.",
    steps: [
      { key: "pop", label: "Chicago area population", op: "x", value: 5e6, unit: "people",
        hint: "City plus near suburbs.", rationale: "~5 million in the metro core." },
      { key: "perHouse", label: "People per household", op: "/", value: 2.5, unit: "",
        hint: "Turns people into households.", rationale: "~2.5 people per household → 2M households." },
      { key: "ownership", label: "Fraction with a piano", op: "x", value: 0.05, unit: "",
        hint: "Households, schools, churches — but most homes have none.",
        rationale: "Roughly 1 in 20 households → ~100,000 pianos." },
      { key: "perYear", label: "Tunings per piano per year", op: "x", value: 1, unit: "",
        hint: "How often does a piano get tuned?", rationale: "About once a year on average." },
      { key: "capacity", label: "Tunings one tuner does per year", op: "/", value: 1000, unit: "",
        hint: "Jobs/day × working days. ~4/day × ~250 days.",
        rationale: "~4 tunings/day × ~250 working days ≈ 1,000/year." },
    ],
    answer: { value: 100, unit: "tuners",
      note: "~100 — the famous answer, and close to reality." },
    sanity:
      "100,000 tunings/year ÷ 1,000 per tuner = 100 tuners. The demand and supply sides meet at order 10².",
    followups: [
      "Which single assumption would you most want to verify with real data?",
      "How would you adapt this to estimate plumbers, or EV-charger technicians?",
      "Why does setting demand equal to supply work here?",
    ],
    concepts: ["Supply = demand", "Households as a unit", "Capacity constraints"],
  },
  {
    id: "starbucks-revenue",
    title: "What's the annual revenue of a single Starbucks store?",
    category: "Market sizing",
    difficulty: 1,
    prompt: "Estimate the yearly revenue of one typical Starbucks location.",
    thesis:
      "A clean rate problem: traffic × ticket × days open. A good warm-up for spotting which lever matters most.",
    steps: [
      { key: "customers", label: "Customers per day", op: "x", value: 500, unit: "people",
        hint: "Think peak rush plus a steady trickle.", rationale: "~500 transactions on a normal day." },
      { key: "ticket", label: "Average spend per customer", op: "x", value: 7, unit: "$",
        hint: "A drink, sometimes a pastry.", rationale: "~$7 average ticket." },
      { key: "days", label: "Days open per year", op: "x", value: 360, unit: "days",
        hint: "Open nearly every day.", rationale: "~360 days." },
    ],
    answer: { value: 1.26e6, unit: "$/year",
      note: "~$1.3M — actual averages land near $1.5M." },
    sanity:
      "500 × $7 = $3,500/day × 360 ≈ $1.3M. Order 10⁶ dollars.",
    followups: [
      "Which lever — traffic, ticket size, or hours — would you pull to grow revenue 20%?",
      "How would a drive-thru location differ from an urban walk-up?",
      "From here, how would you size all of Starbucks' US revenue?",
    ],
    concepts: ["Rate × volume", "Unit economics", "Scaling up to a market"],
  },
  {
    id: "chopsticks-china",
    title: "How many disposable chopsticks does China use per year?",
    category: "Market sizing",
    difficulty: 2,
    prompt: "Estimate the number of disposable chopstick pairs used in China each year.",
    thesis:
      "Huge population × small daily rate × 365 — a lesson in how big numbers come from modest per-person habits.",
    steps: [
      { key: "pop", label: "Population of China", op: "x", value: 1.4e9, unit: "people",
        hint: "The headline number.", rationale: "~1.4 billion people." },
      { key: "perDay", label: "Disposable pairs per person per day", op: "x", value: 0.3, unit: "pairs",
        hint: "Most meals use reusable chopsticks; only some are takeout/restaurant disposables.",
        rationale: "~0.3 disposable pairs per person per day on average." },
      { key: "days", label: "Days per year", op: "x", value: 365, unit: "days",
        hint: "", rationale: "365." },
    ],
    answer: { value: 1.5e11, unit: "pairs/year",
      note: "~10¹¹; widely cited estimates are ~80 billion pairs/year." },
    sanity:
      "1.4B × 0.3 = 4×10⁸ pairs/day × 365 ≈ 1.5×10¹¹. Order 10¹⁰–10¹¹.",
    followups: [
      "How many trees per year is that, roughly?",
      "Which is the most uncertain factor — and how could you bound it?",
      "How would a ban in restaurants change the number?",
    ],
    concepts: ["Population × rate × time", "Average over a mixed population", "Bounding uncertainty"],
  },
  {
    id: "gas-stations-us",
    title: "How many gas stations are there in the United States?",
    category: "Market sizing",
    difficulty: 1,
    prompt: "Estimate the number of gas stations in the US.",
    thesis:
      "Demand from fill-ups divided by what one station handles. A good case for choosing the cleanest unit (cars, not people).",
    steps: [
      { key: "cars", label: "Cars on the road", op: "x", value: 2.5e8, unit: "cars",
        hint: "Close to one per adult.", rationale: "~250 million registered vehicles." },
      { key: "fillups", label: "Fill-ups per car per week", op: "x", value: 1, unit: "",
        hint: "How often does a typical car refuel?", rationale: "~once a week." },
      { key: "weeks", label: "Weeks per year", op: "x", value: 52, unit: "weeks",
        hint: "", rationale: "52." },
      { key: "capacity", label: "Fill-ups one station handles per year", op: "/", value: 1.8e5, unit: "",
        hint: "~500 per day × 360 days.", rationale: "~500/day × 360 ≈ 180,000/year." },
    ],
    answer: { value: 7.2e4, unit: "stations",
      note: "~70,000–100,000; the US has roughly 115,000." },
    sanity:
      "250M cars × 52 fill-ups = 1.3×10¹⁰/year ÷ 180k ≈ 72,000. Order 10⁵.",
    followups: [
      "How would EV adoption change this over the next decade?",
      "Would you size it differently for a single state?",
      "Why use cars rather than people as the base unit here?",
    ],
    concepts: ["Choosing the right base unit", "Throughput per facility", "Sensitivity to trends"],
  },
  {
    id: "photos-per-day",
    title: "How many photos are taken worldwide each day?",
    category: "Tech",
    difficulty: 3,
    prompt: "Estimate the number of photographs taken across the world in a single day.",
    thesis:
      "A global digital-rate problem. The hard part is a defensible per-user daily rate — and remembering most photos are never shared.",
    steps: [
      { key: "users", label: "Smartphone users worldwide", op: "x", value: 4e9, unit: "people",
        hint: "Billions, but not everyone on Earth.", rationale: "~4 billion smartphone users." },
      { key: "perUser", label: "Photos per user per day", op: "x", value: 5, unit: "photos",
        hint: "Most are never posted — count all of them, including bursts.",
        rationale: "~5 per active user per day on average." },
    ],
    answer: { value: 2e10, unit: "photos/day",
      note: "~10¹⁰ per day, i.e. trillions per year." },
    sanity:
      "4B × 5 = 2×10¹⁰/day. Over a year that's ~7×10¹², consistent with cited 'trillions of photos' figures.",
    followups: [
      "How would you separate photos taken from photos shared?",
      "Cameras, security systems, satellites — do they move the order of magnitude?",
      "Which factor would you refine first if you had 10 more minutes?",
    ],
    concepts: ["Global digital rates", "Active vs total users", "Taken vs shared"],
  },
  {
    id: "pingpong-bus",
    title: "How many ping-pong balls fit in a school bus?",
    category: "Physical",
    difficulty: 2,
    prompt: "Estimate how many ping-pong balls would fill the interior of a school bus.",
    thesis:
      "Another packing problem, smaller balls. Watch the cube law: halving the ball diameter roughly multiplies the count by eight.",
    steps: [
      { key: "vol", label: "Usable interior volume", op: "x", value: 40, unit: "m³",
        hint: "~12 m long, a couple meters each way, minus seats.",
        rationale: "A bus interior is ~50 m³ gross; call it 40 m³ usable." },
      { key: "packing", label: "Packing efficiency", op: "x", value: 0.6, unit: "",
        hint: "Spheres leave gaps.", rationale: "~0.6 for loose sphere packing." },
      { key: "ball", label: "Volume of one ping-pong ball", op: "/", value: 3.3e-5, unit: "m³",
        hint: "Diameter 4 cm → r = 2 cm.", rationale: "(4/3)π(0.02)³ ≈ 3.3×10⁻⁵ m³." },
    ],
    answer: { value: 7.3e5, unit: "balls",
      note: "~10⁶ — close to a million." },
    sanity:
      "40 × 0.6 = 24 m³ of balls ÷ 3.3×10⁻⁵ ≈ 730,000. Order 10⁵–10⁶.",
    followups: [
      "How does this compare to the tennis-ball-in-a-747 problem per unit volume?",
      "If you only remembered the ball's diameter, how would you get its volume fast?",
      "Why does seat volume barely matter to the order of magnitude?",
    ],
    concepts: ["Cube-law scaling", "Packing efficiency", "What rounds away"],
  },
  {
    id: "toothbrush-market",
    title: "How big is the US electric toothbrush market per year?",
    category: "Market sizing",
    difficulty: 3,
    prompt: "Estimate the annual revenue of the electric toothbrush market in the US (devices only).",
    thesis:
      "Installed base × replacement rate × price. The subtlety is converting owners into yearly buyers via replacement cycle.",
    steps: [
      { key: "pop", label: "US population", op: "x", value: 3.3e8, unit: "people",
        hint: "", rationale: "~330 million." },
      { key: "ownership", label: "Fraction owning an electric brush", op: "x", value: 0.3, unit: "",
        hint: "Common but far from universal.", rationale: "~30% → ~100M owners." },
      { key: "replace", label: "New devices bought per owner per year", op: "x", value: 0.33, unit: "",
        hint: "A device lasts a few years → a fraction buy a new one each year.",
        rationale: "~1 every 3 years → 0.33/year." },
      { key: "price", label: "Average device price", op: "x", value: 40, unit: "$",
        hint: "Entry models to premium ones.", rationale: "~$40 blended." },
    ],
    answer: { value: 1.3e9, unit: "$/year",
      note: "~$1–2B for devices; more if you add replacement brush heads." },
    sanity:
      "100M owners × 0.33 = 33M devices/year × $40 ≈ $1.3B. Order 10⁹ dollars.",
    followups: [
      "How much would adding replacement brush heads (a razor-and-blades model) grow the market?",
      "Is replacement rate or ownership the bigger swing factor?",
      "How would you size the global market from here?",
    ],
    concepts: ["Installed base × replacement", "Razor-and-blades", "Devices vs consumables"],
  },
  {
    id: "uber-sf",
    title: "How many Uber rides happen in San Francisco per day?",
    category: "Operations",
    difficulty: 2,
    prompt: "Estimate the number of ride-hail trips taken in San Francisco on a typical day.",
    thesis:
      "Riders, not residents: most people don't ride on a given day, but those who do often take more than one trip.",
    steps: [
      { key: "pop", label: "San Francisco population", op: "x", value: 8.7e5, unit: "people",
        hint: "Under a million in the city proper.", rationale: "~870,000 residents." },
      { key: "riders", label: "Fraction taking a ride on a given day", op: "x", value: 0.15, unit: "",
        hint: "Most people drive, walk, or take transit instead.",
        rationale: "~15% on a typical day (plus visitors)." },
      { key: "trips", label: "Trips per rider that day", op: "x", value: 1.5, unit: "",
        hint: "Often a there-and-back.", rationale: "~1.5 trips each." },
    ],
    answer: { value: 1.96e5, unit: "rides/day",
      note: "~2×10⁵ rides/day in the city." },
    sanity:
      "870k × 0.15 = 130k riders × 1.5 ≈ 195,000 trips. Order 10⁵.",
    followups: [
      "How would you add tourists and commuters who don't live in SF?",
      "How does a Friday night differ from a Tuesday morning?",
      "From rides/day, how would you estimate Uber's daily SF revenue?",
    ],
    concepts: ["Penetration rate", "Per-user frequency", "Residents vs total demand"],
  },
  {
    id: "pizza-superbowl",
    title: "How many pizzas are delivered in the US on Super Bowl Sunday?",
    category: "Market sizing",
    difficulty: 3,
    prompt: "Estimate the number of pizzas delivered across the US on Super Bowl Sunday.",
    thesis:
      "An event-spike problem: start from households, apply an occasion-specific order rate, not an everyday one.",
    steps: [
      { key: "households", label: "US households", op: "x", value: 1.3e8, unit: "households",
        hint: "~330M people ÷ ~2.5 per home.", rationale: "~130 million households." },
      { key: "order", label: "Fraction ordering pizza that day", op: "x", value: 0.08, unit: "",
        hint: "A big day for pizza, but most still don't order delivery.",
        rationale: "~8% order delivery on the day." },
      { key: "perHouse", label: "Pizzas per ordering household", op: "x", value: 1.5, unit: "",
        hint: "Parties order more than one.", rationale: "~1.5 pizzas each." },
    ],
    answer: { value: 1.56e7, unit: "pizzas",
      note: "~10⁷; industry figures cite ~12–13 million pizzas that day." },
    sanity:
      "130M × 0.08 = 10.4M ordering households × 1.5 ≈ 15.6M pizzas. Order 10⁷.",
    followups: [
      "How would you separate delivery from carryout and frozen?",
      "Which factor would you most want a real data point for?",
      "How does an everyday Sunday compare to the Super Bowl spike?",
    ],
    concepts: ["Event spikes", "Occasion vs baseline rate", "Households as a base"],
  },
];

if (typeof module !== "undefined") { module.exports = QUESTIONS; }
