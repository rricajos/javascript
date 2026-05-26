////////////////////////////////////////////////////////////////
// GARBAGE COLLECTION - How JS manages memory
////////////////////////////////////////////////////////////////

// JavaScript uses automatic garbage collection
// The main algorithm is "mark-and-sweep":
// 1. Start from "roots" (global vars, call stack, closures)
// 2. Mark all reachable objects
// 3. Sweep (free) unreachable objects

// Object becomes garbage when no references point to it
let obj = { name: "Ana" };  // object is reachable
obj = null;                   // object is now unreachable → garbage collected

// Circular references are handled (mark-and-sweep)
function circular() {
  let a = {};
  let b = {};
  a.ref = b;
  b.ref = a;
  // When function exits, both a and b are unreachable
  // Even though they reference each other → garbage collected
}

////////////////////////////////////////////////////////////////
// COMMON MEMORY LEAKS
////////////////////////////////////////////////////////////////

// 1. Accidental global variables
function leak1() {
  // Missing 'let/const/var' creates a global
  leaked = "I'm global!"; // window.leaked
}
// Fix: use 'use strict' or always declare with let/const

// 2. Forgotten timers
function leak2() {
  const data = loadHugeData();
  setInterval(() => {
    console.log(data); // 'data' can never be garbage collected
  }, 1000);
}
// Fix: clear intervals when no longer needed
const intervalId = setInterval(doSomething, 1000);
clearInterval(intervalId); // cleanup

// 3. Forgotten event listeners
function leak3() {
  const button = document.getElementById("btn");
  const handler = () => {
    const hugeData = new Array(1000000);
    console.log(hugeData.length);
  };
  button.addEventListener("click", handler);
  // If button is removed from DOM but handler keeps reference to hugeData
}
// Fix: remove listeners when done
button.removeEventListener("click", handler);

// 4. Detached DOM nodes
function leak4() {
  const elements = [];
  for (let i = 0; i < 100; i++) {
    const div = document.createElement("div");
    document.body.appendChild(div);
    elements.push(div); // reference kept in array
  }
  // Even after removing from DOM, 'elements' array keeps them in memory
  document.body.innerHTML = "";
  // elements still holds 100 detached DOM nodes!
}
// Fix: clear the array reference too
// elements.length = 0;

// 5. Closures holding large data
function leak5() {
  const hugeArray = new Array(1000000).fill("x");

  return function() {
    // This closure keeps 'hugeArray' alive
    // even if we only need one value
    return hugeArray.length;
  };
}
// Fix: copy only what you need
function noLeak() {
  const hugeArray = new Array(1000000).fill("x");
  const length = hugeArray.length; // copy the value

  return function() {
    return length; // hugeArray can now be garbage collected
  };
}

////////////////////////////////////////////////////////////////
// WEAKREF & FINALIZATIONREGISTRY (ES2021)
////////////////////////////////////////////////////////////////

// WeakRef - holds a weak reference to an object
// Doesn't prevent garbage collection

let target = { name: "Ana", data: new Array(1000000) };
const weakRef = new WeakRef(target);

// Access the target (may return undefined if GC'd)
weakRef.deref();  // { name: "Ana", data: [...] } or undefined

target = null;    // now the object can be garbage collected
// Later: weakRef.deref() may return undefined

// FinalizationRegistry - callback when object is garbage collected
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object ${heldValue} was garbage collected`);
});

let obj2 = { name: "Resource" };
registry.register(obj2, "resource-1"); // register with a held value

obj2 = null; // eventually logs: "Object resource-1 was garbage collected"

// Practical use case: cache with automatic cleanup
class WeakCache {
  constructor() {
    this.cache = new Map();
    this.registry = new FinalizationRegistry(key => {
      const ref = this.cache.get(key);
      if (ref && !ref.deref()) {
        this.cache.delete(key);
      }
    });
  }

  set(key, value) {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.registry.register(value, key);
  }

  get(key) {
    const ref = this.cache.get(key);
    if (!ref) return undefined;
    const value = ref.deref();
    if (!value) {
      this.cache.delete(key);
      return undefined;
    }
    return value;
  }
}

////////////////////////////////////////////////////////////////
// PERFORMANCE OPTIMIZATION PATTERNS
////////////////////////////////////////////////////////////////

// 1. Debounce - execute after user stops triggering
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage: search input
const searchInput = document.getElementById("search");
const debouncedSearch = debounce((query) => {
  fetch(`/api/search?q=${query}`);
}, 300);
// searchInput.addEventListener("input", e => debouncedSearch(e.target.value));

// 2. Throttle - execute at most once per interval
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage: scroll handler
const throttledScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 100);
// window.addEventListener("scroll", throttledScroll);

// 3. Memoization - cache function results
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalc = memoize((n) => {
  console.log("Computing...");
  return n * n;
});

expensiveCalc(5); // "Computing..." → 25
expensiveCalc(5); // 25 (from cache, no log)

// 4. Virtual scrolling concept
// Instead of rendering 10,000 DOM nodes, only render visible ones
// Libraries: react-virtualized, react-window, tanstack-virtual

// 5. requestAnimationFrame - smooth animations
function animate() {
  // Update animation state
  element.style.transform = `translateX(${position}px)`;
  position += 2;

  if (position < 500) {
    requestAnimationFrame(animate); // next frame (~16ms at 60fps)
  }
}
requestAnimationFrame(animate);

// 6. Web Workers - offload heavy computation
const worker = new Worker("heavy-task.js");

worker.postMessage({ data: largeDataSet });
worker.onmessage = (event) => {
  console.log("Result:", event.data);
};

// heavy-task.js:
// self.onmessage = (event) => {
//   const result = heavyComputation(event.data);
//   self.postMessage(result);
// };

////////////////////////////////////////////////////////////////
// MEASURING PERFORMANCE
////////////////////////////////////////////////////////////////

// performance.now() - high resolution timer
const start = performance.now();
// ... code to measure ...
const end = performance.now();
console.log(`Took ${end - start}ms`);

// console.time / console.timeEnd
console.time("operation");
// ... code to measure ...
console.timeEnd("operation"); // "operation: 12.345ms"

// Performance API - measure specific operations
performance.mark("start-fetch");
await fetch("/api/data");
performance.mark("end-fetch");
performance.measure("fetch-duration", "start-fetch", "end-fetch");

const measures = performance.getEntriesByName("fetch-duration");
console.log(`Fetch took ${measures[0].duration}ms`);

// Memory usage (Chrome only)
if (performance.memory) {
  console.log("Used:", performance.memory.usedJSHeapSize);
  console.log("Total:", performance.memory.totalJSHeapSize);
  console.log("Limit:", performance.memory.jsHeapSizeLimit);
}

////////////////////////////////////////////////////////////////
// BEST PRACTICES SUMMARY
////////////////////////////////////////////////////////////////

// 1. Use const/let instead of var (proper scoping)
// 2. Nullify references when done with large objects
// 3. Remove event listeners when components unmount
// 4. Clear timers (clearInterval, clearTimeout)
// 5. Use WeakMap/WeakSet for object metadata
// 6. Avoid creating functions inside loops
// 7. Use Web Workers for heavy CPU tasks
// 8. Debounce/throttle frequent events (scroll, resize, input)
// 9. Use requestAnimationFrame for visual animations
// 10. Profile with DevTools before optimizing (don't guess)
