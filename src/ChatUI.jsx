import { useEffect, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Chat/components/Sidebar";
import ChatHeader from "./Chat/components/ChatHeader";
import MessageList from "./Chat/components/MessageList";
import Composer from "./Chat/components/Composer";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useChatRooms } from "./Chat/hooks/useChatRooms";
import { useMessages } from "./Chat/hooks/useMessages";
import { useSendMessage } from "./Chat/hooks/useSendMessage";
import "./ChatUI.css";

export default function ChatUI() {
  const navigate = useNavigate();
  const location = useLocation();

  // 채팅방 목록 저장
  const [conversations, setConversations] = useState([]);

  // 현재 활성화된 채팅
  const [activeId, setActiveId] = useState(null);

  // 입력창의 텍스트
  const [input, setInput] = useState("");

  // AI가 응답 중인지 여부
  const [isThinking, setIsThinking] = useState(false);

  // 사이드바 열림/닫힘 상태 (화면 크기에 따라 초기값 다름)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const [greeting, setGreeting] = useState("로딩 중...");

  // 메세지 목록의 DOM 참조 (스크롤 제어용)
  const listRef = useRef(null);

  // 메세지 전송 중복 방지 플래그
  const sendLockRef = useRef(false);

  // 현재 activeId를 항상 최신 값으로 참조 (비동기 작업용)
  const activeIdRef = useRef(null);

  // URL에서 채팅방 ID 추출 (URL 변경 시에만 재계산)
  const routeActiveId = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // 현재 활성화된 채팅방 객체 (conversations나 activeId 변경 시에만 재계산)
  const activeConv = useMemo(
    () => conversations.find((conv) => conv.id === activeId),
    [conversations, activeId]
  );

  // URL과 activeId 동기화
  useEffect(() => {
    if (routeActiveId && routeActiveId !== activeId) {
      setActiveId(routeActiveId); // URL 변경 시 activeId 업데이트
    }
  }, [routeActiveId, activeId]);

  // activeIdRef 최신 값 유지
  useEffect(() => {
    activeIdRef.current = activeId; // activeId 변경 시 ref도 업데이트
  }, [activeId]);

  // 마지막으로 로드한 채팅방 ID (중복 로딩 방지)
  const lastLoadedConversationRef = useRef(null);

  // 메세지 추가 / 수정 함수
  const { pushMessage, appendToMessage } = useMessages({ setConversations });

  // 채팅방 관련 기능
  const {
    loadChatRooms, // 채팅방 목록 불러오기
    loadConversationMessages, // 특정 채팅방 메세지 불러오기
    upsertConversation, // 채팅방 생성/업데이트
    onSelectChat, // 채팅방 선택
    onEditChatName, // 채팅방 이름 수정
    onDeleteChat, // 채팅방 삭제
  } = useChatRooms({
    setConversations,
    setActiveId,
    routeActiveId,
    activeIdRef,
    navigate,
    setIsSidebarOpen,
  });

  // 메세지 전송 로직
  const { onSend } = useSendMessage({
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
  });

  // 초기 렌더 시 채팅방 목록 불러오기
  useEffect(() => {
    loadChatRooms(); // 컴포넌트 마운트 시 한 번 실행
  }, [loadChatRooms]);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (!listRef.current) return;
    // 메세지 추가되거나 AI 응답 중일 대 맨 아래로 스크롤
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [activeConv?.messages.length, isThinking]);

  // 채팅방 메세지 로딩
  useEffect(() => {
    // 조건: activeId가 있고, 임시 채팅방이 아니어야 함.
    if (!activeId || !activeConv || activeConv.isTemp) return;

    // 이미 메세지가 있고, 이미 로드한 채팅방이면 스킵
    if (
      activeConv.messages.length > 0 &&
      lastLoadedConversationRef.current === activeId
    ) {
      return;
    }

    let cancelled = false; // cleanup을 위한 플래그
    lastLoadedConversationRef.current = activeId;

    (async () => {
      try {
        // 서버에서 메세지 불러오기
        const fresh = await loadConversationMessages(activeId);
        if (cancelled) return; // 컴포넌트 언마운트되면 무시

        // conversations 상태 업데이트
        setConversations((prev) => {
          // 새 채팅방이면 추가
          const exists = prev.some((conv) => conv.id === fresh.id);
          if (!exists) return [...prev, { ...fresh, isTemp: false }];

          // 기존 채팅방이면 병합 (로컬 메세지 유지)
          return prev.map((conv) => {
            if (conv.id !== fresh.id) return conv;
            const mergedMessages =
              conv.messages.length >= fresh.messages.length
                ? conv.messages // 로컬 메세지가 더 많으면 로컬 것 사용
                : fresh.messages; // 서버 메세지가 더 많으면 서버 것 사용
            return {
              ...conv, // 기존 데이터 복사
              ...fresh, // 서버 데이터로 덮어쓰기
              messages: mergedMessages, // 메세지는 더 많은 걸로
              isTemp: false, // 임시가 아니라고 표시
            };
          });
        });
      } catch (error) {
        console.error(error);
        // 실패 시 다시 로드 가능하도록 초기화
        if (lastLoadedConversationRef.current === activeId) {
          lastLoadedConversationRef.current = null;
        }
      }
    })();

    // cleanup: 컴포넌트 언마운트 시 비동기 작업 취소
    return () => {
      cancelled = true;
    };
  }, [activeId, activeConv, loadConversationMessages]);

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  async function fetchGreeting() {
    try {
      const response = await fetch("http://localhost:8080/api/greetings", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP 에러! 상태: ${response.status}`);
      }
      const data = await response.json();
      return data.result.data.greeting;
    } catch (error) {
      console.error("에러", error);
      return "안녕하세요!";
    }
  }

  useEffect(() => {
    async function loadGreeting() {
      const data = await fetchGreeting();
      setGreeting(data);
    }

    loadGreeting();
  }, []);

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
                <ChatHeader />
                <div
                  ref={listRef}
                  className="flex flex-1 items-center justify-center overflow-auto p-6 text-center md:p-12"
                >
                  <div className="mx-auto w-full max-w-3xl  bg-[DADCE0] px-8 py-8 text-lg font-medium text-[#202124] ">
                    <div className="mb-6 text-2xl mask-radial-from-neutral-900 text-[#0b6cea]">
                      {greeting}
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
                <ChatHeader />
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
