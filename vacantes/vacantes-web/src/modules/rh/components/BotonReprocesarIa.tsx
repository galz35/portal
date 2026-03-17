type Props = {
  disabled?: boolean;
  onClick?: () => void;
  helper?: string;
};

export default function BotonReprocesarIa({ disabled = true, onClick, helper }: Props) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        onClick={() => onClick?.()}
        disabled={disabled}
        style={disabled ? disabledStyle : buttonStyle}
      >
        Reprocesar analisis IA
      </button>
      {helper ? <span style={helperStyle}>{helper}</span> : null}
    </div>
  );
}

const buttonStyle = { border: "none", background: "#111111", color: "#ffffff", borderRadius: 14, padding: "14px 18px", fontWeight: 800, cursor: "pointer" };
const disabledStyle = { ...buttonStyle, background: "#d6d3d1", color: "#57534e", cursor: "not-allowed" };
const helperStyle = { color: "#57534e", fontSize: 13, lineHeight: 1.5 };
