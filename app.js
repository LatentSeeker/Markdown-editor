const editor = document.querySelector("#editor");
const preview = document.querySelector("#preview");
const docStats = document.querySelector("#docStats");
const toast = document.querySelector("#toast");
const paperToggle = document.querySelector("#paperToggle");
const styleSelect = document.querySelector("#styleSelect");
const fileInput = document.querySelector("#fileInput");

const STORAGE_KEY = "markdown-studio-content";
const STYLE_KEY = "markdown-studio-style";
const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN = 36;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
const PDF_CONTENT_HEIGHT = PDF_PAGE_HEIGHT - PDF_MARGIN * 2;

const starter = `# 项目周报

> 本周重点：把计划、进度和风险写清楚，让读者可以快速抓住状态。

[TOC]

## 已完成

- [x] 完成 Markdown 编辑器原型
- [x] 支持 **实时预览**、表格、代码块和引用
- [ ] 补充项目截图与交付说明

> [!TIP] 写作提示
> 使用目录、脚注和提示块，可以让长文档更容易浏览。

## 数据表

| 模块 | 状态 | 负责人 |
| --- | --- | --- |
| 编辑器 | 完成 | Alice |
| 导出 | 进行中 | Bob |

表格支持左、中、右对齐，正文也支持 ~~删除内容~~ 和 ==重点标记==。

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

公式由 KaTeX 完整排版，并会保留到图片和 PDF 中。[^katex]

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

[^katex]: 行内公式与块级公式都使用本地 KaTeX 字体，不依赖网络。
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
  if (/^(https?:|mailto:|#|\/|\.{1,2}\/)/i.test(trimmed)) return trimmed;
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

function inlineText(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~=$]/g, "")
    .trim();
}

function makeSlug(value, usedSlugs) {
  const base = inlineText(value)
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-") || "section";
  const count = usedSlugs.get(base) || 0;
  usedSlugs.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function createRenderContext(markdown) {
  const footnotes = new Map();
  const contentLines = [];
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const definition = lines[index].match(/^\[\^([^\]]+)]\s*:\s*(.*)$/);
    if (!definition) {
      contentLines.push(lines[index]);
      continue;
    }

    const body = [definition[2]];
    while (index + 1 < lines.length && /^(?: {2,}|\t)\S/.test(lines[index + 1])) {
      body.push(lines[index + 1].trim());
      index += 1;
    }
    footnotes.set(definition[1], body.join(" "));
  }

  const usedSlugs = new Map();
  const headings = [];
  let inCode = false;
  contentLines.forEach((line, index) => {
    if (/^```/.test(line.trim())) {
      inCode = !inCode;
      return;
    }
    if (inCode) return;

    const atx = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    const setext = index + 1 < contentLines.length && contentLines[index + 1].match(/^\s*(=+|-+)\s*$/);
    if (!atx && !setext) return;

    const level = atx ? atx[1].length : setext[1][0] === "=" ? 1 : 2;
    const source = atx ? atx[2] : line.trim();
    headings.push({ level, source, text: inlineText(source), id: makeSlug(source, usedSlugs) });
  });

  return {
    content: contentLines.join("\n"),
    footnotes,
    headings,
    headingIndex: 0,
    usedFootnotes: [],
  };
}

