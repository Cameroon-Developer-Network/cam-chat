use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Extension, Path, Query, State,
    },
    http::StatusCode,
    response::Response,
};
use futures_util::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::broadcast;
use tracing::{error, info, warn};
use uuid::Uuid;

use crate::{auth::verify_token, models::MessageResponse, AppState};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub message: MessageResponse,
    pub chat_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct WebSocketQuery {
    pub token: Option<String>,
}

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    Path(chat_id): Path<Uuid>,
    Query(params): Query<WebSocketQuery>,
) -> Result<Response, StatusCode> {
    // Authenticate user from token
    let token = params.token.ok_or(StatusCode::UNAUTHORIZED)?;
    let claims = verify_token(&token).map_err(|_| StatusCode::UNAUTHORIZED)?;
    let user_id = Uuid::parse_str(&claims.sub).map_err(|_| StatusCode::UNAUTHORIZED)?;

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

    // Update user's online status
    let _ = sqlx::query!(
        "UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1",
        user_id
    )
    .execute(state.db.pool())
    .await;

    info!("User {} connected to chat {}", user_id, chat_id);

    Ok(ws.on_upgrade(move |socket| handle_socket(socket, state, chat_id, user_id)))
}

async fn handle_socket(socket: WebSocket, state: AppState, chat_id: Uuid, user_id: Uuid) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.broadcast_tx.subscribe();

    // Send connection confirmation
    let welcome_msg = serde_json::json!({
        "type": "connected",
        "chat_id": chat_id,
        "user_id": user_id
    });

    if sender
        .send(Message::Text(welcome_msg.to_string()))
        .await
        .is_err()
    {
        return;
    }

    // Spawn task to handle incoming messages from the client
    let tx_clone = state.broadcast_tx.clone();
    let state_clone = state.clone();
    let mut send_task = tokio::spawn(async move {
        while let Some(msg) = receiver.next().await {
            match msg {
                Ok(Message::Text(text)) => {
                    if let Err(e) = handle_client_message(&state_clone, &tx_clone, chat_id, user_id, &text).await {
                        error!("Error handling client message: {}", e);
                        break;
                    }
                }
                Ok(Message::Close(_)) => {
                    info!("WebSocket connection closed for user {}", user_id);
                    break;
                }
                Err(e) => {
                    error!("WebSocket error: {}", e);
                    break;
                }
                _ => {}
            }
        }
    });

    // Spawn task to handle broadcast messages
    let mut recv_task = tokio::spawn(async move {
        while let Ok(chat_message) = rx.recv().await {
            // Only send messages for this chat
            if chat_message.chat_id == chat_id {
                let msg = serde_json::json!({
                    "type": "message",
                    "data": chat_message.message
                });

                if sender
                    .send(Message::Text(msg.to_string()))
                    .await
                    .is_err()
                {
                    break;
                }
            }
        }
    });

    // Wait for either task to complete
    tokio::select! {
        _ = (&mut send_task) => {
            recv_task.abort();
        },
        _ = (&mut recv_task) => {
            send_task.abort();
        }
    }

    // Update user's offline status
    let _ = sqlx::query!(
        "UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1",
        user_id
    )
    .execute(state.db.pool())
    .await;

    info!("User {} disconnected from chat {}", user_id, chat_id);
}

async fn handle_client_message(
    state: &AppState,
    broadcast_tx: &broadcast::Sender<ChatMessage>,
    chat_id: Uuid,
    user_id: Uuid,
    text: &str,
) -> anyhow::Result<()> {
    #[derive(Deserialize)]
    struct ClientMessage {
        #[serde(rename = "type")]
        msg_type: String,
        content: Option<String>,
    }

    let client_msg: ClientMessage = serde_json::from_str(text)?;

    match client_msg.msg_type.as_str() {
        "typing" => {
            // Handle typing indicator
            let typing_msg = serde_json::json!({
                "type": "typing",
                "chat_id": chat_id,
                "user_id": user_id,
                "is_typing": true
            });

            // Broadcast typing status (you might want a separate channel for this)
            info!("User {} is typing in chat {}", user_id, chat_id);
        }
        "message" => {
            if let Some(content) = client_msg.content {
                // This would typically go through the REST endpoint
                // For now, we'll just acknowledge receipt
                info!("Received message from user {} in chat {}: {}", user_id, chat_id, content);
            }
        }
        _ => {
            warn!("Unknown message type: {}", client_msg.msg_type);
        }
    }

    Ok(())
}