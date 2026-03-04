"use client";

import { useEffect, useRef } from "react";

const BLACK_HOLE_EMOJI = "\u{1F319}";

export default function BlackHoleCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) {
      return;
    }

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!hasFinePointer) {
      return;
    }

    document.documentElement.classList.add("emoji-cursor-enabled");

    let rafId = 0;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isVisible = false;

    const render = () => {
      currentX = targetX;
      currentY = targetY;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      cursor.style.opacity = isVisible ? "1" : "0";
      rafId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      isVisible = true;
    };

    const handlePointerLeave = () => {
      isVisible = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerrawupdate", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);
    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerrawupdate", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      document.documentElement.classList.remove("emoji-cursor-enabled");
    };
  }, []);

  return (
    <div ref={cursorRef} className="emoji-blackhole-cursor" aria-hidden="true">
      {BLACK_HOLE_EMOJI}
    </div>
  );
}
