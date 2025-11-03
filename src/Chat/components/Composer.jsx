import { Mic, Send, Paperclip, Image as ImageIcon } from "lucide-react";
import IconButton from "./IconButton";

export default function Composer({
  input,
  setInput,
  onSend,
  onKeyDown,
  isThinking,
}) {
  return (
    <div className="px-3 pb-4 pt-2 md:px-8 md:pb-6">
      <div className="mx-auto w-full md:max-w-3xl">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-2">
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1 px-1 pb-1">
              <IconButton title="파일 첨부">
                <Paperclip className="h-5 w-5 text-zinc-400" />
              </IconButton>
              <IconButton title="이미지 첨부">
                <ImageIcon className="h-5 w-5 text-zinc-400" />
              </IconButton>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="무엇이든 물어보세요"
              className="flex-1 max-h-40 resize-none bg-transparent px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <div className="flex items-center gap-1 px-1 pb-1">
              <IconButton title="음성 입력">
                <Mic className="h-5 w-5 text-zinc-400" />
              </IconButton>
              <button
                type="button"
                onClick={onSend}
                disabled={!input.trim() || isThinking}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                <Send className="h-4 w-4" /> 보내기
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-500">
          Enter 로 전송 • Shift + Enter 로 줄바꿈 • 이 UI는 데모이며 실제 API
          연동은 별도 구현이 필요합니다.
        </p>
      </div>
    </div>
  );
}
