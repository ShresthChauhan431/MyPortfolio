import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM CURSOR — Cinematic dot + ring cursor (desktop only)

   - Dot: follows mouse position exactly via mousemove
   - Ring: follows with lerp (linear interpolation) via gsap.ticker
   - Hover over links/buttons: ring expands + fills slightly
   - Click: brief scale pulse on both elements
   - Hidden on touch devices / mobile via pointer media query
   ═══════════════════════════════════════════════════════════════════════════ */

/* Selectors for elements that trigger the "hover expand" effect */
const HOVER_SELECTORS = [
  "a",
  "button",
  "[role='button']",
  "input[type='submit']",
  ".nav-hoverable",
  ".glass-card",
  ".editable-text--active",
].join(", ");

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  /* Mouse position tracked outside React state for perf */
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);
  const isHovering = useRef(false);
  const tickerRef = useRef(null);

  /* ── Show / Hide cursor when entering / leaving viewport ── */
  const showCursor = useCallback(() => {
    if (isVisible.current) return;
    isVisible.current = true;
    if (dotRef.current) gsap.set(dotRef.current, { opacity: 1 });
    if (ringRef.current) gsap.set(ringRef.current, { opacity: 1 });
  }, []);

  const hideCursor = useCallback(() => {
    isVisible.current = false;
    if (dotRef.current) gsap.set(dotRef.current, { opacity: 0 });
    if (ringRef.current) gsap.set(ringRef.current, { opacity: 0 });
  }, []);

  /* ── Mouse move: update dot position immediately ────────── */
  const handleMouseMove = useCallback(
    (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (dotRef.current) {
        gsap.set(dotRef.current, {
          x: e.clientX,
          y: e.clientY,
        });
      }

      showCursor();
    },
    [showCursor],
  );

  /* ── Click pulse ────────────────────────────────────────── */
  const handleMouseDown = useCallback(() => {
    if (dotRef.current) {
      gsap.to(dotRef.current, {
        scale: 0.5,
        duration: 0.1,
        ease: "power2.out",
      });
    }
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        scale: isHovering.current ? 1.8 : 0.7,
        duration: 0.1,
        ease: "power2.out",
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (dotRef.current) {
      gsap.to(dotRef.current, {
        scale: isHovering.current ? 0 : 1,
        duration: 0.25,
        ease: "expo.out",
      });
    }
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        scale: isHovering.current ? 2 : 1,
        duration: 0.4,
        ease: "expo.out",
      });
    }
  }, []);

  /* ── Hover detection via event delegation ───────────────── */
  const handleMouseOver = useCallback((e) => {
    if (e.target.closest(HOVER_SELECTORS)) {
      if (isHovering.current) return;
      isHovering.current = true;
      /* Ring: expand + fill */
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          scale: 2,
          borderColor: "rgba(200, 169, 110, 0.35)",
          backgroundColor: "rgba(200, 169, 110, 0.06)",
          duration: 0.35,
          ease: "expo.out",
        });
      }
      /* Dot: shrink / hide inside the ring */
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          scale: 0,
          duration: 0.25,
          ease: "expo.out",
        });
      }
    }
  }, []);

  const handleMouseOut = useCallback((e) => {
    if (e.target.closest(HOVER_SELECTORS)) {
      /* Only reset if we're not entering another hoverable */
      if (e.relatedTarget && e.relatedTarget.closest?.(HOVER_SELECTORS)) return;
      isHovering.current = false;
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          scale: 1,
          borderColor: "rgba(200, 169, 110, 0.4)",
          backgroundColor: "transparent",
          duration: 0.4,
          ease: "expo.out",
        });
      }
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "expo.out",
        });
      }
    }
  }, []);

  /* ── Setup & teardown ───────────────────────────────────── */
  useEffect(() => {
    /* Skip on touch devices / mobile — use matchMedia for detection */
    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;

    /* Skip entirely if user prefers reduced motion */
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReduced.matches) return;

    /* Add cursor: none to body */
    document.body.classList.add("custom-cursor-active");

    /* Event listeners */
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseleave", hideCursor);
    document.addEventListener("mouseenter", showCursor);

    /* GSAP ticker: ring follows with lerp */
    const lerpSpeed = 0.12;

    const ticker = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * lerpSpeed;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * lerpSpeed;

      if (ringRef.current) {
        gsap.set(ringRef.current, {
          x: ringPos.current.x,
          y: ringPos.current.y,
        });
      }
    };

    tickerRef.current = ticker;
    gsap.ticker.add(ticker);

    return () => {
      document.body.classList.remove("custom-cursor-active");

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", hideCursor);
      document.removeEventListener("mouseenter", showCursor);

      if (tickerRef.current) {
        gsap.ticker.remove(tickerRef.current);
      }
    };
  }, [
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseOver,
    handleMouseOut,
    hideCursor,
    showCursor,
  ]);

  return (
    <>
      {/* ── Dot: small center dot, follows exactly ──────────── */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="custom-cursor-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: 0,
          transform: "translate(-50%, -50%)",
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />

      {/* ── Ring: larger circle, follows with lag ───────────── */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="custom-cursor-ring"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1.5px solid rgba(200, 169, 110, 0.4)",
          background: "transparent",
          pointerEvents: "none",
          zIndex: 99998,
          opacity: 0,
          transform: "translate(-50%, -50%)",
          willChange: "transform",
          transition: "border-color 0.35s ease, background-color 0.35s ease",
        }}
      />

      {/* ── Scoped styles ──────────────────────────────────── */}
      <style>{`
        /* Hide default cursor on desktop when custom cursor is active */
        .custom-cursor-active,
        .custom-cursor-active * {
          cursor: none !important;
        }

        /* Never show custom cursor on touch / mobile devices */
        @media (pointer: coarse) {
          .custom-cursor-dot,
          .custom-cursor-ring {
            display: none !important;
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .custom-cursor-dot,
          .custom-cursor-ring {
            display: none !important;
          }
          .custom-cursor-active,
          .custom-cursor-active * {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
}

export default CustomCursor;
