import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, TrendingDown, HeartPulse, UtensilsCrossed, Dumbbell,
  Plus, Minus, Check, Wine, Droplet, Flame, Footprints,
  ShoppingCart, ChevronRight, Trophy, Sparkles, X, Leaf,
  GlassWater, Brain, Bell, BellOff, Play, Pause, RotateCcw, CalendarDays, ChevronLeft, Sun, Shuffle, ChevronDown
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine
} from "recharts";
import * as Tone from "tone";

/* -------------------- STORAGE (localStorage) --------------------- */
/* Same async shape the app expects, backed by the browser so your
   data persists on-device between visits. No account needed. */
const STORE_KEY = "bodly-data";
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value == null ? null : { value };
    } catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); return { value }; } catch { return null; }
  },
};

/* ----------------------------- THEME ----------------------------- */
const C = {
  bg: "#0f1a14",
  card: "#16241c",
  card2: "#1d3127",
  line: "#274536",
  sage: "#8fd6a4",
  sageDeep: "#3fae6a",
  cream: "#f4f1e8",
  sun: "#f5c451",
  coral: "#f08a6e",
  sky: "#7fc4e0",
  mute: "#8aa394",
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDay = (s) => new Date(s + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });

const WATER_GOAL = 8; // glasses per day

/* ----------------------------- LOGO ------------------------------ */
/* Vitruvian-style figure inside a circle + square, over a translucent B */
function Logo({ size = 34, color = C.sage }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <text x="50" y="78" textAnchor="middle" fontFamily="Georgia, serif"
        fontWeight="700" fontSize="92" fill={color} opacity="0.13">B</text>
      <rect x="17" y="22" width="66" height="66" rx="2" stroke={color} strokeWidth="2" opacity="0.55" />
      <circle cx="50" cy="55" r="33" stroke={color} strokeWidth="2" opacity="0.75" />
      <circle cx="50" cy="29" r="5.2" stroke={color} strokeWidth="2.2" />
      <line x1="50" y1="34" x2="50" y2="62" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="42" x2="27" y2="42" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="42" x2="73" y2="42" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="40" x2="31" y2="29" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
      <line x1="50" y1="40" x2="69" y2="29" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
      <line x1="50" y1="62" x2="44" y2="85" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="62" x2="56" y2="85" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="62" x2="34" y2="84" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
      <line x1="50" y1="62" x2="66" y2="84" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/* --------------------------- MEAL LIBRARY -------------------------- */
const MEALS = [
  /* ---------------- BREAKFAST ---------------- */
  { id: "m1", name: "Greek Yogurt & Berry Bowl", tag: "Breakfast", glyc: "Low GI",
    why: "Protein + fiber keeps blood sugar steady all morning.",
    items: ["Plain Greek yogurt", "Mixed berries", "Chia seeds", "Walnuts", "Cinnamon"] },
  { id: "m2", name: "Veggie & Feta Omelette", tag: "Breakfast", glyc: "Low GI",
    why: "High protein, near-zero impact on glucose.",
    items: ["Eggs", "Spinach", "Bell pepper", "Feta cheese", "Olive oil"] },
  { id: "b3", name: "Overnight Oats & Chia", tag: "Breakfast", glyc: "Low GI",
    why: "Slow-release oats with chia keep you full for hours.",
    items: ["Rolled oats", "Chia seeds", "Unsweetened almond milk", "Blueberries", "Cinnamon"] },
  { id: "b4", name: "Avocado & Egg Toast", tag: "Breakfast", glyc: "Med GI",
    why: "Whole-grain + healthy fat blunts the glucose rise.",
    items: ["Whole-grain bread", "Avocado", "Eggs", "Chili flakes", "Lemon"] },
  { id: "b5", name: "Cottage Cheese & Tomato Bowl", tag: "Breakfast", glyc: "Low GI",
    why: "High-protein, low-carb, very gentle on blood sugar.",
    items: ["Cottage cheese", "Cherry tomatoes", "Cucumber", "Black pepper", "Olive oil"] },
  { id: "b6", name: "Spinach & Mushroom Scramble", tag: "Breakfast", glyc: "Low GI",
    why: "Veg-packed protein to start the day strong.",
    items: ["Eggs", "Spinach", "Mushrooms", "Onion", "Olive oil"] },
  { id: "b7", name: "Smoked Salmon & Cream Cheese", tag: "Breakfast", glyc: "Low GI",
    why: "Omega-3s and protein with barely any carbs.",
    items: ["Smoked salmon", "Cream cheese", "Whole-grain crackers", "Capers", "Red onion"] },
  { id: "b8", name: "Peanut Butter Banana Oatmeal", tag: "Breakfast", glyc: "Med GI",
    why: "Fiber + fat slows the banana's natural sugars.",
    items: ["Rolled oats", "Peanut butter", "Banana", "Unsweetened almond milk", "Cinnamon"] },

  /* ---------------- LUNCH ---------------- */
  { id: "m3", name: "Lentil & Roasted Veg Salad", tag: "Lunch", glyc: "Low GI",
    why: "Lentils slow digestion and are great for prediabetes.",
    items: ["Green lentils", "Cherry tomatoes", "Cucumber", "Red onion", "Lemon", "Olive oil", "Parsley"] },
  { id: "m4", name: "Grilled Chicken & Quinoa Bowl", tag: "Lunch", glyc: "Med GI",
    why: "Lean protein with a whole-grain that won't spike you.",
    items: ["Chicken breast", "Quinoa", "Broccoli", "Avocado", "Garlic", "Lemon"] },
  { id: "l5", name: "Tuna & White Bean Salad", tag: "Lunch", glyc: "Low GI",
    why: "Protein + fiber combo that keeps energy level.",
    items: ["Canned tuna", "Cannellini beans", "Arugula", "Red onion", "Lemon", "Olive oil"] },
  { id: "l6", name: "Chickpea & Feta Bowl", tag: "Lunch", glyc: "Low GI",
    why: "Plant protein and fiber for steady afternoons.",
    items: ["Chickpeas", "Feta cheese", "Cucumber", "Cherry tomatoes", "Olives", "Olive oil", "Oregano"] },
  { id: "l7", name: "Turkey & Avocado Wrap", tag: "Lunch", glyc: "Med GI",
    why: "Whole-grain wrap with lean protein and good fats.",
    items: ["Whole-grain tortilla", "Turkey breast", "Avocado", "Lettuce", "Tomato", "Mustard"] },
  { id: "l8", name: "Quinoa Tabbouleh & Grilled Halloumi", tag: "Lunch", glyc: "Low GI",
    why: "Herby, filling, and blood-sugar friendly.",
    items: ["Quinoa", "Parsley", "Mint", "Tomato", "Cucumber", "Halloumi", "Lemon", "Olive oil"] },
  { id: "l9", name: "Asian Chicken Slaw", tag: "Lunch", glyc: "Low GI",
    why: "Crunchy non-starchy veg with lean protein.",
    items: ["Chicken breast", "Red cabbage", "Carrots", "Edamame", "Sesame oil", "Rice vinegar", "Ginger"] },
  { id: "l10", name: "Mediterranean Salmon Salad", tag: "Lunch", glyc: "Low GI",
    why: "Omega-3s plus loads of greens.",
    items: ["Salmon fillet", "Mixed greens", "Cucumber", "Olives", "Feta cheese", "Lemon", "Olive oil"] },

  /* ---------------- DINNER ---------------- */
  { id: "m5", name: "Salmon, Greens & Sweet Potato", tag: "Dinner", glyc: "Med GI",
    why: "Omega-3s help insulin sensitivity.",
    items: ["Salmon fillet", "Sweet potato", "Asparagus", "Olive oil", "Lemon", "Black pepper"] },
  { id: "m6", name: "Turkey & Bean Chili", tag: "Dinner", glyc: "Low GI",
    why: "Fiber-rich beans + lean turkey = lasting fullness.",
    items: ["Ground turkey", "Kidney beans", "Canned tomatoes", "Onion", "Garlic", "Cumin", "Chili powder"] },
  { id: "m7", name: "Tofu & Veggie Stir-Fry", tag: "Dinner", glyc: "Low GI",
    why: "Plant protein with loads of non-starchy veg.",
    items: ["Firm tofu", "Broccoli", "Snap peas", "Carrots", "Ginger", "Soy sauce (low sodium)", "Sesame oil"] },
  { id: "d8", name: "Baked Cod & Roasted Veg", tag: "Dinner", glyc: "Low GI",
    why: "Lean white fish with fiber-rich vegetables.",
    items: ["Cod fillet", "Zucchini", "Bell pepper", "Cherry tomatoes", "Olive oil", "Garlic", "Thyme"] },
  { id: "d9", name: "Chicken & Cauliflower Rice Bowl", tag: "Dinner", glyc: "Low GI",
    why: "Cauliflower rice keeps carbs and glucose low.",
    items: ["Chicken thighs", "Cauliflower rice", "Broccoli", "Garlic", "Olive oil", "Paprika"] },
  { id: "d10", name: "Shrimp & Zucchini Noodles", tag: "Dinner", glyc: "Low GI",
    why: "Light, high-protein, very low glycemic load.",
    items: ["Shrimp", "Zucchini", "Cherry tomatoes", "Garlic", "Olive oil", "Basil", "Lemon"] },
  { id: "d11", name: "Beef & Broccoli (lean)", tag: "Dinner", glyc: "Low GI",
    why: "Lean beef with non-starchy greens for satiety.",
    items: ["Lean beef strips", "Broccoli", "Garlic", "Ginger", "Soy sauce (low sodium)", "Sesame oil"] },
  { id: "d12", name: "Stuffed Bell Peppers", tag: "Dinner", glyc: "Low GI",
    why: "Lean meat and beans baked in sweet peppers.",
    items: ["Bell peppers", "Ground turkey", "Black beans", "Onion", "Canned tomatoes", "Cumin"] },
  { id: "d13", name: "Eggplant & Chickpea Curry", tag: "Dinner", glyc: "Low GI",
    why: "Fiber-rich, plant-based, and deeply satisfying.",
    items: ["Eggplant", "Chickpeas", "Canned tomatoes", "Onion", "Garlic", "Curry powder", "Coconut milk (light)"] },

  /* ---------------- SNACK ---------------- */
  { id: "m8", name: "Apple & Almond Butter", tag: "Snack", glyc: "Low GI",
    why: "Healthy fat blunts the sugar from the fruit.",
    items: ["Apple", "Almond butter"] },
  { id: "m9", name: "Hummus & Veggie Sticks", tag: "Snack", glyc: "Low GI",
    why: "Crunchy, satisfying, blood-sugar friendly.",
    items: ["Hummus", "Carrots", "Cucumber", "Celery"] },
  { id: "s10", name: "Greek Yogurt & Walnuts", tag: "Snack", glyc: "Low GI",
    why: "Protein and good fats to bridge meals.",
    items: ["Plain Greek yogurt", "Walnuts", "Cinnamon"] },
  { id: "s11", name: "Hard-Boiled Eggs & Cherry Tomatoes", tag: "Snack", glyc: "Low GI",
    why: "Portable protein with almost no carbs.",
    items: ["Eggs", "Cherry tomatoes", "Salt", "Black pepper"] },
  { id: "s12", name: "Edamame", tag: "Snack", glyc: "Low GI",
    why: "Plant protein and fiber in one handful.",
    items: ["Edamame", "Sea salt"] },
  { id: "s13", name: "Cheese & Almonds", tag: "Snack", glyc: "Low GI",
    why: "Fat + protein keep hunger and glucose steady.",
    items: ["Cheese", "Almonds"] },
  { id: "s14", name: "Cottage Cheese & Berries", tag: "Snack", glyc: "Low GI",
    why: "High-protein with a little natural sweetness.",
    items: ["Cottage cheese", "Mixed berries"] },
  { id: "s15", name: "Celery & Peanut Butter", tag: "Snack", glyc: "Low GI",
    why: "Crunchy fiber with satisfying healthy fat.",
    items: ["Celery", "Peanut butter"] },
];

const SHAKE_SLOTS = ["Breakfast", "Lunch", "Snack"]; // where a shake can land

/* Popular meal-replacement systems and their varieties (for the dropdown). */
const SHAKE_SYSTEMS = [
  { brand: "Huel", varieties: ["Powder v3.1", "Black Edition", "Ready-to-Drink", "Daily Greens"] },
  { brand: "AG1", varieties: ["Original Greens"] },
  { brand: "Soylent", varieties: ["Complete Meal Shake", "Complete Protein"] },
  { brand: "Ka'Chava", varieties: ["Chocolate", "Vanilla", "Matcha"] },
  { brand: "Owyn", varieties: ["Pro Elite", "Complete Nutrition"] },
  { brand: "Orgain", varieties: ["Organic Meal", "Protein Powder"] },
  { brand: "Garden of Life", varieties: ["Raw Organic Meal"] },
  { brand: "Vega", varieties: ["One All-in-One", "Protein"] },
  { brand: "SlimFast", varieties: ["Original Shake", "Advanced Energy"] },
  { brand: "Homemade", varieties: ["Protein & Greens Smoothie"] },
];

// build a meal-like object for a selected "Brand|Variety" key
const shakeMealFromKey = (key) => {
  const [brand, variety] = key.split("|");
  const homemade = brand === "Homemade";
  const base = variety && variety !== brand ? `${brand} ${variety}` : brand;
  const name = /shake|smoothie|drink/i.test(base) ? base : base + " Shake";
  return {
    id: "shake:" + key, name, tag: "Snack", glyc: "Low GI", shake: true,
    why: homemade
      ? "Your homemade blend — protein, greens, and good fats."
      : "Your chosen meal-replacement — quick, balanced nutrition for busy days.",
    items: homemade
      ? ["Protein powder", "Spinach", "Unsweetened almond milk", "Nut butter", "Ice"]
      : [base, "Water or unsweetened milk", "Ice"],
  };
};
const shakeMeals = (data) => (data.shakeSystems || []).map(shakeMealFromKey);

// all selectable options for a slot (adds shakes to shake-slots when toggle is on)
const optionsForSlot = (data, slot) => {
  const base = MEALS.filter((m) => m.tag === slot && !m.shake);
  if (data.shakesOn && SHAKE_SLOTS.includes(slot)) return [...base, ...shakeMeals(data)];
  return base;
};
// find a meal by id across the fixed library and the user's shakes
const findMeal = (data, id) =>
  MEALS.find((m) => m.id === id) || shakeMeals(data).find((m) => m.id === id);

/* ------------------------- EXERCISE PLANS -------------------------- */
/* Three variants per day, chosen by the user's equipment:
   "bodyweight" (no gear), "home" (dumbbells/bands), "gym" (full access). */
const EQUIPMENT_OPTIONS = [
  { id: "dumbbells", label: "Dumbbells" },
  { id: "bands", label: "Resistance bands" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "pullup", label: "Pull-up bar" },
  { id: "bench", label: "Bench" },
  { id: "bike", label: "Bike / cardio machine" },
];

const WORKOUTS_BY_SETUP = {
  bodyweight: [
    { day: "Mon", title: "Walk + Core", focus: "Cardio", mins: 30, icon: Footprints,
      moves: ["20 min brisk walk", "3× 30s plank", "2× 15 dead bugs", "2× 20 glute bridges"] },
    { day: "Tue", title: "Bodyweight Strength", focus: "Strength", mins: 30, icon: Dumbbell,
      moves: ["3× 12 squats", "3× 8 push-ups (knees ok)", "3× 12 reverse lunges", "3× 30s wall sit"] },
    { day: "Wed", title: "Recovery Walk + Stretch", focus: "Mobility", mins: 25, icon: Leaf,
      moves: ["25 min easy walk", "Full-body stretch flow", "5 min deep breathing"] },
    { day: "Thu", title: "Cardio Intervals", focus: "Cardio", mins: 25, icon: Flame,
      moves: ["5 min warm-up", "8× (30s fast walk-jog / 90s easy)", "5 min cool-down"] },
    { day: "Fri", title: "Bodyweight Circuit", focus: "Strength", mins: 30, icon: Dumbbell,
      moves: ["3 rounds:", "15 squats", "10 incline push-ups", "20 step-ups", "30s plank"] },
    { day: "Sat", title: "Long Walk / Hike", focus: "Cardio", mins: 45, icon: Footprints,
      moves: ["45 min walk, hike, or bike", "Fresh air + nature"] },
    { day: "Sun", title: "Rest & Restore", focus: "Rest", mins: 15, icon: HeartPulse,
      moves: ["Gentle stretching", "Meal prep for the week", "Plan & celebrate wins"] },
  ],
  home: [
    { day: "Mon", title: "Walk + Core", focus: "Cardio", mins: 30, icon: Footprints,
      moves: ["20 min brisk walk", "3× 40s plank", "3× 15 dead bugs", "3× 20 glute bridges"] },
    { day: "Tue", title: "Dumbbell Upper Body", focus: "Strength", mins: 35, icon: Dumbbell,
      moves: ["3× 10 dumbbell press", "3× 10 rows", "3× 12 shoulder press", "3× 12 bicep curls"] },
    { day: "Wed", title: "Recovery Walk + Stretch", focus: "Mobility", mins: 25, icon: Leaf,
      moves: ["25 min easy walk", "Band shoulder mobility", "5 min deep breathing"] },
    { day: "Thu", title: "Cardio + Bands", focus: "Cardio", mins: 30, icon: Flame,
      moves: ["5 min warm-up", "8× (30s fast / 90s easy)", "3× 15 band pull-aparts"] },
    { day: "Fri", title: "Dumbbell Lower Body", focus: "Strength", mins: 35, icon: Dumbbell,
      moves: ["3× 10 goblet squats", "3× 10 dumbbell RDLs", "3× 12 lunges", "3× 15 calf raises"] },
    { day: "Sat", title: "Long Walk / Hike", focus: "Cardio", mins: 45, icon: Footprints,
      moves: ["45 min walk, hike, or bike", "Optional band circuit"] },
    { day: "Sun", title: "Rest & Restore", focus: "Rest", mins: 15, icon: HeartPulse,
      moves: ["Gentle stretching", "Meal prep for the week", "Plan & celebrate wins"] },
  ],
  gym: [
    { day: "Mon", title: "Cardio + Core", focus: "Cardio", mins: 35, icon: Footprints,
      moves: ["25 min incline treadmill / bike", "3× 45s plank", "3× 15 cable crunches"] },
    { day: "Tue", title: "Push Day", focus: "Strength", mins: 45, icon: Dumbbell,
      moves: ["3× 10 chest press", "3× 10 shoulder press", "3× 12 incline DB press", "3× 12 triceps pushdown"] },
    { day: "Wed", title: "Recovery + Mobility", focus: "Mobility", mins: 30, icon: Leaf,
      moves: ["20 min easy cardio", "Foam rolling", "Full-body stretch", "5 min breathing"] },
    { day: "Thu", title: "Intervals (Machine)", focus: "Cardio", mins: 30, icon: Flame,
      moves: ["5 min warm-up", "10× (30s hard / 90s easy) bike or rower", "5 min cool-down"] },
    { day: "Fri", title: "Pull + Legs", focus: "Strength", mins: 45, icon: Dumbbell,
      moves: ["3× 10 lat pulldown", "3× 10 seated row", "3× 10 leg press", "3× 12 leg curl", "3× 15 calf raise"] },
    { day: "Sat", title: "Long Cardio / Class", focus: "Cardio", mins: 45, icon: Footprints,
      moves: ["45 min walk, hike, bike, or a class", "Keep it enjoyable"] },
    { day: "Sun", title: "Rest & Restore", focus: "Rest", mins: 15, icon: HeartPulse,
      moves: ["Gentle stretching", "Meal prep for the week", "Plan & celebrate wins"] },
  ],
};

// Pick the active plan from the user's profile
const planFor = (profile) => {
  if (profile?.gym) return WORKOUTS_BY_SETUP.gym;
  const gear = profile?.equipment || [];
  const hasStrengthGear = gear.some((g) => ["dumbbells", "bands", "kettlebell"].includes(g));
  return hasStrengthGear ? WORKOUTS_BY_SETUP.home : WORKOUTS_BY_SETUP.bodyweight;
};

/* ---- PROGRESSION ENGINE -------------------------------------------
   3 build weeks then 1 genuinely-easy deload. The ceiling rises gently
   for ~2 months (2 cycles) then plateaus, so it never escalates forever.
   Returns scaling info for any given date relative to the program start. */
const CYCLE_CAP = 2; // plateau after ~2 cycles (~8 weeks)
function weekInfo(profile, dateStr) {
  const start = profile?.startedAt ? new Date(profile.startedAt + "T00:00") : new Date();
  start.setHours(0, 0, 0, 0);
  const day = new Date((dateStr || todayStr()) + "T00:00");
  const weeksSince = Math.max(0, Math.floor((day - start) / (7 * 86400000)));
  const cycle = Math.floor(weeksSince / 4);
  const wk = weeksSince % 4;            // 0,1,2 = build · 3 = deload
  const base = Math.min(cycle, CYCLE_CAP);
  const isDeload = wk === 3;
  const level = isDeload ? Math.max(0, base - 1) : base + wk;
  const timeFactor = isDeload ? 0.85 : Math.min(1 + 0.06 * level, 1.24);
  const repNote = isDeload
    ? "Deload week — go lighter: drop a set and keep an easy pace. Recovery is where you get stronger. 🌿"
    : level === 0
      ? "Week 1 pace — follow the moves as written and focus on good form."
      : `Step it up: add ${Math.min(level * 2, 6)} reps per set (or +1 set on the main lifts).`;
  return {
    weeksSince, cycle, wk, level, isDeload, timeFactor, repNote,
    phase: isDeload ? "Deload week" : `Build week ${wk + 1} of 3`,
    weekLabel: `Week ${weeksSince + 1}`,
    capped: cycle >= CYCLE_CAP,
  };
}
const scaledMins = (mins, info) => Math.round(mins * info.timeFactor);

const focusColor = (f) =>
  ({ Cardio: C.coral, Strength: C.sage, Mobility: C.sky, Rest: C.sun }[f] || C.sage);

/* ------------------------- AFFIRMATIONS --------------------------- */
const AFFIRMATIONS = [
  "I am becoming healthier every single day.",
  "My body is strong, capable, and worth caring for.",
  "Small steps today create big changes tomorrow.",
  "I choose foods that help me feel my best.",
  "I am proud of the progress I'm making.",
  "I deserve to feel good in my own body.",
  "Every healthy choice is a gift to my future self.",
  "I am patient and kind with myself on this journey.",
  "My energy grows as I take care of myself.",
  "I am in control of my habits and my health.",
  "Today I move my body with gratitude.",
  "I drink water and nourish myself with love.",
  "Rest is part of my strength, not a weakness.",
  "I celebrate how far I've already come.",
  "I am calm, focused, and ready for today.",
  "My cravings pass; my goals remain.",
  "I trust myself to make good choices.",
  "Each breath brings me peace and clarity.",
  "I am worthy of health, joy, and vitality.",
  "Progress, not perfection, is my path.",
  "I show up for myself, one day at a time.",
  "My future self is thanking me right now.",
  "I release stress and welcome calm.",
  "I am stronger than my excuses.",
  "Healthy is something I get to be, not have to be.",
  "I honor my body with movement and rest.",
  "I am exactly where I need to be today.",
  "Every glass of water is a small act of self-love.",
  "I greet today with energy and optimism.",
  "I am the author of my own well-being.",
];

// deterministic shuffle from a seed so each day is stable but varied
const pickFive = (seed) => {
  const arr = AFFIRMATIONS.map((t, i) => ({ t, r: Math.sin(seed * 9301 + i * 49297) }));
  arr.sort((a, b) => a.r - b.r);
  return arr.slice(0, 5).map((x) => x.t);
};

/* ------------------------- DEFAULT STATE -------------------------- */
const DEFAULT = {
  profile: { name: "", start: 200, current: 200, goalPct: 20, gym: false, equipment: [], startedAt: "" },
  weightLog: [],
  alcohol: {},
  glucose: [],
  water: {},
  meals: { Breakfast: "m1", Lunch: "m3", Dinner: "m5", Snack: "m8" },
  workoutsDone: {},
  checked: {},
  meditationLog: {},
  bellOn: true,
  shakesOn: false,
  shakeSystems: [], // ["Huel|Black Edition", ...]
  dayPlans: {}, // { 'YYYY-MM-DD': { meals: {...}, notes: "" } }
};

/* ============================ APP ============================ */
export default function App() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(STORE_KEY);
        if (r && r.value) {
          const parsed = JSON.parse(r.value);
          setData({ ...DEFAULT, ...parsed });
          if (!parsed.profile?.name) setShowSetup(true);
        } else setShowSetup(true);
      } catch { setShowSetup(true); }
      setLoaded(true);
    })();
  }, []);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const save = async (next) => {
    setData(next);
    dataRef.current = next;
    await storage.set(STORE_KEY, JSON.stringify(next));
  };

  if (!loaded)
    return (
      <div style={{ background: C.bg, color: C.sage, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Logo size={56} /></div>
          <div style={{ letterSpacing: 4, fontSize: 22, fontWeight: 800 }}>BODLY</div>
          <div style={{ fontSize: 13, fontFamily: "sans-serif", color: C.mute, marginTop: 6 }}>Loading your journey…</div>
        </div>
      </div>
    );

  return (
    <div style={{
      fontFamily: "'Avenir Next','Segoe UI',system-ui,sans-serif",
      background: `radial-gradient(120% 80% at 50% -10%, #1c3326 0%, ${C.bg} 55%)`,
      color: C.cream, minHeight: "100vh", maxWidth: 440, margin: "0 auto",
      position: "relative", overflowX: "hidden",
    }}>
      <Header data={data} />
      <div style={{ padding: "0 18px 120px" }}>
        {tab === "home" && <HomeTab data={data} save={save} setTab={setTab} openSetup={() => setShowSetup(true)} />}
        {tab === "weight" && <WeightTab data={data} save={save} />}
        {tab === "habits" && <HabitsTab data={data} save={save} />}
        {tab === "meals" && <MealsTab data={data} save={save} />}
        {tab === "move" && <MoveTab data={data} save={save} />}
        {tab === "calm" && <CalmTab data={data} save={save} />}
        {tab === "plan" && <PlanTab data={data} save={save} />}
        {tab === "feels" && <FeelsTab data={data} save={save} />}
      </div>
      <NavBar tab={tab} setTab={setTab} />
      {showSetup && <Setup data={data} save={save} close={() => setShowSetup(false)} />}
    </div>
  );
}

/* --------------------------- HEADER ------------------------------ */
function Header({ data }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const [taps, setTaps] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [fact, setFact] = useState("");
  const [wink, setWink] = useState(false);
  const pressTimer = useRef(null);

  const onLogoTap = () => {
    const n = taps + 1;
    setTaps(n);
    if (n >= 5) {
      setTaps(0);
      setConfetti(true);
      setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
      setTimeout(() => setConfetti(false), 2200);
      setTimeout(() => setFact(""), 6000);
    }
  };
  // long-press → Vitruvian wink (little arm wave)
  const startPress = () => { pressTimer.current = setTimeout(() => setWink(true), 550); };
  const endPress = () => { clearTimeout(pressTimer.current); if (wink) setTimeout(() => setWink(false), 900); };

  return (
    <div style={{ padding: "26px 20px 14px" }}>
      <Confetti go={confetti} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sage, fontSize: 14, letterSpacing: 3, textTransform: "uppercase", fontWeight: 800 }}>
        <span
          onClick={onLogoTap}
          onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
          onTouchStart={startPress} onTouchEnd={endPress}
          style={{ cursor: "pointer", display: "inline-flex", transition: "transform .2s", transform: wink ? "rotate(-8deg) scale(1.1)" : "none", userSelect: "none" }}
        >
          <Logo size={28} />
        </span>
        Bodly
      </div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 26, marginTop: 6, lineHeight: 1.15 }}>
        {greet}{data.profile.name ? `, ${data.profile.name}` : ""}.
      </div>
      <div style={{ color: C.mute, fontSize: 14, marginTop: 2 }}>One steady step at a time. 🌿</div>
      {fact && (
        <div style={{
          marginTop: 12, background: C.card2, border: `1px solid ${C.sun}`, borderRadius: 14, padding: "12px 14px",
          fontSize: 13, color: C.sun, animation: "bodlyfade .4s ease",
        }}>
          <span style={{ fontWeight: 700 }}>🥚 You found a secret!</span> {fact}
          <style>{`@keyframes bodlyfade { from { opacity: 0; transform: translateY(-6px);} to {opacity:1; transform:none;} }`}</style>
        </div>
      )}
    </div>
  );
}

