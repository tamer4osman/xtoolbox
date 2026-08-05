import { parse, evaluate, derivative, simplify } from "mathjs";
import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";

const EPS = 1e-9;
const FRACTION_SEARCH_LIMIT = 1000;

const KATEX_CSS = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
const KATEX_CSS_SRI = "sha256-UF1fgpAiu3tPJN/uCqEUHNe7pnr+QR0SQDNfgglgtcM=";
const KATEX_JS = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
const KATEX_JS_SRI = "sha256-3ISyluw+iE3gkxWPdg/Z1Ftser5YtTgVV/ThOPRqWK4=";

const BUILTIN_SYMBOLS = new Set(["pi", "e", "i", "tau", "phi", "Infinity", "NaN", "true", "false"]);

export const toolConfig = {
  id: "equation-solver",
  name: "Equation Solver",
  category: "math",
  description:
    "Solve linear and quadratic equations and systems of two linear equations step by step. Shows the full working — isolating variables, applying the quadratic formula, and Cramer's rule — rendered as clean LaTeX, all 100% in your browser.",
  icon: "📐",
  keywords: [
    "equation",
    "solver",
    "solve",
    "algebra",
    "linear",
    "quadratic",
    "system of equations",
    "step by step",
    "x",
    "formula",
    "roots",
    "discriminant",
    "math",
    "cramer's rule"
  ],
  steps: [
    "Pick the equation type: linear, quadratic, or a system of two linear equations",
    "Type the equation(s) — e.g. 2x + 3 = 7, x^2 - 5x + 6 = 0, or x + y = 5 and x - y = 1",
    "Click Solve to see the full step-by-step working rendered with LaTeX",
    "Copy the solution as LaTeX for your notes or documents"
  ],
  faqs: [
    {
      question: "What types of equations can this solver handle?",
      answer:
        "Linear equations in one variable (ax + b = 0), quadratic equations (ax² + bx + c = 0) including those with complex roots, and systems of two linear equations in two variables. Equations containing functions like sin, log, or variables in a denominator are not supported."
    },
    {
      question: "How are quadratic equations solved?",
      answer:
        "Using the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a. The discriminant Δ = b² - 4ac tells you the outcome: if Δ > 0 there are two real roots, if Δ = 0 one repeated root, and if Δ < 0 two complex conjugate roots."
    },
    {
      question: "How are systems of two equations solved?",
      answer:
        "Each equation is rearranged into the form ax + by = c, then solved with Cramer's rule using the determinant Δ = a₁b₂ - a₂b₁. If the determinant is zero, the lines are either parallel (no solution) or the same line (infinitely many solutions)."
    },
    {
      question: "What notation can I use when typing equations?",
      answer:
        "Standard math notation with implicit multiplication is supported: 2x, x^2 (or x²), and the operators +, -, *, /, ^. Unicode symbols like −, × and ÷ are also accepted. You can also pick from the example dropdown."
    },
    {
      question: "Is my equation sent to a server?",
      answer:
        "No. All solving happens locally in your browser. Nothing you type ever leaves your machine."
    }
  ]
};

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

export function isZero(value, scale) {
  return Math.abs(value) <= EPS * Math.max(1, Math.abs(scale));
}

