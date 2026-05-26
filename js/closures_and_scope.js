////////////////////////////////////////////////////////////////
// SCOPE TYPES
////////////////////////////////////////////////////////////////

// 1. Global scope - accessible everywhere
var globalVar = "I'm global";
let globalLet = "I'm also global";
// window.globalVar works (var adds to window object)
// window.globalLet does NOT (let/const don't)

// 2. Function scope - accessible only inside the function
function myFunction() {
  var functionScoped = "only inside myFunction";
  let alsoFunctionScoped = "same here";
  console.log(functionScoped); // works
}
// console.log(functionScoped); // ReferenceError

// 3. Block scope - inside {} (only let/const, NOT var)
if (true) {
  let blockLet = "block scoped";
  const blockConst = "also block scoped";
  var notBlockScoped = "var ignores blocks!";
}
// console.log(blockLet);      // ReferenceError
// console.log(blockConst);    // ReferenceError
console.log(notBlockScoped);   // "var ignores blocks!" (var leaks out)

// 4. Module scope - each module has its own scope
// Variables in a module are NOT global unless exported

////////////////////////////////////////////////////////////////
// LEXICAL SCOPE (static scope)
////////////////////////////////////////////////////////////////

// JavaScript uses lexical scope: scope is determined by WHERE
// code is written, not where it's called from

const outer = "outer";

function outerFn() {
  const middle = "middle";

  function innerFn() {
    const inner = "inner";
    console.log(inner);   // own scope
    console.log(middle);  // parent scope
    console.log(outer);   // grandparent scope
  }

  innerFn();
}

// Scope chain: innerFn → outerFn → global
// Each function "remembers" the scope where it was DEFINED

////////////////////////////////////////////////////////////////
// CLOSURES
////////////////////////////////////////////////////////////////

// A closure is a function that "remembers" its lexical scope
// even when executed outside that scope

function createGreeter(greeting) {
  // greeting is "closed over" - the inner function remembers it
  return function(name) {
    console.log(greeting + ", " + name + "!");
  };
}

const hola = createGreeter("Hola");
const hello = createGreeter("Hello");

hola("Ana");    // "Hola, Ana!"
hello("Bob");   // "Hello, Bob!"
// greeting variable still accessible even after createGreeter returned

// Another example: counter
function createCounter() {
  let count = 0; // private variable, only accessible through returned functions

  return {
    increment: function() { return ++count; },
    decrement: function() { return --count; },
    getCount:  function() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
counter.getCount();  // 1
// count is private - no way to access it directly

////////////////////////////////////////////////////////////////
// CLOSURE USE CASES
////////////////////////////////////////////////////////////////

// 1. Data privacy / encapsulation
function createBankAccount(initialBalance) {
  let balance = initialBalance;

  return {
    deposit: function(amount) {
      if (amount > 0) balance += amount;
      return balance;
    },
    withdraw: function(amount) {
      if (amount > 0 && amount <= balance) balance -= amount;
      return balance;
    },
    getBalance: function() { return balance; }
  };
}

const account = createBankAccount(100);
account.deposit(50);     // 150
account.withdraw(30);    // 120
// account.balance;      // undefined (private!)

// 2. Function factories
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);
double(5);  // 10
triple(5);  // 15

// 3. Memoization (caching results)
function memoize(fn) {
  const cache = {}; // closed over

  return function(arg) {
    if (cache[arg] !== undefined) {
      console.log("From cache");
      return cache[arg];
    }
    const result = fn(arg);
    cache[arg] = result;
    return result;
  };
}

const slowSquare = memoize(function(n) {
  console.log("Computing...");
  return n * n;
});

slowSquare(5); // "Computing..." → 25
slowSquare(5); // "From cache" → 25

// 4. Event handlers with state
function setupButton(buttonId) {
  let clickCount = 0;

  document.getElementById(buttonId).addEventListener("click", function() {
    clickCount++;
    console.log(`Button clicked ${clickCount} times`);
  });
}

// 5. Partial application
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function add(a, b) { return a + b; }
const add5 = partial(add, 5);
add5(3); // 8

////////////////////////////////////////////////////////////////
// COMMON CLOSURE PITFALLS
////////////////////////////////////////////////////////////////

// Pitfall 1: var in loops (classic bug)
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3 (all share same 'i')
  }, 100);
}
// var is function-scoped, so all callbacks share the same 'i'
// By the time they run, the loop has finished and i === 3

