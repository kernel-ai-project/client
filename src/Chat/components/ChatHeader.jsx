import { Plus, Sun, Moon, MoreVertical } from "lucide-react";

export default function ChatHeader({ title }) {
  return (
    <header className="flex items-center justify-between rounded-t-3xl border-b border-[#659EFF]/30 bg-white/75 px-6 py-4 backdrop-blur-sm shadow-[inset_0_-1px_0_rgba(101,158,255,0.15)]">
      <div className="flex items-center gap-2">
        <div className="text-base font-semibold text-black md:text-lg">
          {title ?? "Chat"}
        </div>
      </div>
    </header>
  );
}
