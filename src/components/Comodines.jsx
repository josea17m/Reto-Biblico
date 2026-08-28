import PropTypes from "prop-types";

const COMODINES = [
  { clave: "mitad", etiqueta: "50:50", descripcion: "Elimina dos respuestas incorrectas" },
  { clave: "publico", etiqueta: "Público", descripcion: "Consulta a la congregación" },
  { clave: "llamada", etiqueta: "Llamada", descripcion: "Llama a un amigo" },
];

const Comodines = ({ disponibles, habilitado, onUsar }) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label="Comodines">
    {COMODINES.map(({ clave, etiqueta, descripcion }) => {
      const activo = disponibles[clave];
      return (
        <button
          key={clave}
          type="button"
          title={activo ? descripcion : "Comodín ya utilizado"}
          aria-label={`${etiqueta}: ${activo ? descripcion : "ya utilizado"}`}
          disabled={!activo || !habilitado}
          onClick={() => onUsar(clave)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition
                      ${
                        activo
                          ? "border-oro-500 text-oro-400 hover:bg-oro-500 hover:text-noche-900"
                          : "border-white/10 text-slate-600 line-through"
                      }
                      disabled:cursor-not-allowed disabled:hover:bg-transparent
                      disabled:hover:text-current`}
        >
          {etiqueta}
        </button>
      );
    })}
  </div>
);

Comodines.propTypes = {
  disponibles: PropTypes.objectOf(PropTypes.bool).isRequired,
  habilitado: PropTypes.bool.isRequired,
  onUsar: PropTypes.func.isRequired,
};

export default Comodines;
