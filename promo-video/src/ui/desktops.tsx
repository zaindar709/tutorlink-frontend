export function ParentDesktop({ highlight, nav = 0 }: { highlight: number; nav?: number }) {
  const items = ['Overview', 'My Children', 'Sessions', 'Progress', 'Payments', 'Notifications', 'Settings'];
  const title = items[nav] || 'Overview';
  return (
    <div className="laptop-inner" style={{ height: '100%' }}>
      <div className="chrome">
        <aside className="side">
          <div className="brand-mini">
            <div className="mark">TL</div>
            <div>
              <div className="meta" style={{ color: '#7548F5', fontWeight: 800, letterSpacing: 1 }}>TUTORLINK</div>
              <b>Parent</b>
            </div>
          </div>
          {items.map((n, i) => (
            <div key={n} className={`nav-i${i === nav ? ' on' : ''}`}>{n}</div>
          ))}
        </aside>
        <div className="mainp">
          <b style={{ fontSize: 18 }}>{title}</b>
          <div className="meta" style={{ marginBottom: 12 }}>
            {nav === 1 ? 'Linked children on TutorLink' : nav === 3 ? 'Learning progress this term' : 'Ahmed Aslam · Class 10'}
          </div>
          <div className="stat4">
            {[
              ['Linked Children', '2'],
              ['Upcoming Sessions', '3'],
              ['Overall Progress', '90%'],
              ['Avg Attendance', '94%'],
            ].map(([k, v], i) => (
              <div key={k} className="scard" style={{ outline: highlight === i ? '2px solid #7548F5' : undefined }}>
                <div className="k">{k}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>
          <div className="table">
            <b>{nav === 1 ? 'Children' : nav === 3 ? 'Subject progress' : 'Upcoming Sessions'}</b>
            <div className="tr" style={{ fontWeight: 800, color: '#64748B' }}>
              <span>Subject</span><span>Child</span><span>When</span><span>Tutor</span>
            </div>
            <div className="tr"><span>Physics</span><span>Ahmed Aslam</span><span>4:00 PM</span><span>Prof. Ali Ahmed</span></div>
            <div className="tr"><span>English</span><span>Sara Aslam</span><span>6:30 PM</span><span>Ms. Fatima Noor</span></div>
            <div className="tr"><span>Mathematics</span><span>Ahmed Aslam</span><span>Fri 5:00</span><span>Sara Malik</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDesktop({ highlight, approved = false }: { highlight: number; approved?: boolean }) {
  const items = [
    'Overview',
    'Tutor Verification',
    'Tutor Ratings',
    'Parent-Student Links',
    'Escrow Management',
    'AI System Health',
    'Settings',
  ];
  return (
    <div className="chrome">
      <aside className="side">
        <div className="brand-mini">
          <div className="mark">TL</div>
          <div>
            <div className="meta" style={{ color: '#7548F5', fontWeight: 800, letterSpacing: 1 }}>TUTORLINK</div>
            <b>Admin</b>
          </div>
        </div>
        {items.map((n, i) => (
          <div key={n} className={`nav-i${i === highlight ? ' on' : ''}`}>{n}</div>
        ))}
      </aside>
      <div className="mainp">
        <b style={{ fontSize: 18 }}>{highlight === 1 ? 'Tutor Verification' : 'Overview'}</b>
        <div className="meta" style={{ marginBottom: 12 }}>
          {highlight === 1 ? 'Approve tutors to make them visible on the student app' : 'Platform snapshot & quick actions'}
        </div>
        <div className="stat4">
          {[
            ['Pending Tutors', approved ? '3' : '4'],
            ['Active Escrow', 'Rs 186k'],
            ['Linked Parents', '28'],
            ["Today's Live Classrooms", '6'],
          ].map(([k, v]) => (
            <div key={k} className="scard">
              <div className="k">{k}</div>
              <div className="v">{v}</div>
            </div>
          ))}
        </div>
        <div className="table">
          <b>Tutor Verification Queue</b>
          <div className="tr" style={{ fontWeight: 800, color: '#64748B' }}>
            <span>Tutor</span><span>Expertise</span><span>Status</span><span>Action</span>
          </div>
          <div className="tr">
            <span>Sara Ahmed</span><span>Physics</span>
            <span>{approved ? 'Approved' : 'Pending'}</span>
            <span><button className={`approve${approved ? ' pulse' : ''}`} type="button">{approved ? 'Done' : 'Approve'}</button></span>
          </div>
          <div className="tr">
            <span>Ali Raza</span><span>Chemistry</span><span>Interview</span>
            <span><button className="approve" type="button">Approve</button></span>
          </div>
          <div className="tr">
            <span>Fatima Noor</span><span>English</span><span>Pending</span>
            <span><button className="approve" type="button">Approve</button></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LaptopFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="laptop" style={style}>
      <div className="lid">{children}</div>
      <div className="base" />
    </div>
  );
}
