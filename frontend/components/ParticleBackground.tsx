"use client";

import React, { useEffect, useRef } from "react";

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse position for parallax
    let mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // AI Particles & Nodes
    const particleCount = Math.min(Math.floor(width / 18), 70);
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ["#00f3ff", "#3b82f6", "#a855f7", "#60a5fa"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Glowing Orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.3, r: 250, color: "rgba(0, 243, 255, 0.08)", vx: 0.2, vy: 0.1 },
      { x: width * 0.8, y: height * 0.7, r: 300, color: "rgba(59, 130, 246, 0.08)", vx: -0.15, vy: -0.2 },
      { x: width * 0.5, y: height * 0.8, r: 220, color: "rgba(168, 85, 247, 0.06)", vx: 0.1, vy: -0.1 },
    ];

    let ringRotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      const offsetX = (mouse.x - width / 2) * 0.03;
      const offsetY = (mouse.y - height / 2) * 0.03;

      // 1. Draw Digital Cyber Grid
      ctx.strokeStyle = "rgba(0, 243, 255, 0.035)";
      ctx.lineWidth = 1;
      const gridSize = 50;

      for (let x = (offsetX % gridSize); x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = (offsetY % gridSize); y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Moving Glowing Orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        const grad = ctx.createRadialGradient(
          orb.x + offsetX,
          orb.y + offsetY,
          0,
          orb.x + offsetX,
          orb.y + offsetY,
          orb.r
        );
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x + offsetX, orb.y + offsetY, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Floating Holographic Rings
      ringRotation += 0.003;
      ctx.save();
      ctx.translate(width * 0.5 + offsetX * 1.5, height * 0.4 + offsetY * 1.5);
      ctx.rotate(ringRotation);
      ctx.strokeStyle = "rgba(0, 243, 255, 0.07)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 320, 120, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(168, 85, 247, 0.05)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 280, 90, -Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Update & Draw Particles and Neural Connections
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Pulse particle glow
        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.9 || p.alpha < 0.2) p.pulseSpeed *= -1;

        const px = p.x + offsetX;
        const py = p.y + offsetY;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with glowing lines
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2x = p2.x + offsetX;
          const p2y = p2.y + offsetY;

          const dx = px - p2x;
          const dy = py - p2y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.strokeStyle = "rgba(0, 243, 255, 0.15)";
            ctx.lineWidth = (1 - dist / 130) * 1.2;
            ctx.globalAlpha = (1 - dist / 130) * 0.4;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p2x, p2y);
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 bg-[#030712]"
    />
  );
};