/* ---------------------- EASTER EGGS ------------------------------ */
const FUN_FACTS = [
  "Da Vinci's Vitruvian Man is ~500 years old — and still doing push-ups. 💪",
  "Drinking water can give your metabolism a tiny temporary boost. 💧",
  "Muscle burns more calories at rest than fat does. 🔥",
  "Laughing for 15 minutes can burn up to 40 calories. 😄",
  "Your body has enough iron to make a small nail. 🔩",
  "Walking after meals can blunt blood-sugar spikes. 🚶",
  "Strong legs are linked to a sharper brain as we age. 🧠",
  "It takes ~12 muscles to smile. Go ahead, try one. 🙂",
  "Cold water can wake you up better than you'd think. ❄️",
  "Consistency beats intensity — you're proof. 🌱",
];

function Confetti({ go }) {
  if (!go) return null;
  const bits = Array.from({ length: 28 });
  const colors = [C.sage, C.sun, C.coral, C.sky, C.sageDeep];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60, overflow: "hidden" }}>
      {bits.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const dur = 1.1 + Math.random() * 0.8;
        const size = 6 + Math.random() * 8;
        const col = colors[i % colors.length];
        return (
          <div key={i} style={{
            position: "absolute", top: "-20px", left: left + "%", width: size, height: size,
            background: col, borderRadius: i % 2 ? "50%" : 2,
            animation: `bodlyfall ${dur}s ${delay}s ease-in forwards`,
          }} />
        );
      })}
      <style>{`@keyframes bodlyfall {
        0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(540deg); opacity: 0; }
      }`}</style>
    </div>
  );
}

