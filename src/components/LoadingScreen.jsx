import { useRef, useEffect } from "react";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SCREEN — Cinematic intro with initials + clip-path wipe exit

   Props:
     name       — full name from portfolio data (used to extract initials)
     onComplete — callback fired after the exit animation finishes;
                  App uses this to unlock scrolling and trigger Hero entrance
   ═══════════════════════════════════════════════════════════════════════════ */

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function LoadingScreen({ name, onComplete }) {
  const wrapperRef = useRef(null);
  const initialsRef = useRef(null);
  const lineRef = useRef(null);
  const subtextRef = useRef(null);
  const glowRef = useRef(null);

  const initials = getInitials(name);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* ── Reduced motion: skip entirely ─────────────────────── */
    if (prefersReduced) {
      if (wrapperRef.current) {
        wrapperRef.current.style.display = "none";
      }
      onComplete?.();
      return;
    }

    /* ── Lock scroll while loading screen is visible ───────── */
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      /* ---- Initial states ---- */
      gsap.set(initialsRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 20,
      });
      gsap.set(lineRef.current, { scaleX: 0, opacity: 0 });
      gsap.set(subtextRef.current, { opacity: 0, y: 10 });
      gsap.set(glowRef.current, { scale: 0.5, opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          onComplete?.();
        },
      });

      /* ---- Phase 1: Entrance (0 → 0.8s) ---- */

      /* Glow fades in behind the initials */
      tl.to(
        glowRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        0,
      );

      /* Initials scale + fade in */
      tl.to(
        initialsRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          ease: "expo.out",
        },
        0.1,
      );

      /* Horizontal accent line draws outward */
      tl.to(
        lineRef.current,
        {
          scaleX: 1,
          opacity: 0.5,
          duration: 0.5,
          ease: "power3.inOut",
        },
        0.4,
      );

      /* Small subtitle text fades in */
      tl.to(
        subtextRef.current,
        {
          opacity: 0.5,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        0.6,
      );

      /* ---- Phase 2: Hold (brief pause for impact) ---- */
      tl.to({}, { duration: 0.5 });

      /* ---- Phase 3: Exit with clip-path wipe (≈0.7s) ---- */

      /* First: content fades up slightly */
      tl.to(
        [initialsRef.current, lineRef.current, subtextRef.current],
        {
          opacity: 0,
          y: -20,
          duration: 0.35,
          ease: "power2.in",
          stagger: 0.03,
        },
      );

      /* Glow shrinks out */
      tl.to(
        glowRef.current,
        {
          scale: 0.3,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        },
        "<",
      );

      /* Clip-path wipe: circle closes from center to reveal the page behind */
      tl.to(
        wrapperRef.current,
        {
          clipPath: "circle(0% at 50% 50%)",
          duration: 0.65,
          ease: "power3.inOut",
        },
        "<0.1",
      );

      /* Finally: remove from DOM flow */
      tl.set(wrapperRef.current, { display: "none" });
    });

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99990,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-deep, #050508)",
        clipPath: "circle(150% at 50% 50%)",
        willChange: "clip-path",
      }}
    >
      {/* Ambient glow */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(500px, 80vw)",
          height: "min(500px, 80vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,169,110,0.1) 0%, rgba(200,169,110,0.03) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Initials display */}
      <span
        ref={initialsRef}
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "clamp(3.5rem, 10vw, 7rem)",
          fontWeight: 300,
          letterSpacing: "0.12em",
          color: "var(--text-primary, #f0ede8)",
          position: "relative",
          zIndex: 1,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {initials}
      </span>

      {/* Horizontal accent line */}
      <div
        ref={lineRef}
        style={{
          width: "min(120px, 30vw)",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--accent, #c8a96e), transparent)",
          marginTop: "1.25rem",
          transformOrigin: "center center",
        }}
      />

      {/* Subtitle */}
      <span
        ref={subtextRef}
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.6rem",
          fontWeight: 500,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--text-dim, #3e3e4a)",
          marginTop: "1rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        Loading
      </span>
    </div>
  );
}

export default LoadingScreen;
