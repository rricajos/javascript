////////////////////////////////////////////////////////////////
// URL API
////////////////////////////////////////////////////////////////

const url = new URL("https://example.com:8080/path/page?q=hello&lang=es#section1");

url.href;       // "https://example.com:8080/path/page?q=hello&lang=es#section1"
url.protocol;   // "https:"
url.hostname;   // "example.com"
url.port;       // "8080"
url.host;       // "example.com:8080"
url.pathname;   // "/path/page"
url.search;     // "?q=hello&lang=es"
url.hash;       // "#section1"
url.origin;     // "https://example.com:8080"

// URLSearchParams
const params = url.searchParams;
params.get("q");          // "hello"
params.get("lang");       // "es"
params.has("q");          // true
params.getAll("q");       // ["hello"]

params.set("q", "world"); // change value
params.append("page", "1"); // add new param
params.delete("lang");    // remove param
params.toString();         // "q=world&page=1"

// Create URL from parts
const newUrl = new URL("/api/users", "https://api.example.com");
newUrl.searchParams.set("limit", "10");
newUrl.href; // "https://api.example.com/api/users?limit=10"

// Parse query string from current page
const currentParams = new URLSearchParams(window.location.search);

////////////////////////////////////////////////////////////////
// FORMDATA
////////////////////////////////////////////////////////////////

// Create from HTML form
const form = document.querySelector("form");
const formData = new FormData(form);

// Create manually
const data = new FormData();
data.append("username", "Ana");
data.append("email", "ana@mail.com");
data.append("avatar", fileInput.files[0]); // file upload

// Read values
data.get("username");    // "Ana"
data.has("email");       // true
data.getAll("username"); // ["Ana"]

// Iterate
for (const [key, value] of data.entries()) {
  console.log(key, value);
}

// Send with fetch
fetch("/api/profile", {
  method: "POST",
  body: data // Content-Type set automatically for multipart
});

// Convert to plain object
const obj = Object.fromEntries(data.entries());

// Convert to URLSearchParams (for x-www-form-urlencoded)
const urlParams = new URLSearchParams(data);

////////////////////////////////////////////////////////////////
// HISTORY API (browser navigation)
////////////////////////////////////////////////////////////////

// Push new entry to history (changes URL without page reload)
history.pushState({ page: 2 }, "Page 2", "/page/2");

// Replace current entry
history.replaceState({ page: 1 }, "Page 1", "/page/1");

// Navigate back/forward
history.back();       // same as browser back button
history.forward();    // same as browser forward button
history.go(-2);       // go back 2 pages
history.go(0);        // reload current page

// Listen for navigation (back/forward button)
window.addEventListener("popstate", function(event) {
  console.log("State:", event.state); // the state object from pushState
  console.log("URL:", window.location.href);
});

// Current state
history.state;        // state object of current entry
history.length;       // number of entries in history

////////////////////////////////////////////////////////////////
// LOCATION OBJECT
////////////////////////////////////////////////////////////////

window.location.href;      // full URL
window.location.hostname;  // "example.com"
window.location.pathname;  // "/page/1"
window.location.search;    // "?q=hello"
window.location.hash;      // "#section"
window.location.protocol;  // "https:"
window.location.port;      // "8080"

// Navigate
window.location.href = "https://example.com"; // full redirect
window.location.assign("https://example.com"); // same, with history
window.location.replace("https://example.com"); // no history entry
window.location.reload();   // reload page

////////////////////////////////////////////////////////////////
// CLIPBOARD API
////////////////////////////////////////////////////////////////

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Copied!");
  } catch (err) {
    console.error("Copy failed:", err);
  }
}

// Read from clipboard
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    console.log("Pasted:", text);
    return text;
  } catch (err) {
    console.error("Paste failed:", err);
  }
}

// Legacy fallback
function copyLegacy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

////////////////////////////////////////////////////////////////
// GEOLOCATION API
////////////////////////////////////////////////////////////////

// Get current position
navigator.geolocation.getCurrentPosition(
  function(position) {
    console.log("Lat:", position.coords.latitude);
    console.log("Lng:", position.coords.longitude);
    console.log("Accuracy:", position.coords.accuracy, "meters");
  },
  function(error) {
    console.error("Geolocation error:", error.message);
    // error.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);

// Watch position (continuous updates)
const watchId = navigator.geolocation.watchPosition(
  function(position) { console.log(position.coords); },
  function(error) { console.error(error); }
);

// Stop watching
navigator.geolocation.clearWatch(watchId);

////////////////////////////////////////////////////////////////
// NOTIFICATIONS API
////////////////////////////////////////////////////////////////

// Request permission
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  // "granted", "denied", or "default"
  return permission;
}

// Show notification (after permission granted)
function showNotification(title, body) {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body: body,
      icon: "/icons/favicon-32x32.png"
    });

    notification.onclick = function() {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
}

////////////////////////////////////////////////////////////////
// DIALOG METHODS (built-in browser dialogs)
////////////////////////////////////////////////////////////////

// Alert (blocks execution)
alert("Hello!"); // OK button only

// Confirm (returns boolean)
const confirmed = confirm("Are you sure?"); // OK / Cancel
// true if OK, false if Cancel

// Prompt (returns string or null)
const name = prompt("What's your name?", "default value");
// Returns input string or null if cancelled

// Note: these are blocking and bad UX. Use custom modals instead.

////////////////////////////////////////////////////////////////
// TIMERS
////////////////////////////////////////////////////////////////

// setTimeout - execute once after delay
const timeoutId = setTimeout(function() {
  console.log("After 2 seconds");
}, 2000);

clearTimeout(timeoutId); // cancel before it fires

// setInterval - execute repeatedly at interval
const intervalId = setInterval(function() {
  console.log("Every second");
}, 1000);

clearInterval(intervalId); // stop repeating

// requestAnimationFrame - synced with screen refresh (~60fps)
function animate() {
  // update visual state
  requestAnimationFrame(animate); // schedule next frame
}
const frameId = requestAnimationFrame(animate);
cancelAnimationFrame(frameId); // stop

// queueMicrotask - runs before next render
queueMicrotask(() => console.log("Microtask"));

////////////////////////////////////////////////////////////////
// NAVIGATOR OBJECT
////////////////////////////////////////////////////////////////

navigator.userAgent;          // browser user agent string
navigator.language;           // "es" or "en-US"
navigator.languages;          // ["es", "en", "fr"]
navigator.onLine;             // true / false
navigator.cookieEnabled;      // true / false
navigator.hardwareConcurrency; // number of CPU cores
navigator.maxTouchPoints;     // 0 for non-touch devices

// Detect online/offline
window.addEventListener("online", () => console.log("Back online!"));
window.addEventListener("offline", () => console.log("Went offline!"));

////////////////////////////////////////////////////////////////
// FULLSCREEN API
////////////////////////////////////////////////////////////////

// Enter fullscreen
async function enterFullscreen(element) {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  }
}

// Exit fullscreen
async function exitFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  }
}

// Check if fullscreen
document.fullscreenElement; // the element in fullscreen, or null

// Listen for fullscreen change
document.addEventListener("fullscreenchange", function() {
  console.log("Fullscreen:", !!document.fullscreenElement);
});
