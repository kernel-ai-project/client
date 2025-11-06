import { Plus, Sun, Moon, MoreVertical } from "lucide-react";

export default function ChatHeader({ title }) {
  return (
    <header className="flex items-center justify-between rounded-t-3xl border-b border-[#DADCE0] bg-white px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="text-base font-semibold text-[#202124] md:text-lg">
          {title ?? "Chat"}
        </div>
      </div>
    </header>
  );
}
