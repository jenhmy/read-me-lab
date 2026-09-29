"use strict";

/* ===================== Setup ===================== */
const editor = document.getElementById("editor");
const output = document.getElementById("output");
const overlay = document.getElementById("modalOverlay");
const modalEl = document.getElementById("modal");
const toastEl = document.getElementById("toast");

document.execCommand("defaultParagraphSeparator", false, "p");

let savedRange = null;
let lastClickedImage = null;
let ghUsername = "";

/** Colour families for badges, banner and typing animation (five shades each). */
const PALETTE = [
  ["Yellow", ["#fef08a", "#fde047", "#facc15", "#eab308", "#a16207"]],
  ["Orange", ["#fed7aa", "#fdba74", "#fb923c", "#f97316", "#c2410c"]],
  ["Red", ["#fecaca", "#fca5a5", "#f87171", "#ef4444", "#b91c1c"]],
  ["Green", ["#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#15803d"]],
  ["Light blue", ["#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0369a1"]],
  ["Dark blue", ["#bfdbfe", "#60a5fa", "#3b82f6", "#1d4ed8", "#1e3a8a"]],
  ["Purple", ["#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#7e22ce"]],
  ["Lilac", ["#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#6d28d9"]],
  ["Black", ["#9ca3af", "#6b7280", "#4b5563", "#1f2937", "#000000"]],
  ["White", ["#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9aa0a6"]],
];
/** Emoji groups shown in the emoji picker, as space-separated strings. */
const EMOJI_GROUPS = [
  ["Status", "✅ ☑️ ✔️ ❌ ⛔ 🚫 ⚠️ 🚧 ❗ ❓ 💯 🆕 🆙 🔝 🔜 ⏳ ⌛ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤"],
  ["Project", "🚀 ✨ 🔥 💥 ⚡ 🎯 🧩 📦 🗂️ 📁 📂 🏗️ 🧱 🪜 🗺️ 🧭 📍 🔀 🔁 🔄 ⏩ ⏪ ↩️ ⤴️ ⤵️"],
  ["Dev", "💻 🖥️ ⌨️ 🖱️ 💾 🗄️ 🗃️ 🖨️ 🔌 🔋 📡 🛰️ ⚙️ 🔧 🔨 🛠️ ⛏️ 🪛 🔩 🧰 🧪 🧬 🔬 🔭 ⚗️"],
  ["Bugs & quality", "🐛 🐞 🪲 🔍 🔎 🧹 🩹 🚑 🧯 🛡️ 🔒 🔓 🔐 🔑 🗝️ 🚨 🆘 ⚔️ 🔏"],
  ["Docs", "📝 📄 📃 📑 📋 📊 📈 📉 📖 📚 📕 📗 📘 📙 📓 📔 🏷️ 🔖 ✏️ 🖊️ 🖋️ ✒️ 📐 📏 🗒️ 📌 📎 🖇️"],
  ["Team", "💬 🗨️ 🗯️ 💭 📣 📢 🔔 🔕 📧 ✉️ 📨 📬 👥 👤 🤝 🙌 👏 🙏 💪 🧠 👀 👋 👍 👎 ✍️ 🫱"],
  ["Web & cloud", "🌐 🕸️ ☁️ 🌩️ 🖧 🏠 🏢 🚪 🪟 📱 📲 ⏱️ 🕐 📅 🗓️ 🔗 ⛓️ 📶 🛜"],
  ["Media", "🎨 🖼️ 📷 📸 🎥 🎬 🎞️ 🔊 🔇 🎵 🎧 🎤 📺 📻 🕹️ 🎮 🎲"],
  ["Awards", "🏆 🥇 🥈 🥉 🏅 🎖️ 👑 💎 ⭐ 🌟 💫 🎉 🎊 🎁 🔮 🪄 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍"],
  ["Faces", "😀 😄 😁 😂 🙂 😉 😊 😍 🤩 😎 🤓 🧐 🤔 🤨 😐 😴 😅 😬 😱 😭 😢 😡 🤯 🥳 🤖 👻 💀 👽 🎃 🙈"],
  ["Nature & fun", "🌍 🌎 🌏 🌙 ☀️ ⛅ 🌈 💧 🌊 ❄️ 🌱 🌳 🍀 🌸 🐧 🐍 🦀 🐳 🦊 🐙 🦄 ☕ 🍕 🍺 🍫 🧊"],
];

/** Symbol groups for the symbol picker (a true third value marks multi-character items). */
const SYMBOL_GROUPS = [
  ["Hearts & stars", ["\u2661", "\u2665\uFE0E", "\u2606", "\u2605", "\u2726", "\u2727", "\u2729", "\u272A", "\u272B", "\u272C", "\u272D", "\u272E", "\u272F", "\u2742", "\u2749", "\u274A", "\u274B", "\u2731", "\u2732"]],
  ["Arrows", ["\u2190", "\u2192", "\u2191", "\u2193", "\u21D0", "\u21D2", "\u21D1", "\u21D3", "\u21D4", "\u21D5", "\u27F5", "\u27F6", "\u27F7", "\u21B0", "\u21B1", "\u21B2", "\u21B3", "\u21B4", "\u2937", "\u2936", "\u2794", "\u279C", "\u279D", "\u279E", "\u279F", "\u27A0", "\u27A4", "\u27A5", "\u27A6", "\u27A7", "\u21E8", "\u21E6", "\u21BA", "\u21BB", "\u27F3", "\u27F2"]],
  ["Marks", ["\u2713", "\u2717", "\u2718", "\u2612", "\u2610", "\u271A", "\u2725", "\u2756", "\u271C", "\u2318", "\u2325", "\u21E7", "\u2303", "\u23CE", "\u232B", "\u238B", "\u2690", "\u2691", "\u2301", "\u232C"]],
  ["Shapes", ["\u25CF", "\u25CB", "\u25C9", "\u25CE", "\u25D0", "\u25D1", "\u25D2", "\u25D3", "\u25B2", "\u25BC", "\u25C4", "\u25BA", "\u25C6", "\u25C7", "\u25C8", "\u25A0", "\u25A1", "\u25A3", "\u25A4", "\u25A5", "\u25A6", "\u25A7", "\u25A8", "\u25A9", "\u25AC", "\u25AD", "\u25AE", "\u25AF", "\u25B0", "\u25B1", "\u2B22", "\u2B21", "\u25CA", "\u2B25"]],
  ["Separators", ["\u00B7", "\u2022", "\u2023", "\u2043", "\u2024", "\u2025", "\u2026", "\u2027", "|", "\u2016", "\u2223", "\u2502", "\u254E", "\u2500", "\u2501", "\u2504", "\u2505", "\u2508", "\u2509", "\u2015", "\u2014", "\u2013", "/", "\\", "~", "\u223C", "\u2248", "\u224F"]],
  ["Box drawing", ["\u2500", "\u2502", "\u250C", "\u2510", "\u2514", "\u2518", "\u251C", "\u2524", "\u252C", "\u2534", "\u253C", "\u2550", "\u2551", "\u2554", "\u2557", "\u255A", "\u255D", "\u2560", "\u2563", "\u2566", "\u2569", "\u256C", "\u2580", "\u2584", "\u2588", "\u2591", "\u2592", "\u2593"]],
  ["Keyboard", ["\u2318", "\u2325", "\u21E7", "\u2303", "\u21E5", "\u23CE", "\u232B", "\u2326", "\u238B", "\u2400", "\u2421", "\u21EA", "\u21E9", "\u21E8", "\u21E7", "\u21E6", "\u2324", "\u2303", "\u2388"]],
  ["Superscripts", ["\u00B9", "\u00B2", "\u00B3", "\u2074", "\u2075", "\u2076", "\u2077", "\u2078", "\u2079", "\u2070", "\u207F", "\u207A", "\u207B", "\u207C"]],
  ["Subscripts", ["\u2081", "\u2082", "\u2083", "\u2084", "\u2085", "\u2086", "\u2087", "\u2088", "\u2089", "\u2080", "\u208A", "\u208B", "\u208C"]],
  ["Fractions", ["\u00BD", "\u2153", "\u2154", "\u00BC", "\u00BE", "\u2155", "\u2156", "\u2157", "\u2158", "\u2159", "\u215A", "\u215B", "\u215C", "\u215D", "\u215E"]],
  ["Music", ["\u2669", "\u266A", "\u266B", "\u266C", "\u266D", "\u266E", "\u266F"]],
  ["Games", ["\u2664", "\u2667", "\u2661", "\u2662", "\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685", "\u2654", "\u2655", "\u2656", "\u2657", "\u2658", "\u2659"]],
  ["Maths", ["\u00B1", "\u00D7", "\u00F7", "\u2248", "\u2260", "\u2264", "\u2265", "\u221E", "\u221A", "\u2211", "\u220F", "\u2206", "\u2207", "\u2202", "\u222B", "\u03C0", "\u00B5", "\u00B0", "\u2030", "\u2205", "\u2208", "\u2234", "\u2235", "\u2295", "\u2297"]],
  ["Money & marks", ["\u20AC", "\u00A3", "\u00A5", "\u00A2", "\u20B9", "\u20BD", "\u20A9", "\u20BF", "\u00A4", "\u00A9", "\u00AE", "\u2122", "\u00A7", "\u00B6", "\u2020", "\u2021"]],
  ["Punctuation", ["\u00AB", "\u00BB", "\u201C", "\u201D", "\u2018", "\u2019", "\u2026", "\u2014", "\u2013", "\u00B7", "\u2022", "\u2023", "\u2043", "\u00A1", "\u00BF", "\u2039", "\u203A"]],
  ["Faces", ["\u0CA0_\u0CA0", "\u0295\u2022\u1D25\u2022\u0294", "(\u256F\u00B0\u25A1\u00B0)\u256F\uFE35 \u253B\u2501\u253B", "(\u3065\uFF61\u25D5\u203F\u203F\u25D5\uFF61)\u3065", "\u1555( \u1590 )\u1557", "\u0295\u0361\u00B0\u1D25\u0361\u00B0\u0294", "\u30FE(\u0298\u30EE\u0298)\u30CE", "(\u2022\u203F\u2022)", "\u2570(\u25D5\u203F\u25D5)\u256F", "\u30C4"], true],
];

/* ===================== Helpers ===================== */
/** Escapes HTML special characters in a string. */
function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
/** Shows a short message in the toast element and hides it after a moment. */
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.add("hidden"), 2600);
}
/** Stores the current selection range if it is inside the editor. */
function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount && editor.contains(sel.anchorNode)) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
}
/** Restores the saved selection, or focuses the editor and returns false if none. */
function restoreSelection() {
  if (!savedRange) { editor.focus(); return false; }
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(savedRange);
  return true;
}
/** Returns the table fully covered by the range, or null. */
function tablaCubiertaPor(range) {
  if (range.collapsed) return null;
  const tablas = Array.from(editor.querySelectorAll("table"))
    .filter((t) => range.intersectsNode(t));
  if (tablas.length !== 1) return null;
  const t = tablas[0];
  const entera = document.createRange();
  entera.selectNodeContents(t);
  return range.compareBoundaryPoints(Range.START_TO_START, entera) <= 0 &&
         range.compareBoundaryPoints(Range.END_TO_END, entera) >= 0 ? t : null;
}

/** Runs an action, re-renders, and puts the caret back at the end of the resulting block. */
function conElCursorEnSuSitio(accion) {
  restoreSelection();
  const sel = window.getSelection();
  const bloque = sel.rangeCount ? topLevelBlockOf(sel.getRangeAt(0).startContainer) : null;
  const bloques = () => Array.from(editor.children).filter((el) => !el.hasAttribute("data-spacer"));
  const sitio = bloque ? bloques().indexOf(bloque) : -1;

  accion();
  render();

  const destino = sitio >= 0 ? bloques()[sitio] : null;
  if (destino) {
    const dentro = destino.querySelector(":scope > li:last-of-type") || destino;
    const r = document.createRange();
    r.selectNodeContents(dentro);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  }
  editor.focus();
}

/** Returns the column index of a table cell. */
function columnaDe(celda) {
  const fila = closestTag(celda, "tr");
  return Array.from(fila.children).filter(c => c.tagName === "TD" || c.tagName === "TH").indexOf(celda);
}

