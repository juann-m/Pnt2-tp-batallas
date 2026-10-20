<script setup>
import { ref, onMounted, computed } from "vue";
import personajes from "../data/personajes.json";
import TarjetaPokemon from "../components/tarjetaPokemon.vue";
import { obtenerDatosPokemon } from "../services/pokemonApi.js";
import { PokemonSeleccionable } from "../models/pokemonSeleccionable.js";
import ataquesPorPokemon from "../data/ataquesPorPokemon.json";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const pokemonesSeleccionables = ref([]);
const pokemonSeleccionado = ref(null);
const cargando = ref(true);
const error = ref("");
const ESCALA_ESTADISTICAS = 100;

const router = useRouter();
const authStore = useAuthStore();

function cerrarSesion() {
  authStore.logout(); // Pinia limpia estado + localStorage
  router.push("/"); // volvés al login
}

onMounted(async () => {
  try {
    for (const nombrePokemon of personajes) {
      const datosPokemon = await obtenerDatosPokemon(nombrePokemon);
      const ataques = ataquesPorPokemon[nombrePokemon];

      const pokemon = new PokemonSeleccionable(datosPokemon, ataques);
      pokemonesSeleccionables.value.push(pokemon);
    }
  } catch (errorRecibido) {
    error.value = errorRecibido.message;
  } finally {
    cargando.value = false;
  }
});

function seleccionarPokemon(pokemon) {
  pokemonSeleccionado.value = pokemon;
}

const estadisticasSeleccionadas = computed(function () {
  const pokemon = pokemonSeleccionado.value;

  if (!pokemon) {
    return [];
  }

  const estadisticas = [
    { nombre: "Vida", clave: "vidaMaxima" },
    { nombre: "Ataque", clave: "ataque" },
    { nombre: "Defensa", clave: "defensa" },
    { nombre: "Velocidad", clave: "velocidad" },
  ];

  return estadisticas.map(function (estadistica) {
    const valor = pokemon[estadistica.clave];

    return {
      nombre: estadistica.nombre,
      valor: valor,
      porcentaje: (valor / ESCALA_ESTADISTICAS) * 100,
    };
  });
});
</script>

<template>
  <main>
    <header class="barra-superior">
      <h1>Seleccioná tu Pokémon</h1>

      <div class="sesion">
        <span v-if="authStore.usuario">Hola, {{ authStore.usuario }}</span>
        <button type="button" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </header>

    <p v-if="cargando" class="mensaje">Cargando Pokémon...</p>

    <p v-else-if="error" class="mensaje error">
      {{ error }}
    </p>

    <div v-else class="lista-pokemon">
      <TarjetaPokemon
        v-for="pokemon in pokemonesSeleccionables"
        :key="pokemon.id"
        :personaje="pokemon"
        :seleccionado="pokemonSeleccionado?.id === pokemon.id"
        @seleccionar="seleccionarPokemon"
      />
    </div>

    <section v-if="pokemonSeleccionado" class="resumen-pokemon">
      <h2>Seleccionaste a {{ pokemonSeleccionado.nombre }}</h2>

      <div
        v-for="estadistica in estadisticasSeleccionadas"
        :key="estadistica.nombre"
        class="fila-estadistica"
      >
        <div class="etiqueta-estadistica">
          <span>{{ estadistica.nombre }}</span>
          <span>{{ estadistica.valor }}</span>
        </div>

        <div class="fondo-barra">
          <div
            class="barra"
            :style="{ width: estadistica.porcentaje + '%' }"
          ></div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
main {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 12px;
  color: #203040;
  font-family: Arial, sans-serif;
}

h1 {
  margin: 0 0 20px;
  font-size: 1.8rem;
  text-align: left;
}

.lista-pokemon {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 12px;
}

.mensaje {
  text-align: left;
}

.error {
  color: #c0392b;
}

.resumen-pokemon {
  box-sizing: border-box;
  max-width: 430px;
  margin: 24px 0 0;
  padding: 20px;
  border: 1px solid #dce5e8;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(32 48 64 / 10%);
}

.resumen-pokemon h2 {
  margin: 0 0 18px;
  font-size: 1.15rem;
  text-align: left;
}

.fila-estadistica {
  margin-bottom: 14px;
}

.fila-estadistica:last-child {
  margin-bottom: 0;
}

.etiqueta-estadistica {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.etiqueta-estadistica span:last-child {
  font-weight: bold;
}

.fondo-barra {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #e8eef0;
}

.barra {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #58c77a, #238d4b);
  transition: width 350ms ease;
}
</style>
