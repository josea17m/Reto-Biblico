import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { TOTAL_NIVELES, formatearTalentos } from "../data/escalera";

const MENSAJES = {
  victoria: {
    titulo: "¡Millonario en talentos!",
    versiculo: "«Bien, buen siervo y fiel; sobre poco has sido fiel, sobre mucho te pondré.»",
    cita: "Mateo 25:21",
  },
  retiro: {
    titulo: "Te retiraste a tiempo",
    versiculo: "«El prudente ve el mal y se esconde; mas los simples pasan y reciben el daño.»",
    cita: "Proverbios 22:3",
  },
  derrota: {
    titulo: "Fin del camino",
    versiculo: "«Porque siete veces cae el justo, y vuelve a levantarse.»",
    cita: "Proverbios 24:16",
  },
};

const FinDeJuego = ({ resultado, jugador, respuestaCorrecta, onReiniciar }) => {
  const { titulo, versiculo, cita } = MENSAJES[resultado.motivo];

  return (
    <section className="panel animate-aparecer mx-auto max-w-lg p-8 text-center">
      <h1 className="font-titulo text-3xl text-oro-400">{titulo}</h1>
      <p className="mt-2 text-slate-300">{jugador}</p>

      <p className="mt-6 text-5xl font-bold tabular-nums text-oro-400">
        {formatearTalentos(resultado.talentos)}
      </p>
      <p className="text-sm uppercase tracking-widest text-slate-400">talentos</p>

      <p className="mt-4 text-slate-300">
        Llegaste a la pregunta {Math.min(resultado.nivelAlcanzado + 1, TOTAL_NIVELES)} de{" "}
        {TOTAL_NIVELES}.
      </p>

      {resultado.motivo === "derrota" && respuestaCorrecta && (
        <p className="mt-2 text-slate-300">
          La respuesta correcta era: <strong className="text-acierto">{respuestaCorrecta}</strong>
        </p>
      )}

      <blockquote className="mt-6 border-t border-white/10 pt-6 text-sm italic text-slate-400">
        {versiculo}
        <footer className="mt-1 not-italic text-oro-600">{cita}</footer>
      </blockquote>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" className="boton-primario" onClick={onReiniciar}>
          Jugar otra vez
        </button>
        <Link to="/scoreboard" className="boton-secundario">
          Ver puntajes
        </Link>
        <Link to="/" className="boton-secundario">
          Inicio
        </Link>
      </div>
    </section>
  );
};

FinDeJuego.propTypes = {
  resultado: PropTypes.shape({
    motivo: PropTypes.oneOf(["victoria", "derrota", "retiro"]).isRequired,
    talentos: PropTypes.number.isRequired,
    nivelAlcanzado: PropTypes.number.isRequired,
  }).isRequired,
  jugador: PropTypes.string.isRequired,
  respuestaCorrecta: PropTypes.string,
  onReiniciar: PropTypes.func.isRequired,
};

export default FinDeJuego;
