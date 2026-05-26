////////////////////////////////////////////////////////////////
// PROXY - Intercept and customize object operations
////////////////////////////////////////////////////////////////

// Basic syntax: new Proxy(target, handler)
const target = { name: "Ana", age: 30 };

const handler = {
  get(target, property, receiver) {
    console.log(`Reading property: ${property}`);
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
};

const proxy = new Proxy(target, handler);
proxy.name;        // logs "Reading property: name" → "Ana"
proxy.age = 31;    // logs "Setting age = 31"

////////////////////////////////////////////////////////////////
// PROXY TRAPS (all available handlers)
////////////////////////////////////////////////////////////////

// get(target, property, receiver)          - property access
// set(target, property, value, receiver)   - property assignment
// has(target, property)                    - 'in' operator
// deleteProperty(target, property)         - delete operator
// apply(target, thisArg, args)             - function call
// construct(target, args, newTarget)       - new operator
// getPrototypeOf(target)                   - Object.getPrototypeOf
// setPrototypeOf(target, proto)            - Object.setPrototypeOf
// isExtensible(target)                     - Object.isExtensible
// preventExtensions(target)                - Object.preventExtensions
// defineProperty(target, prop, descriptor) - Object.defineProperty
// getOwnPropertyDescriptor(target, prop)   - Object.getOwnPropertyDescriptor
// ownKeys(target)                          - Object.keys / for...in
// enumerate(target)                        - for...in (deprecated)

////////////////////////////////////////////////////////////////
// PRACTICAL PROXY: VALIDATION
////////////////////////////////////////////////////////////////

function createValidated(target, rules) {
  return new Proxy(target, {
    set(target, property, value) {
      const rule = rules[property];
      if (rule && !rule.validate(value)) {
        throw new TypeError(`Invalid value for ${property}: ${rule.message}`);
      }
      target[property] = value;
      return true;
    }
  });
}

const user = createValidated({}, {
  name: {
    validate: v => typeof v === "string" && v.length > 0,
    message: "Name must be a non-empty string"
  },
  age: {
    validate: v => typeof v === "number" && v >= 0 && v <= 150,
    message: "Age must be a number between 0 and 150"
  },
  email: {
    validate: v => /^\S+@\S+\.\S+$/.test(v),
    message: "Must be a valid email"
  }
});

user.name = "Ana";         // ok
user.age = 30;             // ok
// user.age = -5;          // TypeError: Invalid value for age
// user.email = "invalid"; // TypeError: Must be a valid email

////////////////////////////////////////////////////////////////
// PRACTICAL PROXY: DEFAULT VALUES
////////////////////////////////////////////////////////////////

function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(target, property) {
      return property in target ? target[property] : defaults[property];
    }
  });
}

const config = withDefaults(
  { theme: "dark" },
  { theme: "light", lang: "en", fontSize: 14 }
);

config.theme;    // "dark"   (from target)
config.lang;     // "en"     (from defaults)
config.fontSize; // 14       (from defaults)

////////////////////////////////////////////////////////////////
// PRACTICAL PROXY: LOGGING / DEBUGGING
////////////////////////////////////////////////////////////////

function withLogging(obj, label) {
  return new Proxy(obj, {
    get(target, property) {
      const value = target[property];
      console.log(`[${label}] GET ${String(property)} → ${value}`);
      return value;
    },
    set(target, property, value) {
      console.log(`[${label}] SET ${String(property)} = ${value}`);
      target[property] = value;
      return true;
    }
  });
}

const state = withLogging({ count: 0 }, "AppState");
state.count;      // [AppState] GET count → 0
state.count = 1;  // [AppState] SET count = 1

////////////////////////////////////////////////////////////////
// PRACTICAL PROXY: NEGATIVE ARRAY INDICES
////////////////////////////////////////////////////////////////

function negativeArray(arr) {
  return new Proxy(arr, {
    get(target, property, receiver) {
      const index = Number(property);
      if (Number.isInteger(index) && index < 0) {
        return target[target.length + index];
      }
      return Reflect.get(target, property, receiver);
    }
  });
}

const arr = negativeArray([1, 2, 3, 4, 5]);
arr[-1];  // 5
arr[-2];  // 4
arr[0];   // 1

