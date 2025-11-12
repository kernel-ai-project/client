import { Plus, MessageSquare, Trash2, Pencil } from "lucide-react";
import IconButton from "./IconButton";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
  const [editModal, setEditModal] = useState({
    isOpen: false,
    id: null,
    title: "",
  });

  const handleOpenEditModal = (id, title) => {
    setEditModal({ isOpen: true, id, title });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, id: null, title: "" });
  };

  const handleSaveEdit = (newTitle) => {
    if (editModal.id) {
      onEditChatName(editModal.id, newTitle);
    }
  };

  if (collapsed) {
    // 닫힌 상태: 내부 요소 제거 (필요하다면 단일 아이콘 등만 남길 수 있음)
    return (
      <aside className="flex h-full w-full flex-col items-center justify-center bg-[#E8EAED]">
        {/* 예: 아이콘만 보여주고 싶다면 여기에 배치 */}
      </aside>
    );
  }

  return (
    <>
      <aside className="flex h-full w-full flex-col bg-[#E8EAED] p-1 text-[#202124] ">
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
              "group relative flex w-full items-center gap-3 rounded-2xl border border-transparent px-6 py-3 text-left transition-colors duration-200";
            const hoverClasses = isActive ? "" : "hover:bg-[#FDFDFD]";
            const activeClasses = isActive ? "bg-[#D2E3FC] shadow-none" : "";

            return (
              <div
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
                      event.preventDefault();
                      handleOpenEditModal(conversation.id, conversation.title);
                    }}
                  >
                    <Pencil className="h-4 w-4 " />
                  </IconButton>
                  <IconButton
                    title="삭제"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();

                      onDeleteChat(conversation.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 " />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
      <EditModal
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        currentTitle={editModal.title}
        onSave={handleSaveEdit}
      />
    </>
  );
}

// 모달 컴포넌트
function EditModal({ isOpen, onClose, currentTitle, onSave }) {
  const [value, setValue] = useState(currentTitle);

  useEffect(() => {
    setValue(currentTitle);
  }, [currentTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSave(value.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-96 rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-[#202124]">
          채팅방 이름 수정
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#1A73E8] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
            placeholder="채팅방 이름을 입력하세요"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#5F6368] hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#1A73E8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1557B0] transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
