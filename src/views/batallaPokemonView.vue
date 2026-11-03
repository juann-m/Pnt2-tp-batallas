<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useBatallaStore } from "@/stores/batallaStore";
import { useCerrarSesion } from "@/composables/useCerrarSesion";
import { claseBarraVida, porcentajeVida } from "@/helpers/batalla";
import { obtenerDatosPokemon } from "@/services/pokemonApi.js";
import { sumarPunto } from "@/services/rankingApi.js";
import ataques from "@/data/ataques.json";

const router = useRouter();
const batallaStore = useBatallaStore();
const {
  cerrarSesion: cerrarSesionUsuario,
  usuario,
} = useCerrarSesion();

const fase = ref("cargando");
const mensajeBatalla = ref("Preparando la batalla...");
const imagenJugador = ref("");
const imagenRival = ref("");
let temporizador = null;

const pokemonJugador = computed(() => batallaStore.pokemonJugador);
const pokemonRival = computed(() => batallaStore.pokemonRival);

const ataquesDelJugador = computed(() => {
  if (!pokemonJugador.value) return [];

  return pokemonJugador.value.ataquesDisponibles
    .map((ataqueId) => ataques.find((ataque) => ataque.id === ataqueId))
    .filter((ataque) => ataque !== undefined);
});

function obtenerImagen(datosPokemon) {
  return (
    datosPokemon.sprites.other?.["official-artwork"]?.front_default ||
    datosPokemon.sprites.front_default ||
    ""
  );
}

async function cargarImagenes() {
  try {
    const datos = await obtenerDatosPokemon(pokemonJugador.value.nombre.toLowerCase());
    imagenJugador.value = obtenerImagen(datos);
  } catch (error) {
    console.error("No se pudo cargar la imagen de tu Pokémon.", error);
  }

  try {
    const datos = await obtenerDatosPokemon(pokemonRival.value.nombre.toLowerCase());
    imagenRival.value = obtenerImagen(datos);
  } catch (error) {
    console.error("No se pudo cargar la imagen del rival.", error);
  }
}

function describirUltimoAtaque() {
  const ultimoTurno = batallaStore.registroTurnos.at(-1);
  if (!ultimoTurno) return;

  mensajeBatalla.value = ultimoTurno.acerto
    ? `${ultimoTurno.atacante} usó ${ultimoTurno.ataque} e hizo ${ultimoTurno.dano} de daño.`
    : `${ultimoTurno.atacante} usó ${ultimoTurno.ataque}, pero falló.`;
}

// suma un punto al ranking si el jugador ganó la batalla que acaba de terminar
// (al perder no pasa nada: los puntos nunca bajan ni se resetean)
function actualizarRanking() {
  const nombreUsuario = usuario.value;
  if (!nombreUsuario) return;

  if (batallaStore.ganador === "jugador") {
    sumarPunto(nombreUsuario);
  }
}

function programarAtaqueRival() {
  fase.value = "esperando_rival";
  temporizador = window.setTimeout(realizarAtaqueRival, 800);
}

function realizarAtaqueRival() {
  if (
    batallaStore.estado !== "en_curso" ||
    batallaStore.turnoActual !== "rival"
  ) {
    return;
  }

  const ataquesRival = pokemonRival.value.ataquesDisponibles;
  const indice = Math.floor(Math.random() * ataquesRival.length);
  batallaStore.realizarAtaque(ataquesRival[indice]);
  describirUltimoAtaque();

  if (batallaStore.estado === "finalizada") {
    actualizarRanking();
    fase.value = "terminada";
    return;
  }

  fase.value = "en_curso";
  mensajeBatalla.value += " Tu turno: elegí un ataque.";
}

function realizarAtaqueJugador(ataqueId) {
  if (fase.value !== "en_curso" || batallaStore.turnoActual !== "jugador") {
    return;
  }

  batallaStore.realizarAtaque(ataqueId);
  describirUltimoAtaque();

  if (batallaStore.estado === "finalizada") {
    actualizarRanking();
    fase.value = "terminada";
    return;
  }

  programarAtaqueRival();
}

function volverASeleccion() {
  batallaStore.$reset();
  router.push("/seleccionPokemon");
}

function cerrarSesion() {
  batallaStore.$reset();
  cerrarSesionUsuario();
}

// Inicialización de la vista
// si no hay Pokémon seleccionados o la batalla no está en curso, redirige a la selección de Pokémon