/** Aligns the selection: table columns, a whole table, or the enclosing list. */
function align(command) {
  restoreSelection();
  const sel = window.getSelection();
  const r0 = sel.rangeCount ? sel.getRangeAt(0) : null;

  const celdaIni = r0 && (closestTag(r0.startContainer, "td") || closestTag(r0.startContainer, "th"));
  const celdaFin = r0 && (closestTag(r0.endContainer, "td") || closestTag(r0.endContainer, "th"));
  if (celdaIni && celdaFin && closestTag(celdaIni, "table") === closestTag(celdaFin, "table")) {
    const tabla = closestTag(celdaIni, "table");
    const valor = { justifyLeft: "", justifyCenter: "center", justifyRight: "right" }[command];
    const columnas = new Set();
    if (r0.collapsed) {
      columnas.add(columnaDe(celdaIni));
    } else {
      Array.from(tabla.querySelectorAll("th, td"))
        .filter(c => r0.intersectsNode(c))
        .forEach(c => columnas.add(columnaDe(c)));
    }
    Array.from(tabla.querySelectorAll("tr")).forEach((tr) => {
      const cs = Array.from(tr.children).filter(x => x.tagName === "TD" || x.tagName === "TH");
      columnas.forEach(n => { if (cs[n]) cs[n].style.textAlign = valor; });
    });
    editor.focus();
    render();
    return;
  }

  const tablaEntera = r0 ? tablaCubiertaPor(r0) : null;
  if (tablaEntera) {
    const valor = { justifyLeft: "left", justifyCenter: "center", justifyRight: "right" }[command];
    const padre = tablaEntera.parentElement;
    const yaEnvuelta = padre && padre.tagName === "DIV" && padre.hasAttribute("align") && padre !== editor;
    if (valor === "left") {
      if (yaEnvuelta) padre.replaceWith(tablaEntera);
    } else if (yaEnvuelta) {
      padre.setAttribute("align", valor);
    } else {
      const div = document.createElement("div");
      div.setAttribute("align", valor);
      tablaEntera.replaceWith(div);
      div.appendChild(tablaEntera);
    }
    editor.focus();
    render();
    return;
  }

  const list = sel.rangeCount ? closestTag(sel.getRangeAt(0).startContainer, "ul") ||
                                closestTag(sel.getRangeAt(0).startContainer, "ol") : null;
  if (list) {
    const range = document.createRange();
    range.selectNodeContents(list);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.execCommand(command);
  render();
}

/** Toggles centering of the table under the caret by wrapping it in a div with align. */
function toggleTableCenter() {
  restoreSelection();
  const sel = window.getSelection();
  const tabla = sel.rangeCount ? closestTag(sel.getRangeAt(0).startContainer, "table") : null;
  if (!tabla) { toast("Put the cursor inside a table first"); return; }

  const r = sel.getRangeAt(0);
  const dondeEstaba = r.startContainer;
  const cuanto = r.startOffset;

  const padre = tabla.parentElement;
  const envuelta = padre && padre.tagName === "DIV" && padre.hasAttribute("align") && padre !== editor;
  if (envuelta && padre.getAttribute("align") === "center") {
    padre.replaceWith(tabla);
  } else if (envuelta) {
    padre.setAttribute("align", "center");
  } else {
    const div = document.createElement("div");
    div.setAttribute("align", "center");
    tabla.replaceWith(div);
    div.appendChild(tabla);
  }

  if (editor.contains(dondeEstaba)) {
    const vuelta = document.createRange();
    const tope = dondeEstaba.nodeType === 3
      ? dondeEstaba.textContent.length : dondeEstaba.childNodes.length;
    vuelta.setStart(dondeEstaba, Math.min(cuanto, tope));
    vuelta.collapse(true);
    sel.removeAllRanges();
    sel.addRange(vuelta);
  }
  editor.focus();
  render();
}

/** Toggles a heading level on the selected blocks. */
function toggleHeading(tag) {
  restoreSelection();
  const already = selectedBlocks().length > 0 &&
                  selectedBlocks().every(b => b.tagName === tag.toUpperCase());
  document.execCommand("formatBlock", false, already ? "p" : tag);
  unnestHeadings();
  render();
}

/** Returns the non-empty top-level blocks touched by the selection. */
function selectedBlocks() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return [];
  const range = sel.getRangeAt(0);
  return Array.from(editor.children).filter((el) => {
    if (!range.intersectsNode(el)) return false;
    return el.tagName !== "P" || el.textContent.trim() || el.querySelector("img, table, hr");
  });
}

/** Flattens headings nested inside other headings. */
function unnestHeadings() {
  const sel = "h1, h2, h3, h4, h5, h6";
  editor.querySelectorAll(sel).forEach((h) => {
    h.querySelectorAll(sel).forEach((inner) => {
      while (inner.firstChild) inner.parentNode.insertBefore(inner.firstChild, inner);
      inner.remove();
    });
  });
}

/** Returns the top-level editor child that contains the node, or null. */
function topLevelBlockOf(node) {
  let n = node;
  while (n && n.parentNode && n.parentNode !== editor) n = n.parentNode;
  return n && n.parentNode === editor ? n : null;
}

/** Inserts HTML as a sibling block after the current line and moves the caret to it. */
function insertBlockAtTopLevel(html) {
  restoreSelection();
  const sel = window.getSelection();
  const anchor = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;

  let block = null;
  let padre = editor;
  if (anchor && editor.contains(anchor)) {
    const det = closestTag(anchor, "details");
    if (det && editor.contains(det) && !closestTag(anchor, "summary")) {
      padre = det;
      if (anchor === det) block = det.lastElementChild;
      else { let n = anchor; while (n && n.parentNode !== det) n = n.parentNode; block = n; }
    } else {
      block = topLevelBlockOf(anchor);
    }
  }

  const temp = document.createElement("div");
  temp.innerHTML = html;
  const frag = document.createDocumentFragment();
  let lastNode = null;
  while (temp.firstChild) { lastNode = temp.firstChild; frag.appendChild(lastNode); }

  if (block) padre.insertBefore(frag, block.nextSibling);
  else padre.appendChild(frag);

  const VOID_TAGS = ["HR", "IMG", "BR"];
  let caretTarget = lastNode;
  if (lastNode && lastNode.nodeType === Node.ELEMENT_NODE && VOID_TAGS.includes(lastNode.tagName)) {
    const hueco = document.createElement("p");
    hueco.appendChild(document.createElement("br"));
    lastNode.parentNode.insertBefore(hueco, lastNode.nextSibling);
    caretTarget = hueco;
  }

  if (caretTarget) {
    const range = document.createRange();
    range.selectNodeContents(caretTarget);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    savedRange = range.cloneRange();
  }
  editor.focus();
  render();

  const nuevo = lastNode && lastNode.nodeType === Node.ELEMENT_NODE ? lastNode : caretTarget;
  if (nuevo && nuevo.scrollIntoView) {
    nuevo.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

/** Inserts HTML at the caret using the Range API and places the caret after it. */
function insertHtmlAtSelection(html) {
  restoreSelection();
  editor.focus();
  const sel = window.getSelection();
  if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
    const r = document.createRange();
    r.selectNodeContents(editor);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  }
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const frag = document.createDocumentFragment();
  let lastNode = null;
  while (temp.firstChild) { lastNode = temp.firstChild; frag.appendChild(lastNode); }
  range.insertNode(frag);
  if (lastNode) {
    const spacer = document.createTextNode("​");
    lastNode.parentNode.insertBefore(spacer, lastNode.nextSibling);
    range.setStart(spacer, 1);
    range.setEnd(spacer, 1);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  editor.focus();
  render();
}
/** Returns the closest ancestor of the node with the given tag inside the editor, or null. */
function closestTag(node, tag) {
  let n = node;
  while (n && n !== editor) {
    if (n.nodeType === 1 && n.tagName.toLowerCase() === tag) return n;
    n = n.parentNode;
  }
  return null;
}

/* ===================== Inline formats ===================== */

/** Unwraps every element matching `selector` inside `container`, keeping its children. */
function unwrapAllIn(container, selector) {
  container.querySelectorAll(selector).forEach((el) => {
    const parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });
}
/** Returns true if `node` has an ancestor with this tag below `root`. */
function hasAncestorTagWithin(node, root, tagName) {
  let p = node.parentNode;
  while (p && p !== root) {
    if (p.nodeType === 1 && p.tagName.toLowerCase() === tagName) return true;
    p = p.parentNode;
  }
  return false;
}
/** Returns true when all selected text already carries the given tag. */
function selectionAlreadyHas(range, tagName) {
  const a = closestTag(range.startContainer, tagName);
  const b = closestTag(range.endContainer, tagName);
  if (a && a === b) return true;
  const frag = range.cloneContents();
  const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null);
  let node, sawText = false;
  while ((node = walker.nextNode())) {
    if (!node.textContent.replace(/​/g, "").trim()) continue;
    sawText = true;
    if (!hasAncestorTagWithin(node, frag, tagName)) return false;
  }
  return sawText;
}

/** Returns the text of an element without zero-width spacers. */
function plainTextOf(el) { return el.textContent.replace(/​/g, ""); }

/** Removes elements of the given tag that have no visible text left. */
function dropEmptyInline(tagName) {
  editor.querySelectorAll(tagName).forEach((el) => {
    if (!el.textContent.replace(/​/g, "").trim()) el.remove();
  });
}

/** Removes block elements left empty, keeping ones with images, tables, rules or breaks. */
function dropEmptyBlocks() {
  editor.querySelectorAll("blockquote, p, li, h1, h2, h3, h4, h5, h6").forEach((el) => {
    if (el.textContent.replace(/​/g, "").trim()) return;
    if (el.querySelector("img, table, hr, br")) return;
    el.remove();
  });
}

/** Removes the format from a selection inside `wrapper`, keeping the rest formatted. */
function unwrapAround(range, wrapper, tagName) {
  const sel = window.getSelection();
  const clean = (t) => t.replace(/​/g, "");

  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(wrapper);
  beforeRange.setEnd(range.startContainer, range.startOffset);
  const afterRange = document.createRange();
  afterRange.selectNodeContents(wrapper);
  afterRange.setStart(range.endContainer, range.endOffset);
  const before = clean(beforeRange.toString());
  const after = clean(afterRange.toString());

  const parent = wrapper.parentNode;
  let first, last;

  const spacer = wrapper.nextSibling;
  if (spacer && spacer.nodeType === Node.TEXT_NODE && !clean(spacer.textContent)) {
    spacer.parentNode.removeChild(spacer);
  }

  if (!before && !after) {
    first = wrapper.firstChild;
    last = wrapper.lastChild;
    while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
    parent.removeChild(wrapper);
  } else {
    const middle = document.createTextNode(clean(range.toString()));
    if (before) {
      const pre = document.createElement(tagName);
      pre.textContent = before;
      parent.insertBefore(pre, wrapper);
    }
    parent.insertBefore(middle, wrapper);
    first = middle;
    last = middle;
    if (after) {
      const post = document.createElement(tagName);
      post.textContent = after;
      parent.insertBefore(post, wrapper);
    }
    parent.removeChild(wrapper);
  }

  dropEmptyInline(tagName);

  if (first && last && first.isConnected && last.isConnected) {
    const r = document.createRange();
    r.setStartBefore(first);
    r.setEndAfter(last);
    sel.removeAllRanges();
    sel.addRange(r);
    savedRange = r.cloneRange();
  }
}

/** Returns true if `node` contains a block-level element at any depth. */
function hasBlockElement(node) {
  return Array.from(node.childNodes).some(
    n => n.nodeType === Node.ELEMENT_NODE && (isBlockTag(n.tagName) || hasBlockElement(n)));
}

/** Wraps only the text runs under `node` in `tagName`, descending into blocks. */
function wrapInlineRuns(node, tagName) {
  const kids = Array.from(node.childNodes);
  let run = [];
  const flush = () => {
    if (!run.length) return;
    if (run.some(n => n.textContent.trim())) {
      const wrapper = document.createElement(tagName);
      run[0].parentNode.insertBefore(wrapper, run[0]);
      run.forEach(n => wrapper.appendChild(n));
    }
    run = [];
  };
  kids.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE && isBlockTag(child.tagName)) {
      flush();
      wrapInlineRuns(child, tagName);
    } else {
      run.push(child);
    }
  });
  flush();
}

/** Toggles an inline tag (mark, code, ...) on the current selection and re-renders. */
function toggleInlineFormat(tagName) {
  restoreSelection();
  const sel = window.getSelection();
  if (!sel.rangeCount) { toast("Select some text first"); return; }
  const range = sel.getRangeAt(0);
  if (range.collapsed) { toast("Select some text first"); return; }

  const remove = selectionAlreadyHas(range, tagName);

  if (remove) {
    const startTag = closestTag(range.startContainer, tagName);
    const endTag = closestTag(range.endContainer, tagName);
    if (startTag && startTag === endTag) {
      unwrapAround(range, startTag, tagName);
      editor.focus();
      render();
      return;
    }
  }

  const frag = range.extractContents();
  unwrapAllIn(frag, tagName);

  let first, last;
  if (remove) {
    first = frag.firstChild;
    last = frag.lastChild;
    range.insertNode(frag);
    dropEmptyInline(tagName);
  } else if (hasBlockElement(frag)) {
    wrapInlineRuns(frag, tagName);
    range.insertNode(frag);
    dropEmptyBlocks();
  } else {
    const wrapper = document.createElement(tagName);
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
    const next = wrapper.nextSibling;
    if (!(next && next.nodeType === Node.TEXT_NODE && next.textContent.startsWith("​"))) {
      wrapper.parentNode.insertBefore(document.createTextNode("​"), wrapper.nextSibling);
    }
    first = wrapper;
    last = wrapper;
  }

  if (first && last) {
    const r = document.createRange();
    r.setStartBefore(first);
    r.setEndAfter(last);
    sel.removeAllRanges();
    sel.addRange(r);
    savedRange = r.cloneRange();
  }
  editor.focus();
  render();
}

/* ===================== Modal ===================== */
/** Builds the HTML note naming the service that generates the image. */
function serviceNote(name, url) {
  return `<p class="service-note">Made with <a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>. ` +
    `Visit it for more options.</p>`;
}
/** Builds the HTML for the image preview area. */
function previewBox() {
  return `<div class="preview" id="previewBox"><span class="preview-note">Preview</span>
    <img id="previewImg" alt=""></div>`;
}
/** Wires a live image preview to the form, rebuilding the URL with `build(values)`. */
function wirePreview(m, build) {
  const img = m.querySelector("#previewImg");
  const box = m.querySelector("#previewBox");
  if (!img) return;
  const values = () => {
    const out = {};
    m.querySelectorAll("[data-field]").forEach((inp) => {
      out[inp.dataset.field] = inp.type === "checkbox" ? inp.checked : inp.value.trim();
    });
    return out;
  };
  const refresh = () => {
    let url = "";
    try { url = build(values()) || ""; } catch (e) { url = ""; }
    box.classList.toggle("empty", !url);
    if (url && url !== img.getAttribute("src")) img.setAttribute("src", url);
    if (!url) img.removeAttribute("src");
  };
  img.onerror = () => box.classList.add("failed");
  img.onload = () => box.classList.remove("failed");
  let espera = null;
  m.addEventListener("input", () => { clearTimeout(espera); espera = setTimeout(refresh, 350); });
  m.addEventListener("change", () => { clearTimeout(espera); refresh(); });
  m.addEventListener("click", (e) => { if (e.target.closest(".swatch")) setTimeout(refresh, 0); });
  refresh();
}

