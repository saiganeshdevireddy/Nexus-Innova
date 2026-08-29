import React, { useEffect, useRef } from "react";

/**
 * Animated digital grid + scanning line background.
 * Lightweight canvas — only redraws on a slow interval.
 */
export default function GridBackground({ reduced = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let scanY = 0;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
      ctx.lineWidth = 1;
      const gap = 48 * window.devicePixelRatio;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Perspective floor glow
      const grad = ctx.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.7, w * 0.6);
      grad.addColorStop(0, "rgba(34, 211, 238, 0.08)");
      grad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Scanning line
      if (!reduced) {
        scanY = (scanY + 1.5 * window.devicePixelRatio) % h;
        const sg = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        sg.addColorStop(0, "rgba(34, 211, 238, 0)");
        sg.addColorStop(0.5, "rgba(34, 211, 238, 0.12)");
        sg.addColorStop(1, "rgba(34, 211, 238, 0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, scanY - 40, w, 80);
      }

      t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: "saturate(120%)" }}
    />
  );
}
