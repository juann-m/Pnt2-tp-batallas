<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import personajes from "../data/personajes.json";
import ataquesPorPokemon from "../data/ataquesPorPokemon.json";
import { obtenerDatosPokemon } from "../services/pokemonApi.js";
import { PokemonSeleccionable } from "../models/pokemonSeleccionable.js";
import { useBatallaStore } from "../stores/batallaStore";

const route = useRoute();
const router = useRouter();
const batallaStore = useBatallaStore();

const pokemonJugador = ref(null);
const rivalesDisponibles = ref([]);
const secuenciaRivales = ref([]);
const pokemonMostrado = ref(null);
const rivalElegido = ref(null);
const cargando = ref(true);
const girando = ref(false);
const error = ref("");

let intervalo = null;
let temporizador = null;

onMounted(async () => {
  try {
    const pokemones = [];

    for (const nombrePokemon of personajes) {
      const datosPokemon = await obtenerDatosPokemon(nombrePokemon);
      const ataques = ataquesPorPokemon[nombrePokemon];

      const pokemon = new PokemonSeleccionable(
        datosPokemon,
        ataques,
      );

      pokemones.push(pokemon);
    }

    // Obtener el ID del Pokémon seleccionado desde la query.
    const idJugador = route.query.pokemonJugador;

    pokemonJugador.value = pokemones.find(
      (pokemon) => pokemon.id === idJugador,
    );

    if (!pokemonJugador.value) {
      error.value = "No se encontró el Pokémon que seleccionaste.";
      return;
    }

    rivalesDisponibles.value = pokemones.filter(
      (pokemon) => pokemon.id !== pokemonJugador.value.id,
    );

    const indiceInicial = Math.floor(
      Math.random() * rivalesDisponibles.value.length,
    );

    const rivalesOrdenados = [
      ...rivalesDisponibles.value.slice(indiceInicial),
      ...rivalesDisponibles.value.slice(0, indiceInicial),
    ];

    secuenciaRivales.value = [
      ...rivalesOrdenados,
      pokemonJugador.value,
    ];

    pokemonMostrado.value = rivalesDisponibles.value[0];
  } catch (errorRecibido) {
    error.value = errorRecibido.message;
  } finally {
    cargando.value = false;
  }
});

function sortearRival() {
  if (girando.value || rivalesDisponibles.value.length === 0) {
    return;
  }

  girando.value = true;
  rivalElegido.value = null;

  let indice = 0;

  intervalo = window.setInterval(() => {
    pokemonMostrado.value = rivalesDisponibles.value[indice];
    indice = (indice + 1) % rivalesDisponibles.value.length;
  }, 120);

  temporizador = window.setTimeout(() => {
    window.clearInterval(intervalo);
    intervalo = null;

    rivalElegido.value = secuenciaRivales.value[0];
    pokemonMostrado.value = rivalElegido.value;
    girando.value = false;
    temporizador = null;
  }, 2500);
}

function comenzarBatalla() {
  if (!pokemonJugador.value || !rivalElegido.value) {
    return;
  }

  batallaStore.iniciarBatalla(
    pokemonJugador.value,
    rivalElegido.value,
  );

  router.push("/batallaPokemon");
}

onBeforeUnmount(() => {
  if (intervalo !== null) {
    window.clearInterval(intervalo);
  }

  if (temporizador !== null) {
    window.clearTimeout(temporizador);
  }
});
</script>

