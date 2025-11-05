import { Mic, Send, Image as ImageIcon } from "lucide-react";
import IconButton from "./IconButton";

export default function Composer({
  input,
  setInput,
  onSend,
  onKeyDown,
  isThinking,
}) {
  return (
    <div className="border-t border-[#659EFF]/15 bg-white/60 px-3 pb-6 pt-4 backdrop-blur-sm md:px-8 md:pb-8">
      <div className="mx-auto w-full md:max-w-3xl">
        <div className="rounded-3xl border border-[#659EFF]/25 bg-[#FDFDFD] p-3 shadow-[0_18px_40px_rgba(101,158,255,0.12)] transition-all duration-200 focus-within:border-[#659EFF]/60 focus-within:shadow-[0_22px_60px_rgba(101,158,255,0.18)]">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="무엇이든 물어보세요"
              className="flex-1 max-h-40 resize-none rounded-2xl bg-transparent px-3 py-3 text-sm text-black placeholder:text-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#659EFF]/40"
            />
            <div className="flex items-center gap-2 px-1 pb-1">
              <button
                type="button"
                onClick={onSend}
                disabled={!input.trim() || isThinking}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#659EFF] px-4 text-sm font-semibold text-black shadow-[0_14px_24px_rgba(101,158,255,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(101,158,255,0.22)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-[0_14px_24px_rgba(101,158,255,0.18)]"
              >
                <Send className="h-4 w-4 text-black" /> 보내기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
