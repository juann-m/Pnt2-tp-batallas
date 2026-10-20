import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Inicializamos leyendo de localStorage para mantener la sesión al recargar
  const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')
  const usuario = ref(localStorage.getItem('usuario') || '')

  function login(nombreUsuario) {
    isLoggedIn.value = true
    usuario.value = nombreUsuario
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('usuario', nombreUsuario)
  }

  function logout() {
    isLoggedIn.value = false
    usuario.value = ''
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('usuario')
  }

  return { isLoggedIn, usuario, login, logout }
})