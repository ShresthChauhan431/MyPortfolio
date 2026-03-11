import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePortfolio } from "../context/usePortfolio";

gsap.registerPlugin(ScrollTrigger);

/* ── SVG Icon Components ─────────────────────────────────────────────── */

function GitHubIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ── Social Icon Button ──────────────────────────────────────────────── */

function SocialIconButton({ href, label, children }) {
  const btnRef = useRef(null);

  const handleEnter = useCallback(() => {
    if (!btnRef.current) return;
    btnRef.current.style.borderColor = "var(--accent)";
    btnRef.current.style.color = "var(--accent)";
    btnRef.current.style.boxShadow =
      "0 0 20px rgba(200,169,110,0.2), 0 0 40px rgba(200,169,110,0.08)";
    btnRef.current.style.transform = "translateY(-2px)";
  }, []);

  const handleLeave = useCallback(() => {
    if (!btnRef.current) return;
    btnRef.current.style.borderColor = "var(--border-subtle)";
    btnRef.current.style.color = "var(--text-muted)";
    btnRef.current.style.boxShadow = "none";
    btnRef.current.style.transform = "translateY(0)";
  }, []);

  return (
    <a
      ref={btnRef}
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      aria-label={label}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "1px solid var(--border-subtle)",
        background: "rgba(13, 13, 20, 0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "var(--text-muted)",
        textDecoration: "none",
        cursor: "pointer",
        transition:
          "border-color 0.35s ease, color 0.35s ease, box-shadow 0.4s ease, transform 0.3s ease",
      }}
    >
      {children}
    </a>
  );
}

/* ── Contact Form ────────────────────────────────────────────────────── */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvoeqzpp";

