import { useCallback } from "react";
import { usePortfolio } from "../context/usePortfolio";

/**
 * EditPanel
 *
 * Two pieces:
 *  1. A fixed floating action button (bottom-right) — pencil icon that toggles edit mode.
 *  2. A floating glass-morphism toolbar (top-center) that appears only when edit mode is ON,
 *     with an "Edit Mode ON" label, "Save to JSON" download button, and "Reset" button.
 *
 * "Save to JSON" serialises the current context data as a portfolio.json blob and triggers
 * a browser download so the user can replace src/data/portfolio.json with the updated copy.
 */

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
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

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function EditPanel() {
  const { data, isEditMode, toggleEditMode, resetData } = usePortfolio();

  /**
   * Serialise the current portfolio data as pretty-printed JSON,
   * create an Object URL, and trigger a download with the filename
   * "portfolio.json" so the user can drop it into src/data/.
   */
  const handleSaveToJson = useCallback(() => {
    if (!data) return;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "portfolio.json";
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [data]);

  const handleReset = useCallback(() => {
    const confirmed = window.confirm(
      "Reset all edits back to the original portfolio.json? This cannot be undone.",
    );
    if (confirmed) {
      resetData();
    }
  }, [resetData]);

  return (
    <>
      {/* ───────── Floating Toolbar (top-center, edit mode only) ───────── */}
      <div
        className={`edit-toolbar ${isEditMode ? "edit-toolbar--visible" : ""}`}
        aria-hidden={!isEditMode}
      >
        {/* Pulsing status dot + label */}
        <div className="edit-toolbar__status">
          <span className="edit-toolbar__dot" />
          <span className="edit-toolbar__label">Edit Mode</span>
        </div>

        {/* Divider */}
        <div className="edit-toolbar__divider" />

        {/* Save to JSON */}
        <button
          className="edit-toolbar__btn"
          onClick={handleSaveToJson}
          title="Download updated portfolio.json"
        >
          <DownloadIcon />
          <span>Save to JSON</span>
        </button>

        {/* Reset */}
        <button
          className="edit-toolbar__btn edit-toolbar__btn--danger"
          onClick={handleReset}
          title="Reset all changes"
        >
          <ResetIcon />
          <span>Reset</span>
        </button>
      </div>

      {/* ───────── Floating Action Button (bottom-right, always visible) ───────── */}
      <button
        className={`edit-fab ${isEditMode ? "edit-fab--active" : ""}`}
        onClick={toggleEditMode}
        aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
        title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
      >
        <span className={`edit-fab__icon ${isEditMode ? "edit-fab__icon--close" : ""}`}>
          {isEditMode ? <CloseIcon /> : <PencilIcon />}
        </span>
      </button>
    </>
  );
}

export default EditPanel;
