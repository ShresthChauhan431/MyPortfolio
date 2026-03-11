import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import EditableText from "../components/EditableText";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   EXPERIENCE SECTION — Cinematic vertical timeline with scroll-driven
   line draw, alternating left/right cards, and dot pulse animations.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── SVG Icons ────────────────────────────────────────────────────────── */

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
   ADD EXPERIENCE MODAL
   ═════════════════════════════════════════════════════════════════════════ */

function ModalField({ label, value, onChange, multiline, placeholder }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
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
        {label}
      </label>
      <Tag
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
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
          resize: multiline ? "vertical" : "none",
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
  );
}

function AddExperienceModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    role: "",
    company: "",
    year: "",
    desc: "",
  });

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
    const trimmed = form.role.trim();
    if (!trimmed) return;
    onAdd({
      role: trimmed,
      company: form.company.trim() || "Company",
      year: form.year.trim() || "20XX",
      desc: form.desc.trim(),
    });
    animateOut(onClose);
  }, [form, onAdd, animateOut, onClose]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

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
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add experience"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 10002,
          width: "min(480px, calc(100vw - 32px))",
          maxHeight: "88vh",
          overflowY: "auto",
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
            Add Experience
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
          <ModalField
            label="Role / Title"
            value={form.role}
            onChange={set("role")}
            placeholder="e.g. Senior Frontend Developer"
          />
          <ModalField
            label="Company"
            value={form.company}
            onChange={set("company")}
            placeholder="e.g. Acme Corp"
          />
          <ModalField
            label="Year / Period"
            value={form.year}
            onChange={set("year")}
            placeholder="e.g. 2022–Present"
          />
          <ModalField
            label="Description"
            value={form.desc}
            onChange={set("desc")}
            multiline
            placeholder="What did you accomplish?"
          />
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
   TIMELINE ITEM — single experience entry card
   ═════════════════════════════════════════════════════════════════════════ */

function TimelineItem({ exp, index, side, isEditMode, onRemove }) {
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
        {/* Edit mode: remove button */}
        {isEditMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Remove "${exp.role}" at ${exp.company}?`))
                onRemove();
            }}
            aria-label={`Remove ${exp.role}`}
            title="Remove experience"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 26,
              height: 26,
              borderRadius: "7px",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(13,13,20,0.8)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "#f43f5e",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              opacity: hovered ? 1 : 0.4,
              zIndex: 3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(244,63,94,0.12)";
              e.currentTarget.style.borderColor = "rgba(244,63,94,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(13,13,20,0.8)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            <TrashIcon />
          </button>
        )}

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
          <EditableText
            path={`experience.${index}.role`}
            as="h3"
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
          </EditableText>

          <EditableText
            path={`experience.${index}.year`}
            as="span"
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
          </EditableText>
        </div>

        {/* Company */}
        <EditableText
          path={`experience.${index}.company`}
          as="span"
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
        </EditableText>

        {/* Description */}
        <EditableText
          path={`experience.${index}.desc`}
          as="p"
          multiline
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.84rem",
            lineHeight: 1.72,
            color: "var(--text-muted)",
          }}
        >
          {exp.desc}
        </EditableText>

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
  const { data, isEditMode, updateField } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);
  const timelineRef = useRef(null);
  const lineRef = useRef(null);
  const actionsRef = useRef(null);

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
    { scope: sectionRef, dependencies: [data, isEditMode, isMobile] },
  );

  /* ── Add / Remove handlers ──────────────────────────────── */
  const handleAdd = useCallback(
    (entry) => {
      const next = { id: Date.now(), ...entry };
      updateField("experience", [...(data.experience || []), next]);
    },
    [data, updateField],
  );

  const handleRemove = useCallback(
    (i) => {
      updateField(
        "experience",
        data.experience.filter((_, idx) => idx !== i),
      );
    },
    [data, updateField],
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
            index={i}
            side={isMobile ? "right" : i % 2 === 0 ? "left" : "right"}
            isEditMode={isEditMode}
            onRemove={() => handleRemove(i)}
          />
        ))}
      </div>

      {/* ── Edit-mode: add button ──────────────────────────── */}
      {isEditMode && (
        <div
          ref={actionsRef}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            marginTop: "1rem",
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
            <PlusIcon /> Add Experience
          </button>
        </div>
      )}

      {/* ── Add modal ──────────────────────────────────────── */}
      {showAddModal && (
        <AddExperienceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

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
