export const formatPkr = (amount: number) =>
  `PKR ${amount.toLocaleString('en-PK')}`;

export const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
