// Ejemplo de un array de números
let numeros = [1, 2, 3, 4, 5];

// Usando el bucle for...of para recorrer el array
for (let numero of numeros) {
    console.log(numero);
}

// Pros del for...of

// 1. Sintaxis Concisa
//    - El bucle for...of proporciona una sintaxis más clara y concisa
//      para iterar sobre elementos de colecciones.
// 2. No se necesita un índice
//    - Elimina la necesidad de rastrear un índice, haciendo el código
//      más limpio y menos propenso a errores.
// 3. Compatible con Iterables
//    - Funciona con objetos iterables, como arrays, strings, sets, maps,
//      entre otros.

// Contras del for...of

// 1. No proporciona índice directamente
//    - A veces, necesitarás acceder al índice del elemento durante la
//      iteración.
// 2. No es adecuado para objetos
//    - for...of no puede ser utilizado directamente para iterar sobre
//      las propiedades de un objeto.
// 3. No modifica la colección original directamente
//    - No proporciona una forma sencilla de modificar la colección
//      original durante la iteración.

// Para obtener el índice durante la iteración
for (let [indice, numero] of numeros.entries()) {
    console.log(`Índice: ${indice}, Valor: ${numero}`);
}

// Ejemplo de for...in para iterar sobre propiedades de un objeto
let persona = {
    nombre: "Juan",
    edad: 30,
    ciudad: "Ejemplo"
};

for (let propiedad in persona) {
    console.log(`${propiedad}: ${persona[propiedad]}`);
}
