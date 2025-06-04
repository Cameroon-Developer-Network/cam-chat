use anyhow::Result;
use axum::{
    extract::Extension,
    http::Method,
    middleware,
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tokio::sync::broadcast;
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing::{info, Level};
use tracing_subscriber;

mod auth;
mod db;
mod models;
mod routes;
mod ws;

use auth::auth_middleware;
use db::Database;
use ws::ChatMessage;

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub broadcast_tx: broadcast::Sender<ChatMessage>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_target(false)
        .with_max_level(Level::INFO)
        .init();

    // Load environment variables
    dotenvy::dotenv().ok();

    // Initialize database
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:password@localhost/whatsapp_chat".to_string());
    
    let db = Database::new(&database_url).await?;
    
    // Run migrations
    db.migrate().await?;

    // Create broadcast channel for WebSocket messages
    let (broadcast_tx, _rx) = broadcast::channel::<ChatMessage>(1000);

    let app_state = AppState {
        db,
        broadcast_tx,
    };

    // Build our application with routes
    let app = create_app(app_state);

    // Run the server
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    info!("Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn create_app(state: AppState) -> Router {
    Router::new()
        // Public routes
        .route("/api/auth/login", post(routes::auth::login))
        .route("/health", get(health_check))
        
        // Protected routes
        .route("/api/chats", get(routes::chats::get_chats))
        .route("/api/chats/:chat_id/messages", get(routes::messages::get_messages))
        .route("/api/chats/:chat_id/messages", post(routes::messages::send_message))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        
        // WebSocket route (handles auth internally)
        .route("/ws/:chat_id", get(ws::websocket_handler))
        
        // Middleware
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(
                    CorsLayer::new()
                        .allow_origin("http://localhost:3000".parse().unwrap())
                        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
                        .allow_headers(tower_http::cors::Any)
                        .allow_credentials(true),
                )
                .layer(Extension(state))
        )
}

async fn health_check() -> &'static str {
    "OK"
}