////////////////////////////////////////////////////////////////
// ITERABLES & THE ITERATION PROTOCOL
////////////////////////////////////////////////////////////////

// An iterable is any object with a [Symbol.iterator]() method
// Built-in iterables: Array, String, Map, Set, NodeList, arguments

const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();

iterator.next(); // { value: 1, done: false }
iterator.next(); // { value: 2, done: false }
iterator.next(); // { value: 3, done: false }
iterator.next(); // { value: undefined, done: true }

// for...of works with any iterable
for (const item of [10, 20, 30]) {
  console.log(item); // 10, 20, 30
}

// Spread operator works with iterables
const nums = [...new Set([1, 2, 2, 3])]; // [1, 2, 3]

// Destructuring works with iterables
const [a, b, c] = "ABC"; // a="A", b="B", c="C"

// String is iterable (character by character)
for (const char of "Hello") {
  console.log(char); // H, e, l, l, o
}

// Map is iterable (key-value pairs)
const map = new Map([["a", 1], ["b", 2]]);
for (const [key, value] of map) {
  console.log(key, value); // a 1, b 2
}

////////////////////////////////////////////////////////////////
// CREATING CUSTOM ITERABLES
////////////////////////////////////////////////////////////////

// An object becomes iterable by implementing [Symbol.iterator]
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const n of range) {
  console.log(n); // 1, 2, 3, 4, 5
}

[...range]; // [1, 2, 3, 4, 5]

// Class-based iterable
class Fibonacci {
  constructor(limit) {
    this.limit = limit;
  }

  [Symbol.iterator]() {
    let prev = 0, curr = 1, count = 0;
    const limit = this.limit;

    return {
      next() {
        if (count >= limit) return { done: true };
        count++;
        const value = prev;
        [prev, curr] = [curr, prev + curr];
        return { value, done: false };
      }
    };
  }
}

const fib = new Fibonacci(8);
[...fib]; // [0, 1, 1, 2, 3, 5, 8, 13]

for (const n of new Fibonacci(5)) {
  console.log(n); // 0, 1, 1, 2, 3
}

////////////////////////////////////////////////////////////////
// GENERATORS (function*)
////////////////////////////////////////////////////////////////

// A generator is a function that can pause and resume execution
// Uses function* syntax and yield keyword

function* simpleGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = simpleGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Generators are iterable
for (const val of simpleGenerator()) {
  console.log(val); // 1, 2, 3
}

[...simpleGenerator()]; // [1, 2, 3]

// Generator with logic
function* countdown(start) {
  while (start > 0) {
    yield start;
    start--;
  }
}

[...countdown(5)]; // [5, 4, 3, 2, 1]

////////////////////////////////////////////////////////////////
// YIELD - PAUSING AND RESUMING
////////////////////////////////////////////////////////////////

function* conversation() {
  const name = yield "What is your name?";
  const age = yield `Hello ${name}! How old are you?`;
  yield `${name} is ${age} years old.`;
}

const chat = conversation();
chat.next();        // { value: "What is your name?", done: false }
chat.next("Ana");   // { value: "Hello Ana! How old are you?", done: false }
chat.next(30);      // { value: "Ana is 30 years old.", done: false }
chat.next();        // { value: undefined, done: true }

// The argument to next() becomes the result of the yield expression
// First next() call starts the generator (argument is ignored)

////////////////////////////////////////////////////////////////
// GENERATOR USE CASES
////////////////////////////////////////////////////////////////

// 1. Infinite sequences (lazy evaluation)
function* naturals() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

// Only generates values when asked
const nat = naturals();
nat.next().value; // 1
nat.next().value; // 2
nat.next().value; // 3
// Never runs out of memory - values are computed on demand

// Take first N values
function take(generator, n) {
  const result = [];
  for (const value of generator) {
    result.push(value);
    if (result.length >= n) break;
  }
  return result;
}

take(naturals(), 5); // [1, 2, 3, 4, 5]

// 2. Unique ID generator
function* idGenerator(prefix) {
  let id = 0;
  while (true) {
    yield `${prefix}-${++id}`;
  }
}

const userId = idGenerator("user");
userId.next().value; // "user-1"
userId.next().value; // "user-2"

// 3. Paginated data fetcher
function* paginate(fetchFn, pageSize) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = yield fetchFn(page, pageSize);
    hasMore = data && data.length === pageSize;
    page++;
  }
}

// 4. State machine
function* trafficLight() {
  while (true) {
    yield "green";
    yield "yellow";
    yield "red";
  }
}

const light = trafficLight();
light.next().value; // "green"
light.next().value; // "yellow"
light.next().value; // "red"
light.next().value; // "green" (repeats)

////////////////////////////////////////////////////////////////
// GENERATOR CONTROL: return() and throw()
////////////////////////////////////////////////////////////////

function* controlled() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log("Cleanup!");
  }
}

const g = controlled();
g.next();           // { value: 1, done: false }
g.return("early");  // "Cleanup!" → { value: "early", done: true }
g.next();           // { value: undefined, done: true }

// throw() sends an error into the generator
function* errorHandler() {
  try {
    const value = yield "waiting...";
    console.log("Got:", value);
  } catch (err) {
    console.log("Error caught inside generator:", err.message);
  }
}

const eh = errorHandler();
eh.next();                          // { value: "waiting...", done: false }
eh.throw(new Error("Something broke")); // "Error caught inside generator: Something broke"

////////////////////////////////////////////////////////////////
// yield* (DELEGATION)
////////////////////////////////////////////////////////////////

// yield* delegates to another generator or iterable
function* inner() {
  yield "a";
  yield "b";
}

function* outer() {
  yield 1;
  yield* inner();   // delegates to inner generator
  yield 2;
  yield* [3, 4, 5]; // delegates to array (any iterable)
}

[...outer()]; // [1, "a", "b", 2, 3, 4, 5]

// Recursive generator (tree traversal)
function* walkTree(node) {
  yield node.value;
  if (node.children) {
    for (const child of node.children) {
      yield* walkTree(child); // recursive delegation
    }
  }
}

const tree = {
  value: "root",
  children: [
    { value: "child1", children: [{ value: "grandchild1" }] },
    { value: "child2" }
  ]
};

[...walkTree(tree)]; // ["root", "child1", "grandchild1", "child2"]

////////////////////////////////////////////////////////////////
// ASYNC GENERATORS (async function*)
////////////////////////////////////////////////////////////////

// Combine generators with async/await for async iteration
async function* fetchPages(url) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();

    yield data.items;

    hasMore = data.hasMore;
    page++;
  }
}

// Use with for await...of
async function processAllPages() {
  for await (const items of fetchPages("/api/data")) {
    console.log("Page items:", items.length);
  }
}

// Async generator for streaming data
async function* streamLines(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) yield line;
    }
  }

  if (buffer.trim()) yield buffer; // last line
}

// Async generator for intervals
async function* interval(ms) {
  let i = 0;
  while (true) {
    await new Promise(resolve => setTimeout(resolve, ms));
    yield i++;
  }
}

// Use: for await (const tick of interval(1000)) { ... }

////////////////////////////////////////////////////////////////
// ITERATORS vs GENERATORS COMPARISON
////////////////////////////////////////////////////////////////

// Iterator (manual): more verbose, full control
const manualIterator = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return i < 3
          ? { value: i++, done: false }
          : { done: true };
      }
    };
  }
};

// Generator (automatic): cleaner syntax, same result
function* generatorVersion() {
  for (let i = 0; i < 3; i++) {
    yield i;
  }
}

[...manualIterator];       // [0, 1, 2]
[...generatorVersion()];   // [0, 1, 2]
