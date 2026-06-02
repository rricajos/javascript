////////////////////////////////////////////////////////////////
// PROTOTYPE CHAIN — how inheritance really works in JS
////////////////////////////////////////////////////////////////

// Classes in JavaScript are syntax sugar over prototypes.
// Understanding prototypes explains: how methods are shared,
// how inheritance works, and why instanceof behaves the way it does.

////////////////////////////////////////////////////////////////
// 1. EVERY OBJECT HAS A PROTOTYPE
////////////////////////////////////////////////////////////////

const obj = { x: 1 };

// obj.__proto__ points to Object.prototype
// (use Object.getPrototypeOf — __proto__ is legacy)
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true

// Object.prototype is the root — its prototype is null
console.log(Object.getPrototypeOf(Object.prototype)); // null

// The chain: obj → Object.prototype → null

////////////////////////////////////////////////////////////////
// 2. PROPERTY LOOKUP — chain traversal
////////////////////////////////////////////////////////////////

const animal = {
  breathes: true,
  describe() {
    return `I breathe: ${this.breathes}`;
  }
};

const dog = Object.create(animal); // dog's prototype = animal
dog.bark = function () { return 'Woof!'; };

// dog has: bark (own property)
// dog inherits: breathes, describe (from animal)

console.log(dog.bark());       // "Woof!" — own property
console.log(dog.breathes);     // true — found on animal (prototype)
console.log(dog.describe());   // "I breathe: true" — this = dog

// Property lookup order:
// 1. Check the object itself (own properties)
// 2. Check its prototype
// 3. Check the prototype's prototype
// 4. Continue until null — if not found, return undefined

////////////////////////////////////////////////////////////////
// 3. OWN vs INHERITED PROPERTIES
////////////////////////////////////////////////////////////////

const cat = Object.create(animal);
cat.name = 'Whiskers';

cat.hasOwnProperty('name');      // true  — defined on cat directly
cat.hasOwnProperty('breathes');  // false — inherited from animal

// for...in iterates OWN + inherited (enumerable) properties
for (const key in cat) {
  console.log(key); // name, breathes, describe
}

// Object.keys / Object.entries only own enumerable properties
Object.keys(cat); // ["name"]

// Check the chain explicitly:
'breathes' in cat;           // true — in checks the whole chain
cat.hasOwnProperty('breathes'); // false — not own

////////////////////////////////////////////////////////////////
// 4. HOW CONSTRUCTOR FUNCTIONS USE PROTOTYPE
////////////////////////////////////////////////////////////////

function Vehicle(make, model) {
  this.make = make;   // own property — each instance gets its own
  this.model = model;
}

// Shared methods live on the prototype — ONE copy for all instances
Vehicle.prototype.describe = function () {
  return `${this.make} ${this.model}`;
};

Vehicle.prototype.type = 'vehicle'; // shared property

const car = new Vehicle('Toyota', 'Corolla');
const bike = new Vehicle('Honda', 'CBR');

car.describe();   // "Toyota Corolla"
bike.describe();  // "Honda CBR"

// Both share the SAME describe function — no duplication
car.describe === bike.describe; // true

// The chain: car → Vehicle.prototype → Object.prototype → null

////////////////////////////////////////////////////////////////
// 5. HOW class MAPS TO PROTOTYPES
////////////////////////////////////////////////////////////////

class Animal {
  constructor(name) {
    this.name = name; // own property
  }
  speak() {           // lives on Animal.prototype
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  speak() {           // lives on Dog.prototype — OVERRIDES Animal.prototype.speak
    return `${this.name} barks`;
  }
}

const d = new Dog('Rex');
d.speak(); // "Rex barks" — Dog.prototype.speak found first

// The chain: d → Dog.prototype → Animal.prototype → Object.prototype → null

// Under the hood, extends does this:
// Dog.prototype = Object.create(Animal.prototype)
// Dog.prototype.constructor = Dog

Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true

////////////////////////////////////////////////////////////////
// 6. instanceof — how it works
////////////////////////////////////////////////////////////////

d instanceof Dog;     // true  — Dog.prototype is in d's chain
d instanceof Animal;  // true  — Animal.prototype is also in d's chain
d instanceof Object;  // true  — Object.prototype is always in the chain

// instanceof walks up the chain until it finds the .prototype or reaches null
// It checks: does <Constructor>.prototype appear anywhere in the chain?

// Manual check equivalent:
function isInstanceOf(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

////////////////////////////////////////////////////////////////
// 7. Object.create — create with explicit prototype
////////////////////////////////////////////////////////////////

// Object.create(proto) — creates object with proto as its prototype
const base = {
  greet() { return `Hi, I'm ${this.name}`; }
};

const user = Object.create(base);
user.name = 'Alice';
user.greet(); // "Hi, I'm Alice"

// Object.create(null) — object with NO prototype
const bare = Object.create(null);
bare.x = 1;
// bare.toString — undefined (no Object.prototype in chain)
// Useful for dictionaries/maps (no prototype pollution risk)

////////////////////////////////////////////////////////////////
// 8. MODIFYING THE PROTOTYPE — affects ALL instances
////////////////////////////////////////////////////////////////

function Point(x, y) {
  this.x = x;
  this.y = y;
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);

// Add a method AFTER creating instances — they all get it immediately
Point.prototype.distanceFromOrigin = function () {
  return Math.sqrt(this.x ** 2 + this.y ** 2);
};

p1.distanceFromOrigin(); // 2.236...
p2.distanceFromOrigin(); // 5 — both work!

// This is why you can do things like:
// Array.prototype.myMethod = ... (monkey-patching — avoid in production)

////////////////////////////////////////////////////////////////
// 9. PROPERTY SHADOWING
////////////////////////////////////////////////////////////////

const parent = { value: 1 };
const child = Object.create(parent);

child.value;             // 1 — from parent

child.value = 99;        // creates OWN property on child — does NOT modify parent
child.value;             // 99 — own property shadows parent
parent.value;            // 1 — parent unchanged

// Delete the shadow to restore prototype access
delete child.value;
child.value;             // 1 — parent's value is visible again

////////////////////////////////////////////////////////////////
// 10. SUMMARY — the mental model
////////////////////////////////////////////////////////////////

// Objects are bags of properties with a hidden link (__proto__)
// to another object (their prototype).
//
// When you access a property:
// 1. JS checks the object itself
// 2. Then its prototype, then prototype's prototype...
// 3. Until null — then returns undefined
//
// class syntax creates this chain automatically.
// Object.create gives you explicit control.
// All roads lead to Object.prototype at the top.