function inlineMarkdown(value, context) {
  let html = value;
  const codeSpans = [];
  const mathSpans = [];
  const imageSpans = [];
  const footnoteSpans = [];

  html = html.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000CODE${codeSpans.length - 1}\u0000`;
  });

  html = html.replace(/(^|[^\\])\$([^$\n]+)\$/g, (_, prefix, expression) => {
    mathSpans.push(renderMathExpression(expression));
    return `${prefix}\u0000MATH${mathSpans.length - 1}\u0000`;
  });

  html = html.replace(/!\[([^\]]*)]\(([^)\s]+)(?:\s+["']([^"']+)["'])?\)/g, (_, alt, url, title) => {
    const safeUrl = escapeAttr(sanitizeUrl(url));
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
    imageSpans.push(`<span class="markdown-image"><img src="${safeUrl}" alt="${escapeAttr(
      alt,
    )}"${titleAttr} loading="lazy">${title ? `<span class="image-caption">${escapeHtml(title)}</span>` : ""}</span>`);
    return `\u0000IMAGE${imageSpans.length - 1}\u0000`;
  });

  html = html.replace(/\[\^([^\]]+)]/g, (match, id) => {
    if (!context?.footnotes.has(id)) return match;
    if (!context.usedFootnotes.includes(id)) context.usedFootnotes.push(id);
    const number = context.usedFootnotes.indexOf(id) + 1;
    footnoteSpans.push(`<sup class="footnote-ref"><a href="#fn-${escapeAttr(id)}" id="fnref-${
      escapeAttr(id)
    }">${number}</a></sup>`);
    return `\u0000FOOTNOTE${footnoteSpans.length - 1}\u0000`;
  });

  html = escapeHtml(html);

  html = html.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
    const safeUrl = escapeAttr(sanitizeUrl(url.replace(/&amp;/g, "&")));
    return `<a href="${safeUrl}" target="_blank" rel="noreferrer">${label}</a>`;
  });

  html = html
    .replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/==([^=]+)==/g, "<mark>$1</mark>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/(^|[^\w])_([^_]+)_($|[^\w])/g, "$1<em>$2</em>$3");

  return html
    .replace(/\u0000MATH(\d+)\u0000/g, (_, index) => mathSpans[Number(index)])
    .replace(/\u0000CODE(\d+)\u0000/g, (_, index) => codeSpans[Number(index)])
    .replace(/\u0000IMAGE(\d+)\u0000/g, (_, index) => imageSpans[Number(index)])
    .replace(/\u0000FOOTNOTE(\d+)\u0000/g, (_, index) => footnoteSpans[Number(index)]);
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
    /^\[toc]$/i.test(line.trim()) ||
    (line.trim() && /^\s*(=+|-+)\s*$/.test(nextLine)) ||
    /^>\s?/.test(line) ||
    /^([-*_])\s*\1\s*\1\s*$/.test(line) ||
    /^(\s*)([-*+])\s+/.test(line) ||
    /^(\s*)\d+\.\s+/.test(line) ||
    /^\$\$/.test(line.trim()) ||
    /^```/.test(line) ||
    (line.includes("|") && isTableDivider(nextLine))
  );
}

function renderList(lines, start, context) {
  const ordered = /^\s*\d+\.\s+/.test(lines[start]);
  const tag = ordered ? "ol" : "ul";
  const items = [];
  let hasTasks = false;
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    const match = ordered ? line.match(/^\s*\d+\.\s+(.*)$/) : line.match(/^\s*[-*+]\s+(.*)$/);
    if (!match) break;
    const task = match[1].match(/^\[([ xX])]\s+(.*)$/);
    if (task) {
      hasTasks = true;
      const checked = task[1].toLowerCase() === "x";
      items.push(`<li class="task-item"><input type="checkbox" ${checked ? "checked " : ""}disabled><span>${inlineMarkdown(
        task[2],
        context,
      )}</span></li>`);
    } else {
      items.push(`<li>${inlineMarkdown(match[1], context)}</li>`);
    }
    index += 1;
  }

  return {
    html: `<${tag}${hasTasks ? ' class="task-list"' : ""}>${items.join("")}</${tag}>`,
    next: index,
  };
}

function renderTable(lines, start, context) {
  const headers = splitTableRow(lines[start]);
  const alignments = splitTableRow(lines[start + 1]).map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    return left && right ? "center" : right ? "right" : "left";
  });
  let index = start + 2;
  const rows = [];

  while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }

  const headerHtml = headers
    .map((cell, cellIndex) => `<th style="text-align:${alignments[cellIndex] || "left"}">${inlineMarkdown(cell, context)}</th>`)
    .join("");
  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell, cellIndex) =>
              `<td style="text-align:${alignments[cellIndex] || "left"}">${inlineMarkdown(cell, context)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return {
    html: `<div class="table-scroll"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
    next: index,
  };
}

function renderToc(context) {
  if (!context.headings.length) return "";
  return `<nav class="toc" aria-label="目录"><div class="toc-title">目录</div><ol>${context.headings
    .map(
      (heading) =>
        `<li class="toc-level-${heading.level}"><a href="#${escapeAttr(heading.id)}">${escapeHtml(heading.text)}</a></li>`,
    )
    .join("")}</ol></nav>`;
}

function renderFootnotes(context) {
  if (!context.usedFootnotes.length) return "";
  return `<section class="footnotes"><ol>${context.usedFootnotes
    .map(
      (id) =>
        `<li id="fn-${escapeAttr(id)}">${inlineMarkdown(context.footnotes.get(id), context)} <a class="footnote-back" href="#fnref-${
          escapeAttr(id)
        }" aria-label="返回正文">↩</a></li>`,
    )
    .join("")}</ol></section>`;
}

function renderMarkdown(markdown, context = null, isRoot = true) {
  const renderContext = context || createRenderContext(markdown);
  const source = context ? markdown : renderContext.content;
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
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
        `<pre data-language="${escapeAttr(language || "text")}"><code>${escapeHtml(code.join("\n"))}</code></pre>`,
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
      const meta = renderContext.headings[renderContext.headingIndex++];
      blocks.push(`<h${level} id="${escapeAttr(meta?.id || makeSlug(heading[2], new Map()))}">${inlineMarkdown(
        heading[2].replace(/\s+#+\s*$/, ""),
        renderContext,
      )}</h${level}>`);
      index += 1;
      continue;
    }

    if (nextLine && /^\s*(=+|-+)\s*$/.test(nextLine) && trimmed) {
      const level = nextLine.trim()[0] === "=" ? 1 : 2;
      const meta = renderContext.headings[renderContext.headingIndex++];
      blocks.push(`<h${level} id="${escapeAttr(meta?.id || makeSlug(trimmed, new Map()))}">${inlineMarkdown(
        trimmed,
        renderContext,
      )}</h${level}>`);
      index += 2;
      continue;
    }

    if (/^\[toc]$/i.test(trimmed)) {
      blocks.push(renderToc(renderContext));
      index += 1;
      continue;
    }

    if (/^([-*_])\s*\1\s*\1\s*$/.test(trimmed)) {
      blocks.push("<hr>");
      index += 1;
      continue;
    }

    if (line.includes("|") && isTableDivider(nextLine)) {
      const table = renderTable(lines, index, renderContext);
      blocks.push(table.html);
      index = table.next;
      continue;
    }

    if (/^\s*([-*+])\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const list = renderList(lines, index, renderContext);
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
      const callout = quote[0]?.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)]\s*(.*)$/i);
      if (callout) {
        const kind = callout[1].toLowerCase();
        const labels = { note: "说明", tip: "提示", important: "重要", warning: "注意", caution: "警告" };
        const title = callout[2] || labels[kind];
        blocks.push(`<aside class="callout callout-${kind}"><div class="callout-title">${escapeHtml(
          title,
        )}</div>${renderMarkdown(quote.slice(1).join("\n"), renderContext, false)}</aside>`);
      } else {
        blocks.push(`<blockquote>${renderMarkdown(quote.join("\n"), renderContext, false)}</blockquote>`);
      }
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index], lines[index + 1] || "")) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    const withBreaks = paragraph
      .map((part) => inlineMarkdown(part.replace(/(?: {2}|\\)$/, ""), renderContext))
      .map((part, partIndex) => `${part}${partIndex < paragraph.length - 1 && /(?: {2}|\\)$/.test(paragraph[partIndex]) ? "<br>" : " "}`)
      .join("")
      .trim();
    blocks.push(`<p>${withBreaks}</p>`);
  }

  if (isRoot) blocks.push(renderFootnotes(renderContext));
  return blocks.filter(Boolean).join("\n");
}

function updateStats() {
  const text = editor.value;
  const chars = Array.from(text.replace(/\s/g, "")).length;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  const words = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  const readingMinutes = Math.max(1, Math.ceil((chars + words * 2) / 500));
  docStats.textContent = `${chars} 字 · ${lines} 行 · 约 ${readingMinutes} 分钟`;
}

function fitWideMath() {
  preview.querySelectorAll(".math-display .katex-display").forEach((display) => {
    const katex = display.querySelector(":scope > .katex");
    if (!katex || display.clientWidth <= 0) return;
    katex.style.fontSize = "";
    const available = display.clientWidth;
    const actual = katex.getBoundingClientRect().width;
    if (actual > available) {
      katex.style.fontSize = `${Math.max(0.72, available / actual)}em`;
    }
  });
}

function updatePreview() {
  const markdown = editor.value.trim();
  preview.innerHTML = markdown
    ? renderMarkdown(editor.value)
    : '<div class="empty-state">开始输入 Markdown</div>';
  updateStats();
  localStorage.setItem(STORAGE_KEY, editor.value);
  fitWideMath();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function replaceSelection(before, after, placeholder = "文本") {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || placeholder;
  const replacement = `${before}${selected}${after}`;
  editor.setRangeText(replacement, start, end, "end");
  editor.setSelectionRange(start + before.length, start + before.length + selected.length);
}

function prefixSelectedLines(prefix) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
  const endProbe = end > start ? end - 1 : start;
  const lineEndIndex = editor.value.indexOf("\n", endProbe);
  const lineEnd = lineEndIndex === -1 ? editor.value.length : lineEndIndex;
  const block = editor.value
    .slice(lineStart, lineEnd)
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
  editor.setRangeText(block, lineStart, lineEnd, "select");
}

function insertTemplate(template, placeholder = "内容") {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || placeholder;
  const marker = "{{selection}}";
  const replacement = template.replace(marker, selected);
  const selectionOffset = replacement.indexOf(selected);
  editor.setRangeText(replacement, start, end, "end");
  editor.setSelectionRange(start + selectionOffset, start + selectionOffset + selected.length);
}

function toggleHeading() {
  const start = editor.selectionStart;
  const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
  const lineEndIndex = editor.value.indexOf("\n", start);
  const lineEnd = lineEndIndex === -1 ? editor.value.length : lineEndIndex;
  const line = editor.value.slice(lineStart, lineEnd);
  const heading = line.match(/^(#{1,6})\s+(.*)$/);
  const replacement = heading
    ? heading[1].length === 6
      ? heading[2]
      : `${"#".repeat(heading[1].length + 1)} ${heading[2]}`
    : `## ${line || "标题"}`;
  editor.setRangeText(replacement, lineStart, lineEnd, "end");
}

const toolbarActions = {
  heading: toggleHeading,
  bold: () => replaceSelection("**", "**"),
  italic: () => replaceSelection("*", "*"),
  strike: () => replaceSelection("~~", "~~"),
  code: () => replaceSelection("`", "`", "code"),
  math: () => replaceSelection("$", "$", "E = mc^2"),
  link: () => insertTemplate("[{{selection}}](https://example.com)", "链接文字"),
  image: () => insertTemplate("![{{selection}}](https://example.com/image.jpg)", "图片说明"),
  bullet: () => prefixSelectedLines("- "),
  task: () => prefixSelectedLines("- [ ] "),
  quote: () => prefixSelectedLines("> "),
  codeblock: () => insertTemplate("```js\n{{selection}}\n```", "console.log('Hello');"),
  table: () =>
    insertTemplate(
      "| 项目 | 说明 | 状态 |\n| :--- | :--- | ---: |\n| {{selection}} | 示例内容 | 完成 |\n| 第二项 | 示例内容 | 进行中 |",
      "第一项",
    ),
};

function applyToolbarAction(action) {
  const handler = toolbarActions[action];
  if (!handler) return;
  handler();

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

document.querySelectorAll(".tool-row [data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    applyToolbarAction(button.dataset.action);
  });
});

