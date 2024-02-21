let X = 10;
let Y = 5
//////////////////////////////////////////////////////////////
// classic: 
let addition = X + Y;
let substraction = X - Y;
let multiplication = X * Y;
let division = X / Y;
let modulus = X % Y;
let increment = X++;
let decrement = X--;
//////////////////////////////////////////////////////////////
// Postfix Increment/Decrement (x++ / x-- ): 
let a = 5;
let b = a++;
console.log(a); // Output: 6 (a is incremented after its current value is assigned to b)
console.log(b); // Output: 5 (original value of a is assigned to b)
//////////////////////////////////////////////////////////////
// Prefix Increment/Decrement (++x / --x): 
let c = 5;
let d = ++c;
console.log(c); // Output: 6 (c is incremented before its value is assigned to d)
console.log(d); // Output: 6 (new value of c is assigned to d)

