// este service simula el ranking de usuarios usando localStorage.
// a diferencia de usuariosApi.js (que consume Mockachino), acá no usamos una API externa
// porque Mockachino no persiste los POST de verdad, y el ranking necesita guardar
// los puntos reales de cada usuario.
//
// el ranking guarda, por usuario, sus PUNTOS ACUMULADOS: cada victoria suma 1 punto,
// para siempre. No hay tope máximo y no se resetea al perder, así siempre se puede
// ver claramente quién tiene más puntos (y el ranking crece con cada batalla ganada).

const CLAVE_RANKING = "ranking"

// datos mockeados de ejemplo, para que la vista no arranque vacía
// mientras no exista todavía la pantalla de batalla que genere resultados reales.
// usamos los usuarios REALES de Mockachino (juan, ash, misty) para que cualquiera
// de ellos pueda loguearse y seguir sumando puntos sobre esta base.
const RANKING_MOCKEADO = [
  { usuario: "Juan", puntos: 5, fecha: "2026-10-10" },
  { usuario: "Ash", puntos: 8, fecha: "2026-10-12" },
  { usuario: "Misty", puntos: 3, fecha: "2026-10-15" }
]

function ordenarPorPuntaje(registroA, registroB) {
  return registroB.puntos - registroA.puntos
}

// obtiene el ranking guardado, ordenado de mayor a menor puntaje.
// si todavía no existe nada en localStorage, lo inicializa con los datos mockeados.
export function obtenerRanking() {
  const rankingGuardado = localStorage.getItem(CLAVE_RANKING)

  if (!rankingGuardado) {
    localStorage.setItem(CLAVE_RANKING, JSON.stringify(RANKING_MOCKEADO))
    return [...RANKING_MOCKEADO].sort(ordenarPorPuntaje)
  }

  // normalizamos por si quedó algún registro viejo (del modelo anterior con
  // puntajeMaximo) o corrupto, para que nunca se rompa ni se vea "vacío"
  const ranking = JSON.parse(rankingGuardado).map((registro) => ({
    ...registro,
    puntos: Number.isFinite(registro.puntos) ? registro.puntos : 0
  }))
  return ranking.sort(ordenarPorPuntaje)
}

// suma 1 punto al usuario por ganar una batalla. Si el usuario no tiene
// registro previo, lo crea arrancando en 1 punto. Los puntos nunca bajan
// ni se resetean: se acumulan para siempre, batalla ganada tras batalla ganada.
export function sumarPunto(usuario) {
  const rankingGuardado = localStorage.getItem(CLAVE_RANKING)
  const ranking = rankingGuardado ? JSON.parse(rankingGuardado) : [...RANKING_MOCKEADO]

  const fechaActual = new Date().toISOString().slice(0, 10)
  const registroExistente = ranking.find(
    (registro) => registro.usuario === usuario
  )

  if (!registroExistente) {
    ranking.push({
      usuario: usuario,
      puntos: 1,
      fecha: fechaActual
    })
  } else {
    // si puntos no es un número válido (registro viejo o corrupto), arrancamos de 0
    const puntosActuales = Number.isFinite(registroExistente.puntos)
      ? registroExistente.puntos
      : 0
    registroExistente.puntos = puntosActuales + 1
    registroExistente.fecha = fechaActual
  }

  localStorage.setItem(CLAVE_RANKING, JSON.stringify(ranking))
}

