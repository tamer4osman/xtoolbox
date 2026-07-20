import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";
import { downloadBlob } from "../../utils/file.js";

const STORAGE_KEY = "stats-calc:data";
const HARD_LIMIT = 100000;
const SOFT_WARNING = 10000;
const CHART_LIMIT = 10000;
const DEBOUNCE_MS = 300;

export const toolConfig = {
  id: "stats-calc",
  name: "Statistics Calculator",
  category: "math",
  description:
    "Compute descriptive statistics from any dataset: mean, median, mode, variance, standard deviation, quartiles, percentiles, skewness, kurtosis, and outliers. Includes a histogram and box plot, all 100% in your browser.",
  icon: "📈",
  accept: ".csv,.txt",
  maxSizeMB: 10,
  keywords: [
    "statistics",
    "stats",
    "mean",
    "median",
    "mode",
    "average",
    "variance",
    "standard deviation",
    "stddev",
    "quartile",
    "percentile",
    "decile",
    "range",
    "iqr",
    "skewness",
    "kurtosis",
    "outlier",
    "histogram",
    "box plot",
    "five number summary",
    "descriptive statistics"
  ],
  steps: [
    "Type or paste numbers (comma, space, or newline separated), upload a CSV, or click Generate Sample",
    "Statistics update live as you edit — central tendency, dispersion, position, shape, and outliers",
    "Scroll down for the histogram and box plot visualizations",
    "Copy results as JSON / CSV, or download a TXT report"
  ],
  faqs: [
    {
      question: "Which quartile method does this calculator use?",
      answer:
        "Method 4 (linear interpolation with p(n+1) rank). This matches Python's numpy.quantile, R's default quantile() function, and Excel's QUARTILE.EXC. It interpolates between data points for non-integer ranks, which is the modern standard."
    },
    {
      question: "Why are both sample and population standard deviation shown?",
      answer:
        "Sample standard deviation (dividing by N-1, Bessel's correction) is used when your data is a sample of a larger population. Population standard deviation (dividing by N) is used when your data IS the entire population. Most real datasets are samples, so sample std dev is emphasized, but both are shown so you can pick the right one."
    },
    {
      question: "How is the histogram bin count chosen?",
      answer:
        "Sturges' rule: k = ceil(log2(n) + 1). This is a good default for normally-distributed data. For n=1000, this gives about 11 bins. The bins are equal-width between the minimum and maximum values."
    },
    {
      question: "How are outliers detected?",
      answer:
        "Using the Tukey method: values below Q1 - 1.5*IQR or above Q3 + 1.5*IQR are flagged as outliers, where IQR (interquartile range) = Q3 - Q1. These are the same fences drawn on the box plot whiskers."
    },
    {
      question: "Is my data sent to a server?",
      answer:
        "No. Everything happens locally in your browser using pure JavaScript. Your dataset is saved only to your browser's localStorage so you don't lose it on refresh — it never leaves your machine."
    }
  ]
};

export function parseInput(raw) {
  if (!raw || typeof raw !== "string") return { values: [], skipped: 0 };
  const tokens = raw.split(/[\s,;\t\n]+/).filter(t => t.length > 0);
  const values = [];
  let skipped = 0;
  let headerSkipped = false;
  for (let i = 0; i < tokens.length; i++) {
    const cleaned = tokens[i]
      .replace(/^[$€£¥₹]+/, "")
      .replace(/[€%km]+$/, "")
      .trim();
    if (cleaned.length === 0) continue;
    const n = Number(cleaned);
    if (Number.isFinite(n)) {
      values.push(n);
    } else if (i === 0 && !headerSkipped) {
      headerSkipped = true;
    } else {
      skipped++;
    }
  }
  return { values, skipped };
}

export function mean(values) {
  if (values.length === 0) return null;
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i];
  return sum / values.length;
}

