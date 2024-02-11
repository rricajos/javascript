// Creamos un objeto de ejemplo
const miObjeto = {
    nombre: 'John',
    edad: 30,
    ciudad: 'Ejemploville'
  };
  
// Utilizamos el bucle for...in para iterar sobre las propiedades del objeto
for (let clave in miObjeto) {
  // Verificamos si la propiedad realmente pertenece al objeto y no a su prototipo
  if (miObjeto.hasOwnProperty(clave)) {
      // Accedemos al valor de la propiedad usando la clave
      const valor = miObjeto[clave];

      // Imprimimos la clave y el valor
      console.log(`Clave: ${clave}, Valor: ${valor}`);
  }
}

// Salida esperada:
// Clave: nombre, Valor: John
// Clave: edad, Valor: 30
// Clave: ciudad, Valor: Ejemploville

// Explicación del bucle for...in:
// - La declaración `for (let clave in miObjeto)` inicia el bucle, 
//    donde `clave` toma el valor de cada propiedad en cada iteración.
// - `miObjeto.hasOwnProperty(clave)` verifica si la propiedad 
//    pertenece directamente al objeto y no es heredada del prototipo.
// - Accedemos al valor de la propiedad usando la sintaxis 
//    de corchetes (`miObjeto[clave]`).
// - Imprimimos la clave y el valor asociado a esa clave.

// Ten en cuenta que el bucle for...in no garantiza un orden 
// específico de iteración y puede incluir propiedades del 
// prototipo del objeto.

// Pros:
// 1. Itera sobre propiedades enumerables.
// 2. Facilita acceso a claves y valores.

// Contras:
// 1. Itera sobre propiedades heredadas.
// 2. No garantiza orden específico.
// 3. No es adecuado para iterar sobre arrays.
// 4. Puede incluir propiedades del prototipo.
