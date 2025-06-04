use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::{
    models::{GetMessagesQuery, MessageResponse, MessageSenderResponse, SendMessageRequest, MessageType},
    ws::ChatMessage,
    AppState,
};

pub async fn get_messages(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(chat_id): Path<Uuid>,
    Query(params): Query<GetMessagesQuery>,
) -> Result<Json<Value>, StatusCode> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(50);
    let offset = (page - 1) * limit;

    // Verify user is part of the chat
    let is_participant = sqlx::query_scalar!(
        "SELECT EXISTS(SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2)",
        chat_id,
        user_id
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(false);

    if !is_participant {
        return Err(StatusCode::FORBIDDEN);
    }

    let messages = sqlx::query!(
        r#"
        SELECT m.id, m.chat_id, m.sender_id, m.content, m.message_type as "message_type: MessageType", 
               m.reply_to, m.created_at, u.name as sender_name, u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
        "#,
        chat_id,
        limit as i64,
        offset as i64
    )
    .fetch_all(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let message_responses: Vec<MessageResponse> = messages
        .into_iter()
        .map(|m| MessageResponse {
            id: m.id,
            chat_id: m.chat_id,
            sender: MessageSenderResponse {
                id: m.sender_id,
                name: m.sender_name,
                avatar_url: m.sender_avatar,
            },
            content: m.content,
            message_type: m.message_type,
            reply_to: m.reply_to,
            created_at: m.created_at,
        })
        .collect();

    Ok(Json(json!({
        "success": true,
        "data": {
            "messages": message_responses,
            "page": page,
            "limit": limit,
            "total": message_responses.len()
        }
    })))
}

pub async fn send_message(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(chat_id): Path<Uuid>,
    Json(payload): Json<SendMessageRequest>,
) -> Result<Json<Value>, StatusCode> {
    // Verify user is part of the chat
    let is_participant = sqlx::query_scalar!(
        "SELECT EXISTS(SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2)",
        chat_id,
        user_id
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(false);

    if !is_participant {
        return Err(StatusCode::FORBIDDEN);
    }

    let message_id = Uuid::new_v4();
    let now = chrono::Utc::now();
    let message_type = payload.message_type.unwrap_or(MessageType::Text);

    // Insert message into database
    let message = sqlx::query!(
        r#"
        INSERT INTO messages (id, chat_id, sender_id, content, message_type, reply_to, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, chat_id, sender_id, content, message_type as "message_type: MessageType", reply_to, created_at
        "#,
        message_id,
        chat_id,
        user_id,
        payload.content,
        message_type as MessageType,
        payload.reply_to,
        now,
        now
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Get sender information
    let sender = sqlx::query!(
        "SELECT name, avatar_url FROM users WHERE id = $1",
        user_id
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Update chat's updated_at timestamp
    sqlx::query!(
        "UPDATE chats SET updated_at = $1 WHERE id = $2",
        now,
        chat_id
    )
    .execute(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let message_response = MessageResponse {
        id: message.id,
        chat_id: message.chat_id,
        sender: MessageSenderResponse {
            id: message.sender_id,
            name: sender.name,
            avatar_url: sender.avatar_url,
        },
        content: message.content,
        message_type: message.message_type,
        reply_to: message.reply_to,
        created_at: message.created_at,
    };

    // Broadcast message to WebSocket clients
    let chat_message = ChatMessage {
        message: message_response.clone(),
        chat_id,
    };

    if let Err(e) = state.broadcast_tx.send(chat_message) {
        tracing::warn!("Failed to broadcast message: {}", e);
    }

    Ok(Json(json!({
        "success": true,
        "data": message_response
    })))
}