import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Chat/components/Sidebar";
import ChatHeader from "./Chat/components/ChatHeader";
import MessageList from "./Chat/components/MessageList";
import Composer from "./Chat/components/Composer";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./ChatUI.css";

// --- Types ---------------------------------------------------------------
const ROLES = { user: "user", assistant: "assistant", system: "system" };

// 메시지 객체 생성
function createMessage(role, content) {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}

// 채팅방 리스트 응답을 내부 포맷으로 정규화
function normalizeChatRooms(apiRooms = []) {
  return apiRooms.map((room) => ({
    id: String(room.chatRoomId),
    title: room.title ?? "새 대화",
    createdAt: Date.now(),
    isFavorited: Boolean(room.isFavorited),
    messages: [],
  }));
}

export default function ChatUI() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const listRef = useRef(null);
  const sendLockRef = useRef(false);
  const activeIdRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const routeActiveId = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // 현재 선택된 채팅방 계산
  const activeConv = useMemo(
    () => conversations.find((conv) => conv.id === activeId),
    [conversations, activeId]
  );

  // 초기 채팅방 목록 로드
  const loadChatRooms = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8080/api/chatRooms", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("채팅방 목록 로딩 실패");
      const rooms = await res.json();
      const normalized = normalizeChatRooms(rooms);
      const normalizedMap = new Map(normalized.map((conv) => [conv.id, conv]));

      let resolvedActiveId = null;
      setConversations((prev) => {
        const prevMap = new Map(prev.map((conv) => [conv.id, conv]));
        const merged = normalized.map((conv) => {
          const existing = prevMap.get(conv.id);
          if (!existing) return conv;
          return {
            ...conv,
            messages: existing.messages,
            isTemp: existing.isTemp ?? false,
          };
        });

        const extras = prev.filter((conv) => !normalizedMap.has(conv.id));
        const nextList = [...merged, ...extras];

        resolvedActiveId =
          nextList.find((conv) => conv.id === routeActiveId)?.id ??
          (nextList.some((conv) => conv.id === activeIdRef.current)
            ? activeIdRef.current
            : null) ??
          nextList[0]?.id ??
          null;

        return nextList;
      });

      setActiveId((current) =>
        resolvedActiveId !== null ? resolvedActiveId : current
      );
    } catch (error) {
      console.log(error);
      setConversations((prev) => {
        if (prev.length) return prev;
        return normalizeChatRooms([]);
      });
      setActiveId((prevId) => prevId ?? null);
    }
  }, [routeActiveId]);

  useEffect(() => {
    if (routeActiveId && routeActiveId !== activeId) {
      setActiveId(routeActiveId);
    }
  }, [routeActiveId, activeId]);

  // 채팅방 메시지 로드
  const loadConversationMessages = useCallback(async (chatRoomId) => {
    const res = await fetch(
      `http://localhost:8080/api/chatRooms/${chatRoomId}/messages`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("채팅방 불러오기 실패");
    const data = await res.json();
    return {
      id: String(data.chatRoomId),
      title: data.title ?? "새 대화",
      createdAt: Date.now(),
      messages: mapMessages(data.messages),
    };
  }, []);

  // 채팅방 생성 또는 교체
  const upsertConversation = useCallback((next) => {
    setConversations((prev) => {
      const exists = prev.some((conv) => conv.id === next.id);
      return exists
        ? prev.map((conv) => (conv.id === next.id ? next : conv))
        : [...prev, next];
    });
  }, []);

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
  }, []);

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
  }, []);

  // 채팅방 선택
  const onSelectChat = useCallback(
    async (chatRoomId) => {
      try {
        const mapped = await loadConversationMessages(chatRoomId);
        upsertConversation(mapped);
        setActiveId(mapped.id);
        navigate(`/chat/${chatRoomId}`);
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
    [loadConversationMessages, navigate, upsertConversation]
  );

  const onEditChatName = useCallback(() => {
    // 수정 로직 작성하기
  });

  // 채팅방 삭제
  const onDeleteChat = useCallback((id) => {
    setConversations((prev) => {
      const remaining = prev.filter((conv) => conv.id !== id);
      const nextList = remaining.length
        ? remaining
        : [createConversation("새 대화")];
      setActiveId(nextList[0].id);
      return nextList;
    });
  }, []);

  // 초기 렌더 시 채팅방 목록 불러오기
  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  // 메시지 추가 시 스크롤 유지
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [activeConv?.messages.length, isThinking]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const lastLoadedConversationRef = useRef(null);

  useEffect(() => {
    if (!activeId || !activeConv || activeConv.isTemp) return;

    if (
      activeConv.messages.length > 0 &&
      lastLoadedConversationRef.current === activeId
    ) {
      return;
    }

    let cancelled = false;
    lastLoadedConversationRef.current = activeId;

    (async () => {
      try {
        const fresh = await loadConversationMessages(activeId);
        if (cancelled) return;
        setConversations((prev) => {
          const exists = prev.some((conv) => conv.id === fresh.id);
          if (!exists) return [...prev, { ...fresh, isTemp: false }];
          return prev.map((conv) => {
            if (conv.id !== fresh.id) return conv;
            const mergedMessages =
              conv.messages.length >= fresh.messages.length
                ? conv.messages
                : fresh.messages;
            return {
              ...conv,
              ...fresh,
              messages: mergedMessages,
              isTemp: false,
            };
          });
        });
      } catch (error) {
        console.error(error);
        if (lastLoadedConversationRef.current === activeId) {
          lastLoadedConversationRef.current = null;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeId, activeConv, loadConversationMessages]);

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

  function createConversation(
    title = "새 대화",
    { id = crypto.randomUUID(), messages = [], isTemp = false } = {}
  ) {
    return { id, title, createdAt: Date.now(), messages, isTemp };
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function mapMessages(apiMessages = []) {
    return apiMessages.map((m) => ({
      id: String(m.messageId),
      role: m.isUser ? ROLES.user : ROLES.assistant,
      content: m.message ?? "",
      createdAt: new Date(m.created_time).getTime(),
      userId: m.userId ?? null,
    }));
  }

  return (
    <div className="relative flex h-screen w-full bg-white text-[#202124]">
      <button
        type="button"
        aria-label="사이드바 토글"
        aria-expanded={isSidebarOpen}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="absolute left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full  bg-E8EAED text-[#5F6368] transition-colors duration-200 hover:bg-[white] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A73E8]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div
        className={`relative z-40 flex-shrink-0 overflow-hidden transition-[width] duration-300 ${
          isSidebarOpen
            ? "w-64 md:w-72 lg:w-77 pointer-events-auto"
            : "w-20 pointer-events-none"
        }`}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          onEditChatName={onEditChatName}
          onCreateNewChat={() => {
            setActiveId(null);
          }}
          collapsed={!isSidebarOpen}
        />
      </div>

      <div className="z-10 flex flex-1 flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <section className="flex flex-1 flex-col rounded-2xl transition-shadow duration-300 md:overflow-hidden ">
                <div
                  ref={listRef}
                  className="flex flex-1 items-center justify-center overflow-auto p-6 text-center md:p-12"
                >
                  <div className="mx-auto w-full max-w-3xl  bg-[DADCE0] px-8 py-8 text-lg font-medium text-[#202124] ">
                    <div className="mb-6 text-2xl mask-radial-from-neutral-900 text-[#0b6cea]">
                      안녕하세요 진용님! 무엇이 궁금하신가요?
                    </div>
                    <MainChat
                      input={input}
                      setInput={setInput}
                      onSend={onSend}
                      onKeyDown={onKeyDown}
                      isThinking={isThinking}
                    />
                  </div>
                </div>
              </section>
            }
          />
          <Route
            path="/chat/:chatRoomId"
            element={
              <section className="flex flex-1 flex-col rounded-2xl  transition-shadow duration-300 md:overflow-hidden md:hover:shadow-[0_24px_60px_rgba(60,64,67,0.18)]">
                <ChatHeader title={activeConv?.title} />
                <MessageList
                  messages={activeConv?.messages ?? []}
                  isThinking={isThinking}
                  listRef={listRef}
                />
                <Composer
                  input={input}
                  setInput={setInput}
                  onSend={onSend}
                  onKeyDown={onKeyDown}
                  isThinking={isThinking}
                />
              </section>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function MainChat({ input, setInput, onSend, onKeyDown, isThinking }) {
  return (
    <Composer
      input={input}
      setInput={setInput}
      onSend={onSend}
      onKeyDown={onKeyDown}
      isThinking={isThinking}
    />
  );
}
