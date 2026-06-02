////////////////////////////////////////////////////////////////
// FUNCTIONAL PATTERNS — tools you'll actually copy and use
////////////////////////////////////////////////////////////////

// Functional programming in JS is not about theory.
// These patterns solve real problems: avoiding mutation bugs,
// making functions reusable, and handling expensive operations efficiently.

////////////////////////////////////////////////////////////////
// 1. PURE FUNCTIONS — same input, same output, no side effects
////////////////////////////////////////////////////////////////

// Impure — depends on external state
let total = 0;
function addToTotal(n) {
  total += n; // mutates external variable — side effect
  return total;
}

// Pure — same inputs → same output, no external mutation
function add(a, b) {
  return a + b; // predictable, testable, cacheable
}

// Rule: pure functions are the building blocks of all patterns below.
// If it touches external state, it's impure.

// Pure array operations (return new array, don't mutate):
const nums = [1, 2, 3, 4, 5];
const doubled = nums.map(n => n * 2);   // [2, 4, 6, 8, 10] — new array
const evens = nums.filter(n => n % 2 === 0); // [2, 4] — new array
const sum = nums.reduce((acc, n) => acc + n, 0); // 15
// nums is untouched

////////////////////////////////////////////////////////////////
// 2. HIGHER-ORDER FUNCTIONS — functions that take/return functions
////////////////////////////////////////////////////////////////

// Takes a function:
function applyTwice(fn, value) {
  return fn(fn(value));
}
applyTwice(x => x * 2, 3); // 12 — doubles twice

// Returns a function:
function multiplier(factor) {
  return n => n * factor;
}

const double = multiplier(2);
const triple = multiplier(3);

double(5);  // 10
triple(5);  // 15
[1, 2, 3].map(double); // [2, 4, 6]

////////////////////////////////////////////////////////////////
// 3. CURRYING — transform f(a, b, c) into f(a)(b)(c)
////////////////////////////////////////////////////////////////

// Manual curry for a 2-argument function:
function add2(a) {
  return function(b) {
    return a + b;
  };
}

const add10 = add2(10); // partially applied
add10(5);  // 15
add10(20); // 30

// General curry utility:
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function(...moreArgs) {
      return curried(...args, ...moreArgs);
    };
  };
}

const curriedAdd = curry((a, b, c) => a + b + c);

curriedAdd(1)(2)(3);   // 6 — fully curried
curriedAdd(1, 2)(3);   // 6 — mixed
curriedAdd(1)(2, 3);   // 6 — mixed
curriedAdd(1, 2, 3);   // 6 — all at once

// Practical use — create specialized functions from general ones:
const curriedFilter = curry((predicate, arr) => arr.filter(predicate));
const filterEvens = curriedFilter(n => n % 2 === 0);

filterEvens([1, 2, 3, 4, 5]); // [2, 4]
filterEvens([10, 15, 20]);     // [10, 20]

////////////////////////////////////////////////////////////////
// 4. PARTIAL APPLICATION — fix some arguments now, rest later
////////////////////////////////////////////////////////////////

// bind() is partial application built-in:
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = greet.bind(null, 'Hello');
sayHello('Alice'); // "Hello, Alice!"
sayHello('Bob');   // "Hello, Bob!"

// Custom partial for any position:
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

const multiply = (a, b) => a * b;
const quadruple = partial(multiply, 4);
quadruple(5);  // 20
quadruple(10); // 40

////////////////////////////////////////////////////////////////
// 5. FUNCTION COMPOSITION — combine small functions into pipelines
////////////////////////////////////////////////////////////////

// compose: right-to-left execution (mathematical convention)
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// pipe: left-to-right execution (more readable for data pipelines)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const trim = s => s.trim();
const toLower = s => s.toLowerCase();
const toSlug = s => s.replace(/\s+/g, '-');

const slugify = pipe(trim, toLower, toSlug);

slugify('  Hello World  ');  // "hello-world"
slugify('  Functional JS '); // "functional-js"

// Each function is small, pure, and testable independently.
// Composition is what makes them powerful together.

// Real-world example — data transformation pipeline:
const processUsers = pipe(
  users => users.filter(u => u.active),
  users => users.map(u => ({ ...u, name: u.name.trim() })),
  users => users.sort((a, b) => a.name.localeCompare(b.name))
);

////////////////////////////////////////////////////////////////
// 6. MEMOIZATION — cache results of expensive calls
////////////////////////////////////////////////////////////////

// Basic memoize for single-argument pure functions:
function memoize(fn) {
  const cache = new Map();
  return function(arg) {
    if (cache.has(arg)) {
      return cache.get(arg); // cache hit — instant
    }
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

function slowFibonacci(n) {
  if (n <= 1) return n;
  return slowFibonacci(n - 1) + slowFibonacci(n - 2);
}

const fastFibonacci = memoize(function fib(n) {
  if (n <= 1) return n;
  return fastFibonacci(n - 1) + fastFibonacci(n - 2); // uses memoized version recursively
});

fastFibonacci(40); // milliseconds instead of seconds

// Memoize with multiple arguments using JSON key:
function memoizeMulti(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const memoizedAdd = memoizeMulti((a, b) => a + b);
memoizedAdd(2, 3); // 5 — computed
memoizedAdd(2, 3); // 5 — from cache

////////////////////////////////////////////////////////////////
// 7. ONCE — a function that can only run once
////////////////////////////////////////////////////////////////

function once(fn) {
  let called = false;
  let result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

const initDB = once(() => {
  console.log('DB initialized'); // only printed once, ever
  return { connected: true };
});

initDB(); // "DB initialized" → { connected: true }
initDB(); // { connected: true } — silent, returns cached result
initDB(); // { connected: true } — same

////////////////////////////////////////////////////////////////
// 8. THROTTLE & DEBOUNCE — control call frequency
////////////////////////////////////////////////////////////////

// Debounce: wait until X ms AFTER the last call
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Use for search inputs — only fires after user stops typing:
const search = debounce(query => console.log('Searching:', query), 300);
// search('j')     → timer set
// search('js')    → timer reset
// search('java')  → timer reset
// 300ms later  → fires once with 'java'

// Throttle: fire at most once every X ms
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  };
}

// Use for scroll/resize — fires regularly but not on every pixel:
const onScroll = throttle(() => console.log('scroll', window.scrollY), 100);
window.addEventListener('scroll', onScroll);

////////////////////////////////////////////////////////////////
// 9. IMMUTABLE UPDATE PATTERNS
////////////////////////////////////////////////////////////////

// Update a nested object without mutation:
const state = { user: { name: 'Alice', age: 30 }, theme: 'dark' };

// Spread to create a new object with one property changed:
const newState = {
  ...state,
  user: {
    ...state.user,
    age: 31          // only age changes
  }
};

// state is untouched — safe for React, Redux, etc.

// Update item in array without mutation:
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

const updatedUsers = users.map(u =>
  u.id === 2 ? { ...u, name: 'Bobby' } : u
);
// users is untouched, updatedUsers has the change
