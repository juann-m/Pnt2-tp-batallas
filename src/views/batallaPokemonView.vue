<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useBatallaStore } from "@/stores/batallaStore";
import { useAuthStore } from "@/stores/auth";
import { obtenerDatosPokemon } from "@/services/pokemonApi.js";
import ataques from "@/data/ataques.json";

const router = useRouter();
const batallaStore = useBatallaStore();
const authStore = useAuthStore();

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
    fase.value = "terminada";
    return;
  }

  programarAtaqueRival();
}

function porcentajeVida(pokemon) {
  if (!pokemon || pokemon.vidaMaxima === 0) return 0;
  return Math.max(0, (pokemon.vidaActual / pokemon.vidaMaxima) * 100);
}

function claseBarraVida(pokemon) {
  if (porcentajeVida(pokemon) <= 25) return "vida-baja";
  if (porcentajeVida(pokemon) <= 50) return "vida-media";
  return "vida-alta";
}

function volverASeleccion() {
  batallaStore.$reset();
  router.push("/seleccionPokemon");
}

function cerrarSesion() {
  batallaStore.$reset();
  authStore.logout();
  router.push("/");
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
        <span v-if="authStore.usuario">Hola, {{ authStore.usuario }}</span>
        <button type="button" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </header>

    <section class="arena" aria-label="Campo de batalla">
      <article class="tarjeta tarjeta-rival">
        <div class="datos-pokemon">
          <p class="etiqueta">RIVAL</p>
          <h2>{{ pokemonRival?.nombre }}</h2>
          <span class="tipo-pokemon">{{ pokemonRival?.tipo }}</span>
          <div class="vida-pokemon">
            <div class="texto-vida">
              <span>VIDA</span>
              <strong>{{ pokemonRival?.vidaActual }} / {{ pokemonRival?.vidaMaxima }}</strong>
            </div>
            <div class="fondo-vida">
              <div
                class="barra-vida"
                :class="claseBarraVida(pokemonRival)"
                :style="{ width: porcentajeVida(pokemonRival) + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <img v-if="imagenRival" :src="imagenRival" :alt="pokemonRival?.nombre" />
        <span v-else class="sin-imagen">?</span>
      </article>

      <article class="tarjeta tarjeta-jugador">
        <img
          v-if="imagenJugador"
          class="imagen-jugador"
          :src="imagenJugador"
          :alt="pokemonJugador?.nombre"
        />
        <span v-else class="sin-imagen">?</span>
        <div class="datos-pokemon">
          <p class="etiqueta">TU POKÉMON</p>
          <h2>{{ pokemonJugador?.nombre }}</h2>
          <span class="tipo-pokemon">{{ pokemonJugador?.tipo }}</span>
          <div class="vida-pokemon">
            <div class="texto-vida">
              <span>VIDA</span>
              <strong>{{ pokemonJugador?.vidaActual }} / {{ pokemonJugador?.vidaMaxima }}</strong>
            </div>
            <div class="fondo-vida">
              <div
                class="barra-vida"
                :class="claseBarraVida(pokemonJugador)"
                :style="{ width: porcentajeVida(pokemonJugador) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="panel-acciones" aria-live="polite">
      <p class="mensaje-batalla">{{ mensajeBatalla }}</p>

      <p v-if="fase === 'cargando'" class="estado-batalla">Cargando Pokémon...</p>

      <p v-else-if="fase === 'esperando_rival'" class="estado-batalla">
        El rival está atacando...
      </p>

      <div v-else-if="fase === 'en_curso'" class="ataques">
        <h2>Elegí un ataque</h2>
        <div class="lista-ataques">
          <button
            v-for="ataque in ataquesDelJugador"
            :key="ataque.id"
            type="button"
            class="boton-ataque"
            :disabled="batallaStore.turnoActual !== 'jugador'"
            @click="realizarAtaqueJugador(ataque.id)"
          >
            <strong>{{ ataque.nombre }}</strong>
            <span>{{ ataque.tipo }} · Potencia {{ ataque.potencia }}</span>
          </button>
        </div>
      </div>

      <div v-else-if="fase === 'terminada'" class="resultado-batalla">
        <h2>{{ batallaStore.ganador === "jugador" ? "¡Ganaste!" : "Fin de la batalla" }}</h2>
        <button type="button" class="boton-volver" @click="volverASeleccion">
          Volver a seleccionar Pokémon
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.pantalla-batalla { width: min(100%, 1050px); margin: 0 auto; color: var(--texto, #2b2b2b); font-family: "Segoe UI", system-ui, sans-serif; }
.pantalla-batalla :deep(.barra-superior) { margin: -12px -12px 20px; }
.barra-superior, .sesion { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.arena { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; min-height: 420px; padding: 24px; border: 5px solid var(--poke-amarillo, #ffcb05); border-radius: 20px; background: linear-gradient(180deg, #e6f1f8 0 49%, #c8e0b7 49% 100%); }
.tarjeta { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-width: 0; padding: 18px; border: 2px solid #d9d9d9; border-radius: 16px; background: rgb(255 255 255 / 94%); box-shadow: 0 6px 18px rgb(32 48 64 / 12%); }
.tarjeta-rival { grid-column: 2; grid-row: 1; }
.tarjeta-jugador { grid-column: 1; grid-row: 2; }
.datos-pokemon { flex: 1; min-width: 0; }
.etiqueta { margin: 0 0 5px; color: var(--poke-azul, #2a75bb); font-size: .76rem; font-weight: 800; letter-spacing: 1px; }
h2 { margin: 0 0 7px; }
.tipo-pokemon { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e7f0fa; color: #3c5aa6; font-size: .82rem; text-transform: capitalize; }
.vida-pokemon { margin-top: 18px; }
.texto-vida { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 7px; font-size: .78rem; }
.fondo-vida { height: 13px; overflow: hidden; border: 1px solid #cbd3d8; border-radius: 999px; background: #e8edf0; }
.barra-vida { height: 100%; border-radius: inherit; transition: width 400ms ease; }
.vida-alta { background: #45b85c; }
.vida-media { background: #f0b52c; }
.vida-baja { background: #e44e4e; }
.tarjeta img, .sin-imagen { flex: 0 0 130px; width: 130px; height: 130px; object-fit: contain; }
.tarjeta img { filter: drop-shadow(0 8px 6px rgb(0 0 0 / 18%)); }
.imagen-jugador { transform: scaleX(-1); }
.sin-imagen { display: grid; place-items: center; border-radius: 50%; background: #eef2f4; color: #7b8991; font-size: 2.5rem; font-weight: 800; }
.panel-acciones { margin-top: 18px; padding: 20px; border: 1px solid #d9d9d9; border-top: 7px solid var(--poke-rojo, #ee1515); border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgb(0 0 0 / 15%); }
.mensaje-batalla { margin: 0 0 16px; padding: 12px 16px; border-left: 4px solid var(--poke-azul, #2a75bb); background: #f2f7fb; }
.lista-ataques { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.boton-ataque { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; min-height: 68px; margin: 0; padding: 12px 14px; border: 2px solid #d9d9d9; background: #fff; color: inherit; text-align: left; }
.boton-ataque:disabled { cursor: not-allowed; opacity: .6; }
.boton-ataque span { color: #606c74; font-size: .78rem; text-transform: capitalize; }
.estado-batalla, .resultado-batalla { text-align: center; }
.boton-volver { margin: 0; background: var(--poke-amarillo, #ffcb05); color: #2b2b2b; }
@media (max-width: 700px) {
  .pantalla-batalla :deep(.barra-superior) { margin-right: -12px; margin-left: -12px; }
  .arena { grid-template-columns: 1fr; grid-template-rows: auto auto; gap: 16px; min-height: auto; padding: 14px; }
  .tarjeta-rival, .tarjeta-jugador { grid-column: 1; grid-row: auto; }
  .tarjeta { min-height: 170px; padding: 12px; }
  .tarjeta img, .sin-imagen { flex-basis: 95px; width: 95px; height: 95px; }
  .lista-ataques { grid-template-columns: 1fr; }
}
</style>
