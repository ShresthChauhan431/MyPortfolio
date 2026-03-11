import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePortfolio } from "../context/usePortfolio";

/**
 * EditableText — wraps any text node and makes it inline-editable when edit mode is ON.
 *
 * Props:
 *   path       — dot-path into portfolio data, e.g. "name" or "skills.0.name"
 *   as         — wrapper element tag (default "span")
 *   className  — passthrough className for the wrapper
 *   style      — passthrough style for the wrapper
 *   multiline  — if true, renders a <textarea> instead of <input> in the popover
 *   children   — the rendered text (used as visual content; actual value comes from context)
 */

function getNestedValue(obj, path) {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

/* Thin wrapper components so the linter sees them as used React components,
   avoiding the "assigned but never used" error with the `as: Tag` pattern. */
const WRAPPER_MAP = {
  span: "span",
  p: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  div: "div",
  li: "li",
};

function EditableText({
  path,
  as = "span",
  className = "",
  style = {},
  multiline = false,
  children,
}) {
  const { data, isEditMode, updateField } = usePortfolio();

  // Track an internal "wants to edit" flag. Actual editing is only allowed
  // when edit mode is also on, derived below without setState-in-effect.
  const [wantsEdit, setWantsEdit] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  // Derive actual editing state: user clicked to edit AND edit mode is still on.
  // When edit mode is toggled off, isEditing becomes false automatically — no
  // setState inside an effect needed.
  const isEditing = wantsEdit && isEditMode;

  const currentValue = data ? getNestedValue(data, path) : "";
  const displayValue = currentValue ?? "";

  // Resolve the wrapper element string — fall back to "span" for unknown tags
  const Wrapper = useMemo(() => WRAPPER_MAP[as] || as, [as]);

  // Position the popover relative to the clicked element
  const openEditor = useCallback(() => {
    if (!isEditMode || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Place popover below the element, clamped to viewport
    let top = rect.bottom + scrollY + 6;
    let left = rect.left + scrollX;

    // Clamp left so popover doesn't overflow right edge
    const popoverWidth = 320;
    if (left + popoverWidth > window.innerWidth + scrollX - 16) {
      left = window.innerWidth + scrollX - popoverWidth - 16;
    }
    if (left < scrollX + 8) {
      left = scrollX + 8;
    }

    setPopoverPos({ top, left });
    setWantsEdit(true);
  }, [isEditMode]);

  // Focus the input when popover opens
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isEditing) return;

    function handleClickOutside(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setWantsEdit(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setWantsEdit(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEditing]);

  const handleChange = (e) => {
    updateField(path, e.target.value);
  };

  const closeEditor = useCallback(() => {
    setWantsEdit(false);
  }, []);

  // Build the edit-mode class names
  const editModeClasses = isEditMode
    ? "editable-text editable-text--active"
    : "";

  const editingClasses = isEditing ? "editable-text--editing" : "";

  return (
    <>
      <Wrapper
        ref={wrapperRef}
        className={`${className} ${editModeClasses} ${editingClasses}`.trim()}
        style={style}
        onClick={isEditMode ? openEditor : undefined}
        role={isEditMode ? "button" : undefined}
        tabIndex={isEditMode ? 0 : undefined}
        onKeyDown={
          isEditMode
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openEditor();
                }
              }
            : undefined
        }
      >
        {children !== undefined ? children : String(displayValue)}
      </Wrapper>

      {isEditing &&
        createPortal(
          <div
            ref={popoverRef}
            className="edit-popover"
            style={{
              position: "absolute",
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              zIndex: 9999,
            }}
          >
            <div className="edit-popover__header">
              <span className="edit-popover__path">{path}</span>
              <button
                className="edit-popover__close"
                onClick={closeEditor}
                aria-label="Close editor"
              >
                ✕
              </button>
            </div>
            {multiline ? (
              <textarea
                ref={inputRef}
                className="edit-popover__textarea"
                value={String(displayValue)}
                onChange={handleChange}
                rows={4}
              />
            ) : (
              <input
                ref={inputRef}
                className="edit-popover__input"
                type="text"
                value={String(displayValue)}
                onChange={handleChange}
              />
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export default EditableText;
