import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Family Gifting Dashboard',
};

export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Register</h1>
        <p style={{ color: '#666' }}>Create a new account</p>
        {/* TODO: Implement registration form */}
      </div>
    </div>
  );
}
