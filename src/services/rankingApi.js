// este service simula el ranking de usuarios usando localStorage.
// a diferencia de usuariosApi.js (que consume Mockachino), acá no usamos una API externa
// porque Mockachino no persiste los POST de verdad, y el ranking necesita guardar
// el mejor puntaje real de cada usuario.
//
// el ranking NO guarda cada partida suelta: guarda, por usuario, su PUNTAJE MÁXIMO histórico
// (cantidad de victorias logradas en una misma sesión de batallas, con tope de 3
// porque hay 4 pokemones en total = 3 rivales posibles para enfrentar).

const CLAVE_RANKING = "ranking"

// datos mockeados de ejemplo, para que la vista no arranque vacía
// mientras no exista todavía la pantalla de batalla que genere resultados reales
const RANKING_MOCKEADO = [
  { usuario: "Juan", puntajeMaximo: 2, fecha: "2026-10-10" },
  { usuario: "Maria", puntajeMaximo: 3, fecha: "2026-10-12" },
  { usuario: "Pedro", puntajeMaximo: 1, fecha: "2026-10-15" }
]

function ordenarPorPuntaje(registroA, registroB) {
  return registroB.puntajeMaximo - registroA.puntajeMaximo
}

// obtiene el ranking guardado, ordenado de mayor a menor puntaje.
// si todavía no existe nada en localStorage, lo inicializa con los datos mockeados.
export function obtenerRanking() {
  const rankingGuardado = localStorage.getItem(CLAVE_RANKING)

  if (!rankingGuardado) {
    localStorage.setItem(CLAVE_RANKING, JSON.stringify(RANKING_MOCKEADO))
    return [...RANKING_MOCKEADO].sort(ordenarPorPuntaje)
  }

  const ranking = JSON.parse(rankingGuardado)
  return ranking.sort(ordenarPorPuntaje)
}

// registra el resultado de una sesión de batallas para un usuario.
// si el usuario no tiene registro previo, lo crea.
// si ya tiene uno, solo lo actualiza cuando el nuevo puntaje es MAYOR al guardado
// (si jugó peor que su mejor marca, esa marca anterior se conserva).
export function registrarResultado(usuario, puntajeSesion) {
  const rankingGuardado = localStorage.getItem(CLAVE_RANKING)
  const ranking = rankingGuardado ? JSON.parse(rankingGuardado) : [...RANKING_MOCKEADO]

  const fechaActual = new Date().toISOString().slice(0, 10)
  const registroExistente = ranking.find(
    (registro) => registro.usuario === usuario
  )

  if (!registroExistente) {
    ranking.push({
      usuario: usuario,
      puntajeMaximo: puntajeSesion,
      fecha: fechaActual
    })
  } else if (puntajeSesion > registroExistente.puntajeMaximo) {
    registroExistente.puntajeMaximo = puntajeSesion
    registroExistente.fecha = fechaActual
  }

  localStorage.setItem(CLAVE_RANKING, JSON.stringify(ranking))
}