/* ---------------------------- CARD ------------------------------- */
const Card = ({ children, style }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.line}`, borderRadius: 22,
    padding: 18, marginBottom: 14, boxShadow: "0 8px 24px rgba(0,0,0,.25)", ...style,
  }}>{children}</div>
);

const SectionTitle = ({ icon: Ic, children, color = C.sage }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    {Ic && <Ic size={18} color={color} />}
    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: .3 }}>{children}</span>
  </div>
);

/* ---------------------------- HOME ------------------------------- */
function HomeTab({ data, save, setTab, openSetup }) {
  const { profile } = data;
  const goalWeight = +(profile.start * (1 - profile.goalPct / 100)).toFixed(1);
  const lost = +(profile.start - profile.current).toFixed(1);
  const target = +(profile.start - goalWeight).toFixed(1);
  const pct = target > 0 ? Math.min(100, Math.max(0, (lost / target) * 100)) : 0;

  const dryToday = !(data.alcohol[todayStr()] > 0);
  const waterToday = data.water[todayStr()] || 0;
  const workoutToday = planFor(data.profile)[(new Date().getDay() + 6) % 7];
  const wkey = todayStr() + "-" + workoutToday.day;
  const workoutDone = !!data.workoutsDone[wkey];

  return (
    <>
      <Card style={{ background: `linear-gradient(135deg, ${C.card2}, ${C.card})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionTitle icon={Trophy} color={C.sun}>Weight Goal</SectionTitle>
          <button onClick={openSetup} style={ghostBtn}>Edit</button>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 6 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 40, color: C.sage }}>{lost}</span>
          <span style={{ color: C.mute, marginBottom: 8 }}>of {target} lbs lost</span>
        </div>
        <Progress pct={pct} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: C.mute }}>
          <span>Start {profile.start}</span>
          <span style={{ color: C.sun }}>{pct.toFixed(0)}% there 🎯</span>
          <span>Goal {goalWeight}</span>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <MiniStat icon={Wine} color={C.coral} label="Today" value={dryToday ? "Alcohol-free" : `${data.alcohol[todayStr()]} drink(s)`} ok={dryToday} onClick={() => setTab("habits")} />
        <MiniStat icon={workoutToday.icon} color={focusColor(workoutToday.focus)} label={workoutToday.day + " workout"} value={workoutDone ? "Done ✓" : workoutToday.title} ok={workoutDone} onClick={() => setTab("move")} />
      </div>

      <WaterCard data={data} save={save} />

      <Card>
        <SectionTitle icon={Sparkles} color={C.sky}>Today's Focus</SectionTitle>
        <Focus done={pct > 0} text="Log your weight to track the trend" onClick={() => setTab("weight")} />
        <Focus done={dryToday} text="Stay alcohol-free (or log mindfully)" onClick={() => setTab("habits")} />
        <Focus done={waterToday >= WATER_GOAL} text={`Drink water (${waterToday}/${WATER_GOAL} glasses)`} onClick={() => {}} />
        <Focus done={workoutDone} text={`Move: ${workoutToday.title}`} onClick={() => setTab("move")} />
        <Focus done={false} text="Eat from your healthy meal plan" onClick={() => setTab("meals")} />
        <Focus done={false} text="Take a mindful moment" onClick={() => setTab("calm")} last />
      </Card>

      <div style={{ fontSize: 11, color: C.mute, textAlign: "center", lineHeight: 1.6, padding: "4px 14px" }}>
        Bodly supports healthy habits but isn't medical advice. For prediabetes and weight goals,
        please partner with your doctor — especially before big changes. 💚
      </div>
    </>
  );
}

