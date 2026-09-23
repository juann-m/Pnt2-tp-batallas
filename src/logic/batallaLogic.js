

// Comprueba si un ataque acierta según su precisión.
// genera un número aleatorio y lo compara con la precisión del ataque.
// luego devuelve true si el ataque acierta y false si falla.
export function comprobarPrecision(precision) {
  const numeroAleatorio = Math.floor(Math.random() * 100) + 1

  const ataqueAcertado = numeroAleatorio <= precision

  return ataqueAcertado
}


// Calcula cuánto daño causa un ataque.
export function calcularDano(personajeAtacante, personajeDefensor, ataqueSeleccionado) {
  const danoBase =
    (personajeAtacante.ataque +
      ataqueSeleccionado.potencia -
      personajeDefensor.defensa) / 3

  const danoFinal = Math.max(1, Math.round(danoBase))

  return danoFinal
}


// Decide quién realiza el primer ataque de cada ronda.
export function decidirPrimerAtacanteDeRonda(pokemonJugador, pokemonRival) {

  const resultadoAleatorio = Math.random();

  // 15% de las veces se decide al azar
  if (resultadoAleatorio < 0.15) {

    const decisionAleatoria = Math.random();

    if (decisionAleatoria < 0.5) {
      return "jugador";
    } else {
      return "rival";
    }
  } 

  // El 85% restante manda la velocidad
  if (pokemonJugador.velocidad > pokemonRival.velocidad) {
    return "jugador";

  } else if (pokemonRival.velocidad > pokemonJugador.velocidad) {
    return "rival";

  } else {
    // misma velocidad
    if (Math.random() < 0.5) {
      return "jugador";
    } else {
      return "rival";
    }
  }
}