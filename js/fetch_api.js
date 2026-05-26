////////////////////////////////////////////////////////////////
// BASIC FETCH (GET request)
////////////////////////////////////////////////////////////////

// fetch() returns a Promise that resolves to a Response object
fetch("https://api.example.com/users")
  .then(function(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json(); // parse JSON body (also returns a Promise)
  })
  .then(function(data) {
    console.log("Users:", data);
  })
  .catch(function(error) {
    console.error("Fetch failed:", error.message);
  });

// With async/await (cleaner)
async function getUsers() {
  try {
    const response = await fetch("https://api.example.com/users");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log("Users:", data);
    return data;
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
}

////////////////////////////////////////////////////////////////
// RESPONSE OBJECT
////////////////////////////////////////////////////////////////

const response = await fetch("/api/data");

// Status info
response.ok;          // true if status 200-299
response.status;      // 200, 404, 500, etc.
response.statusText;  // "OK", "Not Found", etc.
response.url;         // final URL (after redirects)
response.redirected;  // true if redirected
response.type;        // "basic", "cors", "opaque"

// Headers
response.headers.get("Content-Type");    // "application/json"
response.headers.get("X-Custom-Header"); // custom header value
response.headers.has("Authorization");   // true/false

// Body methods (can only be read ONCE)
const json = await response.json();       // parse as JSON
const text = await response.text();       // parse as text
const blob = await response.blob();       // parse as Blob (binary)
const buffer = await response.arrayBuffer(); // parse as ArrayBuffer
const formData = await response.formData();  // parse as FormData

// Clone response to read body multiple times
const clone = response.clone();
const json1 = await response.json();
const json2 = await clone.json(); // same data

////////////////////////////////////////////////////////////////
// POST REQUEST (sending data)
////////////////////////////////////////////////////////////////

// POST with JSON body
async function createUser(userData) {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // returns the created user
}

createUser({ name: "Ana", email: "ana@mail.com" });

// POST with FormData (file uploads)
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  formData.append("username", "Ana");

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData // Content-Type set automatically (multipart/form-data)
  });

  return response.json();
}

// POST with URL-encoded data
async function login(username, password) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ username, password })
  });

  return response.json();
}

////////////////////////////////////////////////////////////////
// OTHER HTTP METHODS
////////////////////////////////////////////////////////////////

// PUT (replace entire resource)
await fetch("/api/users/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ana Updated", email: "ana@new.com" })
});

// PATCH (partial update)
await fetch("/api/users/1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ana Updated" }) // only changed fields
});

// DELETE
await fetch("/api/users/1", {
  method: "DELETE"
});

// HEAD (like GET but no body - check if resource exists)
const headResponse = await fetch("/api/users/1", { method: "HEAD" });
console.log("Exists:", headResponse.ok);
console.log("Size:", headResponse.headers.get("Content-Length"));

////////////////////////////////////////////////////////////////
// REQUEST HEADERS & AUTHENTICATION
////////////////////////////////////////////////////////////////

// Bearer token (JWT)
await fetch("/api/protected", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  }
});

// Using Headers object
const headers = new Headers();
headers.append("Authorization", "Bearer token123");
headers.append("Accept", "application/json");

await fetch("/api/data", { headers });

// Common headers
// Content-Type:   what you're sending
// Accept:         what you want back
// Authorization:  auth credentials
// X-Custom-*:     custom headers

////////////////////////////////////////////////////////////////
// FETCH OPTIONS
////////////////////////////////////////////////////////////////

await fetch("/api/data", {
  method: "GET",                // HTTP method
  headers: {},                  // request headers
  body: null,                   // request body (not for GET/HEAD)
  mode: "cors",                 // "cors", "no-cors", "same-origin"
  credentials: "same-origin",   // "omit", "same-origin", "include"
  cache: "default",             // "default", "no-store", "reload", "no-cache"
  redirect: "follow",           // "follow", "manual", "error"
  referrer: "about:client",     // referrer URL
  signal: null                  // AbortSignal for cancellation
});

// credentials: "include" → sends cookies with cross-origin requests
// mode: "cors" → allows cross-origin requests (default)

////////////////////////////////////////////////////////////////
// ABORT CONTROLLER (cancel requests)
////////////////////////////////////////////////////////////////

const controller = new AbortController();

// Start fetch with abort signal
fetch("/api/slow-endpoint", {
  signal: controller.signal
})
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === "AbortError") {
      console.log("Request was cancelled");
    } else {
      console.error("Fetch error:", error);
    }
  });

// Cancel the request after 5 seconds
setTimeout(() => controller.abort(), 5000);

// Fetch with timeout helper
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

////////////////////////////////////////////////////////////////
// ERROR HANDLING PATTERNS
////////////////////////////////////////////////////////////////

// fetch only rejects on network errors (no internet, DNS failure)
// HTTP errors (404, 500) do NOT reject - you must check response.ok

// Robust fetch wrapper
async function apiFetch(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    // Network error (offline, CORS, DNS failure)
    throw new Error("Network error: " + error.message);
  }

  if (!response.ok) {
    // HTTP error (4xx, 5xx)
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  // Parse based on content type
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

// Usage
try {
  const data = await apiFetch("/api/users");
  console.log(data);
} catch (error) {
  console.error(error.message);
}

////////////////////////////////////////////////////////////////
// RETRY LOGIC
////////////////////////////////////////////////////////////////

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Exponential backoff: 1s, 2s, 4s...
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

////////////////////////////////////////////////////////////////
// PARALLEL & SEQUENTIAL REQUESTS
////////////////////////////////////////////////////////////////

// Parallel (all at once - faster)
async function fetchAllParallel() {
  const [users, posts, comments] = await Promise.all([
    fetch("/api/users").then(r => r.json()),
    fetch("/api/posts").then(r => r.json()),
    fetch("/api/comments").then(r => r.json())
  ]);
  return { users, posts, comments };
}

// Sequential (one after another - when order matters)
async function fetchSequential() {
  const user = await fetch("/api/users/1").then(r => r.json());
  const posts = await fetch(`/api/users/${user.id}/posts`).then(r => r.json());
  const comments = await fetch(`/api/posts/${posts[0].id}/comments`).then(r => r.json());
  return { user, posts, comments };
}

// Race (first response wins)
const fastest = await Promise.race([
  fetch("https://api1.example.com/data").then(r => r.json()),
  fetch("https://api2.example.com/data").then(r => r.json())
]);

////////////////////////////////////////////////////////////////
// STREAMING RESPONSE (reading in chunks)
////////////////////////////////////////////////////////////////

async function downloadWithProgress(url) {
  const response = await fetch(url);
  const contentLength = response.headers.get("Content-Length");
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;

    const percent = ((loaded / total) * 100).toFixed(1);
    console.log(`Downloaded: ${percent}%`);
  }

  // Combine chunks into single array
  const blob = new Blob(chunks);
  return blob;
}
