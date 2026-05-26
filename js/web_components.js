////////////////////////////////////////////////////////////////
// WEB COMPONENTS - Custom Elements, Shadow DOM, Templates
////////////////////////////////////////////////////////////////

// Web Components = 3 main technologies:
// 1. Custom Elements - define new HTML tags
// 2. Shadow DOM - encapsulated styles/markup
// 3. HTML Templates - reusable markup fragments

////////////////////////////////////////////////////////////////
// CUSTOM ELEMENTS BASICS
////////////////////////////////////////////////////////////////

// Define a simple custom element
class MyGreeting extends HTMLElement {
  constructor() {
    super(); // always call super() first
    this.textContent = "Hello from <my-greeting>!";
  }
}

// Register it (name MUST contain a hyphen)
customElements.define("my-greeting", MyGreeting);

// Usage in HTML: <my-greeting></my-greeting>

// Custom element with attributes
class UserCard extends HTMLElement {
  constructor() {
    super();
  }

  // Called when element is added to DOM
  connectedCallback() {
    const name = this.getAttribute("name") || "Anonymous";
    const role = this.getAttribute("role") || "User";
    this.innerHTML = `
      <div class="card">
        <h3>${name}</h3>
        <p>${role}</p>
      </div>
    `;
  }

  // Called when element is removed from DOM
  disconnectedCallback() {
    console.log("UserCard removed from DOM");
  }

  // Define which attributes to observe
  static get observedAttributes() {
    return ["name", "role"];
  }

  // Called when observed attribute changes
  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal !== newVal) {
      this.connectedCallback(); // re-render
    }
  }
}

customElements.define("user-card", UserCard);
// <user-card name="Ana" role="Developer"></user-card>

////////////////////////////////////////////////////////////////
// LIFECYCLE CALLBACKS
////////////////////////////////////////////////////////////////

class LifecycleDemo extends HTMLElement {
  constructor() {
    super();
    console.log("1. constructor() - element created");
  }

  connectedCallback() {
    console.log("2. connectedCallback() - added to DOM");
  }

  disconnectedCallback() {
    console.log("3. disconnectedCallback() - removed from DOM");
  }

  adoptedCallback() {
    console.log("4. adoptedCallback() - moved to new document");
  }

  attributeChangedCallback(name, oldVal, newVal) {
    console.log(`5. attributeChangedCallback(${name}: ${oldVal} → ${newVal})`);
  }

  static get observedAttributes() {
    return ["data-status"];
  }
}

customElements.define("lifecycle-demo", LifecycleDemo);
////////////////////////////////////////////////////////////////
// SHADOW DOM
////////////////////////////////////////////////////////////////

// Shadow DOM provides encapsulated DOM + styles
class ShadowCard extends HTMLElement {
  constructor() {
    super();

    // Attach shadow root (open = accessible from outside)
    const shadow = this.attachShadow({ mode: "open" });

    // Styles are scoped to this shadow DOM only
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          border: 2px solid #ccc;
          border-radius: 8px;
          padding: 1em;
          margin: 0.5em 0;
          font-family: sans-serif;
        }
        :host(:hover) {
          border-color: #FFDD00;
        }
        :host([highlighted]) {
          background: #fffde7;
        }
        h2 {
          color: #333;
          margin: 0 0 0.5em;
        }
        p {
          color: #666;
          margin: 0;
        }
        /* ::slotted styles projected content */
        ::slotted(span) {
          font-weight: bold;
        }
      </style>
      <h2><slot name="title">Default Title</slot></h2>
      <p><slot>Default content</slot></p>
    `;
  }
}

customElements.define("shadow-card", ShadowCard);

// Usage:
// <shadow-card>
//   <span slot="title">My Card</span>
//   Some content here
// </shadow-card>

// Shadow DOM modes:
// "open"   - shadow.host.shadowRoot accessible from outside
// "closed" - shadowRoot returns null from outside

////////////////////////////////////////////////////////////////
// HTML TEMPLATES & SLOTS
////////////////////////////////////////////////////////////////

// <template> content is NOT rendered until cloned
// <template id="card-template">
//   <style>
//     .card { border: 1px solid #ddd; padding: 1em; }
//   </style>
//   <div class="card">
//     <slot name="header">Default Header</slot>
//     <slot>Default Body</slot>
//   </div>
// </template>

class TemplateCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // Create template programmatically
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1em;
          font-family: sans-serif;
        }
        .card-header {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
      </style>
      <div class="card">
        <div class="card-header">
          <slot name="header">Default Header</slot>
        </div>
        <div class="card-body">
          <slot>Default content goes here</slot>
        </div>
      </div>
    `;

