/**
 * Escalera de premios del juego, del nivel 1 al 15.
 * Los niveles marcados como `seguro` garantizan el premio: si el jugador
 * falla despues de alcanzarlos, se lleva ese monto en lugar de nada.
 */
export const ESCALERA = [
  { nivel: 1, talentos: 100, seguro: false },
  { nivel: 2, talentos: 200, seguro: false },
  { nivel: 3, talentos: 300, seguro: false },
  { nivel: 4, talentos: 500, seguro: false },
  { nivel: 5, talentos: 1000, seguro: true },
  { nivel: 6, talentos: 2000, seguro: false },
  { nivel: 7, talentos: 4000, seguro: false },
  { nivel: 8, talentos: 8000, seguro: false },
  { nivel: 9, talentos: 16000, seguro: false },
  { nivel: 10, talentos: 32000, seguro: true },
  { nivel: 11, talentos: 64000, seguro: false },
  { nivel: 12, talentos: 125000, seguro: false },
  { nivel: 13, talentos: 250000, seguro: false },
  { nivel: 14, talentos: 500000, seguro: false },
  { nivel: 15, talentos: 1000000, seguro: false },
];

export const TOTAL_NIVELES = ESCALERA.length;

/** Dificultad que corresponde a cada indice de nivel (0-14). */
export function dificultadDeNivel(indice) {
  if (indice < 5) return "facil";
  if (indice < 10) return "media";
  return "dificil";
}

/**
 * Premio que se lleva el jugador si falla en `indice`: el ultimo nivel
 * seguro que ya habia superado, o 0 si aun no alcanzaba ninguno.
 */
export function premioAsegurado(indice) {
  let premio = 0;
  for (let i = 0; i < indice && i < ESCALERA.length; i += 1) {
    if (ESCALERA[i].seguro) premio = ESCALERA[i].talentos;
  }
  return premio;
}

/** Premio acumulado si el jugador se retira estando en `indice`. */
export function premioPorRetiro(indice) {
  return indice === 0 ? 0 : ESCALERA[indice - 1].talentos;
}

const formateador = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

export function formatearTalentos(cantidad) {
  return formateador.format(cantidad);
}