export function normalizeEquation(str) {
  return String(str || "")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/[\u2212\u2013\u2014]/g, "-")
    .replace(/[×✕]/g, "*")
    .replace(/[⋅·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[＝=]/g, "=")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPolynomialDegree(node, variables) {
  if (!node) return 0;
  switch (node.type) {
    case "ConstantNode":
      return 0;
    case "SymbolNode":
      return variables.has(node.name) ? 1 : 0;
    case "ParenthesisNode":
      return getPolynomialDegree(node.content, variables);
    case "UnaryMinusNode":
    case "UnaryPlusNode":
      return getPolynomialDegree(node.args[0], variables);
    case "OperatorNode": {
      const op = node.op;
      if (op === "+" || op === "-") {
        if (node.args.length === 1) {
          return getPolynomialDegree(node.args[0], variables);
        }
        const d0 = getPolynomialDegree(node.args[0], variables);
        const d1 = getPolynomialDegree(node.args[1], variables);
        if (d0 === -1 || d1 === -1) return -1;
        return Math.max(d0, d1);
      }
      if (op === "*") {
        const d0 = getPolynomialDegree(node.args[0], variables);
        const d1 = getPolynomialDegree(node.args[1], variables);
        if (d0 === -1 || d1 === -1) return -1;
        return d0 + d1;
      }
      if (op === "/") {
        const num = getPolynomialDegree(node.args[0], variables);
        if (num === -1) return -1;
        const denom = getPolynomialDegree(node.args[1], variables);
        if (denom > 0) return -1;
        return num;
      }
      if (op === "^") {
        const base = getPolynomialDegree(node.args[0], variables);
        const expNode = node.args[1];
        if (
          base >= 0 &&
          expNode.type === "ConstantNode" &&
          Number.isInteger(expNode.value) &&
          expNode.value >= 0
        ) {
          return base * expNode.value;
        }
        return -1;
      }
      if (op === "%") return -1;
      return -1;
    }
    case "FunctionNode": {
      const anyVariable = node.args.some(a => getPolynomialDegree(a, variables) > 0);
      return anyVariable ? -1 : 0;
    }
    default:
      return -1;
  }
}

export function getSymbols(node, acc = new Set()) {
  if (!node) return acc;
  if (node.type === "SymbolNode") acc.add(node.name);
  if (node.content) getSymbols(node.content, acc);
  if (node.args) node.args.forEach(a => getSymbols(a, acc));
  return acc;
}

function validateVariable(name) {
  if (!/^[a-zA-Z]$/.test(name)) {
    throw new Error("Variable must be a single letter, e.g. x, y or t.");
  }
}

function splitEquation(equation, vars) {
  const norm = normalizeEquation(equation);
  if (!norm) throw new Error("Please enter an equation.");
  const parts = norm.split("=");
  if (parts.length !== 2) {
    throw new Error("Equation must contain exactly one '=' sign.");
  }
  const lhs = parts[0].trim();
  const rhs = parts[1].trim();
  if (!lhs || !rhs) throw new Error("Both sides of the equation are required.");
  const names = Array.isArray(vars) ? vars : [vars];
  const present = names.filter(n => norm.includes(n));
  if (present.length === 0) {
    if (names.length === 1) {
      throw new Error(`The equation doesn't contain the variable "${vars}".`);
    }
    throw new Error(
      `The equation doesn't contain either variable ${names.map(n => `"${n}"`).join(" or ")}.`
    );
  }
  return { lhs, rhs, fExpr: `(${lhs}) - (${rhs})` };
}

function checkExtraSymbols(node, allowed) {
  const extra = [...getSymbols(node)].filter(s => !allowed.has(s));
  if (extra.length > 0) {
    throw new Error(
      `Found extra variable${extra.length > 1 ? "s" : ""}: ${extra.join(", ")}. Use a single variable here (or switch to System mode for two variables).`
    );
  }
}

export function extractCoefficients(fExpr, varName) {
  const atZero = { [varName]: 0 };
  const c = evaluate(fExpr, atZero);
  const d1 = derivative(fExpr, varName);
  const b = d1.evaluate(atZero);
  const d2 = derivative(d1.toString(), varName);
  const a = d2.evaluate(atZero) / 2;
  return { a, b, c };
}

function extractLinearCoeffs(fExpr, v1, v2) {
  const atZero = { [v1]: 0, [v2]: 0 };
  const c = -evaluate(fExpr, atZero);
  const dx = derivative(fExpr, v1);
  const a = dx.evaluate(atZero);
  const dy = derivative(fExpr, v2);
  const b = dy.evaluate(atZero);
  return { a, b, c };
}

function toFraction(value) {
  if (!Number.isFinite(value)) return null;
  if (Math.abs(value) < 1e-12) return { p: 0, q: 1 };
  const neg = value < 0;
  const abs = Math.abs(value);
  for (let d = 1; d <= FRACTION_SEARCH_LIMIT; d++) {
    const num = abs * d;
    const r = Math.round(num);
    if (Math.abs(num - r) < 1e-9) {
      const g = gcd(r, d);
      return { p: (neg ? -r : r) / g, q: d / g };
    }
  }
  return null;
}

export function fmtNum(n) {
  if (!Number.isFinite(n)) return "undefined";
  if (Math.abs(n) < 1e-12) return "0";
  return String(Number(n.toPrecision(10)));
}

export function texNum(value) {
  if (!Number.isFinite(value)) return "\\text{undefined}";
  if (Math.abs(value) < 1e-12) return "0";
  const f = toFraction(value);
  if (!f) return fmtNum(value);
  if (f.q === 1) return String(f.p);
  return f.p < 0 ? `-\\frac{${Math.abs(f.p)}}{${f.q}}` : `\\frac{${f.p}}{${f.q}}`;
}

function texClean(expr) {
  return String(expr)
    .replace(/\s*\*\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fmtComplex({ re, im }) {
  const rePart = Math.abs(re) < 1e-12 ? "" : fmtNum(re);
  const imPart = fmtNum(im);
  if (!rePart) return `${imPart}i`;
  if (im < 0) return `${rePart} - ${fmtNum(Math.abs(im))}i`;
  return `${rePart} + ${imPart}i`;
}

function texComplex({ re, im }) {
  const reZero = Math.abs(re) < 1e-12;
  const imNum = texNum(im);
  if (reZero) return `${imNum}i`;
  if (Math.abs(im) < 1e-12) return texNum(re);
  const sign = im < 0 ? " - " : " + ";
  return `${texNum(re)}${sign}${texNum(Math.abs(im))}i`;
}

function texSignedTerm(coeff, v) {
  const sign = coeff < 0 ? " - " : " + ";
  const mag = Math.abs(coeff);
  const num = Math.abs(mag - 1) < 1e-12 ? "" : texNum(mag);
  return `${sign}${num}${v}`;
}

function texSignedConst(c) {
  const sign = c < 0 ? " - " : " + ";
  return `${sign}${texNum(Math.abs(c))}`;
}

function texPolyQuadratic(a, b, c, v) {
  const aMag = Math.abs(a);
  const aNum = Math.abs(aMag - 1) < 1e-12 ? "" : texNum(aMag);
  const parts = [(a < 0 ? "-" : "") + aNum + `${v}^2`];
  if (Math.abs(b) > 1e-12) parts.push(texSignedTerm(b, v));
  if (Math.abs(c) > 1e-12) parts.push(texSignedConst(c));
  return parts.join(" ");
}

function simplifyForDisplay(fExpr) {
  try {
    return texClean(simplify(fExpr).toString());
  } catch {
    return texClean(fExpr);
  }
}

export function solveLinearInTermsOf(fExpr, lhs, rhs, varName, extra) {
  const simplified = simplifyForDisplay(fExpr);
  const aNode = simplify(derivative(fExpr, varName).toString());
  const bNode = simplify(
    parse(fExpr)
      .transform(n => (n.type === "SymbolNode" && n.name === varName ? parse("0") : n))
      .toString()
  );
  const rootNode = simplify(`(-(${bNode.toString()}))/(${aNode.toString()})`);
  const rootTex = texClean(rootNode.toTex());
  const steps = [
    { title: "Original equation", tex: `${texClean(lhs)} = ${texClean(rhs)}` },
    { title: "Bring all terms to one side", tex: `${simplified} = 0` },
    { title: "Isolate the variable", tex: `${varName} = ${rootTex}` },
    { title: "Solution", tex: `${varName} = ${rootTex}` }
  ];
  return {
    mode: "linear",
    parameterized: true,
    solution: { kind: "unique", variable: varName, roots: [rootNode.toString()] },
    steps,
    answerTex: `${varName} = ${rootTex}`,
    answerPlain: `${varName} = ${rootNode.toString()}`,
    note: `The equation contains extra variable${extra.length > 1 ? "s" : ""} ${extra.join(", ")}.`
  };
}

export function solveLinear(equation, varName = "x") {
  validateVariable(varName);
  const { lhs, rhs, fExpr } = splitEquation(equation, varName);
  let node;
  try {
    node = parse(fExpr);
  } catch {
    throw new Error(`Could not parse "${equation}". Check the syntax, e.g. "2x + 3 = 7".`);
  }
  const allowed = new Set([varName, ...BUILTIN_SYMBOLS]);
  const extra = [...getSymbols(node)].filter(s => !allowed.has(s));
  const degree = getPolynomialDegree(node, new Set([varName]));
  if (degree === -1) {
    throw new Error(
      "This solver handles polynomial equations only (no sin, log, or variables in a denominator)."
    );
  }
  if (degree > 1) {
    throw new Error(
      `This looks like a degree-${degree} equation. Switch to Quadratic mode for degree 2, or use a dedicated tool for higher degrees.`
    );
  }
  if (extra.length > 0) {
    return solveLinearInTermsOf(fExpr, lhs, rhs, varName, extra);
  }

  const simplified = simplifyForDisplay(fExpr);
  const baseSteps = [
    { title: "Original equation", tex: `${texClean(lhs)} = ${texClean(rhs)}` },
    { title: "Bring all terms to one side", tex: `${simplified} = 0` }
  ];

  const coeffs = extractCoefficients(fExpr, varName);
  const a = coeffs.b; // coefficient of the variable (ax + b = 0)
  const b = coeffs.c; // constant term
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);

  if (isZero(a, scale)) {
    if (isZero(b, scale)) {
      const steps = [
        ...baseSteps,
        { title: "Coefficients", tex: `${varName} \\cdot 0 + 0 = 0` },
        { title: "Result", tex: "\\text{Infinitely many solutions (identity)}" }
      ];
      return {
        mode: "linear",
        solution: { kind: "infinite", variable: varName, roots: [] },
        steps,
        answerTex: `${varName} \\in \\mathbb{R}`,
        answerPlain: `Infinitely many solutions (${varName} can be any real number)`
      };
    }
    const steps = [
      ...baseSteps,
      { title: "Coefficients", tex: `${varName} \\cdot 0 + ${texNum(b)} = 0` },
      { title: "Result", tex: "\\text{No solution (contradiction)}" }
    ];
    return {
      mode: "linear",
      solution: { kind: "none", variable: varName, roots: [] },
      steps,
      answerTex: "\\text{No solution}",
      answerPlain: "No solution"
    };
  }

  const root = -b / a;
  const steps = [
    ...baseSteps,
    {
      title: "Identify coefficients (ax + b = 0)",
      tex: `a = ${texNum(a)},\\quad b = ${texNum(b)}`
    },
    {
      title: "Isolate the variable",
      tex: `${varName} = -\\frac{b}{a} = -\\frac{${texNum(b)}}{${texNum(a)}} = ${texNum(root)}`
    },
    { title: "Solution", tex: `${varName} = ${texNum(root)}` }
  ];
  return {
    mode: "linear",
    solution: { kind: "unique", variable: varName, root, roots: [root] },
    steps,
    answerTex: `${varName} = ${texNum(root)}`,
    answerPlain: `${varName} = ${fmtNum(root)}`
  };
}

export function solveQuadratic(equation, varName = "x") {
  validateVariable(varName);
  const { lhs, rhs, fExpr } = splitEquation(equation, varName);
  let node;
  try {
    node = parse(fExpr);
  } catch {
    throw new Error(`Could not parse "${equation}". Check the syntax, e.g. "x^2 - 5x + 6 = 0".`);
  }
  const allowed = new Set([varName, ...BUILTIN_SYMBOLS]);
  checkExtraSymbols(node, allowed);
  const degree = getPolynomialDegree(node, new Set([varName]));
  if (degree === -1) {
    throw new Error(
      "This solver handles polynomial equations only (no sin, log, or variables in a denominator)."
    );
  }
  if (degree > 2) {
    throw new Error(
      `This equation has degree ${degree}. Only equations up to degree 2 are supported.`
    );
  }
  if (degree <= 1) {
    const result = solveLinear(equation, varName);
    return {
      ...result,
      mode: "quadratic",
      note: "This equation is actually linear, so it was solved with the linear method."
    };
  }

  const simplified = simplifyForDisplay(fExpr);
  const { a, b, c } = extractCoefficients(fExpr, varName);

  const steps = [
    { title: "Original equation", tex: `${texClean(lhs)} = ${texClean(rhs)}` },
    { title: "Bring all terms to one side", tex: `${simplified} = 0` },
    { title: "Standard form", tex: `${texPolyQuadratic(a, b, c, varName)} = 0` },
    {
      title: "Identify coefficients (ax² + bx + c = 0)",
      tex: `a = ${texNum(a)},\\quad b = ${texNum(b)},\\quad c = ${texNum(c)}`
    }
  ];

  const D = b * b - 4 * a * c;
  const DScale = Math.max(Math.abs(b * b), Math.abs(4 * a * c), 1);

  if (D > EPS * DScale) {
    const sqrtD = Math.sqrt(D);
    const r1 = (-b + sqrtD) / (2 * a);
    const r2 = (-b - sqrtD) / (2 * a);
    steps.push(
      {
        title: "Discriminant",
        tex: `\\Delta = b^2 - 4ac = ${texNum(b * b)} - ${texNum(4 * a * c)} = ${texNum(D)}`
      },
      {
        title: "Δ > 0 — two real roots",
        tex: `${varName} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{${texNum(-b)} \\pm \\sqrt{${texNum(D)}}}{${texNum(2 * a)}}`
      },
      {
        title: "Evaluate ±",
        tex: `${varName}_1 = ${texNum(r1)},\\qquad ${varName}_2 = ${texNum(r2)}`
      },
      { title: "Solution", tex: `${varName}_1 = ${texNum(r1)},\\quad ${varName}_2 = ${texNum(r2)}` }
    );
    return {
      mode: "quadratic",
      solution: { kind: "unique", discriminant: D, a, b, c, roots: [r1, r2] },
      steps,
      answerTex: `${varName}_1 = ${texNum(r1)},\\quad ${varName}_2 = ${texNum(r2)}`,
      answerPlain: `${varName} = ${fmtNum(r1)}, ${fmtNum(r2)}`
    };
  }

  if (D < -EPS * DScale) {
    const re = -b / (2 * a);
    const im = Math.sqrt(-D) / (2 * a);
    const z1 = { re, im };
    const z2 = { re, im: -im };
    steps.push(
      {
        title: "Discriminant",
        tex: `\\Delta = b^2 - 4ac = ${texNum(b * b)} - ${texNum(4 * a * c)} = ${texNum(D)}`
      },
      {
        title: "Δ < 0 — two complex roots",
        tex: `${varName} = \\frac{-b \\pm i\\sqrt{|\\Delta|}}{2a}`
      },
      {
        title: "Evaluate ±",
        tex: `${varName}_1 = ${texComplex(z1)},\\qquad ${varName}_2 = ${texComplex(z2)}`
      },
      {
        title: "Solution",
        tex: `${varName}_1 = ${texComplex(z1)},\\quad ${varName}_2 = ${texComplex(z2)}`
      }
    );
    return {
      mode: "quadratic",
      solution: { kind: "complex", discriminant: D, a, b, c, roots: [z1, z2] },
      steps,
      answerTex: `${varName}_1 = ${texComplex(z1)},\\quad ${varName}_2 = ${texComplex(z2)}`,
      answerPlain: `${varName} = ${fmtComplex(z1)} and ${fmtComplex(z2)}`
    };
  }

  const root = -b / (2 * a);
  steps.push(
    {
      title: "Discriminant",
      tex: `\\Delta = b^2 - 4ac = ${texNum(b * b)} - ${texNum(4 * a * c)} = ${texNum(D)}`
    },
    {
      title: "Δ = 0 — one repeated root",
      tex: `${varName} = \\frac{-b}{2a} = \\frac{${texNum(-b)}}{${texNum(2 * a)}} = ${texNum(root)}`
    },
    { title: "Solution", tex: `${varName} = ${texNum(root)}\\quad \\text{(double root)}` }
  );
  return {
    mode: "quadratic",
    solution: { kind: "double", discriminant: D, a, b, c, root, roots: [root] },
    steps,
    answerTex: `${varName} = ${texNum(root)}`,
    answerPlain: `${varName} = ${fmtNum(root)} (double root)`
  };
}

export function solveSystem(eq1, eq2, v1 = "x", v2 = "y") {
  validateVariable(v1);
  validateVariable(v2);
  const s1 = splitEquation(eq1, [v1, v2]);
  const s2 = splitEquation(eq2, [v1, v2]);

  let node1;
  let node2;
  try {
    node1 = parse(s1.fExpr);
    node2 = parse(s2.fExpr);
  } catch {
    throw new Error(`Could not parse the equations. Check the syntax, e.g. "x + y = 5".`);
  }
  const allowed = new Set([v1, v2, ...BUILTIN_SYMBOLS]);
  checkExtraSymbols(node1, allowed);
  checkExtraSymbols(node2, allowed);
  const variables = new Set([v1, v2]);
  const deg1 = getPolynomialDegree(node1, variables);
  const deg2 = getPolynomialDegree(node2, variables);
  if (deg1 === -1 || deg2 === -1) {
    throw new Error(
      "This solver handles polynomial equations only (no sin, log, or variables in a denominator)."
    );
  }
  if (deg1 > 1 || deg2 > 1) {
    throw new Error("The system solver handles linear equations only (no x², y² or x·y terms).");
  }

  const c1 = extractLinearCoeffs(s1.fExpr, v1, v2);
  const c2 = extractLinearCoeffs(s2.fExpr, v1, v2);
  const { a: a1, b: b1, c: k1 } = c1;
  const { a: a2, b: b2, c: k2 } = c2;

  const steps = [
    {
      title: "System",
      tex: `\\begin{cases} ${texClean(s1.lhs)} = ${texClean(s1.rhs)} \\\\ ${texClean(s2.lhs)} = ${texClean(s2.rhs)} \\end{cases}`
    },
    {
      title: "Coefficients (ax + by = c)",
      tex: `a_1 = ${texNum(a1)},\\ b_1 = ${texNum(b1)},\\ c_1 = ${texNum(k1)}\\qquad a_2 = ${texNum(a2)},\\ b_2 = ${texNum(b2)},\\ c_2 = ${texNum(k2)}`
    }
  ];

  const det = a1 * b2 - a2 * b1;
  const detScale = Math.max(Math.abs(a1 * b2), Math.abs(a2 * b1), 1);

  if (isZero(det, detScale)) {
    const crossScale = Math.max(
      Math.abs(a1 * k2),
      Math.abs(a2 * k1),
      Math.abs(k1 * b2),
      Math.abs(k2 * b1),
      1
    );
    const consistent =
      isZero(a1 * k2 - a2 * k1, crossScale) && isZero(k1 * b2 - k2 * b1, crossScale);
    steps.push({
      title: "Determinant",
      tex: `\\Delta = a_1 b_2 - a_2 b_1 = (${texNum(a1)})({${texNum(b2)}}) - (${texNum(a2)})({${texNum(b1)}}) = 0`
    });
    if (consistent) {
      steps.push({ title: "Result", tex: "\\text{Infinitely many solutions (dependent lines)}" });
      return {
        mode: "system",
        solution: { kind: "infinite", v1, v2, roots: [] },
        steps,
        answerTex: "\\text{Infinitely many solutions}",
        answerPlain: "Infinitely many solutions (the two lines are the same)"
      };
    }
    steps.push({ title: "Result", tex: "\\text{No solution (parallel lines)}" });
    return {
      mode: "system",
      solution: { kind: "none", v1, v2, roots: [] },
      steps,
      answerTex: "\\text{No solution}",
      answerPlain: "No solution (the two lines are parallel)"
    };
  }

  const x = (k1 * b2 - k2 * b1) / det;
  const y = (a1 * k2 - a2 * k1) / det;
  steps.push(
    {
      title: "Determinant",
      tex: `\\Delta = a_1 b_2 - a_2 b_1 = (${texNum(a1)})({${texNum(b2)}}) - (${texNum(a2)})({${texNum(b1)}}) = ${texNum(det)}`
    },
    {
      title: `Cramer's rule — ${v1}`,
      tex: `${v1} = \\frac{c_1 b_2 - c_2 b_1}{\\Delta} = \\frac{(${texNum(k1)})({${texNum(b2)}}) - (${texNum(k2)})({${texNum(b1)}})}{${texNum(det)}} = ${texNum(x)}`
    },
    {
      title: `Cramer's rule — ${v2}`,
      tex: `${v2} = \\frac{a_1 c_2 - a_2 c_1}{\\Delta} = \\frac{(${texNum(a1)})({${texNum(k2)}}) - (${texNum(a2)})({${texNum(k1)}})}{${texNum(det)}} = ${texNum(y)}`
    },
    { title: "Solution", tex: `${v1} = ${texNum(x)},\\quad ${v2} = ${texNum(y)}` }
  );
  return {
    mode: "system",
    solution: { kind: "unique", v1, v2, x, y, roots: [x, y] },
    steps,
    answerTex: `${v1} = ${texNum(x)},\\quad ${v2} = ${texNum(y)}`,
    answerPlain: `${v1} = ${fmtNum(x)}, ${v2} = ${fmtNum(y)}`
  };
}

export function solveEquation(input, mode, opts = {}) {
  if (mode === "system") {
    return solveSystem(input.eq1, input.eq2, opts.v1 || "x", opts.v2 || "y");
  }
  return mode === "quadratic"
    ? solveQuadratic(input.eq, opts.varName || "x")
    : solveLinear(input.eq, opts.varName || "x");
}

const PRESETS = {
  linear: [
    { label: "2x + 3 = 7", eq: "2x + 3 = 7", v: "x" },
    { label: "3x − 5 = x + 7", eq: "3x - 5 = x + 7", v: "x" },
    { label: "5x = 20", eq: "5x = 20", v: "x" },
    { label: "4 − 2x = 10", eq: "4 - 2x = 10", v: "x" },
    { label: "y/2 + 1 = 3", eq: "y/2 + 1 = 3", v: "y" }
  ],
  quadratic: [
    { label: "x² − 5x + 6 = 0", eq: "x^2 - 5x + 6 = 0", v: "x" },
    { label: "x² + 2x + 1 = 0", eq: "x^2 + 2x + 1 = 0", v: "x" },
    { label: "x² + 1 = 0", eq: "x^2 + 1 = 0", v: "x" },
    { label: "2x² − 4x − 6 = 0", eq: "2x^2 - 4x - 6 = 0", v: "x" },
    { label: "t² − 3t + 2 = 0", eq: "t^2 - 3t + 2 = 0", v: "t" }
  ],
  system: [
    { label: "x + y = 5 and x − y = 1", eq1: "x + y = 5", eq2: "x - y = 1" },
    { label: "2x + 3y = 12 and x − y = 1", eq1: "2x + 3y = 12", eq2: "x - y = 1" },
    { label: "x + 2y = 8 and 3x − y = 3", eq1: "x + 2y = 8", eq2: "3x - y = 3" },
    { label: "x + y = 4 and 2x + 2y = 8", eq1: "x + y = 4", eq2: "2x + 2y = 8" },
    { label: "x + y = 4 and x + y = 7", eq1: "x + y = 4", eq2: "x + y = 7" }
  ]
};

function buildStepsHtml(result) {
  const note = result.note ? `<div class="es-note">${result.note}</div>` : "";
  const steps = result.steps
    .map(
      (s, i) => `
      <div class="es-step">
        <div class="es-step-num">${i + 1}</div>
        <div class="es-step-body">
          <div class="es-step-title">${s.title}</div>
          <div class="es-step-tex es-katex"></div>
        </div>
      </div>`
    )
    .join("");
  return `${note}
    <div class="es-work">${steps}</div>
    <div class="es-answer">
      <div class="es-answer-label">Answer</div>
      <div class="es-answer-tex es-katex es-answer-display"></div>
    </div>`;
}

let katexPromise = null;

function loadKaTeX() {
  if (window.katex) return Promise.resolve(window.katex);
  if (katexPromise) return katexPromise;
  katexPromise = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = KATEX_CSS;
    link.integrity = KATEX_CSS_SRI;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = KATEX_JS;
    script.integrity = KATEX_JS_SRI;
    script.crossOrigin = "anonymous";
    script.onload = () => (window.katex ? resolve() : reject(new Error("KaTeX failed to load")));
    script.onerror = () => reject(new Error("KaTeX failed to load"));
    document.head.appendChild(script);
  });
  return katexPromise;
}

