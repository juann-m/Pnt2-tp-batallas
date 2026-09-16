import { defineStore } from "pinia"
import { pokemonBatalla } from "../models/PokemonBatalla"

import ataques from "../data/ataques.json"

import {
  comprobarPrecision,
  calcularDano,
  decidirPrimerTurno
} from "../logic/batallaLogic"


// Para usar Pinia defino:
// 1. Estado inicial.
// 2. Acciones que modifican el estado. Esto se hace en un objeto. 

// (1) - Función que devuelve el estado inicial.
function estadoInicialBatalla() {
  return {
    pokemonJugador: null,
    pokemonRival: null,
    turnoActual: null,
    numeroTurno: 1,
    estado: "no_iniciada",
    ganador: null,
    registroTurnos: []
  }
}

// (2) - Objeto que contiene las acciones del store.
// reset resetea el estado a su valor inicial definido en estadoInicialBatalla.
// Esto ocurre antes de iniciar una nueva batalla.

const accionesBatalla = {
 iniciarBatalla(personajeJugador, personajeRival) {
  this.$reset()

  this.pokemonJugador = new pokemonBatalla(
    personajeJugador
  )

  this.pokemonRival = new pokemonBatalla(
    personajeRival
  )

  this.turnoActual = decidirPrimerTurno(
    this.pokemonJugador,
    this.pokemonRival
  )

  this.estado = "en_curso"
},


  realizarAtaque(ataqueId) {
    if (this.estado !== "en_curso") {
      return
    }

    const ataqueSeleccionado = ataques.find(
      ataque => ataque.id === ataqueId
    )

    if (!ataqueSeleccionado) {
      return
    }

    let personajeAtacante
    let personajeDefensor

    if (this.turnoActual === "jugador") {
      personajeAtacante = this.pokemonJugador
      personajeDefensor = this.pokemonRival
    } else {
      personajeAtacante = this.pokemonRival
      personajeDefensor = this.pokemonJugador
    }

    const ataqueAcertado = comprobarPrecision(
      ataqueSeleccionado.precision
    )

    let danoRealizado = 0

    if (ataqueAcertado) {
      danoRealizado = calcularDano(
        personajeAtacante,
        personajeDefensor,
        ataqueSeleccionado
      )

      personajeDefensor.vidaActual =
        personajeDefensor.vidaActual - danoRealizado

      if (personajeDefensor.vidaActual < 0) {
        personajeDefensor.vidaActual = 0
      }
    }

    this.registroTurnos.push({
      numeroTurno: this.numeroTurno,
      atacante: personajeAtacante.nombre,
      ataque: ataqueSeleccionado.nombre,
      acerto: ataqueAcertado,
      dano: danoRealizado,
      vidaRestanteDefensor: personajeDefensor.vidaActual
    })

    this.comprobarGanador()

    if (this.estado === "en_curso") {
      this.cambiarTurno()
      this.numeroTurno++
    }
  },


  comprobarGanador() {
    if (this.pokemonRival.vidaActual === 0) {
      this.ganador = "jugador"
      this.estado = "finalizada"
    }

    if (this.pokemonJugador.vidaActual === 0) {
      this.ganador = "rival"
      this.estado = "finalizada"
    }
  },


  cambiarTurno() {
    if (this.turnoActual === "jugador") {
      this.turnoActual = "rival"
    } else {
      this.turnoActual = "jugador"
    }
  }
}


// Objeto de configuración que reúne las partes anteriores.
const configuracion = {
  state: estadoInicialBatalla,
  actions: accionesBatalla
}


// Creación y exportación del store.
export const useBatallaStore = defineStore(
  "batalla",
  configuracion
)
