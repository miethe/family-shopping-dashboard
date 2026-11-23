'use client';
/** The API exposes one shared space. Keep its identity honest until multi-household support exists. */
export function HouseholdSwitcher() {
  return <details className="household-switcher">
    <summary><span aria-hidden="true">🏡</span> Your family <span aria-hidden="true">⌄</span></summary>
    <div className="household-menu"><strong>Your family ✓</strong><p>One shared space for your favourite people.</p></div>
  </details>;
}
