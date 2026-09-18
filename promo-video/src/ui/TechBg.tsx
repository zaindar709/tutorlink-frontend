import { useEffect, useRef } from 'react';

export default function TechBg({ t, neural }: { t: number; neural?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 1920;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;
    const nodes = Array.from({ length: 28 }, (_, i) => ({
      x: (i * 137) % w,
      y: (i * 89 + 40) % h,
      vx: ((i % 5) - 2) * 0.12,
      vy: ((i % 3) - 1) * 0.1,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(n => {
        n.x = (n.x + n.vx + w) % w;
        n.y = (n.y + n.vy + h) % h;
      });
      ctx.strokeStyle = 'rgba(167,139,250,0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 220) {
            ctx.globalAlpha = 1 - d / 220;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[j].y);
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      nodes.forEach(n => {
        ctx.fillStyle = '#c4b5fd';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const particles = Array.from({ length: 18 }, (_, i) => {
    const x = 80 + ((i * 97) % 1760);
    const y = 60 + ((i * 53) % 960);
    const drift = Math.sin(t * 0.6 + i) * 12;
    return { x, y: y + drift, i };
  });

  return (
    <div className="tech-bg">
      <div className="vignette" />
      <div className="grid" />
      <div className="orb" style={{ width: 340, height: 340, left: -40, top: -60 }} />
      <div className="orb" style={{ width: 280, height: 280, right: 40, bottom: 40, opacity: 0.7 }} />
      {particles.map(p => (
        <div key={p.i} className="particle" style={{ left: p.x, top: p.y, opacity: 0.55 }} />
      ))}
      <div className="edu-float" style={{ left: 120, top: 160, transform: `translateY(${Math.sin(t) * 8}px)` }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 16l9 4 9-4" stroke="currentColor" strokeWidth="1.4"/></svg>
      </div>
      <div className="edu-float" style={{ right: 180, top: 220, transform: `translateY(${Math.cos(t * 0.8) * 10}px)` }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v6c0 5-3.4 8.4-8 10C7.4 21.4 4 18 4 13V7l8-4z" stroke="currentColor" strokeWidth="1.4"/></svg>
      </div>
      {neural ? <canvas ref={canvasRef} className="node-canvas neural" /> : <canvas ref={canvasRef} className="node-canvas" style={{ opacity: 0.35 }} />}
    </div>
  );
}
