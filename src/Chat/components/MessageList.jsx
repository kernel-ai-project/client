import { Loader2 } from "lucide-react";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl border px-5 py-4 text-sm leading-relaxed shadow-sm transition-all duration-200 ${
          isUser
            ? "rounded-br-xl border-transparent bg-[#659EFF]/30 text-black shadow-[0_20px_40px_rgba(101,158,255,0.2)]"
            : "rounded-bl-xl border-[#659EFF]/25 bg-white/85 text-black shadow-[0_14px_32px_rgba(101,158,255,0.12)] backdrop-blur-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function MessageList({ messages, isThinking, listRef }) {
  return (
    <div
      ref={listRef}
      className="flex-1 space-y-5 overflow-y-auto bg-transparent px-4 py-6 text-black md:px-8 md:py-8"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isThinking ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#659EFF]/40 bg-[#FDFDFD] px-4 py-3 text-sm text-black shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#659EFF]" />
          생각 중...
        </div>
      ) : null}
    </div>
  );
}
