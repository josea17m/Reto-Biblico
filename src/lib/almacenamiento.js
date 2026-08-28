/**
 * Acceso a `localStorage` y `sessionStorage` tolerante a fallos: en modo
 * privado o con las cookies bloqueadas el navegador lanza excepciones, y en
 * ese caso el juego debe seguir funcionando aunque no recuerde nada.
 */
const CLAVE_JUGADOR = "reto-biblico:jugador";
const CLAVE_PUNTAJES = "reto-biblico:puntajes";
const MAXIMO_PUNTAJES = 20;

function leerJson(almacen, clave, porDefecto) {
  try {
    const crudo = window[almacen].getItem(clave);
    if (!crudo) return porDefecto;
    return JSON.parse(crudo);
  } catch {
    return porDefecto;
  }
}

function escribirJson(almacen, clave, valor) {
  try {
    window[almacen].setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function guardarJugador(nombre) {
  return escribirJson("sessionStorage", CLAVE_JUGADOR, nombre);
}

export function leerJugador() {
  const nombre = leerJson("sessionStorage", CLAVE_JUGADOR, "");
  return typeof nombre === "string" ? nombre : "";
}

export function olvidarJugador() {
  try {
    window.sessionStorage.removeItem(CLAVE_JUGADOR);
  } catch {
    /* sin almacenamiento no hay nada que olvidar */
  }
}

/** Puntajes guardados, de mayor a menor. */
export function leerPuntajes() {
  const puntajes = leerJson("localStorage", CLAVE_PUNTAJES, []);
  if (!Array.isArray(puntajes)) return [];
  return puntajes
    .filter((p) => p && typeof p.nombre === "string" && typeof p.talentos === "number")
    .sort((a, b) => b.talentos - a.talentos);
}

/** Agrega un resultado a la tabla y devuelve la tabla actualizada. */
export function guardarPuntaje(puntaje) {
  const actualizados = [...leerPuntajes(), { ...puntaje, fecha: new Date().toISOString() }]
    .sort((a, b) => b.talentos - a.talentos)
    .slice(0, MAXIMO_PUNTAJES);
  escribirJson("localStorage", CLAVE_PUNTAJES, actualizados);
  return actualizados;
}

export function borrarPuntajes() {
  try {
    window.localStorage.removeItem(CLAVE_PUNTAJES);
  } catch {
    /* nada que borrar */
  }
  return [];
}
