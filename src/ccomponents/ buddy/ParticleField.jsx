import React, { useEffect, useRef } from "react";

/**
 * Lightweight particle network.
 * Particles drift, connect with nearby neighbors (digital-network effect),
 * and react to a global "energy" level (0-1) driven by AI state.
 */
export default function ParticleField({ energy = 0.3, reduced = false }) {
  const canvasRef = useRef(null);
  const energyRef = useRef(energy);
  energyRef.current = energy;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const dpr = window.devicePixelRatio || 1;

    const COUNT = reduced ? 28 : 64;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3 * dpr,
          vy: (Math.random() - 0.5) * 0.3 * dpr,
          r: (Math.random() * 1.6 + 0.6) * dpr,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const e = energyRef.current;
      const linkDist = 130 * dpr;

      // links
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const a = (1 - d / linkDist) * (0.08 + e * 0.22);
            ctx.strokeStyle = `rgba(125, 211, 252, ${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // particles
      for (const p of particles) {
        p.x += p.vx * (1 + e * 2);
        p.y += p.vy * (1 + e * 2);
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + e * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 243, 252, ${0.4 + e * 0.5})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
