// Operadores Condicionales (if, else if, else)
let temperatura = 25;

if (temperatura > 30) {
  console.log("Hace mucho calor");
} else if (temperatura > 20) {
  console.log("El clima es agradable");
} else {
  console.log("Hace fresco");
}

// Operadores Condicionales con Operadores Lógicos
let diaSemana = "Viernes";
let esFinDeSemana = diaSemana === "Sábado" || diaSemana === "Domingo";

if (esFinDeSemana) {
  console.log("¡Es fin de semana!");
} else {
  console.log("No es fin de semana");
}

// Operadores Condicionales con Operador Ternario
let hora = 15;
let mensajeHorario = hora < 12 ? "Buenos días" : "Buenas tardes";

console.log(mensajeHorario);

// Operadores Condicionales con Operador Ternario Anidado
let esAdulto = true;
let tieneLicencia = true;

let mensajeConduccion = esAdulto
  ? tieneLicencia
    ? "Puede conducir"
    : "No puede conducir sin licencia"
  : "No es un adulto";

console.log(mensajeConduccion);
