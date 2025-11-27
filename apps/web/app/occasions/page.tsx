import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Occasions - Family Gifting Dashboard',
};

export default function OccasionsPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Occasions</h1>
        <p style={{ color: '#666' }}>Manage gift-giving occasions</p>
        {/* TODO: Implement occasions overview */}
      </div>
    </div>
  );
}
