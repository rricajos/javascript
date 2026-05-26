////////////////////////////////////////////////////////////////
// TRY / CATCH / FINALLY
////////////////////////////////////////////////////////////////

try {
  // code that might throw an error
  let result = riskyOperation();
  console.log(result);
} catch (error) {
  // handle the error
  console.error("Something went wrong:", error.message);
} finally {
  // always executes (whether error occurred or not)
  console.log("Cleanup code here");
}

// catch without variable (ES2019)
try {
  JSON.parse("invalid json");
} catch {
  console.log("Parse failed"); // no need for (error) if unused
}

////////////////////////////////////////////////////////////////
// ERROR OBJECT PROPERTIES
////////////////////////////////////////////////////////////////

try {
  null.property;
} catch (error) {
  error.name;       // "TypeError"
  error.message;    // "Cannot read properties of null"
  error.stack;      // full stack trace (non-standard but universal)
}

////////////////////////////////////////////////////////////////
// BUILT-IN ERROR TYPES
////////////////////////////////////////////////////////////////

// Error - generic error
new Error("Something went wrong");

// TypeError - wrong type operation
// null.toString();  // TypeError

// ReferenceError - undefined variable
// console.log(x);  // ReferenceError: x is not defined

// SyntaxError - invalid syntax
// eval("if (");    // SyntaxError

// RangeError - value outside allowed range
// new Array(-1);   // RangeError: Invalid array length

// URIError - malformed URI
// decodeURI("%");  // URIError

// EvalError - related to eval() (rarely used)

////////////////////////////////////////////////////////////////
// THROWING ERRORS
////////////////////////////////////////////////////////////////

// Throw a string (not recommended)
// throw "Something went wrong";

// Throw an Error object (recommended)
function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (error) {
  console.error(error.message); // "Division by zero"
}

// Throw specific error types
function setAge(age) {
  if (typeof age !== "number") {
    throw new TypeError("Age must be a number");
  }
  if (age < 0 || age > 150) {
    throw new RangeError("Age must be between 0 and 150");
  }
  return age;
}

////////////////////////////////////////////////////////////////
// CUSTOM ERRORS
////////////////////////////////////////////////////////////////

class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
  }
}

// Using custom errors
function findUser(id) {
  const users = [{ id: 1, name: "Ana" }];
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new NotFoundError("User", id);
  }
  return user;
}

try {
  findUser(99);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log(`${error.resource} not found: ${error.id}`);
  } else {
    throw error; // re-throw unexpected errors
  }
}

////////////////////////////////////////////////////////////////
// ERROR HANDLING PATTERNS
////////////////////////////////////////////////////////////////

// Catch specific error types
try {
  // some code
} catch (error) {
  if (error instanceof TypeError) {
    console.log("Type error:", error.message);
  } else if (error instanceof RangeError) {
    console.log("Range error:", error.message);
  } else {
    throw error; // re-throw if not handled
  }
}

// Re-throwing errors (handle partially, let caller handle rest)
function processData(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to parse data: ${error.message}`);
  }
}

////////////////////////////////////////////////////////////////
// PROMISE ERROR HANDLING
////////////////////////////////////////////////////////////////

// .catch()
fetch("https://api.example.com/data")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Fetch failed:", error));

// async/await with try/catch
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error.message);
    return null; // return fallback value
  }
}

// Promise.allSettled - handles mixed results
const results = await Promise.allSettled([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/comments")
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.error("Failed:", result.reason);
  }
});

////////////////////////////////////////////////////////////////
// GLOBAL ERROR HANDLERS
////////////////////////////////////////////////////////////////

// Browser: unhandled errors
window.addEventListener("error", (event) => {
  console.log("Unhandled error:", event.message);
});

// Browser: unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.log("Unhandled rejection:", event.reason);
  event.preventDefault(); // prevents default browser behavior
});

// Node.js equivalents
// process.on("uncaughtException", (error) => { ... });
// process.on("unhandledRejection", (reason) => { ... });

////////////////////////////////////////////////////////////////
// ERROR HANDLING BEST PRACTICES
////////////////////////////////////////////////////////////////

// 1. Always catch errors at the right level
// BAD: catching and silencing errors
try { riskyCode(); } catch (e) {} // silent failure

// GOOD: handle or propagate
try {
  riskyCode();
} catch (error) {
  console.error("Operation failed:", error.message);
  throw error; // or handle appropriately
}

// 2. Use specific error types
// BAD
throw new Error("invalid");

// GOOD
throw new TypeError("Expected a number, got string");

// 3. Clean up resources in finally
let connection;
try {
  connection = openConnection();
  // work with connection
} catch (error) {
  console.error(error);
} finally {
  connection?.close(); // always clean up
}

// 4. Fail fast - validate inputs early
function createUser(name, email) {
  if (!name) throw new ValidationError("name", "Name is required");
  if (!email) throw new ValidationError("email", "Email is required");
  // ... proceed with valid data
}
