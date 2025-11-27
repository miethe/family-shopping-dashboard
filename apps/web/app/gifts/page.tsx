import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifts - Family Gifting Dashboard',
};

export default function GiftsPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Gifts</h1>
        <p style={{ color: '#666' }}>Browse and manage gift ideas</p>
        {/* TODO: Implement gift catalog */}
      </div>
    </div>
  );
}