    // Clone and attach
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("template-card", TemplateCard);

// <template-card>
//   <span slot="header">My Title</span>
//   <p>This goes into the default slot</p>
// </template-card>
////////////////////////////////////////////////////////////////
// EXTENDING BUILT-IN ELEMENTS
////////////////////////////////////////////////////////////////

// Extend an existing HTML element
class FancyButton extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      const btn = this;
      setTimeout(function () {
        btn.style.transform = "";
      }, 150);
    });
  }

  connectedCallback() {
    this.style.cssText = `
      background: #FFDD00;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 0.5em 1.5em;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.15s;
    `;
  }
}

// Note: { extends: "button" } for customized built-ins
customElements.define("fancy-button", FancyButton, { extends: "button" });

// Usage: <button is="fancy-button">Click Me</button>
// (Not supported in Safari without polyfill)

////////////////////////////////////////////////////////////////
// PRACTICAL EXAMPLE: COUNTER COMPONENT
////////////////////////////////////////////////////////////////

class ClickCounter extends HTMLElement {
  constructor() {
    super();
    this._count = 0;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
          font-family: monospace;
        }
        button {
          background: #FFDD00;
          border: 2px solid #333;
          border-radius: 4px;
          padding: 0.3em 0.8em;
          font-size: 1em;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover { filter: brightness(1.1); }
        span { min-width: 2em; text-align: center; font-size: 1.2em; }
      </style>
      <button id="dec">-</button>
      <span id="display">0</span>
      <button id="inc">+</button>
    `;
  }

  connectedCallback() {
    const shadow = this.shadowRoot;
    const display = shadow.getElementById("display");
    const self = this;

    shadow.getElementById("inc").addEventListener("click", function () {
      self._count++;
      display.textContent = self._count;
      self.dispatchEvent(new CustomEvent("count-changed", {
        detail: { count: self._count }
      }));
    });

    shadow.getElementById("dec").addEventListener("click", function () {
      self._count--;
      display.textContent = self._count;
      self.dispatchEvent(new CustomEvent("count-changed", {
        detail: { count: self._count }
      }));
    });
  }

  // Expose count as property
  get count() { return this._count; }
  set count(val) {
    this._count = val;
    const display = this.shadowRoot.getElementById("display");
    if (display) display.textContent = val;
  }
}

customElements.define("click-counter", ClickCounter);
// <click-counter></click-counter>
////////////////////////////////////////////////////////////////
// PRACTICAL EXAMPLE: TOGGLE SWITCH
////////////////////////////////////////////////////////////////

class ToggleSwitch extends HTMLElement {
  constructor() {
    super();
    this._checked = false;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display: inline-block; cursor: pointer; }
        .track {
          width: 48px; height: 26px;
          background: #ccc; border-radius: 13px;
          position: relative; transition: background 0.2s;
        }
        .track.on { background: #4caf50; }
        .thumb {
          width: 22px; height: 22px;
          background: white; border-radius: 50%;
          position: absolute; top: 2px; left: 2px;
          transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .track.on .thumb { left: 24px; }
      </style>
      <div class="track">
        <div class="thumb"></div>
      </div>
    `;
  }

  connectedCallback() {
    const self = this;
    this.shadowRoot.querySelector(".track").addEventListener("click", function () {
      self._checked = !self._checked;
      self._update();
      self.dispatchEvent(new CustomEvent("toggle", {
        detail: { checked: self._checked }
      }));
    });
  }

  _update() {
    const track = this.shadowRoot.querySelector(".track");
    if (this._checked) {
      track.classList.add("on");
    } else {
      track.classList.remove("on");
    }
  }

  get checked() { return this._checked; }
  set checked(val) {
    this._checked = Boolean(val);
    this._update();
  }
}

customElements.define("toggle-switch", ToggleSwitch);
// <toggle-switch></toggle-switch>

////////////////////////////////////////////////////////////////
// COMMUNICATING BETWEEN COMPONENTS
////////////////////////////////////////////////////////////////

// 1. Custom Events (preferred)
// element.dispatchEvent(new CustomEvent('my-event', {
//   bubbles: true,      // propagates up the DOM
//   composed: true,     // crosses shadow DOM boundary
//   detail: { data: 'value' }
// }));

// 2. Shared state / event bus
const EventBus = {
  _listeners: {},
  on: function (event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },
  emit: function (event, data) {
    (this._listeners[event] || []).forEach(function (cb) { cb(data); });
  },
  off: function (event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(function (cb) {
      return cb !== callback;
    });
  }
};

// 3. Property/attribute binding
// Parent sets child.someProperty = value
// Child reflects via attributeChangedCallback

////////////////////////////////////////////////////////////////
// BEST PRACTICES
////////////////////////////////////////////////////////////////

// 1. Always call super() first in constructor
// 2. Don't access attributes/children in constructor
//    (use connectedCallback instead)
// 3. Use Shadow DOM for style encapsulation
// 4. Dispatch events for component communication
// 5. Name custom elements with a hyphen (my-component)
// 6. Clean up listeners in disconnectedCallback
// 7. Use :host for the component's own styles
// 8. Reflect properties to attributes when needed
// 9. Keep components small and focused
// 10. Use <slot> for content projection (composition over inheritance)
