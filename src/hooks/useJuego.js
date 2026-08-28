import { useCallback, useEffect, useReducer } from "react";
import { preguntasPorDificultad } from "../data/preguntas";
import {
  ESCALERA,
  TOTAL_NIVELES,
  premioAsegurado,
  premioPorRetiro,
} from "../data/escalera";
import { barajar, enteroEntre, tomarAlAzar } from "../lib/aleatorio";
import { reproducir } from "../lib/sonido";

const LETRAS = ["A", "B", "C", "D"];
const PREGUNTAS_POR_DIFICULTAD = TOTAL_NIVELES / 3;

/** Milisegundos de suspenso antes de revelar, y de revelado antes de avanzar. */
const ESPERA_VERIFICANDO = 1400;
const ESPERA_REVELANDO = 2300;

/** Tiempo para responder, más generoso cuanto más difícil es la pregunta. */
export const SEGUNDOS_POR_DIFICULTAD = { facil: 30, media: 45, dificil: 60 };

/** Segundos finales en los que la cuenta atrás suena y se pinta en rojo. */
export const SEGUNDOS_DE_ALARMA = 5;

/**
 * Baraja las opciones de una pregunta del banco y las etiqueta A-D, de modo
 * que la posicion de la respuesta correcta cambie en cada partida.
 */
function prepararPregunta(pregunta) {
  const barajadas = barajar(
    pregunta.opciones.map((texto, indice) => ({
      texto,
      esCorrecta: indice === pregunta.correcta,
    }))
  );

  return {
    id: pregunta.id,
    dificultad: pregunta.dificultad,
    enunciado: pregunta.enunciado,
    referencia: pregunta.referencia,
    opciones: barajadas.map((opcion, indice) => ({
      id: LETRAS[indice],
      texto: opcion.texto,
    })),
    correcta: LETRAS[barajadas.findIndex((opcion) => opcion.esCorrecta)],
  };
}

/** Arma las 15 preguntas de una partida: cinco de cada dificultad, en orden. */
function prepararPartida() {
  return ["facil", "media", "dificil"]
    .flatMap((dificultad) =>
      tomarAlAzar(preguntasPorDificultad(dificultad), PREGUNTAS_POR_DIFICULTAD)
    )
    .map(prepararPregunta);
}

const segundosDe = (pregunta) => SEGUNDOS_POR_DIFICULTAD[pregunta.dificultad];

function estadoInicial() {
  const preguntas = prepararPartida();
  return {
    preguntas,
    nivel: 0,
    fase: "jugando",
    seleccionada: null,
    eliminadas: [],
    comodines: { mitad: true, publico: true, llamada: true },
    ayuda: null,
    resultado: null,
    agotado: false,
    segundos: segundosDe(preguntas[0]),
    segundosTotales: segundosDe(preguntas[0]),
  };
}

