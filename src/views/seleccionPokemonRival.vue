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

async function cargarPokemones() {
  try {
    const pokemones = [];

    for (const nombre of personajes) {
      const datos = await obtenerDatosPokemon(nombre);
      const pokemon = new PokemonSeleccionable(
        datos,
        ataquesPorPokemon[nombre],
      );

      pokemones.push(pokemon);
    }

    const idJugador = String(route.query.pokemonJugador || "");

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
}

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

onMounted(cargarPokemones);

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
    <h1>Elegí a tu rival</h1>

    <p v-if="cargando">Cargando Pokémon...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <section class="tarjeta jugador">
        <h2>Tu Pokémon</h2>
        <img :src="pokemonJugador.imagen" :alt="pokemonJugador.nombre" />
        <strong>{{ pokemonJugador.nombre }}</strong>
      </section>

      <section class="selector-rival">
        <h2>
          {{ rivalElegido ? "¡Este es tu rival!" : "Sorteando rival" }}
        </h2>

        <article class="tarjeta slot">
          <img
            v-if="pokemonMostrado"
            :src="pokemonMostrado.imagen"
            :alt="pokemonMostrado.nombre"
          />
          <strong>{{ pokemonMostrado?.nombre || "?" }}</strong>
        </article>

        <button
          v-if="!rivalElegido"
          type="button"
          :disabled="girando"
          @click="sortearRival"
        >
          {{ girando ? "Sorteando..." : "Sortear rival" }}
        </button>

        <div v-else>
          <h3>Orden de rivales si ganás</h3>
          <ol>
            <li
              v-for="pokemon in secuenciaRivales"
              :key="pokemon.id"
            >
              {{ pokemon.nombre }}
            </li>
          </ol>

          <button type="button" @click="comenzarBatalla">
            Comenzar batalla
          </button>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.seleccion-rival {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
  text-align: center;
}

.tarjeta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 20px auto;
  padding: 18px;
  border: 2px solid #d9d9d9;
  border-radius: 16px;
  background: white;
}

.tarjeta img {
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.jugador {
  max-width: 220px;
}

.slot {
  max-width: 240px;
  min-height: 190px;
}

button {
  padding: 12px 20px;
  border: 0;
  border-radius: 10px;
  background: #ffcb05;
  color: #222;
  font-weight: bold;
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.error {
  color: #c0392b;
}
</style>