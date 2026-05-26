////////////////////////////////////////////////////////////////
// SELECTING ELEMENTS
////////////////////////////////////////////////////////////////

// By ID (returns single element or null)
const header = document.getElementById("header");

// By class name (returns live HTMLCollection)
const items = document.getElementsByClassName("item");

// By tag name (returns live HTMLCollection)
const paragraphs = document.getElementsByTagName("p");

// querySelector (returns first match or null)
const first = document.querySelector(".item");
const nav = document.querySelector("nav > ul");
const input = document.querySelector('input[type="text"]');

// querySelectorAll (returns static NodeList)
const allItems = document.querySelectorAll(".item");
const links = document.querySelectorAll("a[href^='https']");

// querySelector vs getElementsByClassName:
// querySelector: static snapshot, supports any CSS selector
// getElementsByClassName: live collection, only class names, faster

////////////////////////////////////////////////////////////////
// TRAVERSING THE DOM
////////////////////////////////////////////////////////////////

const element = document.querySelector(".child");

// Parent
element.parentElement;          // direct parent
element.closest(".container");  // nearest ancestor matching selector

// Children
element.children;               // HTMLCollection of child elements
element.firstElementChild;      // first child element
element.lastElementChild;       // last child element
element.childElementCount;      // number of children

// Siblings
element.nextElementSibling;     // next sibling element
element.previousElementSibling; // previous sibling element

// Node-level (includes text nodes, comments)
element.parentNode;
element.childNodes;       // NodeList (includes text nodes)
element.firstChild;       // first child node
element.lastChild;        // last child node
element.nextSibling;      // next node (may be text)
element.previousSibling;  // previous node (may be text)

////////////////////////////////////////////////////////////////
// CREATING & INSERTING ELEMENTS
////////////////////////////////////////////////////////////////

// Create elements
const div = document.createElement("div");
const text = document.createTextNode("Hello");
const fragment = document.createDocumentFragment();

// Set content
div.textContent = "Plain text (no HTML parsing)";
div.innerHTML = "<strong>Bold</strong> text"; // parses HTML
div.innerText = "Visible text only";          // respects CSS display

// Append / Insert
const parent = document.getElementById("container");

parent.appendChild(div);                    // add to end
parent.prepend(div);                        // add to beginning
parent.append(div, "text", anotherEl);      // add multiple to end
parent.insertBefore(newEl, referenceEl);     // insert before specific child

// insertAdjacentHTML / insertAdjacentElement
element.insertAdjacentHTML("beforebegin", "<p>Before</p>"); // before element
element.insertAdjacentHTML("afterbegin", "<p>First child</p>"); // first child
element.insertAdjacentHTML("beforeend", "<p>Last child</p>"); // last child
element.insertAdjacentHTML("afterend", "<p>After</p>"); // after element

// Clone
const clone = div.cloneNode(true);  // true = deep clone (with children)
const shallow = div.cloneNode(false); // false = only the element

////////////////////////////////////////////////////////////////
// REMOVING ELEMENTS
////////////////////////////////////////////////////////////////

element.remove();                    // remove self
parent.removeChild(element);         // remove child (returns removed element)
parent.replaceChild(newEl, oldEl);   // replace child
element.replaceWith(newEl);          // replace self

////////////////////////////////////////////////////////////////
// ATTRIBUTES
////////////////////////////////////////////////////////////////

// Get / Set / Remove
element.getAttribute("href");
element.setAttribute("href", "https://example.com");
element.removeAttribute("href");
element.hasAttribute("href");       // true / false

// Direct property access (common attributes)
element.id = "myId";
element.className = "class1 class2";
element.href;
element.src;
element.value;          // for inputs
element.checked;        // for checkboxes
element.disabled;

// dataset (data-* attributes)
// <div data-user-id="42" data-role="admin">
element.dataset.userId;   // "42"
element.dataset.role;     // "admin"
element.dataset.userId = "99"; // sets data-user-id="99"

////////////////////////////////////////////////////////////////
// CLASSES
////////////////////////////////////////////////////////////////

element.classList.add("active");
element.classList.remove("active");
element.classList.toggle("active");        // add if missing, remove if present
element.classList.toggle("active", true);  // force add
element.classList.toggle("active", false); // force remove
element.classList.contains("active");      // true / false
element.classList.replace("old", "new");

// Multiple classes at once
element.classList.add("a", "b", "c");
element.classList.remove("a", "b");

////////////////////////////////////////////////////////////////
// STYLES
////////////////////////////////////////////////////////////////

// Inline styles (camelCase)
element.style.backgroundColor = "#333";
element.style.fontSize = "16px";
element.style.display = "none";
element.style.cssText = "color: red; font-size: 20px;"; // set all at once

// Get computed styles (actual rendered values)
const styles = window.getComputedStyle(element);
styles.backgroundColor;   // "rgb(51, 51, 51)"
styles.fontSize;          // "16px"

// CSS custom properties
element.style.setProperty("--my-color", "blue");
element.style.getPropertyValue("--my-color");

