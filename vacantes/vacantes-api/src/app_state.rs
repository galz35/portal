use std::time::Duration;

use crate::config::AppConfig;
use crate::db::SqlServerSettings;
use crate::db_pool::{SqlPool, TSqlManager};

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub sql: SqlServerSettings,
    pub pool: SqlPool,
    pub http: reqwest::Client,
}

impl AppState {
    pub async fn new(config: AppConfig) -> Result<Self, String> {
        let sql = SqlServerSettings::from_config(&config);
        let manager = TSqlManager::new(sql.clone());
        let pool = bb8::Pool::builder()
            .max_size(10)
            .build(manager)
            .await
            .map_err(|err| err.to_string())?;
        let http = reqwest::Client::builder()
            .connect_timeout(Duration::from_secs(2))
            .timeout(Duration::from_secs(5))
            .pool_idle_timeout(Duration::from_secs(30))
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Ok(Self {
            config,
            sql,
            pool,
            http,
        })
    }
}
