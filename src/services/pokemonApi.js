// este método consume la api de pokeapi para obtener la imagen de un pokemon dado su nombre.
// el fetch es nativo de javascript y nos permite hacer peticiones HTTP a un servidor.

export async function obtenerImagenPokemon(nombrePokemon) {
  const respuesta = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${nombrePokemon.toLowerCase()}`
  )

  if (!respuesta.ok) {
     throw new Error("No se pudo encontrar al Pokémon: " + nombrePokemon)
  }

  const datosPokemon = await respuesta.json()
  const imagen =   datosPokemon.sprites.other["official-artwork"].front_default

  return imagen
}