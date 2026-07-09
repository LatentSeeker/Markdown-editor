

# Markdown Studio 📝

Markdown Studio 是一款极简、优雅且功能强大的原生 Web 端 Markdown 编辑器。它拥有精心设计的排版系统，完美支持数学公式、数据表格和多端适配，并具备智能的分页截断算法，能够一键导出高质量的图片和 PDF 文件。

## [使用在线markdown编辑器](https://latentseeker.github.io/Markdown-editor/)
---
> **💡 免配置、纯原生：** 本项目完全基于原生 HTML/CSS/JavaScript 构建，无需安装繁重的 Node.js 环境或前端框架，开箱即用。

---

## ✨ 核心特性

* **🖌️ 优雅的实时预览**：采用“所见即所得”的纸张（Paper）式双栏排版布局，完美还原印刷级阅读体验。
* **📐 顶尖的数学公式支持**：内置极速轻量的 `MathParser` 引擎，同时无缝兼容 `KaTeX`。无论是行内公式 $a^2 + b^2 = c^2$ 还是块级矩阵方程，都能细腻呈现。
* **📊 规范的扩展组件**：支持标准 Markdown 表格渲染、高亮代码块、块级引用（Blockquote）及无序/有序列表。
* **🖨️ 智能 PDF 分页与图片导出**：
  * **图片导出**：利用 HTML-to-Image 及高性能 SVG 回退机制，输出 2x 高清快照。
  * **PDF 导出与智能截断**：内置独特的**空白行墨水得分算法（Ink Score Algorithm）**，自动寻找段落间的最佳“白空”进行物理分页，彻底告别公式或单行文本被跨页腰斩的尴尬。
* **💾 本地持久化**：集成 `localStorage` 自动保存机制，防止数据意外丢失。

---

## 🛠️ 技术栈

* **核心基础**：HTML5 / CSS3 (具有现代级 CSS 变量控制) / Vanilla JS (原生 ES6+)
* **数学排版**：KaTeX / 自建轻量级 MathParser 引擎
* **图形渲染**：Html-to-Image / 原生 HTML Canvas 2D

---

## 📂 项目结构

```text
├── vendor/                # 第三方公共库
│   ├── katex/             # 数学公式渲染库
│   └── html-to-image/     # 视图无损转换画布库
├── index.html             # 结构布局与骨架
├── styles.css             # 现代微渐变双色主题样式
├── app.js                 # 核心逻辑与解析引擎
└── .gitignore             # 忽略浏览器运行时临时文件



---

## 🚀 快速开始

### 1. 本地运行

由于本项目是纯原生前端，你甚至**不需要**执行 `npm install`。
只需要通过任何本地服务器插件运行 `index.html`。例如使用 VS Code 的 **Live Server** 插件，或者在项目目录下运行 Python 快速服务器：

```bash
# Python 3
python -m http.server 8000

```

然后在浏览器中访问 `http://localhost:8000` 即可开始使用。

### 2. 快捷键与工具栏

* 点击快捷工具栏的 `B`、`I`、`</>`、`Σ` 可快速为选中文本注入 Markdown 语法。
* 在编辑器内支持舒适的 `Tab` 键双空格缩进。

---

## ⚙️ 核心算法说明：智能分页截断 (Page-Break)

传统的网页转 PDF 往往会在页面交界处直接切断文字。本编辑器在 `app.js` 中实现了一个**智能墨水像素检索器 (`rowInkScore`)**：

1. 在导出 PDF 前，将文档先渲染至高阶 Canvas 像素层。
2. 扫描临界高度区域（`searchRadius`）内的每一行像素点。
3. 动态计算画面上的“非空白像素（墨水得分）”，从而锁定最完美的段落间隙、空行或换行处进行完美切页，保证打印文本的绝对完整。

---

## 📄 开源许可证

本项目基于 [MIT License](https://www.google.com/search?q=LICENSE) 协议开源。欢迎自由分发、修改或用于你的个人/商业项目中。

```


