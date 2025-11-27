import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Person ${id} - Family Gifting Dashboard`,
  };
}

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Person Details</h1>
        <p style={{ color: '#666' }}>Person ID: {id}</p>
        {/* TODO: Implement person profile view */}
      </div>
    </div>
  );
}