document.querySelectorAll(".view-switch button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".workspace").dataset.view = button.dataset.view;
    document.querySelectorAll(".view-switch button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    fitWideMath();
  });
});

document.querySelector("#openButton").addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    editor.value = String(reader.result || "");
    updatePreview();
    editor.focus();
    showToast(`已打开 ${file.name}`);
  };
  reader.onerror = () => showToast("文件读取失败");
  reader.readAsText(file, "UTF-8");
  fileInput.value = "";
});

document.querySelector("#saveButton").addEventListener("click", () => {
  const blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `markdown-${timestamp()}.md`);
  showToast("Markdown 已保存");
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

styleSelect.value = localStorage.getItem(STYLE_KEY) || "editorial";
preview.dataset.style = styleSelect.value;
styleSelect.addEventListener("change", () => {
  preview.dataset.style = styleSelect.value;
  localStorage.setItem(STYLE_KEY, styleSelect.value);
  fitWideMath();
});

editor.addEventListener("keydown", (event) => {
  const shortcut = event.ctrlKey || event.metaKey;
  if (shortcut && !event.shiftKey && ["b", "i", "k"].includes(event.key.toLowerCase())) {
    event.preventDefault();
    const actions = { b: "bold", i: "italic", k: "link" };
    applyToolbarAction(actions[event.key.toLowerCase()]);
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
    updatePreview();
  }
});

updatePreview();
