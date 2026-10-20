import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '../index.css' 

// 1. Primero creas la instancia de la aplicación
const app = createApp(App)

// 2. Luego configuras y registras Pinia en la app
app.use(createPinia())

// 3. Registras el router
app.use(router)

// 4. Finalmente montas la app en el DOM
app.mount('#app')