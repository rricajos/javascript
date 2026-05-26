////////////////////////////////////////////////////////////////
// NOT OPERATOR (!)
////////////////////////////////////////////////////////////////

!true;       // false
!false;      // true

// NOT with non-booleans (converts to boolean first)
!0;          // true   (0 is falsy)
!1;          // false  (1 is truthy)
!"";         // true   (empty string is falsy)
!"hello";    // false  (non-empty string is truthy)
!null;       // true   (null is falsy)
!undefined;  // true   (undefined is falsy)
!NaN;        // true   (NaN is falsy)
![];         // false  (empty array is truthy!)
!{};         // false  (empty object is truthy!)

// Double NOT (!!) - converts to boolean
!!0;         // false
!!"hello";   // true
!!null;      // false
!![];        // true
// Same as Boolean(value)

////////////////////////////////////////////////////////////////
// AND OPERATOR (&&) - short-circuit evaluation
////////////////////////////////////////////////////////////////

// Truth table
true  && true;   // true
true  && false;  // false
false && true;   // false
false && false;  // false

// Short-circuit: if first is falsy, returns it (doesn't evaluate second)
false && console.log("never runs"); // false (console.log not executed)
0 && "hello";     // 0
"" && "hello";    // ""
null && "hello";  // null

// If first is truthy, returns the second value
true && "hello";  // "hello"
1 && "hello";     // "hello"
"hi" && "hello";  // "hello"

// Practical use: guard clauses
const user = { name: "Ana" };
const name = user && user.name;     // "Ana"
const missing = null && null.name;  // null (no error!)

// Modern alternative: optional chaining (?.)
const name2 = user?.name;           // "Ana"

////////////////////////////////////////////////////////////////
// OR OPERATOR (||) - short-circuit evaluation
////////////////////////////////////////////////////////////////

// Truth table
true  || true;   // true
true  || false;  // true
false || true;   // true
false || false;  // false

// Short-circuit: if first is truthy, returns it (doesn't evaluate second)
true || console.log("never runs");  // true
"hello" || "world";   // "hello"
1 || 0;               // 1

// If first is falsy, returns the second value
false || "fallback";  // "fallback"
0 || 42;              // 42
"" || "default";      // "default"
null || "backup";     // "backup"

// Practical use: default values
function greet(name) {
  name = name || "Guest";
  console.log(`Hello, ${name}!`);
}
greet("Ana");    // "Hello, Ana!"
greet("");       // "Hello, Guest!" (empty string is falsy - might be a bug!)
greet(undefined); // "Hello, Guest!"

// Problem with ||: treats 0, "", false as falsy
const port = 0 || 3000;  // 3000 (but 0 was intentional!)

////////////////////////////////////////////////////////////////
// NULLISH COALESCING (??) - only null/undefined
////////////////////////////////////////////////////////////////

// Only returns right side if left is null or undefined
null ?? "default";       // "default"
undefined ?? "default";  // "default"
0 ?? "default";          // 0 (preserved!)
"" ?? "default";         // "" (preserved!)
false ?? "default";      // false (preserved!)

// Fix the port problem:
const port2 = 0 ?? 3000;  // 0 (correct!)

////////////////////////////////////////////////////////////////
// COMPARISON: || vs ??
////////////////////////////////////////////////////////////////

// ||  → fallback for ANY falsy value (0, "", false, null, undefined, NaN)
// ??  → fallback ONLY for null and undefined

0 || 10;          // 10
0 ?? 10;          // 0

"" || "default";  // "default"
"" ?? "default";  // ""

false || true;    // true
false ?? true;    // false

////////////////////////////////////////////////////////////////
// LOGICAL COMBINATIONS
////////////////////////////////////////////////////////////////

// Combining AND + OR (AND has higher precedence)
true || false && false;   // true (evaluated as: true || (false && false))
(true || false) && false; // false (parentheses change order)

// Complex conditions
const age = 25;
const hasLicense = true;
const isEmergency = false;

const canDrive = (age >= 18 && hasLicense) || isEmergency;
// true: (25 >= 18 && true) || false → (true && true) || false → true

////////////////////////////////////////////////////////////////
// FALSY vs TRUTHY - complete reference
////////////////////////////////////////////////////////////////

// FALSY values (7 total):
// false, 0, -0, 0n (BigInt zero), "", null, undefined, NaN

// TRUTHY: everything else, including:
// true, any number except 0, any non-empty string
// [] (empty array), {} (empty object)
// "0" (string zero), "false" (string false)
// new Date(), Infinity, -Infinity

// Gotchas
Boolean([]);       // true  (empty array is truthy!)
Boolean({});       // true  (empty object is truthy!)
Boolean("0");      // true  ("0" is a non-empty string)
Boolean("false");  // true  ("false" is a non-empty string)
Boolean(" ");      // true  (space is a non-empty string)
