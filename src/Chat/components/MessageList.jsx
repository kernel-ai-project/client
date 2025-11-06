import { Loader2 } from "lucide-react";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-5 py-4 text-sm leading-relaxed  ${
          isUser ? "rounded-br bg-[#D2E3FC] text-[#202124] " : " text-[#202124]"
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
      className="mx-auto w-full max-w-3xl flex-1 space-y-5 overflow-y-auto bg-white px-4 py-6 text-[#202124] md:px-8 md:py-8"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isThinking ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#DADCE0] bg-[#F8F9FA] px-4 py-3 text-sm text-[#5F6368] shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#1A73E8]" />
          생각 중...
        </div>
      ) : null}
    </div>
  );
}
