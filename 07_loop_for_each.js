// Creamos un array de ejemplo
const miArray = [1, 2, 3, 4, 5];

// Utilizamos el método forEach en el array
miArray.forEach(function(elemento, indice, arrayCompleto) {
  // La función de retorno de llamada se ejecutará para cada elemento del array

  // Imprimimos el elemento actual
  console.log(`Elemento: ${elemento}`);

  // Imprimimos el índice del elemento actual
  console.log(`Índice: ${indice}`);

  // Imprimimos el array completo
  console.log(`Array completo: ${arrayCompleto}`);
});

// Salida esperada:
// Elemento: 1
// Índice: 0
// Array completo: 1,2,3,4,5
// Elemento: 2
// Índice: 1
// Array completo: 1,2,3,4,5
// ...

// Pros:
// 1. Sintaxis simple y fácil de entender.
//    - El método forEach es más conciso que otros bucles.
// 2. Manejo automático del índice y el array completo.
//    - Los argumentos (elemento, índice, arrayCompleto) se pasan 
//    automáticamente a la función de retorno de llamada.

// Contras:
// 1. No se puede interrumpir o salir temprano del bucle.
//    - No se puede utilizar 'break' para salir del bucle 
//      antes de recorrer todos los elementos.
// 2. No se puede utilizar directamente con objetos. 
//    (se necesitaria Object.entries() u Object.keys() previamente)
//    - forEach está diseñado para trabajar con arrays y no con objetos.
// 3. No crea un nuevo array.
//    - Si necesitas un nuevo array basado en la transformación de otro, 
//    podrías preferir métodos como 'map'.

// Contexto ideal:
// El bucle forEach es ideal para tareas simples de iteración y manipulación de datos,
// donde no se necesita salir temprano del bucle ni crear un nuevo array.
