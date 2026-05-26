////////////////////////////////////////////////////////////////
// CREATING OBJECTS
////////////////////////////////////////////////////////////////

// Object literal
const user = {
  name: "Ana",
  age: 30,
  isAdmin: true
};

// Constructor
const obj = new Object();
obj.name = "Luis";

// Object.create (with prototype)
const proto = { greet() { return `Hi, ${this.name}`; } };
const person = Object.create(proto);
person.name = "Ana";
person.greet(); // "Hi, Ana"

// Computed property names
const key = "color";
const config = { [key]: "blue" }; // { color: "blue" }

// Shorthand properties
const name = "Ana";
const age = 30;
const shorthand = { name, age }; // { name: "Ana", age: 30 }

// Shorthand methods
const calculator = {
  add(a, b) { return a + b; },       // instead of add: function(a, b) { ... }
  subtract(a, b) { return a - b; }
};

////////////////////////////////////////////////////////////////
// ACCESSING PROPERTIES
////////////////////////////////////////////////////////////////

const car = { brand: "Toyota", year: 2024, "fuel type": "hybrid" };

car.brand;          // "Toyota"       (dot notation)
car["brand"];       // "Toyota"       (bracket notation)
car["fuel type"];   // "hybrid"       (brackets required for spaces)

// Dynamic access
const prop = "year";
car[prop];          // 2024

// Optional chaining
car.engine?.cylinders; // undefined (no error)

////////////////////////////////////////////////////////////////
// MODIFYING OBJECTS
////////////////////////////////////////////////////////////////

const obj2 = { a: 1, b: 2 };

// Add / Update
obj2.c = 3;           // { a: 1, b: 2, c: 3 }
obj2["d"] = 4;        // { a: 1, b: 2, c: 3, d: 4 }

// Delete
delete obj2.d;        // { a: 1, b: 2, c: 3 }

// Check property existence
"a" in obj2;                    // true
obj2.hasOwnProperty("a");      // true
Object.hasOwn(obj2, "a");      // true (ES2022, preferred)

////////////////////////////////////////////////////////////////
// OBJECT STATIC METHODS
////////////////////////////////////////////////////////////////

const source1 = { a: 1, b: 2 };

// Object.keys - returns array of keys
Object.keys(source1);      // ["a", "b"]

// Object.values - returns array of values
Object.values(source1);    // [1, 2]

// Object.entries - returns array of [key, value] pairs
Object.entries(source1);   // [["a", 1], ["b", 2]]

// Object.fromEntries - creates object from entries
Object.fromEntries([["a", 1], ["b", 2]]); // { a: 1, b: 2 }

// Object.assign - copies properties (shallow)
const target = { a: 1 };
const result = Object.assign(target, { b: 2 }, { c: 3 });
// target = { a: 1, b: 2, c: 3 }, result === target

// Spread operator (preferred for copies)
const copy = { ...source1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Object.freeze - makes object completely immutable
const frozen = Object.freeze({ x: 1, y: 2 });
frozen.x = 99;   // silently fails (throws in strict mode)
frozen.z = 3;     // silently fails
// frozen is still { x: 1, y: 2 }

// Object.isFrozen
Object.isFrozen(frozen); // true

// Object.seal - can modify existing, cannot add/delete
const sealed = Object.seal({ x: 1, y: 2 });
sealed.x = 99;   // works! { x: 99, y: 2 }
sealed.z = 3;     // silently fails (cannot add)
delete sealed.x;  // silently fails (cannot delete)

// Object.getOwnPropertyNames
Object.getOwnPropertyNames({ a: 1, b: 2 }); // ["a", "b"]

// Object.getOwnPropertyDescriptor
Object.getOwnPropertyDescriptor({ a: 1 }, "a");
// { value: 1, writable: true, enumerable: true, configurable: true }

// Object.defineProperty
const obj3 = {};
Object.defineProperty(obj3, "id", {
  value: 42,
  writable: false,      // cannot reassign
  enumerable: true,     // shows in for...in
  configurable: false   // cannot delete or redefine
});

////////////////////////////////////////////////////////////////
// ITERATING OBJECTS
////////////////////////////////////////////////////////////////

const data = { a: 1, b: 2, c: 3 };

// for...in (includes inherited properties)
for (let key in data) {
  if (data.hasOwnProperty(key)) {
    console.log(key, data[key]);
  }
}

// Object.keys + forEach
Object.keys(data).forEach(key => {
  console.log(key, data[key]);
});

// Object.entries + for...of
for (let [key, value] of Object.entries(data)) {
  console.log(key, value);
}

////////////////////////////////////////////////////////////////
// MAP (key-value pairs with any type as key)
////////////////////////////////////////////////////////////////

const map = new Map();

// Set values
map.set("name", "Ana");
map.set(42, "the answer");
map.set(true, "boolean key");

const objKey = { id: 1 };
map.set(objKey, "object as key"); // objects can be keys!

// Get values
map.get("name");    // "Ana"
map.get(42);        // "the answer"
map.get(objKey);    // "object as key"

// Check & Delete
map.has("name");    // true
map.delete(42);     // true
map.size;           // 3

// Initialize from array of pairs
const map2 = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3]
]);