////////////////////////////////////////////////////////////////
// EVENTS
////////////////////////////////////////////////////////////////

// addEventListener (recommended)
element.addEventListener("click", function(event) {
  console.log("Clicked!", event.target);
});

// Remove listener (must use named function)
function handleClick(event) {
  console.log("Clicked!");
}
element.addEventListener("click", handleClick);
element.removeEventListener("click", handleClick);

// Options
element.addEventListener("click", handler, {
  once: true,     // auto-remove after first trigger
  capture: true,  // capture phase instead of bubble
  passive: true   // never calls preventDefault (scroll performance)
});

// Common events:
// Mouse: click, dblclick, mousedown, mouseup, mousemove, mouseenter, mouseleave
// Keyboard: keydown, keyup, keypress (deprecated)
// Form: submit, change, input, focus, blur
// Window: load, DOMContentLoaded, resize, scroll
// Touch: touchstart, touchmove, touchend

////////////////////////////////////////////////////////////////
// EVENT OBJECT
////////////////////////////////////////////////////////////////

element.addEventListener("click", function(event) {
  event.target;          // element that triggered the event
  event.currentTarget;   // element the listener is attached to
  event.type;            // "click"
  event.timeStamp;       // when it happened

  event.preventDefault();  // prevent default behavior (links, forms)
  event.stopPropagation(); // stop bubbling to parent elements

  // Mouse event properties
  event.clientX;   // X relative to viewport
  event.clientY;   // Y relative to viewport
  event.pageX;     // X relative to document
  event.pageY;     // Y relative to document
  event.button;    // 0=left, 1=middle, 2=right
});

element.addEventListener("keydown", function(event) {
  event.key;       // "Enter", "a", "ArrowUp"
  event.code;      // "Enter", "KeyA", "ArrowUp" (physical key)
  event.ctrlKey;   // true if Ctrl was held
  event.shiftKey;  // true if Shift was held
  event.altKey;    // true if Alt was held
  event.metaKey;   // true if Meta/Cmd was held
});

////////////////////////////////////////////////////////////////
// EVENT DELEGATION (handle events on parent for dynamic children)
////////////////////////////////////////////////////////////////

// Instead of adding listener to each <li>...
const list = document.getElementById("list");
list.addEventListener("click", function(event) {
  // Check if the clicked element is an <li>
  if (event.target.matches("li")) {
    console.log("Clicked item:", event.target.textContent);
  }

  // Or find closest matching ancestor
  const item = event.target.closest(".list-item");
  if (item) {
    console.log("Clicked item:", item.textContent);
  }
});

////////////////////////////////////////////////////////////////
// CUSTOM EVENTS
////////////////////////////////////////////////////////////////

// Create custom event
const myEvent = new CustomEvent("userLogin", {
  detail: { username: "Ana", role: "admin" },
  bubbles: true
});

// Listen for custom event
document.addEventListener("userLogin", function(event) {
  console.log("User logged in:", event.detail.username);
});

// Dispatch custom event
element.dispatchEvent(myEvent);

////////////////////////////////////////////////////////////////
// DOM GEOMETRY & SCROLLING
////////////////////////////////////////////////////////////////

// Element dimensions
element.offsetWidth;    // width + padding + border (no margin)
element.offsetHeight;   // height + padding + border
element.clientWidth;    // width + padding (no border, no scrollbar)
element.clientHeight;   // height + padding
element.scrollWidth;    // total scrollable width
element.scrollHeight;   // total scrollable height

// Position relative to viewport
const rect = element.getBoundingClientRect();
rect.top;      // distance from top of viewport
rect.left;     // distance from left of viewport
rect.width;    // element width
rect.height;   // element height
rect.bottom;   // top + height
rect.right;    // left + width

// Scrolling
window.scrollTo({ top: 0, behavior: "smooth" });
window.scrollBy({ top: 100, behavior: "smooth" });
element.scrollIntoView({ behavior: "smooth", block: "start" });

// Scroll position
window.scrollX;  // horizontal scroll
window.scrollY;  // vertical scroll

////////////////////////////////////////////////////////////////
// INTERSECTION OBSERVER (detect visibility)
////////////////////////////////////////////////////////////////

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      // observer.unobserve(entry.target); // stop watching
    }
  });
}, {
  threshold: 0.5,    // trigger when 50% visible
  rootMargin: "0px"  // margin around root
});

// Observe elements
document.querySelectorAll(".animate-on-scroll").forEach(function(el) {
  observer.observe(el);
});

////////////////////////////////////////////////////////////////
// MUTATION OBSERVER (detect DOM changes)
////////////////////////////////////////////////////////////////

const mutationObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log("DOM changed:", mutation.type);
    // mutation.type: "childList", "attributes", "characterData"
    // mutation.addedNodes, mutation.removedNodes
  });
});

mutationObserver.observe(element, {
  childList: true,    // watch for added/removed children
  attributes: true,   // watch for attribute changes
  subtree: true       // watch entire subtree
});

// Stop observing
// mutationObserver.disconnect();
