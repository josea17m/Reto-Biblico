import PropTypes from "prop-types";
import { SEGUNDOS_DE_ALARMA } from "../hooks/useJuego";

/** Cuenta atrás de la pregunta. Se detiene mientras un comodín esté abierto. */
const Temporizador = ({ segundos, total, enPausa }) => {
  const proporcion = Math.max(0, Math.min(1, segundos / total));
  const enAlarma = segundos <= SEGUNDOS_DE_ALARMA && !enPausa;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-10 text-right text-lg font-bold tabular-nums ${
          enAlarma ? "animate-latido text-fallo" : "text-slate-200"
        }`}
        role="timer"
        aria-live="off"
        aria-label={`Quedan ${segundos} segundos`}
      >
        {segundos}
      </span>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={segundos}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Tiempo restante"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
            enAlarma ? "bg-fallo" : "bg-oro-500"
          }`}
          style={{ width: `${proporcion * 100}%` }}
        />
      </div>
      {enPausa && <span className="text-xs uppercase text-slate-400">en pausa</span>}
    </div>
  );
};

Temporizador.propTypes = {
  segundos: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  enPausa: PropTypes.bool.isRequired,
};

export default Temporizador;
