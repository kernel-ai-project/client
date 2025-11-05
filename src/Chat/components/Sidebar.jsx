import { Plus, MessageSquare, Trash2, Pencil } from "lucide-react";
import IconButton from "./IconButton";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  conversations,
  activeId,
  onSelectChat,
  onDeleteChat,
  onEditChatName,
}) {
  let navigate = useNavigate();
  return (
    <aside className="hidden h-full flex-col rounded-3xl border border-[#659EFF]/25 bg-white/85 p-4 text-black shadow-[0_24px_80px_rgba(101,158,255,0.14)] backdrop-blur md:flex md:w-72 lg:w-80">
      <div className="rounded-2xl border border-[#659EFF]/20 bg-[#FDFDFD] p-3 shadow-sm">
        <button
          type="button"
          onClick={() => {
            navigate("/");
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent px-3 text-sm font-medium transition-all duration-200 hover:border-[#659EFF]/60 hover:bg-[#659EFF]/20 hover:shadow-[0_12px_24px_rgba(101,158,255,0.18)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> 새 채팅
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeId;
          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectChat(conversation.id)}
              className={`group relative flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-[#659EFF]/60 hover:bg-[#659EFF]/15 hover:shadow-[0_12px_24px_rgba(101,158,255,0.18)] ${
                isActive
                  ? "border-[#659EFF] bg-[#659EFF]/25 shadow-[0_2px_5px_rgba(101,158,255,0.25)]"
                  : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#659EFF]/30 bg-white/90 text-[#659EFF]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm ${
                    isActive ? "font-semibold" : "font-medium"
                  } text-black`}
                >
                  {conversation.title}
                </div>
                <div className="text-xs text-black/60">
                  {new Date(conversation.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <IconButton
                  title="채팅방 이름 수정"
                  onClick={(event) => {
                    //이름 수정 함수 작성하기
                    event.stopPropagation();
                    onEditChatName(conversation.id);
                  }}
                >
                  <Pencil className="h-4 w-4 text-black" />
                </IconButton>
                <IconButton
                  title="삭제"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteChat(conversation.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-black" />
                </IconButton>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
