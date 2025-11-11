import { ROLES, createConversation } from "../utils/chatUtils";

export function useSendMessage({
  input,
  setInput,
  isThinking,
  setIsThinking,
  sendLockRef,
  activeConv,
  location,
  navigate,
  setConversations,
  setActiveId,
  upsertConversation,
  pushMessage,
  appendToMessage,
}) {
  // 메시지 전송
  async function onSend() {
    const trimmed = input.trim();
    if (!trimmed || isThinking || sendLockRef.current) return;

    sendLockRef.current = true;
    try {
      let conversationId = activeConv?.id;
      let shouldRename = false;

      let ensureConversationPromise = Promise.resolve(conversationId ?? null);

      if (location.pathname === "/" || !conversationId) {
        const tempId = crypto.randomUUID();
        const tempConversation = createConversation(
          trimmed.slice(0, 20) || "새 대화",
          {
            id: tempId,
            isTemp: true,
          }
        );
        upsertConversation(tempConversation);
        setActiveId(tempId);
        navigate(`/chat/${tempId}`);
        conversationId = tempId;

        ensureConversationPromise = (async () => {
          const res = await fetch("http://localhost:8080/api/chatRooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: trimmed }),
            credentials: "include",
          });
          if (!res.ok) throw new Error("채팅방 생성 실패");

          const data = await res.json();
          const realId = String(data.chatRoomId);

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === tempId
                ? {
                    ...conv,
                    id: realId,
                    title: data.query ?? conv.title,
                    isTemp: false,
                  }
                : conv
            )
          );
          setActiveId(realId);
          navigate(`/chat/${realId}`);
          return realId;
        })();
      } else if (
        activeConv?.title === "새 대화" ||
        activeConv?.title === "New chat"
      ) {
        shouldRename = true;
      }

      setInput("");
      pushMessage(conversationId, ROLES.user, trimmed);

      const thinkingMessage = pushMessage(conversationId, ROLES.assistant, "");

      if (shouldRename) {
        const title = trimmed.slice(0, 20) || "새 대화";
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, title } : conv
          )
        );
      }

      setIsThinking(true);
      try {
        const resolvedId = (await ensureConversationPromise) ?? conversationId;
        if (!resolvedId) {
          throw new Error("대화방 ID를 확인할 수 없습니다.");
        }
        conversationId = resolvedId;

        for await (const chunk of askStream(conversationId, trimmed)) {
          setIsThinking(false);
          appendToMessage(conversationId, thinkingMessage.id, chunk);
        }
      } catch (error) {
        appendToMessage(
          conversationId,
          thinkingMessage.id,
          "\n(에러) 답변을 불러오지 못했습니다."
        );
        console.error(error);
      } finally {
        setIsThinking(false);
      }
    } finally {
      sendLockRef.current = false;
    }
  }
  // 답변 스트림 요청
  async function* askStream(chatRoomId, question) {
    const response = await fetch(
      `http://localhost:8080/api/chatRooms/${chatRoomId}/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        credentials: "include",
      }
    );
    if (!response.ok || !response.body) {
      throw new Error("스트림을 열지 못했습니다.");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }

  return { onSend, askStream };
}