/** Closes the dialog on a backdrop click only if the press also started there. */
function closeOnBackdrop(close) {
  let empezoFuera = false;
  overlay.onmousedown = (e) => { empezoFuera = e.target === overlay; };
  overlay.onclick = (e) => {
    if (e.target === overlay && empezoFuera) close();
    empezoFuera = false;
  };
}

/** Shows a modal dialog and resolves with the form values, or null if cancelled. */
function modal(title, bodyHtml, okLabel, wire) {
  return new Promise((resolve) => {
    modalEl.innerHTML =
      `<h3>${escapeHtml(title)}</h3>${bodyHtml}` +
      `<div class="row"><button type="button" id="mCancel">Cancel</button>` +
      `<button type="button" id="mOk" class="primary">${okLabel || "Insert"}</button></div>`;
    overlay.classList.remove("hidden");
    if (typeof wire === "function") wire(modalEl);
    const close = (val) => { overlay.classList.add("hidden"); document.removeEventListener("keydown", onKey); resolve(val); };
    const confirm = () => {
      const falta = Array.from(modalEl.querySelectorAll("[data-required]")).find((inp) => !inp.value.trim());
      if (falta) { falta.classList.add("invalid"); falta.focus(); return; }
      const data = {};
      modalEl.querySelectorAll("[data-field]").forEach((inp) => {
        data[inp.dataset.field] = inp.type === "checkbox" ? inp.checked : inp.value.trim();
      });
      close(data);
    };
    const onKey = (e) => {
      if (e.key === "Escape") { close(null); return; }
      if (e.key === "Enter" && !e.shiftKey && !(e.target && e.target.tagName === "TEXTAREA")) {
        e.preventDefault();
        confirm();
      }
    };
    document.addEventListener("keydown", onKey);
    modalEl.querySelector("#mCancel").onclick = () => close(null);
    closeOnBackdrop(() => close(null));
    modalEl.querySelector("#mOk").onclick = confirm;
    const firstInput = modalEl.querySelector("input,textarea");
    if (firstInput) setTimeout(() => firstInput.focus(), 0);
  });
}
/** Hides the modal without resolving anything. */
function closeModalDirect() { overlay.classList.add("hidden"); }

/** Keeps editor focus and selection when toolbar or tab buttons are pressed. */
["tabs", "toolbar"].forEach((id) => {
  document.getElementById(id).addEventListener("mousedown", (e) => {
    if (e.target.closest("button")) e.preventDefault();
  });
});

/* ===================== Tabs ===================== */
document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === btn));
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === btn.dataset.tab));
});

/* ===================== Mobile view switch ===================== */
const paneEditor = document.getElementById("paneEditor");
const paneOutput = document.getElementById("paneOutput");
paneEditor.classList.add("visible");
document.getElementById("mobileSwitch").addEventListener("click", (e) => {
  const btn = e.target.closest(".switch-btn");
  if (!btn) return;
  document.querySelectorAll(".switch-btn").forEach((b) => b.classList.toggle("active", b === btn));
  paneEditor.classList.toggle("visible", btn.dataset.view === "editor");
  paneOutput.classList.toggle("visible", btn.dataset.view === "output");
});

/* ===================== Toolbar commands ===================== */

/** Returns the character offset of the caret within the editor, or null. */
function caretOffset() {
  const sel = window.getSelection();
  if (!sel.rangeCount || !editor.contains(sel.anchorNode)) return null;
  const r = sel.getRangeAt(0).cloneRange();
  const pre = document.createRange();
  pre.selectNodeContents(editor);
  pre.setEnd(r.endContainer, r.endOffset);
  return pre.toString().length;
}

/** Places the caret at the given character offset within the editor text. */
function setCaretOffset(target) {
  if (target === null) return;
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let seen = 0, node;
  while ((node = walker.nextNode())) {
    const len = node.textContent.length;
    if (seen + len >= target) {
      const r = document.createRange();
      r.setStart(node, Math.max(0, target - seen));
      r.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      savedRange = r.cloneRange();
      return;
    }
    seen += len;
  }
}

/** Command names whose action rebuilds the block, so the caret must be restored afterwards. */
const REBUILDS_BLOCK = new Set(["ul", "ol", "task", "task-done",
  "h1", "h2", "h3", "h4", "h5", "h6", "quote", "quote-out",
  "align-left", "align-center", "align-right"]);

document.getElementById("toolbar").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-cmd]");
  if (!btn) return;
  saveSelection();
  const cmd = btn.dataset.cmd;
  const collapsed = window.getSelection().isCollapsed;
  const before = REBUILDS_BLOCK.has(cmd) && collapsed ? caretOffset() : null;
  await runCommand(cmd);
  if (before !== null) setCaretOffset(before);
});

/** Runs the toolbar command `cmd` on the editor. */
async function runCommand(cmd) {
  editor.focus();
  switch (cmd) {
    case "bold": restoreSelection(); document.execCommand("bold"); render(); break;
    case "italic": restoreSelection(); document.execCommand("italic"); render(); break;
    case "strike": restoreSelection(); document.execCommand("strikeThrough"); render(); break;
    case "sub": restoreSelection(); document.execCommand("subscript"); render(); break;
    case "sup": restoreSelection(); document.execCommand("superscript"); render(); break;
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
      toggleHeading(cmd); break;
    case "emoji": await pickEmoji(); break;
    case "symbol": await pickSymbol(); break;

    case "ul": conElCursorEnSuSitio(() => document.execCommand("insertUnorderedList")); break;
    case "ol": conElCursorEnSuSitio(() => document.execCommand("insertOrderedList")); break;
    case "task": makeTaskItem(false); break;
    case "task-done": makeTaskItem(true); break;
    case "quote": quoteIn(); break;
    case "quote-out": quoteOut(); break;
    case "hr": insertBlockAtTopLevel("<hr>"); render(); break;
    case "code": toggleInlineFormat("code"); break;
    case "align-left": case "align-center": case "align-right":
    case "image-align-left": case "image-align-center": case "image-align-right":
      alignFromButton(cmd); break;
    case "toc": insertToc(); break;
    case "table": await insertTable(); break;
    case "table-center": toggleTableCenter(); break;

    case "link": await insertLink(); break;
    case "image": await insertImage(); break;
    case "gallery": await insertGallery(); break;

    case "badge": await insertBadge(); break;
    case "progress": await insertProgress(); break;
    case "skillicons": await insertSkillicons(); break;
    case "qr": await insertQr(); break;
    case "banner": await insertBanner(); break;
    case "typing": await insertTyping(); break;
    case "views": await insertViews(); break;
    case "activity": await insertActivity(); break;
    case "streak": await insertStreak(); break;
    case "details": await insertDetails(); break;
  }
}

/* ===================== Colour picking ===================== */

/** Returns the HTML of a colour palette whose swatches fill the field named by `target`. */
function paletteHtml(current, target) {
  const cur = String(current || "").replace("#", "").toLowerCase();
  return `<div class="palette" data-target="${target}">` + PALETTE.map(([name, shades]) =>
    `<div class="palette-col">` + shades.map(c =>
      `<div class="swatch${c.replace("#", "").toLowerCase() === cur ? " selected" : ""}" data-c="${c}" style="background:${c}" title="${name} ${c}"></div>`
    ).join("") + `</div>`).join("") + `</div>`;
}
/** Makes clicking a swatch write its hex (without "#") into the palette's target field. */
function wirePalettes(m) {
  m.querySelectorAll(".palette").forEach((pal) => {
    const input = m.querySelector(`[data-field="${pal.dataset.target}"]`);
    pal.querySelectorAll(".swatch").forEach(sw => sw.onclick = () => {
      pal.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
      sw.classList.add("selected");
      if (input) input.value = sw.dataset.c.replace("#", "");
    });
  });
}

/* ===================== Text tab ===================== */

/** Opens the symbol picker and inserts the chosen symbol. */
async function pickSymbol() {
  const body = SYMBOL_GROUPS.map(([name, list, wide]) =>
    `<div class="emoji-cat">${name}</div><div class="emoji-grid${wide ? " wide" : ""}">` +
    list.map(ch => `<button type="button" data-e="${escapeHtml(ch)}">${escapeHtml(ch)}</button>`).join("") +
    `</div>`).join("");
  return charPicker("Insert symbol", body);
}

/** Opens the emoji picker and inserts the chosen emoji. */
async function pickEmoji() {
  const body = EMOJI_GROUPS.map(([name, list]) =>
    `<div class="emoji-cat">${name}</div><div class="emoji-grid">` +
    list.split(" ").filter(Boolean).map(em => `<button type="button" data-e="${em}">${em}</button>`).join("") +
    `</div>`).join("");
  return charPicker("Insert emoji", body);
}

/** Shows a modal grid of characters and inserts the clicked one at the cursor. */
function charPicker(title, body) {
  modalEl.innerHTML = `<h3>${escapeHtml(title)}</h3><div class="emoji-scroll">${body}</div>` +
    `<div class="row"><button type="button" id="mCancel">Close</button></div>`;
  overlay.classList.remove("hidden");
  return new Promise((resolve) => {
    const close = () => { overlay.classList.add("hidden"); document.removeEventListener("keydown", onKey); resolve(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    modalEl.querySelector("#mCancel").onclick = close;
    closeOnBackdrop(() => close());
    modalEl.querySelectorAll("[data-e]").forEach(b => b.onclick = () => {
      insertHtmlAtSelection(escapeHtml(b.dataset.e));
      close();
    });
  });
}

/* ===================== Lists and blocks ===================== */

/** Returns the children of `parent` touched by the selection range. */
function selectedChildrenOf(parent, range) {
  const hit = Array.from(parent.childNodes).filter((n) => {
    try { return range.intersectsNode(n); } catch (e) { return false; }
  });
  return hit.length ? hit : (parent.firstChild ? [parent.firstChild] : []);
}

/** Returns the text-level node where the range starts. */
function caretNode(range) {
  let node = range.startContainer;
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    node = node.childNodes[range.startOffset] || node.lastChild || node;
    while (node && node.nodeType === Node.ELEMENT_NODE && node.firstChild) node = node.firstChild;
  }
  return node;
}

/** Restores the caret to `preferred` if still valid, else to the start of `fallbackNode`. */
function restoreCaret(preferred, fallbackNode) {
  const sel = window.getSelection();
  const usable = preferred && preferred.startContainer &&
    preferred.startContainer.isConnected && editor.contains(preferred.startContainer);
  const range = document.createRange();
  if (usable) {
    range.setStart(preferred.startContainer, preferred.startOffset);
    range.collapse(true);
  } else if (fallbackNode && fallbackNode.isConnected) {
    range.selectNodeContents(fallbackNode);
    range.collapse(true);
  } else {
    return;
  }
  sel.removeAllRanges();
  sel.addRange(range);
  savedRange = range.cloneRange();
}

/** Wraps the current block in a blockquote, or nests one more level inside a quote. */
function quoteIn() {
  restoreSelection();
  const sel = window.getSelection();
  if (!sel.rangeCount) { editor.focus(); return; }
  const range = sel.getRangeAt(0);
  const anchor = caretNode(range);
  const inside = anchor && editor.contains(anchor) ? closestTag(anchor, "blockquote") : null;

  if (!inside) {
    document.execCommand("formatBlock", false, "blockquote");
    editor.focus();
    render();
    return;
  }

  const saved = range.cloneRange();
  const targets = selectedChildrenOf(inside, range);
  if (targets.length) {
    const wrapper = document.createElement("blockquote");
    inside.insertBefore(wrapper, targets[0]);
    targets.forEach((n) => wrapper.appendChild(n));
    restoreCaret(saved, wrapper);
  }
  editor.focus();
  render();
}

/** Removes one blockquote level around the cursor. */
function quoteOut() {
  restoreSelection();
  const sel = window.getSelection();
  if (!sel.rangeCount) { toast("Put the cursor inside a quote first"); return; }
  const range = sel.getRangeAt(0);
  const anchor = caretNode(range);
  const quote = anchor && editor.contains(anchor) ? closestTag(anchor, "blockquote") : null;
  if (!quote) { toast("Put the cursor inside a quote first"); return; }

  const saved = range.cloneRange();
  const hasBlockChild = Array.from(quote.childNodes)
    .some((n) => n.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.includes(n.tagName));
  const parent = quote.parentNode;
  let landing = null;

  if (hasBlockChild) {
    landing = quote.firstChild;
    while (quote.firstChild) parent.insertBefore(quote.firstChild, quote);
  } else {
    const p = document.createElement("p");
    while (quote.firstChild) p.appendChild(quote.firstChild);
    parent.insertBefore(p, quote);
    landing = p;
  }
  parent.removeChild(quote);
  restoreCaret(saved, landing);
  editor.focus();
  render();
}

/** Returns the list items touched by the current selection. */
function selectedListItems() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return [];
  const range = sel.getRangeAt(0);
  return Array.from(editor.querySelectorAll("li")).filter((li) => {
    try { return range.intersectsNode(li); } catch (e) { return false; }
  });
}
/** Tells whether the list item belongs to a task list. */
function isTaskItem(li) {
  const ul = li.parentElement;
  return !!(ul && ul.tagName === "UL" && ul.hasAttribute("data-task"));
}
/** Marks the item as a task and sets or clears its done state. */
function setTaskState(li, done) {
  const ul = li.parentElement;
  if (ul && ul.tagName === "UL") ul.setAttribute("data-task", "1");
  if (done) li.setAttribute("data-done", "1");
  else li.removeAttribute("data-done");
}
/** Removes task lists that no longer contain items. */
function dropEmptyTaskLists() {
  editor.querySelectorAll("ul[data-task]").forEach((list) => {
    if (!list.querySelector(":scope > li")) list.remove();
  });
}