const Progress = ({ pct }) => (
  <div style={{ height: 12, borderRadius: 10, background: C.line, overflow: "hidden" }}>
    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 10, background: `linear-gradient(90deg, ${C.sageDeep}, ${C.sage})`, transition: "width .5s" }} />
  </div>
);

const MiniStat = ({ icon: Ic, color, label, value, ok, onClick }) => (
  <div onClick={onClick} style={{
    background: C.card, border: `1px solid ${ok ? color : C.line}`, borderRadius: 18, padding: 14, cursor: "pointer",
  }}>
    <Ic size={18} color={color} />
    <div style={{ fontSize: 11, color: C.mute, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
  </div>
);

const Focus = ({ done, text, onClick, last }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 12, padding: "11px 0",
    borderBottom: last ? "none" : `1px solid ${C.line}`, cursor: "pointer",
  }}>
    <div style={{
      width: 22, height: 22, borderRadius: 8, display: "grid", placeItems: "center",
      background: done ? C.sageDeep : "transparent", border: `1.5px solid ${done ? C.sageDeep : C.mute}`,
    }}>{done && <Check size={14} color="#fff" />}</div>
    <span style={{ flex: 1, fontSize: 14, color: done ? C.mute : C.cream, textDecoration: done ? "line-through" : "none" }}>{text}</span>
    <ChevronRight size={16} color={C.mute} />
  </div>
);

/* --------------------------- WEIGHT ------------------------------ */
function WeightTab({ data, save }) {
  const valRef = useRef(null);
  const goalWeight = +(data.profile.start * (1 - data.profile.goalPct / 100)).toFixed(1);
  const log = [...data.weightLog].sort((a, b) => a.date.localeCompare(b.date));
  const chart = log.map((e) => ({ date: fmtDay(e.date), w: e.weight }));

  const add = () => {
    const w = parseFloat(valRef.current?.value);
    if (!w || w < 40 || w > 1000) return;
    const d = todayStr();
    const wl = data.weightLog.filter((e) => e.date !== d).concat({ date: d, weight: w });
    save({ ...data, weightLog: wl, profile: { ...data.profile, current: w } });
    if (valRef.current) valRef.current.value = "";
  };

  return (
    <>
      <Card>
        <SectionTitle icon={TrendingDown}>Log Today's Weight</SectionTitle>
        <div style={{ display: "flex", gap: 10 }}>
          <input ref={valRef} type="number" inputMode="decimal" placeholder="lbs" style={inputStyle} />
          <button onClick={add} style={primaryBtn}>Save</button>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Sparkles} color={C.sky}>Your Trend</SectionTitle>
        {chart.length < 2 ? (
          <div style={{ color: C.mute, fontSize: 14, textAlign: "center", padding: "24px 0" }}>
            Log a few days to see your beautiful downward trend. 📉
          </div>
        ) : (
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chart} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="date" stroke={C.mute} fontSize={11} tickLine={false} />
                <YAxis stroke={C.mute} fontSize={11} domain={["dataMin - 3", "dataMax + 3"]} tickLine={false} />
                <Tooltip contentStyle={{ background: C.card2, border: `1px solid ${C.line}`, borderRadius: 12, color: C.cream }} />
                <ReferenceLine y={goalWeight} stroke={C.sun} strokeDasharray="4 4" label={{ value: "Goal", fill: C.sun, fontSize: 11 }} />
                <Line type="monotone" dataKey="w" stroke={C.sage} strokeWidth={3} dot={{ r: 3, fill: C.sage }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 8 }}>
          A steady 1–2 lbs per week is the healthy, lasting pace. 🌱
        </div>
      </Card>
    </>
  );
}

