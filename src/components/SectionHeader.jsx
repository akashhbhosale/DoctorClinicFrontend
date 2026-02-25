export default function SectionHeader({
  title,
  subtitle,
  variant = "default",
  align = "center", // NEW PROP
}) {
  const isCompact = variant === "compact";

  const alignmentClass =
    align === "left" ? "text-left" : "text-center";

  return (
    <div
      className={`
        ${isCompact ? "rounded-lg px-4 py-3" : "rounded-xl px-6 py-5"}
        border border-slate-200
        bg-gradient-to-r from-blue-50 via-white to-blue-50
        ${isCompact ? "shadow-none" : "shadow-sm"}
      `}
    >
      <h2
        className={`
          ${isCompact ? "text-base" : "text-xl"}
          font-bold text-slate-800 tracking-wide
          ${alignmentClass}
        `}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`
            text-sm text-slate-500 mt-2
            ${alignmentClass}
            ${!isCompact && "max-w-2xl mx-auto"}
          `}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}