/** Turns the selected lines into task items, or toggles them off if already that state. */
function makeTaskItem(done) {
  restoreSelection();
  let items = selectedListItems();

  if (!items.length) {
    const sel = window.getSelection();
    const rango = sel.rangeCount ? sel.getRangeAt(0) : null;
    const bloques = () => Array.from(editor.children).filter((el) => !el.hasAttribute("data-spacer"));
    const pos = (nodo) => { const b = nodo ? topLevelBlockOf(nodo) : null; return b ? bloques().indexOf(b) : -1; };
    const ini = rango ? pos(rango.startContainer) : -1;
    const fin = rango ? pos(rango.endContainer) : -1;

    document.execCommand("insertUnorderedList");
    items = selectedListItems();
    if (!items.length && ini >= 0) {
      const bloque = bloques()[ini];
      const lista = bloque && (bloque.tagName === "UL" ? bloque : bloque.querySelector("ul"));
      if (lista) items = Array.from(lista.querySelectorAll(":scope > li")).slice(0, Math.max(1, fin - ini + 1));
    }
    if (!items.length) {
      const fresh = Array.from(editor.querySelectorAll("ul:not([data-task]):not([data-toc]) > li"));
      if (fresh.length === 1) items = fresh;
    }
    items.forEach((li) => setTaskState(li, done));
    editor.focus();
    render();
    if (items.length && items.every((li) => editor.contains(li))) {
      const r = document.createRange();
      r.setStart(items[0], 0);
      r.setEnd(items[items.length - 1], items[items.length - 1].childNodes.length);
      sel.removeAllRanges();
      sel.addRange(r);
    }
    return;
  }

  const allMatch = items.every((li) => isTaskItem(li) && li.hasAttribute("data-done") === !!done);
  if (allMatch) {
    items.forEach((li) => li.removeAttribute("data-done"));
    document.execCommand("insertUnorderedList");
    dropEmptyTaskLists();
  } else {
    items.forEach((li) => setTaskState(li, done));
  }
  editor.focus();
  render();
}

/* ===================== Tables ===================== */
/** Asks for a size and inserts a table at the cursor, selecting its first header cell. */
async function insertTable() {
  const data = await modal("Insert table",
    `<label>Columns (1 to 10)</label><input type="number" data-field="cols" value="3" min="1" max="10">
     <label>Rows, not counting the header (1 to 30)</label><input type="number" data-field="rows" value="3" min="1" max="30">
     <p class="hint" style="margin-top:12px">The first row is the header. Tab in the last cell adds another row.</p>`);
  if (!data) return;
  const cols = Math.max(1, Math.min(10, parseInt(data.cols, 10) || 3));
  const rows = Math.max(1, Math.min(30, parseInt(data.rows, 10) || 3));

  const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Column ${i + 1}</th>`).join("")}</tr>`;
  const body = Array.from({ length: rows },
    () => `<tr>${"<td><br></td>".repeat(cols)}</tr>`).join("");
  insertBlockAtTopLevel(`<table><thead>${head}</thead><tbody>${body}</tbody></table><p><br></p>`);

  const table = Array.from(editor.querySelectorAll("table")).pop();
  if (table) selectCellContents(table.querySelector("th"));
}

/** Selects the contents of a table cell and focuses the editor. */
function selectCellContents(cell) {
  if (!cell) return;
  const range = document.createRange();
  range.selectNodeContents(cell);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  savedRange = range.cloneRange();
  editor.focus();
}

/** Appends an empty row to the table and returns it. */
function addTableRow(table) {
  const body = table.querySelector("tbody") || table;
  const width = table.querySelectorAll("thead th, thead td").length ||
    (body.querySelector("tr") ? body.querySelector("tr").children.length : 1);
  const tr = document.createElement("tr");
  tr.innerHTML = "<td><br></td>".repeat(width);
  body.appendChild(tr);
  return tr;
}

/** Creates an empty list of the same type (and task flag) as the given list. */
function nuevaSublista(comoEsta) {
  const sub = document.createElement(comoEsta.tagName.toLowerCase());
  if (comoEsta.hasAttribute("data-task")) sub.setAttribute("data-task", "1");
  return sub;
}
/** Returns the sibling elements that come after a list item. */
function hermanosDetras(li) {
  const resto = [];
  for (let n = li.nextElementSibling; n; n = n.nextElementSibling) resto.push(n);
  return resto;
}

/** Nests a list item under its previous sibling. Returns false if it cannot be nested. */
function indentListItem(li) {
  const previo = li.previousElementSibling;
  if (!previo || previo.tagName !== "LI") return false;
  const lista = li.parentElement;
  let sub = previo.querySelector(":scope > ul, :scope > ol");
  if (!sub) {
    sub = nuevaSublista(lista);
    previo.appendChild(sub);
  }
  sub.appendChild(li);
  return true;
}

/** Moves a list item up one level, or out of the list as a paragraph if already top level. */
function outdentListItem(li) {
  const lista = li.parentElement;
  const contenedor = lista.parentElement;

  if (contenedor && contenedor.tagName === "LI") {
    const detras = hermanosDetras(li);
    contenedor.parentElement.insertBefore(li, contenedor.nextSibling);
    if (detras.length) {
      let sub = li.querySelector(":scope > ul, :scope > ol");
      if (!sub) { sub = nuevaSublista(lista); li.appendChild(sub); }
      detras.forEach(x => sub.appendChild(x));
    }
    if (!lista.querySelector(":scope > li")) lista.remove();
    return true;
  }

  const p = document.createElement("p");
  while (li.firstChild && !(li.firstChild.nodeType === 1 &&
        (li.firstChild.tagName === "UL" || li.firstChild.tagName === "OL"))) {
    p.appendChild(li.firstChild);
  }
  if (!p.childNodes.length) p.appendChild(document.createElement("br"));

  const suSublista = li.querySelector(":scope > ul, :scope > ol");
  const detras = hermanosDetras(li);
  lista.parentElement.insertBefore(p, lista.nextSibling);
  let ancla = p;
  if (suSublista) { ancla.parentElement.insertBefore(suSublista, ancla.nextSibling); ancla = suSublista; }
  if (detras.length) {
    const resto = nuevaSublista(lista);
    detras.forEach(x => resto.appendChild(x));
    ancla.parentElement.insertBefore(resto, ancla.nextSibling);
  }
  li.remove();
  if (!lista.querySelector(":scope > li")) lista.remove();
  return true;
}

/** Tab moves between table cells and indents or outdents list items. */
editor.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const node = sel.getRangeAt(0).startContainer;

  const cell = closestTag(node, "td") || closestTag(node, "th");
  if (cell) {
    const table = closestTag(cell, "table");
    if (!table) return;
    e.preventDefault();
    const cells = Array.from(table.querySelectorAll("th, td"));
    const i = cells.indexOf(cell);
    let target;
    if (e.shiftKey) {
      target = cells[i - 1];
    } else if (i === cells.length - 1) {
      target = addTableRow(table).firstElementChild;
    } else {
      target = cells[i + 1];
    }
    if (target) {
      selectCellContents(target);
      render();
    }
    return;
  }

  const li = closestTag(node, "li");
  if (!li) return;
  e.preventDefault();

  const r = sel.getRangeAt(0);
  const ini = { nodo: r.startContainer, pos: r.startOffset };
  const fin = { nodo: r.endContainer, pos: r.endOffset };

  const afectados = r.collapsed ? [li] : puntosSeleccionados(r);
  if (!afectados.length) afectados.push(li);
  let algunoMovido = false;
  afectados.forEach((punto) => {
    if (!editor.contains(punto)) return;
    const movido = e.shiftKey ? outdentListItem(punto) : indentListItem(punto);
    algunoMovido = algunoMovido || movido;
  });
  if (!algunoMovido) return;

  if (editor.contains(ini.nodo) && editor.contains(fin.nodo)) {
    const vuelta = document.createRange();
    const tope = (x) => x.nodo.nodeType === 3 ? x.nodo.textContent.length : x.nodo.childNodes.length;
    vuelta.setStart(ini.nodo, Math.min(ini.pos, tope(ini)));
    vuelta.setEnd(fin.nodo, Math.min(fin.pos, tope(fin)));
    sel.removeAllRanges();
    sel.addRange(vuelta);
  }
  editor.focus();
  render();
});

/** Returns the list items whose own text intersects the given range, in order. */
function puntosSeleccionados(rango) {
  return Array.from(editor.querySelectorAll("li")).filter((li) => {
    try {
      return Array.from(li.childNodes).some((n) =>
        !(n.nodeType === 1 && (n.tagName === "UL" || n.tagName === "OL")) && rango.intersectsNode(n));
    } catch (err) { return false; }
  });
}

/** Inserts a table of contents built from the headings in the editor. */
function insertToc() {
  const heads = editor.querySelectorAll("h1, h2, h3, h4, h5, h6");
  if (!heads.length) { toast("Add some headings first"); return; }
  const used = new Set();
  const items = Array.from(heads).map(h => {
    let slug = h.textContent.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    let unique = slug; let n = 1;
    while (used.has(unique)) unique = slug + "-" + (n++);
    used.add(unique);
    return `<li><a href="#${unique}">${escapeHtml(h.textContent.trim())}</a></li>`;
  }).join("");
  insertBlockAtTopLevel(`<ul data-toc="1">${items}</ul><p><br></p>`);
}

/* ===================== Links and media ===================== */
/** Adds https:// or mailto: to bare addresses and leaves anchors and relative paths alone. */
function normalizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  if (url.startsWith("#") || url.startsWith("/") ||
      url.startsWith("./") || url.startsWith("../")) return url;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return "mailto:" + url;
  if (/^[^\s/]+\.[^\s/]{2,}/.test(url)) return "https://" + url;
  return url;
}

/** Toggles a link: removes the link at the cursor, or asks for a URL and inserts one. */
async function insertLink() {
  restoreSelection();
  const sel = window.getSelection();
  const here = sel.rangeCount ? caretNode(sel.getRangeAt(0)) : null;
  const existing = here && editor.contains(here) ? closestTag(here, "a") : null;
  if (existing) {
    const range = document.createRange();
    range.selectNodeContents(existing);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("unlink");
    dropEmptyInline("a");
    savedRange = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    editor.focus();
    render();
    toast("Link removed");
    return;
  }

  const picked = sel.rangeCount ? sel.getRangeAt(0).toString().replace(/​/g, "").trim() : "";
  const data = await modal("Insert link",
    `<label>URL</label><input type="text" data-field="url" placeholder="https://example.com">
     <label>Text (optional). Without it the address itself is shown</label>
     <input type="text" data-field="text" value="${escapeHtml(picked)}" placeholder="Link text">`);
  if (!data || !data.url) return;
  const url = normalizeUrl(data.url);
  const text = data.text || url;
  insertHtmlAtSelection(`<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`);
}

/** Asks for an image URL and alt text and inserts the image. */
async function insertImage() {
  const data = await modal("Insert image",
    `<label>Image URL</label><input type="text" data-field="url" placeholder="https://example.com/image.png">
     <label>Alt text (optional): what the image shows, for anyone who can't see it</label><input type="text" data-field="alt" placeholder="e.g. Dashboard screenshot">`);
  if (!data || !data.url) return;
  insertHtmlAtSelection(`<img src="${escapeHtml(normalizeUrl(data.url))}" alt="${escapeHtml(data.alt || "")}">`);
}

/** Applies a text or image alignment command based on the button's command name. */
function alignFromButton(cmd) {
  const dir = cmd.replace(/^image-/, "").replace("align-", "");
  if (cmd.startsWith("image-")) alignImage(dir);
  else align({ left: "justifyLeft", center: "justifyCenter", right: "justifyRight" }[dir]);
}

/** Returns the images to align: those in the selection, else the last clicked one. */
function imagenesObjetivo() {
  restoreSelection();
  const sel = window.getSelection();
  if (sel.rangeCount && !sel.isCollapsed) {
    const r = sel.getRangeAt(0);
    const dentro = Array.from(editor.querySelectorAll("img")).filter((img) => {
      try { return r.intersectsNode(img); } catch (e) { return false; }
    });
    if (dentro.length) return dentro;
  }
  return lastClickedImage && editor.contains(lastClickedImage) ? [lastClickedImage] : [];
}

/** Aligns the target images by wrapping them in a div with an align attribute. */
function alignImage(align) {
  const imgs = imagenesObjetivo();
  if (!imgs.length) { toast("Select an image first"); return; }
  imgs.forEach((img) => {
    const parent = img.parentElement;
    if (parent && parent.tagName === "DIV" && parent.hasAttribute("align")) {
      if (align === "left") parent.replaceWith(img);
      else parent.setAttribute("align", align);
      return;
    }
    if (align === "left") return;
    const div = document.createElement("div");
    div.setAttribute("align", align);
    img.replaceWith(div);
    div.appendChild(img);
  });
  render();
}

