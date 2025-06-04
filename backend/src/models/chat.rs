use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Chat {
    pub id: Uuid,
    pub name: Option<String>,
    pub is_group: bool,
    pub created_by: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChatParticipant {
    pub chat_id: Uuid,
    pub user_id: Uuid,
    pub joined_at: DateTime<Utc>,
    pub is_admin: bool,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub id: Uuid,
    pub name: Option<String>,
    pub is_group: bool,
    pub participants: Vec<ChatParticipantResponse>,
    pub last_message: Option<LastMessageResponse>,
    pub unread_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ChatParticipantResponse {
    pub user_id: Uuid,
    pub name: String,
    pub avatar_url: Option<String>,
    pub is_online: bool,
    pub is_admin: bool,
}

#[derive(Debug, Serialize)]
pub struct LastMessageResponse {
    pub content: String,
    pub sender_name: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateChatRequest {
    pub name: Option<String>,
    pub is_group: bool,
    pub participant_ids: Vec<Uuid>,
}