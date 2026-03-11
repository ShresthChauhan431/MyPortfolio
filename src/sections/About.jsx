import { useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import EditableText from "../components/EditableText";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

/* ── SVG icons for social links ─────────────────────────────── */

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/* ── Initials extractor ─────────────────────────────────────── */

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ── About Section ──────────────────────────────────────────── */

function About() {
  const { data } = usePortfolio();

  const sectionRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  const initials = useMemo(() => getInitials(data?.name), [data?.name]);

  /* ── GSAP scroll-triggered entrance ──────────────────────── */
  useGSAP(
    () => {
      if (!sectionRef.current || !data) return;

      /* Set initial states imperatively */
      gsap.set(leftColRef.current, { x: -80, opacity: 0 });
      gsap.set(rightColRef.current, { x: 80, opacity: 0 });

      /* Left column slides in from left */
      gsap.to(leftColRef.current, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      /* Right column slides in from right with a slight delay */
      gsap.to(rightColRef.current, {
        x: 0,
        opacity: 1,
        duration: 1,
        delay: 0.15,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [data] },
  );

  if (!data) return null;

  return (
    <section
      ref={sectionRef}
      id="about"
      className="section"
      style={{ overflow: "hidden" }}
    >
      <div className="about__grid">
        {/* ─────────────── LEFT COLUMN (60%) ─────────────── */}
        <div ref={leftColRef} className="about__left">
          {/* Decorative large "About" watermark */}
          <span aria-hidden="true" className="about__watermark">
            About
          </span>

          {/* Section label */}
          <span className="section__label">About</span>

          {/* Bio */}
          <EditableText path="about" as="p" multiline className="about__bio">
            {data.about}
          </EditableText>

          {/* Social links */}
          <nav className="about__links" aria-label="Social links">
            {data.social.github && (
              <AboutSocialLink
                path="social.github"
                href={data.social.github}
                icon={<GitHubIcon />}
                label="GitHub"
              />
            )}
            {data.social.linkedin && (
              <AboutSocialLink
                path="social.linkedin"
                href={data.social.linkedin}
                icon={<LinkedInIcon />}
                label="LinkedIn"
              />
            )}
            {data.social.email && (
              <AboutSocialLink
                path="social.email"
                href={`mailto:${data.social.email}`}
                icon={<EmailIcon />}
                label={data.social.email}
              />
            )}
          </nav>
        </div>

        {/* ─────────────── RIGHT COLUMN (40%) ─────────────── */}
        <div ref={rightColRef} className="about__right">
          <div className="about__avatar-wrapper">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt={data.name}
                className="about__avatar-img"
              />
            ) : (
              /* Initials fallback */
              <div className="about__avatar-fallback">
                <span className="about__initials">{initials}</span>
              </div>
            )}

            {/* Decorative corner accents */}
            <span
              aria-hidden="true"
              className="about__corner about__corner--tl"
            />
            <span
              aria-hidden="true"
              className="about__corner about__corner--br"
            />
          </div>
        </div>
      </div>

      {/* ── Scoped styles ────────────────────────────────────── */}
      <style>{`
        /* ── Grid layout ───────────────────────────────────── */
        .about__grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: clamp(2.5rem, 6vw, 5rem);
          align-items: center;
          max-width: 1100px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .about__grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          /* On mobile, put avatar on top */
          .about__right {
            order: -1;
            justify-self: center;
          }
        }

        /* ── Left column ───────────────────────────────────── */
        .about__left {
          position: relative;
          will-change: transform, opacity;
        }

        /* Decorative watermark */
        .about__watermark {
          position: absolute;
          top: -0.35em;
          left: -0.05em;
          font-family: var(--font-display);
          font-size: clamp(5rem, 12vw, 10rem);
          font-weight: 300;
          line-height: 1;
          color: var(--text-primary);
          opacity: 0.03;
          pointer-events: none;
          user-select: none;
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        /* Bio paragraph */
        .about__bio {
          font-family: var(--font-body);
          font-size: clamp(0.95rem, 1.2vw, 1.125rem);
          line-height: 1.85;
          color: var(--text-muted);
          max-width: 540px;
          position: relative;
          z-index: 1;
        }

        /* ── Social links ──────────────────────────────────── */
        .about__links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 2.5rem;
          position: relative;
          z-index: 1;
        }

        .about__social-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.3s ease;
          position: relative;
          width: fit-content;
        }

        .about__social-link::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: calc(18px + 0.75rem);
          right: 0;
          height: 1px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about__social-link:hover {
          color: var(--accent);
        }

        .about__social-link:hover::after {
          transform: scaleX(1);
        }

        .about__social-icon {
          flex-shrink: 0;
          color: var(--accent);
          opacity: 0.55;
          transition: opacity 0.3s ease;
        }

        .about__social-link:hover .about__social-icon {
          opacity: 1;
        }

        /* ── Right column / avatar ─────────────────────────── */
        .about__right {
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform, opacity;
        }

        .about__avatar-wrapper {
          position: relative;
          width: clamp(200px, 22vw, 320px);
          height: clamp(200px, 22vw, 320px);
        }

        @media (max-width: 768px) {
          .about__avatar-wrapper {
            width: clamp(160px, 45vw, 240px);
            height: clamp(160px, 45vw, 240px);
          }
        }

        .about__avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 14px;
          display: block;
          filter: grayscale(15%) contrast(1.05);
          transition: filter 0.5s ease;
        }

        .about__avatar-wrapper:hover .about__avatar-img {
          filter: grayscale(0%) contrast(1);
        }

        /* Initials fallback */
        .about__avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-mid);
          border: 1px solid var(--border-subtle);
          position: relative;
          overflow: hidden;
        }

        /* Subtle radial glow inside the fallback */
        .about__avatar-fallback::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 30% 30%,
            var(--accent-glow) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        .about__initials {
          font-family: var(--font-display);
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 300;
          letter-spacing: 0.08em;
          color: var(--accent);
          opacity: 0.35;
          position: relative;
          z-index: 1;
          user-select: none;
        }

        /* Decorative corner brackets */
        .about__corner {
          position: absolute;
          width: 28px;
          height: 28px;
          pointer-events: none;
        }

        .about__corner--tl {
          top: -8px;
          left: -8px;
          border-top: 1px solid var(--accent);
          border-left: 1px solid var(--accent);
          opacity: 0.3;
        }

        .about__corner--br {
          bottom: -8px;
          right: -8px;
          border-bottom: 1px solid var(--accent);
          border-right: 1px solid var(--accent);
          opacity: 0.3;
        }
      `}</style>
    </section>
  );
}

/* ── Social link sub-component ──────────────────────────────── */

function AboutSocialLink({ path, href, icon, label }) {
  const isMail = href.startsWith("mailto:");

  return (
    <EditableText
      path={path}
      as="span"
      style={{ display: "inline-flex", width: "fit-content" }}
    >
      <a
        href={href}
        target={isMail ? undefined : "_blank"}
        rel={isMail ? undefined : "noreferrer"}
        className="about__social-link"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="about__social-icon">{icon}</span>
        <span>{label}</span>
      </a>
    </EditableText>
  );
}

export default About;