/* --------------------------- HABITS ------------------------------ */
function HabitsTab({ data, save }) {
  const d = todayStr();
  const drinks = data.alcohol[d] || 0;
  const setDrinks = (n) => save({ ...data, alcohol: { ...data.alcohol, [d]: Math.max(0, n) } });

  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const day = new Date(); day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    if (!(data.alcohol[key] > 0)) streak++; else break;
  }

  const gRef = useRef(null);
  const glucose = [...data.glucose].sort((a, b) => a.date.localeCompare(b.date)).slice(-10);
  const addG = () => {
    const v = parseFloat(gRef.current?.value);
    if (!v || v < 40 || v > 500) return;
    save({ ...data, glucose: data.glucose.filter((e) => e.date !== d).concat({ date: d, value: v }) });
    if (gRef.current) gRef.current.value = "";
  };

  return (
    <>
      <Card style={{ background: `linear-gradient(135deg,#2a1f1c,${C.card})` }}>
        <SectionTitle icon={Wine} color={C.coral}>Alcohol — Today</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, padding: "8px 0" }}>
          <button onClick={() => setDrinks(drinks - 1)} style={roundBtn}><Minus size={20} /></button>
          <div style={{ textAlign: "center", minWidth: 70 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 44, color: drinks ? C.coral : C.sage }}>{drinks}</div>
            <div style={{ fontSize: 12, color: C.mute }}>{drinks === 0 ? "alcohol-free 🎉" : "drink(s)"}</div>
          </div>
          <button onClick={() => setDrinks(drinks + 1)} style={roundBtn}><Plus size={20} /></button>
        </div>
        <div style={{
          background: streak >= 7 ? "linear-gradient(135deg,#3a2c10," + C.card2 + ")" : C.card2,
          borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginTop: 6,
          border: streak >= 7 ? `1px solid ${C.sun}` : "none",
        }}>
          <Flame size={20} color={C.sun} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.sun }}>{streak} day{streak === 1 ? "" : "s"}</div>
            <div style={{ fontSize: 12, color: C.mute }}>alcohol-free streak</div>
          </div>
          {streak >= 7 && (
            <span style={{
              background: C.sun, color: "#2a1f08", fontWeight: 800, fontSize: 12, padding: "6px 12px",
              borderRadius: 20, letterSpacing: .5, boxShadow: `0 0 14px ${C.sun}66`,
            }}>🔥 ON FIRE</span>
          )}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Droplet} color={C.sky}>Blood Sugar Log</SectionTitle>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input ref={gRef} type="number" inputMode="decimal" placeholder="mg/dL" style={inputStyle} />
          <button onClick={addG} style={primaryBtn}>Log</button>
        </div>
        {glucose.length === 0 ? (
          <div style={{ color: C.mute, fontSize: 14, textAlign: "center", padding: "8px 0" }}>
            Track fasting glucose to watch it improve over time.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {glucose.slice().reverse().map((e) => {
              const status = e.value < 100 ? C.sage : e.value < 126 ? C.sun : C.coral;
              return (
                <div key={e.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.card2, borderRadius: 12 }}>
                  <span style={{ color: C.mute, fontSize: 13 }}>{fmtDay(e.date)}</span>
                  <span style={{ fontWeight: 700, color: status }}>{e.value} mg/dL</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ fontSize: 11, color: C.mute, marginTop: 10, lineHeight: 1.5 }}>
          General reference: under 100 fasting is typical; 100–125 is the prediabetes range.
          Always confirm targets with your doctor. 💙
        </div>
      </Card>

      <WaterCard data={data} save={save} />
    </>
  );
}

/* ---------------------------- WATER ------------------------------ */
function WaterCard({ data, save }) {
  const d = todayStr();
  const cups = data.water[d] || 0;
  const set = (n) => save({ ...data, water: { ...data.water, [d]: Math.max(0, Math.min(20, n)) } });
  const pct = Math.min(100, (cups / WATER_GOAL) * 100);

  return (
    <Card style={{ background: `linear-gradient(135deg,#142a31,${C.card})` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle icon={GlassWater} color={C.sky}>Hydration</SectionTitle>
        <span style={{ fontSize: 13, color: C.mute }}>{cups}/{WATER_GOAL} glasses</span>
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "4px 0 14px" }}>
        {Array.from({ length: WATER_GOAL }).map((_, i) => (
          <div key={i} onClick={() => set(i < cups ? i : i + 1)} style={{
            width: 30, height: 38, borderRadius: "5px 5px 9px 9px", cursor: "pointer",
            border: `2px solid ${C.sky}`, background: i < cups ? C.sky : "transparent",
            transition: "background .2s", opacity: i < cups ? 1 : 0.4,
          }} />
        ))}
      </div>
      <div style={{ height: 8, borderRadius: 8, background: C.line, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: C.sky, transition: "width .3s" }} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={() => set(cups - 1)} style={{ ...ghostBtn, flex: 1, padding: "9px" }}>− Remove</button>
        <button onClick={() => set(cups + 1)} style={{ ...primaryBtn, flex: 1, padding: "9px" }}>+ Add glass</button>
      </div>
      {cups >= WATER_GOAL && cups < 12 && <div style={{ textAlign: "center", color: C.sky, fontSize: 13, marginTop: 10 }}>Goal reached — beautifully hydrated! 💧</div>}
      {cups >= 12 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontSize: 22, letterSpacing: 2, animation: "bodlywave 1.2s ease-in-out infinite" }}>🌊🌊🌊</div>
          <div style={{ color: C.sky, fontSize: 13, marginTop: 4, fontWeight: 700 }}>
            Whoa — Aquaman mode! 🐟 You're a hydration legend.
          </div>
          <style>{`@keyframes bodlywave { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
        </div>
      )}
    </Card>
  );
}

/* ---------------------------- MEALS ------------------------------ */
function MealsTab({ data, save }) {
  const slots = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const shakesOn = !!data.shakesOn;
  const systems = data.shakeSystems || [];

  const setMeal = (slot, id) => save({ ...data, meals: { ...data.meals, [slot]: id } });

  const hasShakeToday = slots.some((s) => findMeal(data, data.meals[s])?.shake);

  // place one of the user's shakes into a sensible slot
  const injectShake = (meals, dataWithSystems) => {
    const shakes = shakeMeals(dataWithSystems);
    if (!shakes.length) return meals;
    for (const slot of SHAKE_SLOTS) { meals[slot] = shakes[0].id; return meals; }
    return meals;
  };

  const toggleShakes = () => {
    const on = !shakesOn;
    let meals = { ...data.meals };
    let next = { ...data, shakesOn: on };
    if (on && systems.length && !slots.some((s) => findMeal(next, meals[s])?.shake)) {
      meals = injectShake(meals, next);
    }
    if (!on) {
      slots.forEach((slot) => {
        if (findMeal(data, meals[slot])?.shake) {
          const alt = MEALS.find((m) => m.tag === slot && !m.shake);
          if (alt) meals[slot] = alt.id;
        }
      });
    }
    save({ ...next, meals });
  };

  const toggleSystem = (key) => {
    const has = systems.includes(key);
    const nextSystems = has ? systems.filter((s) => s !== key) : [...systems, key];
    let meals = { ...data.meals };
    let next = { ...data, shakeSystems: nextSystems, shakesOn: true };
    // if a shake is currently selected but its system was just removed, swap it out
    slots.forEach((slot) => {
      const cur = meals[slot];
      if (cur?.startsWith("shake:") && !nextSystems.includes(cur.slice(6))) {
        const alt = MEALS.find((m) => m.tag === slot && !m.shake);
        if (alt) meals[slot] = alt.id;
      }
    });
    // ensure at least one shake is in the day once a system is chosen
    if (nextSystems.length && !slots.some((s) => findMeal(next, meals[s])?.shake)) {
      meals = injectShake(meals, next);
    }
    save({ ...next, meals });
  };

  const shoppingItems = useMemo(() => {
    const set = new Set();
    slots.forEach((s) => {
      const m = findMeal(data, data.meals[s]);
      if (m) m.items.forEach((i) => set.add(i));
    });
    return [...set].sort();
  }, [data.meals, data.shakeSystems]);

  const toggle = (item) => save({ ...data, checked: { ...data.checked, [item]: !data.checked[item] } });

  return (
    <>
      {/* shake toggle + brand picker */}
      <Card style={{ background: `linear-gradient(135deg,${C.card2},${C.card})` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Meal-replacement shakes</div>
            <div style={{ fontSize: 12.5, color: C.mute, marginTop: 2 }}>
              Pick the systems you use — we'll keep at least one in your day.
            </div>
          </div>
          <Switch on={shakesOn} onClick={toggleShakes} />
        </div>
        {shakesOn && (
          <div style={{ marginTop: 14 }}>
            <ShakePicker systems={systems} onToggle={toggleSystem} />
          </div>
        )}
      </Card>

      {slots.map((slot) => {
        const meal = findMeal(data, data.meals[slot]);
        const options = optionsForSlot(data, slot);
        return (
          <Card key={slot}>
            <SectionTitle icon={UtensilsCrossed}>{slot}</SectionTitle>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 19 }}>{meal?.name}</div>
            <div style={{ display: "flex", gap: 8, margin: "8px 0", flexWrap: "wrap" }}>
              <Pill color={C.sageDeep}>{meal?.glyc}</Pill>
              {meal?.shake && <Pill color={C.sky}>Shake</Pill>}
            </div>
            <div style={{ color: C.mute, fontSize: 13, marginBottom: 12 }}>{meal?.why}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {options.map((o) => (
                <button key={o.id} onClick={() => setMeal(slot, o.id)} style={{
                  ...chipBtn, borderColor: o.id === meal?.id ? C.sage : C.line,
                  color: o.id === meal?.id ? C.sage : (o.shake ? C.sky : C.mute),
                }}>{o.shake ? "🥤 " : ""}{o.name.split(" ").slice(0, 2).join(" ")}</button>
              ))}
            </div>
          </Card>
        );
      })}

      {shakesOn && systems.length === 0 && (
        <div style={{ fontSize: 12, color: C.sun, textAlign: "center", marginBottom: 14 }}>
          Choose a shake system above to add it to your day.
        </div>
      )}

      <Card style={{ background: `linear-gradient(135deg,${C.card2},${C.card})` }}>
        <SectionTitle icon={ShoppingCart} color={C.sun}>Shopping List</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {shoppingItems.map((item) => (
            <div key={item} onClick={() => toggle(item)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", cursor: "pointer" }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center",
                background: data.checked[item] ? C.sageDeep : "transparent", border: `1.5px solid ${data.checked[item] ? C.sageDeep : C.mute}`,
              }}>{data.checked[item] && <Check size={13} color="#fff" />}</div>
              <span style={{ fontSize: 14, textDecoration: data.checked[item] ? "line-through" : "none", color: data.checked[item] ? C.mute : C.cream }}>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* dropdown to choose meal-replacement systems & varieties */
function ShakePicker({ systems, onToggle }) {
  const [open, setOpen] = useState(false);
  const count = systems.length;
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: C.card2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 14px",
        color: C.cream, cursor: "pointer", fontSize: 14,
      }}>
        <span>{count ? `${count} system${count > 1 ? "s" : ""} selected` : "Choose your shake systems"}</span>
        <ChevronDown size={18} color={C.mute} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>

      {/* selected chips */}
      {count > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {systems.map((k) => {
            const [brand, variety] = k.split("|");
            return (
              <span key={k} onClick={() => onToggle(k)} style={{
                display: "flex", alignItems: "center", gap: 6, background: C.sky + "22", color: C.sky,
                borderRadius: 16, padding: "5px 10px", fontSize: 12, cursor: "pointer",
              }}>🥤 {brand}{variety && variety !== brand ? ` · ${variety}` : ""} <X size={13} /></span>
            );
          })}
        </div>
      )}

      {/* expandable list */}
      {open && (
        <div style={{ marginTop: 10, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
          {SHAKE_SYSTEMS.map((sys) => (
            <div key={sys.brand} style={{ borderBottom: `1px solid ${C.line}` }}>
              <div style={{ padding: "10px 14px 4px", fontSize: 12, color: C.mute, textTransform: "uppercase", letterSpacing: 1 }}>{sys.brand}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 12px 12px" }}>
                {sys.varieties.map((v) => {
                  const key = `${sys.brand}|${v}`;
                  const on = systems.includes(key);
                  return (
                    <button key={key} onClick={() => onToggle(key)} style={{
                      ...chipBtn, padding: "6px 11px", fontSize: 12,
                      borderColor: on ? C.sky : C.line, color: on ? C.sky : C.mute,
                    }}>{on ? "✓ " : ""}{v}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Pill = ({ children, color }) => (
  <span style={{ background: color + "33", color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, letterSpacing: .5 }}>{children}</span>
);

/* a small iOS-style toggle switch */
const Switch = ({ on, onClick }) => (
  <button onClick={onClick} style={{
    width: 52, height: 30, borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
    background: on ? C.sageDeep : C.line, position: "relative", transition: "background .2s",
  }}>
    <span style={{
      position: "absolute", top: 3, left: on ? 25 : 3, width: 24, height: 24, borderRadius: "50%",
      background: "#fff", transition: "left .2s",
    }} />
  </button>
);

/* ----------------------------- MOVE ------------------------------ */
function MoveTab({ data, save }) {
  const todayIdx = (new Date().getDay() + 6) % 7;
  const plan = planFor(data.profile);
  const toggle = (day) => {
    const key = todayStr() + "-" + day;
    save({ ...data, workoutsDone: { ...data.workoutsDone, [key]: !data.workoutsDone[key] } });
  };
  const doneCount = plan.filter((w) => data.workoutsDone[todayStr() + "-" + w.day]).length;

  const setGym = (gym) => save({ ...data, profile: { ...data.profile, gym } });
  const toggleGear = (id) => {
    const cur = data.profile.equipment || [];
    const next = cur.includes(id) ? cur.filter((g) => g !== id) : [...cur, id];
    save({ ...data, profile: { ...data.profile, equipment: next } });
  };
  const gym = !!data.profile.gym;
  const gear = data.profile.equipment || [];
  const setupName = gym ? "Gym" : (gear.some((g) => ["dumbbells", "bands", "kettlebell"].includes(g)) ? "Home gym" : "Bodyweight");
  const info = weekInfo(data.profile);

  return (
    <>
      <Card style={{ background: `linear-gradient(135deg,#2a221c,${C.card})` }}>
        <SectionTitle icon={Dumbbell} color={C.coral}>Your Weekly Plan</SectionTitle>
        <div style={{ color: C.mute, fontSize: 14 }}>
          A balanced mix of cardio, strength, and recovery — adapted to your setup
          (<span style={{ color: C.sage }}>{setupName}</span>).
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: C.sun }}>
          {doneCount} workout{doneCount === 1 ? "" : "s"} completed today's check-ins ✨
        </div>
      </Card>

      {/* progression banner */}
      <Card style={{ borderColor: info.isDeload ? C.sky : C.line }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{info.weekLabel}</span>
          <Pill color={info.isDeload ? C.sky : C.sageDeep}>{info.phase}</Pill>
        </div>
        <div style={{ fontSize: 13, color: info.isDeload ? C.sky : C.cream, lineHeight: 1.45 }}>{info.repNote}</div>
        {info.capped && !info.isDeload && (
          <div style={{ fontSize: 11, color: C.mute, marginTop: 8 }}>
            You've reached a strong, steady level — we hold here to keep it sustainable. 💪
          </div>
        )}
      </Card>

      {/* equipment chooser */}
      <Card>
        <SectionTitle icon={Dumbbell} color={C.sky}>Where do you train?</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setGym(true)} style={{
            ...chipBtn, flex: 1, padding: "10px", fontSize: 13,
            borderColor: gym ? C.sage : C.line, color: gym ? C.sage : C.mute,
          }}>🏋️ Gym membership</button>
          <button onClick={() => setGym(false)} style={{
            ...chipBtn, flex: 1, padding: "10px", fontSize: 13,
            borderColor: !gym ? C.sage : C.line, color: !gym ? C.sage : C.mute,
          }}>🏠 Working out at home</button>
        </div>
        {!gym && (
          <>
            <div style={{ fontSize: 12, color: C.mute, marginBottom: 8 }}>What gear do you have? (tap any)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EQUIPMENT_OPTIONS.map((e) => {
                const on = gear.includes(e.id);
                return (
                  <button key={e.id} onClick={() => toggleGear(e.id)} style={{
                    ...chipBtn, padding: "7px 12px",
                    borderColor: on ? C.sage : C.line, color: on ? C.sage : C.mute,
                  }}>{on ? "✓ " : ""}{e.label}</button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: C.mute, marginTop: 10, lineHeight: 1.5 }}>
              No gear selected = a great bodyweight plan. Add dumbbells, bands, or a kettlebell to unlock loaded strength days.
            </div>
          </>
        )}
      </Card>

      {plan.map((w, i) => {
        const Ic = w.icon;
        const done = !!data.workoutsDone[todayStr() + "-" + w.day];
        const isToday = i === todayIdx;
        const col = focusColor(w.focus);
        return (
          <Card key={w.day} style={{ border: `1px solid ${isToday ? col : C.line}`, position: "relative" }}>
            {isToday && <span style={{ position: "absolute", top: 14, right: 16, fontSize: 10, color: col, letterSpacing: 1, fontWeight: 700 }}>TODAY</span>}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: col + "26", display: "grid", placeItems: "center" }}>
                <Ic size={22} color={col} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.mute }}>{w.day} · {scaledMins(w.mins, info)} min</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 18 }}>{w.title}</div>
              </div>
            </div>
            <div style={{ margin: "12px 0 14px", display: "flex", flexDirection: "column", gap: 5 }}>
              {w.moves.map((m, k) => (
                <div key={k} style={{ fontSize: 13, color: C.cream, display: "flex", gap: 8 }}>
                  <span style={{ color: col }}>·</span>{m}
                </div>
              ))}
            </div>
            <button onClick={() => toggle(w.day)} style={{
              width: "100%", padding: "11px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
              background: done ? C.sageDeep : C.card2, color: done ? "#fff" : C.cream,
            }}>{done ? "Completed ✓" : "Mark complete"}</button>
          </Card>
        );
      })}
    </>
  );
}

