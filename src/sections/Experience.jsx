import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   EXPERIENCE SECTION — Cinematic vertical timeline with scroll-driven
   line draw, alternating left/right cards, and dot pulse animations.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═════════════════════════════════════════════════════════════════════════
   TIMELINE ITEM — single experience entry card
   ═════════════════════════════════════════════════════════════════════════ */

function TimelineItem({ exp, side }) {
  const [hovered, setHovered] = useState(false);

  const isLeft = side === "left";

  return (
    <div
      className="tl-item"
      data-side={side}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        /* On desktop: left items align right, right items align left,
           both centering around the spine. On mobile this collapses. */
        justifyContent: isLeft ? "flex-end" : "flex-start",
        width: "100%",
        paddingBottom: "3rem",
      }}
    >
      {/* ── The dot on the center line ────────────────────── */}
      <div
        className="tl-dot"
        style={{
          position: "absolute",
          /* Positioned in CSS via .tl-dot for left/right calc */
          top: "0.4rem",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: hovered ? "var(--accent)" : "var(--bg-deep)",
          border: "1.5px solid var(--accent)",
          boxShadow: hovered
            ? "0 0 22px var(--accent-strong), 0 0 6px var(--accent-glow)"
            : "0 0 10px var(--accent-glow), 0 0 3px var(--accent-glow)",
          transition:
            "background 0.3s ease, box-shadow 0.4s ease, transform 0.3s ease",
          transform: hovered ? "scale(1.25)" : "scale(1)",
          zIndex: 2,
        }}
      />

      {/* ── Card ──────────────────────────────────────────── */}
      <div
        className="tl-card"
        style={{
          position: "relative",
          width: "calc(50% - 40px)",
          padding: "1.25rem 1.5rem",
          borderRadius: "12px",
          border: `1px solid ${hovered ? "rgba(200,169,110,0.18)" : "rgba(255,255,255,0.05)"}`,
          background: hovered ? "rgba(13,13,20,0.55)" : "rgba(13,13,20,0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition:
            "border-color 0.35s ease, background 0.35s ease, box-shadow 0.5s ease",
          boxShadow: hovered
            ? "0 8px 36px rgba(0,0,0,0.3), 0 0 28px rgba(200,169,110,0.05)"
            : "none",
        }}
      >
        {/* Header: role + year */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "0.3rem",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {exp.role}
          </h3>

          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "var(--accent)",
              opacity: 0.7,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {exp.year}
          </span>
        </div>

        {/* Company */}
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "var(--text-muted)",
            letterSpacing: "0.02em",
            marginBottom: "0.7rem",
          }}
        >
          {exp.company}
        </span>

        {/* Description */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.84rem",
            lineHeight: 1.72,
            color: "var(--text-muted)",
          }}
        >
          {exp.desc}
        </p>

        {/* Decorative connector line from card to dot */}
        <div
          aria-hidden="true"
          className="tl-connector"
          style={{
            position: "absolute",
            top: "0.85rem",
            width: "28px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.15) 50%, transparent 100%)",
            opacity: hovered ? 0.8 : 0.3,
            transition: "opacity 0.35s ease",
            /* Side-specific positioning handled in CSS below */
          }}
        />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   MAIN EXPERIENCE SECTION
   ═════════════════════════════════════════════════════════════════════════ */

