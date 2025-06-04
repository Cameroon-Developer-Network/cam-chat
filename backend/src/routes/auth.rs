use axum::{extract::State, http::StatusCode, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::{
    auth::{create_token, LoginRequest, LoginResponse},
    models::User,
    AppState,
};

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<Value>, StatusCode> {
    // For demo purposes, we'll create mock users if they don't exist
    let user = get_or_create_mock_user(&state, &payload.email, &payload.password)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // In a real app, you'd verify the password hash
    // For now, we'll accept any password for demo purposes
    
    let token = create_token(user.id).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = LoginResponse {
        token,
        user_id: user.id,
        name: user.name,
        email: user.email,
    };

    Ok(Json(json!({
        "success": true,
        "data": response
    })))
}

async fn get_or_create_mock_user(
    state: &AppState,
    email: &str,
    password: &str,
) -> anyhow::Result<User> {
    // Try to find existing user
    let existing_user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(state.db.pool())
    .await?;

    if let Some(user) = existing_user {
        return Ok(user);
    }

    // Create new mock user
    let password_hash = hash(password, DEFAULT_COST)?;
    let user_id = Uuid::new_v4();
    let now = chrono::Utc::now();

    // Extract name from email (simple approach for demo)
    let name = email.split('@').next().unwrap_or("User").to_string();
    
    // Mock avatar URL based on email
    let avatar_url = Some(format!(
        "https://images.unsplash.com/photo-{}?w=150&h=150&fit=crop&crop=face",
        match email {
            e if e.contains("alice") => "1494790108755-2616b612b47c",
            e if e.contains("bob") => "1507003211169-0a1dd7228f2d",
            e if e.contains("sarah") => "1438761681033-6461ffad8d80",
            _ => "1472099645785-5658abf4ff4e",
        }
    ));

    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (id, email, name, avatar_url, password_hash, is_online, last_seen, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8)
        RETURNING *
        "#
    )
    .bind(user_id)
    .bind(email)
    .bind(name)
    .bind(avatar_url)
    .bind(password_hash)
    .bind(now)
    .bind(now)
    .bind(now)
    .fetch_one(state.db.pool())
    .await?;

    Ok(user)
}