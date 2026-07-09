export default function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-violet-100 bg-white/90 px-4 py-3 text-sm font-medium text-tl-navy shadow-lg backdrop-blur-md"
    >
      {message}
    </div>
  );
}
