////////////////////////////////////////////////////////////////
// ES MODULES (ESM) - import / export
////////////////////////////////////////////////////////////////

// ============================================================
// NAMED EXPORTS (multiple per file)
// ============================================================

// math.js - exporting
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export class Calculator {
  multiply(a, b) { return a * b; }
}

// Or export all at once
const PI2 = 3.14159;
function add2(a, b) { return a + b; }
function subtract2(a, b) { return a - b; }
export { PI2, add2, subtract2 };

// main.js - importing named exports
import { PI, add, subtract } from "./math.js";
add(2, 3); // 5

// Rename on import
import { add as sum, subtract as minus } from "./math.js";
sum(2, 3); // 5

// Import everything as namespace
import * as math from "./math.js";
math.PI;        // 3.14159
math.add(2, 3); // 5

// ============================================================
// DEFAULT EXPORT (one per file)
// ============================================================

// logger.js - default export
export default class Logger {
  log(msg) { console.log(`[LOG] ${msg}`); }
  error(msg) { console.error(`[ERR] ${msg}`); }
}

// main.js - importing default (can use any name)
import Logger from "./logger.js";
import MyLogger from "./logger.js"; // same thing, different name

const logger = new Logger();
logger.log("Hello");

// Default + named exports together
// utils.js
export default function main() { /* ... */ }
export function helper1() { /* ... */ }
export function helper2() { /* ... */ }

// import both
import main, { helper1, helper2 } from "./utils.js";

// ============================================================
// RE-EXPORTING (barrel files / index.js)
// ============================================================

// components/index.js - re-export from multiple files
export { Button } from "./Button.js";
export { Input } from "./Input.js";
export { Modal } from "./Modal.js";
export { default as Layout } from "./Layout.js";

// Re-export everything
export * from "./utils.js";
export * as validators from "./validators.js";

// Then import from the barrel
import { Button, Input, Modal } from "./components/index.js";

// ============================================================
// DYNAMIC IMPORT (lazy loading)
// ============================================================

// Returns a Promise
async function loadModule() {
  const module = await import("./heavy-module.js");
  module.doSomething();
  module.default(); // access default export
}

// Conditional import
async function loadChart(type) {
  if (type === "bar") {
    const { BarChart } = await import("./charts/bar.js");
    return new BarChart();
  } else {
    const { LineChart } = await import("./charts/line.js");
    return new LineChart();
  }
}

// Dynamic import with destructuring
const { default: React, useState, useEffect } = await import("react");

// ============================================================
// MODULE FEATURES
// ============================================================

// Modules are always in strict mode
// Each module has its own scope (no global pollution)
// Modules are executed only once (singleton)
// import/export must be at top level (not inside if/for/function)

// In HTML, use type="module"
// <script type="module" src="main.js"></script>

// Module vs Script differences:
// | Feature          | Module          | Script         |
// |-----------------|-----------------|----------------|
// | Strict mode     | Always          | Optional       |
// | Top-level this  | undefined       | window         |
// | Top-level await | Yes             | No             |
// | Scope           | Module scope    | Global scope   |
// | Loading         | Deferred        | Blocking       |
// | CORS            | Required        | Not required   |

// ============================================================
// COMMON MODULE PATTERNS
// ============================================================

// Singleton pattern
// config.js
let instance = null;

class Config {
  constructor() {
    if (instance) return instance;
    this.settings = {};
    instance = this;
  }

  set(key, value) {
    this.settings[key] = value;
  }

  get(key) {
    return this.settings[key];
  }
}

export default new Config(); // always same instance

// Factory pattern
// createLogger.js
export function createLogger(prefix) {
  return {
    log: (msg) => console.log(`[${prefix}] ${msg}`),
    error: (msg) => console.error(`[${prefix}] ${msg}`),
    warn: (msg) => console.warn(`[${prefix}] ${msg}`)
  };
}

// Plugin/middleware pattern
// middleware.js
const middlewares = [];

export function use(fn) {
  middlewares.push(fn);
}

export async function execute(context) {
  for (const fn of middlewares) {
    await fn(context);
  }
}

// ============================================================
// COMMONJS (Node.js - for reference)
// ============================================================

// Exporting (CommonJS)
// module.exports = { add, subtract };
// module.exports = Calculator;
// exports.PI = 3.14159;

// Importing (CommonJS)
// const { add, subtract } = require("./math");
// const Calculator = require("./Calculator");

// ESM vs CommonJS:
// | Feature     | ESM                    | CommonJS            |
// |------------|------------------------|---------------------|
// | Syntax     | import/export          | require/module.exports |
// | Loading    | Async (static)         | Sync               |
// | Tree-shake | Yes                    | No                  |
// | Browser    | Yes (native)           | No (needs bundler)  |
// | Node.js    | .mjs or "type":"module"| Default             |
