////////////////////////////////////////////////////////////////
// CREATING REGULAR EXPRESSIONS
////////////////////////////////////////////////////////////////

// Literal syntax (most common)
const pattern1 = /hello/;
const pattern2 = /hello/gi; // with flags

// Constructor syntax (dynamic patterns)
const pattern3 = new RegExp("hello");
const pattern4 = new RegExp("hello", "gi");

// Dynamic pattern from variable
const searchTerm = "world";
const dynamic = new RegExp(searchTerm, "i");

////////////////////////////////////////////////////////////////
// FLAGS
////////////////////////////////////////////////////////////////

// g  = global: find ALL matches, not just the first
// i  = case-insensitive
// m  = multiline: ^ and $ match line start/end
// s  = dotAll: . matches newline characters too
// u  = unicode: correct handling of Unicode
// y  = sticky: matches only from lastIndex position

/hello/g;     // find all "hello"
/hello/i;     // "Hello", "HELLO", "hello"
/hello/gi;    // all matches, case-insensitive
/^start/m;    // "start" at beginning of each line
/a.b/s;       // "a\nb" matches (dot = any char including newline)

////////////////////////////////////////////////////////////////
// REGEX METHODS
////////////////////////////////////////////////////////////////

const str = "Hello World, hello JavaScript!";

// test() - returns true/false
/hello/i.test(str);    // true
/python/i.test(str);   // false

// exec() - returns match array or null
const result = /hello/i.exec(str);
result[0];       // "Hello" (matched text)
result.index;    // 0 (position)
result.input;    // original string