// Fix 1: use let (block-scoped - each iteration gets its own 'i')
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2
  }, 100);
}

// Fix 2: use IIFE to capture each value
for (var i = 0; i < 3; i++) {
  (function(captured) {
    setTimeout(function() {
      console.log(captured); // 0, 1, 2
    }, 100);
  })(i);
}

// Pitfall 2: accidental shared state
function createFunctions() {
  const funcs = [];
  for (var i = 0; i < 3; i++) {
    funcs.push(function() { return i; });
  }
  return funcs;
}

const fns = createFunctions();
fns[0](); // 3 (not 0!)
fns[1](); // 3 (not 1!)
fns[2](); // 3 (not 2!)
// All closures share the same 'i' variable

// Pitfall 3: memory leaks - closures keep references alive
function createLeak() {
  const hugeData = new Array(1000000).fill("x");

  return function() {
    // Even if we never use hugeData, the closure keeps it in memory
    console.log("I exist");
  };
}
// Fix: null out references you don't need
function noLeak() {
  let hugeData = new Array(1000000).fill("x");
  const result = hugeData.length; // extract what you need
  hugeData = null; // allow garbage collection

  return function() {
    console.log("Size was:", result);
  };
}

////////////////////////////////////////////////////////////////
// IIFE (Immediately Invoked Function Expression)
////////////////////////////////////////////////////////////////

// Classic IIFE - creates a private scope
(function() {
  const private = "can't be accessed outside";
  console.log("IIFE runs immediately");
})();

// IIFE with return value
const module = (function() {
  let privateData = 0;

  return {
    increment: function() { privateData++; },
    getData: function() { return privateData; }
  };
})();

// Arrow function IIFE
(() => {
  console.log("Arrow IIFE");
})();

// IIFE with parameters
(function(window, document) {
  // Use window and document safely
  // Even if someone reassigns them globally
})(window, document);

////////////////////////////////////////////////////////////////
// HOISTING AND SCOPE INTERACTION
////////////////////////////////////////////////////////////////

// var declarations are hoisted (moved to top of function scope)
console.log(x); // undefined (not ReferenceError)
var x = 5;
// Equivalent to:
// var x;
// console.log(x); // undefined
// x = 5;

// let/const are hoisted but NOT initialized (Temporal Dead Zone)
// console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

// Function declarations are fully hoisted (name + body)
greet(); // works! "Hello"
function greet() { console.log("Hello"); }

// Function expressions are NOT fully hoisted
// hello(); // TypeError: hello is not a function
var hello = function() { console.log("Hello"); };

// const/let function expressions - TDZ error
// hi(); // ReferenceError
const hi = () => console.log("Hi");

////////////////////////////////////////////////////////////////
// this AND SCOPE
////////////////////////////////////////////////////////////////

// 'this' is NOT part of the scope chain
// It depends on HOW the function is called, not where it's defined

const obj = {
  name: "Ana",
  greet: function() {
    console.log(this.name); // "Ana" - this = obj

    // Problem: nested function loses 'this'
    function inner() {
      console.log(this.name); // undefined - this = window (or undefined in strict)
    }
    inner();
  }
};

// Fix 1: arrow function (inherits 'this' from enclosing scope - closure!)
const obj2 = {
  name: "Ana",
  greet: function() {
    const inner = () => {
      console.log(this.name); // "Ana" - arrow captures 'this'
    };
    inner();
  }
};

// Fix 2: save 'this' in a variable (old pattern)
const obj3 = {
  name: "Ana",
  greet: function() {
    const self = this; // closure over 'self'
    function inner() {
      console.log(self.name); // "Ana"
    }
    inner();
  }
};

// Fix 3: bind
const obj4 = {
  name: "Ana",
  greet: function() {
    const inner = function() {
      console.log(this.name); // "Ana"
    }.bind(this);
    inner();
  }
};
