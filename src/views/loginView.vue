<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()  
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
      localStorage.setItem('isLoggedIn', 'true')
      router.push('/seleccionPokemon')
    } else {
      error.value = "Usuario o contraseña incorrectos."
    }
  } finally {
    isLoading.value = false
  }
}

function irACrearUsuario() {
  router.push("/crearUsuario")
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

    <button type="button" @click="irACrearUsuario">
    Crear usuario
    </button>


  </form>

  <p v-if="error">{{ error }}</p>
  <p v-if="loginExitoso">¡Bienvenido, {{ usuario }}!</p>
</template>