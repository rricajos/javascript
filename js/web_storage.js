////////////////////////////////////////////////////////////////
// LOCAL STORAGE (persists after closing browser)
////////////////////////////////////////////////////////////////

// Set items (key-value, both must be strings)
localStorage.setItem("username", "Ana");
localStorage.setItem("theme", "dark");
localStorage.setItem("fontSize", "16");

// Get items
localStorage.getItem("username");   // "Ana"
localStorage.getItem("missing");    // null (key doesn't exist)

// Remove specific item
localStorage.removeItem("fontSize");

// Clear all items
localStorage.clear();

// Number of stored items
localStorage.length; // 2

// Access by index (order not guaranteed)
localStorage.key(0); // returns key name at index 0

// Iterate all items
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
}

////////////////////////////////////////////////////////////////
// STORING OBJECTS & ARRAYS (must serialize to JSON)
////////////////////////////////////////////////////////////////

// Store object
const user = { name: "Ana", age: 30, roles: ["admin", "user"] };
localStorage.setItem("user", JSON.stringify(user));

// Retrieve object
const stored = JSON.parse(localStorage.getItem("user"));
// { name: "Ana", age: 30, roles: ["admin", "user"] }

// Store array
const todos = ["Buy milk", "Walk dog", "Code"];
localStorage.setItem("todos", JSON.stringify(todos));

// Retrieve array
const storedTodos = JSON.parse(localStorage.getItem("todos"));

// Safe parse helper (handles null and invalid JSON)
function getJSON(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

getJSON("user");         // { name: "Ana", ... }
getJSON("missing", []);  // [] (fallback)

////////////////////////////////////////////////////////////////
// SESSION STORAGE (cleared when tab closes)
////////////////////////////////////////////////////////////////

// Same API as localStorage, but scoped to the tab/session
sessionStorage.setItem("token", "abc123");
sessionStorage.getItem("token"); // "abc123"
sessionStorage.removeItem("token");
sessionStorage.clear();

// Use cases:
// - Form data that shouldn't persist
// - Temporary auth tokens
// - One-time messages/alerts
// - Shopping cart in a single session

////////////////////////////////////////////////////////////////
// STORAGE EVENT (cross-tab communication)
////////////////////////////////////////////////////////////////

// Fires when localStorage changes in ANOTHER tab (same origin)
window.addEventListener("storage", function(event) {
  console.log("Key changed:", event.key);
  console.log("Old value:", event.oldValue);
  console.log("New value:", event.newValue);
  console.log("URL:", event.url);
});

// Does NOT fire in the same tab that made the change
// Only fires for localStorage, not sessionStorage

////////////////////////////////////////////////////////////////
// COOKIES
////////////////////////////////////////////////////////////////

// Set a cookie
document.cookie = "username=Ana";
document.cookie = "theme=dark";

// Set with options
document.cookie = "token=abc123; max-age=86400; path=/; secure; samesite=strict";

// Cookie options:
// max-age=seconds  - expiration in seconds
// expires=date     - expiration as Date string
// path=/           - accessible from all paths
// domain=site.com  - accessible from domain
// secure           - HTTPS only
// samesite=strict  - prevents CSRF (strict/lax/none)
// httponly          - not accessible from JS (server-set only)

// Read all cookies (returns single string)
document.cookie; // "username=Ana; theme=dark; token=abc123"

// Parse cookies into object
function getCookies() {
  return document.cookie.split("; ").reduce(function(obj, pair) {
    const [key, value] = pair.split("=");
    if (key) obj[decodeURIComponent(key)] = decodeURIComponent(value || "");
    return obj;
  }, {});
}

getCookies(); // { username: "Ana", theme: "dark", token: "abc123" }

// Get single cookie
function getCookie(name) {
  const cookies = getCookies();
  return cookies[name] || null;
}

getCookie("username"); // "Ana"

// Delete cookie (set max-age to 0)
document.cookie = "token=; max-age=0; path=/";

////////////////////////////////////////////////////////////////
// localStorage vs sessionStorage vs COOKIES
////////////////////////////////////////////////////////////////

// | Feature        | localStorage | sessionStorage | Cookie          |
// |---------------|-------------|---------------|-----------------|
// | Capacity      | ~5-10 MB    | ~5-10 MB      | ~4 KB           |
// | Expires       | Never       | Tab close     | Set by max-age  |
// | Sent to server| No          | No            | Yes (every req) |
// | Scope         | Origin      | Origin + Tab  | Path + Domain   |
// | API           | Simple      | Simple        | String-based    |

////////////////////////////////////////////////////////////////
// INDEXEDDB (brief overview - for larger data)
////////////////////////////////////////////////////////////////

// IndexedDB is a low-level API for storing large amounts of structured data
// Supports indexes, transactions, and queries

// Open database
const request = indexedDB.open("MyDatabase", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  // Create object store (like a table)
  const store = db.createObjectStore("users", { keyPath: "id" });
  store.createIndex("name", "name", { unique: false });
};

request.onsuccess = function(event) {
  const db = event.target.result;

  // Add data
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  store.add({ id: 1, name: "Ana", age: 30 });
  store.add({ id: 2, name: "Luis", age: 25 });

  // Read data
  const getTx = db.transaction("users", "readonly");
  const getStore = getTx.objectStore("users");
  const getRequest = getStore.get(1);
  getRequest.onsuccess = function() {
    console.log(getRequest.result); // { id: 1, name: "Ana", age: 30 }
  };
};

// IndexedDB is complex - consider using a wrapper library like idb or Dexie.js
