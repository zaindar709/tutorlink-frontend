import { I, Icon } from './chrome';

const SARA =
  'https://randomuser.me/api/portraits/women/32.jpg';
const STUDENT =
  'https://randomuser.me/api/portraits/women/44.jpg';
const TUTOR_M =
  'https://randomuser.me/api/portraits/men/32.jpg';

export function StudentHome({ zoomJoin, tileOn = -1 }: { zoomJoin?: boolean; tileOn?: number }) {
  return (
    <div className="s home-s">
      <div className="h-row">
        <div>
          <div className="welcome">Welcome back,</div>
          <div className="name">Ayesha</div>
          <div className="sub">Next up: Physics at 4:00 PM</div>
        </div>
        <div className="bell">
          <Icon d={I.bell} size={18} color="#7548F5" />
          <i className="ndot" />
        </div>
      </div>
      <div className="banner">
        <b>Today’s Schedule</b>
        <span>Friday, Sep 4</span>
      </div>
      <div className="sec">
        <h4>Current Lessons</h4>
        <a>View all ›</a>
      </div>
      <div className="card" style={{ transform: zoomJoin ? 'scale(1.03)' : undefined, transformOrigin: 'top center' }}>
        <div className="row">
          <img className="avatar" src={SARA} alt="" />
          <div>
            <b>Sara Ahmed</b>
            <div className="sub" style={{ margin: 0 }}>Physics</div>
            <div className="meta">4:00 PM – 5:30 PM</div>
          </div>
        </div>
        <div className={`join${zoomJoin ? ' pulse' : ''}`}>
          <Icon d={I.video} size={16} color="#fff" /> Join Room
        </div>
      </div>
      <div className="sec"><h4>Quick Access</h4></div>
      <div className="grid2">
        <div className={`tile${tileOn === 0 ? ' on' : ''}`} style={{ background: 'rgba(255,237,213,0.95)' }}>
          <div className="ic" style={{ background: '#F97316' }}><Icon d={I.book} size={16} color="#fff" /></div>
          <b>Assignments</b><span style={{ color: '#C2410C' }}>2 new</span>
        </div>
        <div className="tile" style={{ background: 'rgba(237,233,254,0.95)' }}>
          <div className="ic" style={{ background: '#7548F5' }}><Icon d={I.spark} size={16} color="#fff" /></div>
          <b>Quizzes</b><span style={{ color: '#5B2FD6' }}>1 pending</span>
        </div>
        <div className="tile" style={{ background: 'rgba(220,252,231,0.95)' }}>
          <div className="ic" style={{ background: '#16A34A' }}><Icon d={I.check} size={16} color="#fff" /></div>
          <b>Tests</b><span style={{ color: '#15803D' }}>1 upcoming</span>
        </div>
        <div className="tile" style={{ background: 'rgba(219,234,254,0.95)' }}>
          <div className="ic" style={{ background: '#2563EB' }}><Icon d={I.chart} size={16} color="#fff" /></div>
          <b>My Progress</b><span style={{ color: '#1D4ED8' }}>View analytics</span>
        </div>
      </div>
      <div className="sec home-more">
        <h4>Latest Learning Summary</h4>
        <a>View all ›</a>
      </div>
      <div className="card ai-card home-more">
        <div className="h-row">
          <div className="ic" style={{ background: '#EEF2FF', width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center' }}>
            <Icon d={I.spark} size={16} color="#64748B" />
          </div>
          <div className="spark">✦</div>
        </div>
        <div className="meta" style={{ marginTop: 6 }}>Physics</div>
        <b>Newton’s laws — worked examples</b>
        <div className="meta">Tutor: Sara Ahmed</div>
      </div>
    </div>
  );
}

export function SearchUI({
  query,
  focused,
  selected,
  sheet,
}: {
  query: string;
  focused: boolean;
  selected: boolean;
  sheet: boolean;
}) {
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div className="map-bg">
        <div className="map-road" style={{ left: 40, top: 80, width: 8, height: 420 }} />
        <div className="map-road" style={{ left: 0, top: 220, width: '100%', height: 8 }} />
        <div className="map-road" style={{ left: 180, top: 40, width: 8, height: 500 }} />
        <div className="map-road" style={{ left: 60, top: 360, width: 240, height: 8 }} />
        <div className="pin" style={{ left: 168, top: 210 }} />
        <div className={`pin${selected ? ' on' : ''}`} style={{ left: 214, top: 268 }} />
        <div className="pin" style={{ left: 92, top: 300 }} />
      </div>
      <div className="search-overlay">
        <div className={`search-box${focused ? ' focus' : ''}`}>
          <Icon d={I.search} size={16} color="#7548F5" />
          <span style={{ color: query ? '#0F172A' : '#94A3B8' }}>{query || 'Search tutors or subjects'}</span>
        </div>
      </div>
      <div className="sheet" style={{ height: sheet ? 280 : 168 }}>
        <div className="handle" />
        <TutorRow name="Sara Ahmed" subject="Physics · Mathematics" rating="4.9" img={SARA} sel={selected} />
        <TutorRow name="Ali Raza" subject="Chemistry · Biology" rating="4.8" img={TUTOR_M} sel={false} />
      </div>
    </div>
  );
}

function TutorRow({
  name, subject, rating, img, sel,
}: { name: string; subject: string; rating: string; img: string; sel: boolean }) {
  return (
    <div className={`tutor-card${sel ? ' sel' : ''}`}>
      <img className="avatar" src={img} alt="" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <b style={{ fontSize: 13 }}>{name}</b>
        <div className="meta">{subject}</div>
        <div className="stars">★★★★★ <span style={{ color: '#64748B' }}>{rating}</span></div>
      </div>
      <div className="book-chip">Book Now</div>
    </div>
  );
}

export function ProfileUI({
  scrolled,
  subjectOn = -1,
  slotOn = -1,
  hireOn = false,
}: {
  scrolled: number;
  subjectOn?: number;
  slotOn?: number;
  hireOn?: boolean;
}) {
  return (
    <div className="s profile-s" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div style={{ transform: `translateY(${-scrolled}px)` }}>
      <div className="hdr">‹ Tutor profile</div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <img className="hero-avatar" src={SARA} alt="" />
        <div>
          <div className="name" style={{ fontSize: 20 }}>Sara Ahmed</div>
          <div className="rate">★ 4.9 · 128 reviews</div>
          <div className="meta">Usually replies in 20 min</div>
          <div className="chip-p" style={{ display: 'inline-block', marginTop: 6 }}>Verified</div>
        </div>
      </div>
      <div className="chips">
        {['Mathematics', 'Physics', 'Chemistry'].map((s, i) => (
          <span className={`chip-p${subjectOn === i ? ' on' : ''}`} key={s}>{s}</span>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <b>Experience</b>
        <p className="sub">6 years · MSc Physics — LUMS</p>
        <p className="sub" style={{ marginTop: 6 }}>
          I help secondary and A-level students build strong problem-solving habits with clear explanations and exam-focused practice.
        </p>
      </div>
      <div className="sec"><h4>Availability</h4></div>
      <div className="chips">
        {['9:00 AM', '10:30 AM', '4:00 PM', '6:00 PM'].map((s, i) => (
          <span className={`chip-p${slotOn === i ? ' on' : ''}`} key={s}>{s}</span>
        ))}
      </div>
      <div className="meta" style={{ marginTop: 10 }}>Rs. 2,500 / hour · Hybrid · Lahore, DHA</div>
      </div>
      <div className={`cta sticky-cta${hireOn ? ' pulse' : ''}`}>Hire Tutor</div>
    </div>
  );
}

export function BookingUI({
  dateOn, timeOn, confirm, confirmed = false,
}: { dateOn: number; timeOn: number; confirm: boolean; confirmed?: boolean }) {
  const dates = ['Today', 'Mon', 'Tue', 'Wed'];
  const times = ['9:00 AM', '10:30 AM', '4:00 PM', '6:00 PM'];
  return (
    <div className="s" style={{ position: 'relative', height: '100%' }}>
      <div className="hdr">‹ Book session</div>
      <div className="row">
        <img className="avatar" src={SARA} alt="" />
        <div>
          <b>Sara Ahmed</b>
          <div className="meta">Physics · 90 min · Rs. 3,750</div>
        </div>
      </div>
      <div className="sec"><h4>Select date</h4></div>
      <div className="chips">
        {dates.map((d, i) => (
          <span className={`chip-p${i === dateOn ? ' on' : ''}`} key={d}>{d}</span>
        ))}
      </div>
      <div className="sec"><h4>Select time</h4></div>
      <div className="chips">
        {times.map((d, i) => (
          <span className={`chip-p${i === timeOn ? ' on' : ''}`} key={d}>{d}</span>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="h-row">
          <span className="meta">TutorLink Wallet</span>
          <b style={{ color: '#7548F5' }}>Held in escrow</b>
        </div>
      </div>
      <div className={`cta sticky-cta${confirm && !confirmed ? '' : ''}`}>Hire Tutor</div>
      {confirm ? (
        <div className="modal-scrim">
          <div className="modal">
            <b>Confirm booking?</b>
            <p className="sub">Physics with Sara Ahmed · Mon · 4:00 PM</p>
            <p className="sub">Rs. 3,750 will be held in your wallet until the session completes.</p>
            <div className={`cta${confirmed ? ' pulse' : ''}`} style={{ marginTop: 12 }}>
              {confirmed ? 'Booked' : 'Confirm booking'}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ClassroomUI({ joined, ended = false }: { joined: boolean; ended?: boolean }) {
  return (
    <div className="classroom">
      <div className="remote" />
      <div className="class-top">
        <span>TutorLink Classroom</span>
        <span className="live-pill">{ended ? 'ENDED' : joined ? 'LIVE' : 'Connecting'}</span>
      </div>
      <div className="pip">
        <img src={STUDENT} alt="" />
      </div>
      <div style={{ position: 'absolute', left: 14, bottom: 86, fontSize: 13, fontWeight: 800 }}>
        Sara Ahmed · Physics
      </div>
      <div className="controls">
        {[
          ['Mic', true],
          ['Cam', true],
          ['Flip', false],
          ['Chat', false],
          ['End', false],
        ].map(([label, on]) => (
          <div
            key={String(label)}
            className={
              label === 'End'
                ? `cbtn danger${ended ? ' pulse' : ''}`
                : `cbtn${on ? ' on' : ''}`
            }
          >
            {label === 'Mic' ? '🎙' : label === 'Cam' ? '📷' : label === 'End' ? '☎' : label === 'Flip' ? '↺' : '💬'}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiProcessUI({ ready }: { ready: boolean }) {
  return (
    <div className="process">
      <div className="glow-star">✦</div>
      <h4 style={{ margin: '14px 0 6px', fontSize: 16 }}>Preparing Your Learning Summary</h4>
      <div className="badge-s">{ready ? 'Published' : 'Processing'}</div>
      <p className="sub" style={{ marginTop: 10, maxWidth: 240 }}>
        {ready
          ? 'Your tutor reviewed this summary. Key points are ready for revision.'
          : 'Session audio is being turned into an overview, key points, and homework.'}
      </p>
    </div>
  );
}

export function AiSummaryUI() {
  return (
    <div className="s">
      <div className="hdr">‹ Learning Summary</div>
      <div className="meta">Physics</div>
      <div className="name" style={{ fontSize: 18 }}>Newton’s laws — worked examples</div>
      <div className="meta">Tutor: Sara Ahmed · 90 min</div>
      <div className="card" style={{ marginTop: 12 }}>
        <b>Overview</b>
        <p className="sub">
          Covered Newton’s three laws with two exam-style numericals. Ayesha can now map force diagrams to equations of motion.
        </p>
      </div>
      <div className="card" style={{ marginTop: 8 }}>
        <b>Key points</b>
        <p className="sub">• F = ma only after isolating the system</p>
        <p className="sub">• Action–reaction pairs act on different bodies</p>
        <p className="sub">• Draw the free-body diagram first</p>
      </div>
    </div>
  );
}

export function ScheduleUI({ dayOn = false, joinOn = false }: { dayOn?: boolean; joinOn?: boolean }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div className="s">
      <div className="name" style={{ fontSize: 20 }}>Bookings</div>
      <div className="tabs3">
        <span className="on">Active</span><span>Pending</span><span>Past</span>
      </div>
      <div className="cal">
        {days.map((d, i) => (
            <div className={`day${i === 4 && dayOn ? ' on' : ''}`} key={`${d}${i}`}>
            {d}<div>{1 + i}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <img className="avatar" src={SARA} alt="" />
          <div>
            <b>Physics with Sara Ahmed</b>
            <div className="meta">Today · 4:00 – 5:30 PM</div>
            <div className="chip-p" style={{ display: 'inline-block', marginTop: 4 }}>Accepted</div>
          </div>
        </div>
        <div className={`join${joinOn ? ' pulse' : ''}`}>Join Room</div>
      </div>
    </div>
  );
}

export function WalletUI({ method, depositOn = false }: { method: 'jazzcash' | 'easypaisa'; depositOn?: boolean }) {
  return (
    <div className="s">
      <div className="hdr">‹ Wallet</div>
      <div className="wallet-hero">
        <div className="lbl">Available Balance</div>
        <div className="bal">Rs. 12,500</div>
        <div className="lbl">Ready to book sessions</div>
        <div className={`dep${depositOn ? ' pulse' : ''}`}>+ Deposit Money</div>
      </div>
      <div className="pay-row">
        <div className={`pay${method === 'jazzcash' ? ' on' : ''}`}>JazzCash</div>
        <div className={`pay${method === 'easypaisa' ? ' on' : ''}`}>Easypaisa</div>
      </div>
      <div className="sec"><h4>Transactions</h4></div>
      <div className="txn"><span>Physics session escrow</span><b>- 3,750</b></div>
      <div className="txn"><span>JazzCash deposit</span><b style={{ color: '#16A34A' }}>+ 10,000</b></div>
      <div className="txn"><span>Refund — cancelled class</span><b style={{ color: '#16A34A' }}>+ 2,500</b></div>
    </div>
  );
}

export function ChatUI({ typed, sent }: { typed: string; sent: boolean }) {
  return (
    <div className="s" style={{ position: 'relative', height: '100%' }}>
      <div className="chat-head">
        <img className="avatar" src={SARA} alt="" style={{ width: 36, height: 36, borderRadius: 12 }} />
        <div>
          <b>Sara Ahmed</b>
          <div className="meta">Physics tutor · online</div>
        </div>
      </div>
      <div className="bubbles">
        <div className="b in">Hi Ayesha — review the free-body diagrams before class.</div>
        <div className="b out">Got it. I’ll send my attempt in 10 minutes.</div>
        {sent ? <div className="b out">{typed || 'See you at 4:00.'}</div> : null}
      </div>
      <div className="composer">
        <span style={{ color: typed && !sent ? '#0F172A' : undefined }}>
          {sent ? 'Message' : typed || 'Type a message'}
        </span>
        <div className="send"><Icon d={I.send} size={14} color="#fff" /></div>
      </div>
    </div>
  );
}

export function TutorDashUI() {
  return (
    <div className="s">
      <div className="welcome">Welcome back,</div>
      <div className="name">Sara</div>
      <div className="sub">1 new booking request waiting</div>
      <div className="stat3">
        <div className="stat"><b>2</b><span>Today</span></div>
        <div className="stat"><b>1</b><span>Requests</span></div>
        <div className="stat"><b>Rs 7.5k</b><span>Escrow</span></div>
      </div>
      <div className="sec"><h4>Incoming requests</h4><a>View all ›</a></div>
      <RequestCard accepted={false} />
    </div>
  );
}

export function TutorRequestsUI({ accepted }: { accepted: boolean }) {
  return (
    <div className="s">
      <div className="name" style={{ fontSize: 20 }}>Requests</div>
      <p className="sub">Pending booking requests from students</p>
      <RequestCard accepted={accepted} />
      <div className="card req">
        <div className="row">
          <img className="avatar" src={TUTOR_M} alt="" />
          <div>
            <b>Hamza Ali</b>
            <div className="meta">Mathematics · Mon 6:00 PM</div>
          </div>
        </div>
        <div className="acts">
          <div className="btn-g">Accept</div>
          <div className="btn-r">Decline</div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ accepted }: { accepted: boolean }) {
  return (
    <div className="card req">
      <div className="row">
        <img className="avatar" src={STUDENT} alt="" />
        <div style={{ flex: 1 }}>
          <b>Ayesha Khan</b>
          <div className="meta">Physics · Mon 4:00 PM · Rs. 3,750</div>
        </div>
        <span className="chip-p">{accepted ? 'Accepted' : 'Pending'}</span>
      </div>
      <div className="acts">
        <div className="btn-g" style={{ opacity: accepted ? 0.45 : 1 }}>Accept</div>
        <div className="btn-r">Decline</div>
      </div>
    </div>
  );
}

export function TutorEarningsUI() {
  return (
    <div className="s">
      <div className="hdr">‹ Earnings</div>
      <div className="wallet-hero">
        <div className="lbl">Available to withdraw</div>
        <div className="bal">Rs. 48,200</div>
        <div className="lbl">Escrow held: Rs. 7,500</div>
        <div className="dep">Withdraw to JazzCash</div>
      </div>
      <div className="sec"><h4>Session income</h4></div>
      <div className="txn"><span>Physics · Ayesha Khan</span><b>+ 3,750</b></div>
      <div className="txn"><span>Mathematics · Hamza Ali</span><b>+ 2,500</b></div>
    </div>
  );
}

export function RatingUI({ stars, submitOn = false }: { stars: number; submitOn?: boolean }) {
  return (
    <div className="s" style={{ background: 'rgba(15,23,42,0.2)', height: '100%' }}>
      <div className="rate-modal">
        <img className="avatar" src={SARA} alt="" style={{ margin: '0 auto' }} />
        <div className="name" style={{ fontSize: 18, marginTop: 8 }}>Rate Sara Ahmed</div>
        <div className="sub">How was your Physics session?</div>
        <div className="star-row">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < stars ? 'on' : ''}>★</span>
          ))}
        </div>
        <p className="sub">“Clear explanations — Newton’s laws finally clicked.”</p>
        <div className={`cta${submitOn ? ' pulse' : ''}`} style={{ marginTop: 12 }}>Submit feedback</div>
      </div>
    </div>
  );
}

