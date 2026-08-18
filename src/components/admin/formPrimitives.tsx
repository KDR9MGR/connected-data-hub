export const inp = "w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage";
export function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">{label}</label>
      {children}
    </div>
  );
}