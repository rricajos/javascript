////////////////////////////////////////////////////////////////
// CLASS DECLARATION
////////////////////////////////////////////////////////////////

class Animal {
  // Constructor - called when creating new instance
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  // Instance method
  speak() {
    return `${this.name} says ${this.sound}!`;
  }

  // toString override
  toString() {
    return `Animal(${this.name})`;
  }
}

const dog = new Animal("Rex", "Woof");
dog.speak();      // "Rex says Woof!"
dog.name;         // "Rex"
dog.toString();   // "Animal(Rex)"

////////////////////////////////////////////////////////////////
// INHERITANCE (extends)
////////////////////////////////////////////////////////////////

class Dog extends Animal {
  constructor(name, breed) {
    super(name, "Woof"); // must call super() before using 'this'
    this.breed = breed;
  }

  // Override parent method
  speak() {
    return `${this.name} the ${this.breed} barks: ${this.sound}!`;
  }

  // New method
  fetch(item) {
    return `${this.name} fetches the ${item}`;
  }
}

const myDog = new Dog("Rex", "Labrador");
myDog.speak();         // "Rex the Labrador barks: Woof!"
myDog.fetch("ball");   // "Rex fetches the ball"

// instanceof
myDog instanceof Dog;    // true
myDog instanceof Animal; // true

////////////////////////////////////////////////////////////////
// STATIC METHODS & PROPERTIES
////////////////////////////////////////////////////////////////

class MathUtils {
  static PI = 3.14159;

  static add(a, b) {
    return a + b;
  }

  static isEven(n) {
    return n % 2 === 0;
  }
}

// Called on the class, NOT on instances
MathUtils.PI;          // 3.14159
MathUtils.add(2, 3);   // 5
MathUtils.isEven(4);   // true

// const m = new MathUtils();
// m.add(2, 3); // TypeError: m.add is not a function

// Factory pattern with static method
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }

  static createAdmin(name) {
    return new User(name, "admin");
  }

  static createGuest() {
    return new User("Guest", "guest");
  }
}

const admin = User.createAdmin("Ana");  // { name: "Ana", role: "admin" }
const guest = User.createGuest();       // { name: "Guest", role: "guest" }

////////////////////////////////////////////////////////////////
// GETTERS & SETTERS
////////////////////////////////////////////////////////////////

class Circle {
  constructor(radius) {
    this._radius = radius; // convention: _ prefix for "private"
  }

  // Getter - accessed like a property
  get radius() {
    return this._radius;
  }

  // Setter - assigned like a property
  set radius(value) {
    if (value < 0) throw new RangeError("Radius must be positive");
    this._radius = value;
  }

  get area() {
    return Math.PI * this._radius ** 2;
  }

  get circumference() {
    return 2 * Math.PI * this._radius;
  }
}

const c = new Circle(5);
c.radius;          // 5 (calls getter)
c.area;            // 78.539... (computed property)
c.circumference;   // 31.415...
c.radius = 10;     // calls setter
// c.radius = -1;  // RangeError: Radius must be positive

////////////////////////////////////////////////////////////////
// PRIVATE FIELDS & METHODS (# prefix)
////////////////////////////////////////////////////////////////

class BankAccount {
  #balance = 0; // private field
  #owner;

  constructor(owner, initialBalance) {
    this.#owner = owner;
    this.#balance = initialBalance;
  }

  // Private method
  #validateAmount(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
  }

  deposit(amount) {
    this.#validateAmount(amount);
    this.#balance += amount;
    return this.#balance;
  }

  withdraw(amount) {
    this.#validateAmount(amount);
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    return this.#balance;
  }

  get balance() {
    return this.#balance;
  }

  get owner() {
    return this.#owner;
  }
}

const account = new BankAccount("Ana", 1000);
account.deposit(500);   // 1500
account.withdraw(200);  // 1300
account.balance;        // 1300
// account.#balance;    // SyntaxError: Private field

////////////////////////////////////////////////////////////////
// ABSTRACT-LIKE PATTERN (JS doesn't have abstract keyword)
////////////////////////////////////////////////////////////////

class Shape {
  constructor(name) {
    if (new.target === Shape) {
      throw new Error("Shape is abstract, use a subclass");
    }
    this.name = name;
  }

  // "Abstract" method - must be overridden
  area() {
    throw new Error("Method area() must be implemented");
  }

  describe() {
    return `${this.name} with area ${this.area()}`;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super("Rectangle");
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super("Triangle");
    this.base = base;
    this.height = height;
  }

  area() {
    return (this.base * this.height) / 2;
  }
}

// const s = new Shape("x"); // Error: Shape is abstract
const rect = new Rectangle(10, 5);
rect.area();      // 50
rect.describe();  // "Rectangle with area 50"

////////////////////////////////////////////////////////////////
// MIXINS (multiple behavior composition)
////////////////////////////////////////////////////////////////

// Mixin functions
const Serializable = (Base) => class extends Base {
  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(json) {
    return Object.assign(new this(), JSON.parse(json));
  }
};

const Validatable = (Base) => class extends Base {
  validate() {
    for (let key of Object.keys(this)) {
      if (this[key] === null || this[key] === undefined) {
        throw new Error(`${key} is required`);
      }
    }
    return true;
  }
};

// Apply mixins
class Product extends Serializable(Validatable(class {})) {
  constructor(name, price) {
    super();
    this.name = name;
    this.price = price;
  }
}

const product = new Product("Laptop", 999);
product.validate();    // true
product.serialize();   // '{"name":"Laptop","price":999}'

////////////////////////////////////////////////////////////////
// PROTOTYPE CHAIN (under the hood)
////////////////////////////////////////////////////////////////

// Classes are syntactic sugar over prototypes
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hi, I'm ${this.name}`;
  }
}

// Equivalent without class:
function PersonOld(name) {
  this.name = name;
}
PersonOld.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

// Both work the same way
const p1 = new Person("Ana");
const p2 = new PersonOld("Luis");

p1.greet(); // "Hi, I'm Ana"
p2.greet(); // "Hi, I'm Luis"

// Checking the prototype chain
Object.getPrototypeOf(p1) === Person.prototype; // true

////////////////////////////////////////////////////////////////
// ITERABLES (Symbol.iterator)
////////////////////////////////////////////////////////////////

class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

const range = new Range(1, 5);
for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

[...range]; // [1, 2, 3, 4, 5]

////////////////////////////////////////////////////////////////
// THIS KEYWORD SUMMARY
////////////////////////////////////////////////////////////////

// 1. Global context: window (browser) / undefined (strict mode)
// 2. Object method: the object
// 3. Constructor/class: the new instance
// 4. Arrow function: inherits from enclosing scope
// 5. call/apply/bind: explicitly set
// 6. Event handler: the element (DOM)

class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    // Arrow function preserves 'this' from start()
    setInterval(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
}