/** Asks for several image URLs and inserts them side by side in one row. */
async function insertGallery() {
  const rowHtml = (n) =>
    `<label>Image ${n}</label><input type="text" data-field="url${n}" placeholder="https://example.com/image.png">`;
  const START_ROWS = 3;

  const data = await modal("Image gallery",
    `<p class="hint">They go side by side in one row. Leave the ones you don't need empty.</p>
     <div id="galleryRows" class="gallery-rows">${[1, 2, 3].map(rowHtml).join("")}</div>
     <button type="button" id="addImageRow" class="add-row">+ Add another image</button>
     <label>Alt text (optional): what the images show, for anyone who can't see them</label>
     <input type="text" data-field="alt" placeholder="e.g. Dashboard screenshot">`,
    "Insert",
    (m) => {
      let rows = START_ROWS;
      m.querySelector("#addImageRow").onclick = () => {
        rows += 1;
        const list = m.querySelector("#galleryRows");
        list.insertAdjacentHTML("beforeend", rowHtml(rows));
        const inputs = list.querySelectorAll("input");
        const last = inputs[inputs.length - 1];
        list.scrollTop = list.scrollHeight;
        last.focus();
      };
    });
  if (!data) return;

  const urls = Object.keys(data)
    .filter((k) => /^url\d+$/.test(k))
    .sort((a, b) => parseInt(a.slice(3), 10) - parseInt(b.slice(3), 10))
    .map((k) => data[k].trim())
    .filter(Boolean);
  if (!urls.length) return;
  const width = urls.length > 1 ? Math.max(10, Math.floor(94 / urls.length)) : null;
  const alt = escapeHtml(data.alt || "");
  const imgs = urls.map(u =>
    `<img src="${escapeHtml(normalizeUrl(u))}" alt="${alt}"${width ? ` width="${width}%"` : ""}>`).join(" ");
  insertBlockAtTopLevel(`<div align="center" data-gallery="1">${imgs}</div><p><br></p>`);
}

/* ===================== GitHub tab ===================== */
/** Returns the HTML for the GitHub username field, prefilled with the last one used. */
function userFieldHtml() {
  return `<label>GitHub username</label>
     <input type="text" data-field="user" data-required placeholder="e.g. octocat" value="${escapeHtml(ghUsername)}">
     <p class="hint">Your username is not saved.</p>`;
}
/** Extracts the username from dialog data, without a leading @. */
const cleanUser = (v) => String((v && v.user) || "").replace(/^@/, "").trim();
/** Remembers the typed username and returns it, or warns and returns an empty string. */
function takeUser(data) {
  const user = cleanUser(data);
  if (!user) { toast("Type your GitHub username first"); return ""; }
  ghUsername = user;
  return user;
}

/** Escapes text for a shields.io badge path segment. */
function shieldsText(value) {
  return encodeURIComponent(String(value || "").replace(/-/g, "--").replace(/_/g, "__"));
}
/** Returns a color as bare hex without "#", or the fallback when empty. */
const hex = (v, fallback) => (String(v || fallback).replace("#", "").trim() || fallback);

/** Builds the shields.io badge image URL from the modal values. */
function badgeUrl(v) {
  if (!v.label) return "";
  const style = v.style || "for-the-badge";
  const path = v.message
    ? `${shieldsText(v.label)}-${shieldsText(v.message)}-${hex(v.color, "1d4ed8")}`
    : `${shieldsText(v.label)}-${hex(v.labelColor, "24292f")}`;
  let url = `https://img.shields.io/badge/${path}?style=${encodeURIComponent(style)}`;
  if (v.message) url += `&labelColor=${hex(v.labelColor, "24292f")}`;
  if (v.logo) {
    url += `&logo=${encodeURIComponent(v.logo.trim().toLowerCase())}`;
    url += `&logoColor=${hex(v.logoColor, "ffffff")}`;
  }
  return url;
}

/** Suggested Simple Icons names for the badge logo field. */
const BADGE_LOGOS = ["react", "vuedotjs", "angular", "svelte", "nextdotjs", "nodedotjs",
  "javascript", "typescript", "python", "java", "kotlin", "swift", "go", "rust", "php",
  "c", "cplusplus", "csharp", "dotnet", "html5", "css3", "sass", "tailwindcss", "bootstrap",
  "django", "flask", "fastapi", "laravel", "spring", "express", "nestjs", "graphql",
  "mysql", "postgresql", "mongodb", "redis", "sqlite", "firebase", "supabase", "prisma",
  "docker", "kubernetes", "git", "github", "gitlab", "linux", "ubuntu", "debian", "apple",
  "android", "amazonaws", "googlecloud", "vercel", "netlify", "heroku", "cloudflare",
  "figma", "blender", "unity", "godotengine", "adobephotoshop", "adobeillustrator",
  "npm", "yarn", "pnpm", "vite", "webpack", "babel", "eslint", "prettier", "jest",
  "postman", "insomnia", "jira", "trello", "notion", "obsidian", "slack", "discord",
  "telegram", "whatsapp", "gmail", "linkedin", "instagram", "youtube", "twitch", "x",
  "medium", "devdotto", "stackoverflow", "googlechrome", "firefox", "bravebrowser"];

/** Returns HTML for color tabs sharing one palette; fields are [field, name, hex] triples. */
function colorTabs(campos) {
  const tabs = campos.map(([campo, nombre, color], i) =>
    `<button type="button" class="ctab${i ? "" : " active"}" data-target="${campo}">` +
    `<span class="ctab-dot" style="background:#${color}"></span>${nombre}</button>`).join("");
  const inputs = campos.map(([campo, , color]) =>
    `<input type="text" data-field="${campo}" value="${color}" class="ctab-value" data-for="${campo}">`).join("");
  return `<div class="ctabs">${tabs}</div>` +
         paletteHtml("#" + campos[0][2], "__color") +
         `<div class="ctab-values">${inputs}</div>`;
}

/** Connects the color tabs, shared palette and hex inputs inside modal m. */
function wireColorTabs(m) {
  const wrap = m.querySelector(".ctabs");
  if (!wrap) return;
  const pal = m.querySelector('.palette[data-target="__color"]');
  const activo = () => wrap.querySelector(".ctab.active").dataset.target;
  const campoDe = (t) => m.querySelector(`[data-field="${t}"]`);

  const pintar = () => {
    const val = (campoDe(activo()).value || "").toLowerCase();
    pal.querySelectorAll(".swatch").forEach(sw =>
      sw.classList.toggle("selected", sw.dataset.c.replace("#", "").toLowerCase() === val));
    m.querySelectorAll(".ctab-value").forEach(inp =>
      inp.classList.toggle("visible", inp.dataset.for === activo()));
  };

  wrap.querySelectorAll(".ctab").forEach(t => t.onclick = () => {
    wrap.querySelectorAll(".ctab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    pintar();
  });

  pal.querySelectorAll(".swatch").forEach(sw => sw.onclick = () => {
    const campo = campoDe(activo());
    campo.value = sw.dataset.c.replace("#", "");
    wrap.querySelector(".ctab.active .ctab-dot").style.background = sw.dataset.c;
    pintar();
    campo.dispatchEvent(new Event("input", { bubbles: true }));
  });

  m.querySelectorAll(".ctab-value").forEach(inp => inp.addEventListener("input", () => {
    const dot = wrap.querySelector(`.ctab[data-target="${inp.dataset.for}"] .ctab-dot`);
    if (dot) dot.style.background = "#" + inp.value.replace("#", "");
  }));
  pintar();
}

/** Opens the badge modal and inserts the badge image, optionally wrapped in a link. */
async function insertBadge() {
  const data = await modal("Badge",
    `${serviceNote("shields.io", "https://shields.io/")}${previewBox()}<label>Label. Leave the message empty for a single, plain badge</label>
     <input type="text" data-field="label" placeholder="e.g. Focus">
     <label>Message (optional)</label>
     <input type="text" data-field="message" placeholder="e.g. Web Development">
     <label>Size and style</label>
     ${labelledSelect("style", [
       ["for-the-badge", "Big (for-the-badge)"],
       ["flat-square", "Small, square corners (flat-square)"],
       ["flat", "Small, rounded (flat)"],
       ["plastic", "Small, glossy (plastic)"],
       ["social", "Social"],
     ], "for-the-badge")}
     <label>Logo (optional): any name from simpleicons.org</label>
     <input type="text" data-field="logo" list="badgeLogos" placeholder="e.g. react, medium, docker">
     <datalist id="badgeLogos">${BADGE_LOGOS.map(l => `<option value="${l}">`).join("")}</datalist>
     <label>Colors</label>
     ${colorTabs([["labelColor", "Label", "24292f"], ["color", "Message", "1d4ed8"], ["logoColor", "Logo", "ffffff"]])}
     <label class="check"><input type="checkbox" data-field="asLink"> Make it clickable</label>
     <div class="only-if-link"><label>Link (where the badge goes)</label>
     <input type="text" data-field="href" placeholder="https://shields.io/"></div>`,
    "Insert",
    (m) => {
      wireColorTabs(m);
      wirePreview(m, badgeUrl);
      const msg = m.querySelector('[data-field="message"]');
      const tabMsg = m.querySelector('.ctab[data-target="color"]');
      const apagar = () => { if (tabMsg) tabMsg.classList.toggle("unused", !msg.value.trim()); };
      msg.addEventListener("input", apagar);
      apagar();
      const check = m.querySelector('[data-field="asLink"]');
      const caja = m.querySelector(".only-if-link");
      const refrescar = () => caja.classList.toggle("visible", check.checked);
      check.onchange = refrescar;
      refrescar();
    });
  if (!data || !data.label) return;
  const url = badgeUrl(data);
  if (!url) return;
  let html = `<img src="${url}" alt="${escapeHtml(data.label)}">`;
  if (data.asLink && data.href) html = `<a href="${escapeHtml(normalizeUrl(data.href))}">${html}</a>`;
  insertHtmlAtSelection(html + " ");
}

/** Builds the progress bar image URL, clamping the percent to 0-100. */
function progressUrl(v) {
  const pct = Math.max(0, Math.min(100, parseInt(v.percent, 10) || 0));
  let url = `https://geps.dev/progress/${pct}?barColor=${hex(v.color, "1d4ed8")}`;
  if (v.label) url += `&label=${encodeURIComponent(v.label)}`;
  return url;
}
/** Opens the progress bar modal and inserts the resulting image. */
async function insertProgress() {
  const data = await modal("Progress bar",
    `${serviceNote("geps.dev", "https://github.com/gepser/markdown-progress")}${previewBox()}<label>Percent (0-100)</label><input type="number" data-field="percent" value="60" min="0" max="100">
     <label>Label (optional)</label><input type="text" data-field="label" placeholder="e.g. HTML">
     <label>Bar color</label>${paletteHtml("#1d4ed8", "color")}
     <input type="text" data-field="color" value="1d4ed8" style="margin-top:8px">`,
    "Insert",
    (m) => { wirePalettes(m); wirePreview(m, progressUrl); });
  if (!data) return;
  const pct = Math.max(0, Math.min(100, parseInt(data.percent, 10) || 0));
  insertHtmlAtSelection(`<img src="${progressUrl(data)}" alt="${escapeHtml(data.label || "Progress")} ${pct}%"> `);
}

/** Builds the skillicons.dev URL from a comma-separated list of icon names. */
function skilliconsUrl(v) {
  const list = String(v.icons || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean).join(",");
  if (!list) return "";
  let url = `https://skillicons.dev/icons?i=${encodeURIComponent(list)}`;
  if (v.theme) url += `&theme=${encodeURIComponent(v.theme)}`;
  return url;
}
/** Opens the tech icons modal and inserts the icons image. */
async function insertSkillicons() {
  const data = await modal("Tech icons",
    `${serviceNote("skillicons.dev", "https://skillicons.dev/")}${previewBox()}<label>Technologies, separated by commas</label>
     <input type="text" data-field="icons" placeholder="e.g. js,react,python,docker">
     <label>Theme</label>${themeSelect("theme", ["dark", "light"], "dark")}`,
    "Insert", (m) => wirePreview(m, skilliconsUrl));
  if (!data || !data.icons) return;
  const url = skilliconsUrl(data);
  if (url) insertHtmlAtSelection(`<img src="${url}" alt="Tech icons"> `);
}

/** Builds the QR code image URL, with the size limited to 80-400 pixels. */
function qrUrl(v) {
  if (!v.text) return "";
  const size = Math.max(80, Math.min(400, parseInt(v.size, 10) || 160));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(v.text)}`;
}
/** Opens the QR code modal and inserts the resulting image. */
async function insertQr() {
  const data = await modal("QR code",
    `${serviceNote("QRServer", "https://goqr.me/api/")}${previewBox()}<label>Text or URL</label><input type="text" data-field="text" placeholder="https://example.com">
     <label>Size in pixels</label><input type="number" data-field="size" value="160" min="80" max="400" step="20">`,
    "Insert", (m) => wirePreview(m, qrUrl));
  if (!data || !data.text) return;
  insertHtmlAtSelection(`<img src="${qrUrl(data)}" alt="QR code"> `);
}

/** Banner shapes offered by Capsule Render. */
const BANNER_TYPES = ["waving", "rect", "rounded", "soft", "slice", "cylinder", "egg", "shark", "blur"];
/** Builds the Capsule Render banner URL with a two-color gradient. */
function bannerUrl(v) {
  if (!v.title) return "";
  return `https://capsule-render.vercel.app/api?type=${encodeURIComponent(v.type || "waving")}` +
    `&color=0:${hex(v.c1, "0f172a")},100:${hex(v.c2, "38bdf8")}` +
    `&height=220&section=header&text=${encodeURIComponent(v.title)}` +
    `&fontSize=40&fontColor=ffffff&desc=${encodeURIComponent(v.subtitle || "")}&descSize=16`;
}
/** Opens the banner modal and inserts a centered banner block. */
async function insertBanner() {
  const data = await modal("Banner",
    `${serviceNote("Capsule Render", "https://github.com/kyechan99/capsule-render")}${previewBox()}<label>Title</label><input type="text" data-field="title" placeholder="e.g. Hello World">
     <label>Subtitle (optional)</label><input type="text" data-field="subtitle" placeholder="e.g. Purpose · Discipline · Code">
     <label>Shape</label>${themeSelect("type", BANNER_TYPES, "waving")}
     <label>Gradient start</label>${paletteHtml("#1f2937", "c1")}
     <input type="text" data-field="c1" value="0f172a" style="margin-top:8px">
     <label>Gradient end</label>${paletteHtml("#38bdf8", "c2")}
     <input type="text" data-field="c2" value="38bdf8" style="margin-top:8px">`,
    "Insert",
    (m) => { wirePalettes(m); wirePreview(m, bannerUrl); });
  if (!data) return;
  if (!data.title) data.title = TEXTO_POR_DEFECTO;
  insertBlockAtTopLevel(
    `<div align="center" data-banner="1"><img src="${bannerUrl(data)}" alt="${escapeHtml(data.title)}"></div><p><br></p>`);
}

