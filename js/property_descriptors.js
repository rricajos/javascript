////////////////////////////////////////////////////////////////
// PROPERTY DESCRIPTORS — low-level object control
////////////////////////////////////////////////////////////////

// Every property on a JS object has a descriptor — metadata that
// controls whether the property can be changed, deleted, or enumerated.
// Most code never needs this, but frameworks and library code use it constantly.

////////////////////////////////////////////////////////////////
// 1. THE FOUR ATTRIBUTES OF A DATA DESCRIPTOR
////////////////////////////////////////////////////////////////

// value       — the stored value
// writable    — can the value be changed?
// enumerable  — does it show up in for...in / Object.keys()?
// configurable — can the descriptor itself be changed? can it be deleted?

// Read a property's descriptor:
const obj = { name: 'Alice' };
console.log(Object.getOwnPropertyDescriptor(obj, 'name'));
// { value: 'Alice', writable: true, enumerable: true, configurable: true }
// — all true: this is a "normal" property

////////////////////////////////////////////////////////////////
// 2. Object.defineProperty — full control
////////////////////////////////////////////////////////////////

const config = {};

Object.defineProperty(config, 'version', {
  value: '1.0.0',
  writable: false,      // cannot be reassigned
  enumerable: true,     // shows in Object.keys
  configurable: false   // cannot be deleted or redefined
});

config.version = '2.0.0'; // silently fails (TypeError in strict mode)
console.log(config.version); // '1.0.0' — unchanged

delete config.version;    // silently fails (TypeError in strict mode)
console.log(config.version); // '1.0.0' — still there

// Define a non-enumerable internal property:
const user = { name: 'Bob' };
Object.defineProperty(user, '_id', {
  value: 42,
  writable: false,
  enumerable: false,    // hidden from for...in and Object.keys
  configurable: false
});

Object.keys(user);         // ['name'] — _id is invisible
'_id' in user;             // true — 'in' still finds it
user._id;                  // 42 — still accessible directly

////////////////////////////////////////////////////////////////
// 3. ACCESSOR DESCRIPTORS — getters and setters
////////////////////////////////////////////////////////////////

// Instead of value + writable, use get + set

const temperature = {};

let _celsius = 0; // private backing variable

Object.defineProperty(temperature, 'celsius', {
  get() { return _celsius; },
  set(val) {
    if (typeof val !== 'number') throw new TypeError('Must be a number');
    _celsius = val;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(temperature, 'fahrenheit', {
  get() { return _celsius * 9 / 5 + 32; },
  set(val) { _celsius = (val - 32) * 5 / 9; },
  enumerable: true,
  configurable: true
});

temperature.celsius = 100;
console.log(temperature.fahrenheit); // 212
temperature.fahrenheit = 32;
console.log(temperature.celsius);    // 0

// Shorthand getter/setter syntax in object literals:
const circle = {
  _r: 5,
  get radius() { return this._r; },
  set radius(val) {
    if (val < 0) throw new RangeError('Radius cannot be negative');
    this._r = val;
  },
  get area() { return Math.PI * this._r ** 2; }  // computed, read-only
};

circle.radius = 10;
console.log(circle.area); // 314.159...
// circle.area = 0;        // silently ignored — no setter defined

////////////////////////////////////////////////////////////////
// 4. Object.defineProperties — define multiple at once
////////////////////////////////////////////////////////////////

const point = {};
Object.defineProperties(point, {
  x: { value: 3, writable: true, enumerable: true, configurable: true },
  y: { value: 4, writable: true, enumerable: true, configurable: true },
  magnitude: {
    get() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
    enumerable: true,
    configurable: true
  }
});

console.log(point.magnitude); // 5

////////////////////////////////////////////////////////////////
// 5. Object.freeze — deep immutability (shallow)
////////////////////////////////////////////////////////////////

const settings = Object.freeze({
  theme: 'dark',
  lang: 'en',
  nested: { volume: 50 }
});

settings.theme = 'light';   // silently fails (TypeError in strict)
settings.theme;              // 'dark' — unchanged
delete settings.lang;        // silently fails

// IMPORTANT: freeze is SHALLOW
settings.nested.volume = 0; // works! nested object is not frozen
settings.nested.volume;      // 0 — mutable

// Deep freeze requires recursion:
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    const val = obj[name];
    if (val && typeof val === 'object') deepFreeze(val);
  });
  return Object.freeze(obj);
}

////////////////////////////////////////////////////////////////
// 6. Object.seal — allow changes, prevent structure changes
////////////////////////////////////////////////////////////////

const state = Object.seal({
  count: 0,
  active: true
});

state.count = 5;         // OK — existing properties are writable
state.newProp = 'x';     // silently fails — no adding properties
delete state.active;     // silently fails — no deleting
console.log(state.count);  // 5
console.log(state.active); // true

// seal vs freeze:
// | Operation             | sealed | frozen |
// |-----------------------|--------|--------|
// | Read value            | ✓      | ✓      |
// | Modify existing value | ✓      | ✗      |
// | Add new property      | ✗      | ✗      |
// | Delete property       | ✗      | ✗      |
// | Redefine descriptor   | ✗      | ✗      |

////////////////////////////////////////////////////////////////
// 7. Object.preventExtensions — weakest lock
////////////////////////////////////////////////////////////////

const base = { x: 1 };
Object.preventExtensions(base);

base.x = 99;         // OK — can still modify existing
delete base.x;       // OK — can still delete
// base.y = 2;       // TypeError — cannot add new properties

// Check status:
Object.isExtensible(base);   // false
Object.isSealed(settings);   // true (frozen implies sealed)
Object.isFrozen(settings);   // true

////////////////////////////////////////////////////////////////
// 8. PRACTICAL USE CASE — constants object
////////////////////////////////////////////////////////////////

// Instead of separate const declarations, group related constants:
const HTTP = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
});

// HTTP.OK = 0;   // silently fails — values are protected
HTTP.OK;          // 200 — always

////////////////////////////////////////////////////////////////
// 9. PRACTICAL USE CASE — lazy computed properties
////////////////////////////////////////////////////////////////

function heavyComputation() {
  console.log('Computing...');
  return 42;
}

const lazy = {};
Object.defineProperty(lazy, 'result', {
  get() {
    // Replace itself on first access — compute once, cache forever
    const value = heavyComputation();
    Object.defineProperty(lazy, 'result', {
      value,
      writable: false,
      enumerable: true,
      configurable: false
    });
    return value;
  },
  enumerable: true,
  configurable: true // must be configurable to allow redefinition
});

lazy.result; // "Computing..." → 42
lazy.result; // 42 — no recomputation
lazy.result; // 42 — still cached
