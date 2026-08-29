import Image from "next/image";

export function VisitAkyLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <Image
        src="/brand/visit-aky-logo.png"
        alt="Visit AKY, Ashland, Kentucky"
        width={compact ? 140 : 240}
        height={compact ? 104 : 178}
        priority
      />
    </div>
  );
}
