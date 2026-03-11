import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import EditableText from "../components/EditableText";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   SKILLS SECTION — Cinematic floating-text grid with random stagger reveals
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── SVG icon components ──────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   ADD SKILL MODAL — lightweight portal for adding a new skill
   ═════════════════════════════════════════════════════════════════════════ */

function AddSkillModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("80");
  const backdropRef = useRef(null);
  const panelRef = useRef(null);

  /* Animate in */
  useEffect(() => {
    if (backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      );
    }
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 24, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.4)",
          delay: 0.06,
        },
      );
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Animate out */
  const animateOut = useCallback((cb) => {
    const tl = gsap.timeline({ onComplete: cb });
    if (panelRef.current) {
      tl.to(
        panelRef.current,
        { opacity: 0, y: 16, scale: 0.97, duration: 0.22, ease: "power2.in" },
        0,
      );
    }
    if (backdropRef.current) {
      tl.to(backdropRef.current, { opacity: 0, duration: 0.22 }, 0);
    }
  }, []);

  const handleClose = useCallback(
    () => animateOut(onClose),
    [animateOut, onClose],
  );

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, Math.min(100, Math.max(0, parseInt(level, 10) || 80)));
    animateOut(onClose);
  }, [name, level, onAdd, animateOut, onClose]);

  /* Escape key */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10001,
          background: "rgba(5,5,8,0.8)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add skill"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 10002,
          width: "min(400px, calc(100vw - 32px))",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(13,13,20,0.96)",
          boxShadow:
            "0 20px 72px rgba(0,0,0,0.55), 0 0 32px rgba(200,169,110,0.05)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.1rem 1.4rem",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Add Skill
          </h3>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <XIcon />
          </button>
        </div>

        {/* Fields */}
        <div
          style={{
            padding: "1.3rem 1.4rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.1rem",
          }}
        >
          {/* Name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <label
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
              }}
            >
              Skill Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                lineHeight: 1.65,
                outline: "none",
                transition: "border-color 0.2s ease, background 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(200,169,110,0.35)";
                e.currentTarget.style.background = "rgba(255,255,255,0.055)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            />
          </div>

          {/* Level */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <label
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
              }}
            >
              Level (0–100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                lineHeight: 1.65,
                outline: "none",
                transition: "border-color 0.2s ease, background 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(200,169,110,0.35)";
                e.currentTarget.style.background = "rgba(255,255,255,0.055)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.6rem",
            padding: "0.9rem 1.4rem",
            borderTop: "1px solid rgba(255,255,255,0.055)",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: "0.5rem 1.15rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "0.5rem 1.35rem",
              borderRadius: "8px",
              border: "1px solid rgba(200,169,110,0.3)",
              background: "rgba(200,169,110,0.1)",
              color: "var(--accent)",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(200,169,110,0.2)";
              e.currentTarget.style.boxShadow =
                "0 0 18px rgba(200,169,110,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(200,169,110,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Add
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   SKILL CHIP — individual floating-text element with hover glow
   ═════════════════════════════════════════════════════════════════════════ */

function SkillChip({ skill, index, isEditMode, onRemove }) {
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
      <EditableText
        path={`skills.${index}.name`}
        as="span"
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
      </EditableText>

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

      {/* Edit mode: remove button */}
      {isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Remove "${skill.name}"?`)) onRemove();
          }}
          aria-label={`Remove ${skill.name}`}
          title={`Remove ${skill.name}`}
          style={{
            width: 22,
            height: 22,
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(13,13,20,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "#f43f5e",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            flexShrink: 0,
            marginLeft: "0.1rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(244,63,94,0.12)";
            e.currentTarget.style.borderColor = "rgba(244,63,94,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(13,13,20,0.75)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          }}
        >
          <TrashIcon />
        </button>
      )}

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
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Skills() {
  const { data, isEditMode, updateField } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);
  const gridRef = useRef(null);
  const actionsRef = useRef(null);

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

      /* ---------- Actions row reveal ---------- */
      if (actionsRef.current) {
        gsap.set(actionsRef.current, { opacity: 0, y: 24 });
        gsap.to(actionsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "expo.out",
          scrollTrigger: {
            trigger: actionsRef.current,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [data, isEditMode] },
  );

  /* ── Add / Remove handlers ──────────────────────────────── */
  const handleAdd = useCallback(
    (name, level) => {
      const next = { id: Date.now(), name, level };
      updateField("skills", [...(data.skills || []), next]);
    },
    [data, updateField],
  );

  const handleRemove = useCallback(
    (i) => {
      updateField(
        "skills",
        data.skills.filter((_, idx) => idx !== i),
      );
    },
    [data, updateField],
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
        {skills.map((skill, i) => (
          <SkillChip
            key={skill.id}
            skill={skill}
            index={i}
            isEditMode={isEditMode}
            onRemove={() => handleRemove(i)}
          />
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

      {/* ── Edit-mode: add skill button ────────────────────── */}
      {isEditMode && (
        <div
          ref={actionsRef}
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "0.75rem",
            marginTop: "2.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.6rem 1.4rem",
              borderRadius: "10px",
              border: "1px dashed rgba(200,169,110,0.28)",
              background: "rgba(200,169,110,0.04)",
              color: "var(--accent)",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(200,169,110,0.1)";
              e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)";
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(200,169,110,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(200,169,110,0.04)";
              e.currentTarget.style.borderColor = "rgba(200,169,110,0.28)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <PlusIcon /> Add Skill
          </button>
        </div>
      )}

      {/* ── Add skill modal ────────────────────────────────── */}
      {showAddModal && (
        <AddSkillModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

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
