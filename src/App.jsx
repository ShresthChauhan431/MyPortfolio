import { useState, useCallback } from "react";
import "./styles/cinema.css";

import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";
import Navbar from "./components/Navbar";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import SectionIndicator from "./components/SectionIndicator";
import LoadingScreen from "./components/LoadingScreen";
import { usePortfolio } from "./context/usePortfolio";

function App() {
  const { data } = usePortfolio();

  /* ── Loading screen state ─────────────────────────────────── */
  /*
   * `ready` starts false. When the LoadingScreen's exit animation
   * completes, it calls onComplete which flips `ready` to true.
   * This gates:
   *   - Navbar entrance animation
   *   - Hero entrance animation
   *   - ScrollProgress & SectionIndicator visibility
   */
  const [ready, setReady] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setReady(true);
  }, []);

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-deep)",
          color: "var(--text-dim)",
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <>
      {/* ── Loading screen (covers everything, self-removes) ── */}
      <LoadingScreen name={data.name} onComplete={handleLoadingComplete} />

      {/* ── Custom cursor (desktop only, respects reduced motion) ── */}
      <CustomCursor />

      {/* ── Scroll progress bar (top of viewport) ─────────── */}
      {ready && <ScrollProgress />}

      {/* ── Fixed navigation ──────────────────────────────── */}
      <Navbar ready={ready} />

      {/* ── Section number indicator (right side, desktop) ── */}
      {ready && <SectionIndicator />}

      <main>
        <Hero ready={ready} />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
    </>
  );
}

export default App;
