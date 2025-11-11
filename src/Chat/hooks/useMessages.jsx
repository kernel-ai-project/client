import { useCallback } from "react";
import { createMessage } from "../utils/chatUtils";

export function useMessages({ setConversations }) {
  // 메시지 추가
  const pushMessage = useCallback((conversationId, role, content) => {
    const message = createMessage(role, content);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
            }
          : conversation
      )
    );
    return message;
  }, [setConversations]);

  // 스트리밍 청크 병합
  const appendToMessage = useCallback((conversationId, messageId, chunk) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        return {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId
              ? { ...message, content: message.content + chunk }
              : message
          ),
        };
      })
    );
  }, [setConversations]);
  return { pushMessage, appendToMessage };
}
