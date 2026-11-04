export default function Button({
  children,
  variant = "primary", 
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200";

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-400 to-pink-500 text-white px-5 py-2 hover:shadow-[0_8px_30px_rgba(192,132,252,0.4)] hover:-translate-y-[1px]",
    
    outline:
      "border border-white/20 text-white/70 px-5 py-2 hover:border-purple-400 hover:text-purple-400",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}