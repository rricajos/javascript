////////////////////////////////////////////////////////////////
// TYPE COERCION — the actual rules JavaScript uses
////////////////////////////////////////////////////////////////

// JavaScript silently converts types in many operations.
// This is not random — there are precise rules. Knowing them
// turns "wtf" moments into predictable behavior.

////////////////////////////////////////////////////////////////
// 1. EXPLICIT COERCION — you're intentional about it
////////////////////////////////////////////////////////////////

// To Number
Number("42")        // 42
Number("")          // 0   — empty string becomes 0
Number(" ")         // 0   — whitespace-only string becomes 0
Number("3.14")      // 3.14
Number("0x1F")      // 31  — hex literal
Number(true)        // 1
Number(false)       // 0
Number(null)        // 0
Number(undefined)   // NaN — not a number
Number([])          // 0   — empty array → "" → 0
Number([3])         // 3   — single-element array → "3" → 3
Number([1, 2])      // NaN — "1,2" can't convert
Number({})          // NaN — "[object Object]" can't convert

// To String
String(42)          // "42"
String(true)        // "true"
String(null)        // "null"
String(undefined)   // "undefined"
String([1, 2, 3])   // "1,2,3"
String({})          // "[object Object]"

// To Boolean — know the 6 falsy values by heart
Boolean(0)          // false
Boolean(-0)         // false
Boolean(0n)         // false — BigInt zero
Boolean("")         // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(NaN)        // false
// EVERYTHING ELSE is truthy — including:
Boolean("0")        // true  — non-empty string, even "false"
Boolean([])         // true  — empty array
Boolean({})         // true  — empty object

////////////////////////////////////////////////////////////////
// 2. IMPLICIT COERCION — JavaScript decides
////////////////////////////////////////////////////////////////

// The + operator: string wins
"3" + 1         // "31" — 1 is coerced to string
1 + "3"         // "13" — same rule, left-to-right
1 + 2 + "3"     // "33" — 1+2=3 first, then 3+"3"="33"
"3" + 1 + 2     // "312" — "3"+1="31", then "31"+2="312"

// All other arithmetic: string → number
"10" - 3        // 7
"10" * 2        // 20
"10" / 2        // 5
"10" ** 2       // 100
"5" - true      // 4   — true → 1
null + 1        // 1   — null → 0
undefined + 1   // NaN — undefined → NaN

////////////////////////////////////////////////////////////////
// 3. THE == ABSTRACT EQUALITY ALGORITHM
////////////////////////////////////////////////////////////////

// == with same types → no coercion, same as ===
1 == 1          // true
"a" == "a"      // true

// null == undefined (and only each other — nothing else)
null == undefined   // true
null == 0           // false
null == ""          // false
null == false       // false

// boolean → number first, then compare
true == 1           // true  (true → 1)
false == 0          // true  (false → 0)
true == "1"         // true  (true → 1, "1" → 1)
false == ""         // true  (false → 0, "" → 0)
false == "0"        // true  (false → 0, "0" → 0)

// string == number → string converts to number
"5" == 5            // true  ("5" → 5)
"" == 0             // true  ("" → 0)
" " == 0            // true  (" " → 0)

// object == primitive → object uses valueOf() / toString()
[] == false         // true  ([] → "" → 0, false → 0)
[] == 0             // true  ([] → "" → 0)
[""] == false       // true  ([""] → "" → 0, false → 0)
[0] == false        // true  ([0] → "0" → 0, false → 0)

// The famous one:
[] == ![]           // true!
// [] == ![] → [] == false → [] → "" → 0 == 0 → true

// {} == false        // false — {} can't coerce to 0 (becomes NaN)

////////////////////////////////////////////////////////////////
// 4. OBJECT COERCION — valueOf and toString
////////////////////////////////////////////////////////////////

// When JS needs a primitive from an object, it calls:
// 1. valueOf() — returns a primitive directly if it can
// 2. toString() — fallback

const obj = {
  valueOf() { return 42; }
};
console.log(obj + 1);   // 43 — uses valueOf

const obj2 = {
  toString() { return "hello"; }
};
console.log(obj2 + "!"); // "hello!" — uses toString

// You can control how your objects coerce:
class Temperature {
  constructor(celsius) { this.celsius = celsius; }
  valueOf() { return this.celsius; }         // for arithmetic
  toString() { return `${this.celsius}°C`; } // for string context
}

const t = new Temperature(20);
console.log(t + 5);      // 25   (uses valueOf)
console.log(`Temp: ${t}`); // "Temp: 20°C" (uses toString)
console.log(t > 15);     // true  (uses valueOf)

////////////////////////////////////////////////////////////////
// 5. NaN — the only value not equal to itself
////////////////////////////////////////////////////////////////

NaN === NaN       // false — NaN is not equal to anything, including itself
NaN == NaN        // false — same

// Check for NaN properly:
Number.isNaN(NaN)       // true  — strict, only true for actual NaN
Number.isNaN("hello")   // false — does NOT coerce, unlike global isNaN()
isNaN("hello")          // true  — global isNaN coerces first: "hello" → NaN

// This matters for validation:
const input = "abc";
if (Number.isNaN(Number(input))) {
  console.log("Not a valid number"); // correct approach
}

////////////////////////////////////////////////////////////////
// 6. WHEN TO USE == vs ===
////////////////////////////////////////////////////////////////

// General rule: always use === unless you have a specific reason not to.

// The ONE legitimate use of ==: null/undefined check
function process(value) {
  if (value == null) {
    // This catches BOTH null and undefined — the only "safe" == usage
    return 'no value';
  }
  return value;
}

process(null);      // "no value"
process(undefined); // "no value"
process(0);         // 0 — not caught (0 != null)
process("");        // "" — not caught ("" != null)

// Equivalent explicit check:
if (value === null || value === undefined) { ... }

////////////////////////////////////////////////////////////////
// 7. THE +/- TRICK — quick type conversions
////////////////////////////////////////////////////////////////

// Unary + : fastest string-to-number conversion
+"5"          // 5
+true         // 1
+false        // 0
+null         // 0
+undefined    // NaN
+""           // 0
+[]           // 0

// Template literals always call toString():
`${[1, 2, 3]}`   // "1,2,3"
`${null}`         // "null"
`${undefined}`    // "undefined"
`${{}}`           // "[object Object]"
