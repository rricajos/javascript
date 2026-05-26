////////////////////////////////////////////////////////////////
// TESTING BASICS IN JAVASCRIPT
////////////////////////////////////////////////////////////////

// Why test?
// - Catch bugs before production
// - Document expected behavior
// - Refactor with confidence
// - Improve code design (testable code = cleaner code)

////////////////////////////////////////////////////////////////
// ASSERTION BASICS (built-in)
////////////////////////////////////////////////////////////////

// console.assert - simplest form of testing
console.assert(1 + 1 === 2, "Math is broken");
console.assert(typeof "hello" === "string", "Should be a string");

// Manual assertion function
function assert(condition, message) {
  if (!condition) {
    throw new Error("Assertion failed: " + message);
  }
}

assert(Array.isArray([1, 2, 3]), "Should be an array");
assert("hello".length === 5, "String length should be 5");

// assertEquals helper
function assertEquals(actual, expected, message) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(
      (message || "Assertion failed") +
      "\n  Expected: " + e +
      "\n  Actual:   " + a
    );
  }
}

assertEquals(2 + 2, 4, "Addition");
assertEquals([1, 2, 3].length, 3, "Array length");
assertEquals({ a: 1 }.a, 1, "Object property");

////////////////////////////////////////////////////////////////
// TESTING PURE FUNCTIONS
////////////////////////////////////////////////////////////////

// Pure functions are easiest to test: same input = same output
function add(a, b) { return a + b; }
function multiply(a, b) { return a * b; }
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function isPalindrome(str) {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}

// Test suite for pure functions
assertEquals(add(2, 3), 5, "add: positive numbers");
assertEquals(add(-1, 1), 0, "add: negative + positive");
assertEquals(add(0, 0), 0, "add: zeros");

assertEquals(multiply(3, 4), 12, "multiply: basics");
assertEquals(multiply(0, 100), 0, "multiply: by zero");

assertEquals(capitalize("hello"), "Hello", "capitalize: lowercase");
assertEquals(capitalize("World"), "World", "capitalize: already caps");

assertEquals(isPalindrome("racecar"), true, "palindrome: racecar");
assertEquals(isPalindrome("hello"), false, "palindrome: hello");
assertEquals(isPalindrome("A man a plan a canal Panama"), true, "palindrome: phrase");
////////////////////////////////////////////////////////////////
// TEST RUNNER PATTERN
////////////////////////////////////////////////////////////////

// Simple test runner
function describe(suiteName, fn) {
  console.log("\n" + suiteName);
  fn();
}

function it(testName, fn) {
  try {
    fn();
    console.log("  ✓ " + testName);
  } catch (err) {
    console.log("  ✗ " + testName);
    console.log("    " + err.message);
  }
}

// Usage
describe("Array methods", function () {
  it("should push items", function () {
    const arr = [1, 2];
    arr.push(3);
    assertEquals(arr.length, 3);
    assertEquals(arr[2], 3);
  });

  it("should filter items", function () {
    const evens = [1, 2, 3, 4].filter(function (n) { return n % 2 === 0; });
    assertEquals(evens, [2, 4]);
  });

  it("should map items", function () {
    const doubled = [1, 2, 3].map(function (n) { return n * 2; });
    assertEquals(doubled, [2, 4, 6]);
  });
});

describe("String methods", function () {
  it("should trim whitespace", function () {
    assertEquals("  hello  ".trim(), "hello");
  });

  it("should split by delimiter", function () {
    assertEquals("a,b,c".split(","), ["a", "b", "c"]);
  });
});

////////////////////////////////////////////////////////////////
// TESTING ASYNC CODE
////////////////////////////////////////////////////////////////

// Testing promises
async function fetchUser(id) {
  // Simulated async operation
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve({ id: id, name: "User " + id });
    }, 10);
  });
}

async function testAsync() {
  const user = await fetchUser(1);
  assertEquals(user.id, 1, "User ID");
  assertEquals(user.name, "User 1", "User name");
  console.log("  ✓ async: fetchUser returns correct data");
}

// testAsync(); // Would run in real environment

// Testing error handling
async function testAsyncError() {
  try {
    await Promise.reject(new Error("Network error"));
    throw new Error("Should not reach here");
  } catch (err) {
    assertEquals(err.message, "Network error", "Error message");
    console.log("  ✓ async: rejects with correct error");
  }
}

////////////////////////////////////////////////////////////////
// MOCKING & SPYING
////////////////////////////////////////////////////////////////

// Simple mock function
function createMock() {
  const calls = [];
  const mockFn = function () {
    const args = Array.from(arguments);
    calls.push(args);
    return mockFn._returnValue;
  };
  mockFn.calls = calls;
  mockFn.callCount = function () { return calls.length; };
  mockFn.calledWith = function () {
    const expected = Array.from(arguments);
    return calls.some(function (call) {
      return JSON.stringify(call) === JSON.stringify(expected);
    });
  };
  mockFn.returns = function (val) { mockFn._returnValue = val; return mockFn; };
  return mockFn;
}

