import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `List ${id} - Family Gifting Dashboard`,
  };
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>List Details</h1>
        <p style={{ color: '#666' }}>List ID: {id}</p>
        {/* TODO: Implement list detail view */}
      </div>
    </div>
  );
}
