import { Plus, Sun, Moon, MoreVertical } from "lucide-react";
import IconButton from "./IconButton";

export default function ChatHeader({
  title,
  theme,
  onToggleTheme,
  onNewChat,
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800/60 px-3 backdrop-blur supports-[backdrop-filter]:bg-black/20">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <IconButton title="새 채팅" onClick={onNewChat}>
            <Plus className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="font-medium text-sm text-zinc-100 md:text-base">
          {title ?? "Chat"}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconButton title="테마 전환" onClick={onToggleTheme}>
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
  );
}