function reducer(estado, accion) {
  switch (accion.tipo) {
    case "responder":
      if (estado.fase !== "jugando") return estado;
      return { ...estado, fase: "verificando", seleccionada: accion.opcion, ayuda: null };

    case "tic": {
      if (estado.fase !== "jugando") return estado;
      // Al llegar a cero se salta el suspenso: la respuesta se revela ya, sin
      // ninguna opción marcada, y el flujo normal la tratará como fallo.
      if (estado.segundos <= 1) {
        return { ...estado, segundos: 0, fase: "revelando", seleccionada: null, agotado: true };
      }
      return { ...estado, segundos: estado.segundos - 1 };
    }

    case "revelar":
      if (estado.fase !== "verificando") return estado;
      return { ...estado, fase: "revelando" };

    case "avanzar": {
      if (estado.fase !== "revelando") return estado;
      const pregunta = estado.preguntas[estado.nivel];
      const acerto = estado.seleccionada === pregunta.correcta;

      if (!acerto) {
        return {
          ...estado,
          fase: "terminado",
          resultado: {
            motivo: estado.agotado ? "tiempo" : "derrota",
            talentos: premioAsegurado(estado.nivel),
            nivelAlcanzado: estado.nivel,
          },
        };
      }

      const siguiente = estado.nivel + 1;
      if (siguiente >= TOTAL_NIVELES) {
        return {
          ...estado,
          fase: "terminado",
          resultado: {
            motivo: "victoria",
            talentos: ESCALERA[TOTAL_NIVELES - 1].talentos,
            nivelAlcanzado: TOTAL_NIVELES,
          },
        };
      }

      return {
        ...estado,
        nivel: siguiente,
        fase: "jugando",
        seleccionada: null,
        eliminadas: [],
        ayuda: null,
        agotado: false,
        segundos: segundosDe(estado.preguntas[siguiente]),
        segundosTotales: segundosDe(estado.preguntas[siguiente]),
      };
    }

    case "usarComodin":
      if (estado.fase !== "jugando" || !estado.comodines[accion.comodin]) return estado;
      return {
        ...estado,
        comodines: { ...estado.comodines, [accion.comodin]: false },
        eliminadas: accion.eliminadas ?? estado.eliminadas,
        ayuda: accion.ayuda ?? null,
      };

    case "cerrarAyuda":
      return { ...estado, ayuda: null };

    case "retirarse":
      if (estado.fase !== "jugando") return estado;
      return {
        ...estado,
        fase: "terminado",
        ayuda: null,
        resultado: {
          motivo: "retiro",
          talentos: premioPorRetiro(estado.nivel),
          nivelAlcanzado: estado.nivel,
        },
      };

    case "reiniciar":
      return estadoInicial();

    default:
      return estado;
  }
}

/** Porcentaje del publico que acierta, segun lo dificil que sea la pregunta. */
const APOYO_DEL_PUBLICO = {
  facil: [58, 78],
  media: [42, 62],
  dificil: [30, 48],
};

/** Probabilidad de que el amigo al telefono acierte. */
const ACIERTO_DEL_AMIGO = { facil: 0.9, media: 0.7, dificil: 0.5 };

function votacionDelPublico(pregunta, eliminadas) {
  const disponibles = pregunta.opciones.filter((o) => !eliminadas.includes(o.id));
  const [minimo, maximo] = APOYO_DEL_PUBLICO[pregunta.dificultad];
  const aciertos = enteroEntre(minimo, maximo);

  const otras = disponibles.filter((o) => o.id !== pregunta.correcta);
  const pesos = otras.map(() => Math.random() + 0.15);
  const sumaPesos = pesos.reduce((total, peso) => total + peso, 0);

  const votos = {};
  let repartido = 0;
  otras.forEach((opcion, indice) => {
    const porcentaje =
      indice === otras.length - 1
        ? 100 - aciertos - repartido
        : Math.round(((100 - aciertos) * pesos[indice]) / sumaPesos);
    votos[opcion.id] = Math.max(0, porcentaje);
    repartido += votos[opcion.id];
  });
  votos[pregunta.correcta] = 100 - Object.values(votos).reduce((t, v) => t + v, 0);

  return disponibles.map((opcion) => ({ id: opcion.id, porcentaje: votos[opcion.id] ?? 0 }));
}

function consejoDelAmigo(pregunta, eliminadas) {
  const disponibles = pregunta.opciones.filter((o) => !eliminadas.includes(o.id));
  const acierta = Math.random() < ACIERTO_DEL_AMIGO[pregunta.dificultad];
  const fallidas = disponibles.filter((o) => o.id !== pregunta.correcta);

  const elegida =
    acierta || fallidas.length === 0
      ? pregunta.correcta
      : fallidas[Math.floor(Math.random() * fallidas.length)].id;

  const seguro = [
    `Esa me la sé de memoria. Es la ${elegida}, sin duda.`,
    `Acabo de mirarla y estoy convencido: la ${elegida}.`,
  ];
  const dudoso = [
    `Uf, no estoy seguro… pero yo me iría por la ${elegida}.`,
    `Creo que es la ${elegida}, aunque no lo apostaría todo.`,
    `Diría que la ${elegida}, pero piénsalo tú también.`,
  ];
  const frases = acierta && pregunta.dificultad === "facil" ? seguro : dudoso;

  return { opcion: elegida, mensaje: frases[Math.floor(Math.random() * frases.length)] };
}

