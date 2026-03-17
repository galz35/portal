import type { CSSProperties, FormEvent } from "react";
import { useMemo, useState } from "react";

import { registerCandidate } from "../../../shared/api/candidateApi";

function currentReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("returnUrl") ?? "/app/vacantes/perfil";
}

const TRUST_POINTS = [
  "Registro corto para empezar a postularte ya.",
  "Tu CV se sube despues, no te frenamos al inicio.",
  "Luego completas licencia, movilidad, categoria y resumen.",
];

const STEPS = [
  { label: "Paso 1", text: "Crea la cuenta con datos base." },
  { label: "Paso 2", text: "Sube un CV activo." },
  { label: "Paso 3", text: "Completa perfil y postulate." },
];

export default function RegistroCandidatoImpactPage() {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    clave: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () =>
      form.nombres.trim().length >= 2 &&
      form.apellidos.trim().length >= 2 &&
      form.correo.trim().includes("@") &&
      form.clave.trim().length >= 8,
    [form],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    const { response, data } = await registerCandidate({
      correo: form.correo.trim().toLowerCase(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      telefono: form.telefono.trim() || undefined,
      clave: form.clave,
    });

    if (!response.ok || !data.ok) {
      const retryText = data.retryAfterSeconds ? ` Reintenta en ${data.retryAfterSeconds} segundos.` : "";
      setError((data.message ?? "No fue posible crear la cuenta") + retryText);
      setLoading(false);
      return;
    }

    window.location.href = currentReturnUrl();
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={heroStyle} className="fade-in">
          <a href="/" style={backLinkStyle}>
            Volver a vacantes
          </a>

          <div style={brandStyle}>
            <div style={brandIconStyle}>C</div>
            <div style={{ display: "grid", gap: 4 }}>
              <strong style={brandTitleStyle}>Claro Vacantes</strong>
              <span style={brandSubtitleStyle}>Registro simple, perfil progresivo</span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <span style={eyebrowStyle}>Cuenta de candidato</span>
            <h1 style={heroTitleStyle}>Empieza rapido. Lo completo viene despues.</h1>
            <p style={heroTextStyle}>
              Para buscar trabajo no debes pasar por un formulario eterno. Primero crea la cuenta. Despues subes tu
              CV, agregas licencia si aplica, y completas tu perfil con calma.
            </p>
          </div>

          <div style={metricGridStyle}>
            <MetricCard value="1" label="CV activo recomendado" />
            <MetricCard value="3" label="Pasos hasta postular" />
            <MetricCard value="NI" label="Pais por defecto" />
          </div>

          <div style={infoBlockStyle}>
            <strong style={infoTitleStyle}>Lo que este portal valora</strong>
            <div style={{ display: "grid", gap: 10 }}>
              {TRUST_POINTS.map((item) => (
                <TrustRow key={item} text={item} />
              ))}
            </div>
          </div>

          <div style={stepsWrapStyle}>
            {STEPS.map((item) => (
              <article key={item.label} style={stepCardStyle}>
                <span style={stepLabelStyle}>{item.label}</span>
                <strong style={stepTextStyle}>{item.text}</strong>
              </article>
            ))}
          </div>
        </section>

        <section style={formPanelStyle} className="fade-in-delay-1">
          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ ...eyebrowStyle, background: "#0f172a", color: "#ffffff" }}>Crear cuenta</span>
            <h2 style={formTitleStyle}>Solo lo necesario para empezar.</h2>
            <p style={formTextStyle}>
              Ya tienes cuenta?{" "}
              <a href="/login" style={inlineLinkStyle}>
                Inicia sesion
              </a>
            </p>
          </div>

          <form onSubmit={submit} style={formStyle}>
            <div style={fieldGridStyle}>
              <Field
                label="Nombres"
                placeholder="Ej. Maria Jose"
                value={form.nombres}
                onChange={(value) => setForm((current) => ({ ...current, nombres: value }))}
              />
              <Field
                label="Apellidos"
                placeholder="Ej. Lopez Garcia"
                value={form.apellidos}
                onChange={(value) => setForm((current) => ({ ...current, apellidos: value }))}
              />
            </div>

            <Field
              label="Correo electronico"
              type="email"
              placeholder="tu@correo.com"
              value={form.correo}
              onChange={(value) => setForm((current) => ({ ...current, correo: value }))}
            />

            <Field
              label="Telefono"
              placeholder="+505 8888-8888"
              hint="Opcional al registro, pero muy util para que RH te contacte."
              value={form.telefono}
              onChange={(value) => setForm((current) => ({ ...current, telefono: value }))}
            />

            <Field
              label="Contrasena"
              type="password"
              placeholder="Minimo 8 caracteres"
              hint="Despues podras subir CV y completar tu perfil con licencia, ubicacion e interes."
              value={form.clave}
              onChange={(value) => setForm((current) => ({ ...current, clave: value }))}
            />

            {error ? <div style={errorStyle}>{error}</div> : null}

            <button
              type="submit"
              style={{
                ...submitButtonStyle,
                opacity: !canSubmit || loading ? 0.65 : 1,
                cursor: !canSubmit || loading ? "not-allowed" : "pointer",
              }}
              disabled={!canSubmit || loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div style={microNoteStyle}>
            Pais por defecto: <strong>Nicaragua</strong>. El sistema te pedira mas detalle solo cuando de verdad aporta.
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        type={type}
        style={inputStyle}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <span style={hintStyle}>{hint}</span> : null}
    </label>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={metricCardStyle}>
      <strong style={metricValueStyle}>{value}</strong>
      <span style={metricLabelStyle}>{label}</span>
    </div>
  );
}

