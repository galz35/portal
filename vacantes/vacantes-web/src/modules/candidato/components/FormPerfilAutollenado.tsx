export default function FormPerfilAutollenado() {
  return (
    <form style={formStyle}>
      <h2 style={titleStyle}>Perfil autollenado</h2>
      <p style={textStyle}>
        Componente reservado para cuando el pipeline IA pueda proponer campos editables desde resultados reales del CV.
      </p>
      <label>
        Nombre completo
        <input name="nombre_completo" placeholder="Pendiente de autollenado real" />
      </label>
      <label>
        Correo
        <input name="correo" placeholder="Pendiente de autollenado real" />
      </label>
      <label>
        Telefono
        <input name="telefono" placeholder="Pendiente de autollenado real" />
      </label>
      <label>
        Resumen profesional
        <textarea name="resumen_profesional" placeholder="Pendiente de resumen estructurado real" />
      </label>
      <button type="button">Guardar perfil definitivo</button>
    </form>
  );
}

const formStyle = { display: "grid", gap: 12 };
const titleStyle = { margin: 0, fontSize: 22, fontWeight: 900 };
const textStyle = { margin: 0, color: "#57534e", lineHeight: 1.6 };
