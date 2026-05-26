////////////////////////////////////////////////////////////////
// TERNARY OPERATOR (? :) - shorthand if/else
////////////////////////////////////////////////////////////////

// Syntax: condition ? valueIfTrue : valueIfFalse
const age = 20;
const status = age >= 18 ? "adult" : "minor"; // "adult"

// Equivalent if/else:
// let status;
// if (age >= 18) { status = "adult"; }
// else { status = "minor"; }

// With function calls
const isEven = 4 % 2 === 0 ? "even" : "odd"; // "even"

// Inline in template literals
console.log(`You are ${age >= 18 ? "an adult" : "a minor"}`);

// In function returns
function getDiscount(isMember) {
  return isMember ? 0.2 : 0;
}
getDiscount(true);  // 0.2
getDiscount(false); // 0

// Assign based on condition
const theme = localStorage.getItem("theme") ? localStorage.getItem("theme") : "light";

////////////////////////////////////////////////////////////////
// NESTED TERNARY (use sparingly!)
////////////////////////////////////////////////////////////////

const score = 85;

// Nested ternary
const grade = score >= 90 ? "A"
            : score >= 80 ? "B"
            : score >= 70 ? "C"
            : score >= 60 ? "D"
            : "F";
// "B"

// This is often clearer as if/else or switch
// Only use nested ternaries for simple, readable cases

////////////////////////////////////////////////////////////////
// TERNARY vs && (short-circuit)
////////////////////////////////////////////////////////////////

// Ternary: when you need BOTH true and false cases
const message = isLoggedIn ? "Welcome back!" : "Please log in";

// && short-circuit: when you only need the TRUE case
isLoggedIn && showDashboard(); // only calls if true, returns false otherwise

// || short-circuit: when you only need the FALSE case (default value)
const name = inputName || "Anonymous";

////////////////////////////////////////////////////////////////
// NULLISH COALESCING OPERATOR (??)
////////////////////////////////////////////////////////////////

// Returns right side ONLY if left side is null or undefined
// (NOT for other falsy values like 0, "", false)

let result;

result = null ?? "default";       // "default"
result = undefined ?? "default";  // "default"
result = 0 ?? "default";          // 0 (0 is not null/undefined!)
result = "" ?? "default";         // "" (empty string is not null/undefined!)
result = false ?? "default";      // false

// Practical: safe default values that preserve 0, "", false
const config = {
  timeout: 0,
  verbose: false,
  prefix: ""
};

const timeout = config.timeout ?? 5000;   // 0 (preserved!)
const verbose = config.verbose ?? true;   // false (preserved!)
const prefix = config.prefix ?? "app";    // "" (preserved!)

// Compare with || (loses intentional falsy values)
const timeout2 = config.timeout || 5000;  // 5000 (0 was overwritten!)
const verbose2 = config.verbose || true;  // true (false was overwritten!)

////////////////////////////////////////////////////////////////
// OPTIONAL CHAINING (?.)
////////////////////////////////////////////////////////////////

const user = {
  name: "Ana",
  address: {
    street: "Main St",
    city: "Madrid"
  },
  getFullName() {
    return this.name;
  }
};

// Property access
user.address?.street;      // "Main St"
user.address?.zipCode;     // undefined (no error)
user.phone?.number;        // undefined (no error)
user.phone.number;         // TypeError! (without ?.)

// Nested chaining
user.address?.coords?.lat; // undefined (no error at any level)

// Method calls
user.getFullName?.();      // "Ana"
user.nonExistent?.();      // undefined (no error)

// Array element access
const arr = [1, 2, 3];
arr?.[0];                  // 1
arr?.[99];                 // undefined
null?.[0];                 // undefined

// Combined with ?? for defaults
const city = user.address?.city ?? "Unknown"; // "Madrid"
const zip = user.address?.zip ?? "N/A";       // "N/A"

////////////////////////////////////////////////////////////////
// CHAINING ?. + ?? TOGETHER
////////////////////////////////////////////////////////////////

// Common pattern: safely access nested data with fallback
const response = {
  data: {
    users: [
      { name: "Ana", settings: { theme: "dark" } },
      { name: "Luis", settings: null }
    ]
  }
};

const theme1 = response.data?.users?.[0]?.settings?.theme ?? "light"; // "dark"
const theme2 = response.data?.users?.[1]?.settings?.theme ?? "light"; // "light"
const theme3 = response.data?.users?.[5]?.settings?.theme ?? "light"; // "light"

////////////////////////////////////////////////////////////////
// COMMA OPERATOR (,) - evaluates both, returns last
////////////////////////////////////////////////////////////////

// Rarely used, but valid
const val = (1 + 2, 3 + 4); // 7 (first expression discarded)

// Common in for loops
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j); // 0 10, 1 9, 2 8, 3 7, 4 6
}

////////////////////////////////////////////////////////////////
// COMPARISON OPERATORS (for reference)
////////////////////////////////////////////////////////////////

// Equality
5 == "5";       // true  (loose: type coercion)
5 === "5";      // false (strict: no coercion)
5 != "5";       // false (loose)
5 !== "5";      // true  (strict)

// Relational
5 > 3;          // true
5 >= 5;         // true
3 < 5;          // true
3 <= 3;         // true

// String comparison (lexicographic / Unicode order)
"apple" < "banana";   // true
"Banana" < "apple";   // true (uppercase < lowercase)
"10" < "9";            // true (string comparison, "1" < "9")

// Always use === unless you have a specific reason for ==
// The only acceptable use of == is checking for null/undefined:
if (value == null) {
  // catches both null and undefined
}
