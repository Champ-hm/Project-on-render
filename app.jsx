// app.jsx — AI Learning Coach. View states: home → loading → lesson.
const { useState, useEffect, useRef, useCallback } = React;

/* ----------------------------- data ----------------------------- */
// 8 topics; the home grid slices to the chosen box count. Each carries a cool
// hue (degrees) so cards form a blue→teal→indigo→cyan spectrum.
const TOPICS = [
  { id: "photo", title: "Photosynthesis", subject: "Biology", icon: "sun", hue: 168, blurb: "How plants turn sunlight into food.",
    bigIdea: "Plants capture sunlight and turn carbon dioxide and water into glucose — the sugar that fuels almost all life on Earth.",
    terms: ["Chlorophyll", "Glucose", "Stomata"], tryIt: "Why do most leaves look green instead of red or blue?" },
  { id: "frev", title: "The French Revolution", subject: "History", icon: "flag", hue: 196, blurb: "Liberty, chaos, and the fall of a monarchy.",
    bigIdea: "Between 1789 and 1799 the French people overthrew their monarchy and rewrote what citizens could demand from a government.",
    terms: ["Bastille", "Guillotine", "Republic"], tryIt: "What turns an ordinary protest into a full revolution?" },
  { id: "quad", title: "Quadratic Equations", subject: "Algebra", icon: "parabola", hue: 222, blurb: "Crack the curves of x² and beyond.",
    bigIdea: "A quadratic equation graphs as a smooth U-shaped curve, and its solutions are the exact spots where that curve crosses zero.",
    terms: ["Parabola", "Vertex", "Roots"], tryIt: "Solve x² − 5x + 6 = 0. Which two numbers work?" },
  { id: "shak", title: "Shakespeare's Tragedies", subject: "English", icon: "book", hue: 250, blurb: "Power, fate, and unforgettable downfalls.",
    bigIdea: "Shakespeare's tragic heroes are undone by a single fatal flaw — ambition, jealousy, or pride — that feels uncomfortably human.",
    terms: ["Hubris", "Soliloquy", "Catharsis"], tryIt: "Is Macbeth a villain, a victim, or both?" },
  { id: "ptable", title: "The Periodic Table", subject: "Chemistry", icon: "element", hue: 274, blurb: "Meet the building blocks of everything.",
    bigIdea: "Every known element has a home on the periodic table, arranged so that neighbours share predictable chemical behaviour.",
    terms: ["Atomic number", "Group", "Period"], tryIt: "Why are the elements on the far right so unreactive?" },
  { id: "sd", title: "Supply & Demand", subject: "Economics", icon: "chart", hue: 206, blurb: "Why prices rise, fall, and surprise us.",
    bigIdea: "Prices settle at the point where the amount people want to buy meets the amount sellers are willing to make.",
    terms: ["Equilibrium", "Surplus", "Shortage"], tryIt: "What happens to ticket prices when a show suddenly sells out?" },
  { id: "tect", title: "Plate Tectonics", subject: "Geography", icon: "mountain", hue: 184, blurb: "How continents drift and mountains rise.",
    bigIdea: "Earth's surface is broken into giant plates that slowly drift, building mountains and triggering earthquakes where they meet.",
    terms: ["Fault line", "Subduction", "Magma"], tryIt: "Why do earthquakes cluster along the same coastlines?" },
  { id: "cell", title: "The Cell", subject: "Biology", icon: "cell", hue: 238, blurb: "Tour the tiny machines that keep you alive.",
    bigIdea: "Every living thing is built from cells — tiny self-contained factories that store information and turn fuel into life.",
    terms: ["Nucleus", "Membrane", "Mitochondria"], tryIt: "What job do the mitochondria do for the cell?" },
];

const PALETTES = {
  Indigo:  { primary: "#5b6ee0", ink: "#23264d", canvas: "#f5f6fd" },
  Teal:    { primary: "#119a91", ink: "#123b39", canvas: "#eef8f6" },
  Ocean:   { primary: "#2f7fe0", ink: "#13294a", canvas: "#eff4fc" },
  Violet:  { primary: "#7a5af0", ink: "#272150", canvas: "#f5f2fd" },
};
const FONTS = {
  Bricolage: "'Bricolage Grotesque', system-ui, sans-serif",
  "Space Grotesk": "'Space Grotesk', system-ui, sans-serif",
  Outfit: "'Outfit', system-ui, sans-serif",
};

