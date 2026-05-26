////////////////////////////////////////////////////////////////
// EVENT LISTENERS (addEventListener / removeEventListener)
////////////////////////////////////////////////////////////////

const button = document.querySelector("#myBtn");

// Add event listener
button.addEventListener("click", function(event) {
  console.log("Button clicked!");
  console.log("Event type:", event.type);       // "click"
  console.log("Target:", event.target);          // the element clicked
  console.log("Current target:", event.currentTarget); // the element with the listener
});

// Named function (required for removal)
function handleClick(event) {
  console.log("Clicked!", event.target);
}
button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);

// Options parameter
button.addEventListener("click", handleClick, {
  once: true,      // auto-removes after first trigger
  capture: false,  // use capture phase (default: false)
  passive: true    // won't call preventDefault (improves scroll perf)
});

////////////////////////////////////////////////////////////////
// MOUSE EVENTS
////////////////////////////////////////////////////////////////

const box = document.querySelector("#box");

box.addEventListener("click", (e) => {
  console.log("Click at:", e.clientX, e.clientY);   // viewport coords
  console.log("Page pos:", e.pageX, e.pageY);       // page coords (includes scroll)
  console.log("Button:", e.button);                  // 0=left, 1=middle, 2=right
});

box.addEventListener("dblclick", () => console.log("Double click!"));
box.addEventListener("mousedown", () => console.log("Mouse button pressed"));
box.addEventListener("mouseup", () => console.log("Mouse button released"));

box.addEventListener("mouseenter", () => console.log("Mouse entered (no bubble)"));
box.addEventListener("mouseleave", () => console.log("Mouse left (no bubble)"));
box.addEventListener("mouseover", () => console.log("Mouse over (bubbles)"));
box.addEventListener("mouseout", () => console.log("Mouse out (bubbles)"));

box.addEventListener("mousemove", (e) => {
  // Fires continuously while moving inside element
  console.log("Moving:", e.offsetX, e.offsetY); // coords relative to element
});

box.addEventListener("contextmenu", (e) => {
  e.preventDefault(); // prevent right-click menu
  console.log("Custom right-click menu here");
});

////////////////////////////////////////////////////////////////
// KEYBOARD EVENTS
////////////////////////////////////////////////////////////////

document.addEventListener("keydown", (e) => {
  console.log("Key:", e.key);         // "a", "Enter", "ArrowUp", "Shift"
  console.log("Code:", e.code);       // "KeyA", "Enter", "ArrowUp", "ShiftLeft"
  console.log("Repeat:", e.repeat);   // true if held down

  // Modifier keys
  console.log("Ctrl:", e.ctrlKey);
  console.log("Shift:", e.shiftKey);
  console.log("Alt:", e.altKey);
  console.log("Meta:", e.metaKey);    // Cmd on Mac, Win on Windows
});

document.addEventListener("keyup", (e) => {
  console.log("Released:", e.key);
});

// Common patterns
document.addEventListener("keydown", (e) => {
  // Ctrl+S to save
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    console.log("Save triggered!");
  }

  // Escape to close
  if (e.key === "Escape") {
    console.log("Close modal / menu");
  }

  // Arrow key navigation
  if (e.key === "ArrowUp") console.log("Navigate up");
  if (e.key === "ArrowDown") console.log("Navigate down");
});

////////////////////////////////////////////////////////////////
// FORM EVENTS
////////////////////////////////////////////////////////////////

const form = document.querySelector("form");
const input = document.querySelector("input");

// Submit event (on <form>)
form.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent page reload
  const formData = new FormData(form);
  console.log("Form data:", Object.fromEntries(formData));
});

// Input event (fires on every change, including paste)
input.addEventListener("input", (e) => {
  console.log("Current value:", e.target.value);
  console.log("Input type:", e.inputType); // "insertText", "deleteContentBackward", etc.
});

