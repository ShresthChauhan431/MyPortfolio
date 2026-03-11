import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   SKILLS SECTION — Cinematic floating-text grid with random stagger reveals
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═════════════════════════════════════════════════════════════════════════
   SKILL CHIP — individual floating-text element with hover glow
   ═════════════════════════════════════════════════════════════════════════ */

function SkillChip({ skill }) {
  const [hovered, setHovered] = useState(false);
  const chipRef = useRef(null);

  /* Magnetic micro-float on hover */
  useEffect(() => {
    if (!chipRef.current) return;
    if (hovered) {
      gsap.to(chipRef.current, {
        y: -3,
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.to(chipRef.current, {
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [hovered]);

  /* Derive a font-size variant from the level — higher level = larger text.
     We map level 0–100 → 1.1rem–2.6rem in a smooth range. */
  const level = Math.min(100, Math.max(0, Number(skill.level) || 50));
  const fontSize = `${1.1 + (level / 100) * 1.5}rem`;

  return (
    <div
      ref={chipRef}
      className="skill-chip"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.55rem 0.15rem",
        cursor: "default",
        willChange: "transform",
      }}
    >
      {/* Skill name */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize,
          fontWeight: 400,
          fontStyle: "italic",
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
          color: hovered ? "var(--accent)" : "var(--text-primary)",
          transition: "color 0.35s ease, text-shadow 0.4s ease",
          textShadow: hovered
            ? "0 0 28px rgba(200,169,110,0.3), 0 0 8px rgba(200,169,110,0.15)"
            : "none",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {skill.name}
      </span>

      {/* Level indicator — subtle superscript number */}
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: hovered ? "var(--accent)" : "var(--text-dim)",
          opacity: hovered ? 0.8 : 0.45,
          transition: "color 0.35s ease, opacity 0.35s ease",
          alignSelf: "flex-start",
          marginTop: "0.15rem",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {level}
      </span>

      {/* Hover underline accent */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)",
          opacity: hovered ? 0.4 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   MAIN SKILLS SECTION
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * Seeded pseudo-random number generator (mulberry32).
 * Gives us deterministic "random" delays so the stagger feels organic
 * but is stable across re-renders.
 */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Skills() {
  const { data } = usePortfolio();

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);
  const gridRef = useRef(null);

  /* ── GSAP Animations ────────────────────────────────────── */
  useGSAP(
    () => {
      if (!sectionRef.current || !data) return;

      /* ---------- Header reveal ---------- */
      const headerEls = [labelRef.current, titleRef.current].filter(Boolean);
      if (headerEls.length) {
        gsap.set(headerEls, { opacity: 0, y: 40 });
        gsap.to(headerEls, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: headingRef.current || sectionRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* ---------- Skill chips: random stagger reveal ---------- */
      const chips = gridRef.current?.querySelectorAll(".skill-chip");
      if (chips?.length) {
        /* Build a per-chip random delay array from a seeded PRNG
           so the "randomness" is deterministic and doesn't jump on
           hot-reload or re-render. */
        const rng = mulberry32(42);
        const delays = Array.from(chips).map(() => rng() * 0.6);

        gsap.set(chips, { opacity: 0, scale: 0.8 });

        /* Use ScrollTrigger with toggleActions so chips also reverse
           when the section scrolls back out. The trigger fires when
           the section is ~60% into the viewport. */
        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 60%",
          onEnter: () => {
            chips.forEach((chip, i) => {
              gsap.to(chip, {
                opacity: 1,
                scale: 1,
                duration: 0.7,
                delay: 0.3 + delays[i],
                ease: "back.out(1.6)",
                overwrite: true,
              });
            });
          },
          onLeaveBack: () => {
            chips.forEach((chip, i) => {
              gsap.to(chip, {
                opacity: 0,
                scale: 0.8,
                duration: 0.35,
                delay: delays[i] * 0.3,
                ease: "power2.in",
                overwrite: true,
              });
            });
          },
        });

        /* Cleanup helper for GSAP context */
        return () => st.kill();
      }
    },
    { scope: sectionRef, dependencies: [data] },
  );

  /* ── Guard ──────────────────────────────────────────────── */
  if (!data) return null;
  const skills = data.skills || [];

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="section"
      style={{
        overflow: "hidden",
        /* Vertically centered by .section, we also align left */
        alignItems: "flex-start",
      }}
    >
      {/* ── Section heading ────────────────────────────────── */}
      <div ref={headingRef} style={{ marginBottom: "3.5rem" }}>
        <div ref={labelRef} className="section__label" style={{ opacity: 0 }}>
          <span>Skills</span>
        </div>
        <h2
          ref={titleRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 5.5vw, 4.8rem)",
            fontWeight: 300,
            color: "var(--text-primary)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            opacity: 0,
          }}
        >
          Tools &{" "}
          <span className="text-gold-gradient" style={{ fontStyle: "italic" }}>
            Technologies
          </span>
        </h2>
      </div>

      {/* ── Floating-text skill grid ───────────────────────── */}
      <div
        ref={gridRef}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.6rem 1.8rem",
          alignItems: "baseline",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {skills.map((skill) => (
          <SkillChip key={skill.id} skill={skill} />
        ))}

        {/* Decorative separator dots between words (purely visual) */}
        {skills.length > 0 && (
          <div
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.55rem 0.3rem",
              opacity: 0.12,
            }}
          >
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Ambient decorative glow (behind the grid) ──────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "25%",
          transform: "translate(-50%, -50%)",
          width: "min(700px, 80vw)",
          height: "min(700px, 80vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,169,110,0.045) 0%, rgba(200,169,110,0.015) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Scoped styles ──────────────────────────────────── */}
      <style>{`
        /* Ensure the ambient glow sits behind text content */
        #skills > *:not([aria-hidden="true"]) {
          position: relative;
          z-index: 1;
        }

        /* Subtle idle float animation applied per-chip for organic feel */
        @keyframes skill-idle-drift {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        /* Only apply idle animation on desktop where it's not distracting */
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .skill-chip:nth-child(3n) {
            animation: skill-idle-drift 6s ease-in-out infinite;
            animation-delay: 0s;
          }
          .skill-chip:nth-child(3n+1) {
            animation: skill-idle-drift 7s ease-in-out infinite;
            animation-delay: -2s;
          }
          .skill-chip:nth-child(3n+2) {
            animation: skill-idle-drift 8s ease-in-out infinite;
            animation-delay: -4s;
          }
        }

        /* Reduce motion: disable all animations */
        @media (prefers-reduced-motion: reduce) {
          .skill-chip {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Skills;
