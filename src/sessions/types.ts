export interface MessageEntry {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface SessionRecord {
  session_id: string;
  created_at: string;
  expires_at: string;
  messages: MessageEntry[];
}
