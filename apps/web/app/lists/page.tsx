import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lists - Family Gifting Dashboard',
};

export default function ListsPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Gift Lists</h1>
        <p style={{ color: '#666' }}>Manage your gift lists</p>
        {/* TODO: Implement lists overview */}
      </div>
    </div>
  );
}
