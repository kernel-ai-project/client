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
    <div className=" px-3 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="mx-auto w-full md:max-w-3xl">
        <div className="rounded-3xl border border-[#DADCE0] bg-white p-3 shadow-[0_6px_18px_rgba(60,64,67,0.12)] focus-within:border-[#1A73E8] focus-within:shadow-[0_10px_28px_rgba(26,115,232,0.16)]">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="무엇이든 물어보세요"
              className="flex-1 max-h-40 resize-none rounded-2xl bg-transparent px-3 py-3 text-sm text-[#202124] placeholder:text-[#5F6368] focus:outline-none"
            />
            <div className="flex items-center gap-2 px-1 pb-1">
              <button
                type="button"
                onClick={onSend}
                disabled={!input.trim() || isThinking}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1A73E8] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.2)] transition-colors duration-200 hover:bg-[#1765CC] disabled:cursor-not-allowed disabled:bg-[#AECBFA] disabled:shadow-none"
              >
                <Send className="h-4 w-4 text-white" /> 보내기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
