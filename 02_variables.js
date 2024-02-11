// En JavaScript, puedes declarar variables 
// utilizando las palabras clave var, let, o const

// var tiene un alcance de función y puede ser
// redeclarada dentro de la misma función.
var x = 10;
var nombre = "Ejemplo";


// let tiene un alcance de bloque y no 
// puede ser redeclarada en el mismo bloque.
let y = 20;
let edad = 25;


// const se utiliza para declarar constantes 
// y tiene un alcance de bloque. 
const PI = 3.1416;
const URL = "https://www.ejemplo.com";


// Interpolación de cadenas de texto con variables
console.log(`PI: ${PI}, URL: ${URL}`);

// Dentro de las comillas
// graves (backticks), puedes incluir expresiones de JavaScript
// utilizando ${} y estas se evaluarán y se insertarán
// en la cadena resultante.

// es importante considerar el alcance de las variables
// ya que puede afectar su visibilidad y comportamiento
// en diferentes partes del código.
// Además, let y const son preferibles a var en la
// mayoría de los casos debido a su manejo más estricto
// del alcance y reasignación.