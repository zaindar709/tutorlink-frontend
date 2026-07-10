import { Download } from 'lucide-react';

export default function DocumentPill({
  label,
  url,
}: {
  label: string;
  url?: string;
}) {
  const content = (
    <>
      <Download className="h-3 w-3" />
      {label}
    </>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-tl-primary transition-colors hover:bg-violet-100"
      >
        {content}
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-tl-primary">
      {content}
    </span>
  );
}