export function median(sorted) {
  const n = sorted.length;
  if (n === 0) return null;
  if (n % 2 === 1) return sorted[(n - 1) / 2];
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

export function mode(values) {
  if (values.length === 0) return [];
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  let maxCount = 0;
  for (const c of counts.values()) if (c > maxCount) maxCount = c;
  if (maxCount === 1) return [];
  const modes = [];
  for (const [v, c] of counts.entries()) if (c === maxCount) modes.push(v);
  return modes.sort((a, b) => a - b);
}

export function variance(values, sample = true) {
  const n = values.length;
  if (n === 0) return null;
  if (sample && n === 1) return null;
  const m = mean(values);
  let sumSq = 0;
  for (const v of values) sumSq += (v - m) * (v - m);
  return sumSq / (sample ? n - 1 : n);
}

export function stdDev(values, sample = true) {
  const v = variance(values, sample);
  return v === null ? null : Math.sqrt(v);
}

export function quantile(sorted, p) {
  const n = sorted.length;
  if (n === 0) return null;
  if (n === 1) return sorted[0];
  if (p <= 0) return sorted[0];
  if (p >= 1) return sorted[n - 1];
  const rank = p * (n + 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo - 1];
  const frac = rank - lo;
  return sorted[lo - 1] + frac * (sorted[hi - 1] - sorted[lo - 1]);
}

export function quartiles(sorted) {
  return {
    q1: quantile(sorted, 0.25),
    q2: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75)
  };
}

export function deciles(sorted) {
  const result = {};
  for (let i = 1; i <= 9; i++) result[`d${i}`] = quantile(sorted, i / 10);
  return result;
}

export function percentile(sorted, p) {
  if (p < 0 || p > 100) return null;
  return quantile(sorted, p / 100);
}

export function meanAbsDeviation(values) {
  if (values.length === 0) return null;
  const m = mean(values);
  let sum = 0;
  for (const v of values) sum += Math.abs(v - m);
  return sum / values.length;
}

export function skewness(values) {
  const n = values.length;
  if (n < 3) return null;
  const m = mean(values);
  const sd = stdDev(values, true);
  if (sd === 0 || sd === null) return null;
  let sum = 0;
  for (const v of values) sum += Math.pow((v - m) / sd, 3);
  return (n / ((n - 1) * (n - 2))) * sum;
}

export function kurtosis(values) {
  const n = values.length;
  if (n < 4) return null;
  const m = mean(values);
  const sd = stdDev(values, true);
  if (sd === 0 || sd === null) return null;
  let sum = 0;
  for (const v of values) sum += Math.pow((v - m) / sd, 4);
  const factor = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const correction = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  return factor * sum - correction;
}

export function detectOutliers(sorted) {
  const n = sorted.length;
  if (n < 4) return { outliers: [], lowerFence: null, upperFence: null };
  const { q1, q3 } = quartiles(sorted);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
  return { outliers, lowerFence, upperFence };
}

export function computeAllStats(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const min = sorted[0];
  const max = sorted[n - 1];
  const m = mean(values);
  const q = quartiles(sorted);
  const dec = deciles(sorted);
  const varPop = variance(values, false);
  const varSamp = variance(values, true);
  const sdPop = varPop === null ? null : Math.sqrt(varPop);
  const sdSamp = varSamp === null ? null : Math.sqrt(varSamp);
  const iqr = q.q3 - q.q1;
  const mad = meanAbsDeviation(values);
  const cv = m === 0 || m === null || sdSamp === null ? null : (sdSamp / Math.abs(m)) * 100;
  const outliersInfo = detectOutliers(sorted);
  let sumSq = 0;
  for (const v of values) sumSq += v * v;
  return {
    count: n,
    sum,
    sumOfSquares: sumSq,
    mean: m,
    median: q.q2,
    mode: mode(values),
    midrange: (min + max) / 2,
    min,
    max,
    range: max - min,
    varianceSample: varSamp,
    variancePopulation: varPop,
    stdDevSample: sdSamp,
    stdDevPopulation: sdPop,
    iqr,
    mad,
    coefficientOfVariation: cv,
    q1: q.q1,
    q2: q.q2,
    q3: q.q3,
    deciles: dec,
    skewness: skewness(values),
    kurtosis: kurtosis(values),
    outliers: outliersInfo.outliers,
    lowerFence: outliersInfo.lowerFence,
    upperFence: outliersInfo.upperFence,
    sorted
  };
}

function sturgesBinCount(n) {
  if (n <= 0) return 1;
  return Math.max(1, Math.ceil(Math.log2(n) + 1));
}

