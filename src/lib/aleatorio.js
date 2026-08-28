/** Devuelve una copia barajada del arreglo (Fisher-Yates). */
export function barajar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Toma `cantidad` elementos al azar, sin repetir. */
export function tomarAlAzar(arreglo, cantidad) {
  return barajar(arreglo).slice(0, cantidad);
}

/** Entero aleatorio entre min y max, ambos incluidos. */
export function enteroEntre(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
