interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up rounded-xl bg-tl-navy px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-tl-surface dark:text-tl-text dark:border dark:border-tl-border">
      {message}
    </div>
  );
}
