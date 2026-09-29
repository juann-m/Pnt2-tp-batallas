<script setup>
import { ref, onMounted } from "vue"

import personajes from "../data/personajes.json"
import { obtenerImagenPokemon } from "../services/pokemonApi"
import TarjetaPokemon from "../components/tarjetaPokemon.vue"

const personajesConImagen = ref([])
const pokemonSeleccionado = ref(null)
const cargando = ref(true)
const error = ref("")

onMounted(async () => {
  try {
    for (const personaje of personajes) {
        const imagen = await obtenerImagenPokemon(personaje.nombre)

        const personajeConImagen = {
            id: personaje.id,
            nombre: personaje.nombre,
            imagen: imagen
            }
        
            // El value se utiliza para acceder al valor actual de la referencia reactiva.
        personajesConImagen.value.push(personajeConImagen)
    }

    // Cuando javaScript deteca el error se lo asigno a la variable error para que se muestre en la vista. 
  } catch (errorRecibido) {
    error.value = errorRecibido.message
  } finally {
    cargando.value = false
  }
})

function seleccionarPokemon(personaje) {
  pokemonSeleccionado.value = personaje
}
</script>

<template>
  <main>
    <h1>Seleccioná tu Pokémon</h1>

    <p v-if="cargando">Cargando Pokémon...</p>

    
    <p v-else-if="error">
      {{ error }}
    </p>

    <div v-else class="lista-pokemon">
      <TarjetaPokemon
        v-for="personaje in personajesConImagen"
        :key="personaje.id"
        :personaje="personaje"
        :seleccionado="pokemonSeleccionado?.id === personaje.id"
        @seleccionar="seleccionarPokemon"
      />
    </div>

    <p v-if="pokemonSeleccionado">
      Elegiste a {{ pokemonSeleccionado.nombre }}
    </p>
  </main>
</template>

<style scoped>
.lista-pokemon {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>