onMounted(async () => {
  if (!pokemonJugador.value || !pokemonRival.value) {
    batallaStore.iniciarBatalla(
      {
        id: "prueba-jugador",
        nombre: "Pikachu",
        tipo: "eléctrico",
        vidaMaxima: 100,
        ataque: 52,
        defensa: 43,
       ataquesDisponibles: [
                                "ataque_impactrueno",
                                "ataque_placaje",
                                "ataque_rayo",
                                "ataque_rapido",
                              ],
      },
      {
        id: "prueba-rival",
        nombre: "Charmander",
        tipo: "fuego",
        vidaMaxima: 100,
        ataque: 52,
        defensa: 43,
        ataquesDisponibles: [
                                "ataque_ascuas",
                                "ataque_placaje",
                                "ataque_cuchillada",
                                "ataque_giro_fuego",
                              ],
      
      }
    );
    
  }

  if (batallaStore.estado !== "en_curso") {
    router.replace("/seleccionPokemon");
    return;
  }

  await cargarImagenes();

  if (batallaStore.turnoActual === "rival") {
    mensajeBatalla.value = "El rival comienza la batalla.";
    programarAtaqueRival();
  } else {
    fase.value = "en_curso";
    mensajeBatalla.value = "¡Comienza la batalla! Elegí un ataque.";
  }
});

onBeforeUnmount(() => {
  if (temporizador !== null) window.clearTimeout(temporizador);
});
</script>

<template>
  <main class="pantalla-batalla">
    <header class="barra-superior">
      <h1>Batalla Pokémon</h1>

      <div class="sesion">
        <span v-if="usuario">
          Hola, {{ usuario }}
        </span>

        <button
          type="button"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </button>
      </div>
    </header>

    <section
      class="arena"
      aria-label="Campo de batalla"
    >
      <!-- Pokémon rival -->
      <article class="tarjeta tarjeta-rival">
        <div class="datos-pokemon">
          <p class="etiqueta">RIVAL</p>

          <h2>{{ pokemonRival?.nombre }}</h2>

          <span class="tipo-pokemon">
            {{ pokemonRival?.tipo }}
          </span>

          <div class="vida-pokemon">
            <div class="texto-vida">
              <span>VIDA</span>

              <strong>
                {{ pokemonRival?.vidaActual }} /
                {{ pokemonRival?.vidaMaxima }}
              </strong>
            </div>

            <div class="fondo-vida">
              <div
                class="barra-vida"
                :class="claseBarraVida(pokemonRival)"
                :style="{
                  width:
                    porcentajeVida(pokemonRival) + '%',
                }"
              ></div>
            </div>
          </div>
        </div>

        <img
          v-if="imagenRival"
          :src="imagenRival"
          :alt="pokemonRival?.nombre"
        />

        <span
          v-else
          class="sin-imagen"
        >
          ?
        </span>
      </article>

      <!-- Pokémon del jugador -->
      <article class="tarjeta tarjeta-jugador">
        <img
          v-if="imagenJugador"
          class="imagen-jugador"
          :src="imagenJugador"
          :alt="pokemonJugador?.nombre"
        />

        <span
          v-else
          class="sin-imagen"
        >
          ?
        </span>

        <div class="datos-pokemon">
          <p class="etiqueta">TU POKÉMON</p>

          <h2>{{ pokemonJugador?.nombre }}</h2>

          <span class="tipo-pokemon">
            {{ pokemonJugador?.tipo }}
          </span>

          <div class="vida-pokemon">
            <div class="texto-vida">
              <span>VIDA</span>

              <strong>
                {{ pokemonJugador?.vidaActual }} /
                {{ pokemonJugador?.vidaMaxima }}
              </strong>
            </div>

            <div class="fondo-vida">
              <div
                class="barra-vida"
                :class="claseBarraVida(pokemonJugador)"
                :style="{
                  width:
                    porcentajeVida(pokemonJugador) + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </article>

      <!-- Panel ubicado junto al Pokémon del jugador -->
      <section
        class="panel-acciones"
        aria-live="polite"
      >
        <p class="mensaje-batalla">
          {{ mensajeBatalla }}
        </p>

        <p
          v-if="fase === 'cargando'"
          class="estado-batalla"
        >
          Cargando Pokémon...
        </p>

        <p
          v-else-if="fase === 'esperando_rival'"
          class="estado-batalla"
        >
          El rival está atacando...
        </p>

        <div
          v-else-if="fase === 'en_curso'"
          class="ataques"
        >
          <h2>Elegí tu ataque</h2>

          <div class="lista-ataques">
            <button
              v-for="ataque in ataquesDelJugador"
              :key="ataque.id"
              type="button"
              class="boton-ataque"
              :disabled="
                batallaStore.turnoActual !== 'jugador'
              "
              @click="
                realizarAtaqueJugador(ataque.id)
              "
            >
              <strong>{{ ataque.nombre }}</strong>

              <span>
                {{ ataque.tipo }} · Potencia
                {{ ataque.potencia }}
              </span>
            </button>
          </div>
        </div>

        <div
          v-else-if="fase === 'terminada'"
          class="resultado-batalla"
        >
          <h2>
            {{
              batallaStore.ganador === "jugador"
                ? "¡Ganaste!"
                : "Fin de la batalla"
            }}
          </h2>

          <button
            type="button"
            class="boton-volver"
            @click="volverASeleccion"
          >
            Volver a seleccionar Pokémon
          </button>
        </div>
      </section>
    </section>
  </main>
</template>