/* ----------------------------- coach orb ----------------------------- */
function CoachOrb({ size = 76, thinking = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      {thinking && [0, 1].map((i) => (
        <span key={i} style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid var(--primary)",
          animation: `pulseRing 1.8s ${i * 0.9}s ease-out infinite`,
        }} />
      ))}
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "radial-gradient(circle at 32% 28%, oklch(0.92 0.07 200), oklch(0.62 0.17 250) 55%, oklch(0.52 0.19 285))",
        boxShadow: "0 12px 30px -8px oklch(0.55 0.17 265 / 0.55), inset 0 -6px 14px oklch(0.4 0.16 285 / 0.5), inset 0 4px 10px oklch(1 0 0 / 0.45)",
        animation: thinking
          ? "orbDrift 3.2s ease-in-out infinite, orbHue 4s ease-in-out infinite"
          : "orbDrift 6s ease-in-out infinite",
        position: "relative",
      }}>
        <span style={{
          position: "absolute", top: "20%", left: "24%", width: "26%", height: "26%",
          borderRadius: "50%", background: "oklch(1 0 0 / 0.7)", filter: "blur(1px)",
        }} />
      </div>
    </div>
  );
}

/* ----------------------------- background ----------------------------- */
function BackgroundFX({ kind }) {
  if (kind === "plain") return null;
  if (kind === "dots") {
    return <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "radial-gradient(oklch(0.6 0.06 265 / 0.16) 1.4px, transparent 1.4px)",
      backgroundSize: "26px 26px",
      maskImage: "radial-gradient(circle at 50% 36%, black, transparent 78%)",
      WebkitMaskImage: "radial-gradient(circle at 50% 36%, black, transparent 78%)",
    }} />;
  }
  if (kind === "mesh") {
    return <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      background:
        "radial-gradient(40% 50% at 18% 12%, oklch(0.86 0.09 200 / 0.5), transparent 70%)," +
        "radial-gradient(46% 56% at 86% 8%, oklch(0.84 0.1 280 / 0.45), transparent 72%)," +
        "radial-gradient(50% 60% at 70% 92%, oklch(0.86 0.08 230 / 0.4), transparent 74%)",
    }} />;
  }
  // blobs (default)
  const blobs = [
    { c: "oklch(0.82 0.12 200 / 0.55)", s: 380, t: "-6%", l: "-5%", d: "0s" },
    { c: "oklch(0.8 0.13 280 / 0.5)", s: 320, t: "8%", l: "78%", d: "3s" },
    { c: "oklch(0.84 0.1 235 / 0.5)", s: 300, t: "66%", l: "12%", d: "1.5s" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", filter: "blur(8px)" }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: "absolute", top: b.t, left: b.l, width: b.s, height: b.s,
          borderRadius: "50%", background: `radial-gradient(circle, ${b.c}, transparent 70%)`,
          animation: `blobMove ${12 + i * 3}s ${b.d} ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

/* ----------------------------- topic card ----------------------------- */
function TopicCard({ topic, index, cardStyle, primaryHue, onPick }) {
  const [hover, setHover] = useState(false);
  const hue = cardStyle === "mono" ? primaryHue : topic.hue;
  const tint = `oklch(0.965 0.035 ${hue})`;
  const tintStrong = `oklch(0.92 0.06 ${hue})`;
  const accent = `oklch(0.54 0.16 ${hue})`;
  const border = `oklch(0.88 0.05 ${hue})`;

  const base = {
    position: "relative", textAlign: "left", width: "100%",
    borderRadius: 22, padding: "22px 22px 20px", cursor: "pointer",
    display: "flex", flexDirection: "column", gap: 12, overflow: "hidden",
    transition: "transform .28s cubic-bezier(.2,.8,.25,1), box-shadow .28s ease, border-color .2s ease",
    transform: hover ? "translateY(-6px)" : "translateY(0)",
    animation: `floatUp .6s ${0.06 * index + 0.15}s both`,
  };
  const styleByKind = {
    tinted: {
      background: tint, border: `1.5px solid ${border}`,
      boxShadow: hover ? `0 22px 40px -16px ${accent.replace(")", " / 0.45)")}` : "0 4px 14px -10px oklch(0.4 0.1 265 / 0.4)",
    },
    outline: {
      background: "var(--surface)", border: `1.5px solid ${hover ? accent : "var(--hairline)"}`,
      boxShadow: hover ? `0 22px 40px -18px ${accent.replace(")", " / 0.4)")}` : "0 2px 10px -8px oklch(0.4 0.1 265 / 0.3)",
    },
    mono: {
      background: tint, border: `1.5px solid ${border}`,
      boxShadow: hover ? `0 22px 40px -16px ${accent.replace(")", " / 0.45)")}` : "0 4px 14px -10px oklch(0.4 0.1 265 / 0.4)",
    },
  };

  return (
    <button
      onClick={() => onPick(topic)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...styleByKind[cardStyle], font: "inherit", color: "var(--ink)" }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center",
        background: cardStyle === "outline" ? tint : "var(--surface)",
        color: accent, border: `1.5px solid ${border}`,
        transition: "transform .3s ease",
        transform: hover ? "rotate(-6deg) scale(1.06)" : "none",
      }}>
        <SubjectIcon name={topic.icon} s={28} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase",
          color: accent,
        }}>{topic.subject}</span>
        <h3 style={{
          margin: 0, fontFamily: "var(--display)", fontWeight: 600, fontSize: 20,
          lineHeight: 1.12, letterSpacing: "-0.01em", color: "var(--ink)",
        }}>{topic.title}</h3>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.45, color: "var(--ink-soft)" }}>{topic.blurb}</p>
      </div>
      <span style={{
        marginTop: "auto", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12.5, fontWeight: 600, color: accent,
        opacity: hover ? 1 : 0.0, transform: hover ? "translateX(0)" : "translateX(-4px)",
        transition: "opacity .25s ease, transform .25s ease",
      }}>Start learning <span style={{ fontSize: 15 }}>→</span></span>
    </button>
  );
}

/* ----------------------------- home ----------------------------- */
function Home({ t, onPick }) {
  const topics = TOPICS.slice(0, t.boxCount);
  const cols = topics.length <= 3 ? topics.length : topics.length === 4 ? 2 : 3;
  return (
    <main style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", padding: "clamp(40px,7vh,84px) 24px 80px" }}>
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px 7px 10px",
          borderRadius: 999, background: "var(--surface)", border: "1px solid var(--hairline)",
          boxShadow: "0 4px 14px -10px oklch(0.4 0.1 265 / 0.5)",
          fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", animation: "floatUp .6s .02s both",
        }}>
          <span style={{ color: "var(--primary)", display: "inline-flex" }}><SparkMark s={16} /></span>
          Your AI learning coach
        </div>
        <div style={{ animation: "floatUp .6s .08s both" }}><CoachOrb size={84} /></div>
        <h1 style={{
          margin: "4px 0 0", fontFamily: "var(--display)", fontWeight: 700,
          fontSize: "clamp(34px, 5.4vw, 58px)", lineHeight: 1.04, letterSpacing: "-0.025em",
          color: "var(--ink)", maxWidth: 760, textWrap: "balance", animation: "floatUp .6s .12s both",
        }}>{t.headline}</h1>
        <p style={{
          margin: 0, fontSize: "clamp(15px,1.6vw,18px)", lineHeight: 1.5, color: "var(--ink-soft)",
          maxWidth: 520, textWrap: "pretty", animation: "floatUp .6s .18s both",
        }}>Pick a topic below and I'll build you a friendly, bite-sized lesson — explained at exactly your pace.</p>
      </header>

      <div style={{
        marginTop: "clamp(34px,5vh,56px)",
        display: "grid", gap: 18,
        gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
      }}>
        {topics.map((topic, i) => (
          <TopicCard key={topic.id} topic={topic} index={i} cardStyle={t.cardStyle} primaryHue={t.primaryHue} onPick={onPick} />
        ))}
      </div>
    </main>
  );
}

/* ----------------------------- loading overlay ----------------------------- */
const LOAD_STEPS = (title) => [
  `Reading up on ${title}…`,
  "Finding the clearest way in…",
  "Gathering examples you'll like…",
  "Building your lesson…",
];
function LoadingOverlay({ topic, onDone }) {
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const steps = LOAD_STEPS(topic.title);
  useEffect(() => {
    const start = performance.now();
    const DUR = 2600;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - p, 2.2);
      setPct(Math.round(eased * 100));
      setStep(Math.min(steps.length - 1, Math.floor(p * steps.length)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 360);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const hue = topic.hue;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40, display: "grid", placeItems: "center", padding: 24,
      background: `radial-gradient(60% 60% at 50% 38%, oklch(0.97 0.03 ${hue}), var(--canvas))`,
      animation: "pop .4s ease both",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <CoachOrb size={104} thinking />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: `oklch(0.54 0.16 ${hue})` }}>{topic.subject}</span>
          <h2 style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", color: "var(--ink)" }}>{topic.title}</h2>
        </div>
        <p key={step} style={{ margin: 0, minHeight: 22, fontSize: 15.5, color: "var(--ink-soft)", animation: "pop .35s ease both" }}>{steps[step]}</p>
        <div style={{ width: "100%", maxWidth: 300 }}>
          <div style={{ height: 8, borderRadius: 999, background: "oklch(0.9 0.02 255)", overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 999,
              background: `linear-gradient(90deg, oklch(0.62 0.17 ${hue}), oklch(0.55 0.17 265))`,
              transition: "width .12s linear",
            }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "var(--ink-faint)" }}>{pct}%</div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- lesson view ----------------------------- */
function LessonChip({ children, hue }) {
  return <span style={{
    padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600,
    background: `oklch(0.95 0.04 ${hue})`, color: `oklch(0.45 0.14 ${hue})`,
    border: `1px solid oklch(0.88 0.05 ${hue})`,
  }}>{children}</span>;
}
function LessonCard({ kicker, title, hue, delay, children }) {
  return (
    <section style={{
      background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 20,
      padding: "22px 24px", boxShadow: "0 6px 20px -14px oklch(0.4 0.1 265 / 0.5)",
      animation: `floatUp .55s ${delay}s both`,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: `oklch(0.54 0.16 ${hue})` }}>{kicker}</span>
      <h3 style={{ margin: "6px 0 12px", fontFamily: "var(--display)", fontWeight: 600, fontSize: 20, letterSpacing: "-0.01em", color: "var(--ink)" }}>{title}</h3>
      {children}
    </section>
  );
}
function LessonView({ topic, onBack }) {
  const hue = topic.hue;
  return (
    <main style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px" }}>
      <button onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 26,
        background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 999,
        padding: "8px 15px 8px 12px", fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)",
        boxShadow: "0 3px 12px -9px oklch(0.4 0.1 265 / 0.5)", animation: "floatUp .5s 0s both",
      }}>← All topics</button>

      <header style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24, animation: "floatUp .55s .05s both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16, display: "grid", placeItems: "center", flex: "0 0 auto",
            background: `oklch(0.95 0.04 ${hue})`, color: `oklch(0.54 0.16 ${hue})`, border: `1.5px solid oklch(0.88 0.05 ${hue})`,
          }}><SubjectIcon name={topic.icon} s={32} /></div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: `oklch(0.54 0.16 ${hue})` }}>{topic.subject} · Lesson 1 of 5</div>
            <h1 style={{ margin: "3px 0 0", fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(28px,4.4vw,40px)", lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--ink)" }}>{topic.title}</h1>
          </div>
        </div>
      </header>

      {/* coach intro bubble */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22, animation: "floatUp .55s .12s both" }}>
        <CoachOrb size={46} />
        <div style={{
          background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "4px 18px 18px 18px",
          padding: "14px 18px", fontSize: 15.5, lineHeight: 1.55, color: "var(--ink)", maxWidth: 560,
          boxShadow: "0 6px 20px -14px oklch(0.4 0.1 265 / 0.5)",
        }}>
          Hey! Let's unpack <strong>{topic.title.toLowerCase()}</strong> together. Here's the big idea, the words worth knowing, and one question to test yourself. Ask me anything as we go.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <LessonCard kicker="The big idea" title="Start here" hue={hue} delay={0.2}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.62, color: "var(--ink-soft)", textWrap: "pretty" }}>{topic.bigIdea}</p>
        </LessonCard>

        <LessonCard kicker="Key terms" title="Words worth knowing" hue={hue} delay={0.28}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {topic.terms.map((term) => <LessonChip key={term} hue={hue}>{term}</LessonChip>)}
          </div>
        </LessonCard>

        <LessonCard kicker="Try it yourself" title="Quick check" hue={hue} delay={0.36}>
          <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", fontWeight: 500 }}>{topic.tryIt}</p>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "none",
            background: `linear-gradient(120deg, oklch(0.6 0.17 ${hue}), var(--primary))`, color: "white",
            fontSize: 14.5, fontWeight: 600, boxShadow: `0 12px 24px -12px oklch(0.55 0.17 ${hue} / 0.8)`,
          }}><SparkMark s={16} /> Think it through with the coach</button>
        </LessonCard>
      </div>
    </main>
  );
}

/* ----------------------------- tweaks defaults ----------------------------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headline": "What do you want to learn today?",
  "palette": "Indigo",
  "font": "Bricolage",
  "boxCount": 6,
  "cardStyle": "tinted",
  "background": "blobs"
}/*EDITMODE-END*/;

const PRIMARY_HUE = { Indigo: 265, Teal: 184, Ocean: 235, Violet: 285 };

/* ----------------------------- app ----------------------------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState("home"); // home | loading | lesson
  const [topic, setTopic] = useState(null);

  // apply palette + font to CSS vars
  useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.Indigo;
    const r = document.documentElement.style;
    r.setProperty("--primary", p.primary);
    r.setProperty("--ink", p.ink);
    r.setProperty("--canvas", p.canvas);
    r.setProperty("--ink-soft", `color-mix(in oklab, ${p.ink} 62%, white)`);
    r.setProperty("--ink-faint", `color-mix(in oklab, ${p.ink} 42%, white)`);
    r.setProperty("--primary-soft", `color-mix(in oklab, ${p.primary} 16%, white)`);
    r.setProperty("--hairline", `color-mix(in oklab, ${p.ink} 12%, white)`);
    r.setProperty("--display", FONTS[t.font] || FONTS.Bricolage);
  }, [t.palette, t.font]);

  const pick = useCallback((tp) => { setTopic(tp); setView("loading"); window.scrollTo(0, 0); }, []);

  return (
    <React.Fragment>
      <BackgroundFX kind={t.background} />
      {view === "home" && <Home t={{ ...t, primaryHue: PRIMARY_HUE[t.palette] || 265 }} onPick={pick} />}
      {view === "loading" && topic && <LoadingOverlay topic={topic} onDone={() => setView("lesson")} />}
      {view === "lesson" && topic && <LessonView topic={topic} onBack={() => { setView("home"); window.scrollTo(0, 0); }} />}

      <TweaksPanel>
        <TweakSection label="Content" />
        <TweakText label="Headline" value={t.headline} onChange={(v) => setTweak("headline", v)} />
        <TweakSlider label="Topic boxes" value={t.boxCount} min={3} max={8} step={1} onChange={(v) => setTweak("boxCount", v)} />

        <TweakSection label="Look & feel" />
        <TweakSelect label="Color theme" value={t.palette} options={Object.keys(PALETTES)} onChange={(v) => setTweak("palette", v)} />
        <TweakSelect label="Display font" value={t.font} options={Object.keys(FONTS)} onChange={(v) => setTweak("font", v)} />
        <TweakRadio label="Card style" value={t.cardStyle} options={["tinted", "outline", "mono"]} onChange={(v) => setTweak("cardStyle", v)} />
        <TweakSelect label="Background" value={t.background} options={["blobs", "dots", "mesh", "plain"]} onChange={(v) => setTweak("background", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
