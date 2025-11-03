import { Loader2 } from "lucide-react";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-zinc-800 text-zinc-100"
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
      className="flex-1 space-y-4 overflow-y-auto bg-[#0b0b0e] p-4 md:px-8 md:py-6"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isThinking ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          생각 중...
        </div>
      ) : null}
    </div>
  );
}