function computeHistogram(sorted, binCount) {
  const n = sorted.length;
  if (n === 0) return { bins: [], binCount: 0 };
  const min = sorted[0];
  const max = sorted[n - 1];
  if (min === max) return { bins: [{ start: min, end: max, count: n }], binCount: 1 };
  const k = binCount || sturgesBinCount(n);
  const width = (max - min) / k;
  const bins = [];
  for (let i = 0; i < k; i++) {
    bins.push({ start: min + i * width, end: min + (i + 1) * width, count: 0 });
  }
  for (const v of sorted) {
    let idx = Math.floor((v - min) / width);
    if (idx >= k) idx = k - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  }
  return { bins, binCount: k };
}

export { sturgesBinCount, computeHistogram, HARD_LIMIT, SOFT_WARNING, CHART_LIMIT };

function fmt(n, digits = 4) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(digits);
  return Number(n.toFixed(digits)).toString();
}

function fmtArr(arr, digits = 4) {
  if (!Array.isArray(arr) || arr.length === 0) return "—";
  if (arr.length === 1) return fmt(arr[0], digits);
  return arr.map(v => fmt(v, digits)).join(", ");
}

function renderStatCard(title, rows) {
  const rowsHtml = rows
    .map(
      r => `
      <div class="sc-stat-row">
        <span class="sc-stat-label">${r.label}</span>
        <span class="sc-stat-value ${r.primary ? "sc-stat-primary" : ""}">${r.value}</span>
      </div>`
    )
    .join("");
  return `
    <div class="sc-card">
      <h3 class="sc-card-title">${title}</h3>
      <div class="sc-stat-list">${rowsHtml}</div>
    </div>`;
}

function getCssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function drawHistogramAxes(ctx, cssW, padL, padR, padT, padB, plotH, maxCount, yTicks) {
  ctx.strokeStyle = getCssVar("--color-border", "#e5e7eb");
  ctx.fillStyle = getCssVar("--color-text-muted", "#6b7280");
  ctx.font = "11px sans-serif";
  ctx.lineWidth = 1;
  for (let i = 0; i <= yTicks; i++) {
    const y = padT + (plotH * i) / yTicks;
    const val = Math.round(maxCount * (1 - i / yTicks));
    ctx.beginPath();
    ctx.moveTo(padL, y + 0.5);
    ctx.lineTo(cssW - padR, y + 0.5);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(String(val), padL - 6, y + 4);
  }
}

function drawHistogramBars(ctx, bins, padL, padT, barW, plotH, maxCount) {
  ctx.fillStyle = getCssVar("--color-primary", "#6366f1");
  for (let i = 0; i < bins.length; i++) {
    const h = (bins[i].count / maxCount) * plotH;
    const x = padL + i * barW;
    const y = padT + plotH - h;
    ctx.fillRect(x + 1, y, Math.max(0, barW - 2), h);
  }
}

function drawHistogramLabels(ctx, bins, cssW, cssH, padL, padR, padB, barW) {
  const muted = getCssVar("--color-text-muted", "#6b7280");
  ctx.fillStyle = muted;
  ctx.textAlign = "center";
  const labelStep = Math.max(1, Math.ceil(bins.length / 8));
  for (let i = 0; i < bins.length; i += labelStep) {
    const x = padL + i * barW + barW / 2;
    ctx.fillText(fmt(bins[i].start, 2), x, cssH - padB + 16);
  }
  ctx.fillText(fmt(bins[bins.length - 1].end, 2), cssW - padR, cssH - padB + 16);
}

function drawHistogram(canvas, stats) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 600;
  const cssH = 240;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.height = cssH + "px";
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);
  if (!stats || stats.count === 0) {
    ctx.fillStyle = getCssVar("--color-text-muted", "#6b7280");
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Enter data to see histogram", cssW / 2, cssH / 2);
    return;
  }
  const sample =
    stats.count > CHART_LIMIT
      ? stats.sorted.filter((_, i) => i % Math.ceil(stats.count / CHART_LIMIT) === 0)
      : stats.sorted;
  const { bins } = computeHistogram(sample);
  if (!bins || bins.length === 0) return;
  const maxCount = Math.max(...bins.map(b => b.count), 1);
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = cssW - padL - padR;
  const plotH = cssH - padT - padB;
  const barW = plotW / bins.length;
  const yTicks = 5;
  drawHistogramAxes(ctx, cssW, padL, padR, padT, padB, plotH, maxCount, yTicks);
  drawHistogramBars(ctx, bins, padL, padT, barW, plotH, maxCount);
  const muted = getCssVar("--color-text-muted", "#6b7280");
  drawHistogramLabels(ctx, bins, cssW, cssH, padL, padR, padB, barW);
  ctx.save();
  ctx.translate(14, padT + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = muted;
  ctx.fillText("Frequency", 0, 0);
  ctx.restore();
}

