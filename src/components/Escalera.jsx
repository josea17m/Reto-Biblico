import PropTypes from "prop-types";
import { ESCALERA, formatearTalentos } from "../data/escalera";

/**
 * Escalera de premios. `nivelActual` es el indice (0-14) de la pregunta en
 * juego; los niveles ya superados quedan marcados y los seguros llevan estrella.
 */
const Escalera = ({ nivelActual }) => (
  <ol className="panel flex flex-col-reverse gap-1 self-start p-3" aria-label="Escalera de premios">
    {ESCALERA.map((peldano, indice) => {
      const esActual = indice === nivelActual;
      const superado = indice < nivelActual;

      return (
        <li
          key={peldano.nivel}
          aria-current={esActual ? "step" : undefined}
          className={[
            "flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition",
            esActual && "bg-oro-500 font-bold text-noche-900",
            superado && !esActual && "text-acierto",
            !esActual && !superado && (peldano.seguro ? "text-oro-400" : "text-slate-400"),
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="tabular-nums">{peldano.nivel}</span>
          <span className="tabular-nums">
            {formatearTalentos(peldano.talentos)}
            {peldano.seguro && <span aria-label="nivel seguro"> ★</span>}
          </span>
        </li>
      );
    })}
  </ol>
);

Escalera.propTypes = {
  nivelActual: PropTypes.number.isRequired,
};

export default Escalera;
