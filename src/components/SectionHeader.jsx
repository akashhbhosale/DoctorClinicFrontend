export default function SectionHeader({
    title,
    subtitle,
  }) {
    return (
      <div
        className="
          rounded-xl
          border border-slate-200
          bg-gradient-to-r from-blue-50 via-white to-blue-50
          px-6 py-5
          shadow-sm
        "
      >
        <h2 className="text-xl font-bold text-slate-800 tracking-wide text-center">
          {title}
        </h2>
  
        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 text-center max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    );
  }
  