// Iterating
for (let [key, value] of map2) {
  console.log(key, value);
}

map2.forEach((value, key) => {
  console.log(key, value);
});

map2.keys();    // MapIterator {"a", "b", "c"}
map2.values();  // MapIterator {1, 2, 3}
map2.entries(); // MapIterator {["a",1], ["b",2], ["c",3]}

// Convert to/from Object
const fromObj = new Map(Object.entries({ x: 1, y: 2 }));
const toObj = Object.fromEntries(map2); // { a: 1, b: 2, c: 3 }

// clear
map2.clear(); // removes all entries

////////////////////////////////////////////////////////////////
// MAP vs OBJECT
////////////////////////////////////////////////////////////////

// Map advantages:
// - Any type as key (objects, functions, primitives)
// - Maintains insertion order (guaranteed)
// - Has .size property
// - Better performance for frequent additions/deletions
// - No prototype pollution risk

// Object advantages:
// - Simpler syntax for string keys
// - JSON serialization support
// - Destructuring support
// - Computed access with dot notation

////////////////////////////////////////////////////////////////
// SET (unique values collection)
////////////////////////////////////////////////////////////////

const set = new Set();

set.add(1);
set.add(2);
set.add(3);
set.add(2); // ignored, already exists

set.size;       // 3
set.has(2);     // true
set.delete(2);  // true
set.has(2);     // false

// Initialize from array
const set2 = new Set([1, 2, 3, 3, 4, 4, 5]);
// Set {1, 2, 3, 4, 5}

// Convert to array
const arr = [...set2];          // [1, 2, 3, 4, 5]
const arr2 = Array.from(set2);  // [1, 2, 3, 4, 5]

// Iterating
for (let value of set2) {
  console.log(value);
}

set2.forEach(value => console.log(value));

// Set operations
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// Union
const union = new Set([...setA, ...setB]); // {1, 2, 3, 4, 5, 6}

// Intersection
const intersection = new Set([...setA].filter(x => setB.has(x))); // {3, 4}

// Difference
const difference = new Set([...setA].filter(x => !setB.has(x))); // {1, 2}

// Remove duplicates from array (common pattern)
const dupes = [1, 1, 2, 3, 3, 4];
const unique = [...new Set(dupes)]; // [1, 2, 3, 4]

////////////////////////////////////////////////////////////////
// WEAKMAP (keys must be objects, garbage-collectable)
////////////////////////////////////////////////////////////////

const weakMap = new WeakMap();

let obj4 = { name: "Ana" };
weakMap.set(obj4, "some data");

weakMap.get(obj4);  // "some data"
weakMap.has(obj4);  // true

// When obj4 is dereferenced, its WeakMap entry is garbage collected
obj4 = null; // entry will be removed automatically

// WeakMap is NOT iterable - no .size, no .keys(), no .forEach()
// Use case: private data associated with objects, caching

////////////////////////////////////////////////////////////////
// WEAKSET (values must be objects, garbage-collectable)
////////////////////////////////////////////////////////////////

const weakSet = new WeakSet();

let obj5 = { id: 1 };
let obj6 = { id: 2 };

weakSet.add(obj5);
weakSet.add(obj6);

weakSet.has(obj5);    // true
weakSet.delete(obj6); // true

// When obj5 is dereferenced, it's garbage collected from WeakSet
obj5 = null;

// WeakSet is NOT iterable
// Use case: tracking visited objects, preventing circular references

////////////////////////////////////////////////////////////////
// STRUCTURED CLONE (deep copy)
////////////////////////////////////////////////////////////////

const original = {
  name: "Ana",
  address: { city: "Madrid", zip: "28001" },
  hobbies: ["reading", "coding"],
  date: new Date()
};

// Shallow copy (nested objects share reference)
const shallow = { ...original };
shallow.address.city = "Barcelona"; // also changes original!

// Deep copy with structuredClone (ES2022)
const deep = structuredClone(original);
deep.address.city = "Barcelona"; // does NOT change original
