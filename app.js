const editor = document.querySelector("#editor");
const preview = document.querySelector("#preview");
const docStats = document.querySelector("#docStats");
const toast = document.querySelector("#toast");
const paperToggle = document.querySelector("#paperToggle");

const STORAGE_KEY = "markdown-studio-content";
const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN = 36;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
const PDF_CONTENT_HEIGHT = PDF_PAGE_HEIGHT - PDF_MARGIN * 2;

const starter = `# 项目周报

> 本周重点：把计划、进度和风险写清楚，让读者可以快速抓住状态。

## 已完成

- 完成 Markdown 编辑器原型
- 支持 **实时预览**、表格、代码块和引用
- 可以导出为图片或 PDF

## 数据表

| 模块 | 状态 | 负责人 |
| --- | --- | --- |
| 编辑器 | 完成 | Alice |
| 导出 | 进行中 | Bob |

## 数学公式

行内公式：$a^2 + b^2 = c^2$，$P(x)>0$，以及 $\\alpha + \\beta \\ge \\gamma$。

块级公式：

$$
E = mc^2
$$

$$
\\frac{1}{n}\\sum_{i=1}^{n} x_i = \\bar{x}
$$

$$
\\sum_{x} P(x)>0
$$

更多符号：$\\mathbb{R}, \\mathcal{F}, \\vec{x}, \\binom{n}{k}, A \\subseteq B \\Rightarrow x \\in A \\cup B$。

## 代码片段

\`\`\`js
function greet(name) {
  return \`Hello, \${name}\`;
}
\`\`\`

## 下一步

1. 补充真实内容
2. 调整版式细节
3. 导出交付文件
`;

editor.value = localStorage.getItem(STORAGE_KEY) || starter;

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function sanitizeUrl(value) {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|#|\/)/i.test(trimmed)) return trimmed;
  return "#";
}

const mathSymbols = {
  Alpha: "Α",
  Beta: "Β",
  Epsilon: "Ε",
  Zeta: "Ζ",
  Eta: "Η",
  Iota: "Ι",
  Kappa: "Κ",
  Mu: "Μ",
  Nu: "Ν",
  Omicron: "Ο",
  Rho: "Ρ",
  Tau: "Τ",
  Chi: "Χ",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  varepsilon: "ϵ",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  vartheta: "ϑ",
  iota: "ι",
  kappa: "κ",
  varkappa: "ϰ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  pi: "π",
  varpi: "ϖ",
  rho: "ρ",
  varrho: "ϱ",
  sigma: "σ",
  varsigma: "ς",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  varphi: "ϕ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Upsilon: "Υ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  ast: "∗",
  star: "⋆",
  bullet: "∙",
  dagger: "†",
  ddagger: "‡",
  times: "×",
  cdot: "·",
  cdotp: "·",
  dotplus: "∔",
  div: "÷",
  pm: "±",
  mp: "∓",
  setminus: "∖",
  smallsetminus: "∖",
  wr: "≀",
  diamond: "⋄",
  bigtriangleup: "△",
  bigtriangledown: "▽",
  triangleleft: "◁",
  triangleright: "▷",
  lhd: "⊲",
  rhd: "⊳",
  unlhd: "⊴",
  unrhd: "⊵",
  oplus: "⊕",
  ominus: "⊖",
  otimes: "⊗",
  oslash: "⊘",
  odot: "⊙",
  bigcirc: "○",
  circledast: "⊛",
  circledcirc: "⊚",
  circleddash: "⊝",
  boxplus: "⊞",
  boxminus: "⊟",
  boxtimes: "⊠",
  boxdot: "⊡",
  cap: "∩",
  cup: "∪",
  uplus: "⊎",
  sqcap: "⊓",
  sqcup: "⊔",
  vee: "∨",
  lor: "∨",
  wedge: "∧",
  land: "∧",
  amalg: "∐",
  le: "≤",
  leq: "≤",
  leqslant: "⩽",
  ge: "≥",
  geq: "≥",
  geqslant: "⩾",
  lt: "<",
  gt: ">",
  neq: "≠",
  ne: "≠",
  equiv: "≡",
  notequiv: "≢",
  approx: "≈",
  approxeq: "≊",
  cong: "≅",
  simeq: "≃",
  sim: "∼",
  nsim: "≁",
  propto: "∝",
  doteq: "≐",
  triangleq: "≜",
  asymp: "≍",
  bowtie: "⋈",
  models: "⊨",
  prec: "≺",
  preceq: "≼",
  succ: "≻",
  succeq: "≽",
  ll: "≪",
  gg: "≫",
  between: "≬",
  parallel: "∥",
  nparallel: "∦",
  perp: "⊥",
  mid: "∣",
  nmid: "∤",
  smile: "⌣",
  frown: "⌢",
  as: "∋",
  infty: "∞",
  partial: "∂",
  eth: "ð",
  hbar: "ℏ",
  imath: "ı",
  jmath: "ȷ",
  ell: "ℓ",
  wp: "℘",
  Re: "ℜ",
  Im: "ℑ",
  aleph: "ℵ",
  beth: "ℶ",
  gimel: "ℷ",
  daleth: "ℸ",
  nabla: "∇",
  surd: "√",
  angle: "∠",
  measuredangle: "∡",
  sphericalangle: "∢",
  top: "⊤",
  bot: "⊥",
  emptyset: "∅",
  varnothing: "∅",
  forall: "∀",
  exists: "∃",
  nexists: "∄",
  neg: "¬",
  lnot: "¬",
  therefore: "∴",
  because: "∵",
  in: "∈",
  notin: "∉",
  ni: "∋",
  owns: "∋",
  subset: "⊂",
  subseteq: "⊆",
  supset: "⊃",
  supseteq: "⊇",
  nsubseteq: "⊈",
  nsupseteq: "⊉",
  subsetneq: "⊊",
  supsetneq: "⊋",
  sqsubset: "⊏",
  sqsubseteq: "⊑",
  sqsupset: "⊐",
  sqsupseteq: "⊒",
  to: "→",
  rightarrow: "→",
  gets: "←",
  leftarrow: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  Leftrightarrow: "⇔",
  longrightarrow: "⟶",
  longleftarrow: "⟵",
  longleftrightarrow: "⟷",
  Longrightarrow: "⟹",
  Longleftarrow: "⟸",
  Longleftrightarrow: "⟺",
  hookrightarrow: "↪",
  hookleftarrow: "↩",
  uparrow: "↑",
  downarrow: "↓",
  updownarrow: "↕",
  Uparrow: "⇑",
  Downarrow: "⇓",
  Updownarrow: "⇕",
  nearrow: "↗",
  searrow: "↘",
  swarrow: "↙",
  nwarrow: "↖",
  rightharpoonup: "⇀",
  rightharpoondown: "⇁",
  leftharpoonup: "↼",
  leftharpoondown: "↽",
  rightleftharpoons: "⇌",
  leftrightharpoons: "⇋",
  leadsto: "↝",
  mapsto: "↦",
  longmapsto: "⟼",
  iff: "⇔",
  lbrace: "{",
  rbrace: "}",
  lbrack: "[",
  rbrack: "]",
  lparen: "(",
  rparen: ")",
  backslash: "\\",
  vert: "|",
  Vert: "‖",
  lvert: "|",
  rvert: "|",
  lVert: "‖",
  rVert: "‖",
  floor: "⌊",
  lfloor: "⌊",
  rfloor: "⌋",
  ceil: "⌈",
  lceil: "⌈",
  rceil: "⌉",
  degree: "°",
  circ: "∘",
  langle: "⟨",
  rangle: "⟩",
  lmoustache: "⎰",
  rmoustache: "⎱",
  ulcorner: "⌜",
  urcorner: "⌝",
  llcorner: "⌞",
  lrcorner: "⌟",
  bar: "¯",
  prime: "′",
  doubleprime: "″",
  backprime: "‵",
  qquad: "  ",
  quad: " ",
  ":": "∶",
  ",": " ",
  ";": " ",
  "!": "",
  " ": " ",
  "{": "{",
  "}": "}",
  "%": "%",
  "#": "#",
  "&": "&",
  "_": "_",
  "$": "$",
  dots: "…",
  ldots: "…",
  cdots: "⋯",
  vdots: "⋮",
  ddots: "⋱",
  mathellipsis: "…",
  copyright: "©",
  pounds: "£",
  yen: "¥",
  euro: "€",
  checkmark: "✓",
  flat: "♭",
  natural: "♮",
  sharp: "♯",
  clubsuit: "♣",
  diamondsuit: "♢",
  heartsuit: "♡",
  spadesuit: "♠",
};

