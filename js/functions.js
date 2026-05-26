////////////////////////////////////////////////////////////////
// FUNCTION DECLARATION (hoisted - can be called before definition)
////////////////////////////////////////////////////////////////

sayHello(); // works! function declarations are hoisted

function sayHello() {
  console.log("Hello!");
}

////////////////////////////////////////////////////////////////
// FUNCTION EXPRESSION (NOT hoisted)
////////////////////////////////////////////////////////////////

// const greet = function() { ... }  // anonymous
const greet = function greeting() {
  console.log("Hi!");
};

// greet(); // works
// greeting(); // ReferenceError - name only accessible inside function

////////////////////////////////////////////////////////////////
// ARROW FUNCTIONS (ES6)
////////////////////////////////////////////////////////////////

// Standard syntax
const add = (a, b) => {
  return a + b;
};

// Implicit return (single expression)
const multiply = (a, b) => a * b;

// Single parameter (no parentheses needed)
const double = x => x * 2;

// No parameters
const getRandom = () => Math.random();

// Returning an object (wrap in parentheses)
const createUser = (name, age) => ({ name, age });

// Arrow functions do NOT have their own 'this'
const obj = {
  name: "Ana",
  // regular function: 'this' refers to obj
  greet: function() {
    console.log(this.name); // "Ana"
  },
  // arrow function: 'this' refers to outer scope
  greetArrow: () => {
    console.log(this.name); // undefined (this = window/global)
  }
};

////////////////////////////////////////////////////////////////
// DEFAULT PARAMETERS
////////////////////////////////////////////////////////////////

function power(base, exponent = 2) {
  return base ** exponent;
}

power(3);    // 9  (exponent defaults to 2)
power(3, 3); // 27

////////////////////////////////////////////////////////////////
// REST PARAMETERS (...args)
////////////////////////////////////////////////////////////////

function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);       // 6
sum(1, 2, 3, 4, 5); // 15

// Rest must be the last parameter
function logFirst(first, ...rest) {
  console.log("First:", first);  // "First: 1"
  console.log("Rest:", rest);    // "Rest: [2, 3, 4]"
}

logFirst(1, 2, 3, 4);

////////////////////////////////////////////////////////////////
// CALLBACKS
////////////////////////////////////////////////////////////////

function doSomething(callback) {
  let result = 42;
  callback(result);
}

doSomething(function(value) {
  console.log("Got:", value); // "Got: 42"
});

// With arrow function
doSomething(value => console.log("Got:", value));

// Array methods use callbacks
[1, 2, 3].forEach(item => console.log(item));
[1, 2, 3].map(item => item * 2);    // [2, 4, 6]
[1, 2, 3].filter(item => item > 1); // [2, 3]

////////////////////////////////////////////////////////////////
// CLOSURES (function that remembers its outer scope)
////////////////////////////////////////////////////////////////

function createCounter() {
  let count = 0; // private variable
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
counter.getCount();  // 1
// count is not accessible from outside

// Closure in a loop (common pitfall)
// Wrong: var captures the same reference
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}

// Correct: let creates a new scope per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}

////////////////////////////////////////////////////////////////
// IIFE (Immediately Invoked Function Expression)
////////////////////////////////////////////////////////////////

// Classic IIFE
(function() {
  let secret = "hidden";
  console.log(secret); // "hidden"
})();
// secret is not accessible here

// Arrow IIFE
(() => {
  console.log("Executed immediately!");
})();

// IIFE with parameters
(function(name) {
  console.log(`Hello, ${name}!`);
})("World");

////////////////////////////////////////////////////////////////
// HIGHER-ORDER FUNCTIONS (functions that take/return functions)
////////////////////////////////////////////////////////////////

// Function that returns a function
function multiplier(factor) {
  return (number) => number * factor;
}

const triple = multiplier(3);
const tenTimes = multiplier(10);

triple(5);   // 15
tenTimes(5); // 50

// Function that takes a function
function applyOperation(a, b, operation) {
  return operation(a, b);
}

applyOperation(5, 3, (a, b) => a + b); // 8
applyOperation(5, 3, (a, b) => a * b); // 15

////////////////////////////////////////////////////////////////
// RECURSION
////////////////////////////////////////////////////////////////

// Factorial: n! = n * (n-1) * (n-2) * ... * 1
function factorial(n) {
  if (n <= 1) return 1; // base case
  return n * factorial(n - 1); // recursive case
}

factorial(5); // 120 (5 * 4 * 3 * 2 * 1)

// Fibonacci
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

fibonacci(7); // 13 (0, 1, 1, 2, 3, 5, 8, 13)

////////////////////////////////////////////////////////////////
// GENERATOR FUNCTIONS
////////////////////////////////////////////////////////////////

function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const gen = idGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }

// Finite generator
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

for (let num of range(1, 5)) {
  console.log(num); // 1, 2, 3, 4, 5
}

////////////////////////////////////////////////////////////////
// FUNCTION METHODS: call, apply, bind
////////////////////////////////////////////////////////////////

function introduce(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

const user = { name: "Ana" };

// call - invokes with explicit 'this', args passed individually
introduce.call(user, "Hi");    // "Hi, I'm Ana"

// apply - invokes with explicit 'this', args passed as array
introduce.apply(user, ["Hey"]); // "Hey, I'm Ana"

// bind - returns NEW function with bound 'this' (does not invoke)
const boundIntroduce = introduce.bind(user);
boundIntroduce("Hello"); // "Hello, I'm Ana"
