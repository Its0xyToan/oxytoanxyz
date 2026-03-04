"use client";

import { useEffect, useRef } from "react";
import { motion, type MotionValue } from "motion/react";

type HeaderProps = {
  starsOpacity?: MotionValue<number> | number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
};

const STAR_DENSITY = 14000;
const MIN_STARS = 2000;
const MOUSE_INFLUENCE_RADIUS = 180;
const MAX_PUSH = 115;
const CENTER_RADIUS_MULTIPLIER = 10;

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createStars(
  count: number,
  width: number,
  height: number,
): Star[] {
  const stars: Star[] = [];

  while (stars.length < count) {
    const x = Math.random() * width;
    const y = Math.random() * height;

    stars.push({
      x,
      y,
      size: randomInRange(0.8, 2.1),
      baseAlpha: randomInRange(0.45, 0.95),
      twinklePhase: randomInRange(0, Math.PI * 2),
      twinkleSpeed: randomInRange(0.35, 1.25),
    });
  }

  return stars;
}

export default function Header({ starsOpacity = 1 }: HeaderProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;

    if (!section || !canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let stars: Star[] = [];
    let influenceRadius = MOUSE_INFLUENCE_RADIUS;
    let centerInfluenceRadius = MOUSE_INFLUENCE_RADIUS * CENTER_RADIUS_MULTIPLIER;

    const mouse = {
      x: 0,
      y: 0,
      active: false,
    };

    const resize = () => {
      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      centerX = width / 2;
      centerY = height / 2;
      influenceRadius = Math.max(140, Math.min(220, Math.min(width, height) * 0.24));
      centerInfluenceRadius = influenceRadius * CENTER_RADIUS_MULTIPLIER;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = Math.max(
        MIN_STARS,
        Math.floor((width * height) / STAR_DENSITY),
      );
      stars = createStars(starCount, width, height);
    };

    const drawStar = (x: number, y: number, size: number, alpha: number) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      if (size > 1.2) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
      }
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const radiusSq = influenceRadius * influenceRadius;
      const centerInfluenceRadiusSq = centerInfluenceRadius * centerInfluenceRadius;

      for (const star of stars) {
        let drawX = star.x;
        let drawY = star.y;

        if (mouse.active) {
          const dx = drawX - mouse.x;
          const dy = drawY - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq && distSq > 0.0001) {
            const distance = Math.sqrt(distSq);
            const strength = 1 - distance / influenceRadius;
            const force = strength * strength * MAX_PUSH;
            drawX += (dx / distance) * force;
            drawY += (dy / distance) * force;
          }
        }

        const dxCenter = drawX - centerX;
        const dyCenter = drawY - centerY;
        const centerDistanceSq = dxCenter * dxCenter + dyCenter * dyCenter;

        if (centerDistanceSq < centerInfluenceRadiusSq && centerDistanceSq > 0.0001) {
          const centerDistance = Math.sqrt(centerDistanceSq);
          const centerStrength = 1 - centerDistance / centerInfluenceRadius;
          const centerForce = centerStrength * centerStrength * MAX_PUSH;
          drawX += (dxCenter / centerDistance) * centerForce;
          drawY += (dyCenter / centerDistance) * centerForce;
        }

        const twinkle =
          0.55 + 0.45 * Math.sin(time * 0.0012 * star.twinkleSpeed + star.twinklePhase);
        const alpha = Math.max(0.2, star.baseAlpha * twinkle);

        drawStar(drawX, drawY, star.size, alpha);
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = section.getBoundingClientRect();
      mouse.x = event.clientX - bounds.left;
      mouse.y = event.clientY - bounds.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
    };

    resize();
    animationFrameId = window.requestAnimationFrame(animate);

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section ref={sectionRef} className="header-hero">
      <motion.div style={{ opacity: starsOpacity }} className="absolute inset-0 z-[1]">
        <canvas ref={canvasRef} className="header-canvas" aria-hidden="true" />
        <div className="header-vignette" aria-hidden="true" />
      </motion.div>
      <div className="header-copy">
        <h1>Hey ! I&apos;m OxyToan</h1>
        <p>A software developer</p>
      </div>
    </section>
  );
}