function Experience() {
  const { data } = usePortfolio();
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);
  const timelineRef = useRef(null);
  const lineRef = useRef(null);

  /* ── Responsive detection ───────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

      /* ---------- Center line: scroll-driven scaleY draw ---------- */
      if (lineRef.current && timelineRef.current) {
        gsap.set(lineRef.current, {
          scaleY: 0,
          transformOrigin: "top center",
        });

        gsap.to(lineRef.current, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 75%",
            end: "bottom 25%",
            scrub: 0.8,
          },
        });
      }

      /* ---------- Timeline items: slide + fade from sides ---------- */
      const items = timelineRef.current?.querySelectorAll(".tl-item");
      if (items?.length) {
        items.forEach((item) => {
          const side = item.dataset.side;
          /* Desktop: slide from the side the card is on.
             Mobile: always slide from left since everything stacks left. */
          const xFrom = isMobile ? -40 : side === "left" ? -60 : 60;

          gsap.set(item, { opacity: 0, x: xFrom });

          gsap.to(item, {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        });
      }

      /* ---------- Dots: pulse animation when entering view ---------- */
      const dots = timelineRef.current?.querySelectorAll(".tl-dot");
      if (dots?.length) {
        dots.forEach((dot) => {
          ScrollTrigger.create({
            trigger: dot,
            start: "top 80%",
            onEnter: () => {
              gsap.fromTo(
                dot,
                { scale: 1 },
                {
                  scale: 1.6,
                  duration: 0.3,
                  ease: "power2.out",
                  yoyo: true,
                  repeat: 1,
                },
              );
            },
            once: true,
          });
        });
      }
    },
    { scope: sectionRef, dependencies: [data, isMobile] },
  );

  /* ── Guard ──────────────────────────────────────────────── */
  if (!data) return null;
  const experience = data.experience || [];

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="section"
      style={{
        overflow: "hidden",
        alignItems: "center",
      }}
    >
      {/* ── Section heading ────────────────────────────────── */}
      <div
        ref={headingRef}
        style={{
          marginBottom: "3.5rem",
          width: "100%",
          maxWidth: "52rem",
        }}
      >
        <div ref={labelRef} className="section__label" style={{ opacity: 0 }}>
          <span>Experience</span>
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
          Where I&rsquo;ve{" "}
          <span className="text-gold-gradient" style={{ fontStyle: "italic" }}>
            Been
          </span>
        </h2>
      </div>

      {/* ── Timeline container ─────────────────────────────── */}
      <div
        ref={timelineRef}
        className="tl-container"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "52rem",
        }}
      >
        {/* ── The center vertical line (GSAP scaleY target) ── */}
        <div
          ref={lineRef}
          aria-hidden="true"
          className="tl-spine"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "1px",
            background:
              "linear-gradient(180deg, var(--accent) 0%, rgba(200,169,110,0.3) 50%, var(--accent) 100%)",
            /* Center position handled in CSS */
            zIndex: 1,
            transformOrigin: "top center",
          }}
        />

        {/* ── Experience entries ───────────────────────────── */}
        {experience.map((exp, i) => (
          <TimelineItem
            key={exp.id}
            exp={exp}
            side={isMobile ? "right" : i % 2 === 0 ? "left" : "right"}
          />
        ))}
      </div>

      {/* ── Scoped CSS ─────────────────────────────────────── */}
      <style>{`
        /* ═══ DESKTOP TIMELINE (≥768px) ═══════════════════════ */

        /* Spine: centered horizontally */
        .tl-spine {
          left: 50%;
          transform: translateX(-50%);
        }

        /* Dot: centered on spine */
        .tl-dot {
          left: 50%;
          transform: translateX(-50%);
        }

        /* Card widths are set inline (50% - 40px).
           Left-side cards sit on the left half, right-side on the right. */
        .tl-item[data-side="left"] {
          padding-right: calc(50% + 26px);
        }
        .tl-item[data-side="right"] {
          padding-left: calc(50% + 26px);
        }

        /* Connector line from card edge to dot */
        .tl-item[data-side="left"] .tl-connector {
          right: -28px;
        }
        .tl-item[data-side="right"] .tl-connector {
          left: -28px;
        }

        /* Card takes full available width on its side */
        .tl-item[data-side="left"] .tl-card,
        .tl-item[data-side="right"] .tl-card {
          width: 100%;
        }

        /* Remove the last item's bottom padding */
        .tl-item:last-child {
          padding-bottom: 0;
        }

        /* ═══ MOBILE TIMELINE (<768px) ════════════════════════ */

        @media (max-width: 767px) {
          /* Spine: shifted to the left edge */
          .tl-spine {
            left: 8px;
            transform: none;
          }

          /* Dot: on the left spine */
          .tl-dot {
            left: 1px;
            transform: none;
          }

          /* All items flow to the right of the spine */
          .tl-item[data-side="left"],
          .tl-item[data-side="right"] {
            padding-left: 2.5rem;
            padding-right: 0;
            justify-content: flex-start;
          }

          /* Card spans full width */
          .tl-item[data-side="left"] .tl-card,
          .tl-item[data-side="right"] .tl-card {
            width: 100%;
          }

          /* Connector always on the left */
          .tl-item[data-side="left"] .tl-connector,
          .tl-item[data-side="right"] .tl-connector {
            left: -20px;
            right: auto;
            width: 16px;
          }

          /* Slightly smaller dot on mobile */
          .tl-dot {
            width: 12px !important;
            height: 12px !important;
          }

          /* Adjust role font for smaller screens */
          .tl-card h3 {
            font-size: 1.15rem !important;
          }

          /* Stack the header on mobile */
          .tl-card > div:first-child {
            flex-direction: column;
            gap: 0.15rem !important;
          }
        }

        /* ═══ DOT PULSE KEYFRAME (used by GSAP as fallback visual) ══ */

        @keyframes tl-dot-glow {
          0%, 100% {
            box-shadow:
              0 0 10px var(--accent-glow),
              0 0 3px var(--accent-glow);
          }
          50% {
            box-shadow:
              0 0 22px var(--accent-strong),
              0 0 8px var(--accent-glow);
          }
        }

        /* Subtle continuous pulse for dots after they've entered */
        .tl-dot {
          animation: tl-dot-glow 3s ease-in-out infinite;
          animation-play-state: paused;
        }

        /* When the timeline item enters view (GSAP sets opacity: 1),
           start the idle glow */
        .tl-item[style*="opacity: 1"] .tl-dot,
        .tl-item:hover .tl-dot {
          animation-play-state: running;
        }

        /* ═══ REDUCED MOTION ═════════════════════════════════ */

        @media (prefers-reduced-motion: reduce) {
          .tl-dot {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Experience;