function ContactForm({ formRef }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.message.trim()
      )
        return;

      setStatus("sending");

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setStatus("sent");
          setFormData({ name: "", email: "", message: "" });
          setTimeout(() => setStatus("idle"), 4000);
        } else {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 4000);
        }
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    },
    [formData],
  );

  const inputStyle = {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: 10,
    border: "1px solid var(--border-subtle)",
    background: "rgba(13, 13, 20, 0.6)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    outline: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    boxSizing: "border-box",
  };

  const handleInputFocus = useCallback((e) => {
    e.currentTarget.style.borderColor = "var(--accent)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200,169,110,0.08)";
  }, []);

  const handleInputBlur = useCallback((e) => {
    e.currentTarget.style.borderColor = "var(--border-subtle)";
    e.currentTarget.style.boxShadow = "none";
  }, []);

  const isSending = status === "sending";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        width: "100%",
        maxWidth: 520,
      }}
    >
      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isSending}
          style={inputStyle}
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contact-email"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isSending}
          style={inputStyle}
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="What's on your mind?"
          value={formData.message}
          onChange={handleChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isSending}
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: 120,
          }}
        />
      </div>

      {/* Submit + status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="submit"
          disabled={isSending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.875rem 2rem",
            borderRadius: 10,
            border: "1px solid var(--accent)",
            background: isSending ? "rgba(200,169,110,0.08)" : "transparent",
            color: "var(--accent)",
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: isSending ? "wait" : "pointer",
            transition:
              "background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
            opacity: isSending ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (isSending) return;
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "var(--bg-deep)";
            e.currentTarget.style.boxShadow =
              "0 0 20px rgba(200,169,110,0.3), 0 0 40px rgba(200,169,110,0.1)";
          }}
          onMouseLeave={(e) => {
            if (isSending) return;
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <SendIcon />
          {isSending ? "Sending…" : "Send Message"}
        </button>

        {status === "sent" && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              color: "#6ecf8e",
              letterSpacing: "0.02em",
            }}
          >
            Message sent!
          </span>
        )}
        {status === "error" && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              color: "#e07070",
              letterSpacing: "0.02em",
            }}
          >
            Something went wrong. Try again.
          </span>
        )}
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTACT SECTION — Main Component
   ═══════════════════════════════════════════════════════════════════════ */

function Contact() {
  const { data } = usePortfolio();

  /* ── Refs ─────────────────────────────────────────────────── */
  const sectionRef = useRef(null);
  const glowRef = useRef(null);
  const labelRef = useRef(null);
  const headingRef = useRef(null);
  const emailRef = useRef(null);
  const socialsRef = useRef(null);
  const dividerRef = useRef(null);
  const formRef = useRef(null);
  const footerRef = useRef(null);

  /* ── GSAP Scroll Animations ──────────────────────────────── */
  useGSAP(
    () => {
      if (!sectionRef.current || !data) return;

      /* ---- Glow: fade in ---- */
      if (glowRef.current) {
        gsap.set(glowRef.current, { scale: 0.7, opacity: 0 });
        gsap.to(glowRef.current, {
          scale: 1,
          opacity: 1,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* ---- Label ---- */
      if (labelRef.current) {
        gsap.set(labelRef.current, { opacity: 0, y: 30 });
        gsap.to(labelRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* ---- Heading: scale 0.9→1, opacity 0→1 ---- */
      if (headingRef.current) {
        gsap.set(headingRef.current, { scale: 0.9, opacity: 0, y: 20 });
        gsap.to(headingRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* ---- Email link: stagger in ---- */
      if (emailRef.current) {
        gsap.set(emailRef.current, { opacity: 0, y: 30 });
        gsap.to(emailRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* ---- Social icons: stagger ---- */
      if (socialsRef.current) {
        const icons = socialsRef.current.querySelectorAll(
          ".contact-social-btn",
        );
        if (icons.length) {
          gsap.set(icons, { opacity: 0, y: 24, scale: 0.85 });
          gsap.to(icons, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: socialsRef.current,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
        }
      }

      /* ---- Divider ---- */
      if (dividerRef.current) {
        gsap.set(dividerRef.current, { scaleX: 0 });
        gsap.to(dividerRef.current, {
          scaleX: 1,
          duration: 1,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: dividerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* ---- Form: stagger children ---- */
      if (formRef.current) {
        const fields = formRef.current.children;
        if (fields.length) {
          gsap.set(fields, { opacity: 0, y: 30 });
          gsap.to(fields, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: formRef.current,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
        }
      }

      /* ---- Footer ---- */
      if (footerRef.current) {
        gsap.set(footerRef.current, { opacity: 0, y: 16 });
        gsap.to(footerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "expo.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 96%",
            toggleActions: "play none none reverse",
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [data] },
  );

  /* ── Render guard ────────────────────────────────────────── */
  if (!data) return null;

  const currentYear = new Date().getFullYear();

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="section"
      style={{
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Radial gold glow ─────────────────────────────── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(800px, 100vw)",
          height: "min(800px, 100vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,169,110,0.07) 0%, rgba(200,169,110,0.02) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Content wrapper ──────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 720,
        }}
      >
        {/* Section label */}
        <p
          ref={labelRef}
          className="section__label"
          style={{ justifyContent: "center" }}
        >
          Contact
        </p>

        {/* Heading */}
        <div ref={headingRef}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}
          >
            Get in{" "}
            <span
              className="text-gold-gradient"
              style={{ fontStyle: "italic" }}
            >
              Touch
            </span>
          </h2>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.875rem, 1.4vw, 1.05rem)",
              color: "var(--text-muted)",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Have a project in mind or just want to say hello?
            <br />
            I'd love to hear from you.
          </p>
        </div>

        {/* Email large display */}
        <div
          ref={emailRef}
          style={{ marginTop: "2.5rem", marginBottom: "2rem" }}
        >
          <div style={{ display: "inline-block" }}>
            <a
              href={`mailto:${data.social.email}`}
              className="contact-email-link"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.2rem, 3vw, 2.2rem)",
                fontWeight: 400,
                color: "var(--text-primary)",
                textDecoration: "none",
                position: "relative",
                display: "inline-block",
                letterSpacing: "-0.01em",
                transition: "color 0.4s ease",
                paddingBottom: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                const underline =
                  e.currentTarget.querySelector(".email-underline");
                if (underline) underline.style.transform = "scaleX(1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                const underline =
                  e.currentTarget.querySelector(".email-underline");
                if (underline) underline.style.transform = "scaleX(0)";
              }}
            >
              {data.social.email}
              {/* Animated underline */}
              <span
                className="email-underline"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: 2,
                  background:
                    "linear-gradient(90deg, var(--accent), rgba(200,169,110,0.4))",
                  borderRadius: 1,
                  transform: "scaleX(0)",
                  transformOrigin: "left center",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </a>
          </div>
        </div>

        {/* Social icon buttons */}
        <div
          ref={socialsRef}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.25rem",
            marginBottom: "3.5rem",
          }}
        >
          {data.social.email && (
            <span className="contact-social-btn">
              <SocialIconButton
                href={`mailto:${data.social.email}`}
                label="Send email"
              >
                <MailIcon />
              </SocialIconButton>
            </span>
          )}
          {data.social.github && (
            <span className="contact-social-btn">
              <SocialIconButton
                href={data.social.github}
                label="GitHub profile"
              >
                <GitHubIcon />
              </SocialIconButton>
            </span>
          )}
          {data.social.linkedin && (
            <span className="contact-social-btn">
              <SocialIconButton
                href={data.social.linkedin}
                label="LinkedIn profile"
              >
                <LinkedInIcon />
              </SocialIconButton>
            </span>
          )}
        </div>

        {/* Divider */}
        <div
          ref={dividerRef}
          aria-hidden="true"
          style={{
            width: "100%",
            maxWidth: 520,
            height: 1,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.12) 30%, rgba(200,169,110,0.12) 70%, transparent 100%)",
            marginBottom: "3.5rem",
            transformOrigin: "center center",
          }}
        />

        {/* Contact form */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "2rem",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Or send a message
          </h3>
          <ContactForm formRef={formRef} />
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        ref={footerRef}
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "auto",
          paddingTop: "5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        {/* Thin top divider */}
        <div
          aria-hidden="true"
          style={{
            width: "min(200px, 40vw)",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(200,169,110,0.1), transparent)",
            marginBottom: "1.5rem",
          }}
        />

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--text-dim)",
            letterSpacing: "0.08em",
          }}
        >
          &copy; {currentYear}{" "}
          <span
            style={{
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {data.name}
          </span>
          . All rights reserved.
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            color: "var(--text-dim)",
            letterSpacing: "0.05em",
            opacity: 0.7,
          }}
        >
          Designed & built with React, GSAP & passion
        </p>
      </footer>

      {/* ── Scoped styles ────────────────────────────────── */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .contact-email-link,
          .contact-email-link .email-underline,
          .contact-social-btn a {
            transition: none !important;
          }
        }

        /* Placeholder styling for form inputs */
        #contact input::placeholder,
        #contact textarea::placeholder {
          color: var(--text-dim);
          opacity: 0.7;
        }

        /* Focus-visible for icon buttons */
        .contact-social-btn a:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
          border-radius: 50%;
        }

        /* Submit button focus */
        #contact button[type="submit"]:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }

        @media (max-width: 480px) {
          .contact-social-btn a {
            width: 48px !important;
            height: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Contact;
