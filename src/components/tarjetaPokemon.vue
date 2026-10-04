<script>
export default {

  // Props declara los datos que el componente espera recibir de su padre. 
  // En este caso, se espera un objeto "personaje" y un booleano "seleccionado".

  props: {
    personaje: {
      type: Object,
      required: true
    },
    seleccionado: {
      type: Boolean,
      default: false
    }
  },

  emits: ["seleccionar"],

  methods: {
    seleccionarEstaTarjeta() {
      this.$emit("seleccionar", this.personaje)
    }
  }
}
</script>

<template>
  <button
    type="button"
    class="tarjeta-pokemon"
    v-bind:class="{ seleccionada: seleccionado }"
    v-on:click="seleccionarEstaTarjeta"
  >
    <img
      v-bind:src="personaje.imagen"
      v-bind:alt="personaje.nombre"
    >
    <span>{{ personaje.nombre }}</span>
  </button>
</template>

<style scoped>
.tarjeta-pokemon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.tarjeta-pokemon img {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.tarjeta-pokemon.seleccionada {
  border-color: #2e8b57;
}
</style>