const mathOperators = {
  sum: "∑",
  prod: "∏",
  coprod: "∐",
  int: "∫",
  iint: "∬",
  iiint: "∭",
  oint: "∮",
  bigcap: "⋂",
  bigcup: "⋃",
  bigvee: "⋁",
  bigwedge: "⋀",
  bigodot: "⨀",
  bigoplus: "⨁",
  bigotimes: "⨂",
  biguplus: "⨄",
  lim: "lim",
  liminf: "lim inf",
  limsup: "lim sup",
  sup: "sup",
  inf: "inf",
  min: "min",
  max: "max",
  argmin: "arg min",
  argmax: "arg max",
  deg: "deg",
  det: "det",
  dim: "dim",
  exp: "exp",
  gcd: "gcd",
  hom: "hom",
  ker: "ker",
  log: "log",
  ln: "ln",
  lg: "lg",
  Pr: "Pr",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  cot: "cot",
  sec: "sec",
  csc: "csc",
  arcsin: "arcsin",
  arccos: "arccos",
  arctan: "arctan",
  sinh: "sinh",
  cosh: "cosh",
  tanh: "tanh",
};

const mathLimitOperators = new Set([
  "sum",
  "prod",
  "coprod",
  "int",
  "iint",
  "iiint",
  "oint",
  "bigcap",
  "bigcup",
  "bigvee",
  "bigwedge",
  "bigodot",
  "bigoplus",
  "bigotimes",
  "biguplus",
  "lim",
  "liminf",
  "limsup",
  "sup",
  "inf",
  "min",
  "max",
  "argmin",
  "argmax",
]);

class MathParser {
  constructor(source, display = false) {
    this.source = source.trim();
    this.index = 0;
    this.display = display;
  }

  parse(stop = "") {
    const output = [];

    while (this.index < this.source.length) {
      const char = this.source[this.index];
      if (stop && char === stop) break;

      if (char === "\\") {
        output.push(this.readCommand());
        continue;
      }

      if (char === "^" || char === "_") {
        this.index += 1;
        const tag = char === "^" ? "sup" : "sub";
        output.push(`<${tag}>${this.readGroupOrAtom()}</${tag}>`);
        continue;
      }

      if (char === "{") {
        this.index += 1;
        output.push(this.parse("}"));
        if (this.source[this.index] === "}") this.index += 1;
        continue;
      }

      if (char === "}") break;

      if (/\s/.test(char)) {
        output.push(" ");
        this.index += 1;
        continue;
      }

      output.push(escapeHtml(char));
      this.index += 1;
    }

    return output.join("");
  }

  readCommandName() {
    this.index += 1;
    const start = this.index;
    while (/[A-Za-z]/.test(this.source[this.index] || "")) this.index += 1;
    return this.source.slice(start, this.index) || this.source[this.index++] || "";
  }

