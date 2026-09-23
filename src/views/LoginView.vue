<script setup>
import { ref } from "vue"

const usuario = ref("")
const password = ref("")
const isLoading = ref(false)
const error = ref("")
const loginExitoso = ref(false)

function iniciarSesion() {
  isLoading.value = true
  error.value = ""
  loginExitoso.value = false

  try {
    if (usuario.value === "juan" && password.value === "1234") {
      loginExitoso.value = true
    } else {
      error.value = "Usuario o contraseña incorrectos."
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <h1>Iniciar sesión</h1>

  <form @submit.prevent="iniciarSesion">
    <label for="usuario">Usuario</label>
    <input id="usuario" v-model="usuario" type="text" />

    <label for="password">Contraseña</label>
    <input id="password" v-model="password" type="password" />

    <button type="submit" :disabled="isLoading">
      Ingresar
    </button>
  </form>

  <p v-if="error">{{ error }}</p>
  <p v-if="loginExitoso">¡Bienvenido, {{ usuario }}!</p>
</template>