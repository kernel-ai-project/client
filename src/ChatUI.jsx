import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Mic,
  Send,
  Paperclip,
  Image as ImageIcon,
  Sun,
  Moon,
  Loader2,
  MessageSquare,
  Trash2,
  MoreVertical,
} from "lucide-react";

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

// --- UI atoms ------------------------------------------------------------
function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-800/60 active:scale-95 transition"
    >
      {children}
    </button>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === ROLES.user;
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-zinc-800 text-zinc-100 rounded-bl-md"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
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

  // derived
  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => saveConversations(conversations), [conversations]);

  useEffect(() => {
    // scroll to bottom on new message
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [activeConv?.messages.length, isThinking]);

  // actions
  function newChat() {
    const next = createConversation("새 대화");
    setConversations((prev) => [next, ...prev]);
    setActiveId(next.id);
  }

  function deleteChat(id) {
    const idx = conversations.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const copy = [...conversations];
    copy.splice(idx, 1);
    const next = copy.length ? copy[0].id : null;
    setConversations(copy.length ? copy : [createConversation("새 대화")]);
    setActiveId(next ?? copy[0]?.id);
  }

  function renameActive(title) {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, title } : c))
    );
  }

  function pushMessage(role, content) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? { ...c, messages: [...c.messages, createMessage(role, content)] }
          : c
      )
    );
  }

  async function onSend() {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    pushMessage(ROLES.user, trimmed);
    setInput("");
    // Rename chat by first user message
    if (activeConv.title === "새 대화" || activeConv.title === "New chat") {
      renameActive(trimmed.slice(0, 28));
    }

    // Simulate assistant streaming
    setIsThinking(true);
    const reply = `
(데모) 질문을 잘 받았어요!

— 현재는 로컬 상태로만 동작하는 UI입니다.
— 실제 LLM 연결 없이도 미리보기에서 동작하도록 가짜 스트리밍으로 답장을 보여줍니다.`;

    await fakeStream(reply, (chunk) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConv.id) return c;
          const msgs = c.messages;
          const last = msgs[msgs.length - 1];
          // if last message is assistant & in-progress, append
          if (last && last.role === ROLES.assistant && last.streaming) {
            const updated = { ...last, content: last.content + chunk };
            return { ...c, messages: [...msgs.slice(0, -1), updated] };
          }
          // else, create a new streaming assistant message
          return {
            ...c,
            messages: [
              ...msgs,
              {
                id: crypto.randomUUID(),
                role: ROLES.assistant,
                content: chunk,
                createdAt: Date.now(),
                streaming: true,
              },
            ],
          };
        })
      );
    });

    // finalize streaming -> remove flag
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConv.id) return c;
        const msgs = c.messages;
        const last = msgs[msgs.length - 1];
        if (last?.streaming) {
          const finalized = { ...last, streaming: false };
          return { ...c, messages: [...msgs.slice(0, -1), finalized] };
        }
        return c;
      })
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
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-72 lg:w-80 flex-col border-r border-zinc-800/60 bg-[#0e0e13]">
        <div className="p-3 flex items-center gap-2 border-b border-zinc-800/60">
          <button
            onClick={newChat}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 h-11 px-3 transition"
          >
            <Plus className="h-4 w-4" /> 새 채팅
          </button>
          <IconButton
            title="테마 전환"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </IconButton>
        </div>

        <div className="p-3">
          <div className="relative">
            <input
              placeholder="채팅 검색"
              className="w-full h-10 rounded-xl bg-zinc-900/70 pl-10 pr-3 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full group text-left px-3 py-2 flex items-center gap-3 hover:bg-zinc-900/60 ${
                c.id === activeId ? "bg-zinc-900/60" : ""
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-zinc-900/80 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{c.title}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                <IconButton
                  title="삭제"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-zinc-400" />
                </IconButton>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-800/60 text-xs text-zinc-500">
          로컬 저장됨 • 데모 UI
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-zinc-800/60 backdrop-blur supports-[backdrop-filter]:bg-black/20 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <IconButton title="새 채팅" onClick={newChat}>
                <Plus className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="font-medium text-sm md:text-base">
              {activeConv?.title ?? "Chat"}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              title="테마 전환"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </IconButton>
            <IconButton title="더보기">
              <MoreVertical className="h-5 w-5" />
            </IconButton>
          </div>
        </header>

        {/* Messages */}
        <main
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 space-y-3 bg-gradient-to-b from-transparent to-black/10"
        >
          {activeConv?.messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}

          {isThinking && (
            <div className="w-full flex justify-start">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" /> 생각 중...
              </div>
            </div>
          )}
        </main>

        {/* Composer */}
        <div className="px-3 pb-4 pt-2 md:px-8 md:pb-6">
          <div className="mx-auto w-full md:max-w-3xl">
            <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-2">
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-1 px-1 pb-1">
                  <IconButton title="파일 첨부">
                    <Paperclip className="h-5 w-5 text-zinc-400" />
                  </IconButton>
                  <IconButton title="이미지 첨부">
                    <ImageIcon className="h-5 w-5 text-zinc-400" />
                  </IconButton>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="무엇이든 물어보세요"
                  className="flex-1 resize-none bg-transparent focus:outline-none text-sm text-zinc-100 placeholder:text-zinc-500 max-h-40 py-2 px-2"
                />
                <div className="flex items-center gap-1 px-1 pb-1">
                  <IconButton title="음성 입력">
                    <Mic className="h-5 w-5 text-zinc-400" />
                  </IconButton>
                  <button
                    onClick={onSend}
                    disabled={!input.trim() || isThinking}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 h-10 px-3 text-sm font-medium transition"
                  >
                    <Send className="h-4 w-4" /> 보내기
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-zinc-500">
              Enter 로 전송 • Shift + Enter 로 줄바꿈 • 이 UI는 데모이며 실제
              API 연동은 별도 구현이 필요합니다.
            </p>
          </div>
        </div>
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
