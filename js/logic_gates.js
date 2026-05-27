// ============================================================
// LOGIC GATES IN JAVASCRIPT
// Boolean algebra and bitwise operations
// ============================================================


// ///////////////////////////////////////////////
// 1. BOOLEAN LOGIC GATES
// ///////////////////////////////////////////////

// AND gate — true only if BOTH inputs are true
function AND(a, b) {
  return a && b;
}

console.log('AND(true, true):', AND(true, true));     // true
console.log('AND(true, false):', AND(true, false));   // false
console.log('AND(false, false):', AND(false, false)); // false


// OR gate — true if AT LEAST ONE input is true
function OR(a, b) {
  return a || b;
}

console.log('OR(true, false):', OR(true, false));     // true
console.log('OR(false, false):', OR(false, false));   // false


// NOT gate — inverts the input
function NOT(a) {
  return !a;
}

console.log('NOT(true):', NOT(true));   // false
console.log('NOT(false):', NOT(false)); // true


// ///////////////////////////////////////////////
// 2. DERIVED GATES
// ///////////////////////////////////////////////

// NAND — NOT AND (opposite of AND)
function NAND(a, b) {
  return !(a && b);
}

console.log('NAND(true, true):', NAND(true, true));   // false
console.log('NAND(true, false):', NAND(true, false)); // true


// NOR — NOT OR (opposite of OR)
function NOR(a, b) {
  return !(a || b);
}

console.log('NOR(false, false):', NOR(false, false)); // true
console.log('NOR(true, false):', NOR(true, false));   // false


// XOR — Exclusive OR (true if inputs are different)
function XOR(a, b) {
  return (a || b) && !(a && b);
}

// Shorter with strict inequality:
// function XOR(a, b) { return a !== b; }

console.log('XOR(true, false):', XOR(true, false));   // true
console.log('XOR(true, true):', XOR(true, true));     // false


// XNOR — Exclusive NOR (true if inputs are the same)
function XNOR(a, b) {
  return a === b;
}

console.log('XNOR(true, true):', XNOR(true, true));     // true
console.log('XNOR(true, false):', XNOR(true, false));   // false


// ///////////////////////////////////////////////
// 3. BITWISE OPERATORS
// ///////////////////////////////////////////////

// JavaScript has bitwise operators that work on 32-bit integers
// They apply logic gates to each bit pair

// & (AND)  — 1 only if both bits are 1
console.log('5 & 3 =', 5 & 3);   // 0101 & 0011 = 0001 → 1

// | (OR)   — 1 if any bit is 1
console.log('5 | 3 =', 5 | 3);   // 0101 | 0011 = 0111 → 7

// ^ (XOR)  — 1 if bits differ
console.log('5 ^ 3 =', 5 ^ 3);   // 0101 ^ 0011 = 0110 → 6

// ~ (NOT)  — flips all bits (two's complement)
console.log('~5 =', ~5);         // ~00000101 = 11111010 → -6


// ///////////////////////////////////////////////
// 4. TRUTH TABLES
// ///////////////////////////////////////////////

// Generate a truth table for any 2-input gate
function truthTable(name, gateFn) {
  console.log(`\n--- ${name} ---`);
  const inputs = [[false, false], [false, true], [true, false], [true, true]];
  inputs.forEach(function ([a, b]) {
    console.log(`  ${a}\t${b}\t→ ${gateFn(a, b)}`);
  });
}

truthTable('AND', AND);
truthTable('OR', OR);
truthTable('XOR', XOR);
truthTable('NAND', NAND);


// ///////////////////////////////////////////////
// 5. PRACTICAL EXAMPLES
// ///////////////////////////////////////////////

// Bitmask flags — using bitwise AND/OR for permissions
const READ    = 0b001;  // 1
const WRITE   = 0b010;  // 2
const EXECUTE = 0b100;  // 4

// Combine permissions with OR
let userPerms = READ | WRITE;  // 0b011 = 3
console.log('User perms:', userPerms);

// Check permission with AND
console.log('Can read?', (userPerms & READ) !== 0);       // true
console.log('Can execute?', (userPerms & EXECUTE) !== 0); // false