////////////////////////////////////////////////////////////////
// PRACTICAL PROXY: OBSERVABLE (reactive)
////////////////////////////////////////////////////////////////

function observable(target, onChange) {
  return new Proxy(target, {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;
      if (oldValue !== value) {
        onChange(property, value, oldValue);
      }
      return true;
    },
    deleteProperty(target, property) {
      const oldValue = target[property];
      delete target[property];
      onChange(property, undefined, oldValue);
      return true;
    }
  });
}

const data = observable({ x: 1, y: 2 }, (prop, newVal, oldVal) => {
  console.log(`${prop}: ${oldVal} → ${newVal}`);
});

data.x = 10;   // "x: 1 → 10"
data.y = 20;   // "y: 2 → 20"
delete data.x;  // "x: 10 → undefined"

////////////////////////////////////////////////////////////////
// PRACTICAL PROXY: PRIVATE PROPERTIES
////////////////////////////////////////////////////////////////

function withPrivate(target) {
  return new Proxy(target, {
    get(target, property) {
      if (String(property).startsWith("_")) {
        throw new Error(`Cannot access private property: ${String(property)}`);
      }
      return target[property];
    },
    set(target, property, value) {
      if (String(property).startsWith("_")) {
        throw new Error(`Cannot set private property: ${String(property)}`);
      }
      target[property] = value;
      return true;
    },
    has(target, property) {
      if (String(property).startsWith("_")) return false;
      return property in target;
    },
    ownKeys(target) {
      return Object.keys(target).filter(k => !k.startsWith("_"));
    }
  });
}

const obj = withPrivate({ name: "Ana", _secret: "password123" });
obj.name;       // "Ana"
// obj._secret; // Error: Cannot access private property: _secret
Object.keys(obj); // ["name"]

////////////////////////////////////////////////////////////////
// REFLECT API (companion to Proxy)
////////////////////////////////////////////////////////////////

// Reflect provides methods that mirror Proxy traps
// Always returns boolean or value (no exceptions for failures)

const target2 = { name: "Ana", age: 30 };

// Get / Set
Reflect.get(target2, "name");            // "Ana"
Reflect.set(target2, "age", 31);         // true
Reflect.has(target2, "name");            // true

// Property definition
Reflect.defineProperty(target2, "email", {
  value: "ana@mail.com",
  writable: true,
  enumerable: true,
  configurable: true
}); // returns true/false instead of throwing

// Delete
Reflect.deleteProperty(target2, "email"); // true

// Get keys
Reflect.ownKeys(target2);  // ["name", "age"]

// Function call
function greet(name) { return `Hello ${name}`; }
Reflect.apply(greet, null, ["Ana"]);  // "Hello Ana"

// Constructor
class Person { constructor(name) { this.name = name; } }
Reflect.construct(Person, ["Ana"]);   // Person { name: "Ana" }

// Prototype
Reflect.getPrototypeOf(target2);
Reflect.setPrototypeOf(target2, null);

////////////////////////////////////////////////////////////////
// REFLECT vs OBJECT METHODS
////////////////////////////////////////////////////////////////

// Reflect.defineProperty returns boolean
Reflect.defineProperty(obj, "x", { value: 1 }); // true or false

// Object.defineProperty throws on failure
// Object.defineProperty(obj, "x", { value: 1 }); // throws or returns obj

// Reflect.has replaces 'in' operator
Reflect.has(target2, "name"); // same as "name" in target2

// Reflect.deleteProperty replaces delete
Reflect.deleteProperty(target2, "name"); // same as delete target2.name

// Reflect.ownKeys combines:
// Object.getOwnPropertyNames + Object.getOwnPropertySymbols
Reflect.ownKeys({ a: 1, [Symbol("b")]: 2 }); // ["a", Symbol(b)]

////////////////////////////////////////////////////////////////
// REVOCABLE PROXY (can be disabled)
////////////////////////////////////////////////////////////////

const { proxy: revocable, revoke } = Proxy.revocable(
  { data: "sensitive" },
  {
    get(target, property) {
      return target[property];
    }
  }
);

revocable.data; // "sensitive"
revoke();       // disable the proxy
// revocable.data; // TypeError: Cannot perform 'get' on a revoked proxy

// Use case: temporary access to an object, API tokens, session data
