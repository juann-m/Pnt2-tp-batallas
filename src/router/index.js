import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
//router es el array de rutas que va a tener la app, cada ruta tiene un path y un componente asociado


const routes = [
    {
        path: '/',
        component: () => import('../views/loginView.vue'),
        meta: { title: 'Login' }
    },
    {
        path: '/crearUsuario',
        component: () => import('../views/crearUsuario.vue'),
        meta: { title: 'Crear Usuario' }
    },
    {
        path: '/seleccionPokemon',
        component: () => import('../views/seleccionPokemonView.vue'),
        meta: { title: 'Seleccionar Pokémon', requiresAuth: true }
    }
]

// el objeto router es el que se va a pasar a la app para que pueda usar las rutas definidas
// usa el método createRouter para crear el router,
//  y le pasamos el array de rutas y el historial de navegación (createWebHistory)

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})


// el método beforeEach se ejecuta antes de cada navegación, y nos permite hacer validaciones antes de cambiar de ruta
// en este caso, vamos a intentar usar el título con el que la página viene definida en el meta de la ruta, y si no tiene título, le ponemos un título por defecto 'Batallas Pokémon'
//  además vamos a validar si el usuario está logueado antes de permitirle acceder a ciertas rutas

router.beforeEach((to) => {
  const authStore = useAuthStore() // Instancia activa de Pinia

  document.title = to.meta.title ? to.meta.title : 'Batallas Pokémon'

  // Si la ruta requiere auth y no está logueado en Pinia
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/'
  }

  // Si ya está logueado y quiere ir al login
  if (to.path === '/' && authStore.isLoggedIn) {
    return '/seleccionPokemon'
  }
})

export default router
