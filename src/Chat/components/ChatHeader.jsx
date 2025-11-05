import { Plus, Sun, Moon, MoreVertical } from "lucide-react";

export default function ChatHeader({ title }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800/60 px-3 backdrop-blur supports-[backdrop-filter]:bg-black/20">
      <div className="flex items-center gap-2">
        <div className="font-medium text-sm text-zinc-100 md:text-base">
          {title ?? "Chat"}
        </div>
      </div>
    </header>
  );
}