// Change event (fires when value is committed - blur or Enter)
input.addEventListener("change", (e) => {
  console.log("Final value:", e.target.value);
});

// Focus / Blur
input.addEventListener("focus", () => console.log("Input focused"));
input.addEventListener("blur", () => console.log("Input lost focus"));
input.addEventListener("focusin", () => console.log("Focus in (bubbles)"));
input.addEventListener("focusout", () => console.log("Focus out (bubbles)"));

// Select (text selection in input/textarea)
input.addEventListener("select", (e) => {
  console.log("Selected:", e.target.value.substring(
    e.target.selectionStart, e.target.selectionEnd
  ));
});

////////////////////////////////////////////////////////////////
// EVENT PROPAGATION (Bubbling & Capturing)
////////////////////////////////////////////////////////////////

// Events travel in 3 phases:
// 1. Capturing: window → document → ... → parent → target
// 2. Target: the element that triggered the event
// 3. Bubbling: target → parent → ... → document → window

const outer = document.querySelector("#outer");
const inner = document.querySelector("#inner");

// Bubbling (default) - fires from target UP
outer.addEventListener("click", () => console.log("Outer clicked (bubble)"));
inner.addEventListener("click", () => console.log("Inner clicked (bubble)"));
// Click inner → "Inner clicked" → "Outer clicked"

// Capturing - fires from top DOWN
outer.addEventListener("click", () => console.log("Outer clicked (capture)"), true);
// Click inner → "Outer clicked (capture)" → "Inner clicked" → "Outer clicked (bubble)"

// Stop propagation
inner.addEventListener("click", (e) => {
  e.stopPropagation();    // prevents event from reaching parent
  console.log("Only inner fires");
});

// Stop immediate propagation (also prevents other listeners on same element)
inner.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  console.log("Only this handler fires");
});

////////////////////////////////////////////////////////////////
// EVENT DELEGATION
////////////////////////////////////////////////////////////////

// Instead of adding listeners to each child, listen on parent
const list = document.querySelector("#todo-list");

list.addEventListener("click", (e) => {
  // Find the closest <li> that was clicked
  const item = e.target.closest("li");
  if (!item) return; // click wasn't on an li
  if (!list.contains(item)) return; // safety check

  console.log("Clicked item:", item.textContent);
  item.classList.toggle("done");
});

// Works for dynamically added items too!
const newItem = document.createElement("li");
newItem.textContent = "New task";
list.appendChild(newItem);
// The click handler above automatically works for this new item

// Delegation with data attributes
list.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest("[data-action='delete']");
  if (deleteBtn) {
    const li = deleteBtn.closest("li");
    li.remove();
    return;
  }

  const editBtn = e.target.closest("[data-action='edit']");
  if (editBtn) {
    const li = editBtn.closest("li");
    console.log("Edit:", li.textContent);
  }
});

////////////////////////////////////////////////////////////////
// SCROLL EVENTS
////////////////////////////////////////////////////////////////

window.addEventListener("scroll", () => {
  console.log("Scroll Y:", window.scrollY);
  console.log("Scroll X:", window.scrollX);

  // How far scrolled as percentage
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (window.scrollY / maxScroll) * 100;
  console.log("Scrolled:", percent.toFixed(1) + "%");
}, { passive: true }); // passive for better performance

// Scroll to position
window.scrollTo({ top: 0, behavior: "smooth" });
window.scrollBy({ top: 100, behavior: "smooth" }); // relative scroll

// Element scroll
const container = document.querySelector(".scroll-container");
container.addEventListener("scroll", (e) => {
  console.log("Container scrollTop:", e.target.scrollTop);
});

// Intersection Observer (better than scroll events for visibility)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      console.log("Element visible:", entry.target.id);
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.5 }); // 50% visible

document.querySelectorAll(".animate-on-scroll").forEach((el) => {
  observer.observe(el);
});

////////////////////////////////////////////////////////////////
// DRAG & DROP EVENTS
////////////////////////////////////////////////////////////////

