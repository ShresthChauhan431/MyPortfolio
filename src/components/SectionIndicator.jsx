import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SECTIONS from "../data/sections.js";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION INDICATOR — Fixed right-side "01 / 06" counter that updates
   as the user scrolls through sections. Uses GSAP ScrollTrigger for
   tracking and animated number transitions.

   Hides on mobile (≤ 768px) to avoid clutter on small viewports.
   Respects prefers-reduced-motion by skipping number transitions.
   ═══════════════════════════════════════════════════════════════════════════ */

function padNumber(n) {
  return String(n).padStart(2, "0");
}

function SectionIndicator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const wrapperRef = useRef(null);
  const numberRef = useRef(null);
  const labelRef = useRef(null);
  const prevIndexRef = useRef(0);

  const total = SECTIONS.length;

  /* ── Show after loading screen finishes (small delay) ───── */
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  /* ── ScrollTrigger: track active section ────────────────── */
  useGSAP(
    () => {
      SECTIONS.forEach(({ id }, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top 40%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveIndex(index);
            }
          },
        });
      });
    },
    { dependencies: [] },
  );

  /* ── Animate number change ──────────────────────────────── */
  useEffect(() => {
    if (prevIndexRef.current === activeIndex) return;
    prevIndexRef.current = activeIndex;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced || !numberRef.current || !labelRef.current) return;

    /* Number: brief scale pulse + fade transition */
    gsap.fromTo(
      numberRef.current,
      { opacity: 0, y: activeIndex > prevIndexRef.current ? 8 : -8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "expo.out",
        overwrite: true,
      },
    );

    /* Label: slide in */
    gsap.fromTo(
      labelRef.current,
      { opacity: 0, x: 6 },
      {
        opacity: 0.45,
        x: 0,
        duration: 0.4,
        ease: "expo.out",
        overwrite: true,
      },
    );
  }, [activeIndex]);

  /* ── Entrance animation ─────────────────────────────────── */
  useGSAP(
    () => {
      if (!wrapperRef.current || !visible) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReduced) {
        gsap.set(wrapperRef.current, { opacity: 1 });
        return;
      }

      gsap.set(wrapperRef.current, { opacity: 0, x: 20 });
      gsap.to(wrapperRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "expo.out",
      });
    },
    { dependencies: [visible] },
  );

  const currentSection = SECTIONS[activeIndex] || SECTIONS[0];

  return (
    <>
      <div
        ref={wrapperRef}
        aria-hidden="true"
        className="section-indicator"
        style={{
          position: "fixed",
          right: "clamp(1rem, 3vw, 2.5rem)",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9985,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.35rem",
          opacity: visible ? undefined : 0,
          pointerEvents: "none",
          userSelect: "none",
          mixBlendMode: "difference",
        }}
      >
        {/* Current number / total */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.2em",
          }}
        >
          <span
            ref={numberRef}
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: "var(--text-primary, #f0ede8)",
            }}
          >
            {padNumber(activeIndex + 1)}
          </span>
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.6rem",
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "var(--text-dim, #3e3e4a)",
              lineHeight: 1,
            }}
          >
            / {padNumber(total)}
          </span>
        </div>

        {/* Section label */}
        <span
          ref={labelRef}
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.55rem",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-dim, #3e3e4a)",
            opacity: 0.45,
            lineHeight: 1,
          }}
        >
          {currentSection.label}
        </span>

        {/* Vertical progress pips */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginTop: "0.75rem",
          }}
        >
          {SECTIONS.map((section, i) => (
            <span
              key={section.id}
              style={{
                width: i === activeIndex ? 3 : 2,
                height: i === activeIndex ? 16 : 6,
                borderRadius: 2,
                background:
                  i === activeIndex
                    ? "var(--accent, #c8a96e)"
                    : "var(--text-dim, #3e3e4a)",
                opacity: i === activeIndex ? 0.8 : 0.25,
                transition:
                  "height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, width 0.4s ease, background 0.4s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Responsive: hide on mobile ────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .section-indicator {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .section-indicator span {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default SectionIndicator;
