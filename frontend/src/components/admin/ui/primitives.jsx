import React, { forwardRef } from "react";
import { Loader2 } from "../../ui/icons";

export const cx = (...c) => c.filter(Boolean).join(" ");

// ---------- Button ----------
const VARIANTS = {
  primary: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20 disabled:bg-red-300",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-xs disabled:text-gray-400",
  ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-300",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 disabled:text-red-300",
  dangerSolid: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  dark: "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400",
};
const SIZES = {
  xs: "h-7 px-2 text-xs gap-1 rounded-md",
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg",
  icon: "h-8 w-8 justify-center rounded-lg",
  iconSm: "h-7 w-7 justify-center rounded-md",
};

export const Button = forwardRef(function Button(
  { variant = "secondary", size = "sm", icon: Icon, loading, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cx(
        "inline-flex items-center font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed select-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4 shrink-0" /> : null}
      {children}
    </button>
  );
});

// ---------- Status pill ----------
const TONES = {
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  dark: "bg-gray-900 text-white ring-gray-900",
};
const DOTS = {
  gray: "bg-gray-400", green: "bg-emerald-500", blue: "bg-sky-500", amber: "bg-amber-500",
  red: "bg-red-500", violet: "bg-violet-500", dark: "bg-white",
};

export function Pill({ tone = "gray", dot = true, children, className }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md text-[11.5px] font-medium ring-1 ring-inset whitespace-nowrap",
        TONES[tone],
        className
      )}
    >
      {dot && <span className={cx("w-1.5 h-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  );
}

export const VEHICLE_STATES = {
  pending: { label: "Pending review", tone: "amber" },
  digital: { label: "Digitally verified", tone: "blue" },
  physical: { label: "Physically verified", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};

export const VehicleStatus = ({ state }) => {
  const s = VEHICLE_STATES[state] || { label: state || "Unknown", tone: "gray" };
  return <Pill tone={s.tone}>{s.label}</Pill>;
};

// ---------- Form fields ----------
export const inputClass =
  "w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-red-400 focus:ring-3 focus:ring-red-500/10 disabled:bg-gray-50 disabled:text-gray-500";

export function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="block text-[12.5px] font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="block mt-1 text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="block mt-1 text-xs text-gray-500">{hint}</span>
      ) : null}
    </label>
  );
}

export const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return <input ref={ref} className={cx(inputClass, invalid && "border-red-400", className)} {...props} />;
});

export function Select({ className, invalid, children, ...props }) {
  return (
    <select
      className={cx(
        inputClass,
        "pr-8 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.6rem_center]",
        invalid && "border-red-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return <textarea className={cx(inputClass, "h-auto py-2 min-h-[88px] resize-y", className)} {...props} />;
}

export function Checkbox({ checked, indeterminate, onChange, disabled, label, className }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      className={cx(
        "w-4 h-4 rounded border-gray-300 text-red-600 accent-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      checked={!!checked}
      ref={(el) => el && (el.indeterminate = !!indeterminate && !checked)}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      disabled={disabled}
    />
  );
}

export function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      className={cx(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-emerald-500" : "bg-gray-300"
      )}
    >
      <span
        className={cx(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ---------- Layout bits ----------
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-7 font-semibold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div className={cx("bg-white border border-gray-200/80 rounded-xl shadow-xs", className)} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "gray", sub, loading, onClick }) {
  const iconTone = {
    gray: "bg-gray-100 text-gray-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
  }[tone];
  return (
    <Card
      className={cx("p-4 flex items-start gap-3", onClick && "cursor-pointer hover:border-gray-300 transition-colors")}
      onClick={onClick}
    >
      {Icon && (
        <div className={cx("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconTone)}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[12.5px] text-gray-500 font-medium">{label}</div>
        {loading ? (
          <div className="h-7 mt-0.5 flex items-center"><Skeleton className="h-6 w-14" /></div>
        ) : (
          <div className="text-[22px] leading-7 font-semibold text-gray-900 tabular-nums mt-0.5">{value}</div>
        )}
        {/* Reserve the sub-line while it loads so the card never grows when data lands */}
        {sub ? <div className="text-xs text-gray-500 mt-0.5">{sub}</div> : sub === null || loading ? <div className="h-4 mt-0.5 flex items-center"><Skeleton className="h-3 w-24" /></div> : null}
      </div>
    </Card>
  );
}

// Segmented status tabs with counts, horizontally scrollable on mobile.
export function Tabs({ tabs, value, onChange, onHover }) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1 border-b border-gray-200">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            onMouseEnter={() => !active && onHover?.(t.value)}
            onFocus={() => !active && onHover?.(t.value)}
            className={cx(
              "relative flex items-center gap-1.5 px-3 h-10 text-[13px] font-medium whitespace-nowrap transition-colors",
              active ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cx(
                  "min-w-[20px] h-5 px-1.5 rounded-md text-[11px] font-semibold tabular-nums flex items-center justify-center",
                  active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                )}
              >
                {t.count}
              </span>
            )}
            {active && <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-red-600" />}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      {description && <div className="text-sm text-gray-500 mt-1 max-w-sm">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Same bone as the public site: one grey, one calm pulse.
export const Skeleton = ({ className, style }) => <div aria-hidden="true" style={style} className={cx("bone", /rounded/.test(className || "") ? "" : "rounded", className)} />;

export function Avatar({ name = "?", src, size = 28 }) {
  const initials = String(name)
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";
  const hue = [...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return src ? (
    <img src={src} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
  ) : (
    <span
      className="rounded-full shrink-0 inline-flex items-center justify-center font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 45% 52%)` }}
    >
      {initials}
    </span>
  );
}

// Vehicle thumbnail with graceful fallback (no broken-image icons).
export function Thumb({ src, alt = "", className }) {
  const [failed, setFailed] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  if (!src || failed) {
    return (
      <div className={cx("bg-gray-100 flex items-center justify-center text-gray-400 shrink-0", className)}>
        <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 17h14M6 13l1.5-4.5A2 2 0 0 1 9.4 7h5.2a2 2 0 0 1 1.9 1.5L18 13M5 13h14v4H5z" />
          <circle cx="8" cy="17" r="1.5" />
          <circle cx="16" cy="17" r="1.5" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cx("object-cover shrink-0 transition-opacity duration-300", loaded ? "opacity-100 bg-gray-100" : "bone opacity-80", className)}
    />
  );
}
