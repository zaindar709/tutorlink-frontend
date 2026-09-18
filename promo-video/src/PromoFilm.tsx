import { type ReactNode } from 'react';
import { Caption, DeviceSlot, Phone, Pointer, after, follow, Watermark } from './ui/chrome';
import TechBg from './ui/TechBg';
import {
  AiProcessUI,
  AiSummaryUI,
  BookingUI,
  ChatUI,
  ClassroomUI,
  ProfileUI,
  RatingUI,
  ScheduleUI,
  SearchUI,
  StudentHome,
  TutorDashUI,
  TutorEarningsUI,
  TutorRequestsUI,
  WalletUI,
} from './ui/screens';
import { AdminDesktop, LaptopFrame, ParentDesktop } from './ui/desktops';
import {
  DURATION,
  MONTAGE_SHOTS,
  SCENES,
  clamp,
  easeInCubic,
  easeOutCubic,
  lerp,
  localT,
  sceneOpacity,
} from './timeline';

function motion(t: number, start: number, end: number, from = 1) {
  const o = sceneOpacity(t, start, end, 0.34);
  const p = localT(t, start, end);
  const enter = easeOutCubic(clamp(p / 0.22));
  const exit = easeInCubic(clamp((p - 0.8) / 0.2));
  const x = lerp(72 * from, 0, enter) + lerp(0, -48 * from, exit);
  const rotY = lerp(10 * from, -3, enter);
  const scale = lerp(0.96, 1, enter) * lerp(1, 0.97, Math.max(0, exit));
  return { o, x, rotY, scale };
}

function PhoneStage({
  t,
  start,
  end,
  from = 1,
  side = 'right',
  scaleExtra = 0.8,
  children,
}: {
  t: number;
  start: number;
  end: number;
  from?: number;
  side?: 'right' | 'left' | 'center';
  scaleExtra?: number;
  children: ReactNode;
}) {
  const { o, x, rotY, scale } = motion(t, start, end, from);
  return (
    <DeviceSlot opacity={o} x={x} rotY={rotY} scale={scale * scaleExtra} side={side}>
      {children}
    </DeviceSlot>
  );
}

function SceneWipe({ t }: { t: number }) {
  let strength = 0;
  let shift = -20;
  for (const s of SCENES) {
    const d = t - s.start;
    if (d >= 0 && d < 0.5) {
      const p = d / 0.5;
      strength = Math.sin(p * Math.PI);
      shift = lerp(-30, 130, easeOutCubic(p));
    }
  }
  if (strength < 0.04) return null;
  return <div className="wipe" style={{ opacity: strength, transform: `translateX(${shift}%)` }} />;
}

export default function PromoFilm({ t }: { t: number }) {
  const showWm = (t > 8 && t < 56.8) || (t >= 62.6 && t < 65.4);
  const neural = t >= 33.3 && t < 40.2;

  return (
    <div className="stage" id="promo-stage">
      <TechBg t={t} neural={neural} />
      <Watermark show={showWm} />
      <SceneWipe t={t} />

      <Intro t={t} />
      <Problem t={t} />
      <Home t={t} />
      <Search t={t} />
      <Profile t={t} />
      <Booking t={t} />
      <Live t={t} />
      <Ai t={t} />
      <Schedule t={t} />
      <Wallet t={t} />
      <Chat t={t} />
      <Tutor t={t} />
      <Parent t={t} />
      <Rating t={t} />
      <Admin t={t} />
      <Tech t={t} />
      <Montage t={t} />
      <Outro t={t} />
    </div>
  );
}

function Intro({ t }: { t: number }) {
  const o = sceneOpacity(t, 0, 5.4, 0.45);
  if (o <= 0) return null;
  const p = localT(t, 0, 5.4);
  const logoO = clamp(p / 0.2);
  const titleO = clamp((p - 0.26) / 0.18);
  const sloganO = clamp((p - 0.52) / 0.2);
  const line2O = clamp((p - 0.74) / 0.14);
  const line3O = clamp((p - 0.86) / 0.12);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, zIndex: 8 }}>
      <div className="intro-stack">
        <img src="/images/TutorLinkLogo.png" alt="TutorLink" style={{ opacity: logoO }} />
        <h1 style={{ opacity: titleO }}>TutorLink</h1>
        <div className="slogan" style={{ opacity: sloganO }}>Learn with Ease</div>
        <div className="line2" style={{ opacity: line2O }}>Learning. Teaching. Connecting.</div>
        <div className="line3" style={{ opacity: line3O }}>Everything you need, in one platform.</div>
      </div>
    </div>
  );
}