// exec with groups
const dateStr = "2024-01-15";
const dateMatch = /(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
dateMatch[0];    // "2024-01-15" (full match)
dateMatch[1];    // "2024" (first group)
dateMatch[2];    // "01" (second group)
dateMatch[3];    // "15" (third group)

////////////////////////////////////////////////////////////////
// STRING METHODS WITH REGEX
////////////////////////////////////////////////////////////////

const text = "The quick brown fox jumps over the lazy dog";

// match() - returns array of matches
text.match(/the/gi);           // ["The", "the"]
text.match(/cat/);             // null (no match)

// matchAll() - returns iterator of all matches with details
const matches = [...text.matchAll(/(\w+)o(\w+)/g)];
// Each match: [fullMatch, group1, group2, index, ...]

// search() - returns index of first match, or -1
text.search(/brown/);          // 10
text.search(/cat/);            // -1

// replace() - replace matches
text.replace(/fox/, "cat");    // "The quick brown cat jumps..."
text.replace(/the/gi, "a");   // "a quick brown fox jumps over a lazy dog"

// replace with function
"hello world".replace(/\b\w/g, (char) => char.toUpperCase());
// "Hello World"

// replaceAll() - replace all occurrences (requires g flag with regex)
"a-b-c".replaceAll(/-/g, "_"); // "a_b_c"

// split() - split by pattern
"one, two,  three".split(/,\s*/);  // ["one", "two", "three"]
"camelCase".split(/(?=[A-Z])/);    // ["camel", "Case"]

////////////////////////////////////////////////////////////////
// CHARACTER CLASSES
////////////////////////////////////////////////////////////////

// .     any character (except newline, unless s flag)
// \d    digit [0-9]
// \D    non-digit [^0-9]
// \w    word char [a-zA-Z0-9_]
// \W    non-word char
// \s    whitespace (space, tab, newline)
// \S    non-whitespace
// \b    word boundary
// \B    non-word boundary

/\d{3}/.test("123");           // true (3 digits)
/\w+/.exec("hello")[0];        // "hello" (word characters)
/\bcat\b/.test("the cat sat"); // true (whole word "cat")
/\bcat\b/.test("catalog");     // false (not a whole word)

////////////////////////////////////////////////////////////////
// CHARACTER SETS & RANGES
////////////////////////////////////////////////////////////////

// [abc]    match a, b, or c
// [^abc]   match anything except a, b, c
// [a-z]    match a through z
// [A-Z]    match A through Z
// [0-9]    match 0 through 9
// [a-zA-Z] match any letter

/[aeiou]/.test("hello");       // true (has a vowel)
/[^0-9]/.test("abc");          // true (has non-digit)
/^[a-z]+$/.test("hello");      // true (all lowercase)
/^[A-Za-z_]\w*$/.test("_var"); // true (valid identifier)

// Escaping special chars inside []
/[.\-+*]/.test("+");           // true (most chars are literal inside [])

////////////////////////////////////////////////////////////////
// QUANTIFIERS
////////////////////////////////////////////////////////////////

// *      0 or more
// +      1 or more
// ?      0 or 1 (optional)
// {n}    exactly n
// {n,}   n or more
// {n,m}  between n and m

/a*/.exec("bbb")[0];           // "" (0 matches is ok for *)
/a+/.exec("aab")[0];           // "aa" (1 or more)
/colou?r/.test("color");       // true (u is optional)
/colou?r/.test("colour");      // true
/\d{3}/.test("12");            // false (need exactly 3)
/\d{2,4}/.exec("12345")[0];    // "1234" (greedy: takes max)

// Greedy vs Lazy
"<b>bold</b>".match(/<.+>/)[0];    // "<b>bold</b>" (greedy)
"<b>bold</b>".match(/<.+?>/)[0];   // "<b>" (lazy - add ? after quantifier)

////////////////////////////////////////////////////////////////
// ANCHORS & BOUNDARIES
////////////////////////////////////////////////////////////////

// ^      start of string (or line with m flag)
// $      end of string (or line with m flag)
// \b     word boundary
// \B     non-word boundary

/^hello/.test("hello world");  // true (starts with hello)
/world$/.test("hello world");  // true (ends with world)
/^hello$/.test("hello");       // true (exact match)
/^hello$/.test("hello world"); // false

// Multiline mode
const multiline = "line1\nline2\nline3";
multiline.match(/^\w+/gm);    // ["line1", "line2", "line3"]
multiline.match(/^\w+/g);     // ["line1"] (only first line without m)

////////////////////////////////////////////////////////////////
// GROUPS & CAPTURING
////////////////////////////////////////////////////////////////

// (abc)    capturing group
// (?:abc)  non-capturing group
// (?<name>abc)  named group

// Capturing groups
const urlPattern = /^(https?):\/\/([^/]+)(\/.*)?$/;
const urlMatch = urlPattern.exec("https://example.com/page");
urlMatch[1]; // "https" (protocol)
urlMatch[2]; // "example.com" (domain)
urlMatch[3]; // "/page" (path)

// Named groups
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const d = datePattern.exec("2024-01-15");
d.groups.year;   // "2024"
d.groups.month;  // "01"
d.groups.day;    // "15"

// Non-capturing group (grouping without capturing)
/(?:https?|ftp):\/\//.test("https://example.com"); // true
// Doesn't create a capture group, just groups for alternation

// Backreferences (refer to earlier group)
/(["'])(.*?)\1/.exec("'hello'");   // matches quotes that match
// \1 refers to whatever group 1 matched (the opening quote)

////////////////////////////////////////////////////////////////
// ALTERNATION & LOOKAHEAD / LOOKBEHIND
////////////////////////////////////////////////////////////////

// |  alternation (OR)
/cat|dog/.test("I have a cat");  // true
/^(cat|dog)$/.test("cat");       // true (exact match of cat OR dog)

// Lookahead (?=...)  - matches if followed by
/\d+(?=px)/.exec("12px 5em")[0]; // "12" (digits followed by px)

// Negative lookahead (?!...)  - matches if NOT followed by
/\d+(?!px)/.exec("12px 5em")[0]; // "5" (digits NOT followed by px)

// Lookbehind (?<=...)  - matches if preceded by
/(?<=\$)\d+/.exec("Price: $50")[0]; // "50" (digits preceded by $)

// Negative lookbehind (?<!...)  - matches if NOT preceded by
/(?<!\$)\d+/.exec("Price: $50 and 30 units")[0]; // "30"

////////////////////////////////////////////////////////////////
// COMMON PATTERNS
////////////////////////////////////////////////////////////////

// Email (basic)
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
email.test("user@example.com"); // true
email.test("invalid@");         // false

// URL
const url = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
url.test("https://example.com"); // true

// Phone (flexible)
const phone = /^[\+]?[\d\s\-().]{7,15}$/;
phone.test("+1 (555) 123-4567"); // true

// Hex color
const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
hex.test("#fff");    // true
hex.test("#1a2b3c"); // true

// IP address (basic)
const ip = /^(\d{1,3}\.){3}\d{1,3}$/;
ip.test("192.168.1.1"); // true

// Password strength
const strongPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
strongPass.test("MyP@ss1!");  // true (lower, upper, digit, special, 8+ chars)

// Slug (URL-friendly)
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
slug.test("my-blog-post"); // true

// Remove extra whitespace
"  hello   world  ".replace(/\s+/g, " ").trim(); // "hello world"

// Extract numbers from string
"Price: $12.50, Qty: 3".match(/\d+\.?\d*/g); // ["12.50", "3"]

// Capitalize first letter of each word
"hello world".replace(/\b\w/g, (c) => c.toUpperCase()); // "Hello World"

// Escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
escapeRegex("price: $10.00"); // "price: \\$10\\.00"
