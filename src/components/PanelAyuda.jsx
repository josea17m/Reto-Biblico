import PropTypes from "prop-types";

/** Resultado de un comodín: la votación del público o el consejo del amigo. */
const PanelAyuda = ({ ayuda = null, onCerrar }) => {
  if (!ayuda) return null;

  return (
    <aside className="panel animate-aparecer p-4" aria-live="polite">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-titulo text-lg text-oro-400">
          {ayuda.tipo === "publico" ? "La congregación opina" : "Tu amigo al teléfono"}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg px-2 text-slate-400 hover:text-slate-100"
          aria-label="Cerrar la ayuda"
        >
          ✕
        </button>
      </div>

      {ayuda.tipo === "publico" ? (
        <ul className="flex justify-around gap-3">
          {ayuda.votos.map((voto) => (
            <li key={voto.id} className="flex w-full flex-col items-center gap-1">
              <div className="flex h-28 w-full flex-col justify-end gap-1">
                <span className="text-center text-xs tabular-nums text-slate-300">
                  {voto.porcentaje}%
                </span>
                <div
                  className="w-full rounded-t bg-oro-500 transition-[height] duration-500"
                  style={{ height: `${voto.porcentaje}%` }}
                  role="img"
                  aria-label={`Opción ${voto.id}: ${voto.porcentaje} por ciento`}
                />
              </div>
              <span className="text-sm font-bold text-oro-400">{voto.id}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="italic text-slate-200">«{ayuda.mensaje}»</p>
      )}
    </aside>
  );
};

PanelAyuda.propTypes = {
  ayuda: PropTypes.shape({
    tipo: PropTypes.oneOf(["publico", "llamada"]).isRequired,
    mensaje: PropTypes.string,
    votos: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        porcentaje: PropTypes.number.isRequired,
      })
    ),
  }),
  onCerrar: PropTypes.func.isRequired,
};

export default PanelAyuda;
