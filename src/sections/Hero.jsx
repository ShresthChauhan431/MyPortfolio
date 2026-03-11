import { useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import EditableText from "../components/EditableText";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

function Hero({ ready = true }) {
  const { data } = usePortfolio();

  /* ── Refs ─────────────────────────────────────────────────── */
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const lineRef = useRef(null);
  const nameRef = useRef(null);
  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const linksRef = useRef(null);
  const scrollCueRef = useRef(null);
  const glowRef = useRef(null);

  /* Split the name into words so we can stagger each one */
  const name = data?.name;
  const nameWords = useMemo(() => (name ? name.split(/\s+/) : []), [name]);

  /* ── GSAP Entrance Timeline + ScrollTrigger Parallax ─────── */
  useGSAP(
    () => {
      if (!sectionRef.current || !data) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      /* ---- initial states (set imperatively so .reveal CSS is overridden) ---- */
      const allContent = [
        lineRef.current,
        nameRef.current,
        titleRef.current,
        taglineRef.current,
        linksRef.current,
        scrollCueRef.current,
        glowRef.current,
      ].filter(Boolean);

      gsap.set(allContent, { clearProps: "all" });

      /* ── Reduced motion: show everything immediately, no animations ── */
      if (prefersReduced) {
        gsap.set(allContent, { opacity: 1 });
        gsap.set(lineRef.current, { scaleX: 1, opacity: 0.5 });
        const wordEls = nameRef.current?.querySelectorAll(".hero__word");
        if (wordEls?.length) {
          gsap.set(wordEls, { opacity: 1 });
        }
        return;
      }

      gsap.set(lineRef.current, { scaleX: 0, opacity: 1 });

      const wordEls = nameRef.current?.querySelectorAll(".hero__word");
      if (wordEls?.length) {
        gsap.set(wordEls, { y: 70, opacity: 0, rotateX: 8 });
      }

      gsap.set(titleRef.current, { y: 30, opacity: 0 });
      gsap.set(taglineRef.current, { y: 24, opacity: 0 });
      gsap.set(linksRef.current, { y: 18, opacity: 0 });
      gsap.set(scrollCueRef.current, { opacity: 0 });
      gsap.set(glowRef.current, { scale: 0.8, opacity: 0 });

      /* Don't play entrance timeline until loading screen signals ready */
      if (!ready) return;

      /* ---- entrance timeline ---- */
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        delay: 0.15,
      });

      /* 1 — glow breathes in softly behind everything */
      tl.to(
        glowRef.current,
        { scale: 1, opacity: 1, duration: 1.6, ease: "power2.out" },
        0,
      );

      /* 2 — horizontal line draws from center outward */
      tl.to(
        lineRef.current,
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power3.inOut",
        },
        0.1,
      );

      /* 3 — name words stagger up */
      if (wordEls?.length) {
        tl.to(
          wordEls,
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "expo.out",
          },
          0.5,
        );
      }

      /* 4 — title fades in */
      tl.to(
        titleRef.current,
        { y: 0, opacity: 1, duration: 0.7 },
        wordEls?.length ? 0.5 + wordEls.length * 0.1 + 0.15 : 0.9,
      );

      /* 5 — tagline fades in */
      tl.to(taglineRef.current, { y: 0, opacity: 1, duration: 0.6 }, ">-0.35");

      /* 6 — social links fade in */
      tl.to(linksRef.current, { y: 0, opacity: 1, duration: 0.5 }, ">-0.25");

      /* 7 — scroll cue fades in last */
      tl.to(
        scrollCueRef.current,
        { opacity: 1, duration: 0.8, ease: "power1.inOut" },
        ">-0.1",
      );

      /* ---- scroll-reactive parallax (desktop only for perf) ---- */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        gsap.to(contentRef.current, {
          y: -120,
          scale: 0.92,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        /* glow drifts up faster for depth illusion */
        gsap.to(glowRef.current, {
          y: -200,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      /* Mobile: lighter parallax */
      mm.add("(max-width: 768px)", () => {
        gsap.to(contentRef.current, {
          y: -40,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      /* scroll cue disappears quickly (all sizes) */
      gsap.to(scrollCueRef.current, {
        opacity: 0,
        y: 10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "15% top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [data, ready] },
  );

  /* ── Render ──────────────────────────────────────────────── */
  if (!data) return null;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="section"
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* ── Radial gold glow ─────────────────────────────── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(900px, 100vw)",
          height: "min(900px, 100vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,169,110,0.09) 0%, rgba(200,169,110,0.03) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Main content wrapper (parallax target) ───────── */}
      <div
        ref={contentRef}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          willChange: "transform, opacity",
        }}
      >
        {/* ── Small intro label ──────────────────────────── */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "2rem",
            opacity: 0.7,
          }}
        >
          Portfolio
        </p>

        {/* ── Horizontal line ────────────────────────────── */}
        <div
          ref={lineRef}
          aria-hidden="true"
          style={{
            width: "min(280px, 50vw)",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)",
            marginBottom: "2.5rem",
            transformOrigin: "center center",
            opacity: 0.5,
          }}
        />

        {/* ── Name (per-word stagger) ────────────────────── */}
        <div ref={nameRef} style={{ overflow: "hidden", padding: "0.1em 0" }}>
          <EditableText
            path="name"
            as="h1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.8rem, 8vw, 7.5rem)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "var(--text-primary)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 0.3em",
            }}
          >
            {nameWords.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="hero__word"
                style={{
                  display: "inline-block",
                  willChange: "transform, opacity",
                }}
              >
                {word}
              </span>
            ))}
          </EditableText>
        </div>

        {/* ── Title (italic gold gradient) ───────────────── */}
        <div ref={titleRef} style={{ marginTop: "0.75rem" }}>
          <EditableText
            path="title"
            as="p"
            className="text-gold-gradient"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "0.02em",
              lineHeight: 1.3,
            }}
          >
            {data.title}
          </EditableText>
        </div>

        {/* ── Tagline ────────────────────────────────────── */}
        <div ref={taglineRef} style={{ marginTop: "1.5rem" }}>
          <EditableText
            path="tagline"
            as="p"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.875rem, 1.4vw, 1.05rem)",
              fontWeight: 400,
              color: "var(--text-muted)",
              maxWidth: "500px",
              lineHeight: 1.75,
            }}
          >
            {data.tagline}
          </EditableText>
        </div>

        {/* ── Social links row ───────────────────────────── */}
        <div
          ref={linksRef}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2.25rem",
            marginTop: "2.5rem",
          }}
        >
          {data.social.github && (
            <SocialLink
              path="social.github"
              href={data.social.github}
              label="GitHub"
            />
          )}
          {data.social.linkedin && (
            <SocialLink
              path="social.linkedin"
              href={data.social.linkedin}
              label="LinkedIn"
            />
          )}
          {data.social.email && (
            <SocialLink
              path="social.email"
              href={`mailto:${data.social.email}`}
              label="Email"
            />
          )}
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────── */}
      <div
        ref={scrollCueRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "clamp(1.5rem, 4vh, 3.5rem)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6rem",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.5625rem",
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
          }}
        >
          Scroll
        </span>

        {/* Animated down-arrow chevron */}
        <svg
          width="14"
          height="24"
          viewBox="0 0 14 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.45 }}
          className="hero__scroll-arrow"
        >
          <path
            d="M7 0 L7 20 M1 15 L7 21 L13 15"
            stroke="var(--accent)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── Scoped keyframes & styles ────────────────────── */}
      <style>{`
        .hero__scroll-arrow {
          animation: hero-arrow-bob 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        @keyframes hero-arrow-bob {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(6px);
            opacity: 0.75;
          }
        }
      `}</style>
    </section>
  );
}

/* ── Tiny helper for repeated social link pattern ────────── */
function SocialLink({ path, href, label }) {
  return (
    <EditableText
      path={path}
      as="span"
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      <a
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
        onClick={(e) => e.stopPropagation()}
        style={{
          color: "var(--text-dim)",
          textDecoration: "none",
          transition: "color 0.3s ease",
          display: "inline-block",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-dim)";
        }}
      >
        {label}
      </a>
    </EditableText>
  );
}

export default Hero;
