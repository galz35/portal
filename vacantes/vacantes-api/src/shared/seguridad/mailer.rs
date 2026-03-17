use crate::config::AppConfig;
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::transport::smtp::client::Tls;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};

pub struct Mailer {
    transport: AsyncSmtpTransport<Tokio1Executor>,
    from: String,
}

impl Mailer {
    pub fn new(config: &AppConfig) -> Result<Self, String> {
        let smtp_host = config.smtp_host.trim();
        let smtp_from = config.smtp_from.trim();
        if smtp_host.is_empty() {
            return Err("SMTP_HOST no configurado".to_string());
        }
        if smtp_from.is_empty() {
            return Err("SMTP_FROM no configurado".to_string());
        }

        let creds = Credentials::new(config.smtp_user.clone(), config.smtp_password.clone());
        let tls_parameters =
            lettre::transport::smtp::client::TlsParameters::new(smtp_host.to_string())
                .map_err(|e| format!("SMTP host invalido: {}", e))?;
        let transport = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(smtp_host)
            .map_err(|e| format!("No se pudo configurar relay SMTP: {}", e))?
            .port(config.smtp_port)
            .credentials(creds)
            .tls(Tls::Required(tls_parameters))
            .build();

        Ok(Self {
            transport,
            from: smtp_from.to_string(),
        })
    }

    pub async fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<(), String> {
        let email = Message::builder()
            .from(
                self.from
                    .parse()
                    .map_err(|e| format!("Invalid from address: {}", e))?,
            )
            .to(to
                .parse()
                .map_err(|e| format!("Invalid to address: {}", e))?)
            .subject(subject)
            .header(ContentType::TEXT_HTML)
            .body(body.to_string())
            .map_err(|e| format!("Failed to build email: {}", e))?;

        let _: lettre::transport::smtp::response::Response = self
            .transport
            .send(email)
            .await
            .map_err(|e| format!("SMTP error: {}", e))?;
        Ok(())
    }
}
