import PropTypes from "prop-types";

/**
 * Una de las cuatro respuestas. El color depende de la fase: mientras se
 * "verifica" la elegida parpadea, y al "revelar" se pinta la correcta en verde
 * y la equivocada del jugador en rojo.
 */
const Opcion = ({ opcion, estaSeleccionada, esCorrecta, eliminada, fase, onElegir }) => {
  const revelando = fase === "revelando" || fase === "terminado";
  const verificando = fase === "verificando" && estaSeleccionada;

  let aspecto = "border-white/20 bg-noche-800/70 hover:border-oro-400 hover:bg-noche-700";
  if (verificando) aspecto = "border-oro-400 bg-oro-500/30 animate-latido";
  else if (revelando && esCorrecta) aspecto = "border-acierto bg-acierto/80 text-white";
  else if (revelando && estaSeleccionada) aspecto = "border-fallo bg-fallo/80 text-white";
  else if (estaSeleccionada) aspecto = "border-oro-400 bg-oro-500/20";

  return (
    <button
      type="button"
      disabled={eliminada || fase !== "jugando"}
      onClick={() => onElegir(opcion.id)}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left
                  transition duration-150 disabled:cursor-not-allowed
                  ${eliminada ? "invisible" : aspecto}`}
    >
      <span className="font-bold text-oro-400">{opcion.id}</span>
      <span className="font-medium">{opcion.texto}</span>
    </button>
  );
};

Opcion.propTypes = {
  opcion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    texto: PropTypes.string.isRequired,
  }).isRequired,
  estaSeleccionada: PropTypes.bool.isRequired,
  esCorrecta: PropTypes.bool.isRequired,
  eliminada: PropTypes.bool.isRequired,
  fase: PropTypes.string.isRequired,
  onElegir: PropTypes.func.isRequired,
};

export default Opcion;