const draggable = document.querySelector("[draggable]");
const dropZone = document.querySelector("#drop-zone");

draggable.addEventListener("dragstart", (e) => {
  e.dataTransfer.setData("text/plain", e.target.id);
  e.dataTransfer.effectAllowed = "move";
  e.target.classList.add("dragging");
});

draggable.addEventListener("dragend", (e) => {
  e.target.classList.remove("dragging");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault(); // required to allow drop
  e.dataTransfer.dropEffect = "move";
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  const element = document.getElementById(id);
  dropZone.appendChild(element);
  dropZone.classList.remove("drag-over");
});

////////////////////////////////////////////////////////////////
// WINDOW / DOCUMENT EVENTS
////////////////////////////////////////////////////////////////

// Page lifecycle
window.addEventListener("load", () => console.log("Page fully loaded (images too)"));
window.addEventListener("DOMContentLoaded", () => console.log("DOM ready (no images)"));
window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  // Modern browsers show a generic message
  // e.returnValue = ""; // required for some browsers
});
window.addEventListener("unload", () => console.log("Page unloading"));

// Window resize
window.addEventListener("resize", () => {
  console.log("Window size:", window.innerWidth, "x", window.innerHeight);
});

// Visibility change (tab hidden/visible)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("Tab hidden - pause animations/timers");
  } else {
    console.log("Tab visible - resume");
  }
});

// Online / Offline
window.addEventListener("online", () => console.log("Back online!"));
window.addEventListener("offline", () => console.log("Went offline!"));

////////////////////////////////////////////////////////////////
// TOUCH EVENTS (mobile)
////////////////////////////////////////////////////////////////

const touchArea = document.querySelector("#touch-area");

touchArea.addEventListener("touchstart", (e) => {
  const touch = e.touches[0]; // first finger
  console.log("Touch start:", touch.clientX, touch.clientY);
  console.log("Fingers:", e.touches.length);
});

touchArea.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  console.log("Touch move:", touch.clientX, touch.clientY);
  // e.preventDefault(); // prevents scrolling (needs { passive: false })
});

touchArea.addEventListener("touchend", (e) => {
  console.log("Touch end. Changed:", e.changedTouches.length);
});

////////////////////////////////////////////////////////////////
// CUSTOM EVENTS
////////////////////////////////////////////////////////////////

// Create and dispatch custom events
const customEvent = new CustomEvent("userLogin", {
  detail: { username: "Ana", role: "admin" },
  bubbles: true,    // allow bubbling
  cancelable: true  // allow preventDefault
});

document.addEventListener("userLogin", (e) => {
  console.log("User logged in:", e.detail.username);
  console.log("Role:", e.detail.role);
});

document.dispatchEvent(customEvent);

// Simple event (no data)
const simpleEvent = new Event("dataReady");
document.dispatchEvent(simpleEvent);

// Custom event on specific element
const card = document.querySelector(".card");
card.addEventListener("cardFlip", (e) => {
  console.log("Card flipped!", e.detail.side);
});

card.dispatchEvent(new CustomEvent("cardFlip", {
  detail: { side: "back" }
}));

////////////////////////////////////////////////////////////////
// ABORT CONTROLLER (cancel event listeners)
////////////////////////////////////////////////////////////////

const controller = new AbortController();

// Add multiple listeners that can be cancelled together
button.addEventListener("click", handleClick, { signal: controller.signal });
window.addEventListener("resize", handleResize, { signal: controller.signal });
document.addEventListener("keydown", handleKey, { signal: controller.signal });

// Remove ALL listeners at once
controller.abort();
// All three listeners above are now removed

// Useful for cleanup in components or modal dialogs
function openModal() {
  const ac = new AbortController();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  }, { signal: ac.signal });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("overlay")) closeModal();
  }, { signal: ac.signal });

  function closeModal() {
    ac.abort(); // clean up all listeners
    modal.remove();
  }
}