function computeWhiskers(sorted, lowerFence, upperFence) {
  const wLo = sorted.find(v => v >= lowerFence);
  const wHi = [...sorted].reverse().find(v => v <= upperFence);
  return { wLo, wHi };
}

function drawWhiskers(ctx, toX, boxY, q1, q3, wLo, wHi, min, max) {
  const lo = wLo ?? min;
  const hi = wHi ?? max;
  ctx.beginPath();
  ctx.moveTo(toX(lo), boxY);
  ctx.lineTo(toX(q1), boxY);
  ctx.moveTo(toX(lo), boxY - 8);
  ctx.lineTo(toX(lo), boxY + 8);
  ctx.moveTo(toX(q3), boxY);
  ctx.lineTo(toX(hi), boxY);
  ctx.moveTo(toX(hi), boxY - 8);
  ctx.lineTo(toX(hi), boxY + 8);
  ctx.stroke();
}

function drawBox(ctx, toX, boxY, boxH, q1, q2, q3) {
  ctx.fillRect(toX(q1), boxY - boxH / 2, toX(q3) - toX(q1), boxH);
  ctx.strokeRect(toX(q1), boxY - boxH / 2, toX(q3) - toX(q1), boxH);
  ctx.beginPath();
  ctx.moveTo(toX(q2), boxY - boxH / 2);
  ctx.lineTo(toX(q2), boxY + boxH / 2);
  ctx.stroke();
}

