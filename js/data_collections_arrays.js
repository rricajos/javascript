////////////////////////////////////////////////////////////////
// CREATING ARRAYS
////////////////////////////////////////////////////////////////

const arr1 = [1, 2, 3];               // literal
const arr2 = new Array(3);            // [empty × 3]
const arr3 = Array.of(1, 2, 3);      // [1, 2, 3]
const arr4 = Array.from("hello");    // ["h", "e", "l", "l", "o"]
const arr5 = Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]

////////////////////////////////////////////////////////////////
// ACCESSING ELEMENTS
////////////////////////////////////////////////////////////////

const fruits = ["apple", "banana", "cherry", "date"];

fruits[0];            // "apple"
fruits[fruits.length - 1]; // "date"
fruits.at(0);         // "apple"
fruits.at(-1);        // "date" (negative index counts from end)
fruits.at(-2);        // "cherry"

////////////////////////////////////////////////////////////////
// ADDING / REMOVING ELEMENTS (mutate original)
////////////////////////////////////////////////////////////////

const arr = [1, 2, 3];

// End of array
arr.push(4);          // [1, 2, 3, 4] - returns new length: 4
arr.pop();            // [1, 2, 3]    - returns removed: 4

// Beginning of array
arr.unshift(0);       // [0, 1, 2, 3] - returns new length: 4
arr.shift();          // [1, 2, 3]    - returns removed: 0

// Arbitrary position
arr.splice(1, 1);           // [1, 3]       - removes 1 element at index 1
arr.splice(1, 0, 2);        // [1, 2, 3]    - inserts 2 at index 1
arr.splice(1, 1, "two");    // [1, "two", 3] - replaces element at index 1

////////////////////////////////////////////////////////////////
// SEARCHING
////////////////////////////////////////////////////////////////

const nums = [10, 20, 30, 20, 40];

nums.indexOf(20);        // 1  (first occurrence)
nums.lastIndexOf(20);    // 3  (last occurrence)
nums.indexOf(99);        // -1 (not found)

nums.includes(30);       // true
nums.includes(99);       // false

// find - returns first element matching condition
nums.find(n => n > 25);       // 30
nums.find(n => n > 100);      // undefined

// findIndex - returns index of first match
nums.findIndex(n => n > 25);  // 2
nums.findIndex(n => n > 100); // -1

// findLast / findLastIndex (ES2023)
nums.findLast(n => n > 15);      // 40
nums.findLastIndex(n => n > 15); // 4

////////////////////////////////////////////////////////////////
// TESTING ELEMENTS
////////////////////////////////////////////////////////////////

const numbers = [2, 4, 6, 8];

// every - ALL elements must pass
numbers.every(n => n % 2 === 0); // true
numbers.every(n => n > 5);       // false

// some - AT LEAST ONE element must pass
numbers.some(n => n > 5);        // true
numbers.some(n => n > 10);       // false

////////////////////////////////////////////////////////////////
// TRANSFORMING (return new array, don't mutate)
////////////////////////////////////////////////////////////////

const prices = [10, 20, 30, 40, 50];

// map - transform each element
prices.map(p => p * 1.21);     // [12.1, 24.2, 36.3, 48.4, 60.5]

// filter - keep elements that pass condition
prices.filter(p => p > 25);    // [30, 40, 50]

// reduce - accumulate to single value
prices.reduce((sum, p) => sum + p, 0);  // 150

// reduceRight - same as reduce but right to left
[1, 2, 3].reduceRight((acc, n) => acc + n.toString(), ""); // "321"

// flat - flatten nested arrays
[1, [2, 3], [4, [5]]].flat();    // [1, 2, 3, 4, [5]]
[1, [2, 3], [4, [5]]].flat(2);   // [1, 2, 3, 4, 5]
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]

// flatMap - map + flat(1)
["Hello World", "Foo Bar"].flatMap(s => s.split(" "));
// ["Hello", "World", "Foo", "Bar"]

////////////////////////////////////////////////////////////////
// SORTING
////////////////////////////////////////////////////////////////

