////////////////////////////////////////////////////////////////
// THE this KEYWORD — context is everything
////////////////////////////////////////////////////////////////

// The most common source of confusion in JavaScript.
// "this" is NOT the function itself, NOT its scope —
// it is determined at call time, not at definition time.

////////////////////////////////////////////////////////////////
// 1. GLOBAL this
////////////////////////////////////////////////////////////////

console.log(this === window);   // true (in browsers)
// In strict mode ('use strict') at the top level, this is still the global object
// Inside modules, this is undefined at the top level

////////////////////////////////////////////////////////////////
// 2. this IN A REGULAR FUNCTION (standalone call)
////////////////////////////////////////////////////////////////

function whoAmI() {
  return this;
}

// Non-strict: this === window (global object)
// Strict mode: this === undefined
// Rule: standalone function calls set this to global or undefined

'use strict';
function strict() {
  console.log(this); // undefined — strict mode protects you from accidental global pollution
}

////////////////////////////////////////////////////////////////
// 3. this IN AN OBJECT METHOD — the happy path
////////////////////////////////////////////////////////////////

const user = {
  name: 'Alice',
  greet() {
    return `Hi, I'm ${this.name}`; // this === user
  }
};

console.log(user.greet()); // "Hi, I'm Alice"

// Rule: when a function is called as a method (obj.fn()),
// this === the object to the LEFT of the dot

////////////////////////////////////////////////////////////////
// 4. THE CLASSIC TRAP — losing this when detaching a method
////////////////////////////////////////////////////////////////

const greet = user.greet; // detach from user
// greet();                 // this is now undefined (strict) or window
                           // this.name is undefined — TRAP!

// Fix 1: bind
const boundGreet = user.greet.bind(user);
boundGreet(); // this is always user

// Fix 2: arrow wrapper (captures this from surrounding context)
const arrowGreet = () => user.greet(); // but simpler: just call user.greet()

////////////////////////////////////////////////////////////////
// 5. this IN ARROW FUNCTIONS — lexical this
////////////////////////////////////////////////////////////////

// Arrow functions do NOT have their own this.
// They inherit this from where they were DEFINED (lexical scope).

const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++;             // this === timer ✓ (inherited from start())
      console.log(this.seconds);
    }, 1000);
  }
};

// Compare — regular function loses this:
const timerBroken = {
  seconds: 0,
  start() {
    setInterval(function () {
      this.seconds++;             // this === window or undefined — BROKEN
    }, 1000);
  }
};

// Rule: use arrow functions in callbacks when you need the outer this

////////////////////////////////////////////////////////////////
// 6. this IN A CLASS
////////////////////////////////////////////////////////////////

class Counter {
  count = 0;

  increment() {
    this.count++;
  }

  // Class methods lose this when detached — same trap as objects
  // Fix: define as class field arrow function
  decrement = () => {
    this.count--; // this always bound to instance
  };
}

const c = new Counter();
const { increment, decrement } = c;
// increment(); // this is undefined — class bodies run in strict mode
decrement();    // works — arrow field always has the correct this

////////////////////////////////////////////////////////////////
// 7. call / apply / bind — explicit this control
////////////////////////////////////////////////////////////////

function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const bob = { name: 'Bob' };
const ana = { name: 'Ana' };

// call — invoke immediately, arguments one by one
introduce.call(bob, 'Hello', '!');     // "Hello, I'm Bob!"

// apply — invoke immediately, arguments as array
introduce.apply(ana, ['Hey', '?']);    // "Hey, I'm Ana?"

// bind — returns a NEW function with this permanently set
const introduceBob = introduce.bind(bob, 'Hi');
introduceBob('.');  // "Hi, I'm Bob."
introduceBob('!');  // "Hi, I'm Bob!" — 'Hi' was pre-applied

// Tip: bind is also useful for event listeners
document.addEventListener('click', user.greet.bind(user));

////////////////////////////////////////////////////////////////
// 8. this IN A CONSTRUCTOR (new keyword)
////////////////////////////////////////////////////////////////

function Person(name) {
  this.name = name; // new creates a fresh object and sets this to it
}

const p = new Person('Clara');
console.log(p.name); // "Clara"

// What new actually does:
// 1. Creates a new empty object {}
// 2. Sets its __proto__ to Person.prototype
// 3. Calls Person with this = that new object
// 4. Returns the new object (unless constructor explicitly returns another object)

////////////////////////////////////////////////////////////////
// 9. CALL-SITE DETERMINES this — priority order
////////////////////////////////////////////////////////////////

// From highest to lowest priority:
// 1. new binding        → new Fn()              → this = new object
// 2. Explicit binding   → fn.call/apply/bind()  → this = specified object
// 3. Method binding     → obj.fn()              → this = obj
// 4. Default binding    → fn()                  → this = global (or undefined in strict)
// Arrow functions are exempt — they capture lexically at DEFINITION time

////////////////////////////////////////////////////////////////
// 10. QUICK REFERENCE — what is this in each context?
////////////////////////////////////////////////////////////////

// | Context                       | this           |
// |-------------------------------|----------------|
// | Global scope (browser)        | window         |
// | Global scope (strict/module)  | undefined      |
// | Regular function (non-strict) | window         |
// | Regular function (strict)     | undefined      |
// | Method call obj.fn()          | obj            |
// | Arrow function                | outer this     |
// | Constructor (new Fn())        | new instance   |
// | fn.call(ctx)                  | ctx            |
// | fn.bind(ctx)                  | ctx (always)   |
// | Class method                  | instance       |

////////////////////////////////////////////////////////////////
// 11. PRACTICAL PATTERN — save this for callbacks
////////////////////////////////////////////////////////////////

// Old pattern (pre-arrow functions):
function OldTimer() {
  const self = this; // capture this into a variable
  setInterval(function () {
    self.tick++; // use self instead of this
  }, 1000);
}

// Modern pattern: just use arrow functions
class ModernTimer {
  tick = 0;
  start() {
    setInterval(() => this.tick++, 1000); // arrow inherits this
  }
}
