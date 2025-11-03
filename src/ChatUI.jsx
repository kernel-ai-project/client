import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Sidebar from "./Chat/components/Sidebar";
import ChatHeader from "./Chat/components/ChatHeader";
import MessageList from "./Chat/components/MessageList";
import Composer from "./Chat/components/Composer";

import "./ChatUI.css";

// --- Types ---------------------------------------------------------------
const ROLES = { user: "user", assistant: "assistant", system: "system" };

// Message type
function createMessage(role, content) {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}

// Conversation type
function createConversation(title = "New chat") {
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: Date.now(),
    messages: [
      createMessage(
        ROLES.assistant,
        "무엇을 도와드릴까요? 질문을 입력해 보세요."
      ),
    ],
  };
}

// --- LocalStorage helpers ----------------------------------------------
const LS_KEY = "chatui.conversations.v1";
function loadConversations() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [createConversation("첫 번째 대화")];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [createConversation("첫 번째 대화")];
  } catch {
    return [createConversation("첫 번째 대화")];
  }
}
function saveConversations(convs) {
  localStorage.setItem(LS_KEY, JSON.stringify(convs));
}

// --- Main component ------------------------------------------------------
export default function ChatUI() {
  const [theme, setTheme] = useState(() =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(conversations[0]?.id);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const listRef = useRef(null);
  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
useEffect(() => {
  saveConversations(conversations);
}, [conversations]);
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [activeConv?.messages.length, isThinking]);

  // 콜백들은 useCallback으로 안정화(불필요 리렌더 줄이기)
  const onToggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );
  const onSelectChat = useCallback((id) => setActiveId(id), []);
  const onNewChat = useCallback(() => {
    const next = createConversation("새 대화");
    setConversations((prev) => [next, ...prev]);
    setActiveId(next.id);
  }, []);
  const onDeleteChat = useCallback((id) => {
    setConversations((prev) => {
      const copy = prev.filter((c) => c.id !== id);
      const list = copy.length ? copy : [createConversation("새 대화")];
      setActiveId(list[0].id);
      return list;
    });
  }, []);
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

  async function onSend() {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    const currentConversationId = activeConv?.id;
    if (!currentConversationId) return;

    pushMessage(currentConversationId, ROLES.user, trimmed);
    setInput("");
    if (activeConv.title === "새 대화" || activeConv.title === "New chat") {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, title: trimmed.slice(0, 28) } : c
        )
      );
    }
    setIsThinking(true);
    const reply = "(데모) 질문을 잘 받았어요!\n\n— 로컬 UI 데모입니다.";
    const assistantMessage = pushMessage(
      currentConversationId,
      ROLES.assistant,
      ""
    );
    await fakeStream(reply, (chunk) =>
      appendToMessage(currentConversationId, assistantMessage.id, chunk)
    );
    setIsThinking(false);
  }
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="h-screen w-full bg-zinc-100 text-zinc-900 dark:bg-[#0b0b0e] dark:text-zinc-100 flex">
      <Sidebar
        theme={theme}
        onToggleTheme={onToggleTheme}
        conversations={conversations}
        activeId={activeId}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
        onDeleteChat={onDeleteChat}
      />
      <section className="flex-1 flex flex-col">
        <ChatHeader
          title={activeConv?.title}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onNewChat={onNewChat}
        />
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
    </div>
  );
}

// --- Utilities -----------------------------------------------------------
async function fakeStream(text, onChunk) {
  const tokens = text.split(/(\s+)/); // keep spaces for nicer feel
  for (const t of tokens) {
    await sleep(18 + Math.random() * 24);
    onChunk(t);
  }
}
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
