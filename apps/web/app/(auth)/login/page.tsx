import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Family Gifting Dashboard',
};

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Login</h1>
        <p style={{ color: '#666' }}>Sign in to your account</p>
        {/* TODO: Implement login form */}
      </div>
    </div>
  );
}
