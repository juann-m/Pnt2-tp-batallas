
export class pokemonBatalla {
  constructor(personajeOriginal) {
    this.id = personajeOriginal.id
    this.nombre = personajeOriginal.nombre
    this.tipo = personajeOriginal.tipo
    this.vidaMaxima = personajeOriginal.vidaMaxima
    this.vidaActual = personajeOriginal.vidaMaxima
    this.ataque = personajeOriginal.ataque
    this.defensa = personajeOriginal.defensa
    this.velocidad = personajeOriginal.velocidad

    this.ataquesDisponibles = [
      ...personajeOriginal.ataquesDisponibles
    ]
  }
}