  readCommand() {
    const command = this.readCommandName();

    if (command === "left" || command === "right") {
      return "";
    }

    if (command === "frac") {
      const numerator = this.readGroupOrAtom();
      const denominator = this.readGroupOrAtom();
      return `<span class="math-frac"><span>${numerator}</span><span>${denominator}</span></span>`;
    }

    if (command === "binom") {
      const top = this.readGroupOrAtom();
      const bottom = this.readGroupOrAtom();
      return `<span class="math-binom"><span>${top}</span><span>${bottom}</span></span>`;
    }

    if (command === "sqrt") {
      const degree = this.readOptionalGroup("[", "]");
      const value = this.readGroupOrAtom();
      const degreeHtml = degree ? `<sup>${degree}</sup>` : "";
      return `<span class="math-root">${degreeHtml}<span>${value}</span></span>`;
    }

    if (command === "bar" || command === "overline") {
      return `<span class="math-overline">${this.readGroupOrAtom()}</span>`;
    }

    if (command === "underline") {
      return `<span class="math-underline">${this.readGroupOrAtom()}</span>`;
    }

    if (["hat", "widehat", "tilde", "widetilde", "vec", "dot", "ddot"].includes(command)) {
      return `<span class="math-accent math-${command}">${this.readGroupOrAtom()}</span>`;
    }

    if (command === "boxed") {
      return `<span class="math-boxed">${this.readGroupOrAtom()}</span>`;
    }

    if (command === "operatorname") {
      return `<span class="math-op">${this.readRawGroupOrAtom()}</span>`;
    }

    if (["text", "textnormal", "mathrm"].includes(command)) {
      return `<span class="math-text">${this.readRawGroupOrAtom()}</span>`;
    }

    if (["mathbf", "mathit", "mathsf", "mathtt", "mathbb", "mathcal", "mathfrak"].includes(command)) {
      const value = this.readRawGroupOrAtom();
      return `<span class="${this.styleClass(command)}">${this.transformStyledText(command, value)}</span>`;
    }

    if (mathOperators[command]) {
      return this.readOperator(command);
    }

    if (mathSymbols[command]) {
      return `<span>${mathSymbols[command]}</span>`;
    }

    return escapeHtml(`\\${command}`);
  }

  readOperator(command) {
    const operator = mathOperators[command];
    if (!mathLimitOperators.has(command)) {
      return `<span class="math-op">${operator}</span>`;
    }

    const scripts = this.readScripts();
    if (!scripts.sub && !scripts.sup) {
      return `<span class="math-op">${operator}</span>`;
    }

    const className = this.display ? "math-largeop math-largeop-display" : "math-largeop";
    return `
      <span class="${className}">
        ${scripts.sup ? `<span class="math-largeop-sup">${scripts.sup}</span>` : '<span class="math-largeop-empty"></span>'}
        <span class="math-largeop-symbol">${operator}</span>
        ${scripts.sub ? `<span class="math-largeop-sub">${scripts.sub}</span>` : '<span class="math-largeop-empty"></span>'}
      </span>
    `;
  }

  readScripts() {
    const scripts = { sub: "", sup: "" };

    while (true) {
      const checkpoint = this.index;
      this.skipSpaces();
      const char = this.source[this.index];
      if (char !== "_" && char !== "^") {
        this.index = checkpoint;
        break;
      }

      this.index += 1;
      const value = this.readGroupOrAtom();
      if (char === "_") scripts.sub = value;
      if (char === "^") scripts.sup = value;
    }

    return scripts;
  }

  readOptionalGroup(open, close) {
    this.skipSpaces();
    if (this.source[this.index] !== open) return "";
    this.index += 1;
    const value = this.parse(close);
    if (this.source[this.index] === close) this.index += 1;
    return value;
  }

  readGroupOrAtom() {
    this.skipSpaces();
    if (this.source[this.index] === "{") {
      this.index += 1;
      const value = this.parse("}");
      if (this.source[this.index] === "}") this.index += 1;
      return value;
    }
    if (this.source[this.index] === "\\") return this.readCommand();
    const char = this.source[this.index] || "";
    this.index += 1;
    return escapeHtml(char);
  }

  readRawGroupOrAtom() {
    this.skipSpaces();
    if (this.source[this.index] !== "{") return this.readGroupOrAtom();
    this.index += 1;
    const start = this.index;
    let depth = 1;
    while (this.index < this.source.length && depth > 0) {
      if (this.source[this.index] === "{") depth += 1;
      if (this.source[this.index] === "}") depth -= 1;
      this.index += 1;
    }
    return escapeHtml(this.source.slice(start, this.index - 1));
  }

  styleClass(command) {
    return {
      mathbb: "math-double-struck",
      mathcal: "math-script",
      mathfrak: "math-fraktur",
      mathbf: "math-bold",
      mathit: "math-italic",
      mathsf: "math-sans",
      mathtt: "math-mono",
    }[command];
  }

  transformStyledText(command, value) {
    const text = value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    const maps = {
      mathbb: {
        A: "𝔸",
        B: "𝔹",
        C: "ℂ",
        D: "𝔻",
        E: "𝔼",
        F: "𝔽",
        G: "𝔾",
        H: "ℍ",
        I: "𝕀",
        J: "𝕁",
        K: "𝕂",
        L: "𝕃",
        M: "𝕄",
        N: "ℕ",
        O: "𝕆",
        P: "ℙ",
        Q: "ℚ",
        R: "ℝ",
        S: "𝕊",
        T: "𝕋",
        U: "𝕌",
        V: "𝕍",
        W: "𝕎",
        X: "𝕏",
        Y: "𝕐",
        Z: "ℤ",
      },
      mathcal: {
        A: "𝒜",
        B: "ℬ",
        C: "𝒞",
        D: "𝒟",
        E: "ℰ",
        F: "ℱ",
        G: "𝒢",
        H: "ℋ",
        I: "ℐ",
        J: "𝒥",
        K: "𝒦",
        L: "ℒ",
        M: "ℳ",
        N: "𝒩",
        O: "𝒪",
        P: "𝒫",
        Q: "𝒬",
        R: "ℛ",
        S: "𝒮",
        T: "𝒯",
        U: "𝒰",
        V: "𝒱",
        W: "𝒲",
        X: "𝒳",
        Y: "𝒴",
        Z: "𝒵",
      },
    };

    if (!maps[command]) return value;
    return escapeHtml(Array.from(text).map((char) => maps[command][char] || char).join(""));
  }

