export default function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#659EFF]/30 bg-white/90 text-black transition-all duration-200 hover:bg-[#659EFF]/15 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#659EFF]"
    >
      {children}
    </button>
  );
}
