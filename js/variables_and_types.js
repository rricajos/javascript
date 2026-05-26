////////////////////////////////////////////////////////////////
// VARIABLES: var, let, const
////////////////////////////////////////////////////////////////

// var - function scoped, hoisted, can be redeclared
var name = "JavaScript";
var name = "JS"; // no error, redeclared

// let - block scoped, not hoisted, cannot be redeclared
let age = 30;
// let age = 25; // SyntaxError: Identifier 'age' has already been declared

// const - block scoped, not hoisted, cannot be reassigned
const PI = 3.14159;
// PI = 3; // TypeError: Assignment to constant variable

// const with objects/arrays - the reference is constant, not the content
const user = { name: "Ana" };
user.name = "Luis"; // works fine, modifying property
// user = {}; // TypeError: Assignment to constant variable

const colors = ["red", "green"];
colors.push("blue"); // works fine, modifying array content
// colors = []; // TypeError: Assignment to constant variable

////////////////////////////////////////////////////////////////
// HOISTING
////////////////////////////////////////////////////////////////

console.log(x); // undefined (var is hoisted but not initialized)
var x = 5;

// console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

// console.log(z); // ReferenceError: Cannot access 'z' before initialization
const z = 5;

////////////////////////////////////////////////////////////////
// SCOPE
////////////////////////////////////////////////////////////////

// var is function scoped
function testVar() {
  if (true) {
    var a = 10;
  }
  console.log(a); // 10 (accessible outside the if block)
}

// let and const are block scoped
function testLet() {
  if (true) {
    let b = 10;
    const c = 20;
  }
  // console.log(b); // ReferenceError: b is not defined
  // console.log(c); // ReferenceError: c is not defined
}

////////////////////////////////////////////////////////////////
// PRIMITIVE TYPES (7 types)
////////////////////////////////////////////////////////////////

let str = "Hello";           // String
let num = 42;                // Number
let big = 9007199254740991n; // BigInt
let bool = true;             // Boolean
let undef = undefined;       // Undefined
let nul = null;              // Null
let sym = Symbol("id");      // Symbol

////////////////////////////////////////////////////////////////
// typeof OPERATOR
////////////////////////////////////////////////////////////////

typeof "Hello"      // "string"
typeof 42           // "number"
typeof 42n          // "bigint"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object"   (historic bug in JS)
typeof Symbol("id") // "symbol"
typeof {}           // "object"
typeof []           // "object"   (arrays are objects)
typeof function(){} // "function"

////////////////////////////////////////////////////////////////
// TYPE COERCION (implicit conversion)
////////////////////////////////////////////////////////////////

// String coercion with +
"5" + 3       // "53"  (number 3 converted to string)
"5" + true    // "5true"
"5" + null    // "5null"

// Numeric coercion with - * / %
"5" - 3       // 2   (string "5" converted to number)
"5" * "2"     // 10
"5" / "2"     // 2.5
"10" % "3"    // 1
true + 1      // 2   (true converted to 1)
false + 1     // 1   (false converted to 0)
null + 1      // 1   (null converted to 0)

// Boolean coercion
Boolean(0)          // false
Boolean("")         // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(NaN)        // false
Boolean(1)          // true
Boolean("hello")    // true
Boolean([])         // true  (empty array is truthy!)
Boolean({})         // true  (empty object is truthy!)

////////////////////////////////////////////////////////////////
// EXPLICIT CONVERSION
////////////////////////////////////////////////////////////////

// To String
String(123)        // "123"
String(true)       // "true"
String(null)       // "null"
(123).toString()   // "123"

// To Number
Number("123")      // 123
Number("hello")    // NaN
Number(true)       // 1
Number(false)      // 0
Number(null)       // 0
Number(undefined)  // NaN
parseInt("42px")   // 42
parseFloat("3.14") // 3.14

// To Boolean
Boolean(0)         // false
Boolean("")        // false
!!0                // false  (double NOT shortcut)
!!"hello"          // true

////////////////////////////////////////////////////////////////
// TEMPLATE LITERALS
////////////////////////////////////////////////////////////////

let firstName = "Ana";
let lastName = "Garcia";

// String concatenation (old way)
let full1 = firstName + " " + lastName; // "Ana Garcia"

// Template literals (modern way)
let full2 = `${firstName} ${lastName}`; // "Ana Garcia"

// Multiline strings
let multiline = `
  This is line 1
  This is line 2
  This is line 3
`;

// Expressions inside template literals
let a1 = 10;
let b1 = 20;
console.log(`Sum: ${a1 + b1}`);          // "Sum: 30"
console.log(`Is even: ${a1 % 2 === 0}`); // "Is even: true"

// Tagged template literals
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<b>${values[i]}</b>` : "");
  }, "");
}

let item = "JavaScript";
let price = 0;
highlight`${item} is ${price} cost`; // "<b>JavaScript</b> is <b>0</b> cost"

////////////////////////////////////////////////////////////////
// EQUALITY COMPARISONS
////////////////////////////////////////////////////////////////

// == (loose equality - with type coercion)
5 == "5"        // true  (string coerced to number)
0 == false      // true  (false coerced to 0)
null == undefined // true (special rule)
"" == 0         // true

// === (strict equality - no coercion)
5 === "5"       // false (different types)
0 === false     // false
null === undefined // false

// Object.is() - like === but handles edge cases
Object.is(NaN, NaN)   // true  (NaN === NaN is false)
Object.is(0, -0)      // false (0 === -0 is true)

////////////////////////////////////////////////////////////////
// SPECIAL VALUES
////////////////////////////////////////////////////////////////

// NaN (Not a Number)
NaN === NaN          // false (NaN is not equal to itself)
Number.isNaN(NaN)    // true
Number.isNaN("hello") // false (unlike global isNaN)

// Infinity
1 / 0                // Infinity
-1 / 0               // -Infinity
Number.isFinite(Infinity)  // false
Number.isFinite(42)        // true

// Number limits
Number.MAX_SAFE_INTEGER // 9007199254740991
Number.MIN_SAFE_INTEGER // -9007199254740991
Number.isSafeInteger(9007199254740992) // false