/** Builds the typing animation SVG URL, joining the lines with semicolons. */
function typingUrl(v) {
  const lines = String(v.lines || "").split("\n").map(s => s.trim()).filter(Boolean).join(";");
  if (!lines) return "";
  return `https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&size=22&pause=1000` +
    `&color=${hex(v.color, "38bdf8")}&center=true&vCenter=true&width=600&lines=${encodeURIComponent(lines)}`;
}
/** Opens the typing animation modal and inserts the resulting image. */
async function insertTyping() {
  const data = await modal("Typing animation",
    `${serviceNote("Readme Typing SVG", "https://github.com/DenverCoder1/readme-typing-svg")}${previewBox()}<label>Text. One line is enough; several lines take turns, one at a time</label>
     <textarea data-field="lines" rows="3" placeholder="e.g. Hello World"></textarea>
     <label>Color</label>${paletteHtml("#38bdf8", "color")}
     <input type="text" data-field="color" value="38bdf8" style="margin-top:8px">`,
    "Insert",
    (m) => { wirePalettes(m); wirePreview(m, typingUrl); });
  if (!data) return;
  if (!data.lines) data.lines = TEXTO_POR_DEFECTO;
  insertHtmlAtSelection(`<img src="${typingUrl(data)}" alt="Typing animation"> `);
}

/** Builds the visitor-badge URL for a profile views counter. */
function viewsUrl(user, v) {
  const id = `${user}.${user}`;
  let url = `https://visitor-badge.laobi.icu/badge?page_id=${encodeURIComponent(id)}` +
    `&left_text=${encodeURIComponent(v.label || "Profile views")}` +
    `&left_color=${hex(v.labelColor, "24292f")}` +
    `&right_color=${hex(v.color, "1d4ed8")}`;
  if (v.rounded) url += `&radius=6`;
  return url;
}
/** Returns a locally drawn SVG data URI that previews the views counter. */
function viewsPreviewUrl(v) {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const etiqueta = v.label || "Profile views";
  const numero = "1,234";
  const ancho = (t) => Math.round(t.length * 6.6) + 14;
  const w1 = ancho(etiqueta), w2 = ancho(numero), h = 20;
  const rx = v.rounded ? 6 : 3;
  const c1 = "#" + hex(v.labelColor, "24292f"), c2 = "#" + hex(v.color, "1d4ed8");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w1 + w2}" height="${h}">` +
    `<clipPath id="r"><rect width="${w1 + w2}" height="${h}" rx="${rx}"/></clipPath>` +
    `<g clip-path="url(#r)"><rect width="${w1}" height="${h}" fill="${c1}"/><rect x="${w1}" width="${w2}" height="${h}" fill="${c2}"/></g>` +
    `<g fill="#fff" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">` +
    `<text x="${w1 / 2}" y="14">${esc(etiqueta)}</text><text x="${w1 + w2 / 2}" y="14">${numero}</text></g></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
/** Opens the profile views modal and inserts the counter image. */
async function insertViews() {
  const data = await modal("Profile views counter",
    `${serviceNote("visitor-badge.laobi.icu", "https://visitor-badge.laobi.icu/")}${userFieldHtml()}${previewBox()}<label>Label</label><input type="text" data-field="label" value="Profile views">
     <label>Colors</label>
     ${colorTabs([["labelColor", "Label", "24292f"], ["color", "Counter", "1d4ed8"]])}
     <label class="check"><input type="checkbox" data-field="rounded" checked> Rounded corners</label>`,
    "Insert",
    (m) => { wireColorTabs(m); wirePreview(m, viewsPreviewUrl); });
  if (!data) return;
  const user = takeUser(data);
  if (!user) return;
  insertHtmlAtSelection(`<img src="${viewsUrl(user, data)}" alt="Profile views"> `);
}

/** Returns a select element whose options are [value, label] pairs. */
function labelledSelect(field, pairs, preselected) {
  return `<select data-field="${field}">` + pairs.map(([value, name]) =>
    `<option value="${value}"${value === preselected ? " selected" : ""}>${name}</option>`).join("") + `</select>`;
}
/** Returns a select element whose options are plain theme names. */
function themeSelect(field, themes, preselected) {
  return `<select data-field="${field}">` + themes.map(t =>
    `<option value="${t}"${t === preselected ? " selected" : ""}>${t}</option>`).join("") + `</select>`;
}
/** Theme names accepted by the streak stats service. */
const STREAK_THEMES = ["tokyonight", "dark", "default", "highcontrast", "radical", "merko",
  "gruvbox", "onedark", "cobalt", "synthwave", "dracula", "prussian", "monokai", "vue",
  "nightowl", "buefy", "blue-green", "algolia", "great-gatsby", "darcula", "bear",
  "solarized-dark", "solarized-light", "chartreuse-dark", "nord", "gotham",
  "material-palenight", "github-dark", "discord", "aura", "panda", "monokai-metallian"];

/** GitHub summary card kinds as [id, label] pairs. */
const CARD_TYPES = [
  ["profile-details", "Profile summary"],
  ["stats", "Contribution stats"],
  ["repos-per-language", "Languages by repo"],
  ["most-commit-language", "Languages by commits"],
  ["productive-time", "Productive hours"],
];
/** Theme names accepted by the summary cards service. */
const CARD_THEMES = ["github_dark", "github", "default", "dracula", "tokyonight", "nord_dark",
  "nord_bright", "radical", "monokai", "gotham", "gruvbox", "aura", "buefy", "solarized",
  "solarized_dark", "vue", "zenburn", "2077", "transparent"];

/** Builds the summary card image URL for a GitHub user. */
function cardUrl(user, v) {
  const type = v.type || "profile-details";
  return `https://github-profile-summary-cards.vercel.app/api/cards/${encodeURIComponent(type)}` +
    `?username=${encodeURIComponent(user)}&theme=${encodeURIComponent(v.theme || "github_dark")}`;
}
/** Opens the activity card modal and inserts a centered summary card. */
async function insertActivity() {
  const data = await modal("GitHub activity card",
    `${serviceNote("GitHub Profile Summary Cards", "https://github.com/vn7n24fzkq/github-profile-summary-cards")}${userFieldHtml()}${previewBox()}<label>Card</label><select data-field="type">${CARD_TYPES.map(([id, name], i) =>
        `<option value="${id}"${i === 0 ? " selected" : ""}>${name}</option>`).join("")}</select>
     <label>Theme</label>${themeSelect("theme", CARD_THEMES, "github_dark")}`,
    "Insert",
    (m) => wirePreview(m, (v) => cleanUser(v) ? cardUrl(cleanUser(v), v) : ""));
  if (!data) return;
  const user = takeUser(data);
  if (!user) return;
  insertBlockAtTopLevel(
    `<div align="center"><img src="${cardUrl(user, data)}" alt="GitHub activity"></div><p><br></p>`);
}

/** Builds the commit streak image URL for a GitHub user. */
function streakUrl(user, v) {
  return `https://streak-stats.demolab.com?user=${encodeURIComponent(user)}` +
    `&theme=${encodeURIComponent(v.theme || "tokyonight")}&hide_border=${v.border ? "false" : "true"}`;
}
/** Opens the commit streak modal and inserts the resulting image. */
async function insertStreak() {
  const data = await modal("Commit streak",
    `${serviceNote("GitHub Readme Streak Stats", "https://github.com/DenverCoder1/github-readme-streak-stats")}${userFieldHtml()}${previewBox()}<label>Theme</label>${themeSelect("theme", STREAK_THEMES, "tokyonight")}
     <label><input type="checkbox" data-field="border"> Show border</label>`,
    "Insert",
    (m) => wirePreview(m, (v) => cleanUser(v) ? streakUrl(cleanUser(v), v) : ""));
  if (!data) return;
  const user = takeUser(data);
  if (!user) return;
  insertHtmlAtSelection(`<img src="${streakUrl(user, data)}" alt="Commit streak"> `);
}

/** Opens the modal and inserts a collapsible details block with a title and content. */
async function insertDetails() {
  const data = await modal("Collapsible section",
    `<label>Title</label><input type="text" data-field="title" placeholder="e.g. Click to expand">
     <label>Content</label>
     <textarea data-field="content" rows="4" placeholder="Hidden content…" style="width:100%;background:var(--bg-3);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:8px"></textarea>`);
  if (!data || !data.title) return;
  const content = escapeHtml(data.content || "").replace(/\n/g, "<br>");
  insertBlockAtTopLevel(`<details><summary>${escapeHtml(data.title)}</summary><p>${content}</p></details><p><br></p>`);
}

/* ===================== Image click tracking & paste guard ===================== */
editor.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") lastClickedImage = e.target;

  const enlace = e.target.closest && e.target.closest("a[href]");
  if (enlace && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    window.open(enlace.getAttribute("href"), "_blank", "noopener");
  }
});
editor.addEventListener("paste", (e) => {
  const data = e.clipboardData || window.clipboardData;
  const files = data && data.files;
  if (files && files.length && files[0].type.startsWith("image/")) {
    e.preventDefault();
    toast("Only image links are supported. Paste the image URL instead.");
    return;
  }
  if (!data) return;
  e.preventDefault();
  const text = data.getData("text/plain");
  if (!text) return;

  if (looksLikeMarkdown(text)) {
    offerMarkdownConversion(text);
    return;
  }
  document.execCommand("insertText", false, text);
  render();
});

/** Returns true when the text has a block-level Markdown marker or two inline ones. */
function looksLikeMarkdown(text) {
  const bloque = [
    /^#{1,6}\s+\S/m,
    /^\s*[-*+]\s+\S/m,
    /^\s*\d+[.)]\s+\S/m,
    /^\s*>\s*\S/m,
    /^\s*(```|~~~)/m,
    /^\s*\|.*\|\s*$/m,
    /^\s*(-{3,}|\*{3,}|_{3,})\s*$/m,
  ];
  const enLinea = [
    /\*\*[^*\n]+\*\*/,
    /~~[^~\n]+~~/,
    /`[^`\n]+`/,
    /\[[^\]\n]+\]\([^)\s]+\)/,
    /!\[[^\]\n]*\]\([^)\s]+\)/,
  ];
  const conBloque = bloque.some(r => r.test(text));
  const cuantosEnLinea = enLinea.filter(r => r.test(text)).length;
  return conBloque || cuantosEnLinea >= 2;
}

/** Offers to convert pasted Markdown into formatting or paste it as plain text. */
async function offerMarkdownConversion(text) {
  const elegido = await twoWayModal("This looks like Markdown",
    `<p class="hint">It can be turned into real formatting, the same as importing it, or pasted exactly as written.</p>`,
    "Paste as plain text", "Convert to formatting");
  if (elegido === null) return;
  if (!elegido) {
    restoreSelection();
    editor.focus();
    document.execCommand("insertText", false, text);
    render();
    return;
  }
  const html = sanitizeImported(markdownToHtml(text));
  if (!plainTextOf(editor).trim()) {
    editor.innerHTML = html;
    editor.focus();
    render();
  } else {
    insertBlockAtTopLevel(html);
  }
  toast("Markdown converted");
}

/** Shows a two-button modal and resolves true (primary), false (secondary) or null (closed). */
function twoWayModal(title, bodyHtml, secondaryLabel, primaryLabel) {
  return new Promise((resolve) => {
    modalEl.innerHTML =
      `<h3>${escapeHtml(title)}</h3>${bodyHtml}` +
      `<div class="row"><button type="button" id="mSecond">${escapeHtml(secondaryLabel)}</button>` +
      `<button type="button" id="mFirst" class="primary">${escapeHtml(primaryLabel)}</button></div>`;
    overlay.classList.remove("hidden");
    const close = (val) => { overlay.classList.add("hidden"); document.removeEventListener("keydown", onKey); resolve(val); };
    const onKey = (e) => {
      if (e.key === "Escape") close(null);
      if (e.key === "Enter") { e.preventDefault(); close(true); }
    };
    document.addEventListener("keydown", onKey);
    modalEl.querySelector("#mSecond").onclick = () => close(false);
    modalEl.querySelector("#mFirst").onclick = () => close(true);
    closeOnBackdrop(() => close(null));
  });
}
editor.addEventListener("dragover", (e) => e.preventDefault());
editor.addEventListener("drop", (e) => {
  const files = e.dataTransfer && e.dataTransfer.files;
  if (files && files.length) {
    e.preventDefault();
    toast("Only image links are supported. Paste the image URL instead.");
  }
});

