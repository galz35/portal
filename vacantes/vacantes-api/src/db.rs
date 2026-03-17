use crate::config::AppConfig;

#[derive(Clone, Debug)]
pub struct SqlServerSettings {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub user: String,
    pub password: String,
    pub trust_server_certificate: bool,
}

impl SqlServerSettings {
    pub fn from_config(config: &AppConfig) -> Self {
        Self {
            host: config.database_host.clone(),
            port: config.database_port,
            database: config.database_name.clone(),
            user: config.database_user.clone(),
            password: config.database_password.clone(),
            trust_server_certificate: config.trust_server_certificate,
        }
    }

    pub fn masked_summary(&self) -> String {
        format!(
            "Server={},{};Database={};User Id={};Password=***;",
            self.host, self.port, self.database, self.user
        )
    }

    pub fn should_trust_certificate(&self) -> bool {
        self.trust_server_certificate || matches!(self.host.as_str(), "127.0.0.1" | "localhost")
    }
}