function Problem({ t }: { t: number }) {
  const o = sceneOpacity(t, 5.2, 9.6);
  if (o <= 0) return null;
  const items = [
    ['Find tutors', 'The right match is hard to discover'],
    ['Manage lessons', 'Notes and follow-ups scatter'],
    ['Scheduling', 'Times never line up'],
    ['Communication', 'Chats live outside the app'],
    ['Payments', 'Cash and transfers stay messy'],
    ['Progress', 'Parents cannot see growth'],
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, zIndex: 8 }}>
      <div className="caption center" style={{ top: '18%', transform: 'translate(-50%, 0)' }}>
        <span className="kicker">TUTORLINK</span>
        <h2>Finding the right tutor shouldn’t be complicated.</h2>
        <div className="rule" />
      </div>
      <div className="pcards" style={{ position: 'absolute', left: '50%', bottom: 70, transform: 'translateX(-50%)' }}>
        {items.map(([h, p], i) => (
          <div key={h} className="pcard" style={{ opacity: clamp((localT(t, 5.2, 9.6) - i * 0.08) * 3) }}>
            <div className="ico-box">●</div>
            <h4>{h}</h4>
            <p>{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_Y = 542;
const CX = 132;
const TAB = { search: 26, bookings: 78, home: 132, messages: 188, profile: 238, request: 26 };

function Home({ t }: { t: number }) {
  const o = sceneOpacity(t, 9.3, 13.6);
  if (o <= 0) return null;
  const p = localT(t, 9.3, 13.6);
  const joinAt = 0.32;
  const tileAt = 0.58;
  const tabAt = 0.82;
  const ptr = follow(p, [
    { at: 0, x: CX, y: 210 },
    { at: joinAt, x: CX, y: 218, click: true },
    { at: 0.48, x: 68, y: 318 },
    { at: tileAt, x: 68, y: 318, click: true },
    { at: 0.72, x: TAB.search, y: TAB_Y },
    { at: tabAt, x: TAB.search, y: TAB_Y, click: true },
  ]);
  return (
    <>
      <Caption
        title="TutorLink brings it all together."
        sub="Everything you need, in one platform."
        opacity={o}
      />
      <PhoneStage t={t} start={9.3} end={13.6}>
        <Phone tab={after(p, tabAt) ? 'Search' : 'Home'} pointer={<Pointer {...ptr} />}>
          <StudentHome zoomJoin={after(p, joinAt)} tileOn={after(p, tileAt) ? 0 : -1} />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Search({ t }: { t: number }) {
  const o = sceneOpacity(t, 13.3, 18.6);
  if (o <= 0) return null;
  const p = localT(t, 13.3, 18.6);
  const boxAt = 0.22;
  const saraAt = 0.62;
  const bookAt = 0.82;
  const queryPool = 'Physics';
  const typed = after(p, boxAt)
    ? queryPool.slice(0, Math.floor(clamp((p - boxAt) / 0.22) * queryPool.length))
    : '';
  const ptr = follow(p, [
    { at: 0, x: TAB.search, y: TAB_Y },
    { at: 0.12, x: TAB.search, y: TAB_Y, click: true },
    { at: 0.18, x: CX, y: 56 },
    { at: boxAt, x: CX, y: 56, click: true },
    { at: 0.52, x: CX, y: 278 },
    { at: saraAt, x: CX, y: 278, click: true },
    { at: 0.74, x: 222, y: 278 },
    { at: bookAt, x: 222, y: 278, click: true },
  ]);
  return (
    <>
      <Caption title="Find the right tutor for your learning goals." opacity={o} />
      <PhoneStage t={t} start={13.3} end={18.6}>
        <Phone tab="Search" pointer={<Pointer {...ptr} />}>
          <SearchUI query={typed} focused={after(p, boxAt)} selected={after(p, saraAt)} sheet />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Profile({ t }: { t: number }) {
  const o = sceneOpacity(t, 18.3, 23.1);
  if (o <= 0) return null;
  const p = localT(t, 18.3, 23.1);
  const physAt = 0.28;
  const slotAt = 0.52;
  const hireAt = 0.78;
  const ptr = follow(p, [
    { at: 0, x: CX, y: 120 },
    { at: 0.18, x: 108, y: 196 },
    { at: physAt, x: 108, y: 196, click: true },
    { at: 0.42, x: 158, y: 318 },
    { at: slotAt, x: 158, y: 318, click: true },
    { at: 0.68, x: CX, y: 478 },
    { at: hireAt, x: CX, y: 478, click: true },
  ]);
  return (
    <>
      <Caption title="Choose tutors based on skills, experience and availability." opacity={o} />
      <PhoneStage t={t} start={18.3} end={23.1}>
        <Phone tab="Search" pointer={<Pointer {...ptr} />}>
          <ProfileUI
            scrolled={after(p, physAt) ? 28 : 0}
            subjectOn={after(p, physAt) ? 1 : -1}
            slotOn={after(p, slotAt) ? 2 : -1}
            hireOn={after(p, hireAt)}
          />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Booking({ t }: { t: number }) {
  const o = sceneOpacity(t, 22.8, 28.1);
  if (o <= 0) return null;
  const p = localT(t, 22.8, 28.1);
  const dateAt = 0.24;
  const timeAt = 0.46;
  const hireAt = 0.66;
  const confirmAt = 0.84;
  const ptr = follow(p, [
    { at: 0, x: CX, y: 88 },
    { at: 0.16, x: 78, y: 168 },
    { at: dateAt, x: 78, y: 168, click: true },
    { at: 0.38, x: 148, y: 236 },
    { at: timeAt, x: 148, y: 236, click: true },
    { at: 0.58, x: CX, y: 478 },
    { at: hireAt, x: CX, y: 478, click: true },
    { at: 0.76, x: CX, y: 430 },
    { at: confirmAt, x: CX, y: 430, click: true },
  ]);
  return (
    <>
      <Caption title="Book one-on-one learning sessions with ease." opacity={o} />
      <PhoneStage t={t} start={22.8} end={28.1}>
        <Phone tab="Search" pointer={<Pointer {...ptr} />}>
          <BookingUI
            dateOn={after(p, dateAt) ? 1 : 0}
            timeOn={after(p, timeAt) ? 2 : 0}
            confirm={after(p, hireAt)}
            confirmed={after(p, confirmAt)}
          />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Live({ t }: { t: number }) {
  const o = sceneOpacity(t, 27.8, 33.6);
  if (o <= 0) return null;
  const p = localT(t, 27.8, 33.6);
  const micAt = 0.22;
  const camAt = 0.46;
  const endAt = 0.78;
  const ctrlY = 532;
  const ptr = follow(p, [
    { at: 0, x: CX, y: ctrlY },
    { at: 0.14, x: 32, y: ctrlY },
    { at: micAt, x: 32, y: ctrlY, click: true },
    { at: 0.38, x: 84, y: ctrlY },
    { at: camAt, x: 84, y: ctrlY, click: true },
    { at: 0.68, x: 232, y: ctrlY },
    { at: endAt, x: 232, y: ctrlY, click: true },
  ]);
  return (
    <>
      <Caption title="Learn face-to-face with live one-on-one sessions." opacity={o} />
      <PhoneStage t={t} start={27.8} end={33.6}>
        <Phone hideTabs pointer={<Pointer {...ptr} />}>
          <ClassroomUI joined={after(p, micAt)} ended={after(p, endAt)} />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Ai({ t }: { t: number }) {
  const o = sceneOpacity(t, 33.3, 40.2);
  if (o <= 0) return null;
  const p = localT(t, 33.3, 40.2);
  const readyAt = 0.34;
  const openAt = 0.48;
  const ptr = follow(p, [
    { at: 0, x: CX, y: 250 },
    { at: readyAt, x: CX, y: 250, click: true },
    { at: 0.42, x: CX, y: 250 },
    { at: openAt, x: CX, y: 250, click: true },
    { at: 0.7, x: CX, y: 210 },
    { at: 0.82, x: CX, y: 310, click: true },
  ]);
  return (
    <>
      <Caption
        title="AI-powered summaries turn every session into useful learning insights."
        opacity={o}
      />
      <PhoneStage t={t} start={33.3} end={40.2}>
        <Phone tab="Home" pointer={<Pointer {...ptr} />}>
          {after(p, openAt) ? <AiSummaryUI /> : <AiProcessUI ready={after(p, readyAt)} />}
        </Phone>
      </PhoneStage>
    </>
  );
}

function Schedule({ t }: { t: number }) {
  const o = sceneOpacity(t, 39.9, 43.6);
  if (o <= 0) return null;
  const p = localT(t, 39.9, 43.6);
  const dayAt = 0.34;
  const joinAt = 0.68;
  const ptr = follow(p, [
    { at: 0, x: 48, y: 92 },
    { at: 0.16, x: 48, y: 92, click: true },
    { at: 0.26, x: 176, y: 148 },
    { at: dayAt, x: 176, y: 148, click: true },
    { at: 0.56, x: CX, y: 268 },
    { at: joinAt, x: CX, y: 268, click: true },
  ]);
  return (
    <>
      <Caption title="Stay organized with simple scheduling and bookings." opacity={o} />
      <PhoneStage t={t} start={39.9} end={43.6}>
        <Phone tab="Bookings" pointer={<Pointer {...ptr} />}>
          <ScheduleUI dayOn={after(p, dayAt)} joinOn={after(p, joinAt)} />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Wallet({ t }: { t: number }) {
  const o = sceneOpacity(t, 43.3, 47.2);
  if (o <= 0) return null;
  const p = localT(t, 43.3, 47.2);
  const jazzAt = 0.28;
  const easyAt = 0.52;
  const depAt = 0.78;
  const ptr = follow(p, [
    { at: 0, x: CX, y: 120 },
    { at: 0.18, x: 70, y: 228 },
    { at: jazzAt, x: 70, y: 228, click: true },
    { at: 0.42, x: 198, y: 228 },
    { at: easyAt, x: 198, y: 228, click: true },
    { at: 0.68, x: CX, y: 168 },
    { at: depAt, x: CX, y: 168, click: true },
  ]);
  return (
    <>
      <Caption title="Simple and transparent in-app payments." opacity={o} />
      <PhoneStage t={t} start={43.3} end={47.2}>
        <Phone tab="Profile" pointer={<Pointer {...ptr} />}>
          <WalletUI method={after(p, easyAt) ? 'easypaisa' : 'jazzcash'} depositOn={after(p, depAt)} />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Chat({ t }: { t: number }) {
  const o = sceneOpacity(t, 46.9, 51.2);
  if (o <= 0) return null;
  const p = localT(t, 46.9, 51.2);
  const typeAt = 0.22;
  const sendAt = 0.62;
  const msg = 'See you at 4:00.';
  const typed = after(p, typeAt) ? msg.slice(0, Math.floor(clamp((p - typeAt) / 0.28) * msg.length)) : '';
  const ptr = follow(p, [
    { at: 0, x: 90, y: 160 },
    { at: 0.16, x: 110, y: 486 },
    { at: typeAt, x: 110, y: 486, click: true },
    { at: 0.54, x: 228, y: 486 },
    { at: sendAt, x: 228, y: 486, click: true },
  ]);
  return (
    <>
      <Caption title="Stay connected with secure in-app communication." opacity={o} />
      <PhoneStage t={t} start={46.9} end={51.2}>
        <Phone tab="Messages" pointer={<Pointer {...ptr} />}>
          <ChatUI typed={typed} sent={after(p, sendAt)} />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Tutor({ t }: { t: number }) {
  const o = sceneOpacity(t, 50.9, 57.6);
  if (o <= 0) return null;
  const p = localT(t, 50.9, 57.6);
  const reqAt = 0.26;
  const acceptAt = 0.5;
  const earnAt = 0.74;
  const phase = after(p, earnAt) ? 2 : after(p, reqAt) ? 1 : 0;
  const ptr = follow(p, [
    { at: 0, x: CX, y: 130 },
    { at: 0.16, x: TAB.request, y: TAB_Y },
    { at: reqAt, x: TAB.request, y: TAB_Y, click: true },
    { at: 0.4, x: 70, y: 236 },
    { at: acceptAt, x: 70, y: 236, click: true },
    { at: 0.64, x: CX, y: 168 },
    { at: earnAt, x: CX, y: 168, click: true },
  ]);
  return (
    <>
      <Caption
        kicker="FOR TUTORS"
        title={phase === 0 ? 'For students. And for tutors.' : phase === 1 ? 'Manage student requests with ease.' : 'Track your teaching and earnings in one place.'}
        sub={phase === 1 ? 'Incoming request → review → accept' : 'Schedule, sessions and JazzCash withdrawals'}
        opacity={o}
      />
      <PhoneStage t={t} start={50.9} end={57.6} from={-1}>
        <Phone role="tutor" tab={phase === 1 ? 'Request' : 'Home'} pointer={<Pointer {...ptr} />}>
          {phase === 0 ? <TutorDashUI /> : phase === 1 ? <TutorRequestsUI accepted={after(p, acceptAt)} /> : <TutorEarningsUI />}
        </Phone>
      </PhoneStage>
    </>
  );
}

function Parent({ t }: { t: number }) {
  const o = sceneOpacity(t, 57.3, 62.8);
  if (o <= 0) return null;
  const p = localT(t, 57.3, 62.8);
  const { x, rotY, scale } = motion(t, 57.3, 62.8);
  const childAt = 0.28;
  const progAt = 0.52;
  const cardAt = 0.76;
  const ptr = follow(p, [
    { at: 0, x: 86, y: 118 },
    { at: 0.16, x: 86, y: 162 },
    { at: childAt, x: 86, y: 162, click: true },
    { at: 0.42, x: 86, y: 248 },
    { at: progAt, x: 86, y: 248, click: true },
    { at: 0.66, x: 430, y: 132 },
    { at: cardAt, x: 430, y: 132, click: true },
  ]);
  const nav = after(p, progAt) ? 3 : after(p, childAt) ? 1 : 0;
  return (
    <>
      <Caption top title="Parents stay connected with their child’s learning journey." opacity={o} />
      <DeviceSlot opacity={o} x={x} rotY={rotY} scale={scale * 0.7} side="center" laptop>
        <div style={{ position: 'relative' }}>
          <LaptopFrame>
            <ParentDesktop nav={nav} highlight={after(p, cardAt) ? 2 : 0} />
          </LaptopFrame>
          <Pointer {...ptr} />
        </div>
      </DeviceSlot>
    </>
  );
}

function Rating({ t }: { t: number }) {
  const o = sceneOpacity(t, 62.5, 65.8);
  if (o <= 0) return null;
  const p = localT(t, 62.5, 65.8);
  const starY = 268;
  const starX = [64, 98, 132, 166, 200];
  const beats = [0.14, 0.28, 0.42, 0.56, 0.7];
  const stars = starX.reduce((n, _x, i) => (after(p, beats[i]) ? i + 1 : n), 0);
  const submitAt = 0.86;
  const ptr = follow(p, [
    { at: 0, x: starX[0], y: starY },
    ...starX.flatMap((x, i) => [
      { at: Math.max(0, beats[i] - 0.06), x, y: starY },
      { at: beats[i], x, y: starY, click: true as const },
    ]),
    { at: 0.8, x: CX, y: 372 },
    { at: submitAt, x: CX, y: 372, click: true },
  ]);
  return (
    <>
      <Caption title="Every session helps build a better learning experience." opacity={o} />
      <PhoneStage t={t} start={62.5} end={65.8}>
        <Phone tab="Home" pointer={<Pointer {...ptr} />}>
          <RatingUI stars={Math.max(1, stars)} submitOn={after(p, submitAt)} />
        </Phone>
      </PhoneStage>
    </>
  );
}

function Admin({ t }: { t: number }) {
  const o = sceneOpacity(t, 65.5, 70.4);
  if (o <= 0) return null;
  const p = localT(t, 65.5, 70.4);
  const { x, rotY, scale } = motion(t, 65.5, 70.4);
  const verifyAt = 0.32;
  const approveAt = 0.68;
  const ptr = follow(p, [
    { at: 0, x: 86, y: 118 },
    { at: 0.18, x: 86, y: 164 },
    { at: verifyAt, x: 86, y: 164, click: true },
    { at: 0.54, x: 760, y: 292 },
    { at: approveAt, x: 760, y: 292, click: true },
  ]);
  return (
    <>
      <Caption top title="Powerful tools for managing the entire learning ecosystem." opacity={o} />
      <DeviceSlot opacity={o} x={x} rotY={rotY} scale={scale * 0.7} side="center" laptop>
        <div style={{ position: 'relative' }}>
          <LaptopFrame>
            <AdminDesktop highlight={after(p, verifyAt) ? 1 : 0} approved={after(p, approveAt)} />
          </LaptopFrame>
          <Pointer {...ptr} />
        </div>
      </DeviceSlot>
    </>
  );
}

function Tech({ t }: { t: number }) {
  const o = sceneOpacity(t, 70.1, 73.8);
  if (o <= 0) return null;
  const stack = [
    ['RN', 'React Native'],
    ['FB', 'Firebase'],
    ['WR', 'WebRTC'],
    ['IO', 'Socket.io'],
    ['GM', 'Gemini'],
    ['EX', 'Express'],
    ['DB', 'MongoDB'],
    ['API', 'REST APIs'],
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, zIndex: 8 }}>
      <Caption top title="Built with modern technologies for a connected learning experience." />
      <div className="tech-row" style={{ position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%,-50%)' }}>
        {stack.map(([abbr, name], i) => (
          <div key={name} className="tech-chip" style={{ opacity: clamp((localT(t, 70.1, 73.8) - i * 0.06) * 4), transform: `translateY(${Math.sin(t * 2 + i) * 6}px)` }}>
            <div className="mark" style={{ margin: '0 auto' }}>{abbr.slice(0, 2)}</div>
            <b>{name}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Montage({ t }: { t: number }) {
  const o = sceneOpacity(t, 73.5, 78.4, 0.25);
  if (o <= 0) return null;
  const p = localT(t, 73.5, 78.4);
  const idx = Math.min(MONTAGE_SHOTS.length - 1, Math.floor(p * MONTAGE_SHOTS.length));
  const shot = MONTAGE_SHOTS[idx];
  const desktop = shot.id === 'parent' || shot.id === 'admin';
  const flip = lerp(-16, 16, p);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, zIndex: 7 }}>
      <div className="montage-label">{shot.label}</div>
      {desktop ? (
        <DeviceSlot opacity={o} x={0} rotY={flip} scale={0.62} side="center" laptop>
          <LaptopFrame>
            {shot.id === 'parent' ? <ParentDesktop nav={0} highlight={1} /> : <AdminDesktop highlight={1} />}
          </LaptopFrame>
        </DeviceSlot>
      ) : (
        <DeviceSlot opacity={o} x={0} rotY={flip} scale={0.8} side="center">
          <Phone
            tab={shot.id === 'schedule' ? 'Bookings' : shot.id === 'chat' ? 'Messages' : 'Home'}
            hideTabs={shot.id === 'live'}
          >
            <MontageScreen id={shot.id} />
          </Phone>
        </DeviceSlot>
      )}
    </div>
  );
}

function MontageScreen({ id }: { id: string }) {
  if (id === 'search') return <SearchUI query="Physics" focused selected sheet />;
  if (id === 'profile') return <ProfileUI scrolled={20} subjectOn={1} slotOn={2} />;
  if (id === 'booking') return <BookingUI dateOn={1} timeOn={2} confirm={false} />;
  if (id === 'live') return <ClassroomUI joined />;
  if (id === 'ai') return <AiSummaryUI />;
  if (id === 'chat') return <ChatUI typed="See you at 4:00." sent />;
  if (id === 'wallet') return <WalletUI method="jazzcash" />;
  if (id === 'schedule') return <ScheduleUI dayOn joinOn />;
  if (id === 'parent') return <ParentDesktop nav={1} highlight={1} />;
  if (id === 'admin') return <AdminDesktop highlight={1} />;
  return <StudentHome />;
}

function Outro({ t }: { t: number }) {
  const o = sceneOpacity(t, 78.1, DURATION, 0.45);
  if (o <= 0) return null;
  const p = localT(t, 78.1, DURATION);
  const logoO = clamp(p / 0.2);
  const titleO = clamp((p - 0.22) / 0.16);
  const sloganO = clamp((p - 0.42) / 0.16);
  const lineO = clamp((p - 0.62) / 0.16);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, zIndex: 10, display: 'grid', placeItems: 'center' }}>
      <div className="brand-lockup">
        <img src="/images/TutorLinkLogo.png" alt="TutorLink" style={{ opacity: logoO }} />
        <h1 style={{ opacity: titleO }}>TutorLink</h1>
        <div className="slogan" style={{ opacity: sloganO }}>Learn with Ease</div>
        <p className="outro-line" style={{ opacity: lineO }}>
          Learn smarter. Teach better. Connect easier.
        </p>
        <p className="outro-credit" style={{ opacity: lineO }}>
          MUSIC · WHOLESOME · KEVIN MACLEOD
        </p>
      </div>
    </div>
  );
}
