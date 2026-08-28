import { useCallback, useEffect, useMemo, useReducer } from "react";
import { PREGUNTAS, preguntasPorDificultad } from "../data/preguntas";
import {
  ESCALERA,
  TOTAL_NIVELES,
  premioAsegurado,
  premioPorRetiro,
} from "../data/escalera";
import { barajar, enteroEntre, tomarAlAzar } from "../lib/aleatorio";

const LETRAS = ["A", "B", "C", "D"];
const PREGUNTAS_POR_DIFICULTAD = TOTAL_NIVELES / 3;

/** Milisegundos de suspenso antes de revelar, y de revelado antes de avanzar. */
export const ESPERA_VERIFICANDO = 1400;
export const ESPERA_REVELANDO = 2300;

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
export function prepararPartida() {
  return ["facil", "media", "dificil"]
    .flatMap((dificultad) =>
      tomarAlAzar(preguntasPorDificultad(dificultad), PREGUNTAS_POR_DIFICULTAD)
    )
    .map(prepararPregunta);
}

function estadoInicial() {
  return {
    preguntas: prepararPartida(),
    nivel: 0,
    fase: "jugando",
    seleccionada: null,
    eliminadas: [],
    comodines: { mitad: true, publico: true, llamada: true },
    ayuda: null,
    resultado: null,
  };
}

function reducer(estado, accion) {
  switch (accion.tipo) {
    case "responder":
      if (estado.fase !== "jugando") return estado;
      return { ...estado, fase: "verificando", seleccionada: accion.opcion, ayuda: null };

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
            motivo: "derrota",
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

export function useJuego() {
  const [estado, dispatch] = useReducer(reducer, undefined, estadoInicial);

  const pregunta = estado.preguntas[estado.nivel] ?? null;

  // El suspenso: verificar -> revelar -> avanzar, encadenado por temporizadores.
  useEffect(() => {
    if (estado.fase !== "verificando" && estado.fase !== "revelando") return undefined;
    const espera = estado.fase === "verificando" ? ESPERA_VERIFICANDO : ESPERA_REVELANDO;
    const siguiente = estado.fase === "verificando" ? "revelar" : "avanzar";
    const temporizador = setTimeout(() => dispatch({ tipo: siguiente }), espera);
    return () => clearTimeout(temporizador);
  }, [estado.fase, estado.nivel]);

  const responder = useCallback((opcion) => dispatch({ tipo: "responder", opcion }), []);
  const retirarse = useCallback(() => dispatch({ tipo: "retirarse" }), []);
  const reiniciar = useCallback(() => dispatch({ tipo: "reiniciar" }), []);
  const cerrarAyuda = useCallback(() => dispatch({ tipo: "cerrarAyuda" }), []);

  const usarComodin = useCallback(
    (comodin) => {
      if (estado.fase !== "jugando" || !estado.comodines[comodin] || !pregunta) return;

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

      const ayuda =
        comodin === "publico"
          ? { tipo: "publico", votos: votacionDelPublico(pregunta, estado.eliminadas) }
          : { tipo: "llamada", ...consejoDelAmigo(pregunta, estado.eliminadas) };

      dispatch({ tipo: "usarComodin", comodin, ayuda });
    },
    [estado.comodines, estado.eliminadas, estado.fase, pregunta]
  );

  const totalPreguntas = useMemo(() => PREGUNTAS.length, []);

  return {
    ...estado,
    pregunta,
    totalPreguntas,
    responder,
    retirarse,
    reiniciar,
    cerrarAyuda,
    usarComodin,
  };
}