editor.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const before = closestTag(window.getSelection().anchorNode, "li");
  if (!before || !before.hasAttribute("data-done")) return;
  setTimeout(() => {
    const after = closestTag(window.getSelection().anchorNode, "li");
    if (after && after !== before && after.hasAttribute("data-done")) {
      after.removeAttribute("data-done");
      render();
    }
  }, 0);
});

editor.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey) return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  let quote = closestTag(sel.anchorNode, "blockquote");
  if (!quote) return;
  while (closestTag(quote.parentNode, "blockquote")) quote = closestTag(quote.parentNode, "blockquote");

  const after = sel.getRangeAt(0).cloneRange();
  after.selectNodeContents(quote);
  after.setStart(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
  if (after.toString().trim()) return;

  e.preventDefault();
  const p = document.createElement("p");
  p.appendChild(document.createElement("br"));
  quote.parentNode.insertBefore(p, quote.nextSibling);
  const range = document.createRange();
  range.setStart(p, 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  savedRange = range.cloneRange();
  render();
});

/* ===================== Keyboard shortcuts ===================== */
editor.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); saveSelection(); insertLink(); }
  else if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); doUndo(); }
  else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); doRedo(); }
});

/* ===================== Reading Markdown back in ===================== */

/** Converts inline Markdown (code, images, links, emphasis) in a string to HTML. */
function inlineMarkdownToHtml(text) {
  const codes = [];
  let s = String(text);

  s = s.replace(/`([^`]+)`/g, (m, code) => {
    codes.push(code);
    return `\u0000CODE${codes.length - 1}\u0000`;
  });

  const escaped = [];
  s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|~])/g, (m, ch) => {
    escaped.push(ch);
    return `\u0000ESC${escaped.length - 1}\u0000`;
  });

  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (m, alt, src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (m, txt, href) => `<a href="${escapeHtml(href)}">${txt}</a>`);

  s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  s = s.replace(/__([^_]+)__/g, "<b>$1</b>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  s = s.replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g, "$1<i>$2</i>");
  s = s.replace(/~~([^~]+)~~/g, "<s>$1</s>");

  s = s.replace(/\u0000ESC(\d+)\u0000/g, (m, n) => escapeHtml(escaped[Number(n)]));
  s = s.replace(/\u0000CODE(\d+)\u0000/g, (m, n) => `<code>${escapeHtml(codes[Number(n)])}</code>`);
  return s;
}

/** Returns true if the line is a Markdown table separator row such as "| --- | :---: |". */
function looksLikeTableSeparator(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}
/** Splits a table row into trimmed cell strings, ignoring escaped pipes. */
function splitTableRow(line) {
  return line.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map(c => c.trim());
}

/** Converts one list block, with nesting by indentation and task items, to <ul>/<ol> HTML. */
function listBlockToHtml(lines) {
  const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  let index = 0;

  function build(indent) {
    const first = lines[index].match(ITEM);
    const ordered = /\d/.test(first[2]);
    const items = [];
    let isTask = false;

    while (index < lines.length) {
      const m = lines[index].match(ITEM);
      if (!m) break;
      const width = m[1].length;
      if (width < indent) break;
      if (width > indent) {
        const nested = build(width);
        if (items.length) items[items.length - 1].nested += nested;
        continue;
      }
      let body = m[3];
      let done = null;
      const task = body.match(/^\[([ xX])\]\s+(.*)$/);
      if (task) {
        isTask = true;
        done = task[1].toLowerCase() === "x";
        body = task[2];
      }
      items.push({ body, done, nested: "" });
      index++;
    }

    const tag = ordered ? "ol" : "ul";
    const attr = isTask ? ' data-task="1"' : "";
    return `<${tag}${attr}>` + items.map((it) =>
      `<li${it.done ? ' data-done="1"' : ""}>${inlineMarkdownToHtml(it.body)}${it.nested}</li>`
    ).join("") + `</${tag}>`;
  }

  return build(lines[0].match(ITEM)[1].length);
}

/** Converts a Markdown string to HTML, block by block (code, headings, quotes, tables, lists). */
function markdownToHtml(markdown) {
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    const fence = line.trim().match(/^(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const closing = fence[1][0];
      const body = [];
      i++;
      while (i < lines.length && !new RegExp("^\\s*" + closing + "{3,}\\s*$").test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++;
      const lang = fence[2].trim();
      out.push(`<pre${lang ? ` data-lang="${escapeHtml(lang)}"` : ""}><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      out.push(`<h${heading[1].length}>${inlineMarkdownToHtml(heading[2])}</h${heading[1].length}>`);
      i++;
      continue;
    }

    if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) { out.push("<hr>"); i++; continue; }

    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && (/^\s*>/.test(lines[i]) || (body.length && lines[i].trim()))) {
        body.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${markdownToHtml(body.join("\n"))}</blockquote>`);
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && looksLikeTableSeparator(lines[i + 1])) {
      const header = splitTableRow(line);
      const sep = i + 1;
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      const cell = (c) => inlineMarkdownToHtml(c.replace(/\\\|/g, "|"));
      const alineaciones = splitTableRow(lines[sep]).map((g) => {
        const t = g.trim();
        if (/^:-+:$/.test(t)) return "center";
        if (/^-+:$/.test(t)) return "right";
        return "";
      });
      const est = (n) => alineaciones[n] ? ` style="text-align: ${alineaciones[n]}"` : "";
      out.push(
        "<table><thead><tr>" + header.map((c, n) => `<th${est(n)}>${cell(c)}</th>`).join("") + "</tr></thead><tbody>" +
        rows.map(r => "<tr>" + header.map((_, n) => `<td${est(n)}>${cell(r[n] || "") || "<br>"}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>");
      continue;
    }

    if (/^(\s*)([-*+]|\d+[.)])\s+/.test(line)) {
      const block = [];
      while (i < lines.length && /^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i])) { block.push(lines[i]); i++; }
      out.push(listBlockToHtml(block));
      continue;
    }

    if (/^\s*</.test(line)) {
      const block = [];
      while (i < lines.length && lines[i].trim()) { block.push(lines[i]); i++; }
      out.push(block.join("\n"));
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() &&
           !/^\s*(#{1,6}\s|>|```|~~~)/.test(lines[i]) &&
           !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i]) &&
           !/^\s*</.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) {
      const text = para.map((l, n) => {
        const brk = /\s\s$/.test(l) && n < para.length - 1;
        return inlineMarkdownToHtml(l.trim()) + (brk ? "<br>" : "");
      }).join(" ").replace(/<br> /g, "<br>");
      out.push(`<p>${text}</p>`);
    }
  }

  return out.join("");
}

/** Removes scripts, frames, event handlers and javascript: links from imported HTML. */
function sanitizeImported(html) {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  holder.querySelectorAll("script, style, iframe, object, embed, link, meta").forEach(el => el.remove());
  holder.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      else if ((name === "href" || name === "src") && value.startsWith("javascript:")) el.removeAttribute(attr.name);
    });
  });
  holder.querySelectorAll("a:not([href])").forEach((el) => {
    while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
    el.remove();
  });
  return holder.innerHTML;
}

/** Opens the import dialog and replaces the editor content with the pasted Markdown. */
async function importMarkdown() {
  const hasContent = !!plainTextOf(editor).trim();
  const data = await modal("Import Markdown",
    `<p class="hint">Paste a README or any Markdown here and it becomes editable on the left.${
      hasContent ? " <strong>It replaces what is in the editor now.</strong>" : ""}</p>
     <textarea data-field="md" rows="12" placeholder="# My project&#10;&#10;Some text…"
       style="width:100%;background:var(--bg-3);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:8px;font-family:ui-monospace,Menlo,monospace;font-size:0.85rem"></textarea>`,
    "Import");
  if (!data || !data.md.trim()) return;
  editor.innerHTML = sanitizeImported(markdownToHtml(data.md));
  editor.focus();
  render();
  toast("Markdown imported");
}

/* ===================== Markdown generation ===================== */
/** Wraps text in Markdown markers, moving surrounding whitespace outside them. */
function emphasize(inner, marker) {
  const m = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!m || !m[2]) return inner;
  return m[1] + marker + m[2] + marker + m[3];
}

/** Converts an inline DOM node and its children to Markdown text. */
function inlineToMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/​/g, "");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  if (tag === "input") return "";
  const inner = Array.from(node.childNodes).map(inlineToMarkdown).join("");
  switch (tag) {
    case "b": case "strong": return emphasize(inner, "**");
    case "i": case "em": return emphasize(inner, "*");
    case "s": case "strike": case "del": return emphasize(inner, "~~");
    case "sub": return `<sub>${inner}</sub>`;
    case "sup": return `<sup>${inner}</sup>`;
    case "code": return emphasize(inner, "`");
    case "a": return `[${inner}](${node.getAttribute("href") || ""})`;
    case "img": {
      const src = node.getAttribute("src") || "";
      const alt = node.getAttribute("alt") || "";
      const width = node.getAttribute("width");
      if (width) return `<img src="${src}" alt="${alt}" width="${width}">`;
      return `![${alt}](${src})`;
    }
    case "br": return "  \n";
    default: return inner;
  }
}
/** Returns the trimmed inline Markdown of an element's children. */
function inlineOf(el) { return Array.from(el.childNodes).map(inlineToMarkdown).join("").trim(); }

/** Wraps text in a centered or right-aligned div, or returns it unchanged for left. */
function wrapAlign(text, align) {
  if (!text) return "";
  if (align === "center" || align === "right") return `<div align="${align}">\n\n${text}\n\n</div>`;
  return text;
}

/** Tags that the converter treats as top-level blocks. */
const BLOCK_TAGS = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "HR", "DIV", "DETAILS", "TABLE", "PRE"];

/** Extra tags for list and table parts that also occupy their own line. */
const INNER_BLOCK_TAGS = ["LI", "THEAD", "TBODY", "TR", "TD", "TH", "SUMMARY"];
/** Returns true if the tag is a block or an inner block tag. */
function isBlockTag(tag) {
  return BLOCK_TAGS.includes(tag) || INNER_BLOCK_TAGS.includes(tag);
}

/** Converts a container's children to Markdown, separating inline runs and blocks. */
function childrenToMarkdown(parent, exclude) {
  const blocks = [];
  let buffer = [];
  const flush = () => {
    const text = buffer.map(inlineToMarkdown).join("").trim();
    if (text) blocks.push(text);
    buffer = [];
  };
  parent.childNodes.forEach((node) => {
    if (exclude && node === exclude) return;
    const isBlock = node.nodeType === 1 && BLOCK_TAGS.includes(node.tagName);
    if (isBlock) {
      flush();
      const md = blockToMarkdown(node);
      if (md && md.trim()) blocks.push(md.trim());
    } else {
      buffer.push(node);
    }
  });
  flush();
  return blocks.join("\n\n");
}
/** Returns "center", "right" or "left" from an element's style or align attribute. */
function getTextAlign(el) {
  const a = (el.style && el.style.textAlign) ||
            (el.getAttribute && el.getAttribute("align"));
  if (a === "center" || a === "right") return a;
  return "left";
}
/** Returns the alignment of a list, or "left" unless all items agree. */
function listAlign(el) {
  const own = getTextAlign(el);
  if (own !== "left") return own;
  const items = Array.from(el.children).filter(c => c.tagName === "LI");
  if (!items.length) return "left";
  const first = getTextAlign(items[0]);
  if (first === "left") return "left";
  return items.every(li => getTextAlign(li) === first) ? first : "left";
}

/** Converts a list element to Markdown lines, handling task lists and nesting. */
function listItemsToMarkdown(el, ordered, indent) {
  indent = indent || 0;
  const isTask = el.hasAttribute("data-task");
  const lines = [];
  let i = 1;
  for (const li of Array.from(el.children)) {
    if (li.tagName.toLowerCase() !== "li") continue;
    const nested = li.querySelector(":scope > ul, :scope > ol");
    const textNodes = Array.from(li.childNodes).filter(n => {
      if (n.nodeType === 1 && (n.tagName === "UL" || n.tagName === "OL")) return false;
      return true;
    });
    const text = textNodes.map(inlineToMarkdown).join("").trim();
    let prefix, sangria;
    if (isTask) {
      prefix = li.hasAttribute("data-done") ? `- [x] ` : `- [ ] `;
      sangria = 2;
    } else if (ordered) {
      prefix = `${i}. `;
      sangria = prefix.length;
      i++;
    } else {
      prefix = `- `;
      sangria = 2;
    }
    lines.push(" ".repeat(indent) + prefix + text);
    if (nested) lines.push(listItemsToMarkdown(nested, nested.tagName.toLowerCase() === "ol", indent + sangria));
  }
  return lines.join("\n");
}

/** Converts a table cell to a single-line Markdown cell with pipes escaped. */
function cellToMarkdown(cell) {
  return Array.from(cell.childNodes).map(inlineToMarkdown).join("")
    .replace(/​/g, "")
    .replace(/\s*\n\s*/g, "<br>")
    .replace(/^(<br>)+|(<br>)+$/g, "")
    .replace(/\|/g, "\\|")
    .trim();
}
/** Returns the alignment of column n when all its cells agree, otherwise "left". */
function columnAlign(table, n) {
  const celdas = Array.from(table.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.children).filter(c => c.tagName === "TD" || c.tagName === "TH")[n]).filter(Boolean);
  if (!celdas.length) return "left";
  const primera = getTextAlign(celdas[0]);
  if (primera === "left") return "left";
  return celdas.every(c => getTextAlign(c) === primera) ? primera : "left";
}