<template>
  <main class="seleccion-rival">
    <section class="panel-seleccion">
      <h1 class="titulo">Elegí a tu rival</h1>

      <p v-if="cargando">Cargando Pokémon...</p>

      <p v-else-if="error" class="error">
        {{ error }}
      </p>

      <template v-else>
        <div class="enfrentamiento">
          <article class="tarjeta-pokemon tarjeta-jugador">
            <p class="etiqueta">TU POKÉMON</p>

            <img
              class="pokemon-imagen pokemon-jugador"
              :src="pokemonJugador.imagen"
              :alt="pokemonJugador.nombre"
            />

            <strong>{{ pokemonJugador.nombre }}</strong>
          </article>

          <div class="versus">VS</div>

          <article class="tarjeta-pokemon tarjeta-rival">
            <p class="etiqueta">RIVAL</p>

            <img
              v-if="pokemonMostrado"
              class="pokemon-imagen"
              :src="pokemonMostrado.imagen"
              :alt="pokemonMostrado.nombre"
            />

            <strong>
              {{ pokemonMostrado?.nombre || "?" }}
            </strong>
          </article>

          <div class="acciones-rival">
            <button
              v-if="!rivalElegido"
              type="button"
              :disabled="girando"
              @click="sortearRival"
            >
              {{ girando ? "Sorteando..." : "Sortear rival" }}
            </button>

            <button
              v-else
              type="button"
              @click="comenzarBatalla"
            >
              Comenzar batalla
            </button>
          </div>
        </div>

        <section
          v-if="rivalElegido"
          class="orden-rivales"
        >
          <h3>Orden de próximos rivales</h3>

          <ol>
            <li
              v-for="pokemon in secuenciaRivales"
              :key="pokemon.id"
            >
              {{ pokemon.nombre }}
            </li>
          </ol>
        </section>
      </template>
    </section>
  </main>
</template>

<style scoped>
.seleccion-rival {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #3478bd;
  font-family: Arial, Helvetica, sans-serif;
}

.panel-seleccion {
  box-sizing: border-box;
  width: min(720px, 100%);
  padding: 24px;
  border: 5px solid #ffcb05;
  border-radius: 20px;
  background-color: #eaf4fb;
  text-align: center;
}

.titulo {
  margin: 0 0 24px;
  color: #222;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: none;
}

/*
  La grilla separa las tarjetas del botón. Así, el botón del rival
  no modifica la posición vertical de ninguna de las dos tarjetas.
*/
.enfrentamiento {
  display: grid;
  grid-template-columns: 230px 70px 230px;
  grid-template-rows: auto auto;
  justify-content: center;
  align-items: center;
  column-gap: 18px;
  row-gap: 0;
}

.tarjeta-jugador {
  grid-column: 1;
  grid-row: 1;
}

.versus {
  grid-column: 2;
  grid-row: 1;
  color: #222;
  font-size: 2rem;
  font-weight: 700;
}

.tarjeta-rival {
  grid-column: 3;
  grid-row: 1;
}

.acciones-rival {
  grid-column: 3;
  grid-row: 2;
  min-height: 58px;
}

.tarjeta-pokemon {
  box-sizing: border-box;
  display: flex;
  width: 230px;
  height: 242px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  border: 2px solid #d2d2d2;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 4px 10px rgb(0 0 0 / 15%);
}

.seleccion-rival .pokemon-imagen {
  display: block;
  width: 140px;
  max-width: 140px;
  height: 140px;
  max-height: 140px;
  object-fit: contain;
}

/* El Pokémon del jugador mira hacia el rival. */
.seleccion-rival .pokemon-jugador {
  transform: scaleX(-1);
}

.etiqueta {
  margin: 0;
  color: #2867b2;
  font-size: 0.85rem;
  font-weight: 700;
}

.tarjeta-pokemon strong {
  color: #222;
  font-size: 1.15rem;
}

button {
  margin-top: 14px;
  padding: 11px 20px;
  border: 0;
  border-radius: 10px;
  background-color: #ffcb05;
  color: #222;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.orden-rivales {
  margin-top: 12px;
}

.orden-rivales h3 {
  margin: 0 0 10px;
}

.orden-rivales ol {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style-position: inside;
}

.orden-rivales li {
  padding: 7px 10px;
  border-radius: 8px;
  background-color: #dceaf5;
}

.error {
  color: #c0392b;
}

@media (max-width: 650px) {
  .seleccion-rival {
    align-items: flex-start;
  }

  .enfrentamiento {
    grid-template-columns: 210px;
    grid-template-rows: auto auto auto auto;
    row-gap: 12px;
  }

  .tarjeta-jugador {
    grid-column: 1;
    grid-row: 1;
  }

  .versus {
    grid-column: 1;
    grid-row: 2;
    font-size: 1.5rem;
  }

  .tarjeta-rival {
    grid-column: 1;
    grid-row: 3;
  }

  .acciones-rival {
    grid-column: 1;
    grid-row: 4;
  }

  .tarjeta-pokemon {
    width: 210px;
    height: 220px;
  }

  .seleccion-rival .pokemon-imagen {
    width: 120px;
    max-width: 120px;
    height: 120px;
    max-height: 120px;
  }
}
</style>