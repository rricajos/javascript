////////////////////////////////////////////////////////////////
// ARITHMETIC OPERATORS
////////////////////////////////////////////////////////////////

// Addition (+)
5 + 3;      // 8
0.1 + 0.2;  // 0.30000000000000004 (floating point precision!)

// Subtraction (-)
10 - 4;     // 6

// Multiplication (*)
3 * 7;      // 21

// Division (/)
10 / 3;     // 3.3333333333333335
10 / 0;     // Infinity
-10 / 0;    // -Infinity

// Modulus / Remainder (%)
10 % 3;     // 1   (remainder of 10 / 3)
7 % 2;      // 1   (odd number check)
8 % 2;      // 0   (even number check)
-7 % 3;     // -1  (sign follows the dividend)

// Exponentiation (**)
2 ** 3;     // 8   (2 to the power of 3)
9 ** 0.5;   // 3   (square root)
2 ** -1;    // 0.5 (1/2)

////////////////////////////////////////////////////////////////
// INCREMENT (++) / DECREMENT (--)
////////////////////////////////////////////////////////////////

// Postfix (x++ / x--): returns value THEN modifies
let a = 5;
let b = a++;  // b = 5, a = 6 (original value assigned first)

let c = 5;
let d = c--;  // d = 5, c = 4

// Prefix (++x / --x): modifies THEN returns value
let e = 5;
let f = ++e;  // f = 6, e = 6 (incremented before assignment)

let g = 5;
let h = --g;  // h = 4, g = 4

// Difference in loops
for (let i = 0; i < 3; i++) {
  console.log(i); // 0, 1, 2 (same result with ++i here)
}

// Where it matters
let x = 5;
console.log(x++); // 5 (logs, THEN increments)
console.log(x);   // 6

let y = 5;
console.log(++y); // 6 (increments, THEN logs)
console.log(y);   // 6

////////////////////////////////////////////////////////////////
// UNARY OPERATORS (+ and -)
////////////////////////////////////////////////////////////////

// Unary plus (+) - converts to number
+"42";       // 42
+true;       // 1
+false;      // 0
+null;       // 0
+undefined;  // NaN
+"hello";    // NaN
+"";         // 0

// Unary minus (-) - negates
-42;         // -42
-"42";       // -42
-true;       // -1

////////////////////////////////////////////////////////////////
// STRING CONCATENATION with +
////////////////////////////////////////////////////////////////

// + with strings concatenates instead of adding
"Hello" + " " + "World";  // "Hello World"
"Age: " + 25;             // "Age: 25" (number coerced to string)
5 + "3";                  // "53" (not 8!)
5 + 3 + "px";             // "8px" (left to right: 5+3=8, then 8+"px")
"$" + 5 + 3;              // "$53" (left to right: "$"+5="$5", then "$5"+3)

////////////////////////////////////////////////////////////////
// OPERATOR PRECEDENCE
////////////////////////////////////////////////////////////////

// Same as math: multiplication/division before addition/subtraction
2 + 3 * 4;     // 14  (not 20)
(2 + 3) * 4;   // 20  (parentheses override)

// Exponentiation is right-associative
2 ** 3 ** 2;    // 512 (2 ** 9, not 8 ** 2)
(2 ** 3) ** 2;  // 64

////////////////////////////////////////////////////////////////
// FLOATING POINT PRECISION
////////////////////////////////////////////////////////////////

// JavaScript uses IEEE 754 double-precision floats
0.1 + 0.2;                 // 0.30000000000000004
0.1 + 0.2 === 0.3;         // false!

// Fix: multiply then divide
(0.1 * 10 + 0.2 * 10) / 10; // 0.3

// Fix: toFixed (returns string)
(0.1 + 0.2).toFixed(2);     // "0.30"

// Fix: epsilon comparison
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON; // true

////////////////////////////////////////////////////////////////
// MATH OBJECT (useful arithmetic methods)
////////////////////////////////////////////////////////////////

Math.round(4.5);    // 5   (round to nearest integer)
Math.round(4.4);    // 4
Math.ceil(4.1);     // 5   (round up)
Math.floor(4.9);    // 4   (round down)
Math.trunc(4.9);    // 4   (remove decimals, no rounding)
Math.trunc(-4.9);   // -4

Math.abs(-42);      // 42  (absolute value)
Math.pow(2, 3);     // 8   (same as 2 ** 3)
Math.sqrt(16);      // 4   (square root)
Math.cbrt(27);      // 3   (cube root)

Math.max(1, 5, 3);  // 5
Math.min(1, 5, 3);  // 1

Math.random();      // 0.0 to 0.999...
Math.floor(Math.random() * 10);      // 0 to 9
Math.floor(Math.random() * 10) + 1;  // 1 to 10

// Random integer in range [min, max]
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
randomInt(5, 10); // 5, 6, 7, 8, 9, or 10
