import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'


//router es el array de rutas que va a tener la app, cada ruta tiene un path y un componente asociado


const routes =  [
    {path: '/', 
        component: () => import('./views/loginView.vue'),
        meta: { title: 'Login' }
            },
    {
        path: '/seleccionPokemon',
        component: () => import('./views/seleccionPokemonView.vue'),
        meta: { title: 'Seleccionar Pokémon', requiresAuth: true }
    },
   
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
    console.log('Navegando a: ' + to.path)
    if (to.meta.title) {
        document.title = to.meta.title        
    } else {
        document.title = 'Batallas Pokémon'
    }
    const estaLogueado = localStorage.getItem('isLoggedIn') === 'true'
    if (to.meta.requiresAuth && !estaLogueado) {
        return('/')
    }
   
       
    })

createApp(App).use(router).mount("#app")




