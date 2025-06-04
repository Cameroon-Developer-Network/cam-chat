use axum::{
    extract::{Extension, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::{
    models::{ChatResponse, ChatParticipantResponse, LastMessageResponse},
    AppState,
};

pub async fn get_chats(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
) -> Result<Json<Value>, StatusCode> {
    let chats = fetch_user_chats(&state, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({
        "success": true,
        "data": chats
    })))
}

async fn fetch_user_chats(state: &AppState, user_id: Uuid) -> anyhow::Result<Vec<ChatResponse>> {
    // For demo purposes, let's create some mock chats if none exist
    let existing_chats = sqlx::query!(
        r#"
        SELECT c.id, c.name, c.is_group, c.created_at, c.updated_at,
               COUNT(DISTINCT cp.user_id) as participant_count
        FROM chats c
        JOIN chat_participants cp ON c.id = cp.chat_id
        WHERE cp.user_id = $1
        GROUP BY c.id, c.name, c.is_group, c.created_at, c.updated_at
        ORDER BY c.updated_at DESC
        "#,
        user_id
    )
    .fetch_all(state.db.pool())
    .await?;

    if existing_chats.is_empty() {
        // Create mock chats for demo
        create_mock_chats(state, user_id).await?;
        // Fetch again after creating mock data
        return fetch_user_chats(state, user_id).await;
    }

    let mut chat_responses = Vec::new();

    for chat_row in existing_chats {
        // Get participants
        let participants = sqlx::query!(
            r#"
            SELECT cp.user_id, cp.is_admin, u.name, u.avatar_url, u.is_online
            FROM chat_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.chat_id = $1
            "#,
            chat_row.id
        )
        .fetch_all(state.db.pool())
        .await?;

        let participant_responses: Vec<ChatParticipantResponse> = participants
            .into_iter()
            .map(|p| ChatParticipantResponse {
                user_id: p.user_id,
                name: p.name,
                avatar_url: p.avatar_url,
                is_online: p.is_online,
                is_admin: p.is_admin,
            })
            .collect();

        // Get last message
        let last_message = sqlx::query!(
            r#"
            SELECT m.content, u.name as sender_name, m.created_at
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.chat_id = $1
            ORDER BY m.created_at DESC
            LIMIT 1
            "#,
            chat_row.id
        )
        .fetch_optional(state.db.pool())
        .await?;

        let last_message_response = last_message.map(|lm| LastMessageResponse {
            content: lm.content,
            sender_name: lm.sender_name,
            timestamp: lm.created_at,
        });

        // Get unread count (simplified - just count all messages for demo)
        let unread_count = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM messages WHERE chat_id = $1",
            chat_row.id
        )
        .fetch_one(state.db.pool())
        .await?
        .unwrap_or(0);

        chat_responses.push(ChatResponse {
            id: chat_row.id,
            name: chat_row.name,
            is_group: chat_row.is_group,
            participants: participant_responses,
            last_message: last_message_response,
            unread_count,
            created_at: chat_row.created_at,
            updated_at: chat_row.updated_at,
        });
    }

    Ok(chat_responses)
}

async fn create_mock_chats(state: &AppState, user_id: Uuid) -> anyhow::Result<()> {
    // Create mock users if they don't exist
    let mock_users = vec![
        ("alice@example.com", "Alice Johnson", "1494790108755-2616b612b47c"),
        ("bob@example.com", "Bob Smith", "1507003211169-0a1dd7228f2d"),
        ("sarah@example.com", "Sarah Wilson", "1438761681033-6461ffad8d80"),
    ];

    let mut created_user_ids = Vec::new();

    for (email, name, photo_id) in mock_users {
        let existing_user = sqlx::query_scalar!(
            "SELECT id FROM users WHERE email = $1",
            email
        )
        .fetch_optional(state.db.pool())
        .await?;

        let user_id_to_use = if let Some(existing_id) = existing_user {
            existing_id
        } else {
            let new_user_id = Uuid::new_v4();
            let now = chrono::Utc::now();
            let avatar_url = format!("https://images.unsplash.com/photo-{}?w=150&h=150&fit=crop&crop=face", photo_id);

            sqlx::query!(
                r#"
                INSERT INTO users (id, email, name, avatar_url, password_hash, is_online, last_seen, created_at, updated_at)
                VALUES ($1, $2, $3, $4, 'mock_hash', $5, $6, $7, $8)
                "#,
                new_user_id,
                email,
                name,
                avatar_url,
                rand::random::<bool>(), // Random online status
                now,
                now,
                now
            )
            .execute(state.db.pool())
            .await?;

            new_user_id
        };

        created_user_ids.push(user_id_to_use);
    }

    // Create mock chats
    for other_user_id in created_user_ids {
        let chat_id = Uuid::new_v4();
        let now = chrono::Utc::now();

        // Create chat
        sqlx::query!(
            r#"
            INSERT INTO chats (id, name, is_group, created_by, created_at, updated_at)
            VALUES ($1, NULL, false, $2, $3, $4)
            "#,
            chat_id,
            user_id,
            now,
            now
        )
        .execute(state.db.pool())
        .await?;

        // Add participants
        for participant_id in [user_id, other_user_id] {
            sqlx::query!(
                r#"
                INSERT INTO chat_participants (chat_id, user_id, joined_at, is_admin)
                VALUES ($1, $2, $3, false)
                "#,
                chat_id,
                participant_id,
                now
            )
            .execute(state.db.pool())
            .await?;
        }

        // Add a mock message
        let message_id = Uuid::new_v4();
        let mock_messages = vec![
            "Hey! How are you doing?",
            "Thanks for the help yesterday!",
            "Can you send me the documents?",
        ];
        let message_content = mock_messages[rand::random::<usize>() % mock_messages.len()];

        sqlx::query!(
            r#"
            INSERT INTO messages (id, chat_id, sender_id, content, message_type, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 'text', $5, $6)
            "#,
            message_id,
            chat_id,
            other_user_id,
            message_content,
            now,
            now
        )
        .execute(state.db.pool())
        .await?;
    }

    Ok(())
}