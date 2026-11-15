import { defineStore } from "pinia";

export const usePokemonStore = defineStore("pokemon", {
  state: () => ({
    pokemones: [],
    pokemonJugador: null,
  }),

  actions: {
    guardarCatalogo(pokemones) {
      this.pokemones = pokemones;
    },

    seleccionarPokemonJugador(pokemon) {
      this.pokemonJugador = pokemon;
    },
  },
});
