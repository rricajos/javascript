////////////////////////////////////////////////////////////////
// JSON.stringify() - Object/Array → JSON string
////////////////////////////////////////////////////////////////

const user = { name: "Ana", age: 30, active: true };

JSON.stringify(user);
// '{"name":"Ana","age":30,"active":true}'

// Pretty print (with indentation)
JSON.stringify(user, null, 2);
// {
//   "name": "Ana",
//   "age": 30,
//   "active": true
// }

// With replacer function (filter/transform values)
JSON.stringify(user, (key, value) => {
  if (key === "age") return undefined; // exclude
  return value;
});
// '{"name":"Ana","active":true}'

// With replacer array (only include these keys)
JSON.stringify(user, ["name", "active"]);
// '{"name":"Ana","active":true}'

// Values that get special treatment:
JSON.stringify(undefined);        // undefined (disappears)
JSON.stringify(null);             // "null"
JSON.stringify(NaN);              // "null"
JSON.stringify(Infinity);         // "null"
JSON.stringify(new Date());       // "\"2024-01-15T10:30:00.000Z\""
JSON.stringify(/regex/);          // "{}" (empty object)
JSON.stringify(new Map());        // "{}" (empty object)
JSON.stringify(() => {});         // undefined (functions disappear)

// In objects, undefined/functions/symbols are skipped:
JSON.stringify({ a: 1, b: undefined, c: () => {} });
// '{"a":1}' (b and c disappear)

// Custom toJSON method
const product = {
  name: "Laptop",
  price: 999,
  toJSON() {
    return { item: this.name, cost: "$" + this.price };
  }
};
JSON.stringify(product); // '{"item":"Laptop","cost":"$999"}'

////////////////////////////////////////////////////////////////
// JSON.parse() - JSON string → Object/Array
////////////////////////////////////////////////////////////////

const json = '{"name":"Ana","age":30,"hobbies":["code","music"]}';

const parsed = JSON.parse(json);
parsed.name;       // "Ana"
parsed.hobbies[0]; // "code"

// With reviver function (transform values during parsing)
const jsonWithDate = '{"name":"Event","date":"2024-01-15T10:30:00.000Z"}';
const event = JSON.parse(jsonWithDate, (key, value) => {
  // Convert date strings back to Date objects
  if (key === "date") return new Date(value);
  return value;
});
event.date instanceof Date; // true

// Error handling
try {
  JSON.parse("invalid json");
} catch (e) {
  console.log(e.message); // "Unexpected token i in JSON..."
}

// Safe parse helper
function safeParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

safeParse('{"a":1}');     // { a: 1 }
safeParse('broken', []);  // [] (fallback)

////////////////////////////////////////////////////////////////
// DEEP CLONE WITH JSON (simple objects only)
////////////////////////////////////////////////////////////////

const original = { a: 1, b: { c: 2 }, d: [3, 4] };

// JSON deep clone (loses functions, dates, undefined, etc.)
const clone1 = JSON.parse(JSON.stringify(original));

// Better: structuredClone (modern, handles more types)
const clone2 = structuredClone(original);

////////////////////////////////////////////////////////////////
// DATE CREATION
////////////////////////////////////////////////////////////////

// Current date/time
const now = new Date();

// From string (ISO 8601 format recommended)
const d1 = new Date("2024-01-15");            // midnight UTC
const d2 = new Date("2024-01-15T10:30:00");   // local time
const d3 = new Date("2024-01-15T10:30:00Z");  // UTC time

// From components (month is 0-indexed!)
const d4 = new Date(2024, 0, 15);             // Jan 15, 2024 (month 0 = January)
const d5 = new Date(2024, 0, 15, 10, 30, 0);  // Jan 15, 2024 10:30:00

// From timestamp (milliseconds since Jan 1, 1970 UTC)
const d6 = new Date(1705312200000);

// Current timestamp
Date.now(); // 1705312200000 (milliseconds)

////////////////////////////////////////////////////////////////
// DATE GETTERS
////////////////////////////////////////////////////////////////

const date = new Date("2024-06-15T14:30:45.500Z");

// Local time getters
date.getFullYear();    // 2024
date.getMonth();       // 5 (June, 0-indexed!)
date.getDate();        // 15 (day of month)
date.getDay();         // 6 (Saturday, 0=Sunday)
date.getHours();       // depends on timezone
date.getMinutes();     // 30
date.getSeconds();     // 45
date.getMilliseconds(); // 500
date.getTime();        // 1718458245500 (timestamp)