// Usage
const mockCallback = createMock();
mockCallback.returns(42);

[1, 2, 3].forEach(mockCallback);
assertEquals(mockCallback.callCount(), 3, "Called 3 times");
console.log("Mock was called with:", mockCallback.calls);

// Spy on existing function
function createSpy(obj, method) {
  const original = obj[method];
  const calls = [];
  obj[method] = function () {
    const args = Array.from(arguments);
    calls.push(args);
    return original.apply(obj, args);
  };
  obj[method].calls = calls;
  obj[method].restore = function () { obj[method] = original; };
  return obj[method];
}

////////////////////////////////////////////////////////////////
// TESTING PATTERNS
////////////////////////////////////////////////////////////////

// AAA Pattern: Arrange, Act, Assert
describe("Calculator (AAA pattern)", function () {
  it("should add two numbers", function () {
    // Arrange
    const a = 5, b = 3;

    // Act
    const result = add(a, b);

    // Assert
    assertEquals(result, 8);
  });
});

// Given-When-Then (BDD style)
describe("Shopping cart", function () {
  it("given empty cart, when item added, then cart has 1 item", function () {
    // Given
    const cart = [];

    // When
    cart.push({ name: "Book", price: 10 });

    // Then
    assertEquals(cart.length, 1);
    assertEquals(cart[0].name, "Book");
  });
});

// Edge case testing
describe("Edge cases", function () {
  it("should handle empty input", function () {
    assertEquals([].length, 0);
    assertEquals("".length, 0);
  });

  it("should handle null/undefined", function () {
    assertEquals(typeof null, "object");
    assertEquals(typeof undefined, "undefined");
  });

  it("should handle boundary values", function () {
    assertEquals(Number.MAX_SAFE_INTEGER, 9007199254740991);
    assert(Number.isFinite(42), "42 is finite");
    assert(!Number.isFinite(Infinity), "Infinity is not finite");
  });
});

////////////////////////////////////////////////////////////////
// POPULAR TESTING FRAMEWORKS (syntax examples)
////////////////////////////////////////////////////////////////

// Jest (most popular)
// test('adds 1 + 2 to equal 3', () => {
//   expect(add(1, 2)).toBe(3);
// });
//
// test('object assignment', () => {
//   const data = { one: 1 };
//   data.two = 2;
//   expect(data).toEqual({ one: 1, two: 2 });
// });
//
// test('null is falsy', () => {
//   expect(null).toBeFalsy();
//   expect(null).toBeNull();
//   expect(null).not.toBeUndefined();
// });

// Vitest (modern, Vite-compatible)
// import { describe, it, expect } from 'vitest';
//
// describe('math', () => {
//   it('should add', () => {
//     expect(1 + 1).toBe(2);
//   });
// });

// Mocha + Chai
// const { expect } = require('chai');
//
// describe('Array', () => {
//   it('should return -1 when not found', () => {
//     expect([1, 2, 3].indexOf(4)).to.equal(-1);
//   });
// });

// Node.js built-in test runner (v18+)
// import { test, describe } from 'node:test';
// import assert from 'node:assert';
//
// describe('my suite', () => {
//   test('adds numbers', () => {
//     assert.strictEqual(1 + 1, 2);
//   });
// });

////////////////////////////////////////////////////////////////
// CODE COVERAGE CONCEPTS
////////////////////////////////////////////////////////////////

// Coverage types:
// - Line coverage: which lines were executed
// - Branch coverage: which if/else branches were taken
// - Function coverage: which functions were called
// - Statement coverage: which statements were executed

// Example: testing branches
function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// 100% branch coverage requires testing all paths
assertEquals(getGrade(95), "A", "grade A");
assertEquals(getGrade(85), "B", "grade B");
assertEquals(getGrade(75), "C", "grade C");
assertEquals(getGrade(65), "D", "grade D");
assertEquals(getGrade(50), "F", "grade F");

// Tools: istanbul/nyc, c8, vitest --coverage

////////////////////////////////////////////////////////////////
// TDD (Test-Driven Development)
////////////////////////////////////////////////////////////////

// 1. RED:   Write a failing test first
// 2. GREEN: Write minimum code to pass
// 3. REFACTOR: Improve code while tests pass

// Example TDD cycle for a "unique" function:

// Step 1 - Write test
// it('should remove duplicates', () => {
//   assertEquals(unique([1, 2, 2, 3, 3, 3]), [1, 2, 3]);
// });

// Step 2 - Write implementation
function unique(arr) {
  return [...new Set(arr)];
}

// Step 3 - Verify and refactor
assertEquals(unique([1, 2, 2, 3, 3, 3]), [1, 2, 3], "unique: removes dupes");
assertEquals(unique([]), [], "unique: empty array");
assertEquals(unique([1, 1, 1]), [1], "unique: all same");
