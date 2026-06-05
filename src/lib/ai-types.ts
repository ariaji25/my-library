export type AiChatRole = "user" | "assistant";

export type AiChatMessage = {
  role: AiChatRole;
  content: string;
};

export type AiMentionBook = {
  id: string;
  title: string;
  author: string;
};
