/* ═══════════════════════════════════════════════════════════════════════════
   SECTIONS — Shared section metadata used by Navbar, SectionIndicator,
   ScrollProgress, and any other component that needs to know the ordered
   list of page sections.

   Kept in a plain JS file (not a component file) so react-refresh doesn't
   complain about mixed exports.
   ═══════════════════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export default SECTIONS;
