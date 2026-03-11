import { useRef, useState, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTS SECTION — Cinematic card reveals + horizontal scroll
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Gradient placeholders for cards without images ───────────────────── */
const GRADIENTS = [
  "linear-gradient(145deg, #0f1923 0%, #162033 40%, #1a2744 100%)",
  "linear-gradient(145deg, #130f1e 0%, #1e1633 40%, #261a40 100%)",
  "linear-gradient(145deg, #1a1209 0%, #261c0f 40%, #33220a 100%)",
  "linear-gradient(145deg, #091a1a 0%, #0f2626 40%, #0a3333 100%)",
  "linear-gradient(145deg, #1a090f 0%, #26101a 40%, #331226 100%)",
  "linear-gradient(145deg, #0c1117 0%, #151d27 40%, #1c2836 100%)",
];

/* ── SVG icon components ──────────────────────────────────────────────── */

function ArrowUpRight() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   PROJECT CARD — dark glass card with cinematic hover
   ═════════════════════════════════════════════════════════════════════════ */

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const imgRef = useRef(null);

  const gradient = useMemo(() => GRADIENTS[index % GRADIENTS.length], [index]);

  /* Image zoom on hover via GSAP */
  useEffect(() => {
    if (!imgRef.current) return;
    gsap.to(imgRef.current, {
      scale: hovered ? 1.07 : 1,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [hovered]);

  const hasImage = Boolean(project.image);

  return (
    <article
      className="proj-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "rgba(13,13,20,0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${hovered ? "rgba(200,169,110,0.22)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: "14px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition:
          "border-color 0.4s ease, box-shadow 0.5s ease, transform 0.4s var(--ease-out-quart)",
        boxShadow: hovered
          ? "0 12px 48px rgba(0,0,0,0.35), 0 0 36px rgba(200,169,110,0.07)"
          : "0 4px 20px rgba(0,0,0,0.18)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        willChange: "transform, box-shadow, border-color",
      }}
    >
      {/* ── Image / gradient placeholder ──────────────────── */}
      <div
        style={{
          width: "100%",
          height: "190px",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {hasImage ? (
          <img
            ref={imgRef}
            src={project.image}
            alt={project.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              willChange: "transform",
            }}
          />
        ) : (
          <div
            ref={imgRef}
            style={{
              width: "100%",
              height: "100%",
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              willChange: "transform",
            }}
          >
            {/* Decorative number watermark */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "5rem",
                fontWeight: 300,
                color: "rgba(255,255,255,0.04)",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}

        {/* Bottom gradient fade into card body */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50px",
            background:
              "linear-gradient(to top, rgba(13,13,20,0.55) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Card body ─────────────────────────────────────── */}
      <div
        style={{
          padding: "1.3rem 1.4rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
          flex: 1,
        }}
      >
        {/* Accent project number */}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            color: "var(--accent)",
            opacity: 0.5,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
          }}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.84rem",
            color: "var(--text-muted)",
            lineHeight: 1.72,
            flex: 1,
          }}
        >
          {project.description}
        </p>

        {/* Tags row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginTop: "auto",
            paddingTop: "0.45rem",
          }}
        >
          {(project.tags ?? []).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.58rem",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "var(--accent)",
                background: "rgba(200,169,110,0.07)",
                border: "1px solid rgba(200,169,110,0.1)",
                borderRadius: "100px",
                padding: "0.18rem 0.6rem",
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Project link */}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              marginTop: "0.35rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: "var(--accent)",
              textDecoration: "none",
              transition: "color 0.25s ease, gap 0.35s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.gap = "0.55rem";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.gap = "0.35rem";
            }}
          >
            View Project <ArrowUpRight />
          </a>
        )}
      </div>

      {/* ── Subtle luminance overlay on hover ─────────────── */}
      <div
        aria-hidden="true"
        className="proj-card__shine"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          opacity: hovered ? 1 : 0,
          background:
            "linear-gradient(135deg, rgba(200,169,110,0.025) 0%, transparent 45%, transparent 55%, rgba(200,169,110,0.015) 100%)",
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </article>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   MAIN PROJECTS SECTION
   ═════════════════════════════════════════════════════════════════════════ */

function Projects() {
  const { data } = usePortfolio();
  const [viewMode, setViewMode] = useState("desktop"); // "mobile" | "tablet" | "desktop"

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const labelRef = useRef(null);
  const titleDisplayRef = useRef(null);

  // Grid refs (mobile + tablet)
  const gridRef = useRef(null);
  // Horizontal scroll refs (desktop)
  const hScrollWrapRef = useRef(null);
  const hScrollTrackRef = useRef(null);

  /* ── Responsive breakpoint detection ────────────────────── */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setViewMode("mobile");
      else if (w < 1024) setViewMode("tablet");
      else setViewMode("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isHorizontal = viewMode === "desktop";

  /* ── GSAP Animations ────────────────────────────────────── */
  useGSAP(
    () => {
      if (!sectionRef.current || !data) return;

      /* ---------- Header reveal ---------- */
      const headerEls = [labelRef.current, titleDisplayRef.current].filter(
        Boolean,
      );
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

      /* ---------- Grid path (mobile + tablet) ---------- */
      if (!isHorizontal) {
        const cards = gridRef.current?.querySelectorAll(".proj-card");
        if (cards?.length) {
          gsap.set(cards, { opacity: 0, y: 50 });

          ScrollTrigger.batch(cards, {
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.85,
                stagger: 0.15,
                ease: "expo.out",
                overwrite: true,
              }),
            onLeaveBack: (batch) =>
              gsap.to(batch, {
                opacity: 0,
                y: 50,
                duration: 0.45,
                stagger: 0.08,
                ease: "power2.in",
                overwrite: true,
              }),
            start: "top 88%",
            end: "bottom 12%",
          });
        }
      }

      /* ---------- Horizontal scroll path (desktop) ---------- */
      if (isHorizontal) {
        const track = hScrollTrackRef.current;
        const wrap = hScrollWrapRef.current;
        if (!track || !wrap) return;

        const cards = track.querySelectorAll(".proj-card");
        if (!cards.length) return;

        gsap.set(cards, { opacity: 0, y: 40 });

        // We need to measure after fonts/images have loaded, so use a
        // small delay to ensure correct scroll widths.
        const measure = () => {
          const totalW = track.scrollWidth;
          const viewW = wrap.offsetWidth;
          const dist = totalW - viewW;

          if (dist <= 0) {
            // Not enough cards to scroll — just stagger-reveal them
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.15,
              ease: "expo.out",
              scrollTrigger: {
                trigger: wrap,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
            });
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: () => `+=${dist + viewW * 0.4}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // 1 — Cards stagger-reveal near the beginning
          tl.to(
            cards,
            {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.05,
              ease: "power2.out",
            },
            0,
          );

          // 2 — Horizontal slide
          tl.to(
            track,
            {
              x: () => -dist,
              ease: "none",
              duration: 1,
            },
            0.12,
          );
        };

        // Delay one frame so the DOM has settled
        const frame = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(frame);
      }
    },
    { scope: sectionRef, dependencies: [data, isHorizontal] },
  );

  /* ── Guard ──────────────────────────────────────────────── */
  if (!data) return null;
  const projects = data.projects || [];

  /* ── Cards list (shared between both layouts) ───────────── */
  const cardElements = projects.map((p, i) => (
    <div
      key={p.id}
      className="proj-card-slot"
      style={
        isHorizontal
          ? { width: "390px", flexShrink: 0, display: "flex" }
          : undefined
      }
    >
      <ProjectCard project={p} index={i} />
    </div>
  ));

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="section"
      style={{ overflow: "visible" }}
    >
      {/* ── Section heading ────────────────────────────────── */}
      <div
        ref={headingRef}
        style={{ marginBottom: isHorizontal ? "3.5rem" : "2.5rem" }}
      >
        <div ref={labelRef} className="section__label" style={{ opacity: 0 }}>
          <span>Projects</span>
        </div>
        <h2
          ref={titleDisplayRef}
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
          Selected{" "}
          <span className="text-gold-gradient" style={{ fontStyle: "italic" }}>
            Work
          </span>
        </h2>
      </div>

      {/* ── Grid layout (mobile + tablet) ──────────────────── */}
      {!isHorizontal && (
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns:
              viewMode === "tablet" ? "repeat(2, 1fr)" : "1fr",
            gap: "1.5rem",
            width: "100%",
            maxWidth: viewMode === "tablet" ? "900px" : "560px",
          }}
        >
          {cardElements}
        </div>
      )}

      {/* ── Horizontal scroll layout (desktop) ─────────────── */}
      {isHorizontal && (
        <div
          ref={hScrollWrapRef}
          style={{
            /* Break out of section padding so we can span full viewport */
            width: "100vw",
            marginLeft: "calc(-1 * var(--section-px))",
            overflow: "hidden",
            /* Enough height for the tallest card + breathing room */
            minHeight: "490px",
          }}
        >
          <div
            ref={hScrollTrackRef}
            style={{
              display: "flex",
              gap: "1.75rem",
              paddingLeft: "var(--section-px)",
              paddingRight: "var(--section-px)",
              width: "max-content",
              alignItems: "stretch",
            }}
          >
            {cardElements}
          </div>
        </div>
      )}

      {/* ── Scoped styles ──────────────────────────────────── */}
      <style>{`
        /* Card slots in grid mode should stretch to fill */
        .proj-card-slot {
          display: flex;
        }

        .proj-card {
          flex: 1;
          min-height: 0;
          cursor: default;
        }

        /* Make sure card children render above the shine overlay */
        .proj-card > *:not(.proj-card__shine) {
          position: relative;
          z-index: 1;
        }

        /* Responsive card widths in horizontal scroll */
        @media (min-width: 1024px) and (max-width: 1280px) {
          .proj-card-slot {
            width: 360px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Projects;
