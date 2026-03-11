import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR — Thin accent-color line fixed at the very top of
   the viewport. Width animates from 0% to 100% as the user scrolls through
   the entire page.

   - Uses GSAP ScrollTrigger with scrub for buttery-smooth interpolation
   - Respects prefers-reduced-motion (shows static bar instead of animating)
   - Hidden until the loading screen finishes (via delayed visibility)
   - z-index sits above the navbar so it's always visible
   ═══════════════════════════════════════════════════════════════════════════ */

function ScrollProgress() {
  const barRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    if (!barRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* ── Reduced motion: just show a static subtle bar ─────── */
    if (prefersReduced) {
      barRef.current.style.width = "100%";
      barRef.current.style.opacity = "0.25";
      return;
    }

    /* ── Normal: scrub width with ScrollTrigger ────────────── */
    const ctx = gsap.context(() => {
      gsap.set(barRef.current, { scaleX: 0 });
      if (glowRef.current) {
        gsap.set(glowRef.current, { scaleX: 0 });
      }

      gsap.to(barRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });

      /* The glow follows the same progress but with a slight visual delay */
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Track: full-width container at the very top ────── */}
      <div
        aria-hidden="true"
        className="scroll-progress-track"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 99991,
          pointerEvents: "none",
          background: "transparent",
          overflow: "hidden",
        }}
      >
        {/* ── Glow layer (blurred, behind the main bar) ────── */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            top: -1,
            left: 0,
            width: "100%",
            height: 6,
            background:
              "linear-gradient(90deg, rgba(200,169,110,0) 0%, rgba(200,169,110,0.35) 40%, rgba(200,169,110,0.5) 100%)",
            transformOrigin: "left center",
            filter: "blur(3px)",
            opacity: 0.5,
          }}
        />

        {/* ── Main accent bar ──────────────────────────────── */}
        <div
          ref={barRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, rgba(200,169,110,0.15) 0%, var(--accent, #c8a96e) 50%, #e8d5a8 100%)",
            transformOrigin: "left center",
          }}
        />
      </div>

      {/* ── Responsive & reduced-motion styles ─────────────── */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .scroll-progress-track {
            opacity: 0.25;
          }
        }

        /* Slightly thicker on mobile for visibility with fat fingers */
        @media (max-width: 480px) {
          .scroll-progress-track {
            height: 3px !important;
          }
        }
      `}</style>
    </>
  );
}

export default ScrollProgress;