function drawOutliers(ctx, toX, boxY, outliers) {
  for (const o of outliers) {
    ctx.beginPath();
    ctx.arc(toX(o), boxY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoxLabels(ctx, toX, boxY, boxH, labels) {
  for (const { v, label } of labels) {
    const x = toX(v);
    ctx.fillText(label, x, boxY + boxH / 2 + 16);
    ctx.fillText(fmt(v, 2), x, boxY + boxH / 2 + 30);
  }
}

function drawBoxPlot(canvas, stats) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 600;
  const cssH = 160;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.height = cssH + "px";
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);
  if (!stats || stats.count === 0) {
    ctx.fillStyle = getCssVar("--color-text-muted", "#6b7280");
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Enter data to see box plot", cssW / 2, cssH / 2);
    return;
  }
  const { min, max, q1, q2, q3, lowerFence, upperFence, outliers } = stats;
  const padL = 50;
  const padR = 20;
  const padT = 30;
  const padB = 40;
  const plotW = cssW - padL - padR;
  const plotH = cssH - padT - padB;
  const range = max - min || 1;
  const toX = v => padL + ((v - min) / range) * plotW;
  const boxY = padT + plotH / 2;
  const boxH = Math.min(60, plotH * 0.5);
  const muted =
    getComputedStyle(document.documentElement).getPropertyValue("--color-text-muted").trim() ||
    "#6b7280";
  const border =
    getComputedStyle(document.documentElement).getPropertyValue("--color-border").trim() ||
    "#e5e7eb";
  const accent =
    getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() ||
    "#6366f1";
  const surface =
    getComputedStyle(document.documentElement).getPropertyValue("--color-surface").trim() || "#fff";
  const { wLo, wHi } = computeWhiskers(stats.sorted, lowerFence, upperFence);
  ctx.strokeStyle = muted;
  ctx.fillStyle = muted;
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  drawWhiskers(ctx, toX, boxY, q1, q3, wLo, wHi, min, max);
  ctx.fillStyle = surface;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  drawBox(ctx, toX, boxY, boxH, q1, q2, q3);
  ctx.lineWidth = 1;
  if (outliers && outliers.length > 0) {
    ctx.fillStyle = border;
    drawOutliers(ctx, toX, boxY, outliers);
  }
  ctx.fillStyle = muted;
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  const labels = [
    { v: min, label: "Min" },
    { v: q1, label: "Q1" },
    { v: q2, label: "Med" },
    { v: q3, label: "Q3" },
    { v: max, label: "Max" }
  ];
  drawBoxLabels(ctx, toX, boxY, boxH, labels);
}

function buildResultsHtml(stats) {
  if (!stats) {
    return '<div class="sc-empty">Enter some numbers above to see statistics.</div>';
  }
  const cvText =
    stats.coefficientOfVariation === null ? "—" : fmt(stats.coefficientOfVariation) + "%";
  const decileRows = Object.entries(stats.deciles).map(([k, v]) => {
    const pct = Number(k.slice(1)) * 10;
    return { label: `${pct}th percentile (D${k.slice(1)})`, value: fmt(v) };
  });
  return (
    renderStatCard("Central Tendency", [
      { label: "Mean", value: fmt(stats.mean) },
      { label: "Median", value: fmt(stats.median) },
      { label: "Mode", value: stats.mode.length === 0 ? "No mode" : fmtArr(stats.mode) },
      { label: "Midrange", value: fmt(stats.midrange) }
    ]) +
    renderStatCard("Dispersion", [
      { label: "Std Dev (sample)", value: fmt(stats.stdDevSample), primary: true },
      { label: "Std Dev (population)", value: fmt(stats.stdDevPopulation) },
      { label: "Variance (sample)", value: fmt(stats.varianceSample) },
      { label: "Variance (population)", value: fmt(stats.variancePopulation) },
      { label: "Range", value: fmt(stats.range) },
      { label: "IQR", value: fmt(stats.iqr) },
      { label: "Mean Abs Deviation", value: fmt(stats.mad) },
      { label: "Coeff of Variation", value: cvText }
    ]) +
    renderStatCard(
      "Position",
      [
        { label: "Minimum", value: fmt(stats.min) },
        { label: "Q1 (25th)", value: fmt(stats.q1) },
        { label: "Median (Q2)", value: fmt(stats.q2) },
        { label: "Q3 (75th)", value: fmt(stats.q3) },
        { label: "Maximum", value: fmt(stats.max) },
        { label: "Lower fence", value: fmt(stats.lowerFence) },
        { label: "Upper fence", value: fmt(stats.upperFence) }
      ].concat(decileRows)
    ) +
    renderStatCard("Shape & Size", [
      { label: "Count (N)", value: fmt(stats.count) },
      { label: "Sum", value: fmt(stats.sum) },
      { label: "Sum of squares", value: fmt(stats.sumOfSquares) },
      { label: "Skewness", value: fmt(stats.skewness) },
      { label: "Kurtosis (excess)", value: fmt(stats.kurtosis) }
    ]) +
    renderStatCard("Outliers", [
      {
        label: "Count",
        value: stats.outliers.length === 0 ? "None detected" : String(stats.outliers.length)
      },
      { label: "Values", value: stats.outliers.length === 0 ? "—" : fmtArr(stats.outliers) }
    ])
  );
}

function buildStatsJson(stats, values) {
  if (!stats) return JSON.stringify({ error: "No data" }, null, 2);
  return JSON.stringify(
    {
      count: stats.count,
      sum: stats.sum,
      sumOfSquares: stats.sumOfSquares,
      mean: stats.mean,
      median: stats.median,
      mode: stats.mode,
      midrange: stats.midrange,
      min: stats.min,
      max: stats.max,
      range: stats.range,
      varianceSample: stats.varianceSample,
      variancePopulation: stats.variancePopulation,
      stdDevSample: stats.stdDevSample,
      stdDevPopulation: stats.stdDevPopulation,
      iqr: stats.iqr,
      meanAbsoluteDeviation: stats.mad,
      coefficientOfVariation: stats.coefficientOfVariation,
      quartiles: { q1: stats.q1, q2: stats.q2, q3: stats.q3 },
      deciles: stats.deciles,
      skewness: stats.skewness,
      kurtosis: stats.kurtosis,
      outliers: stats.outliers,
      lowerFence: stats.lowerFence,
      upperFence: stats.upperFence,
      data: values
    },
    null,
    2
  );
}

function buildStatsCsv(stats) {
  if (!stats) return "metric,value\n";
  const rows = [
    ["count", stats.count],
    ["sum", stats.sum],
    ["sum_of_squares", stats.sumOfSquares],
    ["mean", stats.mean],
    ["median", stats.median],
    ["mode", stats.mode.join(";")],
    ["midrange", stats.midrange],
    ["min", stats.min],
    ["q1", stats.q1],
    ["median_q2", stats.q2],
    ["q3", stats.q3],
    ["max", stats.max],
    ["range", stats.range],
    ["variance_sample", stats.varianceSample],
    ["variance_population", stats.variancePopulation],
    ["stddev_sample", stats.stdDevSample],
    ["stddev_population", stats.stdDevPopulation],
    ["iqr", stats.iqr],
    ["mad", stats.mad],
    ["coefficient_of_variation", stats.coefficientOfVariation],
    ["skewness", stats.skewness],
    ["kurtosis", stats.kurtosis],
    ["outliers_count", stats.outliers.length],
    ["outliers", stats.outliers.join(";")],
    ["lower_fence", stats.lowerFence],
    ["upper_fence", stats.upperFence]
  ];
  return (
    "metric,value\n" + rows.map(r => r[0] + "," + (r[1] === null ? "" : String(r[1]))).join("\n")
  );
}

function buildStatsTxt(stats) {
  if (!stats) return "No data provided.";
  const line = "=".repeat(48);
  const r = (label, val) => `${label.padEnd(28)} ${val}`;
  return [
    "STATISTICS CALCULATOR REPORT",
    line,
    "",
    "-- Central Tendency --",
    r("Count (N):", stats.count),
    r("Mean:", fmt(stats.mean)),
    r("Median:", fmt(stats.median)),
    r("Mode:", stats.mode.length === 0 ? "No mode" : fmtArr(stats.mode)),
    r("Midrange:", fmt(stats.midrange)),
    "",
    "-- Dispersion --",
    r("Std Dev (sample):", fmt(stats.stdDevSample)),
    r("Std Dev (population):", fmt(stats.stdDevPopulation)),
    r("Variance (sample):", fmt(stats.varianceSample)),
    r("Variance (population):", fmt(stats.variancePopulation)),
    r("Range:", fmt(stats.range)),
    r("IQR:", fmt(stats.iqr)),
    r("Mean Abs Deviation:", fmt(stats.mad)),
    r(
      "Coeff of Variation:",
      stats.coefficientOfVariation === null ? "—" : fmt(stats.coefficientOfVariation) + "%"
    ),
    "",
    "-- Position --",
    r("Minimum:", fmt(stats.min)),
    r("Q1 (25th):", fmt(stats.q1)),
    r("Q2 / Median:", fmt(stats.q2)),
    r("Q3 (75th):", fmt(stats.q3)),
    r("Maximum:", fmt(stats.max)),
    r("Lower fence:", fmt(stats.lowerFence)),
    r("Upper fence:", fmt(stats.upperFence)),
    "",
    "-- Shape --",
    r("Skewness:", fmt(stats.skewness)),
    r("Kurtosis (excess):", fmt(stats.kurtosis)),
    r("Sum:", fmt(stats.sum)),
    r("Sum of squares:", fmt(stats.sumOfSquares)),
    "",
    "-- Outliers --",
    r("Count:", stats.outliers.length === 0 ? "None detected" : String(stats.outliers.length)),
    r("Values:", stats.outliers.length === 0 ? "—" : fmtArr(stats.outliers)),
    "",
    line
  ].join("\n");
}

function generateSampleData() {
  const count = 80;
  const values = [];
  for (let i = 0; i < count; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    values.push(Math.round(50 + z * 15));
  }
  return values.join(", ");
}

export function render(container) {
  const style = document.createElement("style");
  style.textContent = `
    .sc-input-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);}
    .sc-input-row{display:flex;gap:var(--space-2);margin-bottom:var(--space-2);flex-wrap:wrap;}
    .sc-input-row textarea{flex:1;min-height:100px;font-family:monospace;font-size:var(--text-sm);padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);resize:vertical;background:var(--color-bg);color:var(--color-text);}
    .sc-btn-row{display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center;}
    .sc-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--space-3);margin-bottom:var(--space-4);}
    .sc-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);}
    .sc-card-title{font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-2);text-transform:uppercase;letter-spacing:0.05em;}
    .sc-stat-row{display:flex;justify-content:space-between;align-items:center;padding:var(--space-1) 0;border-bottom:1px solid var(--color-border);gap:var(--space-2);}
    .sc-stat-row:last-child{border-bottom:none;}
    .sc-stat-label{font-size:var(--text-xs);color:var(--color-text-muted);}
    .sc-stat-value{font-family:monospace;font-size:var(--text-sm);font-weight:500;text-align:right;}
    .sc-stat-primary{color:var(--color-primary);font-weight:700;}
    .sc-chart-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-4);}
    .sc-chart-title{font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-2);}
    .sc-chart-card canvas{width:100%;display:block;}
    .sc-empty{padding:var(--space-6);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);background:var(--color-surface);border:1px dashed var(--color-border);border-radius:var(--radius-md);}
    .sc-meta{font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-2);}
    .sc-pct-row{display:flex;gap:var(--space-2);align-items:center;margin-top:var(--space-2);flex-wrap:wrap;}
    .sc-pct-row input{width:80px;padding:var(--space-1);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--text-sm);}
    .sc-pct-result{font-family:monospace;font-size:var(--text-sm);font-weight:600;color:var(--color-primary);}
    .sc-export-row{display:flex;gap:var(--space-2);flex-wrap:wrap;margin-top:var(--space-3);}
  `;
  container.appendChild(style);

  container.innerHTML += `
    <div class="tool-layout">
      <div class="sc-input-card">
        <label for="stats-calc-input" style="font-size:var(--text-sm);font-weight:600;display:block;margin-bottom:var(--space-2);">Enter numbers (comma, space, or newline separated)</label>
        <div class="sc-input-row">
          <textarea id="stats-calc-input" placeholder="e.g. 1, 2, 3, 4, 5 or paste a column of numbers..."></textarea>
        </div>
        <div class="sc-btn-row">
          <button class="btn btn-secondary" id="stats-calc-sample" type="button">Generate Sample</button>
          <button class="btn btn-secondary" id="stats-calc-upload-btn" type="button">Upload CSV/TXT</button>
          <input type="file" id="stats-calc-file" accept=".csv,.txt" style="display:none;">
          <button class="btn btn-secondary" id="stats-calc-clear" type="button">Clear</button>
        </div>
        <div class="sc-meta" id="stats-calc-meta"></div>
      </div>

      <div id="stats-calc-custom-pct" style="margin-bottom:var(--space-3);"></div>
      <div class="sc-stats-grid" id="stats-calc-results"></div>

      <div class="sc-chart-card">
        <div class="sc-chart-title">Histogram (Sturges' bins)</div>
        <canvas id="stats-calc-histogram"></canvas>
      </div>

      <div class="sc-chart-card">
        <div class="sc-chart-title">Box Plot (5-number summary + outliers)</div>
        <canvas id="stats-calc-boxplot"></canvas>
      </div>

      <div class="sc-export-row" id="stats-calc-export" style="display:none;">
        <button class="btn btn-secondary" id="stats-calc-copy-json" type="button">Copy JSON</button>
        <button class="btn btn-secondary" id="stats-calc-copy-csv" type="button">Copy CSV</button>
        <button class="btn btn-secondary" id="stats-calc-download-txt" type="button">Download TXT</button>
      </div>
    </div>
  `;

  const inputEl = container.querySelector("#stats-calc-input");
  const sampleBtn = container.querySelector("#stats-calc-sample");
  const uploadBtn = container.querySelector("#stats-calc-upload-btn");
  const fileEl = container.querySelector("#stats-calc-file");
  const clearBtn = container.querySelector("#stats-calc-clear");
  const metaEl = container.querySelector("#stats-calc-meta");
  const resultsEl = container.querySelector("#stats-calc-results");
  const histCanvas = container.querySelector("#stats-calc-histogram");
  const boxCanvas = container.querySelector("#stats-calc-boxplot");
  const exportRow = container.querySelector("#stats-calc-export");
  const pctEl = container.querySelector("#stats-calc-custom-pct");

  let currentStats = null;
  let currentValues = [];
  let warnedLarge = false;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) inputEl.value = saved;
  } catch {
    // ignore
  }

  function saveInput() {
    try {
      localStorage.setItem(STORAGE_KEY, inputEl.value);
    } catch {
      // ignore
    }
  }

  function renderCustomPct(stats) {
    if (!stats) {
      pctEl.innerHTML = "";
      return;
    }
    pctEl.innerHTML = `
      <div class="sc-card">
        <h3 class="sc-card-title">Custom Percentile</h3>
        <div class="sc-pct-row">
          <input type="number" id="sc-pct-input" min="0" max="100" step="1" value="90">
          <span style="font-size:var(--text-sm);color:var(--color-text-muted);">th percentile =</span>
          <span class="sc-pct-result" id="sc-pct-result">—</span>
        </div>
      </div>`;
    const pctInput = pctEl.querySelector("#sc-pct-input");
    const pctResult = pctEl.querySelector("#sc-pct-result");
    const updatePct = () => {
      const p = parseFloat(pctInput.value);
      if (!Number.isFinite(p) || p < 0 || p > 100) {
        pctResult.textContent = "—";
      } else {
        pctResult.textContent = fmt(percentile(stats.sorted, p));
      }
    };
    pctInput.addEventListener("input", updatePct);
    updatePct();
  }

  function update() {
    const raw = inputEl.value;
    saveInput();
    const { values, skipped } = parseInput(raw);

    if (values.length > HARD_LIMIT) {
      if (!warnedLarge) {
        showToast({
          message: `Dataset exceeds ${HARD_LIMIT.toLocaleString()} values. Please reduce the input size.`,
          type: "error"
        });
        warnedLarge = true;
      }
      return;
    }
    warnedLarge = false;

    if (values.length >= SOFT_WARNING) {
      showToast({
        message: `Large dataset (${values.length.toLocaleString()} values) — calculation may take a moment.`,
        type: "info"
      });
    }

    currentValues = values;
    currentStats = computeAllStats(values);

    const metaParts = [`N = ${values.length}`];
    if (values.length > 0) metaParts.push(`Sum = ${fmt(currentStats.sum)}`);
    if (skipped > 0)
      metaParts.push(`(${skipped} non-numeric value${skipped > 1 ? "s" : ""} skipped)`);
    metaEl.textContent = metaParts.join(" · ");

    resultsEl.innerHTML = buildResultsHtml(currentStats);
    renderCustomPct(currentStats);
    exportRow.style.display = currentStats ? "flex" : "none";

    requestAnimationFrame(() => {
      drawHistogram(histCanvas, currentStats);
      drawBoxPlot(boxCanvas, currentStats);
    });
  }

  const debouncedUpdate = debounce(update, DEBOUNCE_MS);
  inputEl.addEventListener("input", debouncedUpdate);

  sampleBtn.addEventListener("click", () => {
    inputEl.value = generateSampleData();
    update();
  });

  uploadBtn.addEventListener("click", () => fileEl.click());

  fileEl.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      inputEl.value = text;
      update();
    } catch {
      showToast({ message: "Failed to read file", type: "error" });
    }
    fileEl.value = "";
  });

  clearBtn.addEventListener("click", () => {
    inputEl.value = "";
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    update();
    inputEl.focus();
  });

  container.querySelector("#stats-calc-copy-json").addEventListener("click", () => {
    copyToClipboard(buildStatsJson(currentStats, currentValues));
    showToast({ message: "Stats copied as JSON", type: "success" });
  });
  container.querySelector("#stats-calc-copy-csv").addEventListener("click", () => {
    copyToClipboard(buildStatsCsv(currentStats));
    showToast({ message: "Stats copied as CSV", type: "success" });
  });
  container.querySelector("#stats-calc-download-txt").addEventListener("click", () => {
    const blob = new Blob([buildStatsTxt(currentStats)], { type: "text/plain" });
    downloadBlob(blob, "statistics-report.txt");
  });

  let resizeTimer;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentStats) {
        drawHistogram(histCanvas, currentStats);
        drawBoxPlot(boxCanvas, currentStats);
      }
    }, 150);
  });
  resizeObserver.observe(histCanvas);

  update();
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function destroy() {}
