import type { ReactNode } from "react";
export default function BrandModal({children, wide = false}: {children: ReactNode; wide?: boolean}) {
  return <div className="brand-overlay"><section role="dialog" aria-modal="true" className={`brand-panel ${wide ? "wide" : ""}`}>
    <div className="brand-wordmark">MOTO<span>POWER</span></div>{children}
  </section></div>;
}
