////////////////////////////////////////////////////////////////
// BASIC ASSIGNMENT (=)
////////////////////////////////////////////////////////////////

let x = 10;      // assign 10 to x
let y = x;       // assign value of x to y (copy, not reference for primitives)
let z = x + y;   // assign result of expression

// Multiple assignment (right to left)
let a, b, c;
a = b = c = 5; // c=5, then b=5, then a=5

////////////////////////////////////////////////////////////////
// ARITHMETIC ASSIGNMENT OPERATORS
////////////////////////////////////////////////////////////////

let n = 100;

n += 10;    // n = n + 10  → 110  (addition assignment)
n -= 20;    // n = n - 20  → 90   (subtraction assignment)
n *= 2;     // n = n * 2   → 180  (multiplication assignment)
n /= 3;     // n = n / 3   → 60   (division assignment)
n %= 7;     // n = n % 7   → 4    (remainder assignment)
n **= 3;    // n = n ** 3  → 64   (exponentiation assignment)

////////////////////////////////////////////////////////////////
// BITWISE ASSIGNMENT OPERATORS
////////////////////////////////////////////////////////////////

let bits = 0b1010; // 10 in binary

bits &= 0b1100;  // AND assignment   → 0b1000 (8)
bits |= 0b0011;  // OR assignment    → 0b1011 (11)
bits ^= 0b0101;  // XOR assignment   → 0b1110 (14)
bits <<= 1;       // Left shift      → 0b11100 (28)
bits >>= 2;       // Right shift     → 0b111 (7)
bits >>>= 1;      // Unsigned right shift → 0b11 (3)

////////////////////////////////////////////////////////////////
// LOGICAL ASSIGNMENT OPERATORS (ES2021)
////////////////////////////////////////////////////////////////

// ||= (OR assignment) - assigns if current value is falsy
let name = "";
name ||= "Anonymous"; // name = "Anonymous" (empty string is falsy)

let count = 0;
count ||= 10; // count = 10 (0 is falsy!)

// &&= (AND assignment) - assigns if current value is truthy
let user = { name: "Ana" };
user &&= { ...user, logged: true }; // { name: "Ana", logged: true }

let empty = null;
empty &&= "something"; // null (null is falsy, so no assignment)

// ??= (Nullish assignment) - assigns if current value is null or undefined
let config = null;
config ??= { debug: false }; // { debug: false }

let port = 0;
port ??= 3000; // 0 (0 is NOT null/undefined, so no assignment)

let host = undefined;
host ??= "localhost"; // "localhost"

////////////////////////////////////////////////////////////////
// ||= vs ??= COMPARISON
////////////////////////////////////////////////////////////////

// ||= treats 0, "", false, NaN as falsy → overwrites them
let a1 = 0;
a1 ||= 42;    // 42 (0 is falsy)

let a2 = "";
a2 ||= "hi";  // "hi" (empty string is falsy)

let a3 = false;
a3 ||= true;  // true (false is falsy)

// ??= only treats null and undefined → preserves 0, "", false
let b1 = 0;
b1 ??= 42;    // 0 (not null/undefined)

let b2 = "";
b2 ??= "hi";  // "" (not null/undefined)

let b3 = false;
b3 ??= true;  // false (not null/undefined)

////////////////////////////////////////////////////////////////
// DESTRUCTURING ASSIGNMENT
////////////////////////////////////////////////////////////////

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

// Object destructuring
const { name: userName, age = 25 } = { name: "Ana", city: "Madrid" };
// userName = "Ana", age = 25 (default)

// Swap variables
let p = 1, q = 2;
[p, q] = [q, p];
// p = 2, q = 1

////////////////////////////////////////////////////////////////
// ASSIGNMENT IN DIFFERENT CONTEXTS
////////////////////////////////////////////////////////////////

// Assignment returns the assigned value
let val;
console.log(val = 42); // 42 (assigns AND returns)

// Common in while loops
let line;
// while ((line = readline()) !== null) { ... }

// Chained property assignment
const obj = {};
obj.a = obj.b = obj.c = 0; // all properties set to 0

// Assignment vs comparison (common bug)
let x2 = 5;
// if (x2 = 10) { ... }  // BUG: assigns 10, always truthy!
// if (x2 === 10) { ... } // CORRECT: compares
