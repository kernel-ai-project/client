export default function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-zinc-800/60 active:scale-95"
    >
      {children}
    </button>
  );
}