// sort mutates the original array!
const letters = ["c", "a", "b"];
letters.sort(); // ["a", "b", "c"]

// Numeric sort (default sort is lexicographic)
const vals = [10, 1, 21, 2];
vals.sort();                    // [1, 10, 2, 21] - WRONG! string comparison
vals.sort((a, b) => a - b);    // [1, 2, 10, 21] - ascending
vals.sort((a, b) => b - a);    // [21, 10, 2, 1] - descending

// toSorted (ES2023) - returns new sorted array without mutating
const original = [3, 1, 2];
const sorted = original.toSorted((a, b) => a - b); // [1, 2, 3]
// original is still [3, 1, 2]

// reverse - mutates original
[1, 2, 3].reverse(); // [3, 2, 1]

// toReversed (ES2023) - returns new reversed array
const orig = [1, 2, 3];
const reversed = orig.toReversed(); // [3, 2, 1]
// orig is still [1, 2, 3]

////////////////////////////////////////////////////////////////
// COPYING / SLICING
////////////////////////////////////////////////////////////////

const source = [1, 2, 3, 4, 5];

// slice - returns new array (does not mutate)
source.slice(1, 3);    // [2, 3] (from index 1, up to but not including 3)
source.slice(2);       // [3, 4, 5] (from index 2 to end)
source.slice(-2);      // [4, 5] (last 2 elements)

// Shallow copy
const copy1 = source.slice();
const copy2 = [...source];
const copy3 = Array.from(source);

// with (ES2023) - returns copy with one element changed
const arr6 = [1, 2, 3];
arr6.with(1, 99); // [1, 99, 3] - arr6 unchanged

////////////////////////////////////////////////////////////////
// JOINING / SPLITTING
////////////////////////////////////////////////////////////////

["a", "b", "c"].join("-");   // "a-b-c"
["a", "b", "c"].join("");    // "abc"
["a", "b", "c"].join();      // "a,b,c" (default comma)

"a-b-c".split("-");          // ["a", "b", "c"]

////////////////////////////////////////////////////////////////
// COMBINING ARRAYS
////////////////////////////////////////////////////////////////

const a = [1, 2];
const b = [3, 4];

// concat - returns new array
a.concat(b);        // [1, 2, 3, 4]
a.concat(b, [5]);   // [1, 2, 3, 4, 5]

// spread operator
[...a, ...b];       // [1, 2, 3, 4]
[...a, 2.5, ...b];  // [1, 2, 2.5, 3, 4]

////////////////////////////////////////////////////////////////
// ITERATING
////////////////////////////////////////////////////////////////

const items = ["x", "y", "z"];

// forEach - executes function for each element (returns undefined)
items.forEach((item, index) => {
  console.log(`${index}: ${item}`);
});

// entries - returns [index, value] pairs
for (let [index, value] of items.entries()) {
  console.log(index, value);
}

// keys - returns indices
for (let index of items.keys()) {
  console.log(index); // 0, 1, 2
}

// values - returns values
for (let value of items.values()) {
  console.log(value); // "x", "y", "z"
}

////////////////////////////////////////////////////////////////
// USEFUL PATTERNS
////////////////////////////////////////////////////////////////

// Remove duplicates
const dupes = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(dupes)]; // [1, 2, 3, 4]

// Group by (ES2024)
const people = [
  { name: "Ana", age: 20 },
  { name: "Luis", age: 30 },
  { name: "Pedro", age: 20 }
];
Object.groupBy(people, p => p.age);
// { 20: [{name:"Ana",...}, {name:"Pedro",...}], 30: [{name:"Luis",...}] }

// Chunk array
function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
chunk([1, 2, 3, 4, 5], 2); // [[1,2], [3,4], [5]]

// Sum
[1, 2, 3, 4].reduce((sum, n) => sum + n, 0); // 10

// Max / Min
Math.max(...[1, 5, 3, 9, 2]); // 9
Math.min(...[1, 5, 3, 9, 2]); // 1

// Check if array
Array.isArray([1, 2, 3]);  // true
Array.isArray("hello");    // false
