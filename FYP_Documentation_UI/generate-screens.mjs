/**
 * Generates TutorLink FYP documentation HTML screens.
 * Run: node generate-screens.mjs
 * Does not touch the main React Native app.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlDir = path.join(__dirname, 'html');

const HEAD = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=430, height=932, initial-scale=1" />
  <title>${title} — TutorLink</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&display=block" />
  <link rel="stylesheet" href="../assets/shared.css" />
</head>
<body>
<div class="phone"><div class="screen">`;

const FOOT = `</div></div></body></html>`;

const mi = (name, cls = '') => `<span class="mi ${cls}">${name}</span>`;

const studentTabs = (active) => {
  const items = [
    ['search', 'Search', 'search'],
    ['bookings', 'Bookings', 'calendar_month'],
    ['home', 'Home', 'home'],
    ['messages', 'Messages', 'chat'],
    ['profile', 'Profile', 'person'],
  ];
  return `<div class="tabbar">${items.map(([key, label, icon]) => {
    if (key === 'home') {
      return `<div class="tab ${active === 'home' ? 'active' : ''}" style="flex:0">
        <div class="tab-fab">${mi('home', 'fill')}</div>
      </div>`;
    }
    return `<div class="tab ${active === key ? 'active' : ''}">
      ${mi(icon, active === key ? 'fill' : '')}<span>${label}</span>
    </div>`;
  }).join('')}</div>`;
};

const tutorTabs = (active) => {
  const items = [
    ['request', 'Requests', 'inbox'],
    ['schedule', 'Schedule', 'calendar_month'],
    ['home', 'Home', 'home'],
    ['messages', 'Messages', 'chat'],
    ['profile', 'Profile', 'person'],
  ];
  return `<div class="tabbar">${items.map(([key, label, icon]) => {
    if (key === 'home') {
      return `<div class="tab" style="flex:0"><div class="tab-fab">${mi('home', 'fill')}</div></div>`;
    }
    return `<div class="tab ${active === key ? 'active' : ''}">
      ${mi(icon, active === key ? 'fill' : '')}<span>${label}</span>
    </div>`;
  }).join('')}</div>`;
};

const screens = {};

// 01 Login
screens['01_Login.html'] = HEAD('Login') + `
  <div class="auth-header">
    <div class="auth-back">${mi('arrow_back')}</div>
    <div class="brand">TutorLink</div>
    <div class="auth-accent"></div>
    <div class="h1">Student Login</div>
    <div class="subtitle mt-8">Sign in to continue your learning journey</div>
  </div>
  <div class="glass-card">
    <div class="field">
      <div class="field-label">Email</div>
      <div class="input filled">${mi('mail')}<span>ahmed.khan@example.com</span></div>
    </div>
    <div class="field">
      <div class="field-label">Password</div>
      <div class="input filled">${mi('lock')}<span style="flex:1">••••••••</span>${mi('visibility_off')}</div>
    </div>
    <div class="row-between" style="margin:4px 0 16px">
      <div class="flex items-center gap-8 body" style="color:var(--text-secondary)"><span class="checkbox"></span> Remember me</div>
      <span class="link">Forgot Password?</span>
    </div>
    <div class="btn-primary">Login</div>
  </div>
  <div class="divider"><span>or continue with</span></div>
  <div style="padding:0 20px">
    <div class="btn-social"><svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.7-4.5 6.5-8.3 7.6l6.2 5.2C36.8 38.3 44 33 44 24c0-1.3-.1-2.5-.4-3.5z"/></svg> Continue with Google</div>
  </div>
  <div class="auth-footer">Don't have an account? <span class="link">Sign up</span></div>
` + FOOT;

// 02 Register
screens['02_Register.html'] = HEAD('Register') + `
  <div class="auth-header">
    <div class="auth-back">${mi('arrow_back')}</div>
    <div class="brand">TutorLink</div>
    <div class="auth-accent"></div>
    <div class="h1">Create Account</div>
    <div class="subtitle mt-8">Join TutorLink and start your learning journey</div>
  </div>
  <div class="glass-card">
    <div class="field"><div class="field-label">Full Name</div><div class="input filled">${mi('person')}<span>Ahmed Khan</span></div></div>
    <div class="field"><div class="field-label">Email</div><div class="input filled">${mi('mail')}<span>ahmed.khan@example.com</span></div></div>
    <div class="field"><div class="field-label">Password</div><div class="input filled">${mi('lock')}<span style="flex:1">••••••••</span>${mi('visibility_off')}</div></div>
    <div class="field"><div class="field-label">Confirm Password</div><div class="input filled">${mi('lock')}<span style="flex:1">••••••••</span>${mi('visibility')}</div></div>
    <div class="btn-primary mt-8">Create Account</div>
  </div>
  <div class="auth-footer">Already have an account? <span class="link">Log In</span></div>
` + FOOT;

// 03 OTP
screens['03_OTP_Verification.html'] = HEAD('OTP Verification') + `
  <div class="auth-header">
    <div class="auth-back">${mi('arrow_back')}</div>
    <div class="brand">TutorLink</div>
    <div class="auth-accent"></div>
    <div class="h1">Enter Code</div>
    <div class="subtitle mt-8">We sent a 4-digit code to ahmed.khan@example.com</div>
  </div>
  <div class="glass-card">
    <div class="field-label mb-8">Verification Code</div>
    <div class="otp-row">
      <div class="otp-box">8</div>
      <div class="otp-box">4</div>
      <div class="otp-box">2</div>
      <div class="otp-box focus">|</div>
    </div>
    <div class="text-center caption mb-16">Resend code in <span style="color:var(--primary);font-weight:700">0:42</span></div>
    <div class="btn-primary disabled">Verify Code</div>
  </div>
` + FOOT;

// 04 Student Dashboard
screens['04_Student_Dashboard.html'] = HEAD('Student Dashboard') + `
  <div class="content-with-tabs px-20 top-pad">
    <div class="flex justify-between items-center">
      <div>
        <div class="h1">Hello, Ahmed!</div>
        <div class="subtitle">Find the best tutor for your next session</div>
      </div>
      <div class="icon-btn">${mi('notifications')}<span class="badge-dot"></span></div>
    </div>
    <div class="gradient-card mt-16">
      <div style="font-size:20px;font-weight:800;line-height:28px">Every expert was<br/>once a beginner</div>
      <div style="opacity:0.9;margin:8px 0 16px;font-size:14px">Start your journey today!</div>
      <div style="background:#fff;color:var(--primary);height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px">Find a Tutor</div>
    </div>
    <div class="search-fake">${mi('search')}<span>Search Subjects (e.g. Physics)</span></div>
    <div class="section-title"><span class="h3">Top Tutors for You</span><span class="view-all">View all</span></div>
    <div class="h-scroll">
      <div class="tutor-card">
        <div class="avatar md" style="margin:0 auto 8px;background:linear-gradient(135deg,#a78bfa,#7548F5)">SA</div>
        <div class="body text-center" style="font-weight:700">Sara Ahmed</div>
        <div class="caption text-center">Physics · Math</div>
        <div class="text-center mt-8" style="color:var(--accent);font-size:12px;font-weight:700">★ 4.9</div>
        <div class="chip mt-8" style="width:100%;justify-content:center">Verified</div>
      </div>
      <div class="tutor-card">
        <div class="avatar md" style="margin:0 auto 8px;background:linear-gradient(135deg,#60a5fa,#3b82f6)">AA</div>
        <div class="body text-center" style="font-weight:700">Ali Ahmed</div>
        <div class="caption text-center">Mathematics</div>
        <div class="text-center mt-8" style="color:var(--accent);font-size:12px;font-weight:700">★ 4.8</div>
        <div class="chip mt-8" style="width:100%;justify-content:center;background:#FFF7ED;color:#C2410C">Recommended</div>
      </div>
      <div class="tutor-card">
        <div class="avatar md" style="margin:0 auto 8px;background:linear-gradient(135deg,#34d399,#059669)">FN</div>
        <div class="body text-center" style="font-weight:700">Fatima Noor</div>
        <div class="caption text-center">English</div>
        <div class="text-center mt-8" style="color:var(--accent);font-size:12px;font-weight:700">★ 4.7</div>
        <div class="chip mt-8" style="width:100%;justify-content:center">Verified</div>
      </div>
    </div>
    <div class="card mt-16" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-color:rgba(117,72,245,0.2)">
      <div class="flex gap-12 items-center">
        <div style="width:44px;height:44px;border-radius:14px;background:var(--gradient);display:flex;align-items:center;justify-content:center;color:#fff">${mi('auto_awesome')}</div>
        <div class="flex-1">
          <div class="body" style="font-weight:700;color:var(--primary-dark)">AI Recommendation</div>
          <div class="caption">Here is the best tutor for you — Sara Ahmed matches your Physics goals!</div>
        </div>
      </div>
    </div>
    <div class="section-title"><span class="h3">Explore</span></div>
    <div class="explore-grid">
      <div class="explore-tile" style="background:#4B84FF">${mi('menu_book')}<span>How it Works</span></div>
      <div class="explore-tile" style="background:#F7B500">${mi('star')}<span>Popular Topics</span></div>
      <div class="explore-tile" style="background:#6ACB8B">${mi('verified_user')}<span>Verified Tutors</span></div>
      <div class="explore-tile" style="background:#FF8C57">${mi('emoji_events')}<span>Top Rated</span></div>
    </div>
  </div>
  ${studentTabs('home')}
` + FOOT;

// 05 Tutor Dashboard
screens['05_Tutor_Dashboard.html'] = HEAD('Tutor Dashboard') + `
  <div class="content-with-tabs px-20 top-pad">
    <div class="flex justify-between items-center">
      <div>
        <div class="h1">Hello, Sara!</div>
        <div class="subtitle">3 new booking requests waiting</div>
      </div>
      <div class="avatar" style="background:var(--gradient)">SA</div>
    </div>
    <div class="gradient-card mt-16">
      <div class="flex justify-between items-center">
        <div>
          <div style="opacity:0.85;font-size:13px">Available balance</div>
          <div style="font-size:28px;font-weight:800;margin:4px 0">Rs. 42,500</div>
          <div style="opacity:0.8;font-size:12px">Escrow held · Rs. 7,500</div>
        </div>
        <div style="color:#FDE68A">${mi('account_balance_wallet')}</div>
      </div>
      <div style="margin-top:14px;background:rgba(255,255,255,0.2);height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:700;gap:6px">View earnings ${mi('arrow_forward')}</div>
    </div>
    <div class="stat-grid mt-16">
      <div class="stat-card">
        <div class="stat-icon" style="background:#EEF2FF;color:var(--primary)">${mi('calendar_month')}</div>
        <div class="h3">12</div><div class="caption">Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#FFF7ED;color:#C2410C">${mi('schedule')}</div>
        <div class="h3">3</div><div class="caption">Requests</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ECFDF3;color:#15803D">${mi('verified_user')}</div>
        <div class="h3">7.5k</div><div class="caption">Escrow</div>
      </div>
    </div>
    <div class="section-title"><span class="h3">New requests</span><span class="chip-amber chip">3</span></div>
    <div class="card mb-12">
      <div class="flex gap-12 items-center">
        <div class="avatar" style="background:linear-gradient(135deg,#60a5fa,#2563eb)">AK</div>
        <div class="flex-1">
          <div class="flex justify-between"><div class="body" style="font-weight:700">Ahmed Khan</div><span class="chip-amber chip">PENDING</span></div>
          <div class="caption">Today · 4:00 PM · Physics</div>
        </div>
      </div>
      <div class="flex gap-8 mt-12">
        <div class="btn-primary flex-1" style="height:40px;font-size:14px;box-shadow:var(--shadow-soft)">Review</div>
        <div class="btn-soft flex-1">Decline</div>
      </div>
    </div>
    <div class="section-title"><span class="h3">Today's sessions</span></div>
    <div class="card">
      <div class="flex gap-12 items-center">
        <div class="avatar" style="background:linear-gradient(135deg,#f472b6,#db2777)">HA</div>
        <div class="flex-1">
          <div class="body" style="font-weight:700">Hamza Ali</div>
          <div class="caption">Mathematics · 6:00 – 7:00 PM</div>
        </div>
      </div>
      <div class="flex gap-8 mt-12">
        <div class="btn-outline flex-1">${mi('chat')} Message</div>
        <div class="btn-primary flex-1" style="height:44px;font-size:14px">${mi('videocam')} Start class</div>
      </div>
    </div>
  </div>
  ${tutorTabs('home')}
` + FOOT;

// 06 Parent Dashboard (mobile-framed from web)
screens['06_Parent_Dashboard.html'] = HEAD('Parent Dashboard') + `
  <div class="screen" style="background:var(--bg-parent)">
    <div class="px-20 top-pad content-with-tabs" style="padding-bottom:24px">
      <div class="flex justify-between items-center mb-12">
        <div>
          <div class="caption" style="color:var(--primary);font-weight:700">PARENT PORTAL</div>
          <div class="h1">Overview</div>
        </div>
        <div class="flex gap-8 items-center">
          <div class="icon-btn" style="width:40px;height:40px">${mi('notifications')}</div>
          <div class="avatar sm">AK</div>
        </div>
      </div>
      <div class="sidebar-chips">
        <div class="chip-nav active">Overview</div>
        <div class="chip-nav">Children</div>
        <div class="chip-nav">Sessions</div>
        <div class="chip-nav">Progress</div>
        <div class="chip-nav">Alerts</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="card"><div class="caption">Linked Children</div><div class="h2 mt-8">2</div></div>
        <div class="card"><div class="caption">Upcoming</div><div class="h2 mt-8">3</div></div>
        <div class="card"><div class="caption">Avg Progress</div><div class="h2 mt-8" style="color:var(--success)">90%</div></div>
        <div class="card"><div class="caption">Attendance</div><div class="h2 mt-8">94%</div></div>
      </div>
      <div class="card mt-16">
        <div class="h3 mb-12">Weekly Progress</div>
        <div class="flex items-end gap-8" style="height:90px">
          ${[55,70,62,78,85,88,90].map((h,i)=>`<div class="flex-1 flex-col items-center" style="height:100%;justify-content:flex-end"><div style="width:100%;height:${h}%;background:var(--gradient);border-radius:8px 8px 4px 4px;opacity:${0.55+i*0.06}"></div></div>`).join('')}
        </div>
        <div class="flex justify-between caption mt-8"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
      </div>
      <div class="card mt-12" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe)">
        <div class="flex gap-10 items-center">
          <div style="width:40px;height:40px;border-radius:12px;background:var(--gradient);color:#fff;display:flex;align-items:center;justify-content:center">${mi('psychology')}</div>
          <div><div class="body" style="font-weight:700">AI Insight</div><div class="caption">Both children are on an upward trajectory this week.</div></div>
        </div>
      </div>
      <div class="section-title"><span class="h3">Upcoming Sessions</span></div>
      <div class="card mb-10">
        <div class="flex justify-between items-center">
          <div>
            <div class="body" style="font-weight:700">Physics · Ahmed Aslam</div>
            <div class="caption">Prof. Ali Ahmed · Jul 22 · 4:00 PM</div>
          </div>
          <span class="chip">Upcoming</span>
        </div>
      </div>
      <div class="card">
        <div class="flex justify-between items-center">
          <div>
            <div class="body" style="font-weight:700">English · Sara Aslam</div>
            <div class="caption">Ms. Fatima Noor · 6:30 PM</div>
          </div>
          <span class="chip">Upcoming</span>
        </div>
      </div>
      <div class="section-title"><span class="h3">My Children</span></div>
      <div class="flex gap-12">
        <div class="card flex-1 text-center">
          <div class="avatar md" style="margin:0 auto 8px">AA</div>
          <div class="body" style="font-weight:700">Ahmed Aslam</div>
          <div class="caption">Class 10 · 88%</div>
        </div>
        <div class="card flex-1 text-center">
          <div class="avatar md" style="margin:0 auto 8px;background:linear-gradient(135deg,#f472b6,#db2777)">SA</div>
          <div class="body" style="font-weight:700">Sara Aslam</div>
          <div class="caption">Class 8 · 92%</div>
        </div>
      </div>
    </div>
  </div>
` + FOOT;

// 07 Admin Dashboard
screens['07_Admin_Dashboard.html'] = HEAD('Admin Dashboard') + `
  <div class="screen" style="background:var(--bg-parent)">
    <div class="px-20 top-pad" style="height:100%;overflow:hidden">
      <div class="flex justify-between items-center mb-12">
        <div>
          <div class="caption" style="color:var(--primary);font-weight:700">ADMIN CONSOLE</div>
          <div class="h1">Overview</div>
        </div>
        <div class="flex gap-8">
          <div class="chip-amber chip">5 pending</div>
          <div class="icon-btn" style="width:40px;height:40px">${mi('refresh')}</div>
        </div>
      </div>
      <div class="sidebar-chips">
        <div class="chip-nav active">Overview</div>
        <div class="chip-nav">Verification</div>
        <div class="chip-nav">Links</div>
        <div class="chip-nav">Escrow</div>
        <div class="chip-nav">AI Health</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="card"><div class="caption">Pending Tutors</div><div class="h2 mt-8" style="color:var(--warning)">5</div></div>
        <div class="card"><div class="caption">Escrow (PKR)</div><div class="h2 mt-8">185k</div></div>
        <div class="card"><div class="caption">Linked Parents</div><div class="h2 mt-8">128</div></div>
        <div class="card"><div class="caption">Live Classrooms</div><div class="h2 mt-8" style="color:var(--success)">12 <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--success);animation:none"></span></div></div>
      </div>
      <div class="card mt-16" style="background:#FFFBEB;border-color:#FDE68A">
        <div class="body" style="font-weight:700;color:#92400E">Student visibility rule</div>
        <div class="caption mt-8">Only tutors with <b>isVerified: true</b> appear in search.</div>
        <div class="flex gap-8 mt-12">
          <span class="chip-green chip">Approve = Instant</span>
          <span class="chip-amber chip">Interview = Hold</span>
        </div>
      </div>
      <div class="section-title"><span class="h3">Pending Verification</span></div>
      <div class="card mb-10">
        <div class="flex gap-12 items-center">
          <div class="avatar">ZM</div>
          <div class="flex-1">
            <div class="body" style="font-weight:700">Zain Malik</div>
            <div class="caption">Physics · Docs uploaded</div>
          </div>
        </div>
        <div class="flex gap-8 mt-12">
          <div class="btn-primary flex-1" style="height:38px;font-size:13px">Approve</div>
          <div class="btn-outline flex-1" style="height:38px;font-size:13px">Interview</div>
        </div>
      </div>
      <div class="card mb-10">
        <div class="flex gap-12 items-center">
          <div class="avatar" style="background:linear-gradient(135deg,#34d399,#059669)">NR</div>
          <div class="flex-1">
            <div class="body" style="font-weight:700">Nida Raza</div>
            <div class="caption">Chemistry · Under review</div>
          </div>
        </div>
        <div class="flex gap-8 mt-12">
          <div class="btn-primary flex-1" style="height:38px;font-size:13px">Approve</div>
          <div class="btn-outline flex-1" style="height:38px;font-size:13px">Interview</div>
        </div>
      </div>
      <div class="card" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe)">
        <div class="flex justify-between items-center">
          <div>
            <div class="body" style="font-weight:700">AI System Health</div>
            <div class="caption">Recommendation engine · Operational</div>
          </div>
          <span class="chip-green chip">99.2%</span>
        </div>
      </div>
    </div>
  </div>
` + FOOT;

// 08 Search
screens['08_Search_Tutors.html'] = HEAD('Search Tutors') + `
  <div class="screen" style="position:relative">
    <div class="map-bg map-roads"></div>
    <div class="map-marker" style="top:28%;left:22%"><div class="pin">SA<span class="rating-badge">4.9</span><span class="online"></span></div></div>
    <div class="map-marker" style="top:42%;left:58%"><div class="pin" style="background:linear-gradient(135deg,#60a5fa,#3b82f6)">AA<span class="rating-badge">4.8</span><span class="online"></span></div></div>
    <div class="map-marker" style="top:55%;left:35%"><div class="pin" style="background:linear-gradient(135deg,#34d399,#059669)">FN<span class="rating-badge">4.7</span></div></div>
    <div style="position:absolute;top:36px;left:16px;right:16px">
      <div class="search-fake" style="margin:0;height:52px">
        ${mi('search')}<span class="flex-1">Find tutors near you</span>${mi('tune')}
      </div>
    </div>
    <div style="position:absolute;right:16px;top:48%;width:48px;height:48px;border-radius:50%;background:#fff;box-shadow:var(--shadow-med);display:flex;align-items:center;justify-content:center;color:var(--primary)">${mi('my_location')}</div>
    <div class="sheet">
      <div class="sheet-handle"></div>
      <div class="flex justify-between items-center mb-8">
        <div><div class="h3">Featured Tutors Nearby</div><div class="caption">12 tutors available</div></div>
      </div>
      <div class="flex gap-12 overflow-hidden">
        <div class="card" style="min-width:200px;padding:12px">
          <div class="flex gap-10 items-center">
            <div class="avatar">SA</div>
            <div><div class="body" style="font-weight:700">Sara Ahmed</div><div class="caption">Physics · Math</div><div style="color:var(--accent);font-size:12px;font-weight:700">★ 4.9 · 0.8 km</div></div>
          </div>
        </div>
        <div class="card" style="min-width:200px;padding:12px">
          <div class="flex gap-10 items-center">
            <div class="avatar" style="background:linear-gradient(135deg,#60a5fa,#3b82f6)">AA</div>
            <div><div class="body" style="font-weight:700">Ali Ahmed</div><div class="caption">Mathematics</div><div style="color:var(--accent);font-size:12px;font-weight:700">★ 4.8 · 1.2 km</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
` + FOOT;

// 09 Tutor Profile
screens['09_Tutor_Profile.html'] = HEAD('Tutor Profile') + `
  <div class="glass-header"><div class="back">${mi('arrow_back')}</div><div class="h3 flex-1">Tutor details</div></div>
  <div style="flex:1;overflow:hidden;padding-bottom:90px">
    <div class="gradient-card" style="margin:12px 20px;border-radius:28px;text-align:center">
      <div class="avatar lg" style="margin:0 auto 12px;border:3px solid rgba(255,255,255,0.4)">SA</div>
      <div style="font-size:22px;font-weight:800">Sara Ahmed</div>
      <div class="flex items-center justify-center gap-8 mt-8" style="opacity:0.95;font-size:13px">${mi('verified')} Verified · MSc Physics — LUMS</div>
      <div style="margin-top:8px;font-size:14px">★ 4.9 (128 reviews)</div>
      <div style="margin-top:10px;font-size:20px;font-weight:800">PKR 2,500/hr</div>
    </div>
    <div class="stat-grid px-20">
      <div class="stat-card"><div class="h3">340</div><div class="caption">Sessions</div></div>
      <div class="stat-card"><div class="h3">96%</div><div class="caption">Success</div></div>
      <div class="stat-card"><div class="h3">6y</div><div class="caption">Exp.</div></div>
    </div>
    <div class="px-20">
      <div class="section-title"><span class="h3">Preferred class time</span></div>
      <div class="flex gap-8 mb-12">
        <div class="chip" style="background:var(--gradient);color:#fff">Today</div>
        <div class="chip">Tomorrow</div>
        <div class="chip">Wed</div>
        <div class="chip">Thu</div>
      </div>
      <div class="flex gap-8" style="flex-wrap:wrap">
        ${['9:00 AM','11:00 AM','2:00 PM','4:00 PM','6:00 PM'].map((t,i)=>`<div class="chip" style="${i===3?'background:var(--gradient);color:#fff':''}">${t}</div>`).join('')}
      </div>
      <div class="section-title"><span class="h3">Subjects</span></div>
      <div class="flex gap-8 mb-12"><span class="chip">Mathematics</span><span class="chip">Physics</span><span class="chip">Chemistry</span></div>
      <div class="h3 mb-8">About</div>
      <div class="body" style="color:var(--text-secondary)">Interactive teaching focused on exam prep. Based in Lahore, DHA Phase 5. Languages: English, Urdu.</div>
      <div class="section-title"><span class="h3">Student reviews</span></div>
      <div class="card" style="padding:12px">
        <div class="flex justify-between"><div class="body" style="font-weight:700">Hamza Ali</div><span class="stars">★★★★★</span></div>
        <div class="caption mt-8">Excellent Physics explanations. Highly recommend!</div>
      </div>
    </div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:rgba(255,255,255,0.95);border-top:1px solid var(--border);padding:14px 20px 24px;display:flex;align-items:center;gap:16px">
    <div><div class="caption">Est. (1 hr)</div><div class="h3">PKR 2,500</div></div>
    <div class="btn-primary flex-1" style="height:50px">Book Now</div>
  </div>
` + FOOT;

// 10 Booking
screens['10_Booking.html'] = HEAD('Booking') + `
  <div class="content-with-tabs px-20 top-pad">
    <div class="h1">My Bookings</div>
    <div class="day-strip mt-12">
      ${[['Mon',12],['Tue',13],['Wed',14],['Thu',15],['Fri',16],['Sat',17],['Sun',18]].map(([d,n],i)=>`
        <div class="day-card ${i===2?'active':''}">
          <div class="d">${d}</div><div class="n">${n}</div>
          ${i===2?'<div class="dot"></div>':''}
        </div>`).join('')}
    </div>
    <div class="seg">
      <div class="seg-item active">Active</div>
      <div class="seg-item">Pending</div>
      <div class="seg-item">Past</div>
    </div>
    <div class="caption mb-8" style="font-weight:700;letter-spacing:0.5px;color:var(--primary)">NEXT SESSION</div>
    <div class="card mb-12">
      <div class="flex gap-12 items-center">
        <div style="position:relative"><div class="avatar">SA</div><span class="online-dot"></span></div>
        <div class="flex-1">
          <div class="body" style="font-weight:700">Sara Ahmed</div>
          <div class="caption">Physics · Today · 4:00 – 5:00 PM</div>
        </div>
        <span class="chip-green chip">Confirmed</span>
      </div>
      <div class="flex gap-8 mt-12">
        <div class="btn-primary flex-1" style="height:42px;font-size:14px">${mi('videocam')} Join</div>
        <div class="btn-outline flex-1">${mi('chat')} Message</div>
      </div>
    </div>
    <div class="card mb-12">
      <div class="flex gap-12 items-center">
        <div class="avatar" style="background:linear-gradient(135deg,#60a5fa,#3b82f6)">AA</div>
        <div class="flex-1">
          <div class="body" style="font-weight:700">Ali Ahmed</div>
          <div class="caption">Mathematics · Tomorrow · 6:00 PM</div>
        </div>
        <span class="chip chip-amber">Pending</span>
      </div>
      <div class="flex gap-8 mt-12">
        <div class="btn-outline flex-1" style="color:var(--error);border-color:rgba(239,68,68,0.3)">Cancel</div>
        <div class="btn-soft flex-1">${mi('chat')} Message</div>
      </div>
    </div>
    <div class="card">
      <div class="flex gap-12 items-center">
        <div class="avatar" style="background:linear-gradient(135deg,#34d399,#059669)">FN</div>
        <div class="flex-1">
          <div class="body" style="font-weight:700">Fatima Noor</div>
          <div class="caption">English · Fri · 5:00 PM</div>
        </div>
        <span class="chip-green chip">Confirmed</span>
      </div>
    </div>
  </div>
  ${studentTabs('bookings')}
` + FOOT;

// 11 Payment / Wallet
screens['11_Payment.html'] = HEAD('Payment') + `
  <div class="glass-header"><div class="back">${mi('arrow_back')}</div><div class="h3 flex-1">Wallet</div></div>
  <div class="px-20" style="flex:1;overflow:hidden">
    <div class="subtitle mt-8 mb-16">Manage deposits, escrow holds, and recent activity</div>
    <div class="gradient-card">
      <div class="flex justify-between">
        <div>
          <div style="opacity:0.85;font-size:13px">Available Balance</div>
          <div style="font-size:30px;font-weight:800;margin:6px 0">Rs. 8,500</div>
          <div style="opacity:0.8;font-size:12px">Ready to book sessions</div>
        </div>
        ${mi('account_balance_wallet')}
      </div>
      <div style="margin-top:16px;background:#fff;color:var(--primary);height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:700;gap:6px">${mi('add_circle')} Deposit Money</div>
    </div>
    <div class="card mt-16" style="background:#FFFBEB;border-color:#FDE68A">
      <div class="flex gap-12 items-center">
        <div style="width:44px;height:44px;border-radius:14px;background:#FEF3C7;color:#B45309;display:flex;align-items:center;justify-content:center">${mi('lock')}</div>
        <div>
          <div class="body" style="font-weight:700">Escrow · Rs. 2,500</div>
          <div class="caption">Funds stay locked until your session completes</div>
        </div>
      </div>
    </div>
    <div class="section-title"><span class="h3">Recent Transactions</span><span class="view-all">${mi('refresh')}</span></div>
    <div class="card" style="padding:4px 16px">
      <div class="list-row">
        <div class="menu-icon" style="background:#ECFDF3;color:var(--success)">${mi('arrow_downward')}</div>
        <div class="flex-1"><div class="body" style="font-weight:600">JazzCash Deposit</div><div class="caption">Today · 10:24 AM</div></div>
        <div style="font-weight:700;color:var(--success)">+Rs. 5,000</div>
      </div>
      <div class="list-row">
        <div class="menu-icon" style="background:var(--primary-soft);color:var(--primary)">${mi('lock')}</div>
        <div class="flex-1"><div class="body" style="font-weight:600">Escrow Hold</div><div class="caption">Sara Ahmed · Physics</div></div>
        <div style="font-weight:700;color:var(--text)">-Rs. 2,500</div>
      </div>
      <div class="list-row">
        <div class="menu-icon" style="background:#EEF2FF;color:var(--primary)">${mi('payments')}</div>
        <div class="flex-1"><div class="body" style="font-weight:600">Easypaisa Deposit</div><div class="caption">Jul 18 · 3:10 PM</div></div>
        <div style="font-weight:700;color:var(--success)">+Rs. 3,000</div>
      </div>
    </div>
    <div class="card mt-16">
      <div class="h3 mb-12">Quick Deposit</div>
      <div class="flex gap-8 mb-12">
        <div class="chip" style="background:var(--gradient);color:#fff">JazzCash</div>
        <div class="chip">Easypaisa</div>
      </div>
      <div class="input filled mb-12"><span>Amount: 1000</span></div>
      <div class="input filled mb-12"><span>03001234567</span></div>
      <div class="btn-primary" style="height:48px">Deposit</div>
    </div>
  </div>
` + FOOT;

// 12 Chat
screens['12_Chat.html'] = HEAD('Chat') + `
  <div class="chat-header">
    <div style="color:var(--text)">${mi('chevron_left')}</div>
    <div style="position:relative"><div class="avatar" style="width:42px;height:42px">AA</div><span class="online-dot"></span></div>
    <div class="flex-1">
      <div class="body" style="font-weight:700">Prof. Ali Ahmed ${mi('verified')}</div>
      <div class="caption" style="color:var(--success)">Online · Mathematics</div>
    </div>
    <div class="chat-actions">
      <div class="chat-action">${mi('call')}</div>
      <div class="chat-action video">${mi('videocam')}</div>
    </div>
  </div>
  <div class="encrypt-banner">${mi('lock')} Messages are end-to-end encrypted</div>
  <div class="bubbles">
    <div class="bubble sys">
      <div class="flex gap-8 items-center mb-8" style="color:var(--primary)">${mi('event_available')}<b style="font-size:13px">Booking Confirmed</b></div>
      <div class="caption">Mathematics session · Tomorrow 6:00 PM</div>
    </div>
    <div class="bubble in">Assalam o Alaikum! Looking forward to our session on derivatives.</div>
    <div class="bubble out">Wa Alaikum Assalam! Please revise derivatives chapter before class.</div>
    <div class="bubble in">Sure, I will prepare the exercises tonight.</div>
    <div class="bubble sys">
      <div class="flex gap-8 items-center mb-8" style="color:var(--primary)">${mi('videocam')}<b style="font-size:13px">Tutor has started your session</b></div>
      <div class="btn-primary mt-8" style="height:40px;font-size:14px">Join Now</div>
    </div>
  </div>
  <div class="composer">
    ${mi('add_circle')}<span class="flex-1 caption" style="font-size:14px">Type a message…</span>
    ${mi('mood')}<div class="composer-send">${mi('send')}</div>
  </div>
` + FOOT;

// 13 Live Video (designed for FYP — not yet in RN app)
screens['13_Live_Video_Session.html'] = HEAD('Live Video Session') + `
  <div class="screen video-screen">
    <div class="flex items-center gap-12" style="padding:28px 16px 8px">
      <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center">${mi('arrow_back')}</div>
      <div class="flex-1">
        <div style="font-weight:700;font-size:16px">Mathematics · Sara Ahmed</div>
        <div style="opacity:0.7;font-size:12px">Live session · Escrow held · PKR 2,500</div>
      </div>
      <div style="background:rgba(239,68,68,0.2);color:#FCA5A5;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:700">32:14</div>
    </div>
    <div class="video-remote">
      <div class="text-center">
        <div class="avatar lg" style="margin:0 auto 12px;width:100px;height:100px;font-size:36px">SA</div>
        <div style="font-size:18px;font-weight:700">Sara Ahmed</div>
        <div style="opacity:0.65;font-size:13px;margin-top:4px">Camera on · HD</div>
      </div>
      <div class="video-pip">
        <div class="text-center">
          <div class="avatar" style="margin:0 auto;background:linear-gradient(135deg,#60a5fa,#2563eb)">AK</div>
          <div style="font-size:11px;margin-top:8px;opacity:0.8">You</div>
        </div>
      </div>
      <div style="position:absolute;top:16px;left:16px" class="chip-white chip">Physics · Waves</div>
    </div>
    <div class="video-controls">
      <div class="v-btn">${mi('mic')}</div>
      <div class="v-btn">${mi('videocam')}</div>
      <div class="v-btn">${mi('screen_share')}</div>
      <div class="v-btn">${mi('chat')}</div>
      <div class="v-btn end">${mi('call_end')}</div>
    </div>
  </div>
` + FOOT;

// 14 AI Summary (designed for FYP — not yet dedicated RN screen)
screens['14_AI_Summary.html'] = HEAD('AI Session Summary') + `
  <div class="glass-header"><div class="back">${mi('arrow_back')}</div><div class="h3 flex-1">AI Session Summary</div></div>
  <div class="px-20" style="flex:1;overflow:hidden;padding-top:12px">
    <div class="card" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-color:rgba(168,85,247,0.25)">
      <div class="flex gap-12 items-center">
        <div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#A855F7,#7548F5);color:#fff;display:flex;align-items:center;justify-content:center">${mi('psychology')}</div>
        <div>
          <div class="h3">Session complete</div>
          <div class="caption">Physics · Sara Ahmed · Jul 18, 2026 · 60 min</div>
        </div>
      </div>
    </div>
    <div class="card mt-16">
      <div class="h3 mb-12">Key takeaways</div>
      <div class="body mb-8" style="color:var(--text-secondary)">• Wave equation basics and standing waves clarified</div>
      <div class="body mb-8" style="color:var(--text-secondary)">• Practice on frequency–wavelength problems</div>
      <div class="body" style="color:var(--text-secondary)">• Identified gaps in unit conversion under pressure</div>
    </div>
    <div class="card mt-12">
      <div class="h3 mb-12">Topics covered</div>
      <div class="flex gap-8" style="flex-wrap:wrap">
        <span class="chip">Standing waves</span><span class="chip">Frequency</span><span class="chip">Wavelength</span><span class="chip">Resonance</span>
      </div>
    </div>
    <div class="card mt-12">
      <div class="h3 mb-8">Homework</div>
      <div class="body" style="color:var(--text-secondary)">Complete exercises 4.2–4.6 from Chapter 4 before the next session.</div>
    </div>
    <div class="card mt-12" style="background:#ECFDF3;border-color:#A7F3D0">
      <div class="body" style="font-weight:700;color:#15803D">Strengths</div>
      <div class="caption mt-8">Strong conceptual grasp once walked through step-by-step.</div>
    </div>
    <div class="card mt-12" style="background:#FFF7ED;border-color:#FED7AA">
      <div class="body" style="font-weight:700;color:#C2410C">Next focus</div>
      <div class="caption mt-8">Schedule extra revision before the waves unit test. Ahmed is gaining momentum in Physics.</div>
    </div>
    <div class="flex gap-8 mt-16">
      <div class="btn-soft flex-1">Share with parent</div>
      <div class="btn-primary flex-1" style="height:44px;font-size:14px">Book follow-up</div>
    </div>
  </div>
` + FOOT;

// 15 Notifications
screens['15_Notifications.html'] = HEAD('Notifications') + `
  <div class="glass-header">
    <div class="back">${mi('arrow_back')}</div>
    <div class="h3 flex-1">Notifications</div>
    <div style="color:var(--primary)">${mi('refresh')}</div>
  </div>
  <div class="px-20" style="padding-top:12px">
    <div class="flex gap-8 mb-16">
      <div class="btn-soft" style="height:36px;padding:0 14px;font-size:12px">Mark all read</div>
      <div class="btn-outline" style="height:36px;padding:0 14px;font-size:12px">Send test</div>
      <div class="btn-outline" style="height:36px;padding:0 14px;font-size:12px;color:var(--error);border-color:rgba(239,68,68,0.3)">Clear</div>
    </div>
    <div class="notif-card notif-unread">
      <div class="menu-icon" style="background:var(--primary-soft);color:var(--primary)">${mi('event')}</div>
      <div class="flex-1">
        <div class="flex justify-between"><div class="body" style="font-weight:700">Session starting soon</div><span class="chip" style="font-size:10px">BOOKING</span></div>
        <div class="caption mt-8">Physics with Sara Ahmed starts in 30 minutes</div>
        <div class="caption mt-8">2 min ago</div>
      </div>
    </div>
    <div class="notif-card notif-unread">
      <div class="menu-icon" style="background:#ECFDF3;color:var(--success)">${mi('payments')}</div>
      <div class="flex-1">
        <div class="flex justify-between"><div class="body" style="font-weight:700">Payment successful</div><span class="chip" style="font-size:10px">PAYMENT</span></div>
        <div class="caption mt-8">JazzCash deposit of Rs. 5,000 credited</div>
        <div class="caption mt-8">1 hr ago</div>
      </div>
    </div>
    <div class="notif-card">
      <div class="menu-icon" style="background:#EEF2FF;color:var(--primary)">${mi('chat')}</div>
      <div class="flex-1">
        <div class="flex justify-between"><div class="body" style="font-weight:700">New message</div><span class="chip" style="font-size:10px">CHAT</span></div>
        <div class="caption mt-8">Prof. Ali Ahmed: Please revise derivatives…</div>
        <div class="caption mt-8">Yesterday</div>
      </div>
    </div>
    <div class="notif-card">
      <div class="menu-icon" style="background:#F5F3FF;color:#7C3AED">${mi('insights')}</div>
      <div class="flex-1">
        <div class="flex justify-between"><div class="body" style="font-weight:700">Weekly progress report ready</div><span class="chip" style="font-size:10px">AI</span></div>
        <div class="caption mt-8">Your Physics score improved by 8% this week</div>
        <div class="caption mt-8">2 days ago</div>
      </div>
    </div>
  </div>
` + FOOT;

// 16 Rating
screens['16_Rating_Review.html'] = HEAD('Rating & Review') + `
  <div class="glass-header"><div class="back">${mi('arrow_back')}</div><div class="h3 flex-1">Rate your session</div></div>
  <div class="px-20" style="padding-top:20px">
    <div class="glass-card" style="margin:0;background:rgba(255,255,255,0.85)">
      <div class="text-center mb-8">
        <div class="avatar lg" style="margin:0 auto 12px">SA</div>
        <div class="h2">Sara Ahmed</div>
        <div class="subtitle">Physics · Jul 18, 2026</div>
      </div>
      <div class="star-picker">
        ${mi('star', 'fill')}${mi('star', 'fill')}${mi('star', 'fill')}${mi('star', 'fill')}${mi('star', 'fill')}
      </div>
      <div class="textarea">Write your feedback… (optional)<br/><br/><span style="color:var(--text)">Excellent session! Sara explained standing waves clearly and shared great practice tips.</span></div>
      <div class="btn-primary mt-16">Submit review</div>
    </div>
  </div>
` + FOOT;

// 17 Settings
screens['17_Settings.html'] = HEAD('Settings') + `
  <div class="content-with-tabs" style="overflow:hidden">
    <div class="gradient-card" style="margin:28px 20px 12px;border-radius:28px">
      <div class="flex gap-14 items-center">
        <div class="avatar lg" style="border:3px solid rgba(255,255,255,0.35)">AK</div>
        <div>
          <div style="font-size:22px;font-weight:800">Ahmed Khan</div>
          <div style="opacity:0.9;font-size:13px;margin-top:4px">Class 10 · TL-STU-20481</div>
          <div class="chip-white chip mt-8">Student</div>
        </div>
      </div>
    </div>
    <div class="px-20">
      <div class="card mb-12" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);padding:14px">
        <div class="flex justify-between items-center">
          <div><div class="body" style="font-weight:700">Link a Parent</div><div class="caption">Share a 6-character code</div></div>
          <div class="btn-soft" style="height:36px;padding:0 12px;font-size:12px">Generate</div>
        </div>
      </div>
      <div class="caption mb-8" style="font-weight:700;letter-spacing:0.4px">ACCOUNT</div>
      <div style="border-radius:20px;overflow:hidden;border:1px solid var(--border);margin-bottom:14px">
        <div class="menu-row"><div class="menu-icon" style="background:var(--primary-soft);color:var(--primary)">${mi('person')}</div><div class="flex-1 body" style="font-weight:600">Edit Profile</div>${mi('chevron_right')}</div>
        <div class="menu-row"><div class="menu-icon" style="background:#ECFDF3;color:var(--success)">${mi('account_balance_wallet')}</div><div class="flex-1 body" style="font-weight:600">Wallet</div>${mi('chevron_right')}</div>
      </div>
      <div class="caption mb-8" style="font-weight:700;letter-spacing:0.4px">PREFERENCES</div>
      <div style="border-radius:20px;overflow:hidden;border:1px solid var(--border);margin-bottom:14px">
        <div class="menu-row"><div class="menu-icon" style="background:#EEF2FF;color:var(--primary)">${mi('notifications')}</div><div class="flex-1 body" style="font-weight:600">Notification Settings</div>${mi('chevron_right')}</div>
        <div class="menu-row"><div class="menu-icon" style="background:#FFF7ED;color:#C2410C">${mi('lock')}</div><div class="flex-1 body" style="font-weight:600">Privacy & Security</div>${mi('chevron_right')}</div>
        <div class="menu-row">
          <div class="menu-icon" style="background:#F5F3FF;color:#7C3AED">${mi('tune')}</div>
          <div class="flex-1"><div class="body" style="font-weight:600">Sound effects</div></div>
          <div class="toggle"></div>
        </div>
      </div>
      <div class="menu-row" style="border-radius:20px;border:1px solid rgba(239,68,68,0.2);background:#FEF2F2;color:#DC2626">
        <div class="menu-icon" style="background:#FEE2E2;color:#DC2626">${mi('logout')}</div>
        <div class="flex-1 body" style="font-weight:700;color:#DC2626">Logout</div>
      </div>
      <div class="text-center caption mt-16">TutorLink v1.1.0 · 2026</div>
    </div>
  </div>
  ${studentTabs('profile')}
` + FOOT;

fs.mkdirSync(htmlDir, { recursive: true });
for (const [name, html] of Object.entries(screens)) {
  fs.writeFileSync(path.join(htmlDir, name), html, 'utf8');
  console.log('Wrote', name);
}
console.log(`Generated ${Object.keys(screens).length} HTML screens.`);
