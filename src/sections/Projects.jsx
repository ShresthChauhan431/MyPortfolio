import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import EditableText from "../components/EditableText";
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

function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
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

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
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
   PROJECT EDIT MODAL — full-field editing via portal
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
        rows={multiline ? 4 : undefined}
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

function ProjectEditModal({ project, projectIndex, onClose, updateField }) {
  const [form, setForm] = useState({
    title: project.title ?? "",
    description: project.description ?? "",
    tags: (project.tags ?? []).join(", "),
    link: project.link ?? "",
    image: project.image ?? "",
  });

  const backdropRef = useRef(null);
  const panelRef = useRef(null);

  /* ── Animate in ──────────────────────────────────────────── */
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

  /* ── Animate out ─────────────────────────────────────────── */
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
    const base = `projects.${projectIndex}`;
    updateField(`${base}.title`, form.title);
    updateField(`${base}.description`, form.description);
    updateField(
      `${base}.tags`,
      form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    );
    updateField(`${base}.link`, form.link);
    updateField(`${base}.image`, form.image);
    animateOut(onClose);
  }, [form, projectIndex, updateField, animateOut, onClose]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  /* ── Keyboard ────────────────────────────────────────────── */
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
        aria-label="Edit project"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 10002,
          width: "min(500px, calc(100vw - 32px))",
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
            Edit Project
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
            label="Title"
            value={form.title}
            onChange={set("title")}
          />
          <ModalField
            label="Description"
            value={form.description}
            onChange={set("description")}
            multiline
          />
          <ModalField
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={set("tags")}
            placeholder="React, Node.js, GSAP"
          />
          <ModalField
            label="Link URL"
            value={form.link}
            onChange={set("link")}
            placeholder="https://..."
          />
          <ModalField
            label="Image URL"
            value={form.image}
            onChange={set("image")}
            placeholder="https://... (blank for gradient)"
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
            Save Changes
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   PROJECT CARD — dark glass card with cinematic hover
   ═════════════════════════════════════════════════════════════════════════ */

function ProjectCard({ project, index, isEditMode, onEdit, onRemove }) {
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
      {/* ── Edit-mode overlay buttons ─────────────────────── */}
      {isEditMode && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 5,
            display: "flex",
            gap: "0.4rem",
            opacity: hovered ? 1 : 0.45,
            transition: "opacity 0.25s ease",
          }}
        >
          <CardActionBtn
            color="var(--accent)"
            hoverBg="rgba(200,169,110,0.14)"
            onClick={onEdit}
            label="Edit"
          >
            <PencilIcon />
          </CardActionBtn>
          <CardActionBtn
            color="#f43f5e"
            hoverBg="rgba(244,63,94,0.12)"
            onClick={() => {
              if (window.confirm(`Remove "${project.title}"?`)) onRemove();
            }}
            label="Remove"
          >
            <TrashIcon />
          </CardActionBtn>
        </div>
      )}

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
        <EditableText
          path={`projects.${index}.title`}
          as="h3"
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
        </EditableText>

        {/* Description */}
        <EditableText
          path={`projects.${index}.description`}
          as="p"
          multiline
          style={{
            fontSize: "0.84rem",
            color: "var(--text-muted)",
            lineHeight: 1.72,
            flex: 1,
          }}
        >
          {project.description}
        </EditableText>

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
            onClick={(e) => e.stopPropagation()}
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

/* Small reusable button for card edit/remove actions */
function CardActionBtn({ color, hoverBg, onClick, label, children }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      style={{
        width: 30,
        height: 30,
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(13,13,20,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.borderColor = `${color}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(13,13,20,0.85)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {children}
    </button>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   MAIN PROJECTS SECTION
   ═════════════════════════════════════════════════════════════════════════ */

function Projects() {
  const { data, isEditMode, updateField } = usePortfolio();
  const [editingIdx, setEditingIdx] = useState(null);
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

  const actionsRef = useRef(null);

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
    { scope: sectionRef, dependencies: [data, isHorizontal, isEditMode] },
  );

  /* ── Add / Remove handlers ──────────────────────────────── */
  const handleAdd = useCallback(() => {
    const next = {
      id: Date.now(),
      title: "New Project",
      description: "Describe what you built and the impact it had.",
      tags: ["React"],
      link: "",
      image: "",
    };
    updateField("projects", [...(data.projects || []), next]);
  }, [data, updateField]);

  const handleRemove = useCallback(
    (i) => {
      updateField(
        "projects",
        data.projects.filter((_, idx) => idx !== i),
      );
    },
    [data, updateField],
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
      <ProjectCard
        project={p}
        index={i}
        isEditMode={isEditMode}
        onEdit={() => setEditingIdx(i)}
        onRemove={() => handleRemove(i)}
      />
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

      {/* ── Edit-mode: add / actions ───────────────────────── */}
      {isEditMode && (
        <div
          ref={actionsRef}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            marginTop: "2.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleAdd}
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
            <PlusIcon /> Add Project
          </button>
        </div>
      )}

      {/* ── Edit modal (portalled) ─────────────────────────── */}
      {editingIdx !== null && projects[editingIdx] && (
        <ProjectEditModal
          project={projects[editingIdx]}
          projectIndex={editingIdx}
          onClose={() => setEditingIdx(null)}
          updateField={updateField}
        />
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