  skipSpaces() {
    while (/\s/.test(this.source[this.index] || "")) this.index += 1;
  }
}

function renderMathExpression(source, display = false) {
  if (window.katex) {
    const html = window.katex.renderToString(source, {
      displayMode: display,
      throwOnError: false,
      output: "htmlAndMathml",
      trust: false,
    });
    return `<span class="math ${display ? "math-display" : "math-inline"} math-katex" data-math-source="${escapeAttr(
      source,
    )}">${html}</span>`;
  }

  const parser = new MathParser(source, display);
  const className = display ? "math math-display" : "math math-inline";
  return `<span class="${className}" data-math-source="${escapeAttr(source)}">${parser.parse()}</span>`;
}

function inlineMarkdown(value) {
  let html = value;
  const codeSpans = [];
  const mathSpans = [];

  html = html.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000CODE${codeSpans.length - 1}\u0000`;
  });

  html = html.replace(/(^|[^\\])\$([^$\n]+)\$/g, (_, prefix, expression) => {
    mathSpans.push(renderMathExpression(expression));
    return `${prefix}\u0000MATH${mathSpans.length - 1}\u0000`;
  });

  html = escapeHtml(html);

  html = html.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
    const safeUrl = escapeAttr(sanitizeUrl(url.replace(/&amp;/g, "&")));
    return `<a href="${safeUrl}" target="_blank" rel="noreferrer">${label}</a>`;
  });

  html = html
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return html
    .replace(/\u0000MATH(\d+)\u0000/g, (_, index) => mathSpans[Number(index)])
    .replace(/\u0000CODE(\d+)\u0000/g, (_, index) => codeSpans[Number(index)]);
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isBlockStart(line, nextLine = "") {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^([-*_])\s*\1\s*\1\s*$/.test(line) ||
    /^(\s*)([-*+])\s+/.test(line) ||
    /^(\s*)\d+\.\s+/.test(line) ||
    /^\$\$/.test(line.trim()) ||
    /^```/.test(line) ||
    (line.includes("|") && isTableDivider(nextLine))
  );
}

function renderList(lines, start) {
  const ordered = /^\s*\d+\.\s+/.test(lines[start]);
  const tag = ordered ? "ol" : "ul";
  const items = [];
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    const match = ordered ? line.match(/^\s*\d+\.\s+(.*)$/) : line.match(/^\s*[-*+]\s+(.*)$/);
    if (!match) break;
    items.push(`<li>${inlineMarkdown(match[1])}</li>`);
    index += 1;
  }

  return {
    html: `<${tag}>${items.join("")}</${tag}>`,
    next: index,
  };
}

function renderTable(lines, start) {
  const headers = splitTableRow(lines[start]);
  let index = start + 2;
  const rows = [];

  while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }

  const headerHtml = headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("");
  const bodyHtml = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
    .join("");

  return {
    html: `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`,
    next: index,
  };
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    const nextLine = lines[index + 1] || "";

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const language = trimmed.replace(/^```/, "").trim();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(
        `<pre><code data-language="${escapeAttr(language)}">${escapeHtml(code.join("\n"))}</code></pre>`,
      );
      continue;
    }

    if (/^\$\$/.test(trimmed)) {
      const math = [];
      const singleLine = trimmed.match(/^\$\$(.+)\$\$$/);

      if (singleLine) {
        math.push(singleLine[1]);
        index += 1;
      } else {
        const opening = trimmed.replace(/^\$\$/, "").trim();
        if (opening) math.push(opening);
        index += 1;
        while (index < lines.length && !/\$\$$/.test(lines[index].trim())) {
          math.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) {
          const closing = lines[index].trim().replace(/\$\$$/, "").trim();
          if (closing) math.push(closing);
          index += 1;
        }
      }

      blocks.push(renderMathExpression(math.join(" "), true));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^([-*_])\s*\1\s*\1\s*$/.test(trimmed)) {
      blocks.push("<hr>");
      index += 1;
      continue;
    }

    if (line.includes("|") && isTableDivider(nextLine)) {
      const table = renderTable(lines, index);
      blocks.push(table.html);
      index = table.next;
      continue;
    }

    if (/^\s*([-*+])\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const list = renderList(lines, index);
      blocks.push(list.html);
      index = list.next;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(`<blockquote>${renderMarkdown(quote.join("\n"))}</blockquote>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index], lines[index + 1] || "")) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

function updateStats() {
  const text = editor.value;
  const chars = Array.from(text.replace(/\s/g, "")).length;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  docStats.textContent = `${chars} 字 · ${lines} 行`;
}

function updatePreview() {
  const markdown = editor.value.trim();
  preview.innerHTML = markdown
    ? renderMarkdown(editor.value)
    : '<div class="empty-state">开始输入 Markdown</div>';
  updateStats();
  localStorage.setItem(STORAGE_KEY, editor.value);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function applySelectionTransform({ wrap, prefix }) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end);

  if (wrap) {
    editor.setRangeText(`${wrap}${selected || "文本"}${wrap}`, start, end, "select");
  }

  if (prefix) {
    const before = editor.value.slice(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const targetEnd = selected ? end : start;
    const block = editor.value
      .slice(lineStart, targetEnd)
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    editor.setRangeText(block, lineStart, targetEnd, "select");
  }

  editor.focus();
  updatePreview();
}

