import { Plus, MessageSquare, Trash2, Pencil } from "lucide-react";
import IconButton from "./IconButton";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  conversations,
  activeId,
  onSelectChat,
  onDeleteChat,
  onEditChatName,
  onCreateNewChat,
  collapsed = false,
}) {
  let navigate = useNavigate();

  if (collapsed) {
    // 닫힌 상태: 내부 요소 제거 (필요하다면 단일 아이콘 등만 남길 수 있음)
    return (
      <aside className="flex h-full w-full flex-col items-center justify-center bg-[#E8EAED]">
        {/* 예: 아이콘만 보여주고 싶다면 여기에 배치 */}
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col bg-[#E8EAED] p-4 text-[#202124] ">
      <div className="flex justify-end">
        <div className="rounded-2xl  p-3  hover:bg-[#FDFDFD] duration-200 ">
          <button
            type="button"
            onClick={() => {
              onCreateNewChat?.();
              navigate("/");
            }}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent px-3 text-sm font-medium transition-colors "
          >
            <Plus className="h-4 w-4 text-[#1A73E8]" /> 새 채팅
          </button>
        </div>
      </div>
      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeId;
          const baseClasses =
            "group relative flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors duration-200";
          const hoverClasses = isActive ? "" : "hover:bg-[#FDFDFD]";
          const activeClasses = isActive ? "bg-[#D2E3FC] shadow-none" : "";

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectChat(conversation.id)}
              className={`${baseClasses} ${hoverClasses} ${activeClasses}`}
            >
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm ${
                    isActive ? "font-semibold" : "font-medium"
                  } ${isActive ? "text-[#1A73E8]" : "text-[#202124]"}`}
                >
                  {conversation.title}
                </div>
                <div className="text-xs text-[#5F6368]">
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
                  <Pencil className="h-4 w-4 " />
                </IconButton>
                <IconButton
                  title="삭제"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteChat(conversation.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 " />
                </IconButton>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
