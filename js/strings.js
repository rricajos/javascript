////////////////////////////////////////////////////////////////
// CREATING STRINGS
////////////////////////////////////////////////////////////////

const str1 = "Hello";         // double quotes
const str2 = 'World';         // single quotes
const str3 = `Hello World`;   // template literal (backticks)

// Strings are immutable - methods return NEW strings
const original = "Hello";
original[0] = "h"; // does nothing
// original is still "Hello"

////////////////////////////////////////////////////////////////
// STRING PROPERTIES & ACCESS
////////////////////////////////////////////////////////////////

"Hello".length;        // 5

"Hello"[0];            // "H"
"Hello"[4];            // "o"
"Hello".charAt(0);     // "H"
"Hello".charCodeAt(0); // 72 (Unicode value)
"Hello".at(-1);        // "o" (ES2022, negative index)

////////////////////////////////////////////////////////////////
// SEARCHING
////////////////////////////////////////////////////////////////

const text = "JavaScript is awesome. JavaScript is powerful.";

// indexOf / lastIndexOf - returns position or -1
text.indexOf("JavaScript");       // 0
text.lastIndexOf("JavaScript");   // 23
text.indexOf("Python");           // -1

// includes - returns boolean
text.includes("awesome");         // true
text.includes("boring");          // false

// startsWith / endsWith
text.startsWith("Java");          // true
text.startsWith("Script");        // false
text.endsWith(".");               // true
text.endsWith("powerful.");       // true

// search - returns first index (supports regex)
text.search(/awesome/);           // 14
text.search(/python/i);           // -1

// match - returns matches (with regex)
"abc 123 def 456".match(/\d+/);     // ["123"]
"abc 123 def 456".match(/\d+/g);    // ["123", "456"]

// matchAll - returns iterator of all matches with groups
const matches = "2024-01-15".matchAll(/(\d{4})-(\d{2})-(\d{2})/g);
for (const match of matches) {
  console.log(match[0]); // "2024-01-15"
  console.log(match[1]); // "2024"
  console.log(match[2]); // "01"
  console.log(match[3]); // "15"
}

////////////////////////////////////////////////////////////////
// EXTRACTING SUBSTRINGS
////////////////////////////////////////////////////////////////

const str = "Hello, World!";

// slice(start, end) - most versatile
str.slice(0, 5);     // "Hello"
str.slice(7);        // "World!"
str.slice(-6);       // "orld!"
str.slice(-6, -1);   // "orld"

// substring(start, end) - like slice but no negative indices
str.substring(0, 5); // "Hello"
str.substring(7);    // "World!"

////////////////////////////////////////////////////////////////
// TRANSFORMING
////////////////////////////////////////////////////////////////

// Case
"hello".toUpperCase();   // "HELLO"
"HELLO".toLowerCase();   // "hello"

// Trim (remove whitespace)
"  hello  ".trim();       // "hello"
"  hello  ".trimStart();  // "hello  "
"  hello  ".trimEnd();    // "  hello"

// Padding
"5".padStart(3, "0");    // "005"
"5".padEnd(3, "0");      // "500"
"hi".padStart(10, "-");  // "--------hi"

// Repeat
"ha".repeat(3);          // "hahaha"
"-".repeat(20);          // "--------------------"

////////////////////////////////////////////////////////////////
// REPLACING
////////////////////////////////////////////////////////////////

const msg = "Hello World, Hello JS";

// replace - replaces FIRST occurrence
msg.replace("Hello", "Hi");           // "Hi World, Hello JS"

// replaceAll - replaces ALL occurrences
msg.replaceAll("Hello", "Hi");        // "Hi World, Hi JS"

// With regex (g flag for global)
msg.replace(/Hello/g, "Hi");          // "Hi World, Hi JS"

// With capture groups
"2024-01-15".replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1");
// "15/01/2024"

// With function
"hello world".replace(/\b\w/g, char => char.toUpperCase());
// "Hello World"

////////////////////////////////////////////////////////////////
// SPLITTING & JOINING
////////////////////////////////////////////////////////////////

// split - string to array
"a,b,c".split(",");         // ["a", "b", "c"]
"Hello World".split(" ");   // ["Hello", "World"]
"Hello".split("");           // ["H", "e", "l", "l", "o"]
"a,b,c,d".split(",", 2);    // ["a", "b"] (limit)

// join - array to string (Array method)
["a", "b", "c"].join("-");  // "a-b-c"
["a", "b", "c"].join("");   // "abc"

////////////////////////////////////////////////////////////////
// TEMPLATE LITERALS
////////////////////////////////////////////////////////////////

const name = "Ana";
const age = 30;

// Interpolation
`Name: ${name}, Age: ${age}`;    // "Name: Ana, Age: 30"

// Expressions
`Sum: ${2 + 3}`;                 // "Sum: 5"
`Status: ${age >= 18 ? "adult" : "minor"}`; // "Status: adult"

// Multiline
const html = `
  <div>
    <h1>${name}</h1>
    <p>Age: ${age}</p>
  </div>
`;

// Raw strings (no escape processing)
String.raw`Hello\nWorld`;   // "Hello\\nWorld" (literal backslash-n)

////////////////////////////////////////////////////////////////
// REGULAR EXPRESSIONS BASICS
////////////////////////////////////////////////////////////////

// Creating regex
const regex1 = /pattern/flags;
const regex2 = new RegExp("pattern", "flags");

// Common flags
// g - global (find all matches)
// i - case insensitive
// m - multiline
// s - dotAll (. matches newlines)

// test - returns boolean
/hello/i.test("Hello World");  // true

// Common patterns
/^\d+$/.test("123");           // true  (only digits)
/^[a-zA-Z]+$/.test("Hello");  // true  (only letters)
/^\S+@\S+\.\S+$/.test("a@b.com"); // true (basic email)

// Character classes
// \d - digit [0-9]
// \w - word character [a-zA-Z0-9_]
// \s - whitespace
// \D, \W, \S - negations

// Quantifiers
// *  - 0 or more
// +  - 1 or more
// ?  - 0 or 1
// {n}  - exactly n
// {n,} - n or more
// {n,m} - between n and m

// Groups
const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
const match = "2024-01-15".match(dateRegex);
// match[0] = "2024-01-15" (full match)
// match[1] = "2024" (group 1)
// match[2] = "01"   (group 2)
// match[3] = "15"   (group 3)

// Named groups
const namedRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const { groups } = "2024-01-15".match(namedRegex);
// groups.year  = "2024"
// groups.month = "01"
// groups.day   = "15"

////////////////////////////////////////////////////////////////
// USEFUL STRING PATTERNS
////////////////////////////////////////////////////////////////

// Capitalize first letter
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
capitalize("hello"); // "Hello"

// Title case
const titleCase = str =>
  str.replace(/\b\w/g, char => char.toUpperCase());
titleCase("hello world"); // "Hello World"

// camelCase to kebab-case
const toKebab = str =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
toKebab("backgroundColor"); // "background-color"

// Truncate string
const truncate = (str, len) =>
  str.length > len ? str.slice(0, len) + "..." : str;
truncate("Hello World", 8); // "Hello Wo..."

// Count occurrences
const countOccurrences = (str, sub) =>
  str.split(sub).length - 1;
countOccurrences("hello world hello", "hello"); // 2

// Reverse string
const reverse = str => [...str].reverse().join("");
reverse("Hello"); // "olleH"

// Check palindrome
const isPalindrome = str => {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === [...clean].reverse().join("");
};
isPalindrome("A man a plan a canal Panama"); // true
