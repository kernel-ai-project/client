import { useCallback } from "react";
import {
  normalizeChatRooms,
  mapMessages,
  createConversation,
} from "../utils/chatUtils";

export function useChatRooms({
  setConversations,
  setActiveId,
  routeActiveId,
  activeIdRef,
  navigate,
  setIsSidebarOpen,
}) {
  // 채팅방 메시지 로드
  const loadConversationMessages = useCallback(async (chatRoomId) => {
    // 서버에서 메세지 가져오기
    const res = await fetch(
      `http://localhost:8080/api/chatRooms/${chatRoomId}/messages`,
      { credentials: "include" }
    );

    if (!res.ok) throw new Error("채팅방 불러오기 실패");

    const data = await res.json();
    // 일관된 형식으로 변환
    return {
      id: String(data.chatRoomId),
      title: data.title ?? "새 대화",
      createdAt: Date.now(),
      messages: mapMessages(data.messages), // 메세지 변환
    };
  }, []);

  // 채팅방 생성 또는 교체
  const upsertConversation = useCallback(
    (next) => {
      setConversations((prev) => {
        // 이미 있는 채팅방인지 확인
        const exists = prev.some((conv) => conv.id === next.id);

        return exists
          ? prev.map((conv) => (conv.id === next.id ? next : conv)) // 교체
          : [...prev, next]; // 추가
      });
    },
    [setConversations]
  );

  // 채팅방 선택
  const onSelectChat = useCallback(
    async (chatRoomId) => {
      try {
        // 서버에서 메세지 불러오기
        const mapped = await loadConversationMessages(chatRoomId);

        // conversations 배열에 추가/업데이트
        upsertConversation(mapped);

        // 활성화
        setActiveId(mapped.id);

        // URL 변경
        navigate(`/chat/${chatRoomId}`);

        // 모바일이면 사이드바 닫기
        if (typeof window !== "undefined") {
          const isMobile = window.matchMedia("(max-width: 1023px)").matches;
          if (isMobile) {
            setIsSidebarOpen(false);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [
      loadConversationMessages,
      navigate,
      upsertConversation,
      setActiveId,
      setIsSidebarOpen,
    ]
  );

  // 초기 채팅방 목록 로드
  const loadChatRooms = useCallback(async () => {
    try {
      // 서버에서 채팅방 목록 불러오기
      const res = await fetch("http://localhost:8080/api/chatRooms", {
        credentials: "include", // 쿠키 포함
      });

      if (!res.ok) throw new Error("채팅방 목록 로딩 실패");

      const rooms = await res.json();

      // 데이터 정규화 (일관된 형식으로 변환)
      const normalized = normalizeChatRooms(rooms);
      const normalizedMap = new Map(normalized.map((conv) => [conv.id, conv]));
      // Map으로 만들어서 빠르게 찾기 위함

      let resolvedActiveId = null;

      // 상태 업데이트 (기존 데이터와 병합)
      setConversations((prev) => {
        // 기존 채팅방들을 Map으로 변환
        const prevMap = new Map(prev.map((conv) => [conv.id, conv]));

        // 서버 데이터를 기준으로, 로컬 메세지는 유지
        const merged = normalized.map((conv) => {
          const existing = prevMap.get(conv.id);
          if (!existing) return conv; // 새 채팅방

          return {
            ...conv, // 서버 데이터 (title, createdAt 등)
            messages: existing.messages, // 로컬 메세지 유지
            isTemp: existing.isTemp ?? false,
          };
        });

        // 로컬에만 있는 채팅방 추가 (임시 채팅방)
        const extras = prev.filter((conv) => !normalizedMap.has(conv.id));
        const nextList = [...merged, ...extras];

        // 활성화할 채팅방 결정
        resolvedActiveId =
          nextList.find((conv) => conv.id === routeActiveId)?.id ?? // URL의 ID
          (nextList.some((conv) => conv.id === activeIdRef.current)
            ? activeIdRef.current // 현재 활성화된 ID
            : null) ??
          nextList[0]?.id ?? // 첫 번째 채팅방
          null;

        return nextList;
      });

      // activeId 업데이트
      setActiveId((current) =>
        resolvedActiveId !== null ? resolvedActiveId : current
      );
    } catch (error) {
      console.log(error);
      // 에러 발생 시 기존 데이터 유지
      setConversations((prev) => {
        if (prev.length) return prev;
        return normalizeChatRooms([]); // 빈 배열이면 초기화
      });
      setActiveId((prevId) => prevId ?? null);
    }
  }, [routeActiveId, activeIdRef, setConversations, setActiveId]);

  const onEditChatName = useCallback(() => {
    // 수정 로직 작성하기
  });

  // 채팅방 삭제
  const onDeleteChat = useCallback(
    (id) => {
      setConversations((prev) => {
        const remaining = prev.filter((conv) => conv.id !== id);
        const nextList = remaining.length
          ? remaining
          : [createConversation("새 대화")];
        setActiveId(nextList[0].id);
        return nextList;
      });
    },
    [setConversations, setActiveId]
  );

  return {
    loadChatRooms,
    loadConversationMessages,
    upsertConversation,
    onSelectChat,
    onEditChatName,
    onDeleteChat,
  };
}
