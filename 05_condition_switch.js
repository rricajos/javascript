// Declaración Switch
let today = new Date();
let diaDeLaSemana = today.toLocaleString('es', { weekday: 'long' });

switch (diaDeLaSemana) {
  case "lunes":
    console.log("Es el primer día de la semana.");
    break;
  case "martes":
  case "miércoles":
  case "jueves":
    console.log("Estamos a mitad de semana.");
    break;
  case "viernes":
    console.log("¡Es viernes, el fin de semana está cerca!");
    break;
  case "sábado":
  case "domingo":
    console.log("¡Es fin de semana!");
    break;
  default:
    console.log("No es un día válido.");
    break;
}