function collectCss() {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");
}

function imageFromSvg(svg) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法渲染预览"));
    };
    image.src = url;
  });
}

async function renderPreviewCanvas(scale = 2) {
  await document.fonts.ready;

  if (window.htmlToImage) {
    try {
      const rect = preview.getBoundingClientRect();
      const width = Math.max(360, Math.ceil(rect.width));
      const height = Math.max(360, Math.ceil(preview.scrollHeight));
      const canvas = await window.htmlToImage.toCanvas(preview, {
        backgroundColor: "#ffffff",
        cacheBust: false,
        pixelRatio: scale,
        skipAutoScale: true,
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          margin: "0",
        },
      });
      canvas.getContext("2d").getImageData(0, 0, 1, 1);
      return canvas;
    } catch (error) {
      console.warn("html-to-image export path failed, trying SVG fallback.", error);
    }
  }

  try {
    const rect = preview.getBoundingClientRect();
    const width = Math.max(360, Math.ceil(rect.width));
    const height = Math.max(360, Math.ceil(preview.scrollHeight));
    const clone = preview.cloneNode(true);
    clone.classList.add("paper");
    clone.setAttribute(
      "style",
      `width:${width}px;min-height:${height}px;margin:0;box-shadow:none;border-radius:8px;`,
    );

    const css = collectCss();
    const body = `
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;min-height:${height}px;background:#ffffff;">
        <style><![CDATA[${css.replace(/\]\]>/g, "]] >")}]]></style>
        ${clone.outerHTML}
      </div>
    `;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <foreignObject width="100%" height="100%">${body}</foreignObject>
      </svg>
    `;

    const image = await imageFromSvg(svg);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);

    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.getImageData(0, 0, 1, 1);
    return canvas;
  } catch (error) {
    console.warn("DOM export path failed, using canvas fallback.", error);
    return renderFallbackCanvas(scale);
  }
}

function plainText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function readBalancedGroup(source, start, open = "{", close = "}") {
  if (source[start] !== open) return null;
  let depth = 1;
  let index = start + 1;
  while (index < source.length && depth > 0) {
    if (source[index] === open) depth += 1;
    if (source[index] === close) depth -= 1;
    index += 1;
  }
  if (depth !== 0) return null;
  return {
    value: source.slice(start + 1, index - 1),
    end: index,
  };
}

function replaceTwoGroupCommand(source, command, formatter) {
  let output = "";
  let index = 0;

  while (index < source.length) {
    if (!source.startsWith(command, index)) {
      output += source[index];
      index += 1;
      continue;
    }

    let cursor = index + command.length;
    while (/\s/.test(source[cursor] || "")) cursor += 1;
    const first = readBalancedGroup(source, cursor);
    if (!first) {
      output += command;
      index = cursor;
      continue;
    }

    cursor = first.end;
    while (/\s/.test(source[cursor] || "")) cursor += 1;
    const second = readBalancedGroup(source, cursor);
    if (!second) {
      output += command;
      index = first.end;
      continue;
    }

    output += formatter(first.value, second.value);
    index = second.end;
  }

  return output;
}

function replaceOneGroupCommand(source, command, formatter) {
  let output = "";
  let index = 0;

  while (index < source.length) {
    if (!source.startsWith(command, index)) {
      output += source[index];
      index += 1;
      continue;
    }

    let cursor = index + command.length;
    while (/\s/.test(source[cursor] || "")) cursor += 1;
    const group = readBalancedGroup(source, cursor);
    if (!group) {
      output += command;
      index = cursor;
      continue;
    }

    output += formatter(group.value);
    index = group.end;
  }

  return output;
}

const superscriptMap = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
};

const subscriptMap = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

function scriptText(value, marker) {
  const normalized = mathSourceToExportText(value);
  const map = marker === "^" ? superscriptMap : subscriptMap;
  const converted = Array.from(normalized).map((char) => map[char] || "");
  if (converted.every(Boolean)) return converted.join("");
  return `${marker}(${normalized})`;
}

function mathSourceToExportText(source) {
  let text = source.trim();

  text = replaceTwoGroupCommand(text, "\\frac", (top, bottom) => `(${mathSourceToExportText(top)})/(${mathSourceToExportText(bottom)})`);
  text = replaceTwoGroupCommand(text, "\\binom", (top, bottom) => `C(${mathSourceToExportText(top)}, ${mathSourceToExportText(bottom)})`);
  text = replaceOneGroupCommand(text, "\\sqrt", (value) => `√(${mathSourceToExportText(value)})`);
  text = replaceOneGroupCommand(text, "\\boxed", (value) => `[${mathSourceToExportText(value)}]`);
  text = replaceOneGroupCommand(text, "\\vec", (value) => `${mathSourceToExportText(value)}⃗`);
  text = replaceOneGroupCommand(text, "\\bar", (value) => `${mathSourceToExportText(value)}̄`);
  text = replaceOneGroupCommand(text, "\\overline", (value) => `${mathSourceToExportText(value)}̄`);
  text = replaceOneGroupCommand(text, "\\hat", (value) => `${mathSourceToExportText(value)}̂`);
  text = replaceOneGroupCommand(text, "\\tilde", (value) => `${mathSourceToExportText(value)}̃`);
  text = replaceOneGroupCommand(text, "\\mathbb", (value) =>
    new MathParser("").transformStyledText("mathbb", escapeHtml(value)),
  );
  text = replaceOneGroupCommand(text, "\\mathcal", (value) =>
    new MathParser("").transformStyledText("mathcal", escapeHtml(value)),
  );
  text = replaceOneGroupCommand(text, "\\text", (value) => value);
  text = replaceOneGroupCommand(text, "\\mathrm", (value) => value);
  text = text.replace(/([_^])\{([^{}]+)\}/g, (_, marker, value) => scriptText(value, marker));
  text = text.replace(/([_^])([A-Za-z0-9+\-=()])/g, (_, marker, value) => scriptText(value, marker));
  text = text.replace(/\\([A-Za-z]+|.)/g, (match, command) => {
    if (mathOperators[command]) return mathOperators[command];
    if (mathSymbols[command]) return mathSymbols[command];
    return match;
  });

  return plainText(text.replace(/\s*([=+\-*/<>≤≥≠≈∈∪∩⇒⇔→←])\s*/g, "$1"));
}

function mathPlainText(element) {
  if (element.dataset.mathSource) {
    return mathSourceToExportText(element.dataset.mathSource);
  }
  return plainText(element.textContent);
}

function wrapCanvasText(context, text, width) {
  const words = plainText(text).split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (context.measureText(next).width <= width || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines;
}

function drawWrappedText(context, text, x, y, width, options = {}) {
  const font = options.font || "16px sans-serif";
  const lineHeight = options.lineHeight || 26;
  const color = options.color || "#1b2521";
  const lines = wrapCanvasText(context, text, width);

  context.save();
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "top";
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  context.restore();

  return Math.max(lineHeight, lines.length * lineHeight);
}

function makeFallbackLayout(width) {
  const measure = document.createElement("canvas").getContext("2d");
  const paperPadding = preview.classList.contains("paper") ? 54 : 36;
  const contentWidth = width - paperPadding * 2;
  const ops = [];
  let y = paperPadding;

  const addText = (text, options = {}) => {
    const font = options.font || "16px Arial, sans-serif";
    const lineHeight = options.lineHeight || 27;
    const marginTop = options.marginTop || 0;
    const marginBottom = options.marginBottom || 0;
    const x = options.x || paperPadding;
    const maxWidth = options.width || contentWidth;
    measure.font = font;
    y += marginTop;
    const lines = options.preserve
      ? text.split("\n").flatMap((line) => wrapCanvasText(measure, line || " ", maxWidth))
      : wrapCanvasText(measure, text, maxWidth);
    const top = y;
    const height = Math.max(lineHeight, lines.length * lineHeight);
    ops.push((context) => {
      context.save();
      context.font = font;
      context.fillStyle = options.color || "#1b2521";
      context.textBaseline = "top";
      lines.forEach((line, index) => {
        context.fillText(line, x, top + index * lineHeight);
      });
      context.restore();
      if (options.underline) {
        context.strokeStyle = "#edf1ef";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(paperPadding, top + height + 8);
        context.lineTo(width - paperPadding, top + height + 8);
        context.stroke();
      }
    });
    y += height + marginBottom;
  };

  const addParagraph = (element) => addText(plainText(element.textContent), { marginTop: 8, marginBottom: 8 });

  Array.from(preview.children).forEach((element) => {
    const tag = element.tagName.toLowerCase();

    if (element.classList.contains("math-display")) {
      const text = mathPlainText(element);
      measure.font = "22px 'Times New Roman', serif";
      const lines = wrapCanvasText(measure, text, contentWidth - 44);
      const top = y + 18;
      const boxHeight = Math.max(70, lines.length * 34 + 36);
      ops.push((context) => {
        context.save();
        context.strokeStyle = "#dce7e2";
        context.fillStyle = "#f8fbfa";
        context.lineWidth = 1;
        context.beginPath();
        context.roundRect(paperPadding, top, contentWidth, boxHeight, 8);
        context.fill();
        context.stroke();
        context.restore();
      });
      addText(mathPlainText(element), {
        font: "22px 'Times New Roman', serif",
        lineHeight: 34,
        marginTop: 18,
        marginBottom: 18,
        x: paperPadding + 22,
        width: contentWidth - 44,
      });
      y = Math.max(y, top + boxHeight + 18);
      return;
    }

    if (/h[1-6]/.test(tag)) {
      const level = Number(tag.slice(1));
      const size = level === 1 ? 38 : level === 2 ? 28 : 22;
      addText(plainText(element.textContent), {
        font: `800 ${size}px Arial, sans-serif`,
        lineHeight: size + 10,
        marginTop: level === 1 ? 0 : 22,
        marginBottom: 10,
        underline: level === 1,
      });
      return;
    }

    if (tag === "p") {
      addParagraph(element);
      return;
    }

    if (tag === "blockquote") {
      const text = plainText(element.textContent);
      measure.font = "16px Arial, sans-serif";
      const lines = wrapCanvasText(measure, text, contentWidth - 34);
      const top = y + 8;
      const height = Math.max(52, lines.length * 27 + 22);
      ops.push((context) => {
        context.save();
        context.fillStyle = "#fff6f2";
        context.fillRect(paperPadding, top, contentWidth, height);
        context.fillStyle = "#d85f45";
        context.fillRect(paperPadding, top, 4, height);
        context.restore();
      });
      y += 18;
      addText(text, {
        x: paperPadding + 20,
        width: contentWidth - 34,
        color: "#4b5751",
        marginBottom: 12,
      });
      return;
    }

    if (tag === "ul" || tag === "ol") {
      Array.from(element.children).forEach((item, index) => {
        addText(`${tag === "ol" ? `${index + 1}.` : "-"} ${plainText(item.textContent)}`, {
          x: paperPadding + 18,
          width: contentWidth - 18,
          lineHeight: 26,
          marginBottom: 2,
        });
      });
      y += 8;
      return;
    }

    if (tag === "pre") {
      const code = element.textContent.replace(/\s+$/g, "");
      const top = y + 10;
      measure.font = "14px Consolas, monospace";
      const codeLines = code.split("\n").flatMap((line) => wrapCanvasText(measure, line || " ", contentWidth - 32));
      const height = Math.max(52, codeLines.length * 22 + 28);
      ops.push((context) => {
        context.save();
        context.fillStyle = "#111917";
        context.beginPath();
        context.roundRect(paperPadding, top, contentWidth, height, 8);
        context.fill();
        context.restore();
      });
      y += 24;
      addText(code, {
        font: "14px Consolas, monospace",
        lineHeight: 22,
        color: "#e7f2ec",
        x: paperPadding + 16,
        width: contentWidth - 32,
        preserve: true,
        marginBottom: 18,
      });
      return;
    }

    if (tag === "table") {
      const rows = Array.from(element.querySelectorAll("tr")).map((row) =>
        Array.from(row.children).map((cell) => plainText(cell.textContent)),
      );
      const columns = Math.max(...rows.map((row) => row.length), 1);
      const cellWidth = contentWidth / columns;
      const rowHeight = 48;
      const top = y + 12;
      ops.push((context) => {
        context.save();
        context.font = "16px Arial, sans-serif";
        context.textBaseline = "top";
        rows.forEach((row, rowIndex) => {
          row.forEach((cell, columnIndex) => {
            const x = paperPadding + columnIndex * cellWidth;
            const cellY = top + rowIndex * rowHeight;
            context.fillStyle = rowIndex === 0 ? "#edf4f1" : "#ffffff";
            context.fillRect(x, cellY, cellWidth, rowHeight);
            context.strokeStyle = "#dbe4df";
            context.strokeRect(x, cellY, cellWidth, rowHeight);
            context.fillStyle = "#1b2521";
            context.fillText(cell, x + 12, cellY + 14);
          });
        });
        context.restore();
      });
      y = top + rows.length * rowHeight + 24;
      return;
    }

    if (tag === "hr") {
      const top = y + 20;
      ops.push((context) => {
        context.strokeStyle = "#dce5e0";
        context.beginPath();
        context.moveTo(paperPadding, top);
        context.lineTo(width - paperPadding, top);
        context.stroke();
      });
      y += 42;
      return;
    }

    addParagraph(element);
  });

  return { height: Math.max(y + paperPadding, 360), ops, padding: paperPadding, contentWidth };
}

async function renderFallbackCanvas(scale = 2) {
  await document.fonts.ready;
  const width = Math.max(620, Math.min(840, Math.ceil(preview.getBoundingClientRect().width || 840)));
  const layout = makeFallbackLayout(width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(layout.height * scale);
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, layout.height);
  context.strokeStyle = "#e0e6e2";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(0.5, 0.5, width - 1, layout.height - 1, 8);
  context.stroke();
  layout.ops.forEach((draw) => draw(context));
  return canvas;
}

function appendCanvasPadding(canvas, padding) {
  if (padding <= 0) return canvas;

  const padded = document.createElement("canvas");
  padded.width = canvas.width;
  padded.height = canvas.height + padding;

  const context = padded.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, padded.width, padded.height);
  context.drawImage(canvas, 0, 0);
  return padded;
}

function rowInkScore(data, row, width, left, right, step) {
  let score = 0;

  for (let x = left; x < right; x += step) {
    const index = (row * width + x) * 4;
    const alpha = data[index + 3];
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    if (alpha > 24 && (red < 246 || green < 246 || blue < 246)) {
      score += 1;
    }
  }

  return score;
}

function rowBandInkScore(data, row, width, height, left, right, step, radius) {
  let worst = 0;
  let total = 0;
  let samples = 0;

  for (let offset = -radius; offset <= radius; offset += 2) {
    const targetRow = row + offset;
    if (targetRow < 0 || targetRow >= height) continue;

    const score = rowInkScore(data, targetRow, width, left, right, step);
    worst = Math.max(worst, score);
    total += score;
    samples += 1;
  }

  return { worst, total, samples };
}

function findWhitespacePageCut(context, canvas, target, lowerBound, upperBound) {
  const from = Math.max(0, Math.floor(lowerBound));
  const to = Math.min(canvas.height - 1, Math.ceil(upperBound));

  if (to <= from) return null;

  const width = canvas.width;
  const height = to - from + 1;
  const data = context.getImageData(0, from, width, height).data;
  const left = Math.floor(width * 0.06);
  const right = Math.ceil(width * 0.94);
  const sampleStep = Math.max(4, Math.floor(width / 560));
  const rowStep = Math.max(2, Math.floor(height / 220));
  const bandRadius = Math.max(8, Math.floor(width / 180));
  const sampleCount = Math.max(1, Math.ceil((right - left) / sampleStep));
  const blankThreshold = Math.max(2, Math.floor(sampleCount * 0.012));
  let best = null;

  for (let row = bandRadius; row < height - bandRadius; row += rowStep) {
    const y = from + row;
    const band = rowBandInkScore(data, row, width, height, left, right, sampleStep, bandRadius);
    const distance = Math.abs(y - target);

    if (
      !best ||
      band.worst < best.worst ||
      (band.worst === best.worst && band.total < best.total) ||
      (band.worst === best.worst && band.total === best.total && distance < best.distance)
    ) {
      best = { y, worst: band.worst, total: band.total, distance };
    }
  }

  return best && best.worst <= blankThreshold ? best.y : null;
}

function splitCanvasIntoPages(canvas) {
  const paddedCanvas = appendCanvasPadding(canvas, Math.max(120, Math.floor(canvas.width * 0.08)));
  const context = paddedCanvas.getContext("2d");
  const sliceHeight = Math.max(1, Math.floor((PDF_CONTENT_HEIGHT * paddedCanvas.width) / PDF_CONTENT_WIDTH));
  const searchRadius = Math.max(220, Math.floor(sliceHeight * 0.28));
  const minSliceHeight = Math.max(1, Math.floor(sliceHeight * 0.48));
  const pages = [];

  for (let top = 0; top < paddedCanvas.height;) {
    const remaining = paddedCanvas.height - top;
    const target = top + Math.min(sliceHeight, remaining);
    let cut = top + remaining;

    if (remaining > sliceHeight) {
      const whitespaceCut = findWhitespacePageCut(
        context,
        paddedCanvas,
        top + sliceHeight,
        top + minSliceHeight,
        top + sliceHeight + searchRadius,
      );
      cut = whitespaceCut || target;
    }

    if (cut <= top) cut = Math.min(paddedCanvas.height, top + sliceHeight);

    const height = Math.min(cut - top, paddedCanvas.height - top);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = paddedCanvas.width;
    pageCanvas.height = height;
    const pageContext = pageCanvas.getContext("2d");
    pageContext.fillStyle = "#ffffff";
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(paddedCanvas, 0, top, paddedCanvas.width, height, 0, 0, paddedCanvas.width, height);
    pages.push(pageCanvas);

    top += height;
  }

  return pages;
}

async function renderPreviewPdfPages(scale = 2) {
  await document.fonts.ready;
  return splitCanvasIntoPages(await renderPreviewCanvas(scale));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(
    now.getMinutes(),
  )}`;
}

