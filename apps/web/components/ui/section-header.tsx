import type { ReactNode } from 'react';
export function SectionHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return <div className="section-head"><h2>{title}</h2>{action}</div>;
}
