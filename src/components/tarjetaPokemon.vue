<script setup>
defineProps({
  personaje: {
    type: Object,
    required: true
  },
  seleccionado: {
    type: Boolean,
    default: false
  }
})

defineEmits(["seleccionar"])
</script>

<template>
  <button
    type="button"
    class="tarjeta-pokemon"
    :class="{ seleccionada: seleccionado }"
    @click="$emit('seleccionar', personaje)"
  >
    <img :src="personaje.imagen" :alt="personaje.nombre">
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