// Add permission with OR
userPerms = userPerms | EXECUTE;  // 0b111 = 7
console.log('After adding execute:', userPerms);

// Remove permission with AND + NOT
userPerms = userPerms & ~WRITE;   // 0b101 = 5
console.log('After removing write:', userPerms);

// Toggle permission with XOR
userPerms = userPerms ^ READ;     // toggles READ off → 0b100 = 4
console.log('After toggling read:', userPerms);
userPerms = userPerms ^ READ;     // toggles READ on  → 0b101 = 5
console.log('After toggling read again:', userPerms);


// ///////////////////////////////////////////////
// 6. SWAP WITHOUT TEMP VARIABLE (XOR trick)
// ///////////////////////////////////////////////

let x = 10;
let y = 25;

x = x ^ y;   // x now holds XOR
y = x ^ y;   // y gets original x
x = x ^ y;   // x gets original y

console.log('After XOR swap: x =', x, ', y =', y); // x=25, y=10


// ///////////////////////////////////////////////
// 7. HALF ADDER (binary addition with gates)
// ///////////////////////////////////////////////

// A half adder adds two single bits
// Sum  = XOR(a, b)
// Carry = AND(a, b)
function halfAdder(a, b) {
  return {
    sum: a ^ b,
    carry: a & b
  };
}

console.log('halfAdder(1, 0):', halfAdder(1, 0)); // {sum: 1, carry: 0}
console.log('halfAdder(1, 1):', halfAdder(1, 1)); // {sum: 0, carry: 1}


// Full adder — adds two bits plus carry-in
function fullAdder(a, b, carryIn) {
  const first = halfAdder(a, b);
  const second = halfAdder(first.sum, carryIn);
  return {
    sum: second.sum,
    carry: first.carry | second.carry
  };
}

console.log('fullAdder(1, 1, 1):', fullAdder(1, 1, 1)); // {sum: 1, carry: 1}


// ///////////////////////////////////////////////
// 8. BUILDING COMPLEX GATES FROM NAND
// ///////////////////////////////////////////////

// NAND is a "universal gate" — you can build any gate from it

function NAND_gate(a, b) { return !(a && b); }

// NOT from NAND
function NOT_from_NAND(a) { return NAND_gate(a, a); }

// AND from NAND
function AND_from_NAND(a, b) { return NOT_from_NAND(NAND_gate(a, b)); }

// OR from NAND
function OR_from_NAND(a, b) { return NAND_gate(NOT_from_NAND(a), NOT_from_NAND(b)); }

console.log('NOT via NAND:', NOT_from_NAND(true));            // false
console.log('AND via NAND:', AND_from_NAND(true, true));      // true
console.log('OR via NAND:', OR_from_NAND(false, true));       // true


// ///////////////////////////////////////////////
// 9. BIT MANIPULATION TRICKS
// ///////////////////////////////////////////////

// Check if number is even/odd (AND with 1)
function isOdd(n) { return (n & 1) === 1; }
console.log('isOdd(7):', isOdd(7));   // true
console.log('isOdd(8):', isOdd(8));   // false

// Check if power of 2
function isPowerOf2(n) { return n > 0 && (n & (n - 1)) === 0; }
console.log('isPowerOf2(8):', isPowerOf2(8));   // true
console.log('isPowerOf2(6):', isPowerOf2(6));   // false

// Count set bits (Hamming weight / popcount)
function countBits(n) {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}
console.log('countBits(7):', countBits(7));   // 3 (0b111)
console.log('countBits(10):', countBits(10)); // 2 (0b1010)


// ///////////////////////////////////////////////
// 10. SHIFT OPERATORS
// ///////////////////////////////////////////////

// << left shift (multiply by 2^n)
console.log('3 << 2 =', 3 << 2);   // 12  (3 * 4)

// >> right shift (divide by 2^n, preserves sign)
console.log('12 >> 2 =', 12 >> 2); // 3

// >>> unsigned right shift (fills with 0s)
console.log('-1 >>> 0 =', (-1 >>> 0).toString(2)); // all 32 bits set

// Fast multiply / divide by powers of 2
console.log('5 << 1 =', 5 << 1);   // 10  (5 * 2)
console.log('20 >> 2 =', 20 >> 2); // 5   (20 / 4)
