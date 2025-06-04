use anyhow::Result;
use sqlx::{postgres::PgPoolOptions, PgPool, Pool, Postgres};
use tracing::info;

pub type DbPool = Pool<Postgres>;

#[derive(Clone)]
pub struct Database {
    pool: DbPool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        info!("Connecting to database: {}", database_url);
        
        let pool = PgPoolOptions::new()
            .max_connections(10)
            .connect(database_url)
            .await?;

        Ok(Self { pool })
    }

    pub async fn migrate(&self) -> Result<()> {
        info!("Running database migrations");
        sqlx::migrate!("./migrations").run(&self.pool).await?;
        Ok(())
    }

    pub fn pool(&self) -> &DbPool {
        &self.pool
    }
}