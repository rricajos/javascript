let contador = 0;

// empieza despues de comprobar la condicion
while (contador < 5) {
    console.log(`Iteración ${contador + 1}`);
    contador++;
}

// empieza antes de comprobar la condicion
do {
    console.log(`Iteración ${contador + 1}`);
    contador++;
} while (contador < 5)

// Pros y contras del bucle while

/*
Pros:
1. Sencillez: Bucle simple y fácil de entender, especialmente para condiciones simples.
2. Flexibilidad: Ejecución de un bloque mientras la condición sea verdadera.

Contras:
1. Posible bucle infinito: Si la condición nunca es falsa, puede haber un bucle infinito.
2. Gestión manual de la variable de control: Olvidos pueden resultar en errores.
3. Menos legible en algunos casos: Comparado con otros bucles, como el for.
4. Mayor propensión a errores: Gestión manual puede llevar a errores.

Recomendación:
- Usa el bucle while cuando la salida dependa de una condición dinámica o externa.

Ejemplo específico:
- Este bucle se ejecutará hasta que el contador alcance 5. Cada iteración se registra.
*/