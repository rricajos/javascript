// Operadores Aritméticos
let suma = 5 + 3;      // Suma: 8
let resta = 7 - 2;     // Resta: 5
let multiplicacion = 4 * 6;  // Multiplicación: 24
let division = 10 / 2;  // División: 5
let modulo = 15 % 4;    // Módulo: 3 (resto de la división)

// Operadores de Asignación
let x = 5;
x += 3;   // Suma y asigna: x es ahora 8

// Operadores de Comparación
let a = 5;
let b = '5';
let igualdad = a == b;  // Igualdad (valor): true
let igualdadEstricta = a === b; // Igualdad estricta (valor y tipo): false

// Operadores Lógicos
let condicion1 = true;
let condicion2 = false;

let andLogico = condicion1 && condicion2;  // AND lógico: false
let orLogico = condicion1 || condicion2;   // OR lógico: true
let notLogico = !condicion1;              // NOT lógico: false

// Operadores Ternarios
let edad = 20;
let mensaje = edad >= 18 ? "Eres mayor de edad" : "Eres menor de edad";

// Operadores de Concatenación (para cadenas)
let nombre = "John";
let apellido = "Doe";
let nombreCompleto = nombre + " " + apellido;  // Concatenación: "John Doe"

// Operadores Bitwise (a nivel de bits)
let num1 = 5;  // Representación binaria: 0101
let num2 = 3;  // Representación binaria: 0011

let andBitwise = num1 & num2;  // AND bitwise: 0001 (1 en binario)
let orBitwise = num1 | num2;   // OR bitwise: 0111 (7 en binario)
let xorBitwise = num1 ^ num2;  // XOR bitwise: 0110 (6 en binario)
let notBitwise = ~num1;        // NOT bitwise: 11111111111111111111111111111010 (-6 en binario)
let shiftLeft = num1 << 1;     // Desplazamiento a la izquierda: 1010 (10 en binario)
let shiftRight = num1 >> 1;    // Desplazamiento a la derecha: 0010 (2 en binario)

// Operador typeof
let variable1 = 42; // número
let variable2 = "Hola"; // cadena
let variable3 = true; // booleano
let variable4 = undefined; // indefinido
let variable5 = null; // objeto
let variable6 = [1, 2, 3]; // objeto (array)
let variable7 = { nombre: "John", edad: 30 }; // objeto (objeto literal)

console.log(typeof variable1); // "number"
console.log(typeof variable2); // "string"
console.log(typeof variable3); // "boolean"
console.log(typeof variable4); // "undefined"
console.log(typeof variable5); // "object"
console.log(typeof variable6); // "object"
console.log(typeof variable7); // "object"
