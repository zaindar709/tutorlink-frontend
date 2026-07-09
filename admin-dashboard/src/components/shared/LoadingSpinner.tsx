export default function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-tl-primary" />
    </div>
  );
}
