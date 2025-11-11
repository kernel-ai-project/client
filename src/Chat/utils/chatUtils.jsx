export const ROLES = { user: "user", assistant: "assistant", system: "system" };

// 메시지 객체 생성
export function createMessage(role, content) {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}

// 채팅방 리스트 응답을 내부 포맷으로 정규화
export function normalizeChatRooms(apiRooms = []) {
  return apiRooms.map((room) => ({
    id: String(room.chatRoomId),
    title: room.title ?? "새 대화",
    createdAt: Date.now(),
    isFavorited: Boolean(room.isFavorited),
    messages: [],
  }));
}

export function createConversation(
  title = "새 대화",
  { id = crypto.randomUUID(), messages = [], isTemp = false } = {}
) {
  return { id, title, createdAt: Date.now(), messages, isTemp };
}

export function mapMessages(apiMessages = []) {
  return apiMessages.map((m) => ({
    id: String(m.messageId),
    role: m.isUser ? ROLES.user : ROLES.assistant,
    content: m.message ?? "",
    createdAt: new Date(m.created_time).getTime(),
    userId: m.userId ?? null,
  }));
}
