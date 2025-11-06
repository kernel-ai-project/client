export default function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#DADCE0] bg-white text-[#5F6368] transition-colors duration-200 hover:bg-[#E8EAED] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A73E8]"
    >
      {children}
    </button>
  );
}