/* -------------------------- BELL SOUND --------------------------- */
let _bell = null;
async function playBell(note = "F4") {
  try {
    await Tone.start();
    if (!_bell) {
      const reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).toDestination();
      _bell = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.004, decay: 2.4, sustain: 0, release: 2.6 },
      }).connect(reverb);
      _bell.volume.value = -6;
    }
    // a single, clean bell strike on the given note (with a soft octave shimmer)
    const now = Tone.now();
    _bell.triggerAttackRelease(note, 3, now);
  } catch { /* audio not ready */ }
}

// special triad chord for the 20-min "zen" Easter egg
async function playZenChord() {
  try {
    await Tone.start();
    if (!_bell) {
      const reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).toDestination();
      _bell = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.004, decay: 2.4, sustain: 0, release: 2.6 },
      }).connect(reverb);
      _bell.volume.value = -6;
    }
    const now = Tone.now();
    _bell.triggerAttackRelease(["C4", "E4", "G4", "C5"], 5, now);
  } catch { /* audio not ready */ }
}

/* ---------------------------- CALM ------------------------------- */
const DURATIONS = [3, 5, 10, 15, 20];

function CalmTab({ data, save }) {
  const [mins, setMins] = useState(5);
  const [left, setLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [zen, setZen] = useState(false);

  useEffect(() => { if (!running) setLeft(mins * 60); }, [mins, running]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      const d = todayStr();
      const sessions = data.meditationLog || {};
      // Easter egg: a full 20-min sit earns a special chord + quiet message
      if (mins >= 20) {
        if (data.bellOn !== false) playZenChord();
        setZen(true);
        setTimeout(() => setZen(false), 7000);
      } else if (data.bellOn !== false) {
        playBell("B4");   // closing bell — key of B
      }
      save({ ...data, meditationLog: { ...sessions, [d]: (sessions[d] || 0) + mins } });
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]); // eslint-disable-line

  const start = async () => {
    await Tone.start();            // unlock audio on the tap
    setRunning(true);
    if (data.bellOn !== false) setTimeout(() => playBell("F4"), 2000);  // opening bell — key of F, 2s after start
  };
  const reset = () => { setRunning(false); setLeft(mins * 60); };
  const toggleBell = () => save({ ...data, bellOn: data.bellOn === false });

  const total = mins * 60;
  const progress = ((total - left) / total) * 100;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const todayMin = (data.meditationLog || {})[todayStr()] || 0;

  const R = 86, CIRC = 2 * Math.PI * R;

  return (
    <>
      {zen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center",
          background: "rgba(8,14,11,.92)", animation: "bodlyfade 1s ease",
        }} onClick={() => setZen(false)}>
          <div style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🧘</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 24, color: C.sky, lineHeight: 1.4 }}>
              Stillness found.
            </div>
            <div style={{ color: C.mute, fontSize: 14, marginTop: 10, maxWidth: 260 }}>
              Twenty minutes of presence is a gift. The calm you just made travels with you. 🌌
            </div>
          </div>
          <style>{`@keyframes bodlyfade { from {opacity:0} to {opacity:1} }`}</style>
        </div>
      )}
      <Card style={{ background: `linear-gradient(135deg,#241f31,${C.card})` }}>
        <SectionTitle icon={Brain} color={C.sky}>Meditation</SectionTitle>
        <div style={{ color: C.mute, fontSize: 14 }}>
          A bell chimes to open and close your sit. Settle in, breathe, and let the day soften. 🔔
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
          {DURATIONS.map((m) => (
            <button key={m} onClick={() => { if (!running) setMins(m); }} style={{
              ...chipBtn, padding: "8px 14px",
              borderColor: m === mins ? C.sky : C.line,
              color: m === mins ? C.sky : C.mute,
              opacity: running ? 0.4 : 1,
            }}>{m} min</button>
          ))}
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "6px 0 18px" }}>
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="100" cy="100" r={R} stroke={C.line} strokeWidth="10" fill="none" />
              <circle cx="100" cy="100" r={R} stroke={C.sky} strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray={CIRC}
                strokeDashoffset={CIRC - (progress / 100) * CIRC}
                style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <Bell size={20} color={C.sky} style={{ opacity: 0.7 }} />
                <div style={{ fontFamily: "Georgia,serif", fontSize: 42, letterSpacing: 1 }}>{mm}:{ss}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {!running ? (
            <button onClick={start} style={{ ...primaryBtn, padding: "13px 28px", display: "flex", alignItems: "center", gap: 8 }}>
              <Play size={18} /> {left === total ? "Begin" : "Resume"}
            </button>
          ) : (
            <button onClick={() => setRunning(false)} style={{ ...roundBtn, width: 56, height: 56 }}><Pause size={22} /></button>
          )}
          <button onClick={reset} style={{ ...roundBtn, width: 56, height: 56 }}><RotateCcw size={20} /></button>
          <button onClick={toggleBell} title={data.bellOn === false ? "Bell off" : "Bell on"} style={{
            ...roundBtn, width: 56, height: 56,
            borderColor: data.bellOn === false ? C.line : C.sage,
            color: data.bellOn === false ? C.mute : C.sage,
          }}>{data.bellOn === false ? <BellOff size={20} /> : <Bell size={20} />}</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: C.mute, marginTop: 10 }}>
          Bell {data.bellOn === false ? "off" : "on"} — F to begin, B to close
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Sparkles} color={C.sun}>Today</SectionTitle>
        <div style={{ textAlign: "center", padding: "4px 0" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 34, color: C.sky }}>{todayMin}</span>
          <span style={{ color: C.mute }}> min of calm</span>
        </div>
      </Card>
    </>
  );
}

