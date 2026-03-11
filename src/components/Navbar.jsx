import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SECTIONS from "../data/sections.js";

gsap.registerPlugin(ScrollTrigger);

/* ── Navigation link data (imported from shared data file) ────────── */

const NAV_LINKS = SECTIONS;

/* ── Hamburger icon (3-line → X morph) ────────────────────────────────── */

function HamburgerIcon({ isOpen }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      <line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        style={{
          transition:
            "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease",
          transformOrigin: "center center",
          transform: isOpen
            ? "translateY(6px) rotate(45deg)"
            : "translateY(0) rotate(0)",
        }}
      />
      <line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        style={{
          transition: "opacity 0.2s ease",
          opacity: isOpen ? 0 : 1,
        }}
      />
      <line
        x1="3"
        y1="18"
        x2="21"
        y2="18"
        style={{
          transition:
            "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease",
          transformOrigin: "center center",
          transform: isOpen
            ? "translateY(-6px) rotate(-45deg)"
            : "translateY(0) rotate(0)",
        }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR — Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

function Navbar({ ready = true }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navRef = useRef(null);
  const overlayRef = useRef(null);
  const mobileLinksRef = useRef(null);
  const indicatorRef = useRef(null);

  /* ── Close mobile menu on resize to desktop ─────────────── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  /* ── Lock body scroll when mobile overlay is open ───────── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* ── Scroll detection for frosted glass effect ──────────── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── GSAP ScrollTrigger: active section tracking ────────── */
  useGSAP(
    () => {
      NAV_LINKS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top 40%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveSection(id);
            }
          },
        });
      });
    },
    { dependencies: [] },
  );

  /* ── GSAP: entrance animation for the navbar itself ─────── */
  useGSAP(
    () => {
      if (!navRef.current) return;

      /* Keep hidden until the loading screen signals ready */
      gsap.set(navRef.current, { y: -80, opacity: 0 });

      if (!ready) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReduced) {
        gsap.set(navRef.current, { y: 0, opacity: 1 });
        return;
      }

      gsap.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.15,
        ease: "expo.out",
      });
    },
    { dependencies: [ready] },
  );

  /* ── GSAP: mobile overlay open / close ──────────────────── */
  useEffect(() => {
    if (!overlayRef.current) return;

    if (mobileOpen) {
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });

      /* Stagger mobile links */
      const links =
        mobileLinksRef.current?.querySelectorAll(".nav-mobile-link");
      if (links?.length) {
        gsap.set(links, { opacity: 0, y: 40, rotateX: 8 });
        gsap.to(links, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: "expo.out",
          delay: 0.15,
        });
      }
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (overlayRef.current) {
            gsap.set(overlayRef.current, { display: "none" });
          }
        },
      });
    }
  }, [mobileOpen]);

  /* ── Active indicator position ──────────────────────────── */
  useEffect(() => {
    if (!indicatorRef.current || !navRef.current) return;
    const activeEl = navRef.current.querySelector(
      `[data-nav-id="${activeSection}"]`,
    );
    if (!activeEl) return;

    const navRect = navRef.current.getBoundingClientRect();
    const linkRect = activeEl.getBoundingClientRect();

    gsap.to(indicatorRef.current, {
      x: linkRect.left - navRect.left + linkRect.width / 2 - 6,
      opacity: 1,
      duration: 0.4,
      ease: "expo.out",
    });
  }, [activeSection]);

  /* ── Smooth scroll handler ──────────────────────────────── */
  const handleNavClick = useCallback(
    (e, id) => {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        /* Close mobile menu first so body scroll unlocks */
        if (mobileOpen) setMobileOpen(false);
        /* Small delay so body overflow is restored */
        setTimeout(
          () => {
            target.scrollIntoView({ behavior: "smooth" });
          },
          mobileOpen ? 350 : 0,
        );
      }
    },
    [mobileOpen],
  );

  return (
    <>
      {/* ───────── Desktop / Tablet Nav Bar ───────── */}
      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "0.75rem 4vw" : "1.25rem 4vw",
          background: scrolled ? "rgba(5, 5, 8, 0.75)" : "rgba(5, 5, 8, 0)",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.04)"
            : "1px solid transparent",
          transition:
            "padding 0.45s cubic-bezier(0.16,1,0.3,1), background 0.45s ease, backdrop-filter 0.45s ease, -webkit-backdrop-filter 0.45s ease, border-color 0.45s ease",
          willChange: "padding, background",
          opacity: 0,
        }}
      >
        {/* ── Logo / brand ─────────────────────────── */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "hero")}
          className="nav-hoverable"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.35rem",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            textDecoration: "none",
            transition: "color 0.3s ease",
            position: "relative",
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
          }}
        >
          Portfolio
          <span
            style={{
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            .
          </span>
        </a>

        {/* ── Desktop links ────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
            position: "relative",
          }}
          className="nav-desktop-links"
        >
          {NAV_LINKS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                data-nav-id={id}
                onClick={(e) => handleNavClick(e, id)}
                className="nav-hoverable"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  textDecoration: "none",
                  transition: "color 0.3s ease, font-weight 0.3s ease",
                  position: "relative",
                  paddingBottom: 6,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-muted)";
                  }
                }}
              >
                {label}
              </a>
            );
          })}

          {/* Active indicator dot */}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: -2,
              left: 0,
              width: 12,
              height: 2,
              borderRadius: 1,
              background:
                "linear-gradient(90deg, var(--accent), rgba(200,169,110,0.3))",
              opacity: 0,
              pointerEvents: "none",
              willChange: "transform",
            }}
          />
        </div>

        {/* ── Mobile hamburger button ──────────────── */}
        <button
          className="nav-hamburger nav-hoverable"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          style={{
            display: "none" /* shown via media query */,
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            background: "rgba(13, 13, 20, 0.4)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: "var(--text-primary)",
            cursor: "pointer",
            transition: "border-color 0.3s ease, background 0.3s ease",
            zIndex: 2,
          }}
        >
          <HamburgerIcon isOpen={mobileOpen} />
        </button>
      </nav>

      {/* ───────── Mobile Fullscreen Overlay ───────── */}
      <div
        ref={overlayRef}
        aria-hidden={!mobileOpen}
        style={{
          display: "none",
          opacity: 0,
          position: "fixed",
          inset: 0,
          zIndex: 9989,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(5, 5, 8, 0.96)",
          backdropFilter: "blur(30px) saturate(1.2)",
          WebkitBackdropFilter: "blur(30px) saturate(1.2)",
        }}
      >
        {/* Background decorative glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(600px, 90vw)",
            height: "min(600px, 90vw)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <nav
          ref={mobileLinksRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {NAV_LINKS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                className="nav-mobile-link nav-hoverable"
                onClick={(e) => handleNavClick(e, id)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 6vw, 3.5rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  color: isActive ? "var(--accent)" : "var(--text-primary)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  position: "relative",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
              >
                {label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60%",
                      height: 2,
                      borderRadius: 1,
                      background:
                        "linear-gradient(90deg, transparent, var(--accent), transparent)",
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Decorative label */}
        <p
          style={{
            position: "absolute",
            bottom: "clamp(2rem, 5vh, 4rem)",
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            fontWeight: 500,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
          }}
        >
          Navigation
        </p>
      </div>

      {/* ── Scoped responsive styles ─────────────── */}
      <style>{`
        /* Hide desktop links on mobile, show hamburger */
        @media (max-width: 768px) {
          .nav-desktop-links {
            display: none !important;
          }
          .nav-hamburger {
            display: flex !important;
          }
        }

        /* Navbar focus-visible for keyboard nav */
        nav a:focus-visible,
        .nav-hamburger:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
          border-radius: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          nav,
          nav a,
          .nav-mobile-link {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
