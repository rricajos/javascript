////////////////////////////////////////////////////////////////
// THE CALL STACK
////////////////////////////////////////////////////////////////

// JavaScript is single-threaded: one call stack, one thing at a time

// The call stack tracks function execution:
function third()  { console.log("third"); }
function second() { third(); console.log("second"); }
function first()  { second(); console.log("first"); }
first();
// Call stack sequence:
// 1. push first()
// 2. push second()
// 3. push third()    → logs "third"
// 4. pop third()
// 5. second() resumes → logs "second"
// 6. pop second()
// 7. first() resumes  → logs "first"
// 8. pop first()
// Stack is now empty

// Stack overflow (too many frames)
function infinite() { infinite(); } // RangeError: Maximum call stack size exceeded

////////////////////////////////////////////////////////////////
// EXECUTION CONTEXT
////////////////////////////////////////////////////////////////

// Each function call creates an execution context:
// - Variable Environment (let, const, var declarations)
// - Scope Chain (access to outer variables)
// - "this" binding

// Global context is created first, then each function call
// pushes a new context onto the stack

const globalVar = "I'm global";

function outer() {
  const outerVar = "I'm outer";

  function inner() {
    const innerVar = "I'm inner";
    console.log(innerVar);  // own scope
    console.log(outerVar);  // scope chain → outer
    console.log(globalVar); // scope chain → global
  }

  inner();
}

outer();

////////////////////////////////////////////////////////////////
// THE EVENT LOOP
////////////////////////////////////////////////////////////////

// The event loop coordinates:
// 1. Call Stack       - synchronous code execution
// 2. Microtask Queue  - Promises, queueMicrotask, MutationObserver
// 3. Macrotask Queue  - setTimeout, setInterval, I/O, UI events

// Event loop algorithm:
// 1. Execute everything in the call stack
// 2. When stack is empty, drain ALL microtasks
// 3. Execute ONE macrotask
// 4. Drain ALL microtasks again
// 5. Render/paint if needed
// 6. Repeat from step 3

console.log("1 - synchronous");

setTimeout(function() {
  console.log("2 - macrotask (setTimeout)");
}, 0);

Promise.resolve().then(function() {
  console.log("3 - microtask (Promise)");
});

console.log("4 - synchronous");

// Output order: 1, 4, 3, 2
// Explanation:
// - "1" and "4" run synchronously (call stack)
// - Promise.then goes to microtask queue
// - setTimeout goes to macrotask queue
// - Stack empty → drain microtasks → "3"
// - Next macrotask → "2"

////////////////////////////////////////////////////////////////
// MICROTASKS vs MACROTASKS
////////////////////////////////////////////////////////////////

// Microtasks (higher priority, all run before next macrotask):
// - Promise.then / catch / finally
// - queueMicrotask()
// - MutationObserver
// - async/await continuations

// Macrotasks (one per event loop iteration):
// - setTimeout / setInterval
// - setImmediate (Node.js)
// - requestAnimationFrame
// - I/O operations
// - UI rendering events (click, scroll, etc.)

setTimeout(() => console.log("timeout 1"), 0);
setTimeout(() => console.log("timeout 2"), 0);

Promise.resolve()
  .then(() => console.log("promise 1"))
  .then(() => console.log("promise 2"));

queueMicrotask(() => console.log("microtask 1"));

console.log("sync");

// Output: sync, promise 1, microtask 1, promise 2, timeout 1, timeout 2
// All microtasks drain before any macrotask runs

////////////////////////////////////////////////////////////////
// PRACTICAL EXAMPLES
////////////////////////////////////////////////////////////////

// Why setTimeout(fn, 0) is NOT immediate
console.log("start");

setTimeout(() => {
  console.log("timeout"); // runs AFTER all sync code + microtasks
}, 0);

for (let i = 0; i < 1000000; i++) {} // blocks the stack

console.log("end");
// Output: start, end, timeout
// The timeout waits for the call stack to be empty

// Nested microtasks run before any macrotask
Promise.resolve().then(() => {
  console.log("promise 1");
  Promise.resolve().then(() => {
    console.log("nested promise 2"); // still runs before setTimeout
  });
});

setTimeout(() => console.log("timeout"), 0);

// Output: promise 1, nested promise 2, timeout

////////////////////////////////////////////////////////////////
// ASYNC/AWAIT AND THE EVENT LOOP
////////////////////////////////////////////////////////////////

async function asyncExample() {
  console.log("A - sync (inside async, before await)");

  await Promise.resolve(); // pauses here, rest becomes microtask

  console.log("B - microtask (after await)");
}

console.log("1");
asyncExample();
console.log("2");

// Output: 1, A, 2, B
// "A" is synchronous (before the await)
// "B" is a microtask (continuation after await)

// More complex example
async function foo() {
  console.log("foo start");
  await bar();
  console.log("foo end"); // microtask
}

async function bar() {
  console.log("bar");
}

console.log("script start");
setTimeout(() => console.log("setTimeout"), 0);
foo();
new Promise((resolve) => {
  console.log("promise constructor"); // sync!
  resolve();
}).then(() => console.log("promise then"));
console.log("script end");

// Output:
// script start
// foo start
// bar
// promise constructor
// script end
// foo end
// promise then
// setTimeout

////////////////////////////////////////////////////////////////
// BLOCKING THE EVENT LOOP
////////////////////////////////////////////////////////////////

// Bad: long synchronous operation blocks everything
function heavySync() {
  const start = Date.now();
  while (Date.now() - start < 3000) {} // blocks for 3 seconds
  console.log("Done"); // UI is frozen during this!
}

// Good: break work into chunks with setTimeout
function heavyAsync(data, index, callback) {
  if (index >= data.length) { callback(); return; }

  // Process one chunk
  processChunk(data[index]);

  // Yield to the event loop, then continue
  setTimeout(function() {
    heavyAsync(data, index + 1, callback);
  }, 0);
}

// Good: use requestAnimationFrame for visual updates
function animateSmooth(element, targetX) {
  let current = 0;
  function step() {
    current += 2;
    element.style.transform = `translateX(${current}px)`;
    if (current < targetX) {
      requestAnimationFrame(step); // syncs with screen refresh
    }
  }
  requestAnimationFrame(step);
}

// Good: use Web Workers for CPU-intensive tasks
// (see memory_and_performance.js for Web Workers)

////////////////////////////////////////////////////////////////
// COMMON PITFALLS
////////////////////////////////////////////////////////////////

// Pitfall 1: setTimeout minimum delay
// Even setTimeout(fn, 0) has a minimum delay (~4ms in browsers)
// and must wait for the call stack to be empty

// Pitfall 2: setInterval drift
// setInterval doesn't account for execution time
setInterval(() => {
  // If this takes 50ms, next call isn't in 100ms,
  // it's in ~100ms from START (or immediately if overdue)
}, 100);

// Pitfall 3: Promise constructor is synchronous!
new Promise((resolve) => {
  console.log("This is synchronous!"); // runs immediately
  resolve("value");
});
// Only .then() callbacks are microtasks

// Pitfall 4: mixing await with forEach
// forEach does NOT await - use for...of instead
async function bad() {
  [1, 2, 3].forEach(async (n) => {
    await fetch(`/api/${n}`); // these all fire at once!
  });
}

async function good() {
  for (const n of [1, 2, 3]) {
    await fetch(`/api/${n}`); // sequential, one at a time
  }
}
