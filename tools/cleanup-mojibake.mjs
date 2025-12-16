import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TARGET_DIRS = ["src", "tools"]; // scan only your code
const EXT_OK = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".json", ".mjs", ".cjs", ".txt"]);
const SKIP_DIR = new Set(["node_modules", ".next", ".git"]);

const patterns = [
  // Mojibake sequences expressed as Unicode codepoints (no weird chars in this file)
  ["\u00e2\u20ac\u2122", "'"], // '
  ["\u00e2\u20ac\u02dc", "'"], // '
  ["\u00e2\u20ac\u0153", '"'], // "
  ["\u00e2\u20ac\u009d", '"'], // â€
  ["\u00e2\u20ac\u201c", "-"], // -
  ["\u00e2\u20ac\u201d", "-"], // â—
  ["\u00e2\u20ac\u00a2", "-"], // -
  ["\u00c2", ""],              // 
  ["\u00a0", " "],             // NBSP
];

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXT_OK.has(ext);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      walk(full);
    } else if (e.isFile()) {
      if (!shouldProcess(full)) continue;
      processFile(full);
    }
  }
}

let changed = 0;
let scanned = 0;
let skipped = 0;

function processFile(filePath) {
  try {
    scanned++;
    const stat = fs.statSync(filePath);
    if (stat.size > 2 * 1024 * 1024) { skipped++; return; } // safety: skip very large files

    const before = fs.readFileSync(filePath, "utf8");

    // quick filter
    if (!before.includes("\u00e2\u20ac") && !before.includes("\u00c2") && !before.includes("\u00a0")) return;

    let after = before;
    for (const [from, to] of patterns) after = after.split(from).join(to);

    if (after !== before) {
      fs.writeFileSync(filePath, after, "utf8");
      changed++;
    }
  } catch {
    skipped++;
  }
}

// Run
for (const d of TARGET_DIRS) {
  const p = path.join(ROOT, d);
  if (fs.existsSync(p)) walk(p);
}

console.log(`Cleanup done. Scanned: ${scanned}, Changed: ${changed}, Skipped: ${skipped}`);
