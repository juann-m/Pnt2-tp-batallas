tp-batallas/
├── public/
│   └── imagenes/
│       └── pokemon/
│           ├── charmander.png
│           ├── squirtle.png
│           ├── pikachu.png
│           └── bulbasaur.png
│
├── src/
│   ├── assets/
│   │   └── main.css
│   │
│   ├── components/
│   │   ├── PokemonCard.vue
│   │   ├── BarraVida.vue
│   │   ├── ListaAtaques.vue
│   │   └── RegistroTurnos.vue
│   ├── models/
│   │   └── PokemonBatalla.js (4)
│   ├── data/
│   │   ├── personajes.json   (1)
│   │   └── ataques.json  (2)
│   │
│   ├── logic/
│   │   └── batallaLogic.js   (3)
│   │
│   ├── router/
│   │   └── index.js
│   │
│   ├── stores/
│   │   └── batallaStore.js (5)
│   │
│   ├── views/
│   │   ├── InicioView.vue
│   │   ├── SeleccionPokemonView.vue
│   │   ├── BatallaView.vue
│   │   └── ResultadoView.vue
│   │
│   ├── App.vue
│   └── main.js
│
├── index.html
├── package.json
├── package-lock.json
├── jsconfig.json
└── vite.config.js