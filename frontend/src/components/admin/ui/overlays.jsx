import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, MoreHorizontal, X } from "../../ui/icons";
import { Button, cx } from "./primitives";

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

function useBodyLock(open) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

// Centered dialog on desktop, full-height sheet on phones.
export function Modal({ open, onClose, title, subtitle, icon: Icon, size = "lg", footer, children }) {
  useEscape(open, onClose);
  useBodyLock(open);
  const width = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" }[size];
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cx(
              "relative w-full bg-white shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden",
              width
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
              {Icon && (
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
              <Button variant="ghost" size="icon" icon={X} onClick={onClose} aria-label="Close" />
            </div>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/70">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Right-side detail panel; full screen on phones.
export function Drawer({ open, onClose, title, subtitle, actions, footer, children, width = "sm:w-[600px]" }) {
  useEscape(open, onClose);
  useBodyLock(open);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[900]">
          <motion.div
            className="absolute inset-0 bg-gray-950/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.aside
            className={cx("absolute right-0 top-0 h-full w-full bg-white shadow-2xl flex flex-col", width)}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900 truncate">{title}</h2>
                {subtitle && <div className="text-[13px] text-gray-500 mt-0.5">{subtitle}</div>}
              </div>
              {actions}
              <Button variant="ghost" size="icon" icon={X} onClick={onClose} aria-label="Close" />
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/70">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "Delete", tone = "danger", children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      icon={AlertTriangle}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant={tone === "danger" ? "dangerSolid" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      {children}
    </Modal>
  );
}

// Kebab/row menu rendered in a portal so it's never clipped by scroll containers.
export function Menu({ items, trigger, align = "end", disabled }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const place = () => {
      const r = btnRef.current.getBoundingClientRect();
      const menuH = menuRef.current?.offsetHeight || 260;
      const menuW = menuRef.current?.offsetWidth || 208;
      const below = r.bottom + 6 + menuH < window.innerHeight;
      const left = align === "end" ? Math.max(8, r.right - menuW) : Math.min(r.left, window.innerWidth - menuW - 8);
      setPos({ top: below ? r.bottom + 6 : Math.max(8, r.top - menuH - 6), left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = items.filter(Boolean).filter((i) => !i.hidden);

  return (
    <>
      <span
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setOpen((o) => !o);
        }}
        className="inline-flex"
      >
        {trigger || (
          <Button variant="ghost" size="iconSm" icon={MoreHorizontal} aria-label="Actions" disabled={disabled} />
        )}
      </span>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
            className="fixed z-[1100] min-w-[208px] py-1 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-900/10 animate-[menuIn_120ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {visible.map((item, i) =>
              item.divider ? (
                <div key={`d${i}`} className="my-1 h-px bg-gray-100" />
              ) : (
                <button
                  key={item.label}
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={cx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4 shrink-0 opacity-80" />}
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <span className="text-[11px] text-gray-400">{item.hint}</span>}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}
