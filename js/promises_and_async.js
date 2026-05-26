////////////////////////////////////////////////////////////////
// CALLBACKS (the old way)
////////////////////////////////////////////////////////////////

// Callback pattern
function fetchData(url, callback) {
  setTimeout(() => {
    callback(null, { data: "result" });
  }, 1000);
}

fetchData("/api", (error, data) => {
  if (error) console.error(error);
  else console.log(data);
});

// Callback hell (pyramid of doom)
getUser(1, (err, user) => {
  getPosts(user.id, (err, posts) => {
    getComments(posts[0].id, (err, comments) => {
      // deeply nested, hard to read and maintain
    });
  });
});

////////////////////////////////////////////////////////////////
// PROMISES (the modern way)
////////////////////////////////////////////////////////////////

// Creating a Promise
const promise = new Promise((resolve, reject) => {
  const success = true;
  if (success) {
    resolve("Operation completed"); // fulfilled
  } else {
    reject(new Error("Operation failed")); // rejected
  }
});

// Consuming a Promise
promise
  .then(result => console.log(result))   // "Operation completed"
  .catch(error => console.error(error))
  .finally(() => console.log("Done"));   // always executes

// Promise states:
// 1. pending   - initial state
// 2. fulfilled - resolved successfully
// 3. rejected  - failed

////////////////////////////////////////////////////////////////
// CHAINING PROMISES
////////////////////////////////////////////////////////////////

function getUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: "Ana" }), 100);
  });
}

function getPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { id: 1, title: "Post 1" },
      { id: 2, title: "Post 2" }
    ]), 100);
  });
}

function getComments(postId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { id: 1, text: "Nice!" },
      { id: 2, text: "Great!" }
    ]), 100);
  });
}

// Chained (flat, readable)
getUser(1)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(error => console.error(error));

// Each .then() returns a new Promise

////////////////////////////////////////////////////////////////
// PROMISE STATIC METHODS
////////////////////////////////////////////////////////////////

const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);
const pFail = Promise.reject(new Error("Failed"));

// Promise.all - waits for ALL to resolve (rejects on first failure)
Promise.all([p1, p2, p3])
  .then(results => console.log(results)); // [1, 2, 3]

Promise.all([p1, pFail, p3])
  .catch(error => console.log(error.message)); // "Failed"

// Promise.allSettled - waits for ALL (never rejects)
Promise.allSettled([p1, pFail, p3])
  .then(results => console.log(results));
// [
//   { status: "fulfilled", value: 1 },
//   { status: "rejected", reason: Error("Failed") },
//   { status: "fulfilled", value: 3 }
// ]

// Promise.race - returns first to settle (resolve OR reject)
const slow = new Promise(r => setTimeout(() => r("slow"), 5000));
const fast = new Promise(r => setTimeout(() => r("fast"), 100));

Promise.race([slow, fast])
  .then(result => console.log(result)); // "fast"

// Promise.any - returns first to RESOLVE (ignores rejections)
Promise.any([pFail, p1, p2])
  .then(result => console.log(result)); // 1

// Promise.any with all rejected
Promise.any([pFail, Promise.reject("no")])
  .catch(error => console.log(error)); // AggregateError

// Promise.resolve / Promise.reject (shortcuts)
Promise.resolve(42);                    // immediately fulfilled
Promise.reject(new Error("Oops"));     // immediately rejected

////////////////////////////////////////////////////////////////
// ASYNC / AWAIT (syntactic sugar over Promises)
////////////////////////////////////////////////////////////////

// async function always returns a Promise
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user; // wrapped in Promise.resolve()
}

// Equivalent to:
function fetchUserPromise(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json());
}

// Using async/await
async function main() {
  try {
    const user = await getUser(1);
    const posts = await getPosts(user.id);
    const comments = await getComments(posts[0].id);
    console.log(comments);
  } catch (error) {
    console.error(error);
  }
}

main();

////////////////////////////////////////////////////////////////
// ASYNC PATTERNS
////////////////////////////////////////////////////////////////

// Sequential execution (one after another)
async function sequential() {
  const user = await getUser(1);     // waits...
  const posts = await getPosts(1);   // then waits...
  const comments = await getComments(1); // then waits...
  return { user, posts, comments };
}

// Parallel execution (all at once)
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    getUser(1),
    getPosts(1),
    getComments(1)
  ]);
  return { user, posts, comments };
}
// parallel() is faster because all requests start simultaneously

// Parallel with error handling per task
async function parallelSafe() {
  const results = await Promise.allSettled([
    getUser(1),
    getPosts(1),
    getComments(1)
  ]);

  return results.map(r =>
    r.status === "fulfilled" ? r.value : null
  );
}

////////////////////////////////////////////////////////////////
// ASYNC ITERATION
////////////////////////////////////////////////////////////////

// for await...of (async iterables)
async function* asyncRange(start, end) {
  for (let i = start; i <= end; i++) {
    await new Promise(r => setTimeout(r, 100));
    yield i;
  }
}

async function main2() {
  for await (let num of asyncRange(1, 5)) {
    console.log(num); // 1, 2, 3, 4, 5 (with delays)
  }
}

// Process array items sequentially
async function processSequentially(items) {
  const results = [];
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  return results;
}

// Process array items in parallel
async function processInParallel(items) {
  const results = await Promise.all(
    items.map(item => processItem(item))
  );
  return results;
}

////////////////////////////////////////////////////////////////
// FETCH API
////////////////////////////////////////////////////////////////

// GET request
async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

// POST request
async function postJSON(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// With AbortController (cancel requests)
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

////////////////////////////////////////////////////////////////
// PRACTICAL ASYNC PATTERNS
////////////////////////////////////////////////////////////////

// Retry with delay
async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

// Usage: retry(() => fetch("/api/data"), 3, 1000);

// Debounce (async)
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    return new Promise(resolve => {
      timeoutId = setTimeout(async () => {
        resolve(await fn.apply(this, args));
      }, delay);
    });
  };
}

// Throttle
function throttle(fn, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

// Sleep utility
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function example() {
  console.log("Start");
  await sleep(2000);
  console.log("After 2 seconds");
}