function renderKatex(scope) {
  if (!window.katex) return;
  scope.querySelectorAll(".es-katex").forEach(el => {
    const tex = el.dataset.tex;
    if (!tex) return;
    try {
      el.innerHTML = window.katex.renderToString(tex, {
        throwOnError: false,
        displayMode: el.classList.contains("es-answer-display")
      });
    } catch {
      el.textContent = el.dataset.plain || tex;
    }
  });
}

export function render(container) {
  const style = document.createElement("style");
  style.textContent = `
    .es-wrap{max-width:760px;}
    .es-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);}
    .es-row{display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:end;}
    .es-field{flex:1;min-width:200px;}
    .es-field label{display:block;font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-1);}
    .es-field select,.es-field input{width:100%;padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);background:var(--color-bg);color:var(--color-text);}
    .es-field input[type="text"]{font-family:monospace;}
    .es-hint{font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1);}
    .es-actions{display:flex;gap:var(--space-2);flex-wrap:wrap;margin:var(--space-3) 0;}
    .es-results{margin-top:var(--space-3);}
    .es-note{background:var(--color-surface);border:1px solid var(--color-border);border-left:3px solid var(--color-primary);border-radius:var(--radius-sm);padding:var(--space-2) var(--space-3);margin-bottom:var(--space-3);font-size:var(--text-sm);color:var(--color-text-muted);}
    .es-work{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);}
    .es-step{display:flex;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--color-border);align-items:baseline;}
    .es-step:last-child{border-bottom:none;}
    .es-step-num{flex:0 0 24px;height:24px;border-radius:50%;background:var(--color-primary);color:#fff;font-size:var(--text-xs);font-weight:700;display:flex;align-items:center;justify-content:center;}
    .es-step-body{flex:1;min-width:0;}
    .es-step-title{font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--space-1);}
    .es-step-tex{font-size:var(--text-base);overflow-x:auto;}
    .es-step-tex .katex-display{margin:0;}
    .es-answer{border:1px solid var(--color-primary);background:color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));border-radius:var(--radius-md);padding:var(--space-4);text-align:center;}
    .es-answer-label{font-size:var(--text-xs);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-text-muted);margin-bottom:var(--space-2);}
    .es-answer-tex{font-size:1.5em;}
    .es-answer-tex .katex{color:var(--color-primary);}
    .es-error{background:var(--color-surface);border:1px solid var(--color-danger, #ef4444);border-left:3px solid var(--color-danger, #ef4444);color:var(--color-danger, #ef4444);border-radius:var(--radius-md);padding:var(--space-3);font-size:var(--text-sm);}
    .es-empty{padding:var(--space-6);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);border:1px dashed var(--color-border);border-radius:var(--radius-md);}
  `;
  container.appendChild(style);

  container.innerHTML = `
    <div class="es-wrap">
      <div class="es-card">
        <div class="es-row" style="margin-bottom:var(--space-3);">
          <div class="es-field">
            <label for="es-mode">Equation type</label>
            <select id="es-mode">
              <option value="linear">Linear — ax + b = 0</option>
              <option value="quadratic">Quadratic — ax² + bx + c = 0</option>
              <option value="system">System of 2 equations</option>
            </select>
          </div>
          <div class="es-field">
            <label for="es-preset">Try an example</label>
            <select id="es-preset"></select>
          </div>
        </div>

        <div class="es-row" id="es-panel-single">
          <div class="es-field">
            <label for="es-eq">Equation</label>
            <input id="es-eq" type="text" placeholder="e.g. 2x + 3 = 7" autocomplete="off" spellcheck="false" />
          </div>
          <div class="es-field" style="flex:0 0 120px;">
            <label for="es-var">Variable</label>
            <input id="es-var" type="text" maxlength="1" value="x" autocomplete="off" spellcheck="false" />
          </div>
        </div>

        <div class="es-row" id="es-panel-system" hidden>
          <div class="es-field">
            <label for="es-eq1">Equation 1</label>
            <input id="es-eq1" type="text" placeholder="e.g. x + y = 5" autocomplete="off" spellcheck="false" />
          </div>
          <div class="es-field">
            <label for="es-eq2">Equation 2</label>
            <input id="es-eq2" type="text" placeholder="e.g. x - y = 1" autocomplete="off" spellcheck="false" />
          </div>
        </div>
        <p class="es-hint" id="es-sys-hint" hidden>Variables are fixed to x and y in system mode.</p>

        <div class="es-actions">
          <button id="es-solve" class="btn btn-primary" type="button">Solve</button>
          <button id="es-copy" class="btn btn-secondary" type="button" disabled><span id="es-copy-label">Copy LaTeX</span></button>
          <button id="es-clear" class="btn btn-secondary" type="button">Clear</button>
        </div>
      </div>

      <div id="es-results" class="es-results" aria-live="polite">
        <div class="es-empty">Enter an equation and click Solve to see the step-by-step working.</div>
      </div>
    </div>
  `;

  const modeEl = container.querySelector("#es-mode");
  const presetEl = container.querySelector("#es-preset");
  const panelSingle = container.querySelector("#es-panel-single");
  const panelSystem = container.querySelector("#es-panel-system");
  const sysHint = container.querySelector("#es-sys-hint");
  const eqEl = container.querySelector("#es-eq");
  const varEl = container.querySelector("#es-var");
  const eq1El = container.querySelector("#es-eq1");
  const eq2El = container.querySelector("#es-eq2");
  const solveBtn = container.querySelector("#es-solve");
  const copyBtn = container.querySelector("#es-copy");
  const clearBtn = container.querySelector("#es-clear");
  const resultsEl = container.querySelector("#es-results");

  let currentResult = null;
  let currentMode = modeEl.value;

  function fillPresets(mode) {
    const presets = PRESETS[mode] || [];
    presetEl.innerHTML = presets.map((p, i) => `<option value="${i}">${p.label}</option>`).join("");
    presetEl.value = "0";
  }

  function applyPreset(index) {
    const p = (PRESETS[currentMode] || [])[index];
    if (!p) return;
    if (currentMode === "system") {
      eq1El.value = p.eq1;
      eq2El.value = p.eq2;
    } else {
      eqEl.value = p.eq;
      varEl.value = p.v;
    }
  }

  function setMode(mode) {
    resetCopyLabel();
    currentMode = mode;
    const isSystem = mode === "system";
    panelSingle.hidden = isSystem;
    panelSystem.hidden = !isSystem;
    sysHint.hidden = !isSystem;
    fillPresets(mode);
    applyPreset(0);
  }

  function showError(message) {
    const div = document.createElement("div");
    div.className = "es-error";
    div.textContent = message;
    resultsEl.innerHTML = "";
    resultsEl.appendChild(div);
    currentResult = null;
    copyBtn.disabled = true;
  }

  function solve() {
    resetCopyLabel();
    let result;
    try {
      result =
        currentMode === "system"
          ? solveSystem(eq1El.value, eq2El.value)
          : currentMode === "quadratic"
            ? solveQuadratic(eqEl.value, varEl.value)
            : solveLinear(eqEl.value, varEl.value);
    } catch (error) {
      showError(error.message);
      return;
    }
    currentResult = result;
    resultsEl.innerHTML = buildStepsHtml(result);
    const texEls = resultsEl.querySelectorAll(".es-katex");
    texEls.forEach((el, i) => {
      const tex = i < result.steps.length ? result.steps[i].tex : result.answerTex;
      el.dataset.tex = tex;
      el.dataset.plain = i < result.steps.length ? tex : result.answerPlain;
      el.textContent = el.dataset.plain;
    });
    loadKaTeX()
      .then(() => renderKatex(resultsEl))
      .catch(() => {
        resultsEl.querySelectorAll(".es-katex").forEach(el => {
          el.textContent = el.dataset.plain || "";
        });
      });
    copyBtn.disabled = false;
  }

  function copyLatex() {
    if (!currentResult) return;
    const lines = currentResult.steps.map(s => s.tex);
    const full = `\\begin{aligned} ${lines.join(" \\\\ ")} \\end{aligned}`;
    copyToClipboard(full);
    showToast({ message: "Solution copied as LaTeX", type: "success" });
    const labelEl = copyBtn.querySelector("#es-copy-label");
    if (labelEl) {
      labelEl.textContent = "Copied ✓";
    }
  }

  function resetCopyLabel() {
    const labelEl = copyBtn.querySelector("#es-copy-label");
    if (labelEl) {
      labelEl.textContent = "Copy LaTeX";
    }
  }

  function clear() {
    resetCopyLabel();
    eqEl.value = "";
    varEl.value = "x";
    eq1El.value = "";
    eq2El.value = "";
    resultsEl.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "es-empty";
    empty.textContent = "Enter an equation and click Solve to see the step-by-step working.";
    resultsEl.appendChild(empty);
    currentResult = null;
    copyBtn.disabled = true;
  }

  modeEl.addEventListener("change", () => setMode(modeEl.value));
  presetEl.addEventListener("change", () => applyPreset(Number(presetEl.value)));
  solveBtn.addEventListener("click", solve);
  copyBtn.addEventListener("click", copyLatex);
  clearBtn.addEventListener("click", clear);
  [eqEl, eq1El, eq2El, varEl].forEach(input => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") solve();
    });
  });

  setMode("linear");
}

export function cleanup() {}
