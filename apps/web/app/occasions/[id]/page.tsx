import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Occasion ${id} - Family Gifting Dashboard`,
  };
}

export default async function OccasionDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Occasion Details</h1>
        <p style={{ color: '#666' }}>Occasion ID: {id}</p>
        {/* TODO: Implement occasion detail view */}
      </div>
    </div>
  );
}