/** Converts a table element to a Markdown table. */
function tableToMarkdown(el) {
  const rows = Array.from(el.querySelectorAll("tr"));
  if (!rows.length) return "";
  const cellsOf = (tr) => Array.from(tr.children).filter(c => c.tagName === "TD" || c.tagName === "TH");
  const headCells = cellsOf(rows[0]);
  const header = headCells.map(cellToMarkdown);
  if (!header.length) return "";
  const guiones = headCells.map((c) => {
    const a = columnAlign(el, headCells.indexOf(c));
    return a === "center" ? ":---:" : a === "right" ? "---:" : "---";
  });
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${guiones.join(" | ")} |`,
  ];
  rows.slice(1).forEach((tr) => {
    const cells = cellsOf(tr).map(cellToMarkdown);
    while (cells.length < header.length) cells.push("");
    lines.push(`| ${cells.slice(0, header.length).join(" | ")} |`);
  });
  return lines.join("\n");
}

/** Converts a block element to its Markdown equivalent. */
function blockToMarkdown(el) {
  if (el.nodeType === Node.TEXT_NODE) {
    const t = el.textContent.trim();
    return t ? t : "";
  }
  if (el.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = el.tagName.toLowerCase();
  const heading = { h1: "#", h2: "##", h3: "###", h4: "####", h5: "#####", h6: "######" }[tag];
  if (heading) {
    const text = inlineOf(el).replace(/\s*\n\s*/g, " ").trim();
    return text ? wrapAlign(`${heading} ${text}`, getTextAlign(el)) : "";
  }
  switch (tag) {
    case "p": return wrapAlign(childrenToMarkdown(el), getTextAlign(el));
    case "blockquote": {
      const inner = childrenToMarkdown(el);
      if (!inner.trim()) return "";
      const quoted = inner.split("\n").map(l => (l ? `> ${l}` : ">")).join("\n");
      return wrapAlign(quoted, getTextAlign(el));
    }
    case "hr": return "---";
    case "table": return tableToMarkdown(el);
    case "pre": {
      const lang = el.getAttribute("data-lang") || "";
      const code = el.textContent.replace(/​/g, "").replace(/\n$/, "");
      return "```" + lang + "\n" + code + "\n```";
    }
    case "ul": return wrapAlign(listItemsToMarkdown(el, false), listAlign(el));
    case "ol": return wrapAlign(listItemsToMarkdown(el, true), listAlign(el));
    case "details": {
      const summary = el.querySelector(":scope > summary");
      const title = summary ? inlineOf(summary) : "Details";
      const rest = childrenToMarkdown(el, summary);
      return `<details>\n<summary>${title}</summary>\n\n${rest}\n\n</details>`;
    }
    case "div": {
      const inner = childrenToMarkdown(el);
      const align = el.getAttribute("align") ||
        (getTextAlign(el) !== "left" ? getTextAlign(el) : null);
      if (align) return `<div align="${align}">\n\n${inner}\n\n</div>`;
      return inner;
    }
    default: return inlineOf(el) || inlineToMarkdown(el);
  }
}

/* ===================== Undo/redo ===================== */
// Snapshots of editor.innerHTML used for undo and redo.
let historyStack = [""];
let historyPointer = 0;

/** Moves lists nested inside paragraphs out to the editor level, keeping the cursor. */
function sacarListasDeParrafos() {
  const sel = window.getSelection();
  const anclaba = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;

  editor.querySelectorAll("p > ul, p > ol").forEach((lista) => {
    const p = lista.parentElement;
    if (!p || !editor.contains(p)) return;
    const huerfano = anclaba && p.contains(anclaba) && !lista.contains(anclaba);
    const antes = [], despues = [];
    let pasada = false;
    Array.from(p.childNodes).forEach((n) => {
      if (n === lista) { pasada = true; return; }
      (pasada ? despues : antes).push(n);
    });
    const comoParrafo = (nodos) => {
      if (!nodos.length) return null;
      const tieneAlgo = nodos.some(n =>
        (n.textContent || "").trim() || (n.nodeType === 1 && n.querySelector("img")) || n.nodeName === "IMG");
      if (!tieneAlgo) return null;
      const np = document.createElement("p");
      nodos.forEach(n => np.appendChild(n));
      return np;
    };
    const pAntes = comoParrafo(antes);
    const pDespues = comoParrafo(despues);
    const padre = p.parentElement;
    if (pAntes) padre.insertBefore(pAntes, p);
    padre.insertBefore(lista, p);
    if (pDespues) padre.insertBefore(pDespues, p);
    p.remove();

    if (huerfano) {
      const ultimo = lista.querySelector(":scope > li:last-of-type");
      if (ultimo) {
        const r = document.createRange();
        r.selectNodeContents(ultimo);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }
  });
}

/** Appends an empty paragraph at the end when the last block is not a free line. */
function ensureTrailingParagraph() {
  const last = editor.lastElementChild;
  const isFreeLine = last && last.tagName === "P" && !last.textContent.trim() &&
                     !last.querySelector("img, table, hr");
  if (editor.lastChild && !isFreeLine) {
    editor.appendChild(document.createElement("p")).appendChild(document.createElement("br"));
  }
}

/** Replaces headings that have no text with plain empty paragraphs, keeping the cursor. */
function demoteEmptyHeadings() {
  const dentro = (el) => {
    const sel = window.getSelection();
    return sel.rangeCount && el.contains(sel.anchorNode);
  };
  editor.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
    if (h.textContent.replace(/​/g, "").trim()) return;
    if (h.querySelector("img, table")) return;
    const tocaba = dentro(h);
    const p = document.createElement("p");
    p.appendChild(document.createElement("br"));
    h.replaceWith(p);
    if (tocaba) {
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      savedRange = range.cloneRange();
    }
  });
}

/** Block tags that cannot have the cursor placed right next to each other. */
const HARD_BLOCKS = ["TABLE", "HR", "DETAILS", "BLOCKQUOTE", "UL", "OL", "PRE"];

/** Adds collapsed spacer paragraphs between adjacent hard blocks and removes stale ones. */
function ensureSpacersBetweenBlocks() {
  const esHueco = (p) => p && p.tagName === "P" && !p.textContent.trim() && !p.querySelector("img");
  editor.querySelectorAll("p[data-spacer]").forEach((p) => {
    const a = p.previousElementSibling, b = p.nextElementSibling;
    const sigueSiendo = esHueco(p) && a && b && HARD_BLOCKS.includes(a.tagName) && HARD_BLOCKS.includes(b.tagName);
    if (!sigueSiendo) { p.removeAttribute("data-spacer"); p.classList.remove("abierto"); if (!p.getAttribute("class")) p.removeAttribute("class"); }
  });
  const hijos = Array.from(editor.children);
  for (let i = 0; i < hijos.length - 1; i++) {
    if (HARD_BLOCKS.includes(hijos[i].tagName) && HARD_BLOCKS.includes(hijos[i + 1].tagName)) {
      const p = document.createElement("p");
      p.setAttribute("data-spacer", "1");
      p.appendChild(document.createElement("br"));
      editor.insertBefore(p, hijos[i + 1]);
    }
  }
}
editor.addEventListener("keydown", (e) => {
  if ((e.key !== "ArrowUp" && e.key !== "ArrowDown") || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  const sel = window.getSelection();
  if (!sel.rangeCount || !sel.isCollapsed) return;
  let bloque = sel.anchorNode;
  while (bloque && bloque.parentNode !== editor) bloque = bloque.parentNode;
  if (!bloque || bloque.nodeType !== 1) return;
  const arriba = e.key === "ArrowUp";
  const vecino = arriba ? bloque.previousElementSibling : bloque.nextElementSibling;
  if (!vecino || !vecino.hasAttribute("data-spacer")) return;
  e.preventDefault();
  sel.modify("move", arriba ? "backward" : "forward", "line");
  if (bloque.contains(sel.anchorNode)) return;
  const r = document.createRange();
  r.setStart(vecino, 0);
  r.collapse(true);
  vecino.classList.add("abierto");
  sel.removeAllRanges();
  sel.addRange(r);
});
document.addEventListener("selectionchange", () => {
  const sel = window.getSelection();
  const nodo = sel.rangeCount ? sel.anchorNode : null;
  const el = nodo && (nodo.nodeType === 1 ? nodo : nodo.parentElement);
  const dentro = el && el.closest ? el.closest("p[data-spacer]") : null;
  editor.querySelectorAll("p[data-spacer].abierto").forEach((x) => { if (x !== dentro) x.classList.remove("abierto"); });
  if (dentro && editor.contains(dentro)) dentro.classList.add("abierto");
});

/** Inline style properties the browser adds that Markdown cannot represent. */
const FAKE_STYLES = ["font-size", "font-weight", "font-family", "font-style", "color", "background-color"];

/** Strips fake inline styles, unwraps font tags and removes attribute-less spans. */
function stripFakeFontSizes() {
  editor.querySelectorAll("[style]").forEach((el) => {
    FAKE_STYLES.forEach((prop) => el.style.removeProperty(prop));
    if (!el.getAttribute("style")) el.removeAttribute("style");
  });
  editor.querySelectorAll("font").forEach((el) => {
    while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
    el.remove();
  });
  editor.querySelectorAll("span").forEach((el) => {
    if (el.attributes.length) return;
    while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
    el.remove();
  });
}

/** Unwraps paragraphs and divs inside table cells, joining their lines with br tags. */
function normalizarCeldas() {
  const bloques = editor.querySelectorAll("td > div, td > p, th > div, th > p");
  if (!bloques.length) return;
  const sel = window.getSelection();
  const guardado = sel.rangeCount ? sel.getRangeAt(0) : null;
  const punto = guardado && {
    sc: guardado.startContainer, so: guardado.startOffset,
    ec: guardado.endContainer, eo: guardado.endOffset,
  };
  bloques.forEach((b) => {
    const antes = b.previousSibling, despues = b.nextSibling;
    if (antes && antes.nodeName !== "BR") b.before(document.createElement("br"));
    const ultimo = b.lastChild;
    while (b.firstChild) b.before(b.firstChild);
    if (despues && despues.nodeName !== "BR" && !(ultimo && ultimo.nodeName === "BR")) b.before(document.createElement("br"));
    b.remove();
  });
  if (punto && editor.contains(punto.sc) && editor.contains(punto.ec)) {
    const tope = (n, o) => Math.min(o, n.nodeType === 3 ? n.textContent.length : n.childNodes.length);
    const r = document.createRange();
    r.setStart(punto.sc, tope(punto.sc, punto.so));
    r.setEnd(punto.ec, tope(punto.ec, punto.eo));
    sel.removeAllRanges();
    sel.addRange(r);
  }
}

/** Normalizes the editor DOM and regenerates the Markdown output. */
function renderOutputOnly() {
  stripFakeFontSizes();
  normalizarCeldas();
  demoteEmptyHeadings();
  sacarListasDeParrafos();
  ensureSpacersBetweenBlocks();
  ensureTrailingParagraph();
  output.textContent = childrenToMarkdown(editor).replace(/​/g, "");
}
/** Saves the current editor HTML to the undo stack if it changed (max 100 entries). */
function pushHistory() {
  const html = editor.innerHTML;
  if (html === historyStack[historyPointer]) return;
  historyStack = historyStack.slice(0, historyPointer + 1);
  historyStack.push(html);
  historyPointer = historyStack.length - 1;
  if (historyStack.length > 100) { historyStack.shift(); historyPointer--; }
}
/** Refreshes the Markdown output and records a history entry. */
function render() {
  renderOutputOnly();
  pushHistory();
}
/** Steps back one history entry and re-renders. */
function doUndo() {
  if (historyPointer <= 0) return;
  historyPointer--;
  editor.innerHTML = historyStack[historyPointer];
  renderOutputOnly();
  editor.focus();
}
/** Steps forward one history entry and re-renders. */
function doRedo() {
  if (historyPointer >= historyStack.length - 1) return;
  historyPointer++;
  editor.innerHTML = historyStack[historyPointer];
  renderOutputOnly();
  editor.focus();
}

editor.addEventListener("input", render);
editor.addEventListener("focus", () => { if (!editor.firstChild) render(); });
render();

/* ===================== Actions bar ===================== */
document.getElementById("btnImport").addEventListener("click", importMarkdown);
document.getElementById("btnCopy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
    toast("Markdown copied to clipboard");
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = output.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Markdown copied to clipboard");
  }
});

document.getElementById("btnDownload").addEventListener("click", () => {
  const blob = new Blob([output.textContent], { type: "text/markdown;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "document.md";
  document.body.appendChild(a);
  a.click();
  a.remove();
});

document.getElementById("btnUndo").addEventListener("click", doUndo);
document.getElementById("btnRedo").addEventListener("click", doRedo);

/** Shows a styled yes/no modal and resolves to true if the user confirms. */
async function askConfirm(title, message, okLabel, destructive) {
  const data = await modal(title, `<p class="hint">${escapeHtml(message)}</p>`, okLabel,
    (m) => { if (destructive) m.querySelector("#mOk").classList.add("destructive"); });
  return !!data;
}

document.getElementById("btnClear").addEventListener("click", async () => {
  if (!(await askConfirm("Clear everything?", "This cannot be undone.", "Clear all", true))) return;
  editor.innerHTML = "";
  render();
  editor.focus();
});

/* ===================== Template ===================== */
/** Text used when a banner or animated text title is left empty. */
const TEXTO_POR_DEFECTO = "Hello World";

/** Loads the sample template into the editor, confirming first if there is content. */
async function insertTemplate() {
  if (editor.textContent.trim() || editor.querySelector("img, table, hr")) {
    if (!(await askConfirm("Load the template?", "This replaces what you have written.", "Load template", true))) return;
  }
  editor.innerHTML = sanitizeImported(markdownToHtml(PLANTILLA_MD));
  editor.focus();
  render();
  toast("Template loaded. Edit it like anything else");
}

document.getElementById("btnTemplate").addEventListener("click", insertTemplate);