function TrustRow({ text }: { text: string }) {
  return (
    <div style={trustRowStyle}>
      <span style={trustDotStyle} />
      <span style={trustTextStyle}>{text}</span>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "24px 20px 56px",
  background:
    "radial-gradient(circle at top left, rgba(190, 24, 93, 0.14), transparent 34%), linear-gradient(180deg, #fff7f7 0%, #fff1f2 34%, #ffffff 100%)",
};

const shellStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.15fr) minmax(360px, 0.85fr)",
  gap: 20,
  alignItems: "stretch",
};

const heroStyle: CSSProperties = {
  display: "grid",
  gap: 18,
  padding: 30,
  borderRadius: 32,
  background: "linear-gradient(145deg, #111827 0%, #18181b 55%, #7f1d1d 140%)",
  color: "#ffffff",
  boxShadow: "0 30px 80px -48px rgba(15, 23, 42, 0.85)",
};

const backLinkStyle: CSSProperties = {
  width: "fit-content",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.74)",
  textDecoration: "none",
};

const brandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const brandIconStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 14,
  background: "linear-gradient(135deg, #ef4444 0%, #be123c 100%)",
  display: "grid",
  placeItems: "center",
  fontSize: 20,
  fontWeight: 900,
};

const brandTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
};

const brandSubtitleStyle: CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.68)",
};

const eyebrowStyle: CSSProperties = {
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  background: "rgba(255,255,255,0.1)",
  color: "#ffffff",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(34px, 5vw, 58px)",
  lineHeight: 0.98,
  fontWeight: 900,
  letterSpacing: "-0.05em",
  fontFamily: "\"Space Grotesk\", \"Segoe UI\", sans-serif",
};

const heroTextStyle: CSSProperties = {
  margin: 0,
  maxWidth: 660,
  color: "rgba(255,255,255,0.78)",
  lineHeight: 1.8,
  fontSize: 15,
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 12,
};

const metricCardStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "16px 18px",
  borderRadius: 22,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const metricValueStyle: CSSProperties = {
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 900,
};

const metricLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "rgba(255,255,255,0.72)",
};

const infoBlockStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 18,
  borderRadius: 24,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const infoTitleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
};

const trustRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "start",
};

const trustDotStyle: CSSProperties = {
  width: 10,
  height: 10,
  marginTop: 6,
  borderRadius: 999,
  background: "#fda4af",
  flexShrink: 0,
};

const trustTextStyle: CSSProperties = {
  color: "rgba(255,255,255,0.82)",
  lineHeight: 1.6,
  fontSize: 14,
};

const stepsWrapStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const stepCardStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 18,
  borderRadius: 22,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const stepLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#fda4af",
};

const stepTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: "#ffffff",
};

const formPanelStyle: CSSProperties = {
  display: "grid",
  gap: 18,
  alignContent: "start",
  padding: 28,
  borderRadius: 32,
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  boxShadow: "0 30px 70px -54px rgba(15, 23, 42, 0.55)",
};

const formTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  lineHeight: 1,
  fontWeight: 900,
  color: "#0f172a",
  letterSpacing: "-0.04em",
  fontFamily: "\"Space Grotesk\", \"Segoe UI\", sans-serif",
};

const formTextStyle: CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.7,
};

const inlineLinkStyle: CSSProperties = {
  color: "#be123c",
  fontWeight: 800,
  textDecoration: "none",
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const fieldGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 6,
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#475569",
};

const inputStyle: CSSProperties = {
  minHeight: 50,
  padding: "0 16px",
  borderRadius: 16,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: 15,
  outline: "none",
};

const hintStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: "#64748b",
};

const errorStyle: CSSProperties = {
  padding: "14px 16px",
  borderRadius: 16,
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  color: "#9f1239",
  fontWeight: 700,
  fontSize: 14,
};

const submitButtonStyle: CSSProperties = {
  minHeight: 54,
  border: "none",
  borderRadius: 18,
  background: "linear-gradient(135deg, #e11d48 0%, #991b1b 100%)",
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: "-0.02em",
};

const microNoteStyle: CSSProperties = {
  padding: "14px 16px",
  borderRadius: 18,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  color: "#9a3412",
  lineHeight: 1.6,
  fontSize: 13,
};
