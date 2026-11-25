export function CountdownDoor({ days }: { days: number }) {
  const remaining = Math.max(0, Math.floor(days));
  return <div className="countdown-door" aria-label={remaining === 0 ? 'Today' : `${remaining} sleeps to go`}>
    <strong>{remaining}</strong><small>{remaining === 0 ? 'today!' : 'sleeps to go'}</small>
  </div>;
}