/* ----------------------------- PLAN ------------------------------ */
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

const keyOf = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// workout for a given Date (Mon-indexed week), adapted to the user's setup
const workoutForKey = (k, profile) => {
  const dt = new Date(k + "T00:00");
  return planFor(profile)[(dt.getDay() + 6) % 7];
};
// auto-rotate a different meal per slot for each date (stable per day),
// unless the user has customized that specific day. Respects the shake toggle.
const rotatedMeals = (data, k) => {
  const dt = new Date(k + "T00:00");
  const dayNum = Math.floor(dt.getTime() / 86400000);
  const shakesOn = !!data.shakesOn;
  const slots = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const out = {};
  slots.forEach((slot, si) => {
    const pool = MEALS.filter((m) => m.tag === slot); // rotate among the fixed dishes
    const idx = pool.length ? ((dayNum + si * 3) % pool.length + pool.length) % pool.length : 0;
    out[slot] = pool[idx]?.id;
  });
  // ensure at least one of the user's chosen shakes per day when the toggle is on
  const shakes = shakeMeals(data);
  if (shakesOn && shakes.length && !slots.some((s) => findMeal(data, out[s])?.shake)) {
    const slot = SHAKE_SLOTS[dayNum % SHAKE_SLOTS.length];
    out[slot] = shakes[((dayNum % shakes.length) + shakes.length) % shakes.length].id;
  }
  return out;
};
const mealsForKey = (data, k) => {
  if (data.dayPlans?.[k]?.meals) return data.dayPlans[k].meals; // user-customized day
  if (k === todayStr()) return data.meals;                       // today matches Meals tab
  return rotatedMeals(data, k);                                  // other days auto-vary
};

function PlanTab({ data, save }) {
  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [openKey, setOpenKey] = useState(null);

  const first = new Date(ym.y, ym.m, 1);
  const startDow = first.getDay();
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const todayKey = keyOf(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const shift = (n) => {
    let m = ym.m + n, y = ym.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setYm({ y, m });
  };

  return (
    <>
      <Card style={{ background: `linear-gradient(135deg,${C.card2},${C.card})` }}>
        <SectionTitle icon={CalendarDays} color={C.sun}>Your Plan</SectionTitle>
        <div style={{ color: C.mute, fontSize: 14 }}>
          Tap any day to see its meals and workout — and customize it ahead of time.
        </div>
      </Card>

      <Card>
        {/* month header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <button onClick={() => shift(-1)} style={{ ...roundBtn, width: 38, height: 38 }}><ChevronLeft size={18} /></button>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 19 }}>{MONTHS[ym.m]} {ym.y}</div>
          <button onClick={() => shift(1)} style={{ ...roundBtn, width: 38, height: 38 }}><ChevronRight size={18} /></button>
        </div>

        {/* weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
          {DOW.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, color: C.mute }}>{d}</div>)}
        </div>

        {/* day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = keyOf(ym.y, ym.m, d);
            const w = workoutForKey(k, data.profile);
            const isToday = k === todayKey;
            const hasNotes = !!data.dayPlans?.[k]?.notes;
            const col = focusColor(w.focus);
            return (
              <button key={i} onClick={() => setOpenKey(k)} style={{
                aspectRatio: "1", borderRadius: 12, cursor: "pointer",
                border: `1px solid ${isToday ? C.sage : C.line}`,
                background: isToday ? "rgba(143,214,164,.12)" : C.card2,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                color: C.cream, padding: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? C.sage : C.cream }}>{d}</span>
                <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sageDeep }} />
                  {hasNotes && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sun }} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 14, flexWrap: "wrap", fontSize: 11, color: C.mute }}>
          <Legend color={C.coral} label="Workout" />
          <Legend color={C.sageDeep} label="Meals" />
          <Legend color={C.sun} label="Note" />
        </div>
      </Card>

      {openKey && <DayDetail data={data} save={save} dayKey={openKey} close={() => setOpenKey(null)} />}
    </>
  );
}

const Legend = ({ color, label }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} /> {label}
  </span>
);

function DayDetail({ data, save, dayKey, close }) {
  const notesRef = useRef(null);
  const dt = new Date(dayKey + "T00:00");
  const pretty = dt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const w = workoutForKey(dayKey, data.profile);
  const info = weekInfo(data.profile, dayKey);
  const Ic = w.icon;
  const col = focusColor(w.focus);
  const slots = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const dayMeals = mealsForKey(data, dayKey);
  const wkey = dayKey + "-" + w.day;
  const done = !!data.workoutsDone[wkey];

  const setMeal = (slot, id) => {
    const prev = data.dayPlans?.[dayKey] || {};
    const meals = { ...dayMeals, ...(prev.meals || {}), [slot]: id };
    save({ ...data, dayPlans: { ...data.dayPlans, [dayKey]: { ...prev, meals } } });
  };
  const toggleWorkout = () =>
    save({ ...data, workoutsDone: { ...data.workoutsDone, [wkey]: !done } });
  const saveNotes = () => {
    const prev = data.dayPlans?.[dayKey] || {};
    save({ ...data, dayPlans: { ...data.dayPlans, [dayKey]: { ...prev, notes: notesRef.current?.value || "" } } });
    close();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,14,11,.85)", display: "grid", placeItems: "center", padding: 16, zIndex: 50 }}>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, padding: 20, width: "100%", maxWidth: 400, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 20, lineHeight: 1.2 }}>{pretty}</div>
          <X size={22} color={C.mute} style={{ cursor: "pointer", flexShrink: 0 }} onClick={close} />
        </div>

        {/* workout */}
        <div style={{ background: C.card2, borderRadius: 16, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: col + "26", display: "grid", placeItems: "center" }}>
              <Ic size={18} color={col} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.mute }}>{w.day} · {scaledMins(w.mins, info)} min · {w.focus}</div>
              <div style={{ fontWeight: 700 }}>{w.title}</div>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Pill color={info.isDeload ? C.sky : C.sageDeep}>{info.weekLabel} · {info.phase}</Pill>
          </div>
          <div style={{ fontSize: 12, color: info.isDeload ? C.sky : C.mute, marginBottom: 10, lineHeight: 1.4 }}>{info.repNote}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
            {w.moves.map((m, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.cream, display: "flex", gap: 7 }}>
                <span style={{ color: col }}>·</span>{m}
              </div>
            ))}
          </div>
          <button onClick={toggleWorkout} style={{
            width: "100%", padding: 9, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
            background: done ? C.sageDeep : C.card, color: done ? "#fff" : C.cream,
          }}>{done ? "Completed ✓" : "Mark complete"}</button>
        </div>

        {/* meals */}
        {slots.map((slot) => {
          const meal = findMeal(data, dayMeals[slot]);
          const options = optionsForSlot(data, slot);
          return (
            <div key={slot} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.mute, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{slot}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 15, marginBottom: 6 }}>{meal?.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {options.map((o) => (
                  <button key={o.id} onClick={() => setMeal(slot, o.id)} style={{
                    ...chipBtn, padding: "5px 10px", fontSize: 11,
                    borderColor: o.id === meal?.id ? C.sage : C.line,
                    color: o.id === meal?.id ? C.sage : C.mute,
                  }}>{o.name.split(" ").slice(0, 2).join(" ")}</button>
                ))}
              </div>
            </div>
          );
        })}

        {/* notes */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.mute, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Notes / events</div>
          <textarea ref={notesRef} defaultValue={data.dayPlans?.[dayKey]?.notes || ""}
            placeholder="e.g. dinner with friends, doctor visit…" rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.4 }} />
        </div>

        <button onClick={saveNotes} style={{ ...primaryBtn, width: "100%", padding: 13 }}>Save day</button>
      </div>
    </div>
  );
}