// UTC getters (same methods with "UTC")
date.getUTCFullYear(); // 2024
date.getUTCMonth();    // 5
date.getUTCHours();    // 14

// Timezone offset (minutes from UTC)
date.getTimezoneOffset(); // e.g., -60 for UTC+1

////////////////////////////////////////////////////////////////
// DATE SETTERS
////////////////////////////////////////////////////////////////

const d = new Date("2024-01-15T10:30:00");

d.setFullYear(2025);
d.setMonth(5);          // June (0-indexed!)
d.setDate(20);          // 20th
d.setHours(14);
d.setMinutes(45);
d.setSeconds(0);

// Chaining doesn't work (setters return timestamp, not Date)
// Use individual calls

// Overflow auto-corrects:
const jan31 = new Date(2024, 0, 31);
jan31.setMonth(1); // Feb 31 → auto-corrects to Mar 2 or 3

////////////////////////////////////////////////////////////////
// DATE FORMATTING
////////////////////////////////////////////////////////////////

const dt = new Date("2024-06-15T14:30:00");

// Built-in string methods
dt.toString();          // "Sat Jun 15 2024 14:30:00 GMT+0200"
dt.toISOString();       // "2024-06-15T12:30:00.000Z" (always UTC)
dt.toLocaleDateString(); // "15/6/2024" (depends on locale)
dt.toLocaleTimeString(); // "14:30:00" (depends on locale)
dt.toLocaleString();    // "15/6/2024, 14:30:00"
dt.toDateString();      // "Sat Jun 15 2024"
dt.toTimeString();      // "14:30:00 GMT+0200"
dt.toUTCString();       // "Sat, 15 Jun 2024 12:30:00 GMT"

// Intl.DateTimeFormat (powerful locale-aware formatting)
new Intl.DateTimeFormat("es-ES").format(dt);
// "15/6/2024"

new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
}).format(dt);
// "Saturday, June 15, 2024"

new Intl.DateTimeFormat("es-ES", {
  dateStyle: "full",
  timeStyle: "short"
}).format(dt);
// "sabado, 15 de junio de 2024, 14:30"

// Manual formatting
function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1); // +1 because 0-indexed
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
}
formatDate(dt); // "2024-06-15"

////////////////////////////////////////////////////////////////
// DATE ARITHMETIC
////////////////////////////////////////////////////////////////

const today = new Date();

// Add/subtract days
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);

// Add months
const nextMonth = new Date(today);
nextMonth.setMonth(nextMonth.getMonth() + 1);

// Difference between dates (in milliseconds)
const start = new Date("2024-01-01");
const end = new Date("2024-12-31");
const diffMs = end - start;
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 365

// Helper: days between two dates
function daysBetween(date1, date2) {
  const ms = Math.abs(date2 - date1);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

daysBetween(new Date("2024-01-01"), new Date("2024-03-01")); // 60

// Compare dates
const a = new Date("2024-01-15");
const b = new Date("2024-06-15");
a < b;               // true
a.getTime() === b.getTime(); // false (use getTime for equality)

////////////////////////////////////////////////////////////////
// RELATIVE TIME (Intl.RelativeTimeFormat)
////////////////////////////////////////////////////////////////

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

rtf.format(-1, "day");    // "ayer"
rtf.format(1, "day");     // "manana"
rtf.format(-2, "hour");   // "hace 2 horas"
rtf.format(3, "month");   // "dentro de 3 meses"
rtf.format(0, "day");     // "hoy"

// Auto relative time from date
function timeAgo(date) {
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const diff = date - new Date();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(days, "day");
}

////////////////////////////////////////////////////////////////
// PERFORMANCE TIMING
////////////////////////////////////////////////////////////////

// performance.now() - high-resolution timer (microsecond precision)
const t0 = performance.now();
// ... some operation ...
const t1 = performance.now();
console.log(`Took ${(t1 - t0).toFixed(2)} ms`);

// console.time / console.timeEnd
console.time("operation");
// ... some operation ...
console.timeEnd("operation"); // "operation: 12.5ms"

// Date.now() for simple timestamps
const timestamp = Date.now(); // milliseconds since epoch
