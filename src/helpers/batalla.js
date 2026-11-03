export function porcentajeVida(pokemon) {
  if (!pokemon || pokemon.vidaMaxima === 0) return 0;
  return Math.max(0, (pokemon.vidaActual / pokemon.vidaMaxima) * 100);
}

export function claseBarraVida(pokemon) {
  if (porcentajeVida(pokemon) <= 25) return "vida-baja";
  if (porcentajeVida(pokemon) <= 50) return "vida-media";
  return "vida-alta";
}
