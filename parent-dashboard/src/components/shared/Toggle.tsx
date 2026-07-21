interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export default function Toggle({
  label,
  description,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-tl-text">{label}</p>
        {description ? (
          <p className="text-xs text-tl-text-muted">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
          checked ? 'bg-tl-primary' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}
