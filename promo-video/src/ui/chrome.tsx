import type { CSSProperties, ReactNode } from 'react';

export function Icon({
  d,
  size = 18,
  color = 'currentColor',
}: {
  d: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const I = {
  search: 'M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z',
  calendar: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
  chat: 'M5 5h14v10H8l-3 3z',
  user: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0',
  bell: 'M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7m4 10a2 2 0 0 0 4 0',
  video: 'M15 9l6-3v12l-6-3M3 7h12v10H3z',
  star: 'M12 3l2.4 6.2L21 10l-4.8 4.1L17.6 21 12 17.6 6.4 21l1.4-6.9L3 10l6.6-.8z',
  wallet: 'M3 7h18v12H3zM16 12h4M3 7l2-3h14l2 3',
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zm-7 9a7 7 0 0 0 14 0M12 19v3',
  cam: 'M4 8h10l4-3v14l-4-3H4z',
  phone: 'M6 4l4 8-4 8M18 4l-4 8 4 8',
  book: 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z',
  clock: 'M12 8v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z',
  send: 'M3 11l18-8-8 18-2-8z',
  spark: 'M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z',
  check: 'M5 12l5 5L20 7',
  map: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z',
  shield: 'M12 3l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V7z',
  chart: 'M4 19V5m0 14h16M8 15v-4m4 4V8m4 11v-7',
  users: 'M16 14a4 4 0 1 0-8 0M4 20a6 6 0 0 1 16 0M18 8a3 3 0 1 0 0-6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2m12 0h2M12 4v2m0 12v2',
};

export type Aim = { at: number; x: number; y: number; click?: boolean };

export function after(p: number, at: number) {
  return p >= at;
}

export function follow(
  p: number,
  keys: Aim[]
): { x: number; y: number; click: boolean; show: boolean } {
  if (!keys.length) return { x: 0, y: 0, click: false, show: false };
  if (p < 0.03) return { x: keys[0].x, y: keys[0].y, click: false, show: false };
  let i = 0;
  for (let k = 0; k < keys.length - 1; k++) {
    if (p >= keys[k].at) i = k;
  }
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const span = Math.max(0.001, b.at - a.at);
  const u = 1 - Math.pow(1 - Math.min(1, Math.max(0, (p - a.at) / span)), 3);
  const x = a.x + (b.x - a.x) * u;
  const y = a.y + (b.y - a.y) * u;
  const hit = keys.some(k => k.click && p >= k.at && p < k.at + 0.08);
  return { x, y, click: hit, show: p > 0.04 && p < 0.96 };
}

export function Pointer({
  x,
  y,
  click,
  show,
}: {
  x: number;
  y: number;
  click: boolean;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <div className={`pointer${click ? ' click' : ''}`} style={{ left: x, top: y }}>
      <span className="burst" />
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          d="M5 3.5 19 14.2l-6.1.3 3.6 7.2-2.6 1.3-3.6-7.2L5 19.5z"
          fill="#fff"
          stroke="#1e1b4b"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M5 3.5 19 14.2l-6.1.3 3.6 7.2-2.6 1.3-3.6-7.2L5 19.5z" fill="#7548F5" opacity="0.2" />
      </svg>
    </div>
  );
}

export function Caption({
  kicker = 'TUTORLINK',
  title,
  sub,
  center,
  top,
  opacity = 1,
}: {
  kicker?: string;
  title: string;
  sub?: string;
  center?: boolean;
  top?: boolean;
  opacity?: number;
}) {
  const slide = (1 - opacity) * 22;
  const cls = `caption${top ? ' top' : center ? ' center' : ''}`;
  const transform = top
    ? `translate(-50%, ${slide}px)`
    : center
      ? `translate(-50%, calc(-50% + ${slide}px))`
      : `translateX(${-slide}px)`;
  return (
    <div className={cls} style={{ opacity, transform }}>
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      {sub ? <p>{sub}</p> : null}
      <div className="rule" />
    </div>
  );
}

export function DeviceSlot({
  children,
  opacity,
  x = 0,
  rotY = -8,
  scale = 1,
  side = 'right',
  laptop,
}: {
  children: ReactNode;
  opacity: number;
  x?: number;
  rotY?: number;
  scale?: number;
  side?: 'right' | 'left' | 'center';
  laptop?: boolean;
}) {
  if (opacity <= 0.01) return null;
  return (
    <div
      className={`device-slot ${side}${laptop ? ' laptop-slot' : ''}`}
      style={{
        opacity,
        transform: `translateY(${laptop ? '-36%' : '-52%'}) translateX(${x}px) rotateY(${rotY}deg) scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}

export function Watermark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="watermark">
      <img src="/images/TutorLinkLogo.png" alt="" />
      <span>TutorLink</span>
    </div>
  );
}

export function StatusBar() {
  return (
    <div className="status">
      <span>9:41</span>
      <div className="dotrow">
        <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="2" height="4" fill="#0f172a"/><rect x="4" y="4" width="2" height="6" fill="#0f172a"/><rect x="8" y="2" width="2" height="8" fill="#0f172a"/><rect x="12" y="0" width="2" height="10" fill="#0f172a"/></svg>
      </div>
    </div>
  );
}

export function TabBar({
  role = 'student',
  active,
}: {
  role?: 'student' | 'tutor';
  active: string;
}) {
  const student = [
    { id: 'Search', src: '/images/search.png', label: 'Search' },
    { id: 'Bookings', src: '/images/booking.png', label: 'Bookings' },
    { id: 'Home', src: '/images/home.png', label: '' },
    { id: 'Messages', src: '/images/search.png', label: 'Messages', chat: true },
    { id: 'Profile', src: '/images/profile.png', label: 'Profile' },
  ];
  const tutor = [
    { id: 'Request', src: '/images/request.png', label: 'Requests' },
    { id: 'Schedule', src: '/images/booking.png', label: 'Schedule' },
    { id: 'Home', src: '/images/home.png', label: '' },
    { id: 'Messages', src: '/images/search.png', label: 'Messages', chat: true },
    { id: 'Profile', src: '/images/profile.png', label: 'Profile' },
  ];
  const items = role === 'tutor' ? tutor : student;
  return (
    <div className="tabbar">
      {items.map(item =>
        item.id === 'Home' ? (
          <div key="home" className="home-fab" style={{ outline: active === 'Home' ? '2px solid rgba(255,255,255,0.4)' : undefined }}>
            <img src="/images/home.png" alt="" />
          </div>
        ) : (
          <div key={item.id} className={`tab${active === item.id ? ' on' : ''}`}>
            {item.chat ? (
              <Icon d={I.chat} size={18} color={active === item.id ? '#7548F5' : '#9CA3AF'} />
            ) : (
              <img src={item.src} alt="" />
            )}
            {item.label}
          </div>
        )
      )}
    </div>
  );
}

export function Phone({
  children,
  style,
  tab,
  role,
  hideTabs,
  pointer,
}: {
  children: ReactNode;
  style?: CSSProperties;
  tab?: string;
  role?: 'student' | 'tutor';
  hideTabs?: boolean;
  pointer?: ReactNode;
}) {
  return (
    <div className="phone" style={style}>
      <div className="bezel">
        <div className="island" />
        <StatusBar />
        <div className={hideTabs ? 'screen full' : 'screen'}>
          <div className="screen-fit">{children}</div>
        </div>
        {hideTabs ? null : <TabBar role={role} active={tab || 'Home'} />}
        {pointer}
      </div>
    </div>
  );
}