const SONIDO_FINAL = {
  victoria: "victoria",
  retiro: "retiro",
  derrota: "derrota",
  tiempo: "derrota",
};

export function useJuego() {
  const [estado, dispatch] = useReducer(reducer, undefined, estadoInicial);

  const { fase, nivel, ayuda, segundos, seleccionada, agotado, resultado } = estado;
  const pregunta = estado.preguntas[nivel] ?? null;

  // El suspenso: verificar -> revelar -> avanzar, encadenado por temporizadores.
  useEffect(() => {
    if (fase !== "verificando" && fase !== "revelando") return undefined;
    const espera = fase === "verificando" ? ESPERA_VERIFICANDO : ESPERA_REVELANDO;
    const siguiente = fase === "verificando" ? "revelar" : "avanzar";
    const temporizador = setTimeout(() => dispatch({ tipo: siguiente }), espera);
    return () => clearTimeout(temporizador);
  }, [fase, nivel]);

  // La cuenta atrás se detiene mientras haya un comodín abierto en pantalla:
  // leer la votación del público no debería costarle segundos al jugador.
  useEffect(() => {
    if (fase !== "jugando" || ayuda) return undefined;
    const intervalo = setInterval(() => dispatch({ tipo: "tic" }), 1000);
    return () => clearInterval(intervalo);
  }, [fase, ayuda, nivel]);

  useEffect(() => {
    if (fase === "jugando" && !ayuda && segundos > 0 && segundos <= SEGUNDOS_DE_ALARMA) {
      reproducir("tic");
    }
  }, [segundos, fase, ayuda]);

  useEffect(() => {
    if (fase !== "revelando" || !pregunta) return;
    if (agotado) reproducir("tiempo");
    else reproducir(seleccionada === pregunta.correcta ? "acierto" : "fallo");
  }, [fase, agotado, seleccionada, pregunta]);

  useEffect(() => {
    if (fase === "terminado" && resultado) reproducir(SONIDO_FINAL[resultado.motivo]);
  }, [fase, resultado]);

  const responder = useCallback((opcion) => {
    reproducir("elegir");
    dispatch({ tipo: "responder", opcion });
  }, []);

  const retirarse = useCallback(() => dispatch({ tipo: "retirarse" }), []);
  const reiniciar = useCallback(() => dispatch({ tipo: "reiniciar" }), []);
  const cerrarAyuda = useCallback(() => dispatch({ tipo: "cerrarAyuda" }), []);

  const usarComodin = useCallback(
    (comodin) => {
      if (fase !== "jugando" || !estado.comodines[comodin] || !pregunta) return;
      reproducir("comodin");

      if (comodin === "mitad") {
        const incorrectas = pregunta.opciones
          .filter((opcion) => opcion.id !== pregunta.correcta)
          .map((opcion) => opcion.id);
        dispatch({
          tipo: "usarComodin",
          comodin,
          eliminadas: barajar(incorrectas).slice(0, 2),
        });
        return;
      }

      const nuevaAyuda =
        comodin === "publico"
          ? { tipo: "publico", votos: votacionDelPublico(pregunta, estado.eliminadas) }
          : { tipo: "llamada", ...consejoDelAmigo(pregunta, estado.eliminadas) };

      dispatch({ tipo: "usarComodin", comodin, ayuda: nuevaAyuda });
    },
    [estado.comodines, estado.eliminadas, fase, pregunta]
  );

  return {
    ...estado,
    pregunta,
    responder,
    retirarse,
    reiniciar,
    cerrarAyuda,
    usarComodin,
  };
}
