// icons.jsx — simple monoline subject icons built from basic shapes.
// All use currentColor stroke; sized via the `s` prop.
function SubjectIcon({ name, s = 30 }) {
  const sw = 2.1;
  const common = {
    width: s, height: s, viewBox: "0 0 32 32", fill: "none",
    stroke: "currentColor", strokeWidth: sw,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  const icons = {
    // Sun — Photosynthesis
    sun: (
      <svg {...common}>
        <circle cx="16" cy="16" r="6" />
        <path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.5 6.5l2.1 2.1M23.4 23.4l2.1 2.1M25.5 6.5l-2.1 2.1M8.6 23.4l-2.1 2.1" />
      </svg>
    ),
    // Flag — French Revolution
    flag: (
      <svg {...common}>
        <path d="M9 4v25" />
        <path d="M9 6h15l-3 4 3 4H9" />
      </svg>
    ),
    // Parabola — Quadratic Equations
    parabola: (
      <svg {...common}>
        <path d="M4 28h24M6 28V6" />
        <path d="M8 9c4 13 12 13 16 0" />
      </svg>
    ),
    // Book — Shakespeare
    book: (
      <svg {...common}>
        <path d="M16 8c-2.6-1.6-5.6-2-9-1.4V24c3.4-.6 6.4-.2 9 1.4 2.6-1.6 5.6-2 9-1.4V6.6c-3.4-.6-6.4-.2-9 1.4z" />
        <path d="M16 8v17.4" />
      </svg>
    ),
    // Element tile — Periodic Table
    element: (
      <svg {...common}>
        <rect x="6" y="6" width="20" height="20" rx="3" />
        <path d="M11 11h3M11 11v6" />
        <path d="M17 21l3-7 3 7" />
      </svg>
    ),
    // Chart — Supply & Demand
    chart: (
      <svg {...common}>
        <path d="M4 28h24M6 28V6" />
        <path d="M9 11l14 12M9 23L23 11" />
      </svg>
    ),
    // Mountains — Plate Tectonics
    mountain: (
      <svg {...common}>
        <path d="M3 25l8-13 5 7 3-4 8 10z" />
      </svg>
    ),
    // Cell — Biology
    cell: (
      <svg {...common}>
        <circle cx="16" cy="16" r="11" />
        <circle cx="18" cy="14" r="4" />
        <circle cx="10.5" cy="20" r="1.4" />
      </svg>
    ),
  };
  return icons[name] || icons.cell;
}

// Small sparkle / AI mark
function SparkMark({ s = 18 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5c.5 4.4 1.6 5.5 6 6-4.4.5-5.5 1.6-6 6-.5-4.4-1.6-5.5-6-6 4.4-.5 5.5-1.6 6-6z" />
      <path d="M19 13.5c.3 2.2.8 2.7 3 3-2.2.3-2.7.8-3 3-.3-2.2-.8-2.7-3-3 2.2-.3 2.7-.8 3-3z" opacity="0.65" />
    </svg>
  );
}

Object.assign(window, { SubjectIcon, SparkMark });
