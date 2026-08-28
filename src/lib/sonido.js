/**
 * Efectos de sonido sintetizados con la Web Audio API.
 *
 * No hay archivos de audio en el repositorio: cada efecto es un puñado de
 * osciladores, así que el juego no carga ni un kilobyte extra. El contexto se
 * crea de forma perezosa, en el primer gesto del jugador, porque los
 * navegadores no permiten arrancar audio sin interacción previa.
 */
const CLAVE_SILENCIO = "reto-biblico:silencio";

let contexto = null;
let silenciado = leerPreferencia();

function leerPreferencia() {
  try {
    return window.localStorage.getItem(CLAVE_SILENCIO) === "true";
  } catch {
    return false;
  }
}

function guardarPreferencia(valor) {
  try {
    window.localStorage.setItem(CLAVE_SILENCIO, String(valor));
  } catch {
    /* sin almacenamiento la preferencia dura lo que la pestaña */
  }
}

export function estaSilenciado() {
  return silenciado;
}

export function alternarSilencio() {
  silenciado = !silenciado;
  guardarPreferencia(silenciado);
  return silenciado;
}

function obtenerContexto() {
  try {
    const Constructor = window.AudioContext ?? window.webkitAudioContext;
    if (!Constructor) return null;
    if (!contexto) contexto = new Constructor();
    if (contexto.state === "suspended") contexto.resume();
    return contexto;
  } catch {
    return null;
  }
}

/**
 * Una nota: `desde` y `duracion` van en segundos desde el instante actual.
 * Si se indica `hasta`, la frecuencia se desliza hasta ese valor.
 */
function nota(audio, { frecuencia, hasta, desde = 0, duracion = 0.15, tipo = "sine", volumen = 0.2 }) {
  const inicio = audio.currentTime + desde;
  const oscilador = audio.createOscillator();
  const ganancia = audio.createGain();

  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frecuencia, inicio);
  if (hasta) oscilador.frequency.exponentialRampToValueAtTime(hasta, inicio + duracion);

  // Ataque corto y caída exponencial: evita el chasquido de cortar en seco.
  ganancia.gain.setValueAtTime(0.0001, inicio);
  ganancia.gain.exponentialRampToValueAtTime(volumen, inicio + 0.01);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);

  oscilador.connect(ganancia).connect(audio.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + duracion + 0.02);
}

const DO = 261.63;
const MI = 329.63;
const SOL = 392.0;
const DO_ALTO = 523.25;
const MI_ALTO = 659.25;
const SOL_ALTO = 783.99;

const EFECTOS = {
  /** El jugador bloquea su respuesta. */
  elegir: (audio) => nota(audio, { frecuencia: 440, duracion: 0.12, tipo: "square", volumen: 0.12 }),

  /** Cada segundo de la cuenta atrás final. */
  tic: (audio) => nota(audio, { frecuencia: 1200, duracion: 0.05, tipo: "square", volumen: 0.08 }),

  /** Se gasta un comodín. */
  comodin: (audio) => {
    nota(audio, { frecuencia: SOL, duracion: 0.1, tipo: "triangle", volumen: 0.15 });
    nota(audio, { frecuencia: DO_ALTO, desde: 0.09, duracion: 0.14, tipo: "triangle", volumen: 0.15 });
  },

  /** Respuesta correcta: arpegio mayor ascendente. */
  acierto: (audio) => {
    [DO_ALTO, MI_ALTO, SOL_ALTO].forEach((frecuencia, i) =>
      nota(audio, { frecuencia, desde: i * 0.09, duracion: 0.22, tipo: "triangle", volumen: 0.18 })
    );
  },

  /** Respuesta incorrecta: caída grave. */
  fallo: (audio) =>
    nota(audio, { frecuencia: 220, hasta: 70, duracion: 0.6, tipo: "sawtooth", volumen: 0.14 }),

  /** Se agota el tiempo. */
  tiempo: (audio) => {
    [660, 550, 440].forEach((frecuencia, i) =>
      nota(audio, { frecuencia, desde: i * 0.12, duracion: 0.16, tipo: "square", volumen: 0.14 })
    );
  },

  /** Fin de partida sin premio mayor. */
  derrota: (audio) =>
    nota(audio, { frecuencia: 160, hasta: 60, duracion: 1.1, tipo: "sine", volumen: 0.16 }),

  /** El millón de talentos. */
  victoria: (audio) => {
    const fanfarria = [DO, MI, SOL, DO_ALTO, SOL, DO_ALTO, MI_ALTO];
    fanfarria.forEach((frecuencia, i) =>
      nota(audio, {
        frecuencia,
        desde: i * 0.13,
        duracion: i === fanfarria.length - 1 ? 0.9 : 0.2,
        tipo: "triangle",
        volumen: 0.18,
      })
    );
  },

  /** Retiro voluntario: dos notas tranquilas. */
  retiro: (audio) => {
    nota(audio, { frecuencia: SOL, duracion: 0.2, tipo: "sine", volumen: 0.16 });
    nota(audio, { frecuencia: DO_ALTO, desde: 0.18, duracion: 0.45, tipo: "sine", volumen: 0.16 });
  },
};

/** Reproduce un efecto por su nombre. No hace nada si el audio no está disponible. */
export function reproducir(efecto) {
  if (silenciado) return;
  const construir = EFECTOS[efecto];
  if (!construir) return;
  const audio = obtenerContexto();
  if (!audio) return;
  try {
    construir(audio);
  } catch {
    /* un efecto que falla nunca debe tumbar la partida */
  }
}
