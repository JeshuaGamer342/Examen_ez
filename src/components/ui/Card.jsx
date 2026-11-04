export default function Card({
  children,
  className = "",
  hover = true,
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-[rgba(18,10,35,0.6)]
        border border-[rgba(160,100,255,0.15)]
        backdrop-blur-md
        transition-all duration-300
        ${hover ? "hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(160,100,255,0.2)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}