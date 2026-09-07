

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


// Decide quién realiza el primer ataque.
export function decidirPrimerTurno(pokemonJugador, pokemonRival) {
  if (pokemonJugador.velocidad > pokemonRival.velocidad) {
    return "jugador"
  }

  if (pokemonRival.velocidad > pokemonJugador.velocidad) {
    return "rival"
  }

  const resultadoAleatorio = Math.random()

  if (resultadoAleatorio < 0.5) {
    return "jugador"
  }

  return "rival"
}