/* ---------------------------- FEELS ------------------------------ */
function FeelsTab({ data, save }) {
  const today = todayStr();
  const dayNum = Math.floor(new Date(today + "T00:00").getTime() / 86400000);
  const feels = data.feels && data.feels.date === today ? data.feels : { date: today, n: 0 };
  const seed = dayNum + feels.n * 7919;
  const isNewYear = today.slice(5) === "01-01"; // MM-DD
  const NEW_YEAR = [
    "New year, same strong me — just leveling up. 🎉",
    "This is my year to feel my absolute best.",
    "I carry every win from last year forward.",
    "Fresh start, steady habits, big heart.",
    "I am writing a healthier story, one day at a time.",
  ];
  const list = isNewYear ? NEW_YEAR : pickFive(seed);
  const shuffle = () => save({ ...data, feels: { date: today, n: feels.n + 1 } });

  const dateLabel = new Date(today + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <Card style={{ background: `linear-gradient(135deg,#2e2718,${C.card})` }}>
        <SectionTitle icon={Sun} color={C.sun}>Feels</SectionTitle>
        <div style={{ color: C.mute, fontSize: 14 }}>
          {isNewYear
            ? "Happy New Year! 🎆 A special set of affirmations to start your year strong."
            : `Five affirmations for ${dateLabel}. Read them slowly, say them aloud, and let them land. 🌞`}
        </div>
      </Card>

      {list.map((text, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center",
            background: C.sun + "26", color: C.sun, fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700,
          }}>{i + 1}</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 17, lineHeight: 1.35 }}>{text}</div>
        </Card>
      ))}

      <button onClick={shuffle} style={{ ...primaryBtn, width: "100%", padding: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Shuffle size={18} /> New set
      </button>
      <div style={{ fontSize: 11, color: C.mute, textAlign: "center", marginTop: 10, marginBottom: 4 }}>
        A fresh set appears each day — tap for more anytime.
      </div>
    </>
  );
}

/* ---------------------------- SETUP ------------------------------ */
function Setup({ data, save, close }) {
  const nameRef = useRef(null);
  const startRef = useRef(null);
  const [goalW, setGoalW] = useState(data.profile.start ? +(data.profile.start * 0.8).toFixed(1) : 0);

  const recalc = () => {
    const s = parseFloat(startRef.current?.value);
    setGoalW(s ? +(s * 0.8).toFixed(1) : 0);
  };

  const finish = () => {
    // read straight from the inputs so nothing is lost
    const typedName = (nameRef.current?.value || "").trim();
    const s = parseFloat(startRef.current?.value) || 200;
    save({
      ...data,
      profile: { ...data.profile, name: typedName, start: s, current: s, goalPct: 20, startedAt: data.profile.startedAt || todayStr() },
    });
    close();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,14,11,.85)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }}>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, padding: 24, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: C.sage, letterSpacing: 2, fontSize: 13, textTransform: "uppercase", display: "flex", gap: 7, alignItems: "center", fontWeight: 800 }}><Logo size={26} /> Bodly</span>
          <X size={20} color={C.mute} style={{ cursor: "pointer" }} onClick={close} />
        </div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 24, marginBottom: 4 }}>Let's begin 🌱</div>
        <div style={{ color: C.mute, fontSize: 14, marginBottom: 18 }}>Your goal is to lose 20% of your starting weight, gently and sustainably.</div>

        <label style={lbl}>Your name</label>
        <input ref={nameRef} defaultValue={data.profile.name || ""} placeholder="e.g. Alex"
          autoCapitalize="words" style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={lbl}>Starting weight (lbs)</label>
        <input ref={startRef} defaultValue={data.profile.start || ""} type="number" inputMode="decimal"
          placeholder="200" onInput={recalc} onChange={recalc} style={{ ...inputStyle, marginBottom: 14 }} />

        {goalW > 0 && (
          <div style={{ background: C.card2, borderRadius: 14, padding: 14, marginBottom: 18, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.mute }}>Your 20% goal weight</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 30, color: C.sage }}>{goalW} lbs</div>
            <div style={{ fontSize: 12, color: C.sun }}>That's {(goalW / 0.8 - goalW).toFixed(0)} lbs to lose — you've got this! 💚</div>
          </div>
        )}

        <button onClick={finish} style={{ ...primaryBtn, width: "100%", padding: 14 }}>Start my journey</button>
      </div>
    </div>
  );
}

/* ---------------------------- NAVBAR ----------------------------- */
function NavBar({ tab, setTab }) {
  const items = [
    { id: "home", icon: Home, label: "Home" },
    { id: "weight", icon: TrendingDown, label: "Weight" },
    { id: "habits", icon: HeartPulse, label: "Health" },
    { id: "meals", icon: UtensilsCrossed, label: "Meals" },
    { id: "move", icon: Dumbbell, label: "Move" },
    { id: "plan", icon: CalendarDays, label: "Plan" },
    { id: "feels", icon: Sun, label: "Feels" },
    { id: "calm", icon: Brain, label: "Calm" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 440,
      display: "flex", justifyContent: "space-around", padding: "9px 2px 22px",
      background: "rgba(15,26,20,.92)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.line}`,
    }}>
      {items.map((it) => {
        const Ic = it.icon; const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, color: active ? C.sage : C.mute, flex: 1, padding: "0 1px", minWidth: 0,
          }}>
            <Ic size={18} />
            <span style={{ fontSize: 8.5, fontWeight: active ? 700 : 500, letterSpacing: 0 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------- STYLES ----------------------------- */
const inputStyle = { flex: 1, background: C.card2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", color: C.cream, fontSize: 16, outline: "none", width: "100%" };
const primaryBtn = { background: `linear-gradient(135deg,${C.sageDeep},${C.sage})`, color: "#08130c", border: "none", borderRadius: 12, padding: "0 20px", fontWeight: 800, fontSize: 15, cursor: "pointer" };
const ghostBtn = { background: "transparent", border: `1px solid ${C.line}`, color: C.mute, borderRadius: 10, padding: "5px 12px", fontSize: 12, cursor: "pointer" };
const roundBtn = { width: 48, height: 48, borderRadius: "50%", background: C.card2, border: `1px solid ${C.line}`, color: C.cream, cursor: "pointer", display: "grid", placeItems: "center" };
const chipBtn = { background: "transparent", border: `1px solid ${C.line}`, borderRadius: 20, padding: "7px 12px", fontSize: 12, cursor: "pointer" };
const lbl = { display: "block", fontSize: 12, color: C.mute, marginBottom: 6, letterSpacing: .5 };
