import { Plus, MessageSquare, Trash2, Pencil } from "lucide-react";
import IconButton from "./IconButton";

export default function Sidebar({
  conversations,
  activeId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onEditChatName,
}) {
  return (
    <aside className="hidden flex-col border-r border-zinc-800/60 bg-[#0e0e13] md:flex md:w-72 lg:w-80">
      <div className="flex items-center gap-2 border-b border-zinc-800/60 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-3 text-zinc-200 transition hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" /> 새 채팅
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeId;
          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectChat(conversation.id)}
              className={`group flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-zinc-900/60 ${
                isActive ? "bg-zinc-900/60" : ""
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900/80">
                <MessageSquare className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-zinc-100">
                  {conversation.title}
                </div>
                <div className="text-xs text-zinc-500">
                  {new Date(conversation.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <IconButton
                  title="채팅방 이름 수정"
                  onClick={(event) => {
                    //이름 수정 함수 작성하기
                    event.stopPropagation();
                    onEditChatName(conversation.id);
                  }}
                >
                  <Pencil className="h-4 w-4 text-zinc-400" />
                </IconButton>
                <IconButton
                  title="삭제"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteChat(conversation.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-zinc-400" />
                </IconButton>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-zinc-800/60 p-3 text-xs text-zinc-500">
        로컬 저장됨 • 데모 UI
      </div>
    </aside>
  );
}
