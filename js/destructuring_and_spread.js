////////////////////////////////////////////////////////////////
// ARRAY DESTRUCTURING
////////////////////////////////////////////////////////////////

const colors = ["red", "green", "blue", "yellow"];

// Basic
const [first, second] = colors;
// first = "red", second = "green"

// Skip elements
const [, , third] = colors;
// third = "blue"

// Rest pattern
const [head, ...tail] = colors;
// head = "red", tail = ["green", "blue", "yellow"]

// Default values
const [a = "default", b = "default"] = ["hello"];
// a = "hello", b = "default"

// Swap variables
let x = 1, y = 2;
[x, y] = [y, x];
// x = 2, y = 1

// Nested destructuring
const matrix = [[1, 2], [3, 4]];
const [[a1, a2], [b1, b2]] = matrix;
// a1 = 1, a2 = 2, b1 = 3, b2 = 4

////////////////////////////////////////////////////////////////
// OBJECT DESTRUCTURING
////////////////////////////////////////////////////////////////

const user = {
  name: "Ana",
  age: 30,
  city: "Madrid",
  country: "Spain"
};

// Basic
const { name, age } = user;
// name = "Ana", age = 30

// Rename variables (alias)
const { name: userName, age: userAge } = user;
// userName = "Ana", userAge = 30

// Default values
const { name: n, role = "user" } = user;
// n = "Ana", role = "user" (not in object, uses default)

// Rest pattern
const { name: nombre, ...rest } = user;
// nombre = "Ana", rest = { age: 30, city: "Madrid", country: "Spain" }

// Nested destructuring
const company = {
  name: "TechCorp",
  address: {
    street: "Main St",
    city: "Barcelona",
    coords: { lat: 41.38, lng: 2.17 }
  }
};

const { address: { city, coords: { lat, lng } } } = company;
// city = "Barcelona", lat = 41.38, lng = 2.17

// Destructuring in function parameters
function greet({ name, age, role = "guest" }) {
  console.log(`${name}, ${age}, ${role}`);
}

greet({ name: "Ana", age: 30 }); // "Ana, 30, guest"

// With default parameter
function createUser({ name = "Anonymous", age = 0 } = {}) {
  return { name, age };
}

createUser();                    // { name: "Anonymous", age: 0 }
createUser({ name: "Ana" });     // { name: "Ana", age: 0 }

////////////////////////////////////////////////////////////////
// COMPUTED PROPERTY DESTRUCTURING
////////////////////////////////////////////////////////////////

const key = "name";
const { [key]: value } = user;
// value = "Ana"

////////////////////////////////////////////////////////////////
// SPREAD OPERATOR (...)
////////////////////////////////////////////////////////////////

// Spread in arrays (expand elements)
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

const combined = [...arr1, ...arr2];     // [1, 2, 3, 4, 5, 6]
const withExtra = [0, ...arr1, 3.5, ...arr2]; // [0, 1, 2, 3, 3.5, 4, 5, 6]

// Copy array (shallow)
const copy = [...arr1]; // [1, 2, 3]

// Spread in objects (expand properties)
const defaults = { theme: "light", lang: "en", fontSize: 14 };
const userPrefs = { theme: "dark", fontSize: 16 };

const settings = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "en", fontSize: 16 }
// Later spreads override earlier ones

// Copy object (shallow)
const userCopy = { ...user };

// Add/override properties
const updatedUser = { ...user, age: 31, email: "ana@mail.com" };

// Spread in function calls
const numbers = [5, 2, 8, 1, 9];
Math.max(...numbers);   // 9
Math.min(...numbers);   // 1

// Spread string into array
const chars = [..."Hello"]; // ["H", "e", "l", "l", "o"]

////////////////////////////////////////////////////////////////
// REST PARAMETERS (opposite of spread - collects into array)
////////////////////////////////////////////////////////////////

// In functions
function sum(...nums) {
  return nums.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4); // 10

// Combine with regular params (rest must be last)
function log(level, ...messages) {
  messages.forEach(msg => console.log(`[${level}] ${msg}`));
}
log("ERROR", "Not found", "Try again");
// [ERROR] Not found
// [ERROR] Try again

// In destructuring (arrays)
const [first2, ...others] = [1, 2, 3, 4, 5];
// first2 = 1, others = [2, 3, 4, 5]

// In destructuring (objects)
const { name: n2, ...remaining } = { name: "Ana", age: 30, city: "Madrid" };
// n2 = "Ana", remaining = { age: 30, city: "Madrid" }

////////////////////////////////////////////////////////////////
// PRACTICAL PATTERNS
////////////////////////////////////////////////////////////////

// Merge objects with defaults
function createConfig(options) {
  const defaults = {
    debug: false,
    verbose: false,
    maxRetries: 3,
    timeout: 5000
  };
  return { ...defaults, ...options };
}

createConfig({ debug: true, timeout: 10000 });
// { debug: true, verbose: false, maxRetries: 3, timeout: 10000 }

// Remove a property immutably
const { age: _, ...withoutAge } = { name: "Ana", age: 30, city: "Madrid" };
// withoutAge = { name: "Ana", city: "Madrid" }

// Conditional properties
const includeEmail = true;
const profile = {
  name: "Ana",
  ...(includeEmail && { email: "ana@mail.com" })
};
// { name: "Ana", email: "ana@mail.com" }

// Clone and modify nested objects (shallow spread doesn't deep clone)
const original = { name: "Ana", address: { city: "Madrid" } };
const modified = {
  ...original,
  address: { ...original.address, city: "Barcelona" }
};
// original.address.city is still "Madrid"

// Destructure function return values
function getCoords() {
  return { lat: 41.38, lng: 2.17 };
}
const { lat: latitude, lng: longitude } = getCoords();

// Destructure from arrays returned by functions
function minMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}
const [min, max] = minMax([3, 1, 4, 1, 5]); // min = 1, max = 5
