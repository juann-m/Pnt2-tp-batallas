<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { obtenerRanking } from "../services/rankingApi"

const router = useRouter()
const authStore = useAuthStore()

const ranking = ref([])
const cargando = ref(true)
const error = ref("")

function cerrarSesion() {
  authStore.logout() // Pinia limpia estado + localStorage
  router.push("/") // volvés al login
}

onMounted(() => {
  try {
    ranking.value = obtenerRanking()
  } catch (errorRecibido) {
    error.value = "No se pudo cargar el ranking."
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <main>
    <header class="barra-superior">
      <h1>Ranking de usuarios</h1>

      <div class="sesion">
        <router-link to="/seleccionPokemon">Volver</router-link>
        <span v-if="authStore.usuario">Hola, {{ authStore.usuario }}</span>
        <button type="button" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </header>

    <p v-if="cargando" class="mensaje">Cargando ranking...</p>

    <p v-else-if="error" class="mensaje error">
      {{ error }}
    </p>

    <p v-else-if="ranking.length === 0" class="mensaje">
      Todavía no hay usuarios registrados en el ranking.
    </p>

    <section v-else class="tabla-ranking-wrapper">
      <table class="tabla-ranking">
        <thead>
          <tr>
            <th>Puesto</th>
            <th>Usuario</th>
            <th>Mejor puntaje</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(registro, indice) in ranking" :key="registro.usuario">
            <td>{{ indice + 1 }}</td>
            <td>{{ registro.usuario }}</td>
            <td>{{ registro.puntajeMaximo }} / 3</td>
            <td>{{ registro.fecha }}</td>
          </tr>
        </tbody>
      </table>
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

.mensaje {
  text-align: left;
}

.error {
  color: #c0392b;
}

.sesion a {
  color: #fff;
  font-weight: 600;
  text-decoration: underline;
}

.tabla-ranking-wrapper {
  box-sizing: border-box;
  max-width: 500px;
  margin: 0;
  padding: 20px;
  border: 1px solid #dce5e8;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(32 48 64 / 10%);
}

.tabla-ranking {
  width: 100%;
  border-collapse: collapse;
}

.tabla-ranking th,
.tabla-ranking td {
  padding: 10px 12px;
  border-bottom: 1px solid #dce5e8;
  text-align: left;
}

.tabla-ranking th {
  background: #f4f7f8;
}

.tabla-ranking tbody tr:last-child td {
  border-bottom: none;
}
</style>

