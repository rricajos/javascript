////////////////////////////////////////////////////////////////
// IF / ELSE IF / ELSE
////////////////////////////////////////////////////////////////

let score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else if (score >= 70) {
  console.log("C");
} else {
  console.log("F");
}
// Output: "B"

////////////////////////////////////////////////////////////////
// SWITCH
////////////////////////////////////////////////////////////////

let day = "Monday";

switch (day) {
  case "Monday":
  case "Tuesday":
  case "Wednesday":
  case "Thursday":
  case "Friday":
    console.log("Weekday");
    break;
  case "Saturday":
  case "Sunday":
    console.log("Weekend");
    break;
  default:
    console.log("Invalid day");
}
// Output: "Weekday"

// switch uses strict comparison (===)
switch (1) {
  case "1":
    console.log("string"); // not executed
    break;
  case 1:
    console.log("number"); // executed
    break;
}

////////////////////////////////////////////////////////////////
// FOR LOOP
////////////////////////////////////////////////////////////////

for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}

// Multiple variables
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j); // 0 10, 1 9, 2 8, 3 7, 4 6
}

////////////////////////////////////////////////////////////////
// WHILE LOOP
////////////////////////////////////////////////////////////////

let count = 0;
while (count < 5) {
  console.log(count); // 0, 1, 2, 3, 4
  count++;
}

////////////////////////////////////////////////////////////////
// DO...WHILE LOOP (executes at least once)
////////////////////////////////////////////////////////////////

let num = 10;
do {
  console.log(num); // 10 (executes once even though condition is false)
  num++;
} while (num < 5);

////////////////////////////////////////////////////////////////
// FOR...IN (iterates over object keys / array indices)
////////////////////////////////////////////////////////////////

const person = { name: "Ana", age: 30, city: "Madrid" };

for (let key in person) {
  console.log(`${key}: ${person[key]}`);
}
// "name: Ana"
// "age: 30"
// "city: Madrid"

// for...in with arrays (iterates over indices as strings)
const fruits = ["apple", "banana", "cherry"];
for (let index in fruits) {
  console.log(index, fruits[index]); // "0" "apple", "1" "banana", "2" "cherry"
}
// Warning: for...in is not recommended for arrays (use for...of instead)

////////////////////////////////////////////////////////////////
// FOR...OF (iterates over iterable values: arrays, strings, Maps, Sets)
////////////////////////////////////////////////////////////////

const colors = ["red", "green", "blue"];
for (let color of colors) {
  console.log(color); // "red", "green", "blue"
}

// for...of with strings
for (let char of "Hello") {
  console.log(char); // "H", "e", "l", "l", "o"
}

// for...of with Map
const map = new Map([["a", 1], ["b", 2]]);
for (let [key, value] of map) {
  console.log(key, value); // "a" 1, "b" 2
}

// for...of with Set
const set = new Set([1, 2, 3, 3, 4]);
for (let value of set) {
  console.log(value); // 1, 2, 3, 4
}

////////////////////////////////////////////////////////////////
// BREAK (exits the loop entirely)
////////////////////////////////////////////////////////////////

for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i); // 0, 1, 2, 3, 4
}

////////////////////////////////////////////////////////////////
// CONTINUE (skips current iteration)
////////////////////////////////////////////////////////////////

for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue; // skip even numbers
  console.log(i); // 1, 3, 5, 7, 9
}

////////////////////////////////////////////////////////////////
// LABELED STATEMENTS (break/continue with labels)
////////////////////////////////////////////////////////////////

outer: for (let i = 0; i < 3; i++) {
  inner: for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer; // breaks both loops
    console.log(i, j);
  }
}
// 0 0, 0 1, 0 2, 1 0

////////////////////////////////////////////////////////////////
// TERNARY OPERATOR (shorthand if/else)
////////////////////////////////////////////////////////////////

let age2 = 20;
let status = age2 >= 18 ? "adult" : "minor"; // "adult"

// Nested ternary (use sparingly for readability)
let grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";

////////////////////////////////////////////////////////////////
// OPTIONAL CHAINING (?.)
////////////////////////////////////////////////////////////////

const user = {
  name: "Ana",
  address: {
    street: "Main St"
  }
};

console.log(user.address?.street);   // "Main St"
console.log(user.address?.zipCode);  // undefined (no error)
console.log(user.phone?.number);     // undefined (no error)

// With methods
const arr = [1, 2, 3];
console.log(arr.find?.(x => x > 2)); // 3
console.log(arr.nonExistent?.()); // undefined

////////////////////////////////////////////////////////////////
// NULLISH COALESCING (??)
////////////////////////////////////////////////////////////////

// Returns right side only if left side is null or undefined
let val1 = null ?? "default";      // "default"
let val2 = undefined ?? "default"; // "default"
let val3 = 0 ?? "default";        // 0 (0 is not null/undefined)
let val4 = "" ?? "default";       // "" (empty string is not null/undefined)
let val5 = false ?? "default";    // false

// Compare with || (OR) which treats 0, "", false as falsy
let val6 = 0 || "default";        // "default" (0 is falsy)
let val7 = "" || "default";       // "default" ("" is falsy)

////////////////////////////////////////////////////////////////
// LOGICAL ASSIGNMENT OPERATORS
////////////////////////////////////////////////////////////////

// ||= assigns if current value is falsy
let a = null;
a ||= "hello"; // a = "hello"

// &&= assigns if current value is truthy
let b = "world";
b &&= "hello"; // b = "hello"

// ??= assigns if current value is null or undefined
let c = undefined;
c ??= "hello"; // c = "hello"

let d = 0;
d ??= 42; // d = 0 (0 is not null/undefined)