function dataUrlToBytes(dataUrl) {
  const binary = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeText(value) {
  return new TextEncoder().encode(value);
}

function concatBytes(chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

function buildPdfFromCanvases(pageCanvases) {
  const pages = pageCanvases.map((pageCanvas) => ({
    width: pageCanvas.width,
    height: pageCanvas.height,
    bytes: dataUrlToBytes(pageCanvas.toDataURL("image/jpeg", 1)),
  }));

  const objects = new Map();
  const pageIds = pages.map((_, index) => 3 + index * 3);
  objects.set(1, [encodeText("<< /Type /Catalog /Pages 2 0 R >>")]);
  objects.set(2, [
    encodeText(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`),
  ]);

  pages.forEach((page, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const imageName = `Im${index + 1}`;
    const drawWidth = PDF_CONTENT_WIDTH;
    const drawHeight = (page.height / page.width) * drawWidth;
    const x = PDF_MARGIN;
    const y = PDF_PAGE_HEIGHT - PDF_MARGIN - drawHeight;
    const stream = `q ${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(
      2,
    )} cm /${imageName} Do Q`;

    objects.set(pageId, [
      encodeText(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
      ),
    ]);
    objects.set(contentId, [encodeText(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)]);
    objects.set(imageId, [
      encodeText(
        `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.bytes.length} >>\nstream\n`,
      ),
      page.bytes,
      encodeText("\nendstream"),
    ]);
  });

  const chunks = [encodeText("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
  const offsets = [0];
  let position = chunks[0].length;

  Array.from(objects.keys())
    .sort((a, b) => a - b)
    .forEach((id) => {
      offsets[id] = position;
      const prefix = encodeText(`${id} 0 obj\n`);
      const suffix = encodeText("\nendobj\n");
      const body = objects.get(id);
      chunks.push(prefix, ...body, suffix);
      position += prefix.length + body.reduce((sum, chunk) => sum + chunk.length, 0) + suffix.length;
    });

  const xrefStart = position;
  const maxId = Math.max(...objects.keys());
  const xrefRows = ["xref", `0 ${maxId + 1}`, "0000000000 65535 f "];
  for (let id = 1; id <= maxId; id += 1) {
    xrefRows.push(`${String(offsets[id]).padStart(10, "0")} 00000 n `);
  }
  const trailer = `${xrefRows.join("\n")}\ntrailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  chunks.push(encodeText(trailer));

  return new Blob([concatBytes(chunks)], { type: "application/pdf" });
}

function buildPdfFromCanvas(canvas) {
  return buildPdfFromCanvases(splitCanvasIntoPages(canvas));
}

async function exportImage() {
  if (!editor.value.trim()) {
    showToast("先输入一些 Markdown 内容");
    return;
  }
  showToast("正在生成图片");
  const canvas = await renderPreviewCanvas(2);
  canvas.toBlob((blob) => {
    if (!blob) {
      showToast("图片生成失败");
      return;
    }
    downloadBlob(blob, `markdown-${timestamp()}.png`);
    showToast("图片已导出");
  }, "image/png");
}

async function exportPdf() {
  if (!editor.value.trim()) {
    showToast("先输入一些 Markdown 内容");
    return;
  }
  showToast("正在生成高质量 PDF，公式较多时会慢一些");
  const pages = await renderPreviewPdfPages(4);
  const pdf = buildPdfFromCanvases(pages);
  downloadBlob(pdf, `markdown-${timestamp()}.pdf`);
  showToast("PDF 已导出");
}

editor.addEventListener("input", updatePreview);

document.querySelectorAll(".tool-row button").forEach((button) => {
  button.addEventListener("click", () => {
    applySelectionTransform({
      wrap: button.dataset.wrap,
      prefix: button.dataset.prefix,
    });
  });
});

document.querySelector("#clearButton").addEventListener("click", () => {
  if (!editor.value.trim() || confirm("清空当前内容？")) {
    editor.value = "";
    updatePreview();
    editor.focus();
  }
});

document.querySelector("#imageButton").addEventListener("click", () => {
  exportImage().catch(() => showToast("图片导出失败，可尝试打印为 PDF"));
});

document.querySelector("#pdfButton").addEventListener("click", () => {
  exportPdf().catch(() => showToast("PDF 导出失败，可尝试打印保存"));
});

document.querySelector("#printButton").addEventListener("click", () => {
  window.print();
});

paperToggle.addEventListener("change", () => {
  preview.classList.toggle("paper", paperToggle.checked);
});

editor.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  event.preventDefault();
  editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
  updatePreview();
});